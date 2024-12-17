"use client";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import Layout from "@/app/components/admin/layout";
import { Button } from "@/app/components/button";
import { AuthProvider, useAuth } from "@/app/hooks/AuthContext";
import {
  Box,
  Typography,
  MenuItem,
  FormControl,
  Checkbox,
  colors,
  IconButton,
  Snackbar,
  Alert,
  InputLabel,
  List,
  CircularProgress,
  ListItem,
  ListItemText,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import React, { useState, useEffect } from "react";
import apiService from "@/app/untils/api";
import theme from "@/app/components/theme";
import TextField from "@/app/components/textfield";
import DialogPopup from "./dialog-popup";
import EditIcon from "@mui/icons-material/Edit";
import DeleteDialog from "@/app/components/admin/delete-dialog";
import QuestionDialog from "./question-dialog";
const QuizPage = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [severity, setSeverity] = useState<"success" | "error">("success");
  const { accessToken } = useAuth();
  console.log(accessToken);
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const [selectedGradeName, setSelectedGradeName] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("Học kì 1");
  const [topics, setTopics] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]); // State to store lessons for selected topic
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null); // State to store selected topicId
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null); // State to store selected lessonId
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Record<string, any[]>>({});
  const [loadingQuestions, setLoadingQuestions] = useState<
    Record<string, boolean>
  >({});
  const [dialogType, setDialogType] = useState<"add" | "edit">("add");
  const [editQuizData, setEditQuizData] = useState<any | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);
  const [selectedQuizzes, setSelectedQuizzes] = useState<Set<string>>(
    new Set()
  );
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const handleInputChange = (questionId: string, answer: any) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer, // Cập nhật câu trả lời người dùng cho câu hỏi tương ứng
    }));
  };

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const handleCheckboxChange = (quizId: string) => {
    const updatedSelectedQuizzes = new Set(selectedQuizzes);
    if (updatedSelectedQuizzes.has(quizId)) {
      updatedSelectedQuizzes.delete(quizId); // Deselect if already selected
    } else {
      updatedSelectedQuizzes.add(quizId); // Add to selected if not selected
      setQuizToDelete(quizId); // Set the quiz ID to be deleted
      setOpenDeleteDialog(true); // Open delete dialog
    }
    setSelectedQuizzes(updatedSelectedQuizzes);
  };

  const handleDeleteQuiz = () => {
    if (!selectedQuizzes.size) return;

    const quizIdsToDelete = Array.from(selectedQuizzes);
    apiService
      .delete("/quizzes", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        data: quizIdsToDelete,
      })
      .then(() => {
        setQuizzes(
          quizzes.filter((quiz) => !quizIdsToDelete.includes(quiz.quizId))
        );
        setSnackbarMessage("Quizzes deleted successfully!");
        setSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error("Error deleting quizzes:", error);
        setSnackbarMessage("Error deleting quizzes.");
        setSeverity("error");
        setSnackbarOpen(true);
      });
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    setQuizToDelete(null); // Reset quiz to delete when dialog is closed
  };

  useEffect(() => {
    if (accessToken) {
      setLoading(true);
      apiService
        .get("/grades")
        .then((response) => {
          const fetchedGrades = response.data;
          setGrades(fetchedGrades);
          if (fetchedGrades.length > 0) {
            const firstGrade = fetchedGrades[0];
            setSelectedGradeId(firstGrade.gradeId); // Automatically select the first grade
            setSelectedGradeName(firstGrade.gradeName);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching grades:", error);
          setLoading(false);
        });
    }
  }, [accessToken]);

  useEffect(() => {
    if (selectedGradeName && selectedSemester) {
      setLoading(true);
      apiService
        .get(`/topics?grade=${selectedGradeName}&&semester=${selectedSemester}`)
        .then((response) => {
          const fetchedTopics = response.data.data.topics;
          setTopics(fetchedTopics);
          if (fetchedTopics.length > 0) {
            setSelectedTopicId(fetchedTopics[0].topicId); // Automatically select the first topic
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching topics:", error);
          setLoading(false);
        });
    }
  }, [selectedGradeId, selectedSemester]);

  useEffect(() => {
    if (selectedTopicId) {
      const selectedTopic = topics.find(
        (topic) => topic.topicId === selectedTopicId
      );
      if (selectedTopic) {
        setLessons(selectedTopic.lessons); // Cập nhật danh sách bài học
        setSelectedLessonId(null); // Không gán bài học mặc định
      }
    }
    console.log("selectedTopic", selectedTopicId);
  }, [selectedTopicId, topics]);

  const handleGradeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedGrade = event.target.value as string;
    const selectedGradeItem = grades.find(
      (grade) => grade.gradeName === selectedGrade
    );
    if (selectedGradeItem) {
      setSelectedGradeId(selectedGradeItem.gradeId);
      setSelectedGradeName(selectedGradeItem.gradeName);
    }
  };

  const handleSemesterChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setSelectedSemester(event.target.value as string);
  };

  const handleTopicChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedTopicId(event.target.value as string);
    setSelectedLessonId(null); // Reset lesson selection when topic changes
  };

  const handleLessonChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedLessonId(event.target.value as string);
  };
  useEffect(() => {
    if (selectedLessonId) {
      setLoading(true);
      apiService
        .get(`/lessons/${selectedLessonId}/quizzes`)
        .then((response) => {
          console.log(response);
          const quizzes = response.data.data.quizzes;
          setQuizzes(quizzes);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching quizzes:", error);
          setLoading(false);
        });
    } else if (selectedTopicId) {
      setLoading(true);
      apiService
        .get(`/topics/${selectedTopicId}/quizzes`)
        .then((response) => {
          console.log("RRRRRRR", response);
          const quizzes = response.data.data.quizzes;
          setQuizzes(quizzes);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching quizzes:", error);
          setLoading(false);
        });
    }
  }, [selectedLessonId, selectedTopicId]);
  const handleExpandQuiz = (quizId: string) => {
    console.log("Expanding quiz ID:", quizId);

    if (expandedQuizId === quizId) {
      setExpandedQuizId(null);
    } else {
      setExpandedQuizId(quizId);
      setSelectedQuizId(quizId); // Ensure the selected quiz ID is set when expanding a quiz

      // Check if the quiz data is available and if not, fetch the quiz questions
      if (!questions[quizId] && quizzes.length > 0) {
        setLoadingQuestions((prev) => ({ ...prev, [quizId]: true }));

        // Assuming the `selectedQuizId` is set correctly, fetch questions for the quiz
        apiService
          .get(`/quizzes/${quizId}/questions`)
          .then((response) => {
            console.log("responseQuizTopic", response);
            const fetchedQuestions = response.data.data.questions;
            console.log("quiz response", fetchedQuestions);
            setQuestions((prev) => ({ ...prev, [quizId]: fetchedQuestions }));
            setLoadingQuestions((prev) => ({ ...prev, [quizId]: false }));
          })
          .catch((error) => {
            console.error("Error fetching questions:", error);
            setLoadingQuestions((prev) => ({ ...prev, [quizId]: false }));
          });
      }
    }
  };
  const handleAnswerSubmit = (questionId: string, correctAnswer: any) => {
    let userAnswer = userAnswers[questionId];

    // Ensure userAnswer is always an array when it's MULTI_SELECT
    if (Array.isArray(userAnswer)) {
      userAnswer = userAnswer.sort();
    } else if (typeof userAnswer === "string") {
      userAnswer = [userAnswer]; // Convert string answers to an array for consistency
    }

    // Check the answer type and compare
    let isCorrect = false;

    switch (correctAnswer?.constructor) {
      case Array:
        // MULTI_SELECT: Check if the user's selected answers match the correct ones
        isCorrect =
          JSON.stringify(userAnswer.sort()) ===
          JSON.stringify(correctAnswer.sort());
        break;
      case String:
        // MULTIPLE_CHOICE: Check if the selected option matches the correct answer
        isCorrect = userAnswer[0] === correctAnswer; // userAnswer is an array with one string in this case
        break;
      default:
        // FILL_IN_THE_BLANK: Check if the input matches the correct answer
        isCorrect = userAnswer && userAnswer[0].trim() === correctAnswer[0];
        break;
    }

    // Show Snackbar based on answer correctness
    if (isCorrect) {
      setSeverity("success");
      setSnackbarMessage("Correct!");
    } else {
      setSeverity("error");
      setSnackbarMessage("Incorrect. Try again!");
    }

    // Log the result
    console.log(
      `Question ${questionId}: ${isCorrect ? "Correct" : "Incorrect"}`
    );
    setSnackbarOpen(true);
  };

  const renderQuestions = (questions: any[]) => {
    return questions.map((question, index) => {
      const correctAnswer = question.correctAnswer;
      const questionNumber = index + 1; 
      switch (question.questionType) {
        case "MULTI_SELECT":
          return (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              key={question.questionId}
            >
              <Typography fontWeight={600}>{`Câu hỏi ${questionNumber}: ${question.content}`}</Typography>
              {question.image && (
                <img
                  src={question.image}
                  alt="question-image"
                  style={{ maxWidth: "50%", height: "auto" }}
                />
              )}
              {question.options.map((option, idx) => (
                <Box key={idx} sx={{ display: "flex", gap: 2 }}>
                  <input
                    type="checkbox"
                    value={option}
                    onChange={(e) => {
                      const newAnswer = [
                        ...(userAnswers[question.questionId] || []),
                        e.target.value,
                      ];
                      handleInputChange(question.questionId, newAnswer);
                    }}
                  />
                  <label>{option}</label>
                </Box>
              ))}
              <Button
                onClick={() =>
                  handleAnswerSubmit(
                    question.questionId,
                    question.correctAnswers
                  )
                }
              >
                Submit
              </Button>
            </Box>
          );

        case "MULTIPLE_CHOICE":
          return (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, marginY: 4 }}
              key={question.questionId}
            >
              <Typography fontWeight={600}>{`Câu hỏi ${questionNumber}: ${question.content}`}</Typography>
              {question.image && (
                <img
                  src={question.image}
                  alt="question-image"
                  style={{ maxWidth: "50%", height: "auto" }}
                />
              )}
              {question.options.map((option, idx) => (
                <div key={idx}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <input
                      type="radio"
                      name={question.questionId}
                      value={option}
                      onChange={(e) =>
                        handleInputChange(question.questionId, e.target.value)
                      }
                    />
                    <label>{option}</label>
                  </Box>
                </div>
              ))}
              <Button
                onClick={() =>
                  handleAnswerSubmit(
                    question.questionId,
                    question.correctAnswer
                  )
                }
              >
                Submit
              </Button>
            </Box>
          );

        case "FILL_IN_THE_BLANK":
          return (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, marginY: 4 }} key={question.questionId}>
              <Typography fontWeight={600}>{`Câu hỏi ${questionNumber}: ${question.content}`}</Typography>
              <Box>
                <TextField
                  sx={{ width: "100px" }}
                  type="text"
                  value={userAnswers[question.questionId] || ""}
                  onChange={(e) =>
                    handleInputChange(question.questionId, e.target.value)
                  }
                />
                {question.image && (
                  <img
                    src={question.image}
                    alt="question-image"
                    style={{ width: "50%", height: "auto" }}
                  />
                )}
              </Box>
              <Button
                onClick={() =>
                  handleAnswerSubmit(question.questionId, question.answers)
                }
              >
                Submit
              </Button>
            </Box>
          );

        default:
          return null;
      }
    });
  };
  const handleOpenAddDialog = () => {
    setSelectedQuiz(null);  // Reset selected quiz to ensure no previous quiz is selected.
    setDialogType("add");   // Set the dialogType to "add" explicitly.
    setOpenDialog(true);    // Open the dialog.
  };
  
  const handleQuizUpdated = (updatedQuiz: any) => {
    if (dialogType === "add") {
      // When adding a new quiz, we don’t want to merge with any previous quiz data.
      setQuizzes((prev) => [...prev, updatedQuiz]);
      setSelectedQuiz(null); // Reset selected quiz after adding
      setDialogType(null);    // Reset dialogType
    } else if (dialogType === "edit") {
      setQuizzes((prev) =>
        prev.map((quiz) =>
          quiz.quizId === updatedQuiz.quizId ? updatedQuiz : quiz
        )
      );
      setDialogType(null); // Reset dialogType after editing
    }
  };
  
  

  const handleEditQuiz = (quiz: any) => {
    setSelectedQuiz(quiz);
    setDialogType("edit");
    setOpenDialog(true);
  };
  const handleCreateQuestion = (questionData: any) => {
    if (!selectedQuizId) {
      console.error("No quiz selected");
      return;
    }

    setLoading(true);

    apiService
      .post(`/questions/quiz/${selectedQuizId}`, questionData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        const newQuestion = response.data.data;

        // Cập nhật câu hỏi vào quiz tương ứng
        const updatedQuizzes = quizzes.map((quiz) => {
          if (quiz.quizId === selectedQuizId) {
            return { ...quiz, questions: [...quiz.questions, newQuestion] };
          }
          return quiz;
        });

        setQuizzes(updatedQuizzes);

        // Hiển thị Snackbar
        setSnackbarMessage(response.data.message || "Thêm câu hỏi thành công!");
        setSnackbarOpen(true);

        // Đóng dialog
        setOpenQuestionDialog(false);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error creating question:", error);

        // Hiển thị lỗi trong Snackbar
        setSnackbarMessage("Thêm câu hỏi thành công!");
        setSnackbarOpen(true);
        setOpenQuestionDialog(false);

        setLoading(false);
      });
  };

  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          padding: "0 10px",
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            padding: "4px 8px",
            alignItems: "center",
            boxShadow: 4,
            borderRadius: "8px",
          }}
        >
          <Typography fontWeight={700} flexGrow={1}>
            Quản lý Lớp học
          </Typography>
          <Button onClick={handleOpenAddDialog}>Thêm mới</Button>
        </Box>

        {/* Chọn lớp học và học kỳ */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl fullWidth size="small">
            <TextField
              select
              value={selectedGradeName} // Display the selected grade ID
              onChange={handleGradeChange}
              label="Chọn lớp học"
              fullWidth
            >
              {grades.map((grade) => (
                <MenuItem
                  key={grade.gradeId}
                  value={grade.gradeName} // Set value to gradeId
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "#BCD181 !important",
                      color: "white",
                    },
                    "&:hover": { backgroundColor: "#BCD181" },
                  }}
                >
                  {grade.gradeName} {/* Display gradeName */}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>

          {/* Semester */}
          <FormControl fullWidth size="small">
            <TextField
              select
              value={selectedSemester}
              onChange={handleSemesterChange}
              label="Chọn học kì"
              fullWidth
            >
              <MenuItem value="Học kì 1">Học kì 1</MenuItem>
              <MenuItem value="Học kì 2">Học kì 2</MenuItem>
            </TextField>
          </FormControl>

          {/* Topic */}
          <FormControl fullWidth size="small">
            <TextField
              select
              value={selectedTopicId} // Display the selected topic ID
              onChange={handleTopicChange}
              label="Chọn chủ đề"
              fullWidth
              InputLabelProps={{
                shrink: selectedTopicId ? true : false, // Shrink label if topicId has a value
              }}
            >
              {topics.map((topic) => (
                <MenuItem
                  key={topic.topicId}
                  value={topic.topicId} // Set value to topicId
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "#BCD181 !important",
                      color: "white",
                    },
                    "&:hover": { backgroundColor: "#BCD181" },
                  }}
                >
                  {topic.topicName} {/* Display topicName */}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>

          {/* Lesson */}
          <FormControl fullWidth size="small">
            <TextField
              select
              value={selectedLessonId} // Display the selected lesson ID
              onChange={handleLessonChange}
              label="Chọn bài học"
              fullWidth
              InputLabelProps={{
                shrink: selectedLessonId ? true : false, // Shrink label if topicId has a value
              }}
            >
              {lessons.map((lesson) => (
                <MenuItem
                  key={lesson.lessonId}
                  value={lesson.lessonId} // Set value to lessonId
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "#BCD181 !important",
                      color: "white",
                    },
                    "&:hover": { backgroundColor: "#BCD181" },
                  }}
                >
                  {lesson.lessonName} {/* Display lessonName */}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>
        </Box>
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h6">Danh sách Quiz</Typography>
          {quizzes.map((quiz) => (
            <Box
              key={quiz.quizId}
              sx={{
                marginY: 2,
                // border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "8px",
              }}
            >
              {/* Tiêu đề quiz */}
              <Box
                sx={{
                  display: "flex",
                  // justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    // justifyContent: "space-between",
                    alignItems: "center",
                    flexGrow: 1,
                    gap: 1,
                  }}
                >
                  <Checkbox
                    onChange={() => handleCheckboxChange(quiz.quizId)} // Trigger checkbox change
                  />
                  <Typography fontWeight={600}>{quiz.title}</Typography>
                  <IconButton onClick={() => handleEditQuiz(quiz)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
                {expandedQuizId === quiz.quizId && (
                  <Button
                    onClick={() => setOpenQuestionDialog(true)} // This opens the Question Dialog
                    variant="contained"
                    color="primary"
                  >
                    Thêm câu hỏi
                  </Button>
                )}
                <IconButton onClick={() => handleExpandQuiz(quiz.quizId)}>
                  {expandedQuizId === quiz.quizId ? (
                    <ExpandLessIcon fontSize="small" />
                  ) : (
                    <ExpandMoreIcon fontSize="small" />
                  )}
                </IconButton>
              </Box>

              {/* Render questions if the quiz is expanded */}
              {expandedQuizId === quiz.quizId && (
                <Box sx={{ marginTop: 2 }}>
                  {loadingQuestions[quiz.quizId] ? (
                    <CircularProgress />
                  ) : (
                    renderQuestions(questions[selectedQuizId] || [])
                  )}
                </Box>
              )}
            </Box>
          ))}
        </Box>

        <DialogPopup
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onQuizUpdated={handleQuizUpdated}
          dialogType={dialogType}
          quizData={selectedQuiz}
          selectedLessonId={selectedLessonId}
          selectedTopicId={selectedTopicId}
        />

        <QuestionDialog
          open={openQuestionDialog}
          onClose={() => setOpenQuestionDialog(false)}
          onSave={handleCreateQuestion}
        />
        <DeleteDialog
          open={openDeleteDialog}
          handleClose={handleDeleteDialogClose}
          onDelete={handleDeleteQuiz}
          quantity={selectedQuizzes.size}
        />
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={severity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default QuizPage;
