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

export default function BattleDetailPage() {
  const { accessToken, userInfo } = useAuth();
  const { battleId } = useParams();
  const router = useRouter();

  // Battle state
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

  // Player and opponent info
  const [playerInfo, setPlayerInfo] = useState<any>(null);
  const [opponentInfo, setOpponentInfo] = useState<any>(null);

  // Loading state
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  useEffect(() => {
    if (!accessToken || !battleId || !userInfo?.userId) return;

    const fetchBattleInfo = async () => {
      try {
        const response = await apiService.get(`/battles/${battleId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const battleData = response.data.data;

        console.log("Battle data:", battleData); // Debugging line
        setBattleInfo(battleData);

        // Set player and opponent info
        if (battleData.players && battleData.players.length >= 2) {
          const currentPlayer = battleData.players.find(
            (p: any) => p.userId === userInfo.userId
          );
          const opponent = battleData.players.find(
            (p: any) => p.userId !== userInfo.userId
          );

          setPlayerInfo(currentPlayer);
          setOpponentInfo(opponent);
          console.log("Opponent info:", opponent); // Debugging line

          fetchFirstQuestion();
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
        console.log("WebSocket message received:", msg); // Add this for debugging

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
            // Update battleInfo state if needed but don't overwrite existing data
            if (msg.battleId) {
              console.log("Battle joined/started:", msg.battleId);
            }
            break;
          case "WAITING_FOR_OPPONENT":
            // Just a status update, no action needed
            break;
          default:
            // Handle battle state update message (no specific type)
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
    setSelectedAnswers([]); // Reset selected answers for multi-select questions
    setTextAnswer(""); // Reset text answer for fill-in-the-blank questions

    // Update question number if provided
    if (msg.currentQuestion !== undefined) {
      setQuestionNumber(msg.currentQuestion);
    }
    if (msg.totalQuestions !== undefined) {
      setTotalQuestions(msg.totalQuestions);
    }

    // Reset timer for new question
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);

          // Store the current question in a variable to use in the timeout
          const currentQuestion = msg.question;

          // Use setTimeout to ensure state updates have completed
          setTimeout(() => {
            // Check if we've already answered and if we have a valid question
            if (!isAnswered && currentQuestion?.questionId) {
              console.log("⏰ Timer expired. Sending null answer...");

              // Call handleAnswer directly instead of relying on state
              // that might not be updated yet
              handleTimeExpiredAnswer(currentQuestion);
            }
          }, 100);

          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  };

  // Add a new function specifically for handling time expired answers
  const handleTimeExpiredAnswer = async (currentQuestion: any) => {
    if (!currentQuestion || !userInfo?.userId) return;

    console.log(
      "Handling time expired answer for question:",
      currentQuestion.questionId
    );

    try {
      // Set isAnswered to true to prevent multiple submissions
      setIsAnswered(true);

      const timeTaken = 30; // Full time used

      let payload = {
        userId: userInfo.userId,
        questionId: currentQuestion.questionId,
        answer: null, // Always send null when time expires
        timeTaken,
      };

      console.log("Submitting time-expired null answer:", payload);
      const res = await apiService.post(`/battles/${battleId}/answer`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("Time-expired answer submitted successfully:", res);
    } catch (error) {
      console.error("Error submitting time-expired answer:", error);
      setError("Failed to submit answer");
    }
  };
  useEffect(() => {
    // Cleanup timer when component unmounts
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const updateScores = (msg: any) => {
    if (msg.playerScores && userInfo?.userId) {
      const myScore = msg.playerScores.find(
        (p: any) => p.userId === userInfo.userId
      );
      const opponent = msg.playerScores.find(
        (p: any) => p.userId !== userInfo.userId
      );

      setPlayerScore(myScore?.score || 0);
      setOpponentScore(opponent?.score || 0);
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
          answers: selectedOptions,  // Use answers field for arrays
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
      await apiService.post(`/battles/${battleId}/answer`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
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
      return winner === userInfo?.userId ? "You won! 🏆" : "You lost! 😢";
    }

    if (isAnswered) {
      return "Waiting for opponent...";
    }

    return "Battle in progress";
  };

  const formatTime = (seconds: number) => {
    return `${seconds.toString().padStart(2, "0")}`;
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
          }}
        >
          <Typography
            sx={{
              fontSize: "32px",
              fontWeight: "600",
              textAlign: "center",
              paddingY: "8px",
            }}
          >
            Battle Quiz
          </Typography>
          <Divider />

          {error && (
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
          )}

          {/* Battle Header - Scores */}
          {battleInfo && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                padding: "16px 40px",
                borderBottom: "1px solid #E0E0E0",
              }}
            >
              <Box
                sx={{
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography fontWeight={700}>You</Typography>
                <Avatar
                  src={playerInfo?.avatar || ""}
                  alt={playerInfo?.username || "You"}
                  sx={{ width: 50, height: 50, mb: 1 }}
                />
                <Typography sx={{ fontSize: "24px" }}>{playerScore}</Typography>
              </Box>

              <Box sx={{ textAlign: "center" }}>
                <Typography fontWeight={700} sx={{ fontSize: "20px" }}>
                  {battleInfo.battleId}
                </Typography>
                <Typography>{getPlayerStatus()}</Typography>
              </Box>

              <Box
                sx={{
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography fontWeight={700}>Opponent</Typography>
                <Avatar
                  src={opponentInfo?.avatar || ""}
                  alt={opponentInfo?.username || "Opponent"}
                  sx={{ width: 50, height: 50, mb: 1 }}
                />
                <Typography sx={{ fontSize: "24px" }}>
                  {opponentScore}
                </Typography>
              </Box>
            </Box>
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
                Waiting for opponent to join...
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
                {loadingQuestion ? "Loading..." : "Refresh Battle"}
              </Button>
            </Box>
          )}

          {/* Question section */}
          {battleInfo?.status === "ONGOING" && !finished && (
            <Box sx={{ padding: { xs: "20px", md: "40px" } }}>
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
                    flex: 3,
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
                      Question {questionNumber}/{totalQuestions}
                    </Typography>
                    <Box
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
                    </Box>
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
                            Select all correct answers:
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
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                  }}
                >
                  {/* Timer display */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "12px",
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

                  {/* Battle info */}
                  <Box
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
                  </Box>
                  {question && (
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
                  )}

                  {/* Current status */}
                  <Box
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
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {/* Battle ended - basic finished message */}
          {finished && !showResultDialog && (
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
              <Typography sx={{ fontSize: "20px", marginBottom: 2 }}>
                Battle finished!
              </Typography>
              <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>
                {winner === userInfo?.userId
                  ? "You won! 🏆"
                  : "You lost! Try again next time! 😢"}
              </Typography>
            </Box>
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
            Battle Results
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ marginBottom: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <Typography variant="h6">Final Score</Typography>
              <Box sx={{ display: "flex", gap: 4, alignItems: "center" }}>
                <Box sx={{ textAlign: "center" }}>
                  <Avatar
                    src={playerInfo?.avatar || ""}
                    alt={playerInfo?.username || "You"}
                    sx={{ width: 40, height: 40, mx: "auto", mb: 1 }}
                  />
                  <Typography fontWeight={600}>
                    {playerInfo?.username || "You"}
                  </Typography>
                  <Typography variant="h4">{playerScore}</Typography>
                </Box>
                <Typography variant="h5" sx={{ alignSelf: "center" }}>
                  vs
                </Typography>
                <Box sx={{ textAlign: "center" }}>
                  <Avatar
                    src={opponentInfo?.avatar || ""}
                    alt={opponentInfo?.username || "Opponent"}
                    sx={{ width: 40, height: 40, mx: "auto", mb: 1 }}
                  />
                  <Typography fontWeight={600}>
                    {opponentInfo?.username || "Opponent"}
                  </Typography>
                  <Typography variant="h4">{opponentScore}</Typography>
                </Box>
              </Box>
            </Box>

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
                  ? "Congratulations! You Won! 🏆"
                  : "Better luck next time! 🎮"}
              </Typography>
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
            onClick={() => router.push("/battle")}
            sx={{
              backgroundColor: "#99BC4D",
              color: "white",
              "&:hover": { backgroundColor: "#7A9F38" },
              marginRight: 2,
            }}
          >
            New Battle
          </Button>
          <Button
            onClick={() => router.push("/")}
            sx={{
              backgroundColor: "#757575",
              color: "white",
              "&:hover": { backgroundColor: "#616161" },
            }}
          >
            Return Home
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
