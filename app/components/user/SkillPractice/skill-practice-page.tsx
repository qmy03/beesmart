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
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/AuthContext";
import { Button } from "../../button";
import TextField from "../../textfield";
const SkillPracticePage = () => {
  const router = useRouter();
  const { quizId } = useParams();
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(10 * 60); // 10 minutes in seconds
  const { accessToken } = useAuth();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  useEffect(() => {
    if (quizId) {
      setLoading(true);
      apiService
        .get(`/quizzes/${quizId}/questions`)
        .then((response) => {
          console.log("responseQ", response);
          setQuestions(response.data.data.questions);

          // Get quizDuration from response and set the timeLeft state
          const quizDuration = response.data.data.quizDuration || 10; // Default to 10 minutes if quizDuration is not available
          setTimeLeft(quizDuration * 60); // Set timeLeft in seconds

          // Initialize answers array with -1 (no answer selected)
          const initialAnswers = response.data.data.questions.map(() => ({
            selectedAnswerIndex: -1,
          }));
          setAnswers(initialAnswers);
        })
        .catch((error) => {
          console.error("Error fetching questions:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [quizId]);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer); // Stop the timer when time is up
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Clean up interval on component unmount
  }, []);

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = { selectedAnswerIndex: answerIndex };
    setAnswers(updatedAnswers);
  };

  // const handleSubmit = () => {
  //   const payload = {
  //     answers: answers.map((answer, index) => ({
  //       questionId: questions[index].questionId,
  //       selectedAnswerIndex: answer.selectedAnswerIndex,
  //     })),
  //   };

  //   apiService
  //     .post(`/quizzes/${quizId}/submit-quiz`, payload, {
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     })
  //     .then((response) => {
  //       console.log("Quiz submitted successfully", response.data);
  //     })
  //     .catch((error) => {
  //       console.error(
  //         "Error submitting quiz:",
  //         error.response?.data || error.message
  //       );
  //     });
  // };
  const handleSubmit = () => {
    const totalQuizTime = questions[0]?.quizDuration
      ? questions[0].quizDuration * 60
      : 600; // Default to 10 minutes (600 seconds) if quizDuration is not available
  
    // Calculate time spent as the difference between the total quiz time and the remaining time
    const timeSpent = totalQuizTime - timeLeft;
  
    // Round the timeSpent to the nearest minute
    const roundedTimeSpent = Math.ceil(timeSpent / 60); // Round up to the nearest minute
  
    const payload = {
      timeSpent: roundedTimeSpent,
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
                (idx: number) => question.options[idx]
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
        .filter(Boolean), // Filter out any null answers
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
      })
      .catch((error) => {
        console.error("Error submitting quiz:", error.response?.data || error.message);
      });
  };
  
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
          padding: "40px 80px",
          gap: "20px",
          backgroundColor: "#EFF3E6",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontSize: "32px", fontWeight: "600" }}>
          Luyện tập Quiz
        </Typography>

        {/* Timer */}
        <Typography variant="h5">{formatTime(timeLeft)}</Typography>

        {/* Display questions */}
        <Box>
          {questions.map((question: any, questionIndex: number) => (
            <Box
              key={question.questionId}
              sx={{
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                Câu hỏi số {questionIndex + 1}: {question.content}
              </Typography>

              <FormControl component="fieldset" sx={{ alignItems: "center" }}>
              {question.questionType === "FILL_IN_THE_BLANK" && (
                  <TextField
                    value={answers[questionIndex]?.inputAnswer || ""}
                    onChange={(e) => {
                      const updatedAnswers = [...answers];
                      updatedAnswers[questionIndex] = {
                        inputAnswer: e.target.value,
                      };
                      setAnswers(updatedAnswers);
                    }}
                    sx={{ width: "30%" }}
                    disabled={timeLeft === 0}
                  />
                )}
                {question.image && (
                  <img
                    src={question.image}
                    alt="Question"
                    style={{ maxWidth: "50%" }}
                  />
                )}
                {question.questionType === "MULTIPLE_CHOICE" && (
                  <RadioGroup
                    value={answers[questionIndex]?.selectedAnswerIndex ?? -1}
                    onChange={(e) =>
                      handleAnswerChange(
                        questionIndex,
                        parseInt(e.target.value)
                      )
                    }
                    disabled={timeLeft === 0} // Disable input when time is up
                    sx={{ display: "flex", flexDirection: "row", gap: 7 }}
                  >
                    {question.options.map((option: string, index: number) => (
                      <FormControlLabel
                        key={index}
                        value={index.toString()}
                        control={<Radio />}
                        label={option}
                      />
                    ))}
                  </RadioGroup>
                )}

                {question.questionType === "MULTI_SELECT" && (
                  <Box>
                    {question.options.map((option: string, index: number) => (
                      <FormControlLabel
                        sx={{display: "flex", flexDirection: "row"}}
                        key={index}
                        control={
                          <Checkbox
                            checked={
                              answers[questionIndex]?.selectedAnswers?.includes(
                                index
                              ) || false
                            }
                            onChange={(e) => {
                              const updatedAnswers = [...answers];
                              const selectedAnswers =
                                updatedAnswers[questionIndex]
                                  ?.selectedAnswers || [];
                              if (e.target.checked) {
                                selectedAnswers.push(index);
                              } else {
                                const idx = selectedAnswers.indexOf(index);
                                if (idx > -1) selectedAnswers.splice(idx, 1);
                              }
                              updatedAnswers[questionIndex] = {
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
          ))}
        </Box>

        {/* Submit button */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={timeLeft === 0} // Disable submit when time is up
        >
          Nộp bài
        </Button>
      </Box>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle fontSize="32px">
          Chúc mừng bạn đã hoàn thành Bài luyện tập!
        </DialogTitle>
        <DialogContent>
          <Typography>Số điểm: {quizResult?.points || 0}/10</Typography>
          <Typography>
            Số câu đúng: {quizResult?.correctAnswers || 0}/
            {quizResult?.totalQuestions || 0}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDialogOpen(false);
              router.push(`/skill-list`);
            }}
          >
            Hoàn thành
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default SkillPracticePage;
