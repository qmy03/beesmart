"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  Checkbox,
  Divider,
  Button,
} from "@mui/material";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import FlagIcon from "@mui/icons-material/Flag";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/AuthContext";
import TextField from "../../textfield";
import { Key } from "@mui/icons-material";

interface Question {
  questionId: string;
  content: string;
  questionType: "MULTIPLE_CHOICE" | "MULTI_SELECT" | "FILL_IN_THE_BLANK";
  options: string[];
  image?: string;
}

interface Answer {
  selectedAnswerIndex?: number;
  selectedAnswers?: number[];
  inputAnswer?: string;
}

interface QuizResponse {
  data: {
    questions: Question[];
    quizDuration: number;
  };
}

interface QuizResult {
  points: number;
  correctAnswers: number;
  totalQuestions: number;
  questions: Array<{
    content: string;
    image?: string;
    options?: string[];
    correctAnswer?: string;
    correctAnswers?: string[];
    userAnswer?: string;
    answers?: string[];
    correct: boolean;
  }>;
}

interface SubmitResponse {
  data: QuizResult;
}

const SkillPracticePage = () => {
  const accessToken = localStorage.getItem("accessToken");
  const router = useRouter();
  const { quizId } = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [warningDialogOpen, setWarningDialogOpen] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [quizDuration, setQuizDuration] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);

  // Check if all questions are answered
  const checkAllQuestionsAnswered = () => {
    return questions.every((question, index) => {
      const answer = answers[index];
      if (!answer) return false;

      switch (question.questionType) {
        case "MULTIPLE_CHOICE":
          return answer.selectedAnswerIndex !== undefined;
        case "MULTI_SELECT":
          return answer.selectedAnswers && answer.selectedAnswers.length > 0;
        case "FILL_IN_THE_BLANK":
          return answer.inputAnswer && answer.inputAnswer.trim() !== "";
        default:
          return false;
      }
    });
  };

  const handleOpenConfirm = () => {
    // Check if all questions are answered and there's still time left
    if (timeLeft > 0 && !checkAllQuestionsAnswered()) {
      setWarningDialogOpen(true);
      return;
    }
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmDialogOpen(false);
  };

  const handleCloseWarning = () => {
    setWarningDialogOpen(false);
  };

  const handleNext = () => {
    if (currentPage < questions.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleFlagToggle = (questionIndex: number) => {
    const updatedFlags = [...flaggedQuestions];
    updatedFlags[questionIndex] = !updatedFlags[questionIndex];
    setFlaggedQuestions(updatedFlags);
  };

  const question = questions[currentPage];

  useEffect(() => {
    if (isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted]);

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = { selectedAnswerIndex: answerIndex };
    setAnswers(updatedAnswers);
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (quizId) {
      setLoading(true);
      apiService
        .get<QuizResponse>(`/quizzes/${quizId}/get-questions`)
        .then((response) => {
          console.log("responseQ", response);
          setQuestions(response.data.data.questions);
          setFlaggedQuestions(
            new Array(response.data.data.questions.length).fill(false)
          );

          const duration = response.data.data.quizDuration || 10;
          setQuizDuration(duration);
          setTimeLeft(duration * 60);
        })
        .catch((error) => {
          console.error("Error fetching questions:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [quizId]);

  const handleSubmit = () => {
    if (isSubmitted) return;

    const totalQuizTime = quizDuration * 60;
    const timeSpent = totalQuizTime - timeLeft;

    const payload = {
      timeSpent,
      answers: answers
        .map((answer, index) => {
          const question = questions[index];
          if (question.questionType === "MULTIPLE_CHOICE") {
            return {
              questionId: question.questionId,
              selectedAnswer: question.options[answer.selectedAnswerIndex!],
            };
          } else if (question.questionType === "MULTI_SELECT") {
            return {
              questionId: question.questionId,
              selectedAnswers:
                answer.selectedAnswers?.map(
                  (idx: number) => question.options[idx]
                ) || [],
            };
          } else if (question.questionType === "FILL_IN_THE_BLANK") {
            return {
              questionId: question.questionId,
              selectedAnswer: answer.inputAnswer,
            };
          }
          return null;
        })
        .filter(Boolean),
    };

    console.log("payload", payload);

    apiService
      .post<SubmitResponse>(`/quizzes/${quizId}/submit-quiz`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        console.log("Quiz submitted successfully", response.data);
        setQuizResult(response.data.data);
        setRecordId(response.data.data.recordId);
        setDialogOpen(true);
        setIsSubmitted(true);
        handleCloseConfirm();
        router.push(`/skill-test/${response.data.data.recordId}`);
      })
      .catch((error) => {
        console.error(
          "Error submitting quiz:",
          error.response?.data || error.message
        );
      });
  };

  useEffect(() => {
    if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  // if (loading) {
  //   return (
  //     <Layout>
  //       <Box
  //         sx={{
  //           display: "flex",
  //           flexDirection: "column",
  //           alignItems: "center",
  //           justifyContent: "center",
  //           height: "100vh",
  //           backgroundColor: "#EFF3E6",
  //         }}
  //       >
  //         <Typography variant="h5">Loading questions...</Typography>
  //       </Box>
  //     </Layout>
  //   );
  // }

  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#EFF3E6",
          padding: "40px 120px",
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
          {loading ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100vh",
                }}
              >
                <Typography>Đang tải câu hỏi...</Typography>
              </Box>
            </>
          ) : (
            <>
              <Typography
                sx={{
                  fontSize: "32px",
                  fontWeight: "600",
                  textAlign: "center",
                  paddingY: "8px",
                }}
              >
                Luyện tập Quiz
              </Typography>
              <Divider />

              <Box sx={{}}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "40px",
                    gap: "20px",
                  }}
                >
                  <Box
                    sx={{
                      flex: 3,
                      display: "flex",
                      flexDirection: "column",
                      border: "1px solid #ccc",
                      borderRadius: 4,
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
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
                          Câu hỏi số {currentPage + 1}
                        </Typography>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={flaggedQuestions[currentPage] || false}
                              onChange={() => handleFlagToggle(currentPage)}
                              icon={<FlagIcon sx={{ color: "white" }} />}
                              checkedIcon={
                                <FlagIcon sx={{ color: "#F8AC59" }} />
                              }
                              sx={{ color: "white" }}
                            />
                          }
                          label="Đang cân nhắc"
                          sx={{
                            color: "white",
                            "& .MuiTypography-root": { fontSize: "14px" },
                          }}
                        />
                      </Box>
                      <Divider />
                      <Box
                        sx={{
                          marginBottom: "20px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                          padding: "20px",
                        }}
                      >
                        <Typography fontSize="16px" fontWeight={700}>
                          {question.content}
                        </Typography>
                        <FormControl
                          component="fieldset"
                          sx={{ alignItems: "center" }}
                        >
                          {question.image && (
                            <img
                              src={question.image}
                              alt="Question"
                              style={{ maxWidth: "300px" }}
                            />
                          )}
                        </FormControl>
                        <FormControl component="fieldset">
                          {question.questionType === "FILL_IN_THE_BLANK" && (
                            <TextField
                              value={answers[currentPage]?.inputAnswer || ""}
                              onChange={(e) => {
                                const updatedAnswers = [...answers];
                                updatedAnswers[currentPage] = {
                                  inputAnswer: e.target.value,
                                };
                                setAnswers(updatedAnswers);
                              }}
                              sx={{ width: "30%", bgcolor: "white" }}
                              disabled={timeLeft === 0}
                            />
                          )}
                          {question.questionType === "MULTIPLE_CHOICE" && (
                            <RadioGroup
                              value={
                                answers[currentPage]?.selectedAnswerIndex ?? -1
                              }
                              onChange={(e) =>
                                handleAnswerChange(
                                  currentPage,
                                  parseInt(e.target.value)
                                )
                              }
                              sx={{ display: "flex", flexDirection: "column" }}
                            >
                              {question.options
                                .filter(
                                  (option: string) => option.trim() !== ""
                                )
                                .map((option: string, index: number) => (
                                  <FormControlLabel
                                    key={index}
                                    value={index.toString()}
                                    control={
                                      <Radio disabled={timeLeft === 0} />
                                    }
                                    label={option}
                                    sx={{
                                      "& .MuiTypography-root": {
                                        fontSize: "16px",
                                      },
                                    }}
                                  />
                                ))}
                            </RadioGroup>
                          )}

                          {question.questionType === "MULTI_SELECT" && (
                            <Box>
                              {question.options
                                .filter((option) => option.trim() !== "")
                                .map((option, index) => (
                                  <FormControlLabel
                                    key={index}
                                    sx={{
                                      display: "flex",
                                      flexDirection: "row",
                                      "& .MuiTypography-root": {
                                        fontSize: "16px",
                                      },
                                    }}
                                    control={
                                      <Checkbox
                                        checked={
                                          answers[
                                            currentPage
                                          ]?.selectedAnswers?.includes(index) ||
                                          false
                                        }
                                        onChange={(e) => {
                                          const updatedAnswers = [...answers];
                                          const selectedAnswers =
                                            updatedAnswers[currentPage]
                                              ?.selectedAnswers || [];
                                          if (e.target.checked) {
                                            selectedAnswers.push(index);
                                          } else {
                                            const idx =
                                              selectedAnswers.indexOf(index);
                                            if (idx > -1)
                                              selectedAnswers.splice(idx, 1);
                                          }
                                          updatedAnswers[currentPage] = {
                                            selectedAnswers,
                                          };
                                          setAnswers(updatedAnswers);
                                        }}
                                      />
                                    }
                                    label={option}
                                  />
                                ))}
                            </Box>
                          )}
                        </FormControl>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "20px",
                          paddingX: "20px",
                        }}
                      >
                        <Button
                          variant="outlined"
                          onClick={handlePrevious}
                          disabled={currentPage === 0}
                          sx={{ textTransform: "none" }}
                        >
                          <KeyboardDoubleArrowLeftIcon /> Câu hỏi trước
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={handleNext}
                          disabled={currentPage === questions.length - 1}
                          sx={{ textTransform: "none" }}
                        >
                          Câu hỏi sau <KeyboardDoubleArrowRightIcon />
                        </Button>
                      </Box>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      flex: 1,
                      width: "250px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                      backgroundColor: "#fff",
                    }}
                  >
                    <Typography
                      sx={{
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        border: "1px solid #ccc",
                        padding: "8px",
                        bgcolor: "#99BC4D",
                        color: "#fff",
                      }}
                      fontSize="24px"
                    >
                      <AccessAlarmIcon sx={{ fontSize: "24px" }} />{" "}
                      {formatTime(timeLeft)}
                    </Typography>
                    <Box
                      sx={{
                        padding: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        border: "1px solid #ccc",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                          textAlign: "center",
                          borderBottom: "1px dashed #ccc",
                          padding: "8px",
                        }}
                      >
                        Danh sách câu hỏi
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          gap: "8px",
                          marginY: "20px",
                          flexWrap: "wrap",
                        }}
                      >
                        {questions.map((_, index) => {
                          const answer = answers[index];
                          const isAnswered =
                            answer &&
                            (answer.inputAnswer ||
                              (answer.selectedAnswers &&
                                answer.selectedAnswers.length > 0) ||
                              answer.selectedAnswerIndex !== undefined);
                          const isCurrent = index === currentPage;
                          const isFlagged = flaggedQuestions[index];

                          return (
                            <Button
                              key={index}
                              variant="contained"
                              onClick={() => setCurrentPage(index)}
                              sx={{
                                backgroundColor: isCurrent
                                  ? "#6593DA"
                                  : isFlagged
                                    ? "#F8AC59"
                                    : isAnswered
                                      ? "#99BC4D"
                                      : "transparent",
                                color:
                                  isCurrent || isFlagged || isAnswered
                                    ? "#fff"
                                    : "#000",
                                border:
                                  !isCurrent && !isFlagged && !isAnswered
                                    ? "1px solid #ccc"
                                    : "none",
                                "&:hover": {
                                  backgroundColor: isCurrent
                                    ? "#5A7BC4"
                                    : isFlagged
                                      ? "#E89A48"
                                      : isAnswered
                                        ? "#7A9F38"
                                        : "#D9D9D9",
                                },
                              }}
                            >
                              {index + 1}
                            </Button>
                          );
                        })}
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleOpenConfirm}
                      disabled={timeLeft === 0}
                      sx={{
                        textTransform: "none",
                        ":hover": { backgroundColor: "#99BC4D" },
                        color: "#FFF",
                      }}
                    >
                      Nộp bài
                    </Button>
                    <Box
                      sx={{
                        padding: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        border: "1px solid #ccc",
                        borderRadius: 2,
                      }}
                    >
                      {/* Chú thích màu sắc */}
                      <Box sx={{ padding: "0 8px", fontSize: "12px" }}>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          sx={{
                            textAlign: "center",
                            borderBottom: "1px dashed #ccc",
                            padding: "8px",
                          }}
                        >
                          Chú thích
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.5,
                          }}
                        >
                          <Box
                            sx={{
                              paddingTop: "8px",
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                bgcolor: "transparent",
                                border: "1px solid #ccc",
                                borderRadius: 2,
                              }}
                            />
                            <Typography variant="caption">
                              Câu hỏi chưa trả lời
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                borderRadius: 2,
                                bgcolor: "#6593DA",
                              }}
                            />
                            <Typography variant="caption">
                              Câu hỏi hiện tại
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                borderRadius: 2,
                                bgcolor: "#F8AC59",
                              }}
                            />
                            <Typography variant="caption">
                              Câu hỏi đang cân nhắc
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                borderRadius: 2,
                                bgcolor: "#99BC4D",
                              }}
                            />
                            <Typography variant="caption">
                              Câu hỏi đã trả lời
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* Warning Dialog - when not all questions are answered */}
      <Dialog
        open={warningDialogOpen}
        onClose={handleCloseWarning}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Typography fontSize="18px" fontWeight={600} textAlign="center">
            Thông báo
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography textAlign="center">
            Xin lỗi không thể hoàn thành bài kiểm tra khi chưa trả lời hết câu
            hỏi.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCloseWarning}
            sx={{ textTransform: "none", backgroundColor: "#99BC4D" }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog - when all questions are answered */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirm}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Typography fontSize="18px" fontWeight={600} textAlign="center">
            Xác nhận nộp bài
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography textAlign="center">
            Bạn có chắc chắn muốn nộp bài không?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button
            variant="outlined"
            onClick={handleCloseConfirm}
            sx={{ textTransform: "none", mr: 2 }}
          >
            Không
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ textTransform: "none", backgroundColor: "#99BC4D" }}
          >
            Có
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default SkillPracticePage;
