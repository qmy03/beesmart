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
// import { Button } from "../../button";
import TextField from "../../textfield";
import { Key } from "@mui/icons-material";
const SkillPracticePage = () => {
  const router = useRouter();
  const { quizId } = useParams();
  const [questions, setQuestions] = useState<any[]>([]);
  // const [answers, setAnswers] = useState<any[]>([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(0); // 10 minutes in seconds
  const { accessToken } = useAuth();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [quizDuration, setQuizDuration] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleTextFieldChange = (e) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentPage] = {
      inputAnswer: e.target.value,
    };
    setAnswers(updatedAnswers);
  };
  const handleRadioChange = (e) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentPage] = {
      selectedAnswerIndex: e.target.value,
    };
    setAnswers(updatedAnswers);
  };

  // Hàm xử lý khi Checkbox thay đổi
  const handleCheckboxChange = (index, e) => {
    const updatedAnswers = [...answers];
    const selectedAnswers = updatedAnswers[currentPage]?.selectedAnswers || [];

    if (e.target.checked) {
      selectedAnswers.push(index);
    } else {
      const idx = selectedAnswers.indexOf(index);
      if (idx > -1) selectedAnswers.splice(idx, 1);
    }

    updatedAnswers[currentPage] = {
      selectedAnswers,
    };
    setAnswers(updatedAnswers);
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
    // Countdown timer
    if (isSubmitted) return; // Nếu đã nộp bài thì không chạy timer nữa

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer); // Dừng timer khi hết giờ
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Clean up interval on component unmount
  }, [isSubmitted]); // Khi isSubmitted thay đổi thì sẽ chạy lại

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = { selectedAnswerIndex: answerIndex };
    setAnswers(updatedAnswers);
  };

  useEffect(() => {
    if (timeLeft > 0) {
      // Chỉ chạy timer nếu timeLeft > 0
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer); // Dừng timer khi hết giờ
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer); // Clean up interval
    }
  }, [timeLeft]); // Thêm timeLeft vào dependency

  useEffect(() => {
    if (quizId) {
      setLoading(true);
      apiService
        .get(`/quizzes/${quizId}/get-questions`)
        .then((response) => {
          console.log("responseQ", response);
          setQuestions(response.data.data.questions);

          // Lấy quizDuration từ response
          const duration = response.data.data.quizDuration || 10; // Mặc định 10 nếu không có
          setQuizDuration(duration); // Lưu quizDuration vào state
          setTimeLeft(duration * 60); // Đặt thời gian đếm ngược
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
    if (isSubmitted) return; // Nếu đã nộp bài, không thực hiện gì thêm.

    const totalQuizTime = quizDuration * 60; // Tổng thời gian quiz tính bằng giây
    const timeSpent = totalQuizTime - timeLeft; // Thời gian đã sử dụng

    const payload = {
      timeSpent,
      answers: answers
        .map((answer, index) => {
          const question = questions[index];
          if (question.questionType === "MULTIPLE_CHOICE") {
            return {
              questionId: question.questionId,
              selectedAnswer: question.options[answer.selectedAnswerIndex],
            };
          } else if (question.questionType === "MULTI_SELECT") {
            return {
              questionId: question.questionId,
              selectedAnswers: answer.selectedAnswers.map(
                (idx) => question.options[idx]
              ),
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
      .post(`/quizzes/${quizId}/submit-quiz`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        console.log("Quiz submitted successfully", response.data);
        setQuizResult(response.data.data);
        setDialogOpen(true);
        setIsSubmitted(true); // Đánh dấu đã nộp bài
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
      handleSubmit(); // Gọi hàm nộp bài khi hết giờ
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

                    {/* Render the different question types (radio, checkbox, text input) */}
                    <FormControl
                      component="fieldset"
                      // sx={{ alignItems: "center" }}
                    >
                      {question.image && (
                        <img
                          src={question.image}
                          alt="Question"
                          style={{ maxWidth: "50%" }}
                        />
                      )}
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
                          disabled={timeLeft === 0}
                          sx={{ display: "flex", flexDirection: "column" }}
                        >
                          {question.options
                            .filter((option) => option.trim() !== "") // Filter out empty options
                            .map((option, index) => (
                              <FormControlLabel
                                key={index}
                                value={index.toString()}
                                control={<Radio />}
                                label={option}
                                sx={{
                                  "& .MuiTypography-root": { fontSize: "16px" },
                                }} // Sửa fontSize của label
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

                  {/* Navigation buttons */}
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

              {/* Right Section: Side panel for Question Numbers and Submit button */}
              <Box
                sx={{
                  flex: 1,
                  width: "250px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  // paddingX: "20px",
                  backgroundColor: "#fff",
                  // boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
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
                {/* Question numbers */}
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
                      // justifyContent: "center",
                      gap: "8px",
                      marginY: "20px",
                      flexWrap: "wrap",
                    }}
                  >
                    {questions.map((_, index) => {
                      const isAnswered =
                        answers[index] &&
                        (answers[index]?.inputAnswer ||
                          answers[index]?.selectedAnswers?.length > 0 ||
                          answers[index]?.selectedAnswerIndex !== undefined); // Câu hỏi đã trả lời khi có giá trị trả lời
                      const isCurrent = index === currentPage;
                      // const isSelected =
                      //   answers[index]?.selectedAnswerIndex !== undefined;

                      return (
                        <Button
                          key={index}
                          variant="contained"
                          onClick={() => setCurrentPage(index)}
                          sx={{
                            backgroundColor: isCurrent
                              ? isAnswered
                                ? "#99BC4D" // Xanh lá khi đã trả lời
                                : "#FF9900" // Cam khi chưa trả lời
                              : isAnswered
                                ? "#99BC4D"
                                : "transparent", // Màu xám khi chưa trả lời
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
                            // border: isSelected ? "2px solid #4CAF50" : "none", // Thêm viền xanh khi đã chọn câu trả lời
                          }}
                        >
                          {index + 1}
                        </Button>
                      );
                    })}
                  </Box>
                </Box>

                {/* Submit button */}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
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

      {/* Dialog for quiz results */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="lg">
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

                {/* Multiple Choice Questions */}
                {question.options &&
                  question.options.length > 0 &&
                  !question.correctAnswers &&
                  question.options.map((option: string, optIndex: number) => {
                    const isCorrect = question.correctAnswer === option; // For multiple choice, check against `correctAnswer`
                    const isUserAnswer = question.userAnswer === option; // Check if the user selected this option

                    return (
                      <Typography
                        key={optIndex}
                        sx={{
                          padding: "4px 8px",
                          marginBottom: "4px",
                          borderRadius: "5px",
                          backgroundColor: isCorrect
                            ? "#99BC4D" // Green for correct answers
                            : isUserAnswer
                              ? "#FFCCCB" // Red for incorrect user answers
                              : "transparent", // No background for other options
                          textDecoration:
                            isUserAnswer && !isCorrect
                              ? "line-through"
                              : "none", // Strike-through for wrong answers
                        }}
                      >
                        {option}
                      </Typography>
                    );
                  })}

                {/* Multi-Select Questions */}
                {question.correctAnswers &&
                  question.correctAnswers.length > 0 &&
                  question.options &&
                  question.options.length > 0 && (
                    <Box>
                      {[...new Set(question.options)].map(
                        (option: string, optIndex: number) => {
                          const isCorrect =
                            question.correctAnswers.includes(option); // Check if the option is correct
                          const isUserAnswer =
                            question.answers?.includes(option); // Check if the user selected this option
                          const isIncorrectUserAnswer =
                            isUserAnswer && !isCorrect; // If user selected an incorrect answer

                          return (
                            <Typography
                              key={optIndex}
                              sx={{
                                padding: "4px 8px",
                                marginBottom: "4px",
                                borderRadius: "5px",
                                backgroundColor: isCorrect
                                  ? "#99BC4D" // Green for correct answers
                                  : isIncorrectUserAnswer
                                    ? "#FFCCCB" // Red for incorrect user answers
                                    : "transparent",
                                textDecoration: isIncorrectUserAnswer
                                  ? "line-through"
                                  : "none", // Strike-through for wrong answers
                              }}
                            >
                              {option}
                            </Typography>
                          );
                        }
                      )}
                    </Box>
                  )}

                {/* Fill-in-the-Blank Questions */}
                {!question.options && question.correctAnswers && (
                  <Box>
                    {question.correctAnswers.map(
                      (correctAnswer: string, ansIndex: number) => {
                        const isCorrect =
                          question.userAnswer?.toLowerCase() ===
                          correctAnswer.toLowerCase(); // Compare with correct answers
                        const isIncorrectUserAnswer =
                          question.userAnswer && !isCorrect; // If the user answer is wrong

                        return (
                          <Typography
                            key={ansIndex}
                            sx={{
                              padding: "4px 8px",
                              marginBottom: "4px",
                              borderRadius: "5px",
                              backgroundColor: isCorrect
                                ? "#99BC4D" // Green for correct answers
                                : isIncorrectUserAnswer
                                  ? "#FFCCCB" // Red for incorrect user answers
                                  : "transparent",
                              textDecoration: isIncorrectUserAnswer
                                ? "line-through"
                                : "none", // Strike-through for wrong answers
                            }}
                          >
                            {correctAnswer}
                          </Typography>
                        );
                      }
                    )}
                  </Box>
                )}

                {/* Display answers only if the answer is incorrect */}
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
      </Dialog>
    </Layout>
  );
};

export default SkillPracticePage;
