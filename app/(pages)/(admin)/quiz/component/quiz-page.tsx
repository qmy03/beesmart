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

import ClearIcon from "@mui/icons-material/Clear";
import CheckIcon from "@mui/icons-material/Check";
const QuizPage = () => {
  const { accessToken } = useAuth();
  console.log(accessToken);
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
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
    if (selectedQuizzes.size === 0) return;
  
    // Convert the Set of selected quizzes to an array of quiz IDs
    const quizIdsToDelete = Array.from(selectedQuizzes);
    console.log("Deleting quizzes:", quizIdsToDelete);  
    // Delete quizzes using the API call
    apiService
      .delete("/quizzes", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        data: quizIdsToDelete, // Pass the array of quiz IDs to delete
      })
      .then(() => {
        // Filter out the deleted quizzes from the state
        setQuizzes(quizzes.filter((quiz) => !quizIdsToDelete.includes(quiz.quizId)));
        setOpenDeleteDialog(false); // Close the dialog
      })
      .catch((error) => {
        console.error("Error deleting quizzes:", error);
        setOpenDeleteDialog(false); // Close the dialog on error
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
    if (selectedGradeId && selectedSemester) {
      setLoading(true);
      apiService
        .get(
          `/topics/grade/${selectedGradeId}/semester?semester=${selectedSemester}`
        )
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
        setLessons(selectedTopic.lessons); // Set lessons based on selected topic
        if (selectedTopic.lessons.length > 0) {
          setSelectedLessonId(selectedTopic.lessons[0].lessonId); // Automatically select the first lesson
        }
      }
    }
  }, [selectedTopicId, topics]);

  const handleGradeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedGrade = event.target.value as string;
    const selectedGradeItem = grades.find(
      (grade) => grade.gradeName === selectedGrade
    );
    if (selectedGradeItem) {
      setSelectedGradeId(selectedGradeItem.gradeId);
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
          const quizzes = response.data.data.quizzes;
          setQuizzes(quizzes);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching quizzes:", error);
          setLoading(false);
        });
    }
  }, [selectedLessonId]);
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

  // Handle creating a new quiz
  // const handleCreateQuiz = (quizData: any) => {
  //   setLoading(true);

  //   const accessToken = localStorage.getItem("accessToken"); // Get token from localStorage

  //   if (!accessToken) {
  //     console.error("Access token is missing");
  //     setLoading(false);
  //     return;
  //   }

  //   apiService
  //     .post(`/quizzes/lesson/${selectedLessonId}`, quizData, {
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     })
  //     .then((response) => {
  //       const newQuiz = response.data.data;
  //       setQuizzes([...quizzes, newQuiz]);
  //       setOpenDialog(false);
  //       setLoading(false);
  //     })
  //     .catch((error) => {
  //       console.error("Error creating quiz:", error);
  //       setLoading(false);
  //     });
  // };
  // const handleUpdateQuiz = (quizId: string, quizData: any) => {
  //   console.log("Updating quiz:", quizId, quizData); // Log dữ liệu
  //   setLoading(true);
  //   apiService
  //     .put(`/quizzes/${quizId}`, quizData, {
  //       headers: { Authorization: `Bearer ${accessToken}` },
  //     })
  //     .then((response) => {
  //       const updatedQuiz = response.data.data;
  //       console.log("Updated quiz response:", updatedQuiz);
  //       setQuizzes((prev) =>
  //         prev.map((quiz) => (quiz.quizId === quizId ? updatedQuiz : quiz))
  //       );
  //       setOpenDialog(false);
  //       setLoading(false);
  //     })
  //     .catch((error) => {
  //       console.error("Error updating quiz:", error);
  //       setLoading(false);
  //     });
  // };
  const handleQuizUpdated = (updatedQuiz: any) => {
    if (dialogType === "add") {
      setQuizzes((prev) => [...prev, updatedQuiz]);
    } else if (dialogType === "edit") {
      setQuizzes((prev) =>
        prev.map((quiz) =>
          quiz.quizId === updatedQuiz.quizId ? updatedQuiz : quiz
        )
      );
    }
  };

  const handleEditQuiz = (quiz: any) => {
    setSelectedQuiz(quiz);
    setDialogType("edit");
    setOpenDialog(true);
  };
  // Handle creating a question for a quiz
  const handleCreateQuestion = (questionData: any) => {
    // Check if a quiz is selected
    if (!selectedQuizId) {
      console.error("No quiz selected");
      return;
    }

    console.log("Creating question for quiz ID:", selectedQuizId);
    console.log("Question Data being sent to backend:", questionData); // Add this line to log the data

    setLoading(true);

    apiService
      .post(`/questions/quiz/${selectedQuizId}`, questionData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        const newQuestion = response.data.data;
        const updatedQuizzes = quizzes.map((quiz) => {
          if (quiz.quizId === selectedQuizId) {
            return { ...quiz, questions: [...quiz.questions, newQuestion] };
          }
          return quiz;
        });
        setQuizzes(updatedQuizzes);
        setOpenQuestionDialog(false);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error creating question:", error);
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
          <Button onClick={() => setOpenDialog(true)}>Thêm mới</Button>
        </Box>

        {/* Chọn lớp học và học kỳ */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl fullWidth size="small">
            <TextField
              select
              value={selectedGradeId} // Display the selected grade ID
              onChange={handleGradeChange}
              label="Chọn lớp học"
              fullWidth
            >
              {grades.map((grade) => (
                <MenuItem
                  key={grade.gradeId}
                  value={grade.gradeId} // Set value to gradeId
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
                    questions[quiz.quizId]?.map((question, index) => (
                      <Box
                        key={question.questionId}
                        sx={{
                          marginBottom: 2,
                          padding: "8px 32px",
                          // border: "1px solid #ddd",
                          borderRadius: "8px",
                        }}
                      >
                        <Typography variant="body1" fontWeight={600}>
                          Câu hỏi {index + 1}: {question.content}
                        </Typography>
                        <List>
                          {question.options.map((option, optionIndex) => (
                            <>
                              <ListItem key={optionIndex}>
                                <ListItemText
                                  primary={`${String.fromCharCode(65 + optionIndex)}. ${option}`}
                                />
                              </ListItem>
                            </>
                          ))}
                        </List>
                        <Typography color="green">
                          Đáp án đúng:{" "}
                          {String.fromCharCode(
                            65 + question.correctAnswerIndex
                          )}
                        </Typography>
                      </Box>
                    ))
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
      </Box>
    </Layout>
  );
};

export default QuizPage;
