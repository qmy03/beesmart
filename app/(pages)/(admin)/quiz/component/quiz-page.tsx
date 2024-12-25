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
import EditQuestionDialog from "./multi-select-dialog";
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
  const [editQuestionDialog, setEditQuestionDialog] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItemsQ, setTotalItemsQ] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Record<string, any[]>>({});
  // const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState<
    Record<string, boolean>
  >({});
  const [dialogType, setDialogType] = useState<"add" | "edit">("add");
  const [editQuizData, setEditQuizData] = useState<any | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
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
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
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

  const handleCheckboxQChange = (questionId: string) => {
    const updatedSelectedQuestions = new Set(selectedQuestions); // Create a copy of the current selectedQuestions
    if (updatedSelectedQuestions.has(questionId)) {
      updatedSelectedQuestions.delete(questionId); // Remove if already selected
    } else {
      updatedSelectedQuestions.add(questionId); // Add if not selected
      setQuestionToDelete(questionId);
      setOpenDeleteDialog(true);
    }
    setSelectedQuestions(updatedSelectedQuestions); // Update state with the new array
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
        setSnackbarMessage("Xóa quiz thành công!");
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
  const handleDeleteQDialogClose = () => {
    setOpenDeleteDialog(false);
    setQuestionToDelete(null); // Reset quiz to delete when dialog is closed
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
          console.log(response.data.data.totalItems);
          setTotalItems(response.data.data.totalItems);
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
          setTotalItems(response.data.data.totalItems);
          setQuizzes(quizzes);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching quizzes:", error);
          setLoading(false);
        });
    }
  }, [selectedLessonId, selectedTopicId]);

  const handleExpandQuiz = (quizId: string, page: number = 0) => {
    console.log("Expanding quiz ID:", quizId);

    // Kiểm tra nếu quiz đã mở và chỉ thay đổi trang mà không gọi lại API
    if (expandedQuizId === quizId && page === currentPage) {
      return; // Không làm gì cả nếu quiz đã mở và đang ở trang hiện tại
    }

    // Giữ quiz đã mở và chỉ thay đổi trang
    if (expandedQuizId === quizId) {
      setSelectedQuizId(quizId);
    } else {
      // Mở quiz mới
      setExpandedQuizId(quizId);
      setSelectedQuizId(quizId);
    }

    // Fetch câu hỏi cho trang mới
    setLoadingQuestions((prev) => ({ ...prev, [quizId]: true }));
    apiService
      .get(`/quizzes/${quizId}/questions?page=${page}`)
      .then((response) => {
        const fetchedQuestions = response.data.data.questions;
        setTotalItemsQ(response.data.data.totalItems);
        setQuestions((prev) => ({ ...prev, [quizId]: fetchedQuestions }));
        setLoadingQuestions((prev) => ({ ...prev, [quizId]: false }));
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
        setLoadingQuestions((prev) => ({ ...prev, [quizId]: false }));
      });
  };

  const handleNextPage = () => {
    const newPage = currentPage + 1;
    setCurrentPage(newPage);

    // Re-fetch questions cho trang kế tiếp mà không thay đổi quiz
    if (selectedQuizId) {
      console.log("Navigating to next page:", newPage);
      handleExpandQuiz(selectedQuizId, newPage);
    }
  };

  const handlePreviousPage = () => {
    const newPage = currentPage - 1;
    setCurrentPage(newPage);

    // Re-fetch questions cho trang trước đó mà không thay đổi quiz
    if (selectedQuizId) {
      console.log("Navigating to previous page:", newPage);
      handleExpandQuiz(selectedQuizId, newPage);
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
      setSnackbarMessage("Đúng rồi!");
    } else {
      setSeverity("error");
      setSnackbarMessage("Sai rồi. Thử lại!");
    }

    // Log the result
    console.log(
      `Question ${questionId}: ${isCorrect ? "Correct" : "Incorrect"}`
    );
    setSnackbarOpen(true);
  };
  const handleDeleteQuestions = () => {
    if (!selectedQuestions?.size) return;

    const questionIdsToDelete = Array.from(selectedQuestions);
    console.log("Selected Questions: ", questionIdsToDelete);

    apiService
      .delete("/questions", {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: questionIdsToDelete,
      })
      .then(() => {
        setSnackbarMessage("Xóa câu hỏi thành công!");
        setSeverity("success");
        setSnackbarOpen(true);

        // Reset selectedQuestions to clear the selection
        setSelectedQuestions(new Set());

        // After deletion, fetch the updated list of questions for the selected quiz
        if (selectedQuizId) {
          apiService
            .get(`/quizzes/${selectedQuizId}/questions`)
            .then((response) => {
              const fetchedQuestions = response.data.data.questions;
              setQuestions((prev) => ({
                ...prev,
                [selectedQuizId]: fetchedQuestions,
              }));
              setTotalItemsQ(response.data.data.totalItems);
            })
            .catch((error) => {
              console.error("Error fetching updated questions:", error);
              setSnackbarMessage("Error fetching updated questions.");
              setSeverity("error");
              setSnackbarOpen(true);
            });
        }
      })
      .catch((error) => {
        console.error(
          "Xóa câu hỏi thất bại!",
          error.response?.data || error.message
        );
        setSnackbarMessage("Error deleting quizzes.");
        setSeverity("error");
        setSnackbarOpen(true);
      });
  };

  const renderQuestions = (questions: any[]) => {
    return questions.map((question, index) => {
      const correctAnswer = question.correctAnswer;
      const questionNumber = index + 1;
      switch (question.questionType) {
        case "MULTI_SELECT":
          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                margin: "16px 32px",
              }}
              key={question.questionId}
            >
              <Typography fontWeight={600}>
                <Checkbox
                  checked={selectedQuestions?.has(question.questionId)} // Use `has` for Sets
                  onChange={() => handleCheckboxQChange(question.questionId)}
                />{" "}
                {/* {`Câu hỏi ${questionNumber}: ${question.content}`} */}
                {`${question.content}`}{" "}
                <IconButton onClick={() => handleEditQuestion(question)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Typography>
              {question.image && (
                <img
                  src={question.image}
                  alt="question-image"
                  style={{ maxWidth: "50%", height: "auto" }}
                />
              )}
              {question.options.map((option, idx) => (
                <Box
                  key={idx}
                  sx={{ display: "flex", gap: 2, marginX: "32px" }}
                >
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
                sx={{ maxWidth: "200px" }}
              >
                Submit
              </Button>
            </Box>
          );

        case "MULTIPLE_CHOICE":
          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                margin: "16px 32px",
              }}
              key={question.questionId}
            >
              <Typography fontWeight={600}>
                <Checkbox
                  checked={selectedQuestions?.has(question.questionId)} // Use `has` for Sets
                  onChange={() => handleCheckboxQChange(question.questionId)}
                />{" "}
                {/* {`Câu hỏi ${questionNumber}: ${question.content}`} */}
                {`${question.content}`}{" "}
                <IconButton onClick={() => handleEditQuestion(question)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Typography>
              {question.image && (
                <img
                  src={question.image}
                  alt="question-image"
                  style={{ maxWidth: "50%", height: "auto" }}
                />
              )}
              {question.options.map((option, idx) => (
                <div key={idx}>
                  <Box sx={{ display: "flex", gap: 1, marginX: "32px" }}>
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
                sx={{ maxWidth: "100px" }}
              >
                Submit
              </Button>
            </Box>
          );

        case "FILL_IN_THE_BLANK":
          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                margin: "16px 32px",
              }}
              key={question.questionId}
            >
              <Typography fontWeight={600}>
                <Checkbox
                  checked={selectedQuestions?.has(question.questionId)} // Use `has` for Sets
                  onChange={() => handleCheckboxQChange(question.questionId)}
                />{" "}
                {/* {`Câu hỏi ${questionNumber}: ${question.content}`} */}
                {`${question.content}`}{" "}
                <IconButton onClick={() => handleEditQuestion(question)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Typography>
              <Box sx={{ marginX: "32px" }}>
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
                sx={{ maxWidth: "100px" }}
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
    setSelectedQuiz(null); // Reset selected quiz to ensure no previous quiz is selected.
    setDialogType("add"); // Set the dialogType to "add" explicitly.
    setOpenDialog(true); // Open the dialog.
  };
  const handleQuizUpdated = (updatedQuiz: any) => {
    if (dialogType === "add") {
      // When adding a new quiz, we don’t want to merge with any previous quiz data.
      setQuizzes((prev) => [...prev, updatedQuiz]);
      setSelectedQuiz(null); // Reset selected quiz after adding
      setDialogType(null); // Reset dialogType
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
  // const handleEditQuestion = (question: any) => {
  //   setSelectedQuiz(quiz);
  //   setDialogType("edit");
  //   setOpenDialog(true);
  // };
  const handleEditQuestion = (question: any) => {
    setSelectedQuestion(question);

    console.log("question", question.questionId);
    console.log("questionType", question.questionType);
    // setDialog("edit");
    setEditQuestionDialog(true);
  };
  const handleQuestionUpdated = (updatedQuestion: any) => {
    if (selectedQuizId) {
      setQuizzes((prevQuizzes) =>
        prevQuizzes.map((quiz) => {
          if (quiz.quizId === selectedQuizId) {
            return {
              ...quiz,
              // Check if quiz.questions is defined before calling .map()
              questions: Array.isArray(quiz.questions)
                ? quiz.questions.map((question) =>
                    question.questionId === updatedQuestion.questionId
                      ? updatedQuestion // Replace the old question with the updated one
                      : question
                  )
                : [], // If quiz.questions is not an array, return an empty array
            };
          }
          return quiz;
        })
      );
    }

    // Fetch updated questions for the selected quiz
    apiService
      .get(`/quizzes/${selectedQuizId}/questions`)
      .then((response) => {
        const fetchedQuestions = response.data.data.questions;
        setQuestions((prev) => ({
          ...prev,
          [selectedQuizId]: fetchedQuestions,
        }));
        setTotalItemsQ(response.data.data.totalItems);
      })
      .catch((error) => {
        console.error("Error fetching updated questions:", error);
      });

    // Notify the user about the update
    setSnackbarMessage("Cập nhật câu hỏi thành công!");
    setSeverity("success");
    setSnackbarOpen(true);
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
        console.log("responseQ", response);
        const newQuestion = response.data.data;

        // Log the selectedQuizId to confirm it's correct
        console.log("selectedQuizId", selectedQuizId);

        // Update the questions for the selected quiz
        const updatedQuiz = quizzes.map((quiz) => {
          if (quiz.quizId === selectedQuizId) {
            return {
              ...quiz,
              // Ensure that quiz.questions is an array
              questions: Array.isArray(quiz.questions)
                ? [...quiz.questions, newQuestion]
                : [newQuestion],
            };
          }
          return quiz;
        });

        // Log the updated quizzes array
        console.log("updatedQuizzes", updatedQuiz);
        setQuizzes(updatedQuiz); // Make sure state is updated

        // Fetch updated questions for the selected quiz
        apiService
          .get(`/quizzes/${selectedQuizId}/questions`)
          .then((response) => {
            const fetchedQuestions = response.data.data.questions;
            setQuestions((prev) => ({
              ...prev,
              [selectedQuizId]: fetchedQuestions,
            }));
            setTotalItemsQ(response.data.data.totalItems);
          })
          .catch((error) => {
            console.error("Error fetching updated questions:", error);
          });

        setSnackbarMessage(response.data.message || "Thêm câu hỏi thành công!");
        setSnackbarOpen(true);
        setOpenQuestionDialog(false);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error creating question:", error);

        setSnackbarMessage("ERR!");
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
            Quản lý Bài tập
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
          <Box sx={{ display: "flex" }}>
            <Typography variant="h6" sx={{ flex: 1 }}>
              Danh sách Bài tập
            </Typography>
            <Typography>Tổng số: {totalItems}</Typography>
          </Box>
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
                  border: "1px solid #CCC",
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
                    checked={selectedQuizzes.has(quiz.quizId)}
                    onChange={() => handleCheckboxChange(quiz.quizId)} // Trigger checkbox change
                  />
                  <Typography fontWeight={600}>{quiz.title}</Typography>
                  <IconButton onClick={() => handleEditQuiz(quiz)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  {expandedQuizId === quiz.quizId && (
                    <Typography fontWeight={600} sx={{ paddingLeft: 9 }}>
                      Tổng số: {totalItemsQ}
                    </Typography>
                  )}
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
              {/* {expandedQuizId === quiz.quizId && ( */}
              {expandedQuizId &&
                expandedQuizId === quiz.quizId &&
                questions[expandedQuizId] && (
                  <Box sx={{ border: "1px solid #CCC" }}>
                    {loadingQuestions[quiz.quizId] ? (
                      <CircularProgress size="30px" sx={{ color: "#99BC4D" }} />
                    ) : (
                      renderQuestions(questions[selectedQuizId] || [])
                    )}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                        margin: 2,
                      }}
                    >
                      <Button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 0 || loading}
                      >
                        Trang trước
                      </Button>
                      <Button
                        onClick={handleNextPage}
                        disabled={
                          totalItemsQ <= (currentPage + 1) * 10 || loading
                        }
                      >
                        Trang sau
                      </Button>
                    </Box>
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
        <EditQuestionDialog
          open={editQuestionDialog}
          onClose={() => setEditQuestionDialog(false)}
          onSave={handleQuestionUpdated}
          question={selectedQuestion?.questionId}
          type={selectedQuestion?.questionType}
        />
        <DeleteDialog
          open={openDeleteDialog}
          handleClose={handleDeleteDialogClose || handleDeleteQDialogClose}
          onDelete={() => {
            if (selectedQuestions.size > 0) {
              handleDeleteQuestions(); // Xóa câu hỏi
            } else if (selectedQuizzes.size > 0) {
              handleDeleteQuiz(); // Xóa bài kiểm tra
            }
          }}
          quantity={
            selectedQuestions.size > 0
              ? selectedQuestions.size
              : selectedQuizzes.size
          } // Hiển thị số lượng câu hỏi hoặc bài kiểm tra
          type={selectedQuestions.size > 0 ? "question" : "quiz"} // Xác định loại (question hoặc quiz) để xử lý
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
