"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/AuthContext";
import { Button } from "../../button";
import apiService from "@/app/untils/api";
import Layout from "@/app/components/user/Home/layout";
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Avatar,
  CircularProgress,
  Checkbox,
} from "@mui/material";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import TextField from "../../textfield";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

interface PlayerScore {
  userId: string;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  lastQuestionId?: string | null;
}

interface BattleData {
  playerScores: PlayerScore[];
}

interface ApiResponse<T> {
  data: T;
  success?: boolean;
  message?: string;
}

interface PlayerInfo {
  userId: string;
  username: string;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  avatar?: string;
}

export default function BattleDetailPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { userInfo } = useAuth();
  const { battleId } = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState<any>(null);
  const [opponentScore, setOpponentScore] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [finished, setFinished] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [battleInfo, setBattleInfo] = useState<any>(null);
  const [error, setError] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [textAnswer, setTextAnswer] = useState("");
  const [battleResults, setBattleResults] = useState<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [opponentInfo, setOpponentInfo] = useState<PlayerInfo | null>(null);
  const [playerLastAnswerCorrect, setPlayerLastAnswerCorrect] = useState<
    boolean | null
  >(null);
  const [currentQuestionAnswer, setCurrentQuestionAnswer] = useState<any>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [battleStarted, setBattleStarted] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [disconnectedPlayer, setDisconnectedPlayer] = useState<string | null>(null);
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      setAccessToken(token);
    }
  }, []);

  const getPlayerStatusMessage = (
    isCorrect: boolean | null,
    isAnswered: boolean
  ) => {
    if (isAnswered) {
      return "Chờ đợi đối thủ...";
    }
    if (isCorrect === null) {
      return "Hãy trả lời câu hỏi bên dưới!";
    }
  };

  // Handle browser navigation (back/forward button)
  useEffect(() => {
    if (!battleInfo?.status || finished) return;

    history.pushState(null, "", window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      if (battleInfo.status === "ONGOING" && !isNavigatingRef.current) {
        event.preventDefault();
        setShowLeaveDialog(true);
        history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [battleInfo?.status, finished]);

  // Handle beforeunload for browser close/refresh
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (battleInfo?.status === "ONGOING" && !finished) {
        event.preventDefault();
        event.returnValue = "Are you sure you want to leave the battle? Your opponent will win.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [battleInfo?.status, finished]);

  useEffect(() => {
    if (!accessToken || !battleId || !userInfo?.userId) return;

    const fetchBattleInfo = async () => {
      try {
        const response = await apiService.get<ApiResponse<BattleData>>(
          `/battles/${battleId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        const battleData = response.data.data;
        setBattleInfo({
          ...battleData,
          lastQuestionId: battleData.lastQuestionId || null,
        });
        if (battleData.playerScores && battleData.playerScores.length >= 2) {
          const currentPlayer: PlayerScore | undefined =
            battleData.playerScores.find(
              (p: any) => p.userId === userInfo.userId
            );
          const opponent: PlayerScore | undefined =
            battleData.playerScores.find(
              (p: any) => p.userId !== userInfo.userId
            );

          setPlayerInfo(
            currentPlayer
              ? {
                  userId: currentPlayer.userId,
                  username: userInfo?.username || "Player",
                  score: currentPlayer.score,
                  correctAnswers: currentPlayer?.correctAnswers || 0,
                  incorrectAnswers: currentPlayer?.incorrectAnswers || 0,
                  avatar: undefined,
                }
              : null
          );

          setOpponentInfo(
            opponent
              ? {
                  userId: opponent.userId,
                  username: opponent.username || "Opponent",
                  score: opponent.score,
                  correctAnswers: opponent.correctAnswers || 0,
                  incorrectAnswers: opponent.incorrectAnswers || 0,
                  avatar: undefined,
                }
              : null
          );

          setPlayerScore(currentPlayer?.score || 0);
          setOpponentScore(opponent?.score || 0);
        }
      } catch (error) {
        console.error("Error fetching battle info:", error);
        setError("Failed to load battle information");
      }
    };
    fetchBattleInfo();

    const socket = new WebSocket(
      `ws://localhost:8080/ws/battle?battleId=${battleId}&userId=${userInfo.userId}&battle-token=${accessToken}`
    );

    socket.onopen = () => {
      console.log("🔗 WebSocket connected to battle");
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log("WebSocket message received:", msg);

        switch (msg.type) {
          case "MULTI_SELECT":
          case "MULTIPLE_CHOICE":
          case "FILL_IN_THE_BLANK":
            if (msg.question) {
              handleNewQuestion(msg);
            } else {
              console.warn(
                "Received QUESTION message but no question was attached"
              );
            }
            break;
          case "SCORE_UPDATE":
            updateScores(msg);
            break;
          case "ANSWER_RESULT":
            handleAnswerResult(msg);
            break;
          case "PLAYER_DISCONNECTED":
            handlePlayerDisconnected(msg);
            break;
          case "PLAYER_RECONNECTED":
            setDisconnectedPlayer(null);
            break;
          case "END":
            handleBattleEnd(msg);
            break;
          case "ERROR":
            setError(msg.message || "An error occurred");
            break;
          case "QUESTION_NUMBER":
            setQuestionNumber(msg.currentQuestion);
            setTotalQuestions(msg.totalQuestions);
            break;
          case "JOINED":
          case "START":
            if (msg.battleId) {
              setBattleStarted(true);
              console.log("Battle joined/started:", msg.battleId);
            }
            break;
          case "WAITING_FOR_OPPONENT":
            break;
          case "BOTH_ANSWERED":
            handleBothAnswered();
            break;
          case "UPDATE":
            setBattleInfo((prev) => ({ ...prev, ...msg.battle }));
            break;
          default:
            if (msg.battleId && msg.status) {
              updateBattleState(msg);
            }
            break;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message", error);
      }
    };

    socket.onerror = (e) => {
      console.error("WebSocket error", e);
      setError("Connection error");
    };

    socket.onclose = () => {
      console.log("WebSocket closed, attempting to reconnect...");
      setTimeout(() => {
        const newSocket = new WebSocket(
          `ws://localhost:8080/ws/battle?battleId=${battleId}&userId=${userInfo.userId}&battle-token=${accessToken}`
        );
        setWs(newSocket);
      }, 1000);
    };

    setWs(socket);

    return () => {
      socket.close();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [accessToken, battleId, userInfo?.userId]);

  // Handle player disconnection
  const handlePlayerDisconnected = (msg: any) => {
    if (msg.userId !== userInfo?.userId) {
      // Opponent disconnected
      setDisconnectedPlayer(msg.userId);
      setWinner(userInfo?.userId || null);
      setFinished(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setBattleResults(msg.playerScores || null);
      // Redirect to battle result immediately
      isNavigatingRef.current = true;
      router.push(`/battle-result/${battleId}`);
    }
  };

  // Handle explicit leave
  const handleLeaveBattle = async () => {
    try {
      isNavigatingRef.current = true;
      await apiService.post(
        `/battles/${battleId}/leave`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setShowLeaveDialog(false);
      setFinished(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Redirect to skill-list immediately
      router.push("/battle-home");
    } catch (error) {
      console.error("Error leaving battle:", error);
      setError("Failed to leave the battle");
      isNavigatingRef.current = false;
    }
  };

  const handleAnswerResult = (msg: any) => {
    if (msg.userId === userInfo?.userId) {
      setPlayerLastAnswerCorrect(msg.isCorrect);
    }
  };

  const handleBothAnswered = async () => {
    if (!battleId || !accessToken) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setLoadingQuestion(true);
    try {
      const response = await apiService.post(
        `/battles/${battleId}/nextQuestion`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      console.log("Next question requested:", response.data);

      setTimeout(() => {
        if (!question || question.questionId === battleInfo?.lastQuestionId) {
          console.warn("No new question received after request. Retrying...");
          setError("Failed to load new question. Retrying...");
          fetchFirstQuestion();
        }
      }, 2000);
    } catch (error) {
      console.error("Error fetching next question:", error);
      setError("Failed to load the next question");
    } finally {
      setLoadingQuestion(false);
    }
  };

  const fetchFirstQuestion = async () => {
    if (!battleId || !accessToken) return;

    setLoadingQuestion(true);
    try {
      await apiService.post(
        `/battles/${battleId}/nextQuestion`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    } catch (error) {
      console.error("Error fetching first question:", error);
      setError("Failed to load the first question. Please try refreshing.");
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleNewQuestion = (msg: any) => {
    if (msg.question?.questionId === question?.questionId) {
      console.warn("Received duplicate question:", msg.question.questionId);
      setError("Received duplicate question. Please wait or refresh.");
      return;
    }

    setQuestion({
      ...msg.question,
      type: msg.type,
    });
    setTimer(30);
    setIsAnswered(false);
    setSelectedAnswer(null);
    setSelectedAnswers([]);
    setTextAnswer("");
    setPlayerLastAnswerCorrect(null);
    setCurrentQuestionAnswer(null);

    if (msg.currentQuestion !== undefined) {
      setQuestionNumber(msg.currentQuestion);
    }
    if (msg.totalQuestions !== undefined) {
      setTotalQuestions(msg.totalQuestions);
    }

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          const currentQuestion = msg.question;
          if (!isAnswered && currentQuestion?.questionId) {
            console.log("⏰ Timer expired. Sending null answer...");
            handleTimeExpiredAnswer(currentQuestion);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeExpiredAnswer = async (currentQuestion: any) => {
    if (!currentQuestion || !userInfo?.userId || isAnswered) return;

    console.log(
      "Handling time expired answer for question:",
      currentQuestion.questionId
    );

    try {
      setIsAnswered(true);
      const timeTaken = 30;

      let payload = {
        userId: userInfo.userId,
        questionId: currentQuestion.questionId,
        answer: null,
        timeTaken,
      };

      console.log("Submitting time-expired null answer:", payload);
      const res = await apiService.post(
        `/battles/${battleId}/answer`,
        payload,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      console.log("Time-expired answer submitted successfully:", res);
    } catch (error: any) {
      console.error("Error submitting time-expired answer:", error);
      if (error.response?.status === 409) {
        console.warn("Duplicate answer detected, ignoring...");
        setError("Answer already submitted for this question.");
      } else {
        setError("Failed to submit answer");
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const updateScores = (msg: any) => {
    if (msg.playerScores && userInfo?.userId) {
      const myScore: PlayerScore | undefined = msg.playerScores.find(
        (p: any) => p.userId === userInfo.userId
      );
      const opponent: PlayerScore | undefined = msg.playerScores.find(
        (p: any) => p.userId !== userInfo.userId
      );

      setPlayerScore(myScore?.score || 0);
      setOpponentScore(opponent?.score || 0);

      setPlayerInfo(
        myScore
          ? {
              userId: myScore.userId,
              username: playerInfo?.username || userInfo?.username || "Player",
              score: myScore.score,
              correctAnswers: myScore.correctAnswers || 0,
              incorrectAnswers: myScore.incorrectAnswers || 0,
              avatar: playerInfo?.avatar,
            }
          : null
      );

      setOpponentInfo(
        opponent
          ? {
              userId: opponent.userId,
              username:
                opponentInfo?.username || opponent.username || "Opponent",
              score: opponent.score,
              correctAnswers: opponent.correctAnswers || 0,
              incorrectAnswers: opponent.incorrectAnswers || 0,
              avatar: opponentInfo?.avatar,
            }
          : null
      );
    }
  };

  const handleBattleEnd = (msg: any) => {
    if (msg.reason === "OPPONENT_LEFT") {
      // Remaining player
      setWinner(userInfo?.userId || null);
      setBattleResults(msg.playerScores || null);
      setFinished(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      isNavigatingRef.current = true;
      router.push(`/battle-result/${battleId}`);
    } else {
      // Normal battle end
      setWinner(msg.winner);
      setFinished(true);
      setBattleResults(msg.results || null);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      isNavigatingRef.current = true;
      router.push(`/battle-result/${battleId}`);
    }
  };

  const updateBattleState = (battleResponse: any) => {
    setBattleInfo({
      ...battleResponse,
      lastQuestionId:
        battleResponse.lastQuestionId || question?.questionId || null,
    });
    updateScores(battleResponse);

    if (battleResponse.status === "ENDED") {
      setWinner(battleResponse.winner || null);
      setBattleResults(battleResponse.results || null);
      setFinished(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      isNavigatingRef.current = true;
      router.push(`/battle-result/${battleId}`);
    }
  };

  const handleAnswer = async (answerOption: string | null | string[]) => {
    if (!question || !userInfo?.userId || isAnswered) {
      console.log("Early return condition met in handleAnswer");
      return;
    }

    try {
      setIsAnswered(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      const timeTaken = 30 - timer;

      let payload;
      setCurrentQuestionAnswer(answerOption);

      if (question.type === "MULTIPLE_CHOICE") {
        payload = {
          userId: userInfo.userId,
          questionId: question.questionId,
          answer: answerOption,
          timeTaken,
        };
      } else if (question.type === "MULTI_SELECT") {
        const selectedOptions = Array.isArray(answerOption) ? answerOption : [];
        payload = {
          userId: userInfo.userId,
          questionId: question.questionId,
          answers: selectedOptions,
          timeTaken,
        };
      } else if (question.type === "FILL_IN_THE_BLANK") {
        payload = {
          userId: userInfo.userId,
          questionId: question.questionId,
          answer: textAnswer,
          timeTaken,
        };
      } else {
        payload = {
          userId: userInfo.userId,
          questionId: question.questionId,
          answer: answerOption,
          timeTaken,
        };
      }

      console.log("Submitting answer:", payload);

      const response = await apiService.post(
        `/battles/${battleId}/answer`,
        payload,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      console.log("Answer submitted successfully:", response);
    } catch (error: any) {
      console.error("Error submitting answer:", error);
      if (error.response?.status === 409) {
        console.warn("Duplicate answer detected, ignoring...");
        setError("Answer already submitted for this question.");
      } else {
        setError("Failed to submit answer");
        setIsAnswered(false);
      }
    }
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const answerIndex = parseInt(e.target.value);
    setSelectedAnswer(answerIndex);
    handleAnswer(question.options[answerIndex]);
  };

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newSelectedAnswers = [...selectedAnswers];

    if (e.target.checked) {
      if (!newSelectedAnswers.includes(index)) {
        newSelectedAnswers.push(index);
      }
    } else {
      const idx = newSelectedAnswers.indexOf(index);
      if (idx > -1) {
        newSelectedAnswers.splice(idx, 1);
      }
    }

    setSelectedAnswers(newSelectedAnswers);
  };

  const handleMultiSelectSubmit = () => {
    if (!question) return;

    if (selectedAnswers.length > 0) {
      const selectedOptions = selectedAnswers.map(
        (index) => question.options[index]
      );
      handleAnswer(selectedOptions);
    } else {
      handleAnswer(null);
    }
  };

  const handleTextSubmit = () => {
    if (!question) return;
    handleAnswer(textAnswer);
  };

  const getPlayerStatus = () => {
    if (!battleInfo) return "";

    if (finished) {
      return winner === userInfo?.userId ? "Chiến thắng! 🏆" : "Thua rồi! 😢";
    }

    if (isAnswered) {
      return "Chờ đợi đối thủ...";
    }

    return "Trận đấu đang diễn ra...";
  };

  const formatTime = (seconds: number) => {
    return `${seconds.toString().padStart(2, "0")}`;
  };

  const getBeeImage = (isCorrect: boolean | null, isAnswered: boolean) => {
    if (!isAnswered) return "/bee-2.png";
    if (isCorrect === null) return "/bee-2.png";
  };

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
            flex: 1,
            overflow: "hidden",
          }}
        >
          {/* Header and Player Info */}
          

          <Box sx={{ bgcolor: "#90DD81" }}>
            <Typography
              sx={{
                fontSize: "24px",
                fontWeight: "600",
                textAlign: "center",
                paddingY: "8px",
              }}
            >
              ĐẤU TRƯỜNG VUI HỌC
            </Typography>
          </Box>
          <Divider />

          {battleInfo && (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "16px",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#E8F5E9",
                    padding: "4px",
                    borderRadius: 4,
                    width: "35%",
                    gap: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      border: "2px solid #BB9066",
                      color: "#BB9066",
                      bgcolor: "#FFFBF3",
                      fontWeight: 600,
                      height: 100,
                      width: 100,
                      fontSize: 32,
                    }}
                  >
                    {playerInfo?.username?.[0]?.toUpperCase() || "Y"}
                  </Avatar>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography
                      fontWeight={700}
                      sx={{
                        padding: "2px 4px",
                        borderRadius: 4,
                        bgcolor: "#ccc",
                        fontSize: 20,
                        textAlign: "center",
                      }}
                    >
                      {playerInfo?.username || "Player"}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            gap: "4px",
                            alignItems: "center",
                          }}
                        >
                          <CheckCircleIcon
                            sx={{
                              color: "#4caf50",
                              fontSize: 24,
                            }}
                          />
                          <Typography fontSize={18} fontWeight={600}>
                            {playerInfo?.correctAnswers || 0}
                          </Typography>
                        </Box>
                        <Typography fontWeight={600}>Câu đúng </Typography>
                      </Box>
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            gap: "4px",
                            alignItems: "center",
                          }}
                        >
                          <CancelIcon
                            sx={{
                              color: "#f44336",
                              fontSize: 24,
                            }}
                          />
                          <Typography fontSize={18} fontWeight={600}>
                            {playerInfo?.incorrectAnswers || 0}
                          </Typography>
                        </Box>
                        <Typography fontWeight={600}>Câu sai </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{ display: "flex", gap: "2px", alignItems: "center" }}
                    >
                      <Typography fontWeight={600}>Điểm số: </Typography>
                      <Typography fontWeight={600}>{playerScore}</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ textAlign: "center", width: "20%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 1,
                      backgroundColor: timer < 10 ? "#FFEBEE" : "#E8F5E9",
                      borderRadius: 2,
                      border: "1px solid #ccc",
                    }}
                  >
                    <AccessAlarmIcon
                      sx={{
                        fontSize: "32px",
                        color: timer < 10 ? "#F44336" : "#4CAF50",
                        marginRight: 1,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        color: timer < 10 ? "#F44336" : "#4CAF50",
                      }}
                    >
                      {formatTime(timer)}
                    </Typography>
                  </Box>
                  <Typography sx={{ paddingTop: 2 }}>
                    {getPlayerStatus()}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#E8F5E9",
                    padding: "4px",
                    borderRadius: 4,
                    width: "35%",
                    gap: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      border: "2px solid #BB9066",
                      color: "#BB9066",
                      bgcolor: "#FFFBF3",
                      fontWeight: 600,
                      height: 100,
                      width: 100,
                      fontSize: 32,
                    }}
                  >
                    {opponentInfo?.username?.[0]?.toUpperCase() || "O"}
                  </Avatar>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography
                      fontWeight={700}
                      sx={{
                        padding: "2px 4px",
                        borderRadius: 4,
                        bgcolor: "#ccc",
                        fontSize: 20,
                        textAlign: "center",
                      }}
                    >
                      {opponentInfo?.username || "Opponent"}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            gap: "4px",
                            alignItems: "center",
                          }}
                        >
                          <CheckCircleIcon
                            sx={{
                              color: "#4caf50",
                              fontSize: 24,
                            }}
                          />
                          <Typography fontSize={18} fontWeight={600}>
                            {opponentInfo?.correctAnswers || 0}
                          </Typography>
                        </Box>
                        <Typography fontWeight={600}>Câu đúng </Typography>
                      </Box>
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            gap: "4px",
                            alignItems: "center",
                          }}
                        >
                          <CancelIcon
                            sx={{
                              color: "#f44336",
                              fontSize: 24,
                            }}
                          />
                          <Typography fontSize={18} fontWeight={600}>
                            {opponentInfo?.incorrectAnswers || 0}
                          </Typography>
                        </Box>
                        <Typography fontWeight={600}>Câu sai </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{ display: "flex", gap: "2px", alignItems: "center" }}
                    >
                      <Typography fontWeight={600}>Điểm số:</Typography>
                      <Typography fontWeight={600}>{opponentScore}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  paddingX: "16px",
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  width: "100%",
                  gap: 2,
                }}
              >
                <Box>
                  <img
                    src={getBeeImage(playerLastAnswerCorrect, isAnswered)}
                    alt="Player status"
                    style={{ height: "60px" }}
                  />
                </Box>
                <Box
                  sx={{
                    position: "relative",
                    backgroundColor:
                      playerLastAnswerCorrect === true
                        ? "#e8f5e9"
                        : playerLastAnswerCorrect === false
                          ? "#ffebee"
                          : "#f5f5f5",
                    borderRadius: 1,
                    padding: "12px 16px",
                    boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
                    "&:before": {
                      content: '""',
                      position: "absolute",
                      left: "-10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "0",
                      height: "0",
                      borderTop: "8px solid transparent",
                      borderBottom: "8px solid transparent",
                      borderRight:
                        playerLastAnswerCorrect === true
                          ? "10px solid #e8f5e9"
                          : playerLastAnswerCorrect === false
                            ? "10px solid #ffebee"
                            : "10px solid #f5f5f5",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "14px",
                      color:
                        playerLastAnswerCorrect === true
                          ? "#4CAF50"
                          : playerLastAnswerCorrect === false
                            ? "#F44336"
                            : "#757575",
                    }}
                  >
                    {getPlayerStatusMessage(
                      playerLastAnswerCorrect,
                      isAnswered
                    )}
                  </Typography>
                </Box>
              </Box>
            </>
          )}

          {battleInfo?.status !== "ONGOING" && !finished && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 8,
                flex: 1,
              }}
            >
              <Typography sx={{ fontSize: "20px", marginBottom: 4 }}>
                Chờ đợi đối thủ tham gia...
              </Typography>
              <Box
                sx={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "#90CAF9",
                  animation: "pulse 1.5s infinite",
                  "@keyframes pulse": {
                    "0%": {
                      opacity: 0.6,
                      transform: "scale(0.9)",
                    },
                    "50%": {
                      opacity: 1,
                      transform: "scale(1)",
                    },
                    "100%": {
                      opacity: 0.6,
                      transform: "scale(0.9)",
                    },
                  },
                }}
              />
              <Button
                onClick={fetchFirstQuestion}
                sx={{ mt: 2 }}
                disabled={loadingQuestion}
              >
                {loadingQuestion ? "Loading..." : "Tải lại"}
              </Button>
            </Box>
          )}

          {battleInfo?.status === "ONGOING" && battleStarted && !finished && (
            <Box sx={{ padding: "8px 16px" }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: "20px",
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 20px",
                      backgroundColor: "#99BC4D",
                      borderTopLeftRadius: "16px",
                      borderTopRightRadius: "16px",
                      color: "#fff",
                    }}
                  >
                    <Typography fontSize="16px" fontWeight={700}>
                      Câu hỏi {questionNumber}/{totalQuestions}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: "100%",
                      height: "6px",
                      backgroundColor: "#E0E0E0",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${(timer / 30) * 100}%`,
                        height: "100%",
                        backgroundColor: timer < 10 ? "#FF5252" : "#99BC4D",
                        transition: "width 1s linear",
                      }}
                    />
                  </Box>

                  <Divider />

                  {question ? (
                    <Box sx={{ padding: "20px" }}>
                      <Typography fontSize="16px" fontWeight={700} gutterBottom>
                        {question.content}
                      </Typography>

                      {question.image && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            margin: "20px 0",
                          }}
                        >
                          <img
                            src={question.image}
                            alt="Question"
                            style={{
                              maxHeight: "200px",
                              maxWidth: "100%",
                              objectFit: "contain",
                            }}
                          />
                        </Box>
                      )}

                      {question.type === "MULTIPLE_CHOICE" && (
                        <FormControl
                          component="fieldset"
                          sx={{ width: "100%", marginTop: 2 }}
                        >
                          <RadioGroup
                            value={selectedAnswer ?? -1}
                            onChange={handleRadioChange}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}
                          >
                            {question.options
                              .filter((option: string) => option.trim() !== "")
                              .map((option: string, index: number) => (
                                <FormControlLabel
                                  key={index}
                                  value={index}
                                  control={<Radio />}
                                  label={option}
                                  disabled={isAnswered || timer === 0}
                                  sx={{
                                    backgroundColor: "#F5F5F5",
                                    borderRadius: "8px",
                                    padding: "8px 16px",
                                    margin: 0,
                                    "& .MuiFormControlLabel-label": {
                                      width: "100%",
                                      fontSize: "16px",
                                    },
                                    "&:hover": {
                                      backgroundColor: isAnswered
                                        ? "#F5F5F5"
                                        : "#E8F5E9",
                                    },
                                  }}
                                />
                              ))}
                          </RadioGroup>
                        </FormControl>
                      )}

                      {question.type === "MULTI_SELECT" && (
                        <Box sx={{ width: "100%", marginTop: 2 }}>
                          <Typography
                            sx={{
                              marginBottom: 2,
                              color: "#555",
                              fontStyle: "italic",
                            }}
                          >
                            Vui lòng chọn các câu trả lời đúng:
                          </Typography>

                          {question.options
                            .filter((option: string) => option.trim() !== "")
                            .map((option: string, index: number) => (
                              <FormControlLabel
                                key={index}
                                control={
                                  <Checkbox
                                    checked={selectedAnswers.includes(index)}
                                    onChange={(e) =>
                                      handleCheckboxChange(e, index)
                                    }
                                    disabled={isAnswered || timer === 0}
                                  />
                                }
                                label={option}
                                sx={{
                                  display: "flex",
                                  width: "100%",
                                  backgroundColor: "#F5F5F5",
                                  borderRadius: "8px",
                                  padding: "8px 16px",
                                  marginY: 1,
                                  "& .MuiFormControlLabel-label": {
                                    width: "100%",
                                    fontSize: "16px",
                                  },
                                  "&:hover": {
                                    backgroundColor: isAnswered
                                      ? "#F5F5F5"
                                      : "#E8F5E9",
                                  },
                                }}
                              />
                            ))}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              mt: 2,
                            }}
                          >
                            <Button
                              onClick={handleMultiSelectSubmit}
                              disabled={isAnswered || timer === 0}
                              sx={{
                                backgroundColor: "#99BC4D",
                                color: "white",
                                "&:hover": { backgroundColor: "#7A9F38" },
                              }}
                            >
                              Nộp bài
                            </Button>
                          </Box>
                        </Box>
                      )}

                      {question.type === "FILL_IN_THE_BLANK" && (
                        <Box sx={{ width: "100%", marginTop: 2 }}>
                          <Typography
                            sx={{
                              marginBottom: 2,
                              color: "#555",
                              fontStyle: "italic",
                            }}
                          >
                            Điền câu trả lời:
                          </Typography>

                          <TextField
                            value={textAnswer}
                            onChange={(e) => setTextAnswer(e.target.value)}
                            disabled={isAnswered || timer === 0}
                            sx={{ width: "100%", bgcolor: "white" }}
                            placeholder="Nhập câu trả lời của bạn"
                          />

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              mt: 2,
                            }}
                          >
                            <Button
                              onClick={handleTextSubmit}
                              disabled={isAnswered || timer === 0}
                              sx={{
                                backgroundColor: "#99BC4D",
                                color: "white",
                                "&:hover": { backgroundColor: "#7A9F38" },
                              }}
                            >
                              Nộp bài
                            </Button>
                          </Box>
                        </Box>
                      )}

                      {timer === 0 && !isAnswered && (
                        <Typography
                          sx={{
                            marginTop: 2,
                            fontWeight: 500,
                            color: "#D32F2F",
                            textAlign: "center",
                          }}
                        >
                          Time's up! You didn't answer this question.
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 8,
                      }}
                    >
                      <Typography sx={{ marginBottom: 3 }}>
                        Đang tải câu hỏi...
                      </Typography>
                      <Box
                        sx={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          border: "4px solid #f3f3f3",
                          borderTop: "4px solid #99BC4D",
                          animation: "spin 1s linear infinite",
                          "@keyframes spin": {
                            "0%": {
                              transform: "rotate(0deg)",
                            },
                            "100%": {
                              transform: "rotate(360deg)",
                            },
                          },
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          )}

          {finished && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 8,
                flex: 1,
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "4px solid #f3f3f3",
                  borderTop: "4px solid #99BC4D",
                  animation: "spin 1s linear infinite",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              />
            </Box>
          )}
        </Box>
        {/* Leave Confirmation Dialog */}
        <Dialog open={showLeaveDialog} onClose={() => setShowLeaveDialog(false)} maxWidth="md">
          <DialogTitle>Bạn muốn bỏ cuộc ư?</DialogTitle>
          <DialogContent>
            <Typography>
              Bạn có chắc chắn bạn muốn rời khỏi trận đấu? Đối phương sẽ được ghi nhận là người chiến thắng nếu bạn bỏ cuộc.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowLeaveDialog(false)}>Hủy</Button>
            <Button onClick={handleLeaveBattle} color="error">
              Rời khỏi
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}