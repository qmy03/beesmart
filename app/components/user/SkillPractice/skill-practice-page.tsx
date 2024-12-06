"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import apiService from "@/app/untils/api"; 
import Layout from "@/app/components/user/Home/layout";
import {
  Box,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import { useAuth } from "@/app/hooks/AuthContext";

const SkillPracticePage = () => {
  const { quizId } = useParams(); 
  const [questions, setQuestions] = useState<any[]>([]); 
  const [answers, setAnswers] = useState<any[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(10 * 60); // 10 minutes in seconds
  const { accessToken } = useAuth();

  useEffect(() => {
    if (quizId) {
      setLoading(true);
      apiService
        .get(`/quizzes/${quizId}/questions`)
        .then((response) => {
          setQuestions(response.data.data.questions);
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

  const handleSubmit = () => {
    const payload = {
      answers: answers.map((answer, index) => ({
        questionId: questions[index].questionId,
        selectedAnswerIndex: answer.selectedAnswerIndex,
      })),
    };

    apiService
      .post(`/quizzes/${quizId}/submit-quiz`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        console.log("Quiz submitted successfully", response.data);
      })
      .catch((error) => {
        console.error(
          "Error submitting quiz:",
          error.response?.data || error.message
        );
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
          padding: "40px",
          gap: "20px",
          backgroundColor: "#EFF3E6",
          alignItems: "center",
        }}
      >
        <Typography variant="h4">Luyện tập Quiz</Typography>
        
        {/* Timer */}
        <Typography variant="h5">{formatTime(timeLeft)}</Typography>

        {/* Display questions */}
        <Box>
          {questions.map((question: any, questionIndex: number) => (
            <Box key={question.questionId} sx={{ marginBottom: "20px" }}>
              <Typography variant="h6">{question.content}</Typography>
              {question.image && (
                <img
                  src={question.image}
                  alt="Question"
                  style={{ maxWidth: "100%" }}
                />
              )}
              <FormControl component="fieldset">
                <RadioGroup
                  value={answers[questionIndex]?.selectedAnswerIndex ?? -1}
                  onChange={(e) =>
                    handleAnswerChange(questionIndex, parseInt(e.target.value))
                  }
                  disabled={timeLeft === 0} // Disable input when time is up
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
    </Layout>
  );
};

export default SkillPracticePage;
