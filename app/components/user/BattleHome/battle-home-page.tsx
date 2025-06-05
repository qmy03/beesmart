"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/AuthContext";
import { Button } from "../../button";
import apiService from "@/app/untils/api";
import Layout from "@/app/components/user/Home/layout";
import {
  Avatar,
  Box,
  Divider,
  LinearProgress,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import Image from "next/image";

interface OnlineUser {
  userId: string;
  username: string;
  wins?: number;
  losses?: number;
  role?: string;
  grade?: string;
}

interface Subject {
  subjectId: string;
  subjectName: string;
}

interface Grade {
  gradeId: string;
  gradeName: string;
}

interface UserInfo {
  username: string;
  role: string;
  grade: string;
  userId: string;
  wins?: number;
  losses?: number;
}

interface ApiResponse<T = any> {
  data?: T;
  status?: number;
  message?: string;
}

interface OnlineUsersResponse {
  data?: {
    users: OnlineUser[];
  };
}

interface SubjectsResponse {
  data?: {
    subjects: Subject[];
  };
}

interface GradesResponse {
  data?: {
    grades: Grade[];
  };
}

interface WebSocketMessage {
  type: string;
  battleId?: string;
  message?: string;
}

interface BattleInvitationRequest {
  inviteeId: string;
  gradeId: string;
  subjectId: string;
  topic: string;
}

export default function BattlePage() {
  const [usersOnline, setUsersOnline] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOpponent, setSelectedOpponent] = useState<any | null>(null);
  const accessToken = localStorage.getItem("accessToken");
  const { userInfo } = useAuth();
  console.log("User Info:", userInfo);
  console.log("Access Token:", accessToken);
  const router = useRouter();
  const [matching, setMatching] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [error, setError] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const fetchOnlineUsers = async () => {
      try {
        const response: ApiResponse<OnlineUsersResponse> = await apiService.get(
          "/battles/get-online-list",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        console.log("Online Users Response:", response);

        const users = response.data?.data?.users || [];

        // Filter out current user from the list
        const filteredUsers = users.filter(
          (user: any) => user.userId !== userInfo?.userId
        );

        setUsersOnline(filteredUsers);
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách người dùng online:", error);
      }
    };

    fetchOnlineUsers();
  }, [accessToken, userInfo?.userId]);

  useEffect(() => {
    if (!accessToken) return;

    const fetchData = async () => {
      try {
        const [subjectsRes, gradesRes] = await Promise.all([
          apiService.get<SubjectsResponse>("/subjects", {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          apiService.get<GradesResponse>("/grades", {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);

        const fetchedSubjects = subjectsRes.data?.data?.subjects || [];
        const fetchedGrades = gradesRes.data?.data?.grades || [];

        setSubjects(fetchedSubjects);
        console.log("Subjects:", fetchedSubjects);
        setGrades(fetchedGrades);

        if (fetchedSubjects.length > 0) {
          setSelectedSubject(fetchedSubjects[0].subjectId);
        }
        if (fetchedGrades.length > 0) {
          setSelectedGrade(fetchedGrades[0].gradeId);
        }
      } catch (err) {
        console.error("❌ Error fetching subjects/grades:", err);
        setError("Could not load subjects and grades. Please try again later.");
      }
    };

    fetchData();
  }, [accessToken]);

  useEffect(() => {
    if (matching) {
      intervalRef.current = setInterval(() => {
        setCountdown((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current as NodeJS.Timeout);
    }

    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, [matching]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const startMatching = () => {
    if (!accessToken || !userInfo?.userId) {
      setError("You must be logged in to join a battle.");
      return;
    }

    if (!selectedSubject || !selectedGrade) {
      setError("Please select both a subject and a grade.");
      return;
    }

    setError("");
    setMatching(true);
    setCountdown(0);

    const socket = new WebSocket(
      `ws://localhost:8080/ws/battle?userId=${userInfo.userId}&subjectId=${selectedSubject}&gradeId=${selectedGrade}&battle-token=${accessToken}`
    );

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("🔗 WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "START") {
          router.push(`/battle-detail/${msg.battleId}`);
        } else if (msg.type === "STATUS") {
          console.log("🟡 Status:", msg.message);
        }
      } catch (err) {
        console.error("💥 Failed to parse WebSocket message:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
      setError("Connection error. Please try again.");
      setMatching(false);
    };

    socket.onclose = () => {
      console.log("🔌 WebSocket disconnected");
      setMatching(false);
    };
  };

  const cancelMatching = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    setMatching(false);
    setCountdown(0);
  };

  const sendBattleInvitation = async (opponentId: string) => {
    if (!accessToken || !selectedSubject || !selectedGrade) {
      setError(
        "Please select both a subject and a grade before sending invitation."
      );
      return;
    }

    try {
      const invitationRequest = {
        inviteeId: opponentId,
        gradeId: selectedGrade,
        subjectId: selectedSubject,
        topic: "Battle Challenge", // You can customize this or make it dynamic
      };

      const response = await apiService.post<ApiResponse>(
        "/battle-invitations/send",
        invitationRequest,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data?.status === 200) {
        alert("Lời mời thách đấu đã được gửi thành công!");
        // Optionally reset selected opponent
        setSelectedOpponent(null);
      }
    } catch (error: any) {
      console.error("❌ Error sending battle invitation:", error);
      const errorMessage =
        error.response?.data?.message || "Không thể gửi lời mời thách đấu";
      setError(errorMessage);
    }
  };

  // Filter users based on search term
  const filteredUsers = usersOnline.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#EFF3E6",
          padding: "40px",
          height: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            bgcolor: "#FFFFFF",
            border: "1px solid #ccc",
            borderRadius: 4,
            flex: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: "32px",
              fontWeight: "600",
              textAlign: "center",
              paddingY: "8px",
              backgroundColor: "#90DD81",
              borderTopLeftRadius: "16px",
              borderTopRightRadius: "16px",
              // color: "#FFFFFF",
            }}
          >
            ĐẤU TRƯỜNG HỌC TẬP
          </Typography>
          <Divider />

          {/* Timer */}
          <Box sx={{ display: "flex", gap: 4, padding: 2, flex: 1 }}>
            {/* LEFT - User Info */}
            <Box
              sx={{
                flex: 1,
                backgroundColor: "#90DD81",
                borderRadius: 2,
                p: 2,
                textAlign: "center",
                maxHeight: 200,
                border: "1px solid #ccc",
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  margin: "auto",
                  mb: 1,
                  bgcolor: "#FFFBF3",
                  color: "#BB9066",
                  fontSize: 32,
                  border: "2px solid #BB9066",
                }}
              >
                {userInfo?.username?.[0].toUpperCase()}
              </Avatar>
              <Box sx={{ fontSize: 18, fontWeight: "bold" }}>
                {userInfo?.username || "Tên người dùng"}
              </Box>
            </Box>

            {/* CENTER - Battle Setup */}
            <Box
              sx={{
                flex: 2,
                borderRadius: 2,
                textAlign: "center",
                gap: 2,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {selectedOpponent ? (
                <>
                  <Box
                    sx={{
                      fontWeight: "bold",
                      fontSize: 18,
                      border: "3px solid #A7A5A5",
                      p: 4,
                      borderRadius: 4,
                      display: "flex",
                      gap: 2,
                      // alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#EAE8E8",
                      flex: 1,
                    }}
                  >
                    <Box sx={{ flex: 1, display: "flex" }}>
                      <Avatar
                        sx={{
                          width: 50,
                          height: 50,
                          bgcolor: "#FFFBF3",
                          color: "#BB9066",
                          fontSize: 32,
                          border: "2px solid #BB9066",
                        }}
                      >
                        {selectedOpponent.username[0].toUpperCase()}
                      </Avatar>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        flex: 5,
                        alignItems: "flex-start",
                      }}
                    >
                      <Typography fontSize={20} fontWeight={600}>
                        {selectedOpponent.username}
                      </Typography>
                      <Divider sx={{ width: "100%" }} />
                      <Button
                        onClick={() =>
                          sendBattleInvitation(selectedOpponent.userId)
                        }
                        sx={{ maxWidth: 100 }}
                      >
                        Thách đấu
                      </Button>
                    </Box>
                  </Box>
                </>
              ) : (
                <>
                  <Box
                    sx={{
                      fontWeight: "bold",
                      fontSize: 18,
                      border: "3px solid #A7A5A5",
                      p: 4,
                      borderRadius: 4,
                      bgcolor: "#EAE8E8",
                    }}
                  >
                    Bạn hãy chọn người đang tham dự đấu trường để thách đấu nhé
                  </Box>
                </>
              )}

              <TextField
                label="Chọn lớp học"
                select
                size="small"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                fullWidth
                InputProps={{
                  style: {
                    backgroundColor: "white",
                    color: "black",
                  },
                }}
                sx={{ width: "100%" }}
              >
                {grades.map((grade) => (
                  <MenuItem key={grade.gradeId} value={grade.gradeId}>
                    {grade.gradeName}
                  </MenuItem>
                ))}
              </TextField>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Typography sx={{ fontSize: "20px", fontWeight: 600 }}>
                  CHỌN MÔN HỌC ĐỂ THÁCH ĐẤU
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    width: "100%", // ✅
                  }}
                >
                  {subjects.map((subject) => (
                    <Box
                      key={subject.subjectId}
                      sx={{
                        flex: 1, // ✅
                        display: "flex",
                        justifyContent: "center", // Center nội dung trong box
                        alignItems: "center",
                        padding: "8px",
                        borderRadius: 5,
                        border:
                          selectedSubject === subject.subjectId
                            ? "2px solid #8CAE44"
                            : "1px solid #ccc",
                        backgroundColor:
                          selectedSubject === subject.subjectId
                            ? "#90DD81"
                            : "#FFFFFF",
                        cursor: "pointer",
                        textAlign: "center",
                        fontWeight:
                          selectedSubject === subject.subjectId
                            ? "bold"
                            : "normal",
                        "&:hover": {
                          backgroundColor:
                            selectedSubject === subject.subjectId
                              ? "#8CAE44"
                              : "#f0f0f0",
                        },
                      }}
                      onClick={() => setSelectedSubject(subject.subjectId)}
                    >
                      {subject.subjectName}
                    </Box>
                  ))}
                </Box>
              </Box>
              {/* Time */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Typography sx={{ fontSize: "20px", fontWeight: 600 }}>
                  THỜI GIAN THI ĐẤU
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexDirection: "column",
                    border: "2px solid #ccc",
                    borderRadius: 2,
                    paddingY: 2,
                    paddingX: 6,
                    backgroundColor: "#90DD81",
                  }}
                >
                  <Image
                    src="/icon_clock.png"
                    alt="Clock"
                    width={30}
                    height={30}
                  />
                  <Typography sx={{ fontSize: "20px", fontWeight: 600 }}>
                    10 PHÚT
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                bgcolor: "#FFFFFF",
                border: "1px solid #ccc",
                borderRadius: 4,
                flex: 1,
              }}
            >
              <Typography
                sx={{
                  fontWeight: "600",
                  textAlign: "center",
                  paddingY: "8px",
                  backgroundColor: "#90DD81",
                  borderTopLeftRadius: "16px",
                  borderTopRightRadius: "16px",
                }}
              >
                Danh sách học sinh
              </Typography>
              {filteredUsers.map((user, index) => (
                <Box
                  key={user.userId}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    cursor: "pointer",
                    p: 1.5,
                    borderBottom:
                      index !== filteredUsers.length - 1
                        ? "1px dashed #ccc"
                        : "none",
                    position: "relative",
                    ":hover": { backgroundColor: "#f0f0f0" },
                  }}
                  onClick={() => setSelectedOpponent(user)}
                >
                  <Box sx={{ position: "relative" }}>
                    <Avatar
                      sx={{
                        bgcolor: "#73BAFB",
                        color: "#FFFFFF",
                        fontWeight: 600
                      }}
                    >
                      {user.username[0].toUpperCase()}
                    </Avatar>
                    {/* Online dot */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 12,
                        height: 12,
                        bgcolor: "#4CAF50",
                        border: "2px solid white",
                        borderRadius: "50%",
                      }}
                    />
                  </Box>
                  <Typography fontWeight={600} >{user.username}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}
