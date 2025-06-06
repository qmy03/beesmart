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
  Tooltip,
  Typography,
} from "@mui/material";
import Image from "next/image";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FlagIcon from "@mui/icons-material/Flag";
import HistoryIcon from "@mui/icons-material/History";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
interface OnlineUser {
  userId: string;
  username: string;
  totalBattleWon: number;
  totalBattleLost: number;
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
interface BattleHistory {
  battleId: string;
  opponentUsername: string;
  gradeName: string;
  subjectName: string;
  topic: string;
  won: boolean;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  completedAt: string;
}

interface BattleUserDetail {
  battleUserId: string;
  userId: string;
  username: string;
  totalBattleWon: number;
  totalBattleLost: number;
  historyResponses: BattleHistory[];
}

interface BattleUserDetailResponse {
  data?: BattleUserDetail;
}
interface BattleInvitationRequest {
  inviteeId: string;
  gradeId: string;
  subjectId: string;
  topic: string;
}
interface OnlineUsersResponse {
  totalPages: number;
  totalElements: number;
  users: OnlineUser[];
}
export default function BattlePage() {
  const [usersOnline, setUsersOnline] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOpponent, setSelectedOpponent] = useState<any | null>(null);
  const [sendingInvitation, setSendingInvitation] = useState(false);
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
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [battleUserDetail, setBattleUserDetail] =
    useState<BattleUserDetail | null>(null);
  const [battleHistory, setBattleHistory] = useState<BattleHistory[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPage1, setCurrentPage1] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchOnlineUsers = async (page: number = 0, search: string = "") => {
    if (!accessToken) return;
    try {
      setLoadingUsers(true);
      const response: ApiResponse<OnlineUsersResponse> = await apiService.get(
        `/battles/get-online-list?page=${page}&size=10${search ? `&search=${encodeURIComponent(search)}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("Online Users Response:", response);

      // FIX: Sửa cách truy cập dữ liệu để phù hợp với cấu trúc API response
      const data = response.data?.data; // Thêm .data để truy cập đúng cấu trúc
      if (data && Array.isArray(data.users)) {
        const filteredUsers = data.users.filter(
          (user) => user.userId !== userInfo?.userId
        );
        setUsersOnline(
          (prev) => (page === 0 ? filteredUsers : [...prev, ...filteredUsers]) // Sửa page === 1 thành page === 0
        );
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      } else {
        console.warn("No users found in response:", data);
        setUsersOnline([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách người dùng online:", error);
      setError("Không thể tải danh sách người dùng online.");
      setUsersOnline([]);
    } finally {
      setLoadingUsers(false);
    }
  };
  useEffect(() => {
    fetchOnlineUsers(0, searchTerm);
  }, [accessToken, userInfo?.userId, searchTerm]);

  const loadMoreHistory = async () => {
    if (!hasMoreHistory || loadingHistory) return;

    const nextPage = currentPage1 + 1;
    setCurrentPage1(nextPage);

    try {
      setLoadingHistory(true);
      const response: ApiResponse<BattleUserDetailResponse> =
        await apiService.get(
          `/battles/user/battle-user-detail?page=${nextPage}&size=5`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      console.log("Battle User Detail Response:", response);
      if (response.data?.data) {
        const newHistory = response.data.data.historyResponses;
        setBattleHistory((prev) => [...prev, ...newHistory]);
        setHasMoreHistory(newHistory.length === 5);
      }
    } catch (error) {
      console.error("❌ Lỗi khi load more history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    const fetchBattleUserDetail = async () => {
      if (!accessToken) return;

      try {
        const response = await apiService.get(
          `/battles/user/battle-user-detail?page=0&size=5`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        console.log("Battle User Detail Response:", response);

        if (response.data?.data) {
          setBattleUserDetail(response.data.data);
          setBattleHistory(response.data.data.historyResponses || []);
          setHasMoreHistory(response.data.data.historyResponses?.length === 5);
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy battle user detail:", error);
      }
    };

    fetchBattleUserDetail();
  }, [accessToken]);
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
      setSendingInvitation(true);

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
        // setSelectedOpponent(null);
      }
    } catch (error: any) {
      console.error("❌ Error sending battle invitation:", error);
      const errorMessage =
        error.response?.data?.message || "Không thể gửi lời mời thách đấu";
      setError(errorMessage);
    } finally {
      setSendingInvitation(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = usersOnline.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "UTC",
    });
  };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 on search
    fetchOnlineUsers(0, e.target.value); // Gọi ngay lập tức với search term mới
  };
  const loadMoreUsers = () => {
    if (currentPage >= totalPages || loadingUsers) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchOnlineUsers(nextPage - 1, searchTerm); // Trừ 1 vì API dùng 0-based indexing
  };
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
                display: "flex",
                flexDirection: "column",
                gap: 2,
                borderRadius: 2,
                textAlign: "center",
                // maxHeight: 200,
              }}
            >
              <Box
                sx={{
                  backgroundColor: "#90DD81",
                  borderRadius: 2,
                  p: 2,
                  textAlign: "center",
                  // maxHeight: 200,
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
                    fontWeight: 600,
                  }}
                >
                  {userInfo?.username?.[0].toUpperCase()}
                </Avatar>
                <Box sx={{ fontSize: 18, fontWeight: "bold" }}>
                  {userInfo?.username || "Tên người dùng"}
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 2,
                  }}
                >
                  <Box
                    sx={{
                      textAlign: "center",
                      display: "flex",
                      gap: 1,
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <EmojiEventsIcon sx={{ fontSize: 30, color: "yellow" }} />
                      <Typography
                        sx={{
                          fontSize: 20,
                          fontWeight: "bold",
                          color: "yellow",
                        }}
                      >
                        {battleUserDetail?.totalBattleWon || 0}
                      </Typography>
                    </Box>

                    <Typography
                      sx={{ fontSize: 14, fontWeight: "bold", color: "#FFF" }}
                    >
                      Trận thắng
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      textAlign: "center",
                      display: "flex",
                      gap: 1,
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {" "}
                      <FlagIcon sx={{ fontSize: 30, color: "#FFF" }} />
                      <Typography
                        sx={{
                          fontSize: 20,
                          fontWeight: "bold",
                          color: "yellow",
                        }}
                      >
                        {battleUserDetail?.totalBattleLost || 0}
                      </Typography>
                    </Box>

                    <Typography
                      sx={{ fontSize: 14, fontWeight: "bold", color: "#FFF" }}
                    >
                      Trận thua
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Divider />
              <Box
                sx={{
                  backgroundColor: "#FFFFFF",
                  // border: "1px solid #ccc",
                  borderRadius: 2,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: "600",
                    textAlign: "center",
                    paddingY: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    fontSize: "20px",
                    color: "#90DD81",
                    borderBottom: "1px dashed #ccc",
                  }}
                >
                  TRẬN ĐẤU GẦN ĐÂY
                </Typography>
                <Box sx={{ flex: 1, overflow: "auto", maxHeight: 400 }}>
                  {battleHistory && battleHistory.length > 0 ? (
                    <>
                      {battleHistory.map((battle, index) => (
                        <Box
                          key={battle.battleId}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          <Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mt: 1,
                              }}
                            >
                              <HistoryIcon sx={{ fontSize: 16 }} />
                              <Typography
                                sx={{ fontWeight: "bold", fontSize: 12 }}
                              >
                                Trận đấu - {formatDate(battle.completedAt)}
                              </Typography>
                            </Box>

                            {/* Hover tooltip component */}
                            <Tooltip
                              title={
                                <Box>
                                  <Typography sx={{ fontSize: 12, mb: 0.5 }}>
                                    Đối thủ: {battle.opponentUsername}
                                  </Typography>
                                  <Typography sx={{ fontSize: 12, mb: 0.5 }}>
                                    Môn: {battle.subjectName} -{" "}
                                    {battle.gradeName}
                                  </Typography>
                                  <Typography sx={{ fontSize: 12 }}>
                                    Điểm: {battle.score} | Đúng:{" "}
                                    {battle.correctAnswers} | Sai:{" "}
                                    {battle.incorrectAnswers}
                                  </Typography>
                                </Box>
                              }
                              arrow
                              placement="top"
                            >
                              <Typography
                                sx={{
                                  fontSize: 12,
                                  color: "#999",
                                  fontStyle: "italic",
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                  "&:hover": {
                                    color: "#666",
                                  },
                                }}
                              >
                                Trận đấu đã kết thúc
                              </Typography>
                            </Tooltip>
                          </Box>
                          {index < battleHistory.length - 1 && (
                            <Divider sx={{ borderStyle: "dashed" }} />
                          )}
                        </Box>
                      ))}

                      {/* Load More Button */}
                      {hasMoreHistory && (
                        <Box sx={{ textAlign: "center", p: 2 }}>
                          <Button
                            variant="outlined"
                            onClick={loadMoreHistory}
                            disabled={loadingHistory}
                            sx={{
                              borderColor: "#90DD81",
                              color: "#90DD81",
                              "&:hover": {
                                backgroundColor: "#90DD81",
                                color: "white",
                              },
                            }}
                          >
                            {loadingHistory ? "Đang tải..." : "Xem thêm"}
                          </Button>
                        </Box>
                      )}
                    </>
                  ) : (
                    <Box sx={{ p: 2, textAlign: "center", color: "#666" }}>
                      <Typography>Chưa có trận đấu nào</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            {/* CENTER - Battle Setup */}
            <Box
              sx={{
                flex: 2,
                borderRadius: 2,
                textAlign: "center",
                gap: 3,
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
                          fontSize: 24,
                          border: "2px solid #BB9066",
                          fontWeight: 600,
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
                      <Typography fontSize={24} fontWeight={600}>
                        {selectedOpponent.username}
                      </Typography>
                      <Box
                        sx={{ display: "flex", gap: 3, alignItems: "center" }}
                      >
                        <Box
                          sx={{ display: "flex", gap: 1, alignItems: "center" }}
                        >
                          <EmojiEventsIcon sx={{ fontSize: 24 }} />
                          <Typography sx={{ fontSize: 16, fontWeight: "bold" }}>
                            {selectedOpponent.totalBattleWon}
                          </Typography>
                          <Typography sx={{ fontSize: 14 }}>
                            Trận thắng
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", gap: 1, alignItems: "center" }}
                        >
                          <FlagIcon sx={{ fontSize: 24 }} />
                          <Typography sx={{ fontSize: 16, fontWeight: "bold" }}>
                            {selectedOpponent.totalBattleLost}
                          </Typography>
                          <Typography sx={{ fontSize: 14 }}>
                            Trận thua
                          </Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ width: "100%" }} />
                      <Button
                        onClick={() =>
                          sendBattleInvitation(selectedOpponent.userId)
                        }
                        sx={{ maxWidth: 100 }}
                        disabled={sendingInvitation}
                      >
                        {sendingInvitation ? "Đang mời..." : "Thách đấu"}
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
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Typography sx={{ fontSize: "20px", fontWeight: 600 }}>
                  THÁCH ĐẤU NGẪU NHIÊN
                </Typography>
                <Typography
                  sx={{ fontSize: "14px", color: "#555", fontStyle: "italic" }}
                >
                  Bạn có thể bấm chọn nút thách đấu bên dưới để thách đấu ngẫu
                  nhiên
                </Typography>
                {!matching ? (
                  <Box>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={startMatching}
                    >
                      Thách đấu
                    </Button>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ width: "300px", textAlign: "center" }}>
                      <LinearProgress color="secondary" />
                    </Box>

                    <Button onClick={cancelMatching} variant="outlined">
                      Cancel
                    </Button>
                  </>
                )}
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
                maxHeight: 300,
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
              <TextField
                label="Tìm học sinh..."
                size="small"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearch}
                sx={{ backgroundColor: "white", margin: 1 }}
              />
              {usersOnline.slice(0, 10).map((user, index) => (
                <Box
                  key={user.userId}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    cursor: "pointer",
                    p: 1.5,
                    borderBottom:
                      index !== usersOnline.slice(0, 10).length - 1
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
                        fontWeight: 600,
                      }}
                    >
                      {user.username[0].toUpperCase()}
                    </Avatar>
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
                  <Typography fontWeight={600}>{user.username}</Typography>
                </Box>
              ))}
              {totalElements > 10 && currentPage < totalPages && (
                <Box sx={{ textAlign: "center", p: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={loadMoreUsers}
                    disabled={loadingUsers}
                    sx={{
                      borderColor: "#90DD81",
                      color: "#90DD81",
                      "&:hover": {
                        backgroundColor: "#90DD81",
                        color: "white",
                      },
                    }}
                  >
                    {loadingUsers ? "Đang tải..." : "Xem thêm"}
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}
