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
interface PlayerScore {
  userId: string;
  score: number;
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
  const accessToken = localStorage.getItem("accessToken");
  const { userInfo } = useAuth();
  const { battleId } = useParams();
  const router = useRouter();
  // const [isBothAnswered, setIsBothAnswered] = useState(false);
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
  const [showResultDialog, setShowResultDialog] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [opponentInfo, setOpponentInfo] = useState<PlayerInfo | null>(null);
  const [playerLastAnswerCorrect, setPlayerLastAnswerCorrect] = useState<
    boolean | null
  >(null);
  const [currentQuestionAnswer, setCurrentQuestionAnswer] = useState<any>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  const getPlayerStatusMessage = (isCorrect: boolean | null) => {
    if (isCorrect === null) return;
    return isCorrect
      ? "Tuyệt vời! Tiếp tục phát huy nhé!"
      : "Đừng nản lòng! Cố gắng lên nào!";
  };

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
        console.log("Battle data:", battleData);
        setBattleInfo(battleData);
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
                  correctAnswers: currentPlayer?.correctAnswers || 0, // Lấy từ API
                  incorrectAnswers: currentPlayer?.incorrectAnswers || 0, // Lấy từ API
                  avatar: undefined,
                }
              : null
          );

          setOpponentInfo(
            opponent
              ? {
                  userId: opponent.userId,
                  username: opponent.username || "Opponent", // Lấy username từ API
                  score: opponent.score,
                  correctAnswers: opponent.correctAnswers || 0, // Lấy từ API
                  incorrectAnswers: opponent.incorrectAnswers || 0, // Lấy từ API
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
            // Xử lý kết quả câu trả lời từ server
            handleAnswerResult(msg);
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
              console.log("Battle joined/started:", msg.battleId);
            }
            break;
          case "WAITING_FOR_OPPONENT":
            break;
          case "BOTH_ANSWERED":
            handleBothAnswered();
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
        // Set up new socket event handlers
      }, 1000);
    };

    setWs(socket);

    return () => {
      socket.close();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [accessToken, battleId, userInfo?.userId]);
  const handleAnswerResult = (msg: any) => {
    // msg có thể chứa thông tin như:
    // { userId, questionId, isCorrect, score, ... }
    if (msg.userId === userInfo?.userId) {
      setPlayerLastAnswerCorrect(msg.isCorrect);
    }
  };
  const handleBothAnswered = async () => {
    if (!battleId || !accessToken) return;

    // setIsBothAnswered(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

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
      console.error("Error fetching next question:", error);
      setError("Failed to load the next question");
    } finally {
      setLoadingQuestion(false);
      // setIsBothAnswered(false);
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
      // The server will send the question via WebSocket
    } catch (error) {
      console.error("Error fetching first question:", error);
      setError("Failed to load the first question. Please try refreshing.");
    } finally {
      setLoadingQuestion(false);
    }
  };

  // const handleNewQuestion = (msg: any) => {
  //   setQuestion(msg.question);
  //   setTimer(30);
  //   setIsAnswered(false);
  //   setSelectedAnswer(null);

  //   // Update question number if provided
  //   if (msg.currentQuestion !== undefined) {
  //     setQuestionNumber(msg.currentQuestion);
  //   }
  //   if (msg.totalQuestions !== undefined) {
  //     setTotalQuestions(msg.totalQuestions);
  //   }

  //   // Reset timer for new question
  //   if (timerRef.current) clearInterval(timerRef.current);

  //   timerRef.current = setInterval(() => {
  //     setTimer((prev) => {
  //       if (prev <= 1) {
  //         clearInterval(timerRef.current!);

  //         // 👇 Ensure this runs correctly by wrapping in setTimeout
  //         setTimeout(() => {
  //           if (!isAnswered && question?.questionId) {
  //             console.log("⏰ Timer expired. Sending null answer...");
  //             handleAnswer(null);
  //           }
  //         }, 50); // Delay slightly to ensure state updates flush

  //         return 0;
  //       }

  //       return prev - 1;
  //     });
  //   }, 1000);
  // };
  // const handleNewQuestion = (msg: any) => {
  //   setQuestion({
  //     ...msg.question,
  //     type: msg.type, // Add the type from the root message object to the question
  //   });
  //   setTimer(30);
  //   setIsAnswered(false);
  //   setSelectedAnswer(null);
  //   setSelectedAnswers([]); // Reset selected answers for multi-select questions
  //   setTextAnswer(""); // Reset text answer for fill-in-the-blank questions

  //   // Update question number if provided
  //   if (msg.currentQuestion !== undefined) {
  //     setQuestionNumber(msg.currentQuestion);
  //   }
  //   if (msg.totalQuestions !== undefined) {
  //     setTotalQuestions(msg.totalQuestions);
  //   }

  //   // Reset timer for new question
  //   if (timerRef.current) clearInterval(timerRef.current);

  //   timerRef.current = setInterval(() => {
  //     setTimer((prev) => {
  //       if (prev <= 1) {
  //         clearInterval(timerRef.current!);

  //         // 👇 Ensure this runs correctly by wrapping in setTimeout
  //         // setTimeout(() => {
  //         //   if (!isAnswered && msg.question?.questionId) {
  //         //     console.log("⏰ Timer expired. Sending null answer...");
  //         //     handleAnswer(null);
  //         //   }
  //         // }, 50); // Delay slightly to ensure state updates flush
  //         setTimeout(() => {
  //           console.log("Current isAnswered state:", isAnswered);
  //           console.log("Current question state:", question);
  //           if (!isAnswered && msg.question?.questionId) {
  //             console.log("⏰ Timer expired. Sending null answer...");
  //             handleAnswer(null);
  //           }
  //         }, 50);

  //         return 0;
  //       }

  //       return prev - 1;
  //     });
  //   }, 1000);
  // };

  const handleNewQuestion = (msg: any) => {
    setQuestion({
      ...msg.question,
      type: msg.type, // Add the type from the root message object to the question
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

          setTimeout(() => {
            if (!isAnswered && currentQuestion?.questionId) {
              console.log("⏰ Timer expired. Sending null answer...");
              handleTimeExpiredAnswer(currentQuestion);
            }
          }, 100);

          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeExpiredAnswer = async (currentQuestion: any) => {
    if (!currentQuestion || !userInfo?.userId) return;

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
      // setPlayerLastAnswerCorrect(false);
      if (res.data && res.data.isCorrect !== undefined) {
        setPlayerLastAnswerCorrect(res.data.isCorrect);
      } else {
        setPlayerLastAnswerCorrect(false); // Mặc định là sai nếu hết time
      }
    } catch (error) {
      console.error("Error submitting time-expired answer:", error);
      setError("Failed to submit answer");
    }
  };
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // const updateScores = (msg: any) => {
  //   if (msg.playerScores && userInfo?.userId) {
  //     const myScore: PlayerScore | undefined = msg.playerScores.find(
  //       (p: any) => p.userId === userInfo.userId
  //     );
  //     const opponent: PlayerScore | undefined = msg.playerScores.find(
  //       (p: any) => p.userId !== userInfo.userId
  //     );

  //     // if (isAnswered) {
  //     //   if (myScore && playerScore < myScore.score) {
  //     //     setPlayerLastAnswerCorrect(true);
  //     //   } else {
  //     //     setPlayerLastAnswerCorrect(false);
  //     //   }
  //     // }

  //     setPlayerScore(myScore?.score || 0);
  //     setOpponentScore(opponent?.score || 0);

  //     // Transform PlayerScore to PlayerInfo or set null
  //     setPlayerInfo(
  //       myScore
  //         ? {
  //             userId: myScore.userId,
  //             username: playerInfo?.username || userInfo?.username || "Player", // Use existing username or fallback
  //             score: myScore.score,
  //             correctAnswers: playerInfo?.correctAnswers || 0, // Preserve or default
  //             incorrectAnswers: playerInfo?.incorrectAnswers || 0, // Preserve or default
  //             avatar: playerInfo?.avatar, // Preserve if exists
  //           }
  //         : null
  //     );

  //     setOpponentInfo(
  //       opponent
  //         ? {
  //             userId: opponent.userId,
  //             username: opponentInfo?.username || "Opponent", // Use existing or fallback
  //             score: opponent.score,
  //             correctAnswers: opponentInfo?.correctAnswers || 0, // Preserve or default
  //             incorrectAnswers: opponentInfo?.incorrectAnswers || 0, // Preserve or default
  //             avatar: opponentInfo?.avatar, // Preserve if exists
  //           }
  //         : null
  //     );
  //   }
  // };
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
              correctAnswers: myScore.correctAnswers || 0, // Lấy từ msg
              incorrectAnswers: myScore.incorrectAnswers || 0, // Lấy từ msg
              avatar: playerInfo?.avatar,
            }
          : null
      );

      setOpponentInfo(
        opponent
          ? {
              userId: opponent.userId,
              username:
                opponentInfo?.username || opponent.username || "Opponent", // Lấy username từ msg nếu có
              score: opponent.score,
              correctAnswers: opponent.correctAnswers || 0, // Lấy từ msg
              incorrectAnswers: opponent.incorrectAnswers || 0, // Lấy từ msg
              avatar: opponentInfo?.avatar,
            }
          : null
      );
    }
  };

  const handleBattleEnd = (msg: any) => {
    setWinner(msg.winner);
    setFinished(true);
    setBattleResults(msg.results || null);
    if (timerRef.current) clearInterval(timerRef.current);

    // Show results dialog after a short delay
    setTimeout(() => {
      setShowResultDialog(true);
    }, 1000);
  };

  const updateBattleState = (battleResponse: any) => {
    setBattleInfo(battleResponse);
    updateScores(battleResponse);

    if (battleResponse.status === "ENDED") {
      setWinner(battleResponse.winner || null);
      setBattleResults(battleResponse.results || null);
      setFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
      setShowResultDialog(true);
    }
  };

  // const handleAnswer = async (answerOption: string | null) => {
  //   if (!question || !userInfo?.userId || isAnswered) return;

  //   try {
  //     setIsAnswered(true);
  //     const timeTaken = 30 - timer;

  //     await apiService.post(
  //       `/battles/${battleId}/answer`,
  //       {
  //         userId: userInfo.userId,
  //         questionId: question.questionId,
  //         answer: answerOption,
  //         timeTaken,
  //       },
  //       {
  //         headers: { Authorization: `Bearer ${accessToken}` },
  //       }
  //     );
  //     // The server will send the next question when both players have answered
  //   } catch (error) {
  //     console.error("Error submitting answer:", error);
  //     setError("Failed to submit answer");
  //   }
  // };
  const handleAnswer = async (answerOption: string | null | string[]) => {
    console.log("handleAnswer called with:", {
      question: question,
      userId: userInfo?.userId,
      isAnswered: isAnswered,
    });

    if (!question || !userInfo?.userId || isAnswered) {
      console.log("Early return condition met in handleAnswer");
      return;
    }

    try {
      setIsAnswered(true);
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
        // For multi-select, use the answers field
        const selectedOptions = Array.isArray(answerOption) ? answerOption : [];
        payload = {
          userId: userInfo.userId,
          questionId: question.questionId,
          answers: selectedOptions, // Use answers field for arrays
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

      console.log("Submitting answer:", payload); // Debugging line
      // await apiService.post(`/battles/${battleId}/answer`, payload, {
      //   headers: { Authorization: `Bearer ${accessToken}` },
      // });
      const response = await apiService.post(
        `/battles/${battleId}/answer`,
        payload,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      // Xử lý kết quả trả lời từ response
      if (response.data && response.data.isCorrect !== undefined) {
        setPlayerLastAnswerCorrect(response.data.isCorrect);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      setError("Failed to submit answer");
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
      // Thêm câu trả lời vào danh sách nếu được chọn
      if (!newSelectedAnswers.includes(index)) {
        newSelectedAnswers.push(index);
      }
    } else {
      // Xóa câu trả lời khỏi danh sách nếu bỏ chọn
      const idx = newSelectedAnswers.indexOf(index);
      if (idx > -1) {
        newSelectedAnswers.splice(idx, 1);
      }
    }

    setSelectedAnswers(newSelectedAnswers);
  };

  // Handler cho việc submit câu trả lời MULTI_SELECT
  // const handleMultiSelectSubmit = () => {
  //   if (selectedAnswers.length > 0) {
  //     const selectedOptions = selectedAnswers.map(
  //       (index) => question.options[index]
  //     );
  //     handleAnswer(selectedOptions);
  //   } else {
  //     handleAnswer(null);
  //   }
  // };

  // // Handler cho việc submit câu trả lời FILL_IN_THE_BLANK
  // const handleTextSubmit = () => {
  //   handleAnswer(textAnswer);
  // };
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
  const getBeeImage = (isCorrect: boolean | null) => {
    if (isCorrect === null) return "/bee-2.png"; // Default/waiting
    return isCorrect ? "/bee-1.png" : "/bee-3.png"; // Correct/Incorrect
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
          <Box sx={{ bgcolor: "#E8F5E9" }}>
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

          {/* {error && (
            <Box
              sx={{
                bgcolor: "#FFEBEE",
                color: "#D32F2F",
                padding: 2,
                margin: 2,
                borderRadius: 1,
              }}
            >
              {error}
            </Box>
          )} */}

          {/* Battle Header - Scores */}
          {battleInfo && (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "16px",
                  // borderBottom: "1px solid #E0E0E0",
                }}
              >
                <Box
                  sx={{
                    // textAlign: "center",
                    display: "flex",
                    // flexDirection: "column",
                    alignItems: "center",
                    backgroundColor: "#E8F5E9",
                    padding: 2,
                    borderRadius: 4,
                    width: "35%",
                    gap: 2,
                  }}
                >
                  <Avatar
                    // src={playerInfo?.avatar || ""}
                    // alt={playerInfo?.username || "You"}
                    // sx={{ width: 50, height: 50, }}
                    sx={{
                      border: "2px solid #BB9066",
                      color: "#BB9066",
                      bgcolor: "#FFFBF3",
                      fontWeight: 600,
                    }}
                  >
                    {playerInfo?.username?.[0]?.toUpperCase() || "Y"}
                  </Avatar>

                  {/* <Typography sx={{ fontSize: "24px" }}>{playerScore}</Typography> */}
                  <Box>
                    <Typography fontWeight={700}>
                      You ({playerInfo?.username || "Player"})
                    </Typography>
                    <Box sx={{ display: "flex", gap: "2px" }}>
                      <Typography fontWeight={600}>Đúng: </Typography>
                      <Typography>{playerInfo?.correctAnswers || 0}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: "2px" }}>
                      <Typography fontWeight={600}>Sai: </Typography>
                      <Typography>
                        {playerInfo?.incorrectAnswers || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: "2px" }}>
                      <Typography fontWeight={600}>Điểm: </Typography>
                      <Typography>{playerScore}</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ textAlign: "center", width: "20%" }}>
                  {/* <Typography fontWeight={700} sx={{ fontSize: "20px" }}>
                  {battleInfo.battleId}
                </Typography> */}
                  {/* Timer display */}
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
                    // textAlign: "center",
                    display: "flex",
                    // flexDirection: "column",
                    alignItems: "center",
                    backgroundColor: "#E8F5E9",
                    padding: 2,
                    borderRadius: 4,
                    width: "35%",
                    gap: 2,
                  }}
                >
                  <Avatar
                    // src={playerInfo?.avatar || ""}
                    // alt={playerInfo?.username || "You"}
                    // sx={{ width: 50, height: 50, }}
                    sx={{
                      border: "2px solid #BB9066",
                      color: "#BB9066",
                      bgcolor: "#FFFBF3",
                      fontWeight: 600,
                    }}
                  >
                    {opponentInfo?.username?.[0]?.toUpperCase() || "O"}
                  </Avatar>

                  {/* <Typography sx={{ fontSize: "24px" }}>
                  {opponentScore}
                </Typography> */}
                  <Box>
                    <Typography fontWeight={700}>
                      Opponent ({opponentInfo?.username || "Opponent"})
                    </Typography>
                    <Box sx={{ display: "flex", gap: "2px" }}>
                      <Typography fontWeight={600}>Đúng: </Typography>
                      <Typography>
                        {opponentInfo?.correctAnswers || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: "2px" }}>
                      <Typography fontWeight={600}>Sai: </Typography>
                      <Typography>
                        {opponentInfo?.incorrectAnswers || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: "2px" }}>
                      <Typography fontWeight={600}>Điểm:</Typography>
                      <Typography>{opponentScore} </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              {/* <Box
                sx={{
                  paddingX: "16px",
                  display: "flex",
                  justifyContent: "flex-start",
                  // flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                  gap: 2,
                }}
              >
                <img
                  src={getBeeImage(playerLastAnswerCorrect)}
                  alt="Player status"
                  style={{ height: "60px", marginBottom: "8px" }}
                />
                <Box>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      textAlign: "center",
                      color:
                        playerLastAnswerCorrect === true
                          ? "#4CAF50"
                          : playerLastAnswerCorrect === false
                            ? "#F44336"
                            : "#757575",
                    }}
                  >
                    {getPlayerStatusMessage(playerLastAnswerCorrect)}
                  </Typography>
                </Box>
              </Box> */}
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
                {/* Mascot/character image */}
                <Box>
                  <img
                    src={getBeeImage(playerLastAnswerCorrect)}
                    alt="Player status"
                    style={{ height: "60px" }}
                  />
                </Box>

                {/* Message bubble with arrow */}
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
                          ? "#4CAF50" // Green text for correct
                          : playerLastAnswerCorrect === false
                            ? "#F44336" // Red text for incorrect
                            : "#757575", // Gray text for neutral
                    }}
                  >
                    {getPlayerStatusMessage(playerLastAnswerCorrect)}
                  </Typography>
                </Box>
              </Box>
            </>
          )}

          {/* Waiting for opponent screen */}
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

          {/* Question section */}
          {battleInfo?.status === "ONGOING" && !finished && (
            <Box sx={{ padding: "8px 16px" }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: "20px",
                }}
              >
                {/* Left Section: Question Area */}
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                  }}
                >
                  {/* Question header */}
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
                    {/* <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <AccessAlarmIcon sx={{ fontSize: "20px" }} />
                      <Typography fontSize="16px" fontWeight={700}>
                        {formatTime(timer)}
                      </Typography>
                    </Box> */}
                  </Box>

                  {/* Timer bar */}
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

                  {/* Question content */}
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

                      {/* Answer options */}
                      {/* <FormControl
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
                          {question.options &&
                            question.options.map(
                              (option: string, index: number) => (
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
                              )
                            )}
                        </RadioGroup>
                      </FormControl> */}
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
                            {question.options &&
                              question.options.map(
                                (option: string, index: number) => (
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
                                )
                              )}
                          </RadioGroup>
                        </FormControl>
                      )}

                      {/* Câu hỏi MULTI_SELECT */}
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

                          {question.options &&
                            question.options.map(
                              (option: string, index: number) => (
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
                              )
                            )}

                          {/* Submit button đặc biệt cho Multi-select */}
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
                              Submit Answers
                            </Button>
                          </Box>
                        </Box>
                      )}

                      {/* Câu hỏi FILL_IN_THE_BLANK */}
                      {question.type === "FILL_IN_THE_BLANK" && (
                        <Box sx={{ width: "100%", marginTop: 2 }}>
                          <Typography
                            sx={{
                              marginBottom: 2,
                              color: "#555",
                              fontStyle: "italic",
                            }}
                          >
                            Fill in your answer:
                          </Typography>

                          <TextField
                            value={textAnswer}
                            onChange={(e) => setTextAnswer(e.target.value)}
                            disabled={isAnswered || timer === 0}
                            sx={{ width: "100%", bgcolor: "white" }}
                            placeholder="Type your answer here"
                          />

                          {/* Submit button đặc biệt cho Fill-in-the-blank */}
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
                              Submit Answer
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

                      {/* {isAnswered && (
                        // <Box
                        //   sx={{
                        //     marginTop: 4,
                        //     padding: 2,
                        //     backgroundColor: "#E8F5E9",
                        //     borderRadius: 2,
                        //     textAlign: "center",
                        //   }}
                        // >
                        //   <Typography>
                        //     Waiting for opponent to answer...
                        //   </Typography>
                        // </Box>
                        <></>
                      )} */}
                      {isAnswered && (
                        <Box
                          sx={{
                            marginTop: 4,
                            padding: 2,
                            backgroundColor: "#E8F5E9",
                            borderRadius: 2,
                            textAlign: "center",
                          }}
                        >
                          <Typography>
                            Waiting for opponent to answer...
                          </Typography>
                        </Box>
                      )}
                      {/* {isBothAnswered && (
                        <Box
                          sx={{
                            marginTop: 4,
                            padding: 2,
                            backgroundColor: "#E8F5E9",
                            borderRadius: 2,
                            textAlign: "center",
                          }}
                        >
                          <Typography>
                            Both players answered! Loading next question...
                          </Typography>
                        </Box>
                      )} */}
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
                        Loading next question...
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

                {/* Right Section: Battle info */}
                <Box
                // sx={{
                //   flex: 1,
                //   display: "flex",
                //   flexDirection: "column",
                //   gap: 3,
                // }}
                >
                  {/* Battle info */}
                  {/* <Box
                    sx={{
                      padding: 2,
                      border: "1px solid #ccc",
                      borderRadius: 2,
                      backgroundColor: "#F5F5F5",
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{
                        textAlign: "center",
                        padding: "8px",
                        borderBottom: "1px dashed #ccc",
                        marginBottom: 2,
                      }}
                    >
                      Battle Status
                    </Typography>

                    <Box sx={{ marginBottom: 2 }}>
                      <Typography fontWeight={600}>
                        Current Question:
                      </Typography>
                      <Typography>
                        {questionNumber} of {totalQuestions}
                      </Typography>
                    </Box>

                    <Box sx={{ marginBottom: 2 }}>
                      <Typography fontWeight={600}>Your Score:</Typography>
                      <Typography>{playerScore} points</Typography>
                    </Box>

                    <Box>
                      <Typography fontWeight={600}>Opponent Score:</Typography>
                      <Typography>{opponentScore} points</Typography>
                    </Box>
                  </Box> */}
                  {/* {question && (
                    <Box
                      sx={{
                        padding: 2,
                        border: "1px solid #ccc",
                        borderRadius: 2,
                        backgroundColor: "#FFF8E1",
                      }}
                    >
                      <Typography
                        fontWeight={600}
                        sx={{ textAlign: "center", marginBottom: 1 }}
                      >
                        Question Type
                      </Typography>
                      <Typography sx={{ textAlign: "center" }}>
                        {question.type === "MULTIPLE_CHOICE" &&
                          "Single Choice Question"}
                        {question.type === "MULTI_SELECT" &&
                          "Multiple Choice Question"}
                        {question.type === "FILL_IN_THE_BLANK" &&
                          "Fill in the Blank"}
                      </Typography>
                    </Box>
                  )} */}

                  {/* Current status */}
                  {/* <Box
                    sx={{
                      padding: 2,
                      border: "1px solid #ccc",
                      borderRadius: 2,
                      backgroundColor: isAnswered ? "#E8F5E9" : "#FFF8E1",
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, textAlign: "center" }}>
                      {isAnswered
                        ? "Waiting for opponent's answer..."
                        : "Choose an answer before time runs out!"}
                    </Typography>
                  </Box> */}
                </Box>
              </Box>
            </Box>
          )}

          {/* Battle ended - basic finished message */}
          {finished && !showResultDialog && (
            <>
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
                <Typography sx={{ fontSize: "20px" }}>
                  Trận đấu đã kết thúc!
                </Typography>
                <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>
                  {winner === userInfo?.userId
                    ? "Chiến thắng! 🏆"
                    : "Thua rồi! Hãy thử lại lần sau nhé! 😢"}
                </Typography>
                <Button
                  onClick={() => router.push("/battle-home")}
                  sx={{
                    backgroundColor: "#757575",
                    color: "white",
                    "&:hover": { backgroundColor: "#616161" },
                  }}
                  variant="outlined"
                >
                  Trở về
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* Results Dialog */}
      <Dialog
        open={showResultDialog}
        onClose={() => setShowResultDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Typography variant="h5" align="center" fontWeight={600}>
            Kết quả trận đấu
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ marginBottom: 4 }}>
            <Box
              sx={{
                padding: 3,
                backgroundColor:
                  winner === userInfo?.userId ? "#E8F5E9" : "#FFEBEE",
                borderRadius: 2,
                textAlign: "center",
                marginBottom: 3,
              }}
            >
              <Typography variant="h5" fontWeight={600}>
                {winner === userInfo?.userId
                  ? "Chúc mừng! Bạn chiến thắng 🏆"
                  : "Chúc bạn may mắn lần sau nhé! 🎮"}
              </Typography>
            </Box>
            <Box
              sx={{
                // display: "flex",
                // justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              {/* <Typography sx={{ textAlign: "center" }} variant="h6">
                Điểm
              </Typography> */}
              <Box
                sx={{
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    padding: 2,
                  }}
                >
                  <Avatar
                    src={playerInfo?.avatar || ""}
                    alt={playerInfo?.username || "You"}
                    sx={{ width: 40, height: 40, mx: "auto", mb: 1 }}
                  />
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography fontWeight={600}>
                      {playerInfo?.username || "You"}
                    </Typography>
                    <Typography>
                      Số câu trả lời đúng: {playerInfo?.correctAnswers || 0}
                    </Typography>

                    <Typography>
                      Số câu trả lời sai: {playerInfo?.incorrectAnswers || 0}
                    </Typography>
                    <Typography>Điểm: {playerScore}</Typography>
                  </Box>
                </Box>
                <Typography variant="h5" sx={{ alignSelf: "center" }}>
                  vs
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    padding: 2,
                  }}
                >
                  <Avatar
                    src={opponentInfo?.avatar || ""}
                    alt={opponentInfo?.username || "Opponent"}
                    sx={{ width: 40, height: 40, mx: "auto", mb: 1 }}
                  />
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography fontWeight={600}>
                      {opponentInfo?.username || "Opponent"}
                    </Typography>
                    <Typography>
                      Số câu trả lời đúng: {opponentInfo?.correctAnswers || 0}
                    </Typography>
                    <Typography>
                      Số câu trả lời sai: {opponentInfo?.incorrectAnswers || 0}
                    </Typography>
                    <Typography>Điểm: {opponentScore}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {battleResults && battleResults.questions && (
              <Box>
                <Typography variant="h6" sx={{ marginBottom: 2 }}>
                  Question Summary
                </Typography>
                <Divider sx={{ marginBottom: 2 }} />

                {battleResults.questions.map((question: any, index: number) => (
                  <Box
                    key={index}
                    sx={{
                      padding: 2,
                      backgroundColor: question.correct ? "#E8F5E9" : "#FFEBEE",
                      borderRadius: 2,
                      marginBottom: 2,
                    }}
                  >
                    <Typography fontWeight={600}>
                      Question {index + 1}: {question.content}
                    </Typography>
                    <Typography sx={{ marginTop: 1 }}>
                      Your answer:{" "}
                      <span style={{ fontWeight: 600 }}>
                        {question.userAnswer || "No answer"}
                      </span>
                    </Typography>
                    <Typography>
                      Correct answer:{" "}
                      <span style={{ fontWeight: 600 }}>
                        {question.correctAnswer}
                      </span>
                    </Typography>
                    <Typography sx={{ marginTop: 1, fontWeight: 600 }}>
                      {question.correct ? "Correct ✓" : "Incorrect ✗"}
                    </Typography>
                    {question.timeTaken && (
                      <Typography variant="body2" color="text.secondary">
                        Time taken: {question.timeTaken} seconds
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => router.push("/battle-home")}
            sx={{
              backgroundColor: "#757575",
              color: "white",
              "&:hover": { backgroundColor: "#616161" },
            }}
            variant="outlined"
          >
            Trở về
          </Button>
          {/* <Button
            onClick={() => router.push("/battle")}
            sx={{
              backgroundColor: "#99BC4D",
              color: "white",
              "&:hover": { backgroundColor: "#7A9F38" },
              marginRight: 2,
            }}
          >
            Trận đấu mới
          </Button> */}
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
