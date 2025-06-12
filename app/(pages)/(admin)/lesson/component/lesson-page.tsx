"use client";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import Layout from "@/app/components/admin/layout";
import { Button } from "@/app/components/button";
import { AuthProvider, useAuth } from "@/app/hooks/AuthContext";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  Checkbox,
  colors,
  IconButton,
  Snackbar,
  Alert,
  TablePagination,
  InputAdornment,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import apiService from "@/app/untils/api";
import theme from "@/app/components/theme";
import TextField from "@/app/components/textfield";
import DialogPopup from "./dialog-popup";
import EditIcon from "@mui/icons-material/Edit";
import Close from "@mui/icons-material/Close";
import DeleteDialog from "@/app/components/admin/delete-dialog";
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

interface Subject {
  subjectId: string;
  subjectName: string;
}

interface Lesson {
  lessonId: number;
  lessonName: string;
}

interface Topic {
  topicId: number;
  topicName: string;
  lessons: Lesson[];
}

interface BookTypesResponse {
  data: {
    bookTypes: BookType[];
  };
}

interface SubjectsResponse {
  data: {
    subjects: Subject[];
  };
}

interface TopicsResponse {
  data: {
    topics: Topic[];
    totalItems: number;
  };
}
type ApiResponse = {
  message: string;
};

const LessonPage = () => {
  const accessToken = localStorage.getItem("accessToken");
  const { isLoading, setIsLoading } = useAuth();
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const [selectedGradeName, setSelectedGradeName] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("Học kì 1");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>("");
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [selectedBookName, setSelectedBookName] = useState<string>("");
  const [topics, setTopics] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [checkedState, setCheckedState] = useState<Record<number, Set<number>>>(
    {}
  );
  const isTopicExpanded = (topicId: number) => expandedRows.has(topicId);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [openDelete, setOpenDelete] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchKeyword);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchKeyword]);
  const getTotalLessonsCount = () => {
    let totalLessons = 0;

    topics.forEach((topic) => {
      if (isTopicExpanded(topic.topicId)) {
        totalLessons += topic.lessons.length + 1;
      } else {
        totalLessons += 1;
      }
    });

    return totalLessons;
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    console.log("Changing to page:", newPage);

    const totalPages = Math.ceil(topics.length / rowsPerPage);
    if (newPage < totalPages) {
      setPage(newPage);
    } else {
      setPage(totalPages - 1);
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);

    if (newRowsPerPage === 10 && topics.length > 10) {
      setPage(1);
    }
  };

  const paginatedTopics = topics.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );
  const isSelected = (topicId: number): boolean => {
    return selected.includes(topicId);
  };
  const [editMode, setEditMode] = useState<"add" | "edit">("add");
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const handleSnackbarOpen = (
    message: string,
    severity: "success" | "error"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  useEffect(() => {
    fetchTopics();
  }, [selectedGradeId, selectedSemester, accessToken, debouncedSearch]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  const handleExpandClick = (topicId: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(topicId)) {
      newExpandedRows.delete(topicId);
    } else {
      newExpandedRows.add(topicId);
    }
    setExpandedRows(newExpandedRows);
  };
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const handleEditLesson = (lessonId: string, topicId: string) => {
    console.log("Lesson ID:", lessonId);
    console.log("Topic ID:", topicId);

    setSelectedLessonId(lessonId);
    setSelectedTopicId(topicId);
    setEditMode("edit");
    setOpenDialog(true);
  };

  const handleOpenEdit = (lessonId: string, topicId: string) => {
    setEditMode("edit");
    setSelectedLessonId(lessonId);
    setSelectedTopicId(topicId);
    setOpenDialog(true);
  };

  useEffect(() => {
    if (accessToken) {
      setIsLoading(true);

      Promise.all([
        apiService.get<GradesResponse>("/grades", {}),
        apiService.get<BookTypesResponse>("/book-types", {}),
        apiService.get<SubjectsResponse>("/subjects", {}),
      ])
        .then(([gradesRes, booksRes, subjectsRes]) => {
          const fetchedGrades = gradesRes.data.data.grades;
          const fetchedBooks = booksRes.data.data.bookTypes;
          const fetchedSubjects = subjectsRes.data.data.subjects;

          setGrades(fetchedGrades);
          setBooks(fetchedBooks);
          setSubjects(fetchedSubjects);

          // Set default values sau khi tất cả API đã hoàn thành
          if (fetchedGrades.length > 0) {
            setSelectedGradeId(fetchedGrades[0].gradeId);
            setSelectedGradeName(fetchedGrades[0].gradeName);
          }
          if (fetchedBooks.length > 0) {
            setSelectedBookId(fetchedBooks[0].bookId);
            setSelectedBookName(fetchedBooks[0].bookName);
          }
          if (fetchedSubjects.length > 0) {
            setSelectedSubjectId(fetchedSubjects[0].subjectId);
            setSelectedSubjectName(fetchedSubjects[0].subjectName);
          }

          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setIsLoading(false);
        });
    }
  }, [accessToken]);
  console.log("selectedGradeId", selectedGradeId);
  console.log("selectedSemester", selectedSemester);
  useEffect(() => {
    if (
      selectedGradeName &&
      selectedSemester &&
      selectedBookName &&
      selectedSubjectName
    ) {
      fetchTopics();
    }
  }, [
    selectedGradeName,
    selectedSemester,
    accessToken,
    selectedBookName,
    selectedSubjectName,
  ]);

  const fetchTopics = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get<TopicsResponse>(
        `/topics?grade=${selectedGradeName}&semester=${selectedSemester}&search=${debouncedSearch}&page=${page}&subject=${selectedSubjectName}&bookType=${selectedBookName}`
      );
      setTopics(response.data.data.topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedGrade = event.target.value as string;
    setSearchKeyword("");
    const selectedGradeItem = grades.find(
      (grade) => grade.gradeName === selectedGrade
    );
    if (selectedGradeItem) {
      setSelectedGradeId(selectedGradeItem.gradeId);
      setSelectedGradeName(selectedGradeItem.gradeName);
    }
  };

  const handleBookChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedBook = event.target.value as string;
    setSearchKeyword("");
    const selectedBookItem = books.find(
      (book) => book.bookName === selectedBook
    );
    if (selectedBookItem) {
      setSelectedBookId(selectedBookItem.bookId);
      setSelectedBookName(selectedBookItem.bookName);
    }
  };
  const handleSubjectChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const selectedSubject = event.target.value as string;
    setSearchKeyword("");
    const selectedSubjectItem = subjects.find(
      (subject) => subject.subjectName === selectedSubject
    );
    if (selectedSubjectItem) {
      setSelectedSubjectId(selectedSubjectItem.subjectId);
      setSelectedSubjectName(selectedSubjectItem.subjectName);
    }
  };

  const handleSemesterChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setSelectedSemester(event.target.value as string);
    setSearchKeyword("");
  };
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleTopicAdded = () => {
    if (
      selectedGradeName &&
      selectedSemester &&
      selectedBookName &&
      selectedSubjectName
    ) {
      setIsLoading(true);
      apiService
        .get<TopicsResponse>(
          `/topics?grade=${selectedGradeName}&semester=${selectedSemester}&search=${debouncedSearch}&page=${page}&subject=${selectedSubjectName}&bookType=${selectedBookName}`
        )
        .then((response) => {
          setTopics(response.data.data.topics);
          setTotalItems(response.data.data.totalItems);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching topics:", error);
          setIsLoading(false);
        });
    }
  };
  const handleTopicCheckboxChange = (topicId: number, isChecked: boolean) => {
    setCheckedState((prevState) => {
      const updatedState: { [key: number]: Set<number> } = { ...prevState };

      const topic = topics.find((t) => t.topicId === topicId);
      const allLessons: number[] =
        topic?.lessons.map((lesson: Lesson) => lesson.lessonId) || [];

      if (isChecked) {
        updatedState[topicId] = new Set(allLessons);
        setOpenDelete(allLessons.length > 0);
      } else {
        updatedState[topicId] = new Set();
        setOpenDelete(false);
      }

      return updatedState;
    });

    setSelected((prevSelected) => {
      const topicLessons =
        topics
          .find((t) => t.topicId === topicId)
          ?.lessons.map((lesson: Lesson) => lesson.lessonId) || [];

      if (isChecked) {
        return [...new Set([...prevSelected, ...topicLessons])];
      } else {
        return prevSelected.filter(
          (lessonId) => !topicLessons.includes(lessonId)
        );
      }
    });
  };

  const handleLessonCheckboxChange = (
    topicId: number,
    lessonId: number,
    isChecked: boolean
  ) => {
    setCheckedState((prevState) => {
      const updatedState = { ...prevState };
      console.log("Updated state:", updatedState);
      if (!updatedState[topicId]) {
        updatedState[topicId] = new Set();
      }

      if (isChecked) {
        updatedState[topicId].add(lessonId);
      } else {
        updatedState[topicId].delete(lessonId);
      }
      if (updatedState[topicId].size === 0) {
        setOpenDelete(false);
      }
      return updatedState;
    });

    setSelected((prevSelected) => {
      if (isChecked) {
        return [...new Set([...prevSelected, lessonId])];
      } else {
        return prevSelected.filter((id) => id !== lessonId);
      }
    });
  };

  const handleDelete = async () => {
    if (selected.length === 0) {
      handleSnackbarOpen(
        "Please select at least one lesson to delete",
        "error"
      );
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiService.delete<ApiResponse>("/lessons", {
        data: selected,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.status === 200) {
        handleSnackbarOpen(response.data.message, "success");
        setSelected([]);
        setOpenDelete(false);
        await fetchTopics();
      }
    } catch (error) {
      console.error("Failed to delete lessons:", error);
      handleSnackbarOpen("Failed to delete lessons", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDelete = () => {
    setSelected([]);
    setOpenDelete(false);
  };

  const handleCheckboxClick = (
    event: React.ChangeEvent<HTMLInputElement>,
    topicId: number
  ) => {
    const updatedSelected = event.target.checked
      ? [...selected, topicId]
      : selected.filter((id) => id !== topicId);

    setSelected(updatedSelected);

    if (updatedSelected.length === 0) {
      setOpenDelete(false);
    } else {
      setOpenDelete(true);
    }

    if (event.target.checked) {
      handleExpandClick(topicId);
    }
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
            Quản lý Bài học
          </Typography>
          <Button
            onClick={() => {
              setEditMode("add");
              setOpenDialog(true);
            }}
          >
            Thêm mới
          </Button>
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
                      opacity: 1,
                    },
                    "&:hover": {
                      backgroundColor: "#BCD181",
                    },
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
              <MenuItem
                value="Học kì 1"
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "#99BC4D !important",
                    color: "white",
                  },
                  "&:hover": {
                    backgroundColor: "#99BC4D 70%",
                  },
                }}
              >
                Học kì 1
              </MenuItem>
              <MenuItem
                value="Học kì 2"
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "#99BC4D !important",
                    color: "white",
                  },
                  "&:hover": {
                    backgroundColor: "#99BC4D 70%",
                  },
                }}
              >
                Học kì 2
              </MenuItem>
            </TextField>
          </FormControl>
        </Box>
        <TextField
          sx={{
            marginTop: 0,
            marginBottom: 1,
            bgcolor: "#FFF",
            borderRadius: "4px",
          }}
          label="Tìm kiếm"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          inputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {searchKeyword && (
                  <IconButton onClick={() => setSearchKeyword("")} edge="end">
                    <Close fontSize="small" />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />
        <Box
          sx={{
            boxShadow: 4,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            flexGrow: 1,
            minHeight: 0,
            mb: 1,
            overflow: "hidden",
          }}
        >
          <TableContainer
            sx={{
              borderRadius: "8px 8px 0 0",
              flexGrow: 1,
              overflow: "auto",
              maxHeight: "calc(100% - 52px)",
            }}
          >
            <Table size="small">
              <TableHead sx={{ backgroundColor: "#FFFBF3" }}>
                <TableRow>
                  <TableCell sx={{ width: "5%" }}>
                    <IconButton></IconButton>
                  </TableCell>
                  <TableCell sx={{ width: "5%" }}></TableCell>
                  <TableCell sx={{ width: "30%", paddingY: "12px" }}>
                    Tên chủ điểm
                  </TableCell>
                  <TableCell sx={{ width: "40%" }}>Tên bài học</TableCell>
                  <TableCell sx={{ width: "20%" }}>Mô tả</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow></TableRow>
                ) : (
                  paginatedTopics.map((topic) => (
                    <>
                      <TableRow key={topic.topicId}>
                        <TableCell>
                          <Checkbox
                            sx={{
                              color: "#637381",
                              "&.Mui-checked, &.MuiCheckbox-indeterminate": {
                                color: "#99BC4D",
                              },
                              p: 0,
                            }}
                            size="small"
                            checked={
                              checkedState[topic.topicId]?.size ===
                              (topic.lessons?.length || 0)
                            }
                            indeterminate={
                              checkedState[topic.topicId]?.size > 0 &&
                              checkedState[topic.topicId]?.size <
                                (topic.lessons?.length || 0)
                            }
                            onChange={(event) =>
                              handleTopicCheckboxChange(
                                topic.topicId,
                                event.target.checked
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleExpandClick(topic.topicId)}
                          >
                            {expandedRows.has(topic.topicId) ? (
                              <ExpandLess fontSize="small" />
                            ) : (
                              <ExpandMore fontSize="small" />
                            )}
                          </IconButton>
                        </TableCell>

                        <TableCell>{topic.topicName}</TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      {expandedRows.has(topic.topicId) &&
                        topic.lessons.map((lesson: any) => (
                          <TableRow key={lesson.lessonId}>
                            <TableCell>
                              <Checkbox
                                sx={{
                                  color: "#637381",
                                  "&.Mui-checked, &.MuiCheckbox-indeterminate":
                                    {
                                      color: "#99BC4D",
                                    },
                                  p: 0,
                                }}
                                size="small"
                                checked={
                                  checkedState[topic.topicId]?.has(
                                    lesson.lessonId
                                  ) || false
                                }
                                onChange={(event) =>
                                  handleLessonCheckboxChange(
                                    topic.topicId,
                                    lesson.lessonId,
                                    event.target.checked
                                  )
                                }
                                onClick={() => setOpenDelete(true)}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() =>
                                  handleEditLesson(
                                    lesson.lessonId,
                                    topic.topicId
                                  )
                                }
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                            <TableCell sx={{ paddingLeft: 5 }}>
                              Bài học số {lesson.lessonNumber}
                            </TableCell>
                            <TableCell>{lesson.lessonName}</TableCell>
                            <TableCell>{lesson.description}</TableCell>
                          </TableRow>
                        ))}
                    </>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={getTotalLessonsCount()}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ flexShrink: 0 }}
          />
        </Box>
      </Box>
      {/* <DialogPopup
        open={openDialog}
        onClose={handleCloseDialog}
        onTopicAdded={handleTopicAdded}
        accessToken={accessToken ?? ""}
        selectedGradeId={selectedGradeId}
        selectedSemester={selectedSemester}
        type={editMode}
        topic={selectedTopic}
        lesson={selectedLessonId ?? ""}
        topicId={selectedTopicId}
        selectedGradeName={selectedGradeName}
        onSuccess={(message: string) => {
          handleSnackbarOpen(message, "success");
          handleTopicAdded();
        }}
        selectedBookName={selectedBookName}
        selectedSubjectName={selectedSubjectName}
      /> */}
      <DialogPopup
        open={openDialog}
        onClose={handleCloseDialog}
        onTopicAdded={handleTopicAdded}
        accessToken={accessToken ?? ""}
        selectedGradeId={selectedGradeId}
        selectedSemester={selectedSemester}
        type={editMode}
        topic={selectedTopic}
        lesson={selectedLessonId ?? ""}
        topicId={selectedTopicId}
        selectedGradeName={selectedGradeName}
        onSuccess={(message: string) => {
          handleSnackbarOpen(message, "success");
          handleTopicAdded();
        }}
        selectedBookName={selectedBookName}
        selectedSubjectName={selectedSubjectName}
        selectedLessonId={selectedLessonId} // <-- Add this line
      />

      <DeleteDialog
        open={openDelete}
        handleClose={handleCloseDelete}
        quantity={selected.length}
        onDelete={handleDelete}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default LessonPage;
