"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/AuthContext";
import { Button } from "../../button";
import apiService from "@/app/untils/api";
import Layout from "@/app/components/user/Home/layout";
import { Box, LinearProgress, MenuItem, TextField } from "@mui/material";
import Image from "next/image";

export default function BattlePage() {
  const [usersOnline, setUsersOnline] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOpponent, setSelectedOpponent] = useState<any | null>(null);

  const { accessToken, userInfo } = useAuth();
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
        const response = await apiService.get("/battles/get-online-list", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const users = response.data?.data?.users || [];

        // ✅ Lọc ra user khác với user hiện tại
        const filteredUsers = users.filter(
          (user: any) => user.userId !== userInfo?.userId
        );

        setUsersOnline(filteredUsers);
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách người dùng online:", error);
      }
    };

    fetchOnlineUsers();
  }, [accessToken]);
  // Fetch subjects and grades on mount
  useEffect(() => {
    if (!accessToken) return;

    const fetchData = async () => {
      try {
        const [subjectsRes, gradesRes] = await Promise.all([
          apiService.get("/subjects", {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          apiService.get("/grades", {
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

  // Handle countdown
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

  // Cleanup socket on unmount
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

      const response = await apiService.post(
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

  return (
    <Layout>
      <Box className="p-6">
        <Box
          sx={{
            backgroundImage: 'url("/battle.png")',
            backgroundSize: "cover",
            height: "800px",
            backgroundPosition: "center",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              paddingTop: "120px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            {error && <p className="text-red-500">{error}</p>}
            <Box
              sx={{
                display: "flex",
                gap: 4,
                mt: 4,
                justifyContent: "center",
                flexGrow: 1,
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  backgroundColor: "white",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    backgroundColor: "#1976d2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "24px",
                    fontWeight: "bold",
                    mb: 1,
                  }}
                >
                  {userInfo?.username?.[0].toUpperCase()}
                </Box>
                <div className="font-semibold">
                  {userInfo?.username || "Tên người dùng"}
                </div>
                <div>Thắng: {userInfo?.wins || 0}</div>
                <div>Thua: {userInfo?.losses || 0}</div>
              </Box>

              <Box
                sx={{
                  mt: 4,
                  p: 2,
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  flex: 2,
                  backgroundColor: "white",
                }}
              >
                {selectedOpponent ? (
                  <>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          backgroundColor: "#1976d2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "24px",
                          fontWeight: "bold",
                        }}
                      >
                        {selectedOpponent.name[0].toUpperCase()}
                      </Box>
                      <Box>
                        <div className="font-semibold">
                          {selectedOpponent.name}
                        </div>
                        <div>Thắng: {selectedOpponent.wins}</div>
                        <div>Thua: {selectedOpponent.losses}</div>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                      onClick={() =>
                        selectedOpponent &&
                        sendBattleInvitation(selectedOpponent.id)
                      }
                      disabled={
                        !selectedSubject || !selectedGrade || !selectedOpponent
                      }
                    >
                      Thách đấu
                    </Button>
                    {/* <Button
                      variant="contained"
                      color="primary"
                      onClick={startMatching}
                    >
                      Thách đấu
                    </Button> */}
                  </>
                ) : (
                  <div>Hãy chọn người tham dự đấu trường để thách đấu</div>
                )}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  bgcolor: "white",
                  p: 2,
                  borderRadius: "8px",
                  flex: 1,
                }}
              >
                <TextField
                  label="Tìm học sinh..."
                  size="small"
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ backgroundColor: "white" }}
                />
                <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
                  {usersOnline
                    .filter((user) =>
                      user.username
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    )
                    .map((user) => (
                      <Box
                        key={user.userId}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                          p: 1,
                          borderRadius: "8px",
                          cursor: "pointer",
                          "&:hover": { backgroundColor: "#f0f0f0" },
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              backgroundColor: "#1976d2",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: "16px",
                              fontWeight: "bold",
                            }}
                          >
                            {user.username[0].toUpperCase()}
                          </Box>
                          <span>{user.username}</span>
                        </Box>
                        <Button
                          size="small"
                          onClick={() => sendBattleInvitation(user.userId)}
                          disabled={!selectedSubject || !selectedGrade}
                        >
                          Thách đấu
                        </Button>
                      </Box>
                    ))}
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                size="small"
                label=""
                select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                fullWidth
                InputProps={{
                  style: {
                    backgroundColor: "white",
                    color: "black",
                  },
                }}
                sx={{ width: "300px" }}
              >
                {subjects.map((subject) => (
                  <MenuItem key={subject.subjectId} value={subject.subjectId}>
                    {subject.subjectName}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label=""
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
                sx={{ width: "300px" }}
              >
                {grades.map((grade) => (
                  <MenuItem key={grade.gradeId} value={grade.gradeId}>
                    {grade.gradeName}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {!matching ? (
              <Box sx={{ paddingTop: 4 }}>
                {/* <Image
                  src="/play.png"
                  alt=""
                  width={100}
                  height={100}
                  onClick={startMatching}
                /> */}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={startMatching}
                >
                  Thách đấu
                </Button>
              </Box>
            ) : (
              //   <Button onClick={startMatching}>Start Matching</Button>
              <>
                <Box sx={{ width: "300px", textAlign: "center" }}>
                  {/* <div className="text-white font-semibold mb-2">
                    Matching... {countdown}s
                  </div> */}
                  <LinearProgress color="secondary" />
                </Box>

                <Button onClick={cancelMatching} variant="outlined">
                  Cancel
                </Button>
              </>
            )}
          </Box>
        </Box>
        {/* <h1 className="text-2xl font-semibold">Battle Mode</h1>

        {error && <p className="text-red-500">{error}</p>}

        <div className="flex flex-col space-y-4">
          <div>
            <label className="block text-sm font-medium">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              {subjects.map((subject) => (
                <option key={subject.subjectId} value={subject.subjectId}>
                  {subject.subjectName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Grade</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              {grades.map((grade) => (
                <option key={grade.gradeId} value={grade.gradeId}>
                  {grade.gradeName}
                </option>
              ))}
            </select>
          </div>

          {!matching ? (
            <Button onClick={startMatching}>Start Matching</Button>
          ) : (
            <>
              <div className="text-blue-600 font-semibold">
                Matching... {countdown}s
              </div>
              <Button onClick={cancelMatching} variant="destructive">
                Cancel
              </Button>
            </>
          )}
        </div> */}
      </Box>
    </Layout>
  );
}
