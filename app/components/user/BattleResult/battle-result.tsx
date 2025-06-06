"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/AuthContext";
import { Button } from "../../button";
import apiService from "@/app/untils/api";
import Layout from "@/app/components/user/Home/layout";
import { Box, Typography, Avatar, Divider } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
interface PlayerInfo {
  userId: string;
  username: string;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  avatar?: string;
}

interface BattleResult {
  winner: string | null;
  playerScores: PlayerInfo[];
  questions?: any[];
  battleId: string;
  status: string;
}

export default function BattleResultPage() {
  const { battleId } = useParams();
  const router = useRouter();
  const { userInfo } = useAuth();
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBattleResult = async () => {
      if (!battleId || !userInfo?.userId) {
        console.log("Missing battleId or userInfo:", {
          battleId,
          userId: userInfo?.userId,
        });
        return;
      }

      try {
        // Đảm bảo chỉ truy cập localStorage khi đã mount
        const accessToken =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;

        if (!accessToken) {
          setError("Không tìm thấy token xác thực");
          setLoading(false);
          return;
        }

        console.log("Calling API with:", {
          battleId,
          accessToken: !!accessToken,
        });

        const response = await apiService.get(`/battles/${battleId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        console.log("API Response:", response);
        const data = response.data.data;
        console.log("Battle Result Data:", data);
        console.log("Player Scores:", data.playerScores);
        setBattleResult(data);

        // Lưu vào localStorage sau khi gọi API thành công
        if (typeof window !== "undefined") {
          localStorage.setItem(
            `battle_result_${battleId}`,
            JSON.stringify(data)
          );
        }
      } catch (error: any) {
        console.error("Error fetching battle result:", error);
        console.error("Error details:", error.response?.data);
        setError(
          `Failed to load battle result: ${error.response?.data?.message || error.message}`
        );
      } finally {
        setLoading(false);
      }
    };

    // Kiểm tra localStorage trước (chỉ khi đã mount)
    if (typeof window !== "undefined") {
      const storedResult = localStorage.getItem(`battle_result_${battleId}`);
      if (storedResult) {
        try {
          const parsedResult = JSON.parse(storedResult);
          console.log("Using stored result:", parsedResult);
          setBattleResult(parsedResult);
          setLoading(false);
          return; // Không gọi API nếu có data trong localStorage
        } catch (parseError) {
          console.error("Error parsing stored result:", parseError);
          // Nếu parse lỗi, xóa data cũ và gọi API
          localStorage.removeItem(`battle_result_${battleId}`);
        }
      }
    }

    // Gọi API nếu không có data trong localStorage hoặc parse lỗi
    fetchBattleResult();
  }, [battleId, userInfo?.userId]);

  // Debug thông tin player và opponent
  useEffect(() => {
    if (battleResult && userInfo?.userId) {
      const playerInfo = battleResult.playerScores?.find(
        (player) => player.userId === userInfo?.userId
      );
      const opponentInfo = battleResult.playerScores?.find(
        (player) => player.userId !== userInfo?.userId
      );

      console.log("Current User ID:", userInfo.userId);
      console.log("Player Info:", playerInfo);
      console.log("Opponent Info:", opponentInfo);
    }
  }, [battleResult, userInfo?.userId]);

  // Debug: Log state changes
  useEffect(() => {
    console.log("State update:", {
      loading,
      error,
      battleResult: !!battleResult,
    });
  }, [loading, error, battleResult]);

  if (loading) {
    return (
      <Layout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
        >
          <Typography>Đang tải kết quả...</Typography>
        </Box>
      </Layout>
    );
  }

  if (error || !battleResult) {
    return (
      <Layout>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minHeight: "50vh",
            justifyContent: "center",
          }}
        >
          <Typography color="error">
            {error || "Không thể tải kết quả"}
          </Typography>
          <Button
            onClick={() => {
              // Clear localStorage và retry
              if (typeof window !== "undefined") {
                localStorage.removeItem(`battle_result_${battleId}`);
              }
              window.location.reload();
            }}
            sx={{ mt: 2, mr: 2 }}
          >
            Thử lại
          </Button>
          <Button onClick={() => router.push("/battle-home")} sx={{ mt: 2 }}>
            Trở về
          </Button>
        </Box>
      </Layout>
    );
  }

  // Tìm thông tin player và opponent từ playerScores array
  const playerInfo =
    battleResult.playerScores?.find(
      (player) => player.userId === userInfo?.userId
    ) || null;

  const opponentInfo =
    battleResult.playerScores?.find(
      (player) => player.userId !== userInfo?.userId
    ) || null;

  const { winner, questions } = battleResult;

  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#EFF3E6",
          padding: { xs: "20px", md: "40px 120px" },
          minHeight: "100vh",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            bgcolor: "#FFFFFF",
            border: "1px solid #ccc",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box sx={{ bgcolor: "#90DD81" }}>
            <Typography
              sx={{
                fontSize: "24px",
                fontWeight: "600",
                textAlign: "center",
                paddingY: "16px",
              }}
            >
              KẾT QUẢ TRẬN ĐẤU
            </Typography>
          </Box>

          <Box sx={{ padding: "32px" }}>
            {/* Winner Announcement */}
            <Box
              sx={{
                position: "relative",
                height: "200px",
                backgroundImage: "url('/victory_bg.png')",
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                borderRadius: 2,
                marginBottom: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  //   backgroundColor: "rgba(0, 0, 0, 0.3)",
                  borderRadius: 2,
                },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  top: -20,
                  zIndex: 1,
                  textAlign: "center",
                  color: "#90DD81",
                }}
              >
                <Typography fontSize={24} fontWeight={600}>
                  {winner === userInfo?.userId
                    ? playerInfo?.username || "Bạn"
                    : opponentInfo?.username || "Đối thủ"}
                </Typography>
              </Box>
            </Box>

            {/* Player vs Opponent Stats */}
            <Box
              sx={{
                display: "flex",
                gap: 4,
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              {/* Player Stats */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  border: "2px solid #ccc",
                  borderRadius: 2,
                  padding: 3,
                  flex: 1,
                  backgroundColor:
                    winner === userInfo?.userId ? "#E8F5E9" : "#FFFFFF",
                }}
              >
                <Avatar
                  sx={{
                    border: "2px solid #BB9066",
                    color: "#BB9066",
                    bgcolor: "#FFFBF3",
                    fontWeight: 600,
                    width: 50,
                    height: 50,
                    fontSize: 24,
                  }}
                >
                  {playerInfo?.username?.[0]?.toUpperCase() || "P"}
                </Avatar>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography fontSize={24} fontWeight={600}>
                    {playerInfo?.username || "Player"}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 20 }} />
                    <Typography fontWeight={600}>
                      Số câu trả lời đúng: {playerInfo?.correctAnswers || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <CancelIcon sx={{ color: "#f44336", fontSize: 20 }} />
                    <Typography fontWeight={600}>
                      Số câu trả lời sai: {playerInfo?.incorrectAnswers || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <WorkspacePremiumIcon sx={{ fontSize: 20 }} />
                    <Typography fontWeight={600}>
                      Điểm: {playerInfo?.score || 0}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* VS */}
              <Typography variant="h5" fontWeight={600} sx={{ mx: 2 }}>
                VS
              </Typography>

              {/* Opponent Stats */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  border: "2px solid #ccc",
                  borderRadius: 2,
                  padding: 3,
                  flex: 1,
                  backgroundColor:
                    winner !== userInfo?.userId ? "#E8F5E9" : "#FFFFFF",
                }}
              >
                <Avatar
                  sx={{
                    border: "2px solid #BB9066",
                    color: "#BB9066",
                    bgcolor: "#FFFBF3",
                    fontWeight: 600,
                    width: 50,
                    height: 50,
                    fontSize: 24,
                  }}
                >
                  {opponentInfo?.username?.[0]?.toUpperCase() || "O"}
                </Avatar>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography fontSize={24} fontWeight={600}>
                    {opponentInfo?.username || "Opponent"}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 20 }} />
                    <Typography fontWeight={600}>
                      Số câu trả lời đúng: {opponentInfo?.correctAnswers || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <CancelIcon sx={{ color: "#f44336", fontSize: 20 }} />
                    <Typography fontWeight={600}>
                      Số câu trả lời sai: {opponentInfo?.incorrectAnswers || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <WorkspacePremiumIcon sx={{ fontSize: 20 }} />{" "}
                    <Typography fontWeight={600}>
                      Điểm: {opponentInfo?.score || 0}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Question Summary */}
            {questions && questions.length > 0 && (
              <Box>
                <Typography
                  variant="h5"
                  sx={{ marginBottom: 3, fontWeight: 600 }}
                >
                  Chi tiết từng câu hỏi
                </Typography>
                <Divider sx={{ marginBottom: 3 }} />

                {questions.map((question: any, index: number) => (
                  <Box
                    key={index}
                    sx={{
                      padding: 3,
                      backgroundColor: question.correct ? "#E8F5E9" : "#FFEBEE",
                      borderRadius: 2,
                      marginBottom: 2,
                      border: "1px solid #ddd",
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      sx={{ marginBottom: 2 }}
                    >
                      Câu {index + 1}: {question.content}
                    </Typography>

                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Typography>
                        <strong>Câu trả lời của bạn:</strong>{" "}
                        <span
                          style={{
                            color: question.correct ? "#4caf50" : "#f44336",
                            fontWeight: 600,
                          }}
                        >
                          {question.userAnswer || "Không trả lời"}
                        </span>
                      </Typography>

                      <Typography>
                        <strong>Đáp án đúng:</strong>{" "}
                        <span style={{ color: "#4caf50", fontWeight: 600 }}>
                          {question.correctAnswer}
                        </span>
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mt: 1,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            color: question.correct ? "#4caf50" : "#f44336",
                            fontWeight: 600,
                          }}
                        >
                          {question.correct ? "✓ Đúng" : "✗ Sai"}
                        </Typography>

                        {question.timeTaken && (
                          <Typography variant="body2" color="text.secondary">
                            Thời gian: {question.timeTaken}s
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                marginTop: 4,
              }}
            >
              <Button
                onClick={() => router.push("/battle-home")}
                sx={{
                  backgroundColor: "#99BC4D",
                  color: "white",
                  "&:hover": { backgroundColor: "#7A9F38" },
                  px: 4,
                  py: 1.5,
                }}
              >
                Quay lại Đấu trường
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}
