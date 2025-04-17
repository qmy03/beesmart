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
import CloseIcon from "@mui/icons-material/close";
import DeleteDialog from "@/app/components/admin/delete-dialog";

const LessonPage = () => {
  const { accessToken } = useAuth(); // Lấy accessToken từ context
  const [grades, setGrades] = useState<any[]>([]); // State để lưu danh sách lớp học
  const [selectedGradeId, setSelectedGradeId] = useState<string>(""); // State để lưu gradeId
  const [selectedGradeName, setSelectedGradeName] = useState<string>(""); // State để lưu gradeName
  const [selectedSemester, setSelectedSemester] = useState<string>("Học kì 1"); // State để lưu học kỳ đã chọn
  const [subjects, setSubjects] = useState<any[]>([]); // State để lưu danh sách môn học
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(""); // State để lưu subjectId
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>(""); // State để lưu subjectName
  const [books, setBooks] = useState<any[]>([]); // State để lưu danh sách loại sách
  const [selectedBookId, setSelectedBookId] = useState<string>(""); // State để lưu bookTypeId
  const [selectedBookName, setSelectedBookName] = useState<string>(""); // State để lưu bookTypeName
  const [topics, setTopics] = useState<any[]>([]); // State để lưu các topics
  const [loading, setLoading] = useState(false); // State để xử lý loading
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [checkedState, setCheckedState] = useState<Record<number, Set<number>>>(
    {}
  );
  const isTopicExpanded = (topicId: number) => expandedRows.has(topicId);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Trạng thái mở/đóng Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Nội dung thông báo
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
        totalLessons += topic.lessons.length + 1; // Topic + lessons
      } else {
        totalLessons += 1;
      }
    });

    return totalLessons;
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    console.log("Changing to page:", newPage); // Add logging

    // Ensure newPage doesn't exceed the total pages
    const totalPages = Math.ceil(topics.length / rowsPerPage);
    if (newPage < totalPages) {
      setPage(newPage);
    } else {
      setPage(totalPages - 1); // Set to last page if next page is out of bounds
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to the first page when rows per page change

    // If the number of rows exceeds 10, automatically go to the next page
    if (newRowsPerPage === 10 && topics.length > 10) {
      setPage(1); // Move to next page
    }
  };

  // Pagination
  const paginatedTopics = topics.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );
  const isSelected = (topicId: number): boolean => {
    return selected.includes(topicId); // Kiểm tra nếu topicId đã được chọn
  };
  // Thêm state để quản lý chế độ edit và topic được chọn
  const [editMode, setEditMode] = useState<"add" | "edit">("add");
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const handleSnackbarOpen = (
    message: string,
    severity: "success" | "error"
  ) => {
    setSnackbarMessage(message); // Đặt nội dung thông báo
    setSnackbarSeverity(severity); // Đặt loại thông báo
    setSnackbarOpen(true); // Mở Snackbar
  };
  useEffect(() => {
    fetchTopics();
  }, [selectedGradeId, selectedSemester, accessToken, debouncedSearch]);

  // Hàm đóng Snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false); // Đóng Snackbar
  };
  // Toggle expand/collapse for a topic
  const handleExpandClick = (topicId: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(topicId)) {
      newExpandedRows.delete(topicId);
    } else {
      newExpandedRows.add(topicId);
    }
    setExpandedRows(newExpandedRows);
  };
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null); // State để lưu lessonId được chọn

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null); // Add state for selected topicId

  const handleEditLesson = (lessonId: string, topicId: string) => {
    console.log("Lesson ID:", lessonId);
    console.log("Topic ID:", topicId); // Log topicId to check

    setSelectedLessonId(lessonId); // Save lessonId to state
    setSelectedTopicId(topicId); // Save topicId to state
    setEditMode("edit"); // Switch to edit mode
    setOpenDialog(true); // Open the dialog
  };

  const handleOpenEdit = (lessonId: string, topicId: string) => {
    setEditMode("edit"); // Switch to edit mode
    setSelectedLessonId(lessonId); // Set lessonId
    setSelectedTopicId(topicId); // Set topicId
    setOpenDialog(true); // Open the dialog
  };

  useEffect(() => {
    if (accessToken) {
      setLoading(true);
      apiService
        .get("/grades")
        .then((response) => {
          const fetchedGrades = response.data.data.grades;
          setGrades(fetchedGrades); // Lưu danh sách lớp học vào state
          if (fetchedGrades.length > 0) {
            const firstGrade = fetchedGrades[0];
            setSelectedGradeId(firstGrade.gradeId); // Đặt selectedGradeId là gradeId của lớp học đầu tiên
            setSelectedGradeName(firstGrade.gradeName); // Đặt selectedGradeName là tên lớp học đầu tiên
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching grades:", error);
          setLoading(false);
        });
    }
  }, [accessToken]); // Chạy lại khi accessToken thay đổi
  useEffect(() => {
    if (accessToken) {
      setLoading(true);
      apiService
        .get("/book-types", {
          // headers: {
          //   Authorization: `Bearer ${accessToken}`, // Thêm accessToken vào header
          // },
        })
        .then((response) => {
          const fetchedBooks = response.data.data.bookTypes;
          setBooks(fetchedBooks); // Lưu danh sách lớp học vào state
          if (fetchedBooks.length > 0) {
            const firstBook = fetchedBooks[0];
            setSelectedBookId(firstBook.bookId); // Đặt selectedGradeId là gradeId của lớp học đầu tiên
            setSelectedBookName(firstBook.bookName); // Đặt selectedGradeName là tên lớp học đầu tiên
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
    if (accessToken) {
      setLoading(true);
      apiService
        .get("/subjects", {
          // headers: {
          //   Authorization: `Bearer ${accessToken}`, // Thêm accessToken vào header
          // },
        })
        .then((response) => {
          const fetchedSubjects = response.data.data.subjects;
          console.log("Fetched subjects:", fetchedSubjects); // Log fetched subjects
          setSubjects(fetchedSubjects); // Lưu danh sách lớp học vào state
          if (fetchedSubjects.length > 0) {
            const firstSubject = fetchedSubjects[0];
            setSelectedSubjectId(firstSubject.subjectId); // Đặt selectedGradeId là gradeId của lớp học đầu tiên
            setSelectedSubjectName(firstSubject.subjectName); // Đặt selectedGradeName là tên lớp học đầu tiên
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching grades:", error);
          setLoading(false);
        });
    }
  }, [accessToken]); // Chạy lại khi accessToken thay đổi
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
  }, [selectedGradeName, selectedSemester, accessToken, selectedBookName, selectedSubjectName]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(
        `/topics?grade=${selectedGradeName}&semester=${selectedSemester}&search=${debouncedSearch}&page=${page}&subject=${selectedSubjectName}&bookType=${selectedBookName}`
      );
      setTopics(response.data.data.topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  }; // Chạy lại khi gradeId hoặc semester thay đổi

  const handleGradeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedGrade = event.target.value as string;
    // Lấy gradeId tương ứng với gradeName được chọn
    const selectedGradeItem = grades.find(
      (grade) => grade.gradeName === selectedGrade
    );
    if (selectedGradeItem) {
      setSelectedGradeId(selectedGradeItem.gradeId);
      setSelectedGradeName(selectedGradeItem.gradeName); // Hiển thị tên lớp học đã chọn
    }
  };

  const handleBookChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedBook = event.target.value as string;
    // Lấy gradeId tương ứng với gradeName được chọn
    const selectedBookItem = books.find(
      (book) => book.bookName === selectedBook
    );
    if (selectedBookItem) {
      setSelectedBookId(selectedBookItem.bookId);
      setSelectedBookName(selectedBookItem.bookName); // Hiển thị tên lớp học đã chọn
    }
  };
  const handleSubjectChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const selectedSubject = event.target.value as string;
    // Lấy gradeId tương ứng với gradeName được chọn
    const selectedSubjectItem = subjects.find(
      (subject) => subject.subjectName === selectedSubject
    );
    if (selectedSubjectItem) {
      setSelectedSubjectId(selectedSubjectItem.subjectId);
      setSelectedSubjectName(selectedSubjectItem.subjectName); // Hiển thị tên lớp học đã chọn
    }
  };

  const handleSemesterChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setSelectedSemester(event.target.value as string);
  };
  // Open dialog
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Refresh topics list after adding a new topic
  const handleTopicAdded = () => {
    // Re-fetch topics after adding a new one
    if (
      selectedGradeName &&
      selectedSemester &&
      selectedBookName &&
      selectedSubjectName
    ) {
      setLoading(true);
      apiService
        .get(
          `/topics?grade=${selectedGradeName}&semester=${selectedSemester}&search=${debouncedSearch}&page=${page}&subject=${selectedSubjectName}&bookType=${selectedBookName}`
        )
        .then((response) => {
          setTopics(response.data.data.topics);
          setTotalItems(response.data.data.totalItems);
          // handleSnackbarOpen(response.data.message, "success");
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching topics:", error);
          setLoading(false);
        });
    }
  };
  const handleTopicCheckboxChange = (topicId: number, isChecked: boolean) => {
    setCheckedState((prevState) => {
      const updatedState = { ...prevState };

      if (isChecked) {
        // Chọn tất cả các bài học trong topic
        const allLessons =
          topics
            .find((topic) => topic.topicId === topicId)
            ?.lessons.map((lesson) => lesson.lessonId) || [];
        updatedState[topicId] = new Set(allLessons);

        // Kiểm tra nếu topic có lesson nào không, nếu có thì hiển thị nút xóa
        if (allLessons.length > 0) {
          setOpenDelete(true); // Hiển thị nút xóa
        } else {
          setOpenDelete(false); // Không có lesson nào, ẩn nút xóa
        }
      } else {
        // Bỏ chọn tất cả các bài học trong topic
        updatedState[topicId] = new Set();
        setOpenDelete(false); // Nếu bỏ chọn topic, ẩn nút xóa
      }

      return updatedState;
    });

    // Cập nhật trạng thái selected dựa trên việc chọn topic
    setSelected((prevSelected) => {
      if (isChecked) {
        // Thêm tất cả bài học của topic vào selected
        const topicLessons =
          topics
            .find((topic) => topic.topicId === topicId)
            ?.lessons.map((lesson) => lesson.lessonId) || [];
        return [...new Set([...prevSelected, ...topicLessons])];
      } else {
        // Loại bỏ các bài học của topic khỏi selected
        const topicLessons =
          topics
            .find((topic) => topic.topicId === topicId)
            ?.lessons.map((lesson) => lesson.lessonId) || [];
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

  // Update the number of selected lessons for deletion
  const handleDelete = async () => {
    if (selected.length === 0) {
      handleSnackbarOpen(
        "Please select at least one lesson to delete",
        "error"
      );
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.delete("/lessons", {
        data: selected, // Send selected lesson IDs to delete
        headers: {
          Authorization: `Bearer ${accessToken}`, // Add token
        },
      });
      if (response.status === 200) {
        handleSnackbarOpen(response.data.message, "success");
        setSelected([]); // Clear selected lessons
        setOpenDelete(false); // Close the delete dialog
        await fetchTopics();
      }
    } catch (error) {
      console.error("Failed to delete lessons:", error);
      handleSnackbarOpen("Failed to delete lessons", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDelete = () => {
    setSelected([]); // Đảm bảo xóa tất cả các mục đã chọn
    setOpenDelete(false); // Đóng DeleteDialog
  };

  const handleCheckboxClick = (
    event: React.ChangeEvent<HTMLInputElement>,
    topicId: number
  ) => {
    const updatedSelected = event.target.checked
      ? [...selected, topicId] // Add topicId if checked
      : selected.filter((id) => id !== topicId); // Remove topicId if unchecked

    setSelected(updatedSelected);

    // Check if no checkbox is selected
    if (updatedSelected.length === 0) {
      setOpenDelete(false); // Close the DeleteDialog
    } else {
      setOpenDelete(true); // Open DeleteDialog
    }

    // Handle opening the topic
    if (event.target.checked) {
      handleExpandClick(topicId); // Expand the selected topic when checked
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

        {/* Các Select */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl fullWidth size="small">
            <TextField
              select
              value={selectedSubjectName} // Hiển thị gradeName đã chọn
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
                      backgroundColor: "#BCD181 !important", // Chỉnh màu khi item được chọn
                      color: "white",
                      opacity: 1,
                    },
                    "&:hover": {
                      backgroundColor: "#BCD181", // Màu khi hover
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
              value={selectedBookName} // Hiển thị gradeName đã chọn
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
                      backgroundColor: "#BCD181 !important", // Chỉnh màu khi item được chọn
                      color: "white",
                      opacity: 1,
                    },
                    "&:hover": {
                      backgroundColor: "#BCD181", // Màu khi hover
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
              value={selectedGradeName} // Hiển thị gradeName đã chọn
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
                      backgroundColor: "#BCD181 !important", // Chỉnh màu khi item được chọn
                      color: "white",
                      opacity: 1,
                    },
                    "&:hover": {
                      backgroundColor: "#BCD181", // Màu khi hover
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
              value={selectedSemester}
              onChange={handleSemesterChange}
              label="Chọn học kì"
              fullWidth
            >
              <MenuItem
                value="Học kì 1"
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "#99BC4D !important", // Chỉnh màu khi item được chọn
                    color: "white",
                  },
                  "&:hover": {
                    backgroundColor: "#99BC4D 70%", // Màu khi hover
                  },
                }}
              >
                Học kì 1
              </MenuItem>
              <MenuItem
                value="Học kì 2"
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "#99BC4D !important", // Chỉnh màu khi item được chọn
                    color: "white",
                  },
                  "&:hover": {
                    backgroundColor: "#99BC4D 70%", // Màu khi hover
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
            marginY: 1,
            bgcolor: "#FFF",
            borderRadius: "4px",
          }}
          label="Tìm kiếm"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {searchKeyword && (
                  <IconButton onClick={() => setSearchKeyword("")} edge="end">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />
        <Box>
          <>
            <Box
              sx={{
                boxShadow: 4,
                borderRadius: 2,
              }}
            >
              <TableContainer
                sx={{
                  // boxShadow: 4,
                  borderRadius: 2,
                  flex: 1,
                  height: "60vh",
                  // width: "76vw", // Set a fixed height for the table
                  overflow: "auto", // Enable vertical scrolling if content overflows
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
                      <TableCell sx={{ width: "30%" }}>Tên bài học</TableCell>
                      <TableCell sx={{ width: "30%" }}>Mô tả</TableCell>
                      {/* <TableCell sx={{ width: "25%" }}></TableCell> */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow></TableRow>
                    ) : (
                      paginatedTopics.map((topic) => (
                        <>
                          {/* Topic row */}
                          <TableRow key={topic.topicId}>
                            <TableCell>
                              <Checkbox
                                sx={{ p: 0, m: 0 }}
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
                            {/* <TableCell></TableCell> */}
                            <TableCell></TableCell>
                          </TableRow>
                          {expandedRows.has(topic.topicId) &&
                            topic.lessons.map((lesson) => (
                              <TableRow key={lesson.lessonId}>
                                <TableCell>
                                  <Checkbox
                                    sx={{ p: 0, m: 0 }}
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
                                {/* <TableCell>{lesson.content}</TableCell> */}
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
              />
            </Box>
          </>
          {/* )} */}
        </Box>
      </Box>
      <DialogPopup
        open={openDialog}
        onClose={handleCloseDialog}
        onTopicAdded={handleTopicAdded}
        accessToken={accessToken}
        selectedGradeId={selectedGradeId}
        selectedSemester={selectedSemester}
        type={editMode} // "add" hoặc "edit"
        topic={selectedTopic} // Dữ liệu topic khi sửa
        lesson={selectedLessonId} // Dữ liệu lesson khi sửa
        topicId={selectedTopicId} // Dữ liệu topicId khi sửa
        selectedGradeName={selectedGradeName}
        onSuccess={(message: string) => {
          handleSnackbarOpen(message, "success");
          handleTopicAdded(); // Làm mới danh sách topics
        }}
        selectedBookName={selectedBookName}
        selectedSubjectName={selectedSubjectName} // Dữ liệu subjectId khi sửa
      />
      <DeleteDialog
        open={openDelete}
        handleClose={handleCloseDelete}
        quantity={selected.length}
        onDelete={handleDelete}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000} // Đóng sau 3 giây
        onClose={handleSnackbarClose} // Đóng khi người dùng nhấn
        anchorOrigin={{ vertical: "top", horizontal: "right" }} // Vị trí
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity} // success hoặc error
          sx={{ width: "100%" }}
        >
          {snackbarMessage} {/* Nội dung thông báo */}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default LessonPage;
