"use client";

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
  IconButton,
  Snackbar,
  Alert,
  TablePagination,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import apiService from "@/app/untils/api";
import TextField from "@/app/components/textfield";
import DialogPopup from "./dialog-popup";
import EditIcon from "@mui/icons-material/Edit";
import DeleteDialog from "@/app/components/admin/delete-dialog";

interface Grade {
  gradeId: string;
  gradeName: string;
}

interface Subject {
  subjectId: string;
  subjectName: string;
}

interface Book {
  bookId: string;
  bookName: string;
}

interface Topic {
  topicId: number;
  topicName: string;
}

interface GradesResponse {
  data: {
    grades: Grade[];
  };
}

interface BooksResponse {
  data: {
    bookTypes: Book[];
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

interface DeleteResponse {
  message: string;
}

const TopicPage = () => {
  const { accessToken, isLoading, setIsLoading } = useAuth();
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
  const [topicsLoading, setTopicsLoading] = useState<boolean>(false); // New loading state for topics
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [openDelete, setOpenDelete] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [editMode, setEditMode] = useState<"add" | "edit">("add");
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);

  const isSelected = (topicId: number): boolean => {
    return selected.includes(topicId);
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchKeyword);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchKeyword]);

  // Fetch grades, subjects, and books
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
          handleSnackbarOpen("Lỗi khi tải dữ liệu", "error");
        });
    }
  }, [accessToken]);

  // Fetch topics with separate loading state
  useEffect(() => {
    if (selectedGradeName && selectedSubjectName && selectedBookName && selectedSemester) {
      setTopicsLoading(true); // Use separate loading state
      apiService
        .get<TopicsResponse>(
          `/topics?grade=${selectedGradeName}&semester=${selectedSemester}&search=${debouncedSearch}&page=${page}&size=${rowsPerPage}&subject=${selectedSubjectName}&bookType=${selectedBookName}`,
          {}
        )
        .then((response) => {
          setTopics(response.data.data.topics);
          setTotalItems(response.data.data.totalItems);
          setTopicsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching topics:", error);
          setTopicsLoading(false);
          handleSnackbarOpen("Lỗi khi tải chủ điểm", "error");
        });
    }
  }, [
    selectedGradeName,
    selectedSubjectName,
    selectedBookName,
    selectedSemester,
    debouncedSearch,
    page,
    rowsPerPage,
    accessToken,
  ]);

  const handleGradeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedGrade = event.target.value as string;
    const selectedGradeItem = grades.find((grade) => grade.gradeName === selectedGrade);
    if (selectedGradeItem) {
      setSelectedGradeId(selectedGradeItem.gradeId);
      setSelectedGradeName(selectedGradeItem.gradeName);
      setPage(0); // Reset page when changing grade
    }
  };

  const handleBookChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedBook = event.target.value as string;
    const selectedBookItem = books.find((book) => book.bookName === selectedBook);
    if (selectedBookItem) {
      setSelectedBookId(selectedBookItem.bookId);
      setSelectedBookName(selectedBookItem.bookName);
      setPage(0); // Reset page when changing book
    }
  };

  const handleSubjectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedSubject = event.target.value as string;
    const selectedSubjectItem = subjects.find(
      (subject) => subject.subjectName === selectedSubject
    );
    if (selectedSubjectItem) {
      setSelectedSubjectId(selectedSubjectItem.subjectId);
      setSelectedSubjectName(selectedSubjectItem.subjectName);
      setPage(0); // Reset page when changing subject
    }
  };

  const handleSemesterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedSemester(event.target.value as string);
    setPage(0); // Reset page when changing semester
  };

  const handleOpenDialog = () => {
    setEditMode("add");
    setSelectedTopic(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleTopicAdded = () => {
    if (selectedGradeName && selectedSubjectName && selectedBookName && selectedSemester) {
      setTopicsLoading(true); // Use separate loading state
      setPage(0); // Reset to first page to show latest topics
      apiService
        .get<TopicsResponse>(
          `/topics?grade=${selectedGradeName}&semester=${selectedSemester}&search=${debouncedSearch}&page=0&size=${rowsPerPage}&subject=${selectedSubjectName}&bookType=${selectedBookName}`,
          {}
        )
        .then((response) => {
          setTopics(response.data.data.topics);
          setTotalItems(response.data.data.totalItems);
          setTopicsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching topics after add:", error);
          setTopicsLoading(false);
          handleSnackbarOpen("Lỗi khi tải lại danh sách chủ điểm", "error");
        });
    }
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (topics.length > 0) {
      if (event.target.checked) {
        const newSelected = topics.map((topic) => topic.topicId);
        setSelected(newSelected);
        setOpenDelete(true);
      } else {
        setSelected([]);
        setOpenDelete(false);
      }
    }
  };

  const handleCloseDelete = () => {
    setSelected([]);
    setOpenDelete(false);
  };

  const handleDelete = async () => {
    try {
      const response = await apiService.delete<DeleteResponse>("/topics", {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: selected,
      });
      handleSnackbarOpen(response.data.message, "success");
      setSelected([]);
      handleTopicAdded(); // Refresh topic list
    } catch (error: any) {
      console.error("Failed to delete topics:", error.message);
      handleSnackbarOpen("Xóa chủ đề thất bại", "error");
    }
  };

  const handleCheckboxClick = (event: React.ChangeEvent<HTMLInputElement>, topicId: number) => {
    const updatedSelected = event.target.checked
      ? [...selected, topicId]
      : selected.filter((id) => id !== topicId);
    setSelected(updatedSelected);
    setOpenDelete(updatedSelected.length > 0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenEdit = (topic: any) => {
    setEditMode("edit");
    setSelectedTopic(topic);
    setOpenDialog(true);
  };

  const handleSnackbarOpen = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Layout>
      <Box sx={{ display: "flex", flexDirection: "column", padding: "0 10px", gap: 1, height: "100%" }}>
        <Box sx={{ display: "flex", padding: "4px 8px", alignItems: "center", boxShadow: 4, borderRadius: "8px" }}>
          <Typography fontWeight={700} flexGrow={1}>Quản lý Chủ điểm</Typography>
          <Button onClick={handleOpenDialog}>Thêm mới</Button>
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
                    "&.Mui-selected": { backgroundColor: "#BCD181 !important", color: "white", opacity: 1 },
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
                    "&.Mui-selected": { backgroundColor: "#BCD181 !important", color: "white", opacity: 1 },
                    "&:hover": { backgroundColor: "#BCD181" },
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
                    "&.Mui-selected": { backgroundColor: "#BCD181 !important", color: "white", opacity: 1 },
                    "&:hover": { backgroundColor: "#BCD181" },
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
                  "&.Mui-selected": { backgroundColor: "#99BC4D !important", color: "white" },
                  "&:hover": { backgroundColor: "#99BC4D 70%" },
                }}
              >
                Học kì 1
              </MenuItem>
              <MenuItem
                value="Học kì 2"
                sx={{
                  "&.Mui-selected": { backgroundColor: "#99BC4D !important", color: "white" },
                  "&:hover": { backgroundColor: "#99BC4D 70%" },
                }}
              >
                Học kì 2
              </MenuItem>
            </TextField>
          </FormControl>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, minHeight: 0 }}>
          <Box sx={{ boxShadow: 4, borderRadius: 2, display: "flex", flexDirection: "column", height: "100%", mb: 1 }}>
            <TableContainer sx={{ borderRadius: "8px 8px 0 0", flexGrow: 1, overflow: "auto" }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: "#FFFBF3" }}>
                  <TableRow>
                    <TableCell sx={{ width: "5%", border: "none" }}></TableCell>
                    <TableCell sx={{ width: "10%", border: "none" }}></TableCell>
                    <TableCell sx={{ width: "15%", border: "none" }}>Thứ tự</TableCell>
                    <TableCell sx={{ width: "70%", border: "none" }}>Tên chủ điểm</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ width: "5%" }}>
                      <Checkbox
                        indeterminate={selected.length > 0 && topics.length > 0 && selected.length < topics.length}
                        sx={{
                          color: "#637381",
                          "&.Mui-checked, &.MuiCheckbox-indeterminate": { color: "#99BC4D" },
                          p: 0,
                          ml: 1.5,
                        }}
                        checked={topics.length > 0 && selected.length === topics.length}
                        onChange={handleSelectAllClick}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ width: "10%" }}></TableCell>
                    <TableCell sx={{ width: "15%" }}>
                      <TextField
                        sx={{ p: 0, m: 0, bgcolor: "#EAEDF0", borderRadius: "4px" }}
                        disabled
                      ></TextField>
                    </TableCell>
                    <TableCell sx={{ width: "70%" }}>
                      <TextField
                        sx={{ p: 0, m: 0, bgcolor: "#FFF", borderRadius: "4px" }}
                        placeholder="Tìm kiếm..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                      ></TextField>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topicsLoading ? ( // Use separate loading state instead of isLoading
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{paddingY: "12px"}}>
                        Đang tải dữ liệu...
                      </TableCell>
                    </TableRow>
                  ) : topics.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{paddingY: "12px"}}>
                       Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  ) : (
                    topics.map((topic, index) => {
                      const isItemSelected = isSelected(topic.topicId);
                      return (
                        <TableRow key={topic.topicId}>
                          <TableCell>
                            <Checkbox
                              size="small"
                              checked={isItemSelected}
                              sx={{
                                color: "#637381",
                                "&.Mui-checked": { color: "#99BC4D" },
                                p: 0,
                                ml: 1.5,
                              }}
                              onChange={(event) => handleCheckboxClick(event, topic.topicId)}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton>
                              <EditIcon
                                fontSize="small"
                                sx={{ color: "#637381", cursor: "pointer" }}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleOpenEdit(topic);
                                }}
                              />
                            </IconButton>
                          </TableCell>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{topic.topicName}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalItems}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 25, 50]}
            />
          </Box>
        </Box>

        <DialogPopup
          open={openDialog}
          onClose={handleCloseDialog}
          onTopicAdded={handleTopicAdded}
          accessToken={accessToken ?? ""}
          selectedGradeId={selectedGradeId}
          selectedSemester={selectedSemester}
          selectedSubjectId={selectedSubjectId}
          selectedBookId={selectedBookId}
          type={editMode}
          topic={selectedTopic}
          onSuccess={(message: string) => {
            handleSnackbarOpen(message, "success");
            handleTopicAdded();
          }}
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
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default TopicPage;