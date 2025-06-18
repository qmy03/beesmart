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
import CloseIcon from "@mui/icons-material/Close";
interface Grade {
  gradeId: string;
  gradeName: string;
}

interface GradesResponse {
  data: {
    grades: Grade[];
  };
}
interface BookType {
  bookId: string;
  bookName: string;
}

interface BooksResponse {
  data: {
    bookTypes: BookType[];
  };
}

interface Subject {
  subjectId: string;
  subjectName: string;
}

interface SubjectsResponse {
  data: {
    subjects: Subject[];
  };
}

interface Topic {
  topicId: string;
  lessons: Lesson[];
}

interface TopicsResponse {
  data: {
    topics: Topic[];
  };
}

interface Lesson {
  lessonId: string;
  lessonName: string;
}

interface QuizzesResponse {
  data: {
    quizzes: any[];
    totalItems: number;
  };
  message?: string;
}

interface QuestionsResponse {
  data: {
    questions: any[];
    totalItems: number;
  };
}

const QuizPage = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [severity, setSeverity] = useState<"success" | "error">("success");
  // const accessToken = localStorage.getItem("accessToken");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { isLoading, setIsLoading } = useAuth();
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const [selectedGradeName, setSelectedGradeName] = useState<string>("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>("");
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [selectedBookName, setSelectedBookName] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("Học kì 1");
  const [topics, setTopics] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
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
  const [loadingQuestions, setLoadingQuestions] = useState<
    Record<string, boolean>
  >({});
  const [dialogType, setDialogType] = useState<"add" | "edit" | null>(null);
  const [editQuizData, setEditQuizData] = useState<any | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
  const [selectedQuizzes, setSelectedQuizzes] = useState<Set<string>>(
    new Set()
  );

  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      setAccessToken(token);
    }
  }, []);
  const handleInputChange = (questionId: string, answer: any) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const handleOpenDeleteDialog = (quizId: any) => {
    setQuizToDelete(quizId);

    const hasSelectedQuizzes = selectedQuizzes.size > 0;
    const hasSelectedQuestions = selectedQuestions.size > 0;

    if (hasSelectedQuizzes || hasSelectedQuestions) {
      setOpenDeleteDialog(true);
    } else {
      setOpenDeleteDialog(false);
    }
  };
  const handleCheckboxChange = (quizId: any) => {
    const updatedSelectedQuizzes = new Set(selectedQuizzes);

    if (updatedSelectedQuizzes.has(quizId)) {
      updatedSelectedQuizzes.delete(quizId);
    } else {
      updatedSelectedQuizzes.add(quizId);
    }

    setSelectedQuizzes(updatedSelectedQuizzes);

    if (updatedSelectedQuizzes.size > 0) {
      setQuizToDelete(quizId);
      setOpenDeleteDialog(true);
    } else {
      setOpenDeleteDialog(false);
    }
  };

  const handleCheckboxQChange = (questionId: any) => {
    const updatedSelectedQuestions = new Set(selectedQuestions);

    if (updatedSelectedQuestions.has(questionId)) {
      updatedSelectedQuestions.delete(questionId);
    } else {
      updatedSelectedQuestions.add(questionId);
    }

    setSelectedQuestions(updatedSelectedQuestions);

    if (updatedSelectedQuestions.size > 0) {
      setQuestionToDelete(questionId);
      setOpenDeleteDialog(true);
    } else {
      setOpenDeleteDialog(false);
    }
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
    setQuizToDelete(null);
  };
  const handleDeleteQDialogClose = () => {
    setOpenDeleteDialog(false);
    setQuestionToDelete(null);
  };

  useEffect(() => {
    if (accessToken) {
      setIsLoading(true);

      Promise.all([
        apiService.get<GradesResponse>("/grades", {}),
        apiService.get<BooksResponse>("/book-types", {}),
        apiService.get<SubjectsResponse>("/subjects", {}),
      ])
        .then(([gradesRes, booksRes, subjectsRes]) => {
          const fetchedGrades = gradesRes.data.data.grades;
          const fetchedBooks = booksRes.data.data.bookTypes;
          const fetchedSubjects = subjectsRes.data.data.subjects;

          setGrades(fetchedGrades);
          setBooks(fetchedBooks);
          setSubjects(fetchedSubjects);
          // Restore from localStorage if available
          const storedGradeName = localStorage.getItem("selectedGradeName");
          const storedGradeId = localStorage.getItem("selectedGradeId");
          const storedBookName = localStorage.getItem("selectedBookName");
          const storedBookId = localStorage.getItem("selectedBookId");
          const storedSubjectName = localStorage.getItem("selectedSubjectName");
          const storedSubjectId = localStorage.getItem("selectedSubjectId");
          const storedSemester = localStorage.getItem("selectedSemester");

          // Set default values sau khi tất cả API đã hoàn thành
          // if (fetchedGrades.length > 0) {
          //   setSelectedGradeId(fetchedGrades[0].gradeId);
          //   setSelectedGradeName(fetchedGrades[0].gradeName);
          // }
          // if (fetchedBooks.length > 0) {
          //   setSelectedBookId(fetchedBooks[0].bookId);
          //   setSelectedBookName(fetchedBooks[0].bookName);
          // }
          // if (fetchedSubjects.length > 0) {
          //   setSelectedSubjectId(fetchedSubjects[0].subjectId);
          //   setSelectedSubjectName(fetchedSubjects[0].subjectName);
          // }
          if (
            storedGradeName &&
            storedGradeId &&
            fetchedGrades.find((g) => g.gradeName === storedGradeName)
          ) {
            setSelectedGradeId(storedGradeId);
            setSelectedGradeName(storedGradeName);
          } else if (fetchedGrades.length > 0) {
            setSelectedGradeId(fetchedGrades[0].gradeId);
            setSelectedGradeName(fetchedGrades[0].gradeName);
            localStorage.setItem(
              "selectedGradeName",
              fetchedGrades[0].gradeName
            );
            localStorage.setItem("selectedGradeId", fetchedGrades[0].gradeId);
          }

          if (
            storedBookName &&
            storedBookId &&
            fetchedBooks.find((b) => b.bookName === storedBookName)
          ) {
            setSelectedBookId(storedBookId);
            setSelectedBookName(storedBookName);
          } else if (fetchedBooks.length > 0) {
            setSelectedBookId(fetchedBooks[0].bookId);
            setSelectedBookName(fetchedBooks[0].bookName);
            localStorage.setItem("selectedBookName", fetchedBooks[0].bookName);
            localStorage.setItem("selectedBookId", fetchedBooks[0].bookId);
          }

          if (
            storedSubjectName &&
            storedSubjectId &&
            fetchedSubjects.find((s) => s.subjectName === storedSubjectName)
          ) {
            setSelectedSubjectId(storedSubjectId);
            setSelectedSubjectName(storedSubjectName);
          } else if (fetchedSubjects.length > 0) {
            setSelectedSubjectId(fetchedSubjects[0].subjectId);
            setSelectedSubjectName(fetchedSubjects[0].subjectName);
            localStorage.setItem(
              "selectedSubjectName",
              fetchedSubjects[0].subjectName
            );
            localStorage.setItem(
              "selectedSubjectId",
              fetchedSubjects[0].subjectId
            );
          }

          if (storedSemester) {
            setSelectedSemester(storedSemester);
          } else {
            setSelectedSemester("Học kì 1");
            localStorage.setItem("selectedSemester", "Học kì 1");
          }

          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setIsLoading(false);
        });
    }
  }, [accessToken]);
  useEffect(() => {
    setTopics([]);
    setLessons([]);
    setSelectedTopicId(null);
    setSelectedLessonId(null);
    setQuizzes([]);
    if (
      selectedGradeName &&
      selectedSubjectName &&
      selectedBookName &&
      selectedSemester
    ) {
      setIsLoading(true);
      apiService
        .get<TopicsResponse>(
          `/topics/topic-lesson?grade=${selectedGradeName}&semester=${selectedSemester}&subject=${selectedSubjectName}&bookType=${selectedBookName}`
        )
        .then((response) => {
          const fetchedTopics = response.data.data.topics;
          setTopics(fetchedTopics);
          if (fetchedTopics.length > 0) {
            setSelectedTopicId(fetchedTopics[0].topicId);
            // Also set lessons for the first topic
            if (
              fetchedTopics[0].lessons &&
              fetchedTopics[0].lessons.length > 0
            ) {
              setLessons(fetchedTopics[0].lessons);
            }
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching topics:", error);
          setIsLoading(false);
          setTopics([]);
          setLessons([]);
          setSelectedTopicId(null);
          setSelectedLessonId(null);
          setIsLoading(false);
        });
    }
  }, [
    selectedGradeId,
    selectedSemester,
    selectedBookName,
    selectedSubjectName,
  ]);

  useEffect(() => {
    setLessons([]);
    setSelectedLessonId(null);
    setQuizzes([]);
    // if (selectedTopicId) {
    //   const selectedTopic = topics.find(
    //     (topic) => topic.topicId === selectedTopicId
    //   );
    //   if (selectedTopic) {
    //     setLessons(selectedTopic.lessons);
    //     setSelectedLessonId(null);
    //   }
    // }
    // console.log("selectedTopic", selectedTopicId);
    if (selectedTopicId && topics.length > 0) {
      const selectedTopic = topics.find(
        (topic) => topic.topicId === selectedTopicId
      );

      if (selectedTopic && selectedTopic.lessons) {
        setLessons(selectedTopic.lessons);
        // if (selectedTopic.lessons.length > 0) {
        //   setSelectedLessonId(selectedTopic.lessons[0].lessonId);
        // }
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
      setSelectedGradeName(selectedGradeItem.gradeName);
      localStorage.setItem("selectedGradeName", selectedGradeItem.gradeName);
      localStorage.setItem("selectedGradeId", selectedGradeItem.gradeId);
      setTopics([]);
      setLessons([]);
      setSelectedTopicId(null);
      setSelectedLessonId(null);
      setQuizzes([]);
    }
  };
  const handleBookChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedBook = event.target.value as string;
    const selectedBookItem = books.find(
      (book) => book.bookName === selectedBook
    );
    if (selectedBookItem) {
      setSelectedBookId(selectedBookItem.bookId);
      setSelectedBookName(selectedBookItem.bookName);
      localStorage.setItem("selectedBookName", selectedBookItem.bookName);
      localStorage.setItem("selectedBookId", selectedBookItem.bookId);
      setTopics([]);
      setLessons([]);
      setSelectedTopicId(null);
      setSelectedLessonId(null);
      setQuizzes([]);
    }
  };
  const handleSubjectChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const selectedSubject = event.target.value as string;
    const selectedSubjectItem = subjects.find(
      (subject) => subject.subjectName === selectedSubject
    );
    if (selectedSubjectItem) {
      setSelectedSubjectId(selectedSubjectItem.subjectId);
      setSelectedSubjectName(selectedSubjectItem.subjectName);
      localStorage.setItem(
        "selectedSubjectName",
        selectedSubjectItem.subjectName
      );
      localStorage.setItem("selectedSubjectId", selectedSubjectItem.subjectId);
      setTopics([]);
      setLessons([]);
      setSelectedTopicId(null);
      setSelectedLessonId(null);
      setQuizzes([]);
    }
  };

  const handleSemesterChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const semester = event.target.value as string;
    setSelectedSemester(semester);
    localStorage.setItem("selectedSemester", semester);
    // setSelectedSemester(event.target.value as string);
    setTopics([]);
    setLessons([]);
    setSelectedTopicId(null);
    setSelectedLessonId(null);
    setQuizzes([]);
  };

  const handleTopicChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedTopicId(event.target.value as string);
    setSelectedLessonId(null);
  };

  const handleLessonChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedLessonId(event.target.value as string);
  };
  useEffect(() => {
    if (selectedLessonId) {
      setIsLoading(true);
      apiService
        .get<QuizzesResponse>(`/lessons/${selectedLessonId}/quizzes`)
        .then((response) => {
          const quizzes = response.data.data.quizzes || []; // Ensure quizzes is an array
          setTotalItems(response.data.data.totalItems);
          setQuizzes(quizzes);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching quizzes:", error);
          setIsLoading(false);
        });
    } else if (selectedTopicId) {
      setIsLoading(true);
      apiService
        .get<QuizzesResponse>(`/topics/${selectedTopicId}/quizzes`)
        .then((response) => {
          const quizzes = response.data.data.quizzes || [];
          setTotalItems(response.data.data.totalItems);
          setQuizzes(quizzes);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching quizzes:", error);
          setIsLoading(false);
        });
    }
  }, [selectedLessonId, selectedTopicId]);

  const handleExpandQuiz = (quizId: string, page: number = 0) => {
    console.log("Expanding/collapsing quiz ID:", quizId);

    if (expandedQuizId === quizId) {
      setExpandedQuizId(null);
      setSelectedQuizId(null);
      return;
    }

    setQuestions((prev) => ({ ...prev, [quizId]: [] }));

    setLoadingQuestions((prev) => ({ ...prev, [quizId]: true }));
    setExpandedQuizId(quizId);
    setSelectedQuizId(quizId);
    setCurrentPage(page);

    apiService
      .get<QuestionsResponse>(`/quizzes/${quizId}/questions?page=${page}`)
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

    if (selectedQuizId) {
      console.log("Navigating to next page:", newPage);
      fetchQuestionsForPage(selectedQuizId, newPage);
    }
  };

  const handlePreviousPage = () => {
    const newPage = currentPage - 1;
    setCurrentPage(newPage);

    if (selectedQuizId) {
      console.log("Navigating to previous page:", newPage);
      fetchQuestionsForPage(selectedQuizId, newPage);
    }
  };

  const fetchQuestionsForPage = (quizId: string, page: number) => {
    setLoadingQuestions((prev) => ({ ...prev, [quizId]: true }));

    apiService
      .get<QuestionsResponse>(`/quizzes/${quizId}/questions?page=${page}`)
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

  const handleAnswerSubmit = (questionId: string, correctAnswer: any) => {
    let userAnswer = userAnswers[questionId];

    if (Array.isArray(userAnswer)) {
      userAnswer = userAnswer.sort();
    } else if (typeof userAnswer === "string") {
      userAnswer = [userAnswer];
    }

    let isCorrect = false;

    switch (correctAnswer?.constructor) {
      case Array:
        isCorrect =
          JSON.stringify(userAnswer.sort()) ===
          JSON.stringify(correctAnswer.sort());
        break;
      case String:
        isCorrect = userAnswer[0] === correctAnswer;
        break;
      default:
        isCorrect = userAnswer && userAnswer[0].trim() === correctAnswer[0];
        break;
    }

    if (isCorrect) {
      setSeverity("success");
      setSnackbarMessage("Đúng rồi!");
    } else {
      setSeverity("error");
      setSnackbarMessage("Sai rồi. Thử lại!");
    }

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

        setSelectedQuestions(new Set());

        if (selectedQuizId) {
          setLoadingQuestions((prev) => ({ ...prev, [selectedQuizId]: true }));
          apiService
            .get<QuestionsResponse>(
              `/quizzes/${selectedQuizId}/questions?page=${currentPage}`
            )
            .then((response) => {
              const fetchedQuestions = response.data.data.questions;
              setQuestions((prev) => ({
                ...prev,
                [selectedQuizId]: fetchedQuestions,
              }));
              setTotalItemsQ(response.data.data.totalItems);
              setLoadingQuestions((prev) => ({
                ...prev,
                [selectedQuizId]: false,
              }));
            })
            .catch((error) => {
              console.error("Error fetching updated questions:", error);
              setSnackbarMessage("Error fetching updated questions.");
              setSeverity("error");
              setSnackbarOpen(true);
              setLoadingQuestions((prev) => ({
                ...prev,
                [selectedQuizId]: false,
              }));
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
      const questionNumber = currentPage * 10 + index + 1;
      const validOptions =
        question.options?.filter(
          (option: string) => option && option.trim() !== ""
        ) || [];
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
                  sx={{
                    color: "#637381",
                    "&.Mui-checked, &.MuiCheckbox-indeterminate": {
                      color: "#99BC4D",
                    },
                    paddingX: 1,
                  }}
                  size="small"
                  checked={selectedQuestions?.has(question.questionId)}
                  onChange={() => handleCheckboxQChange(question.questionId)}
                />{" "}
                {`Câu ${questionNumber}: ${question.content}`}
                <IconButton onClick={() => handleEditQuestion(question)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Typography>
              {question.image && (
                <img
                  src={question.image}
                  alt="question-image"
                  style={{ maxWidth: "200px", height: "auto" }}
                />
              )}
              {validOptions.length > 0 &&
                validOptions.map((option: string, idx: number) => (
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
                Kiểm tra
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
                  sx={{
                    color: "#637381",
                    "&.Mui-checked, &.MuiCheckbox-indeterminate": {
                      color: "#99BC4D",
                    },
                    paddingX: 1,
                  }}
                  size="small"
                  checked={selectedQuestions?.has(question.questionId)}
                  onChange={() => handleCheckboxQChange(question.questionId)}
                />{" "}
                {`Câu ${questionNumber}: ${question.content}`}
                <IconButton onClick={() => handleEditQuestion(question)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Typography>
              {question.image && (
                <img
                  src={question.image}
                  alt="question-image"
                  style={{ maxWidth: "200px", height: "auto" }}
                />
              )}
              {validOptions.length > 0 &&
                validOptions.map((option: string, idx: number) => (
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
                Kiểm tra
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
                  sx={{
                    color: "#637381",
                    "&.Mui-checked, &.MuiCheckbox-indeterminate": {
                      color: "#99BC4D",
                    },
                    paddingX: 1,
                  }}
                  size="small"
                  checked={selectedQuestions?.has(question.questionId)}
                  onChange={() => handleCheckboxQChange(question.questionId)}
                />{" "}
                {`Câu ${questionNumber}: ${question.content}`}
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
                    style={{ maxWidth: "200px", height: "auto" }}
                  />
                )}
              </Box>
              <Button
                onClick={() =>
                  handleAnswerSubmit(question.questionId, question.answers)
                }
                sx={{ maxWidth: "100px" }}
              >
                Kiểm tra
              </Button>
            </Box>
          );

        default:
          return null;
      }
    });
  };
  const handleOpenAddDialog = () => {
    setSelectedQuiz(null);
    setDialogType("add");
    setOpenDialog(true);
  };
  const handleQuizUpdated = (updatedQuiz: any) => {
    if (dialogType === "add") {
      setQuizzes((prev) => [...prev, updatedQuiz]);
      setSelectedQuiz(null);
      setDialogType(null);
    } else if (dialogType === "edit") {
      setQuizzes((prev) =>
        prev.map((quiz) =>
          quiz.quizId === updatedQuiz.quizId ? updatedQuiz : quiz
        )
      );
      setDialogType(null);
    }
  };

  const handleEditQuiz = (quiz: any) => {
    setSelectedQuiz(quiz);
    setDialogType("edit");
    setOpenDialog(true);
  };
  const handleEditQuestion = (question: any) => {
    setSelectedQuestion(question);

    console.log("question", question.questionId);
    console.log("questionType", question.questionType);
    setEditQuestionDialog(true);
  };
  const handleQuestionUpdated = (updatedQuestion: any) => {
    if (!selectedQuizId) return; // guard nếu null thì không tiếp tục

    setQuizzes((prevQuizzes) =>
      prevQuizzes.map((quiz) => {
        if (quiz.quizId === selectedQuizId) {
          return {
            ...quiz,
            questions: Array.isArray(quiz.questions)
              ? quiz.questions.map((question: any) =>
                  question.questionId === updatedQuestion.questionId
                    ? updatedQuestion
                    : question
                )
              : [],
          };
        }
        return quiz;
      })
    );

    apiService
      .get<QuestionsResponse>(`/quizzes/${selectedQuizId}/questions`)
      .then((response) => {
        const fetchedQuestions = response.data.data.questions;
        setQuestions((prev) => ({
          ...prev,
          [selectedQuizId!]: fetchedQuestions,
        }));
        setTotalItemsQ(response.data.data.totalItems);
      })
      .catch((error) => {
        console.error("Error fetching updated questions:", error);
      });

    setSnackbarMessage("Cập nhật câu hỏi thành công!");
    setSeverity("success");
    setSnackbarOpen(true);
  };

  const handleCreateQuestion = (questionData: any) => {
    if (!selectedQuizId) {
      console.error("No quiz selected");
      return;
    }

    setIsLoading(true);

    apiService
      .post<QuizzesResponse>(
        `/questions/quiz/${selectedQuizId}`,
        questionData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then((response) => {
        console.log("responseQ", response);
        const newQuestion = response.data.data;

        console.log("selectedQuizId", selectedQuizId);

        const updatedQuiz = quizzes.map((quiz) => {
          if (quiz.quizId === selectedQuizId) {
            return {
              ...quiz,
              questions: Array.isArray(quiz.questions)
                ? [...quiz.questions, newQuestion]
                : [newQuestion],
            };
          }
          return quiz;
        });

        console.log("updatedQuizzes", updatedQuiz);
        setQuizzes(updatedQuiz);

        const newTotalItems = totalItemsQ + 1;
        const pageOfNewQuestion = Math.floor((newTotalItems - 1) / 10);

        apiService
          .get<QuestionsResponse>(
            `/quizzes/${selectedQuizId}/questions?page=${pageOfNewQuestion}`
          )
          .then((response) => {
            const fetchedQuestions = response.data.data.questions;
            setQuestions((prev) => ({
              ...prev,
              [selectedQuizId]: fetchedQuestions,
            }));
            setTotalItemsQ(response.data.data.totalItems);
            setCurrentPage(pageOfNewQuestion);
          })
          .catch((error) => {
            console.error("Error fetching updated questions:", error);
          });

        setSnackbarMessage(response.data.message || "Thêm câu hỏi thành công!");
        setSnackbarOpen(true);
        setOpenQuestionDialog(false);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error creating question:", error);

        setSnackbarMessage("ERR!");
        setSnackbarOpen(true);
        setOpenQuestionDialog(false);
        setIsLoading(false);
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
          height: "100%",
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

        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl fullWidth size="small">
            <TextField
              select
              value={selectedGradeName}
              onChange={handleGradeChange}
              label="Chọn lớp học"
              fullWidth
            >
              {grades.map((grade) => (
                <MenuItem
                  key={grade.gradeId}
                  value={grade.gradeName}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "#BCD181 !important",
                      color: "white",
                    },
                    "&:hover": { backgroundColor: "#BCD181" },
                  }}
                >
                  {grade.gradeName}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>
          <FormControl fullWidth size="small">
            <TextField
              select
              value={selectedSubjectName}
              onChange={handleSubjectChange}
              label="Chọn môn học"
              fullWidth
            >
              {subjects.map((subject) => (
                <MenuItem
                  key={subject.subjectId}
                  value={subject.subjectName}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "#BCD181 !important",
                      color: "white",
                      opacity: 1,
                    },
                    "&:hover": {
                      backgroundColor: "#BCD181",
                    },
                  }}
                >
                  {subject.subjectName}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>
          <FormControl fullWidth size="small">
            <TextField
              select
              value={selectedBookName}
              onChange={handleBookChange}
              label="Chọn loại sách"
              fullWidth
            >
              {books.map((book) => (
                <MenuItem
                  key={book.bookId}
                  value={book.bookName}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "#BCD181 !important",
                      color: "white",
                      opacity: 1,
                    },
                    "&:hover": {
                      backgroundColor: "#BCD181",
                    },
                  }}
                >
                  {book.bookName}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>

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

          {/* <FormControl fullWidth size="small">
            <TextField
              select
              value={selectedTopicId ?? ""}
              onChange={handleTopicChange}
              label="Chọn chủ đề"
              fullWidth
              InputLabelProps={{
                shrink: selectedTopicId ? true : false,
              }}
            >
              {topics.map((topic) => (
                <MenuItem
                  key={topic.topicId}
                  value={topic.topicId}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "#BCD181 !important",
                      color: "white",
                    },
                    "&:hover": { backgroundColor: "#BCD181" },
                  }}
                >
                  {topic.topicName}
                </MenuItem>
              ))}
            </TextField>
          </FormControl> */}
          <FormControl fullWidth size="small">
            <TextField
              select
              value={selectedTopicId ?? ""}
              onChange={handleTopicChange}
              label="Chọn chủ đề"
              fullWidth
              InputLabelProps={{
                shrink: selectedTopicId ? true : false,
              }}
            >
              {topics.length === 0 ? (
                <MenuItem disabled value="">
                  Không có chủ đề
                </MenuItem>
              ) : (
                topics.map((topic) => (
                  <MenuItem
                    key={topic.topicId}
                    value={topic.topicId}
                    sx={{
                      "&.Mui-selected": {
                        backgroundColor: "#BCD181 !important",
                        color: "white",
                      },
                      "&:hover": { backgroundColor: "#BCD181" },
                    }}
                  >
                    {topic.topicName}
                  </MenuItem>
                ))
              )}
            </TextField>
          </FormControl>

          <FormControl fullWidth size="small">
            <TextField
              select
              value={selectedLessonId ?? ""}
              onChange={handleLessonChange}
              label="Chọn bài học"
              fullWidth
              InputLabelProps={{
                shrink: selectedLessonId ? true : false,
              }}
              InputProps={{
                endAdornment: selectedLessonId && (
                  <IconButton
                    onClick={() => setSelectedLessonId(null)}
                    size="small"
                    sx={{ marginRight: 1 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                ),
              }}
            >
              {lessons.map((lesson) => (
                <MenuItem
                  key={lesson.lessonId}
                  value={lesson.lessonId}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "#BCD181 !important",
                      color: "white",
                    },
                    "&:hover": { backgroundColor: "#BCD181" },
                  }}
                >
                  {lesson.lessonName}
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
                borderRadius: "8px",
                padding: "8px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #CCC",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexGrow: 1,
                    gap: 1,
                  }}
                >
                  <Checkbox
                    sx={{
                      color: "#637381",
                      "&.Mui-checked, &.MuiCheckbox-indeterminate": {
                        color: "#99BC4D",
                      },
                      paddingX: 1,
                    }}
                    size="small"
                    checked={selectedQuizzes.has(quiz.quizId)}
                    onChange={() => handleCheckboxChange(quiz.quizId)}
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
                    onClick={() => setOpenQuestionDialog(true)}
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

              {expandedQuizId === quiz.quizId && (
                <Box sx={{ border: "1px solid #CCC" }}>
                  {loadingQuestions[quiz.quizId] ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        padding: 3,
                      }}
                    >
                      <CircularProgress size="30px" sx={{ color: "#99BC4D" }} />
                    </Box>
                  ) : selectedQuizId ? (
                    renderQuestions(questions[selectedQuizId] || [])
                  ) : null}
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
                      disabled={currentPage === 0 || isLoading}
                    >
                      Trang trước
                    </Button>
                    <Button
                      onClick={handleNextPage}
                      disabled={
                        totalItemsQ <= (currentPage + 1) * 10 || isLoading
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
          open={
            openDeleteDialog &&
            (selectedQuestions.size > 0 || selectedQuizzes.size > 0)
          }
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
          }
          type={selectedQuestions.size > 0 ? "question" : "quiz"}
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
