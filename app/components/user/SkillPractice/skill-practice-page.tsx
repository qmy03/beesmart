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
  const router = useRouter();
  const { quizId } = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  // const [answers, setAnswers] = useState([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { accessToken } = useAuth();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [quizDuration, setQuizDuration] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);

  const handleOpenConfirm = () => {
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmDialogOpen(false);
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
        router.push(`/skill/${response.data.data.recordId}`);
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

  if (loading) {
    return (
      <Layout>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "#EFF3E6",
          }}
        >
          <Typography variant="h5">Loading questions...</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#EFF3E6",
          padding: "40px 120px",
          height: "100%",
          // alignItem: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            // padding: "40px",
            // alignItems: "center",
            // justifyContent: "space-between",
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
            Luyện tập Quiz
          </Typography>
          <Divider />
          {/* Timer */}

          {/* Left Section: Question Area */}
          <Box sx={{}}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center", // To align the left and right sections
                padding: "40px",
                gap: "20px",
                // backgroundColor: "#EFF3E6",
                // alignItems: "flex-start",
              }}
            >
              <Box
                sx={{
                  flex: 3,
                  display: "flex",
                  flexDirection: "column",
                  // alignItems: "center",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                }}
              >
                {/* Question display */}
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography
                    fontSize="16px"
                    fontWeight={700}
                    sx={{
                      padding: "8px 20px",
                      backgroundColor: "#99BC4D",
                      borderTopLeftRadius: "16px",
                      borderTopRightRadius: "16px",
                      color: "#fff",
                    }}
                  >
                    Câu hỏi số {currentPage + 1}
                  </Typography>
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
                    {/* Render the different question types (radio, checkbox, text input) */}
                    <FormControl
                      component="fieldset"
                      // sx={{ alignItems: "center" }}
                    >
                      {/* {question.image && (
                        <img
                          src={question.image}
                          alt="Question"
                          style={{ maxWidth: "300px" }}
                        />
                      )} */}
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
                            .filter((option: string) => option.trim() !== "")
                            .map((option: string, index: number) => (
                              <FormControlLabel
                                key={index}
                                value={index.toString()}
                                control={<Radio disabled={timeLeft === 0} />}
                                label={option}
                                sx={{
                                  "& .MuiTypography-root": { fontSize: "16px" },
                                }}
                              />
                            ))}
                        </RadioGroup>
                      )}

                      {question.questionType === "MULTI_SELECT" && (
                        <Box>
                          {question.options
                            .filter((option) => option.trim() !== "") // Filter out empty options
                            .map((option, index) => (
                              <FormControlLabel
                                key={index}
                                sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  "& .MuiTypography-root": { fontSize: "16px" }, // Sửa fontSize của label
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
                      const answer = answers[index]; // Get the answer object first
                      const isAnswered =
                        answer &&
                        (answer.inputAnswer ||
                          (answer.selectedAnswers &&
                            answer.selectedAnswers.length > 0) ||
                          answer.selectedAnswerIndex !== undefined);
                      const isCurrent = index === currentPage;

                      return (
                        <Button
                          key={index}
                          variant="contained"
                          onClick={() => setCurrentPage(index)}
                          sx={{
                            backgroundColor: isCurrent
                              ? isAnswered
                                ? "#99BC4D"
                                : "#FF9900"
                              : isAnswered
                                ? "#99BC4D"
                                : "transparent",
                            color: isCurrent
                              ? isAnswered
                                ? "#fff"
                                : "#fff"
                              : isAnswered
                                ? "#fff"
                                : "#000",
                            "&:hover": {
                              backgroundColor: isCurrent
                                ? isAnswered
                                  ? "#7A9F38"
                                  : "#FF7A00"
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
                  onClick={handleConfirm}
                  disabled={timeLeft === 0}
                  sx={{
                    textTransform: "none",
                    ":hover": { backgroundColor: "#99BC4D" },
                    color: "#FFF",
                  }}
                >
                  Nộp bài
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
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
      {/* <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="lg"
      >
        {dialogOpen && quizResult && (
          <Box
            sx={{
              paddingX: "20px",
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <DialogTitle>
              <Typography
                fontSize="20px"
                fontWeight={600}
                textAlign="center"
                gutterBottom
              >
                Kết quả bài quiz
              </Typography>
            </DialogTitle>
            <Typography>Số điểm: {quizResult.points}/10</Typography>
            <Typography>
              Số câu đúng: {quizResult.correctAnswers}/
              {quizResult.totalQuestions}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {quizResult.questions.map((question: any, index: number) => (
              <Box
                key={index}
                sx={{
                  marginBottom: "16px",
                  padding: "12px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Câu {index + 1}: {question.content}
                </Typography>

                {question.image && (
                  <img
                    src={question.image}
                    alt="Question"
                    style={{
                      maxWidth: "100%",
                      marginTop: "10px",
                      marginBottom: "10px",
                      borderRadius: "5px",
                    }}
                  />
                )}

                {question.options &&
                  question.options.length > 0 &&
                  !question.correctAnswers &&
                  question.options.map((option: string, optIndex: number) => {
                    const isCorrect = question.correctAnswer === option;
                    const isUserAnswer = question.userAnswer === option;

                    return (
                      <Typography
                        key={optIndex}
                        sx={{
                          padding: "4px 8px",
                          marginBottom: "4px",
                          borderRadius: "5px",
                          backgroundColor: isCorrect
                            ? "#99BC4D"
                            : isUserAnswer
                              ? "#FFCCCB"
                              : "transparent",
                          textDecoration:
                            isUserAnswer && !isCorrect
                              ? "line-through"
                              : "none",
                        }}
                      >
                        {option}
                      </Typography>
                    );
                  })}

                {question.correctAnswers &&
                  question.correctAnswers.length > 0 &&
                  question.options &&
                  question.options.length > 0 && (
                    <Box>
                      {question.options &&
                        [...new Set(question.options as string[])].map(
                          (option: string, optIndex: number) => {
                            const isCorrect =
                              question.correctAnswers.includes(option);
                            const isUserAnswer =
                              question.answers?.includes(option);
                            const isIncorrectUserAnswer =
                              isUserAnswer && !isCorrect;

                            return (
                              <Typography
                                key={optIndex}
                                sx={{
                                  padding: "4px 8px",
                                  marginBottom: "4px",
                                  borderRadius: "5px",
                                  backgroundColor: isCorrect
                                    ? "#99BC4D"
                                    : isIncorrectUserAnswer
                                      ? "#FFCCCB"
                                      : "transparent",
                                  textDecoration: isIncorrectUserAnswer
                                    ? "line-through"
                                    : "none",
                                }}
                              >
                                {option}
                              </Typography>
                            );
                          }
                        )}
                    </Box>
                  )}

                {!question.options && question.correctAnswers && (
                  <Box>
                    {question.correctAnswers.map(
                      (correctAnswer: string, ansIndex: number) => {
                        const isCorrect =
                          question.userAnswer?.toLowerCase() ===
                          correctAnswer.toLowerCase();
                        const isIncorrectUserAnswer =
                          question.userAnswer && !isCorrect;

                        return (
                          <Typography
                            key={ansIndex}
                            sx={{
                              padding: "4px 8px",
                              marginBottom: "4px",
                              borderRadius: "5px",
                              backgroundColor: isCorrect
                                ? "#99BC4D"
                                : isIncorrectUserAnswer
                                  ? "#FFCCCB"
                                  : "transparent",
                              textDecoration: isIncorrectUserAnswer
                                ? "line-through"
                                : "none",
                            }}
                          >
                            {correctAnswer}
                          </Typography>
                        );
                      }
                    )}
                  </Box>
                )}

                {!question.correct && (
                  <Box sx={{ marginTop: "12px" }}>
                    <Typography variant="body1" fontWeight={600}>
                      Câu trả lời của bạn:
                    </Typography>
                    <Typography
                      sx={{
                        padding: "4px 8px",
                        backgroundColor: "#FFCCCB",
                        borderRadius: "5px",
                      }}
                    >
                      {question.answers
                        ? question.answers.join(", ")
                        : question.userAnswer}
                    </Typography>

                    <Typography
                      variant="body1"
                      fontWeight={600}
                      sx={{ marginTop: "8px" }}
                    >
                      Câu trả lời đúng:
                    </Typography>
                    <Typography
                      sx={{
                        padding: "4px 8px",
                        backgroundColor: "#99BC4D",
                        borderRadius: "5px",
                      }}
                    >
                      {question.correctAnswers
                        ? question.correctAnswers.join(", ")
                        : question.correctAnswer}
                    </Typography>
                  </Box>
                )}

                <Typography
                  sx={{
                    fontWeight: "bold",
                    color: question.correct ? "green" : "red",
                  }}
                >
                  {question.correct ? "Đúng" : "Sai"}
                </Typography>
              </Box>
            ))}
            <DialogActions>
              <Button
                variant="contained"
                color="primary"
                sx={{
                  marginTop: "20px",
                  textTransform: "none",
                  ":hover": { backgroundColor: "#99BC4D" },
                  color: "#FFF",
                  alignItems: "center",
                }}
                onClick={() => router.push(`/skill-list`)}
              >
                Hoàn thành
              </Button>
            </DialogActions>
          </Box>
        )}
      </Dialog> */}
    </Layout>
  );
};

export default SkillPracticePage;
