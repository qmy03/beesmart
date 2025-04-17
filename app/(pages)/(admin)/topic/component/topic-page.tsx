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
  colors,
  IconButton,
  Snackbar,
  Alert,
  TablePagination,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import apiService from "@/app/untils/api";
import theme from "@/app/components/theme";
import TextField from "@/app/components/textfield";
import DialogPopup from "./dialog-popup";
import EditIcon from "@mui/icons-material/Edit";
import DeleteDialog from "@/app/components/admin/delete-dialog";

const TopicPage = () => {
  const { accessToken, isLoading, setIsLoading } = useAuth(); // Lấy accessToken từ context
  const [grades, setGrades] = useState<any[]>([]); // State để lưu danh sách lớp học
  const [selectedGradeId, setSelectedGradeId] = useState<string>(""); // State để lưu gradeId
  const [selectedGradeName, setSelectedGradeName] = useState<string>(""); // State để lưu gradeName
  const [subjects, setSubjects] = useState<any[]>([]); // State để lưu danh sách môn học
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(""); // State để lưu subjectId
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>(""); // State để lưu subjectName
  const [books, setBooks] = useState<any[]>([]); // State để lưu danh sách loại sách
  const [selectedBookId, setSelectedBookId] = useState<string>(""); // State để lưu bookTypeId
  const [selectedBookName, setSelectedBookName] = useState<string>(""); // State để lưu bookTypeName
  const [selectedSemester, setSelectedSemester] = useState<string>("Học kì 1"); // State để lưu học kỳ đã chọn
  const [topics, setTopics] = useState<any[]>([]); // State để lưu các topics
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState<readonly number[]>([]);
  // Thêm state quản lý snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Trạng thái mở/đóng Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Nội dung thông báo
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  ); // Loại thông báo (success/error)
  const [openDelete, setOpenDelete] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const isSelected = (topicId: number): boolean => {
    return selected.includes(topicId); // Kiểm tra nếu topicId đã được chọn
  };
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Thêm state để quản lý chế độ edit và topic được chọn
  const [editMode, setEditMode] = useState<"add" | "edit">("add");
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchKeyword);
    }, 300); // Delay 300ms
    return () => clearTimeout(handler);
  }, [searchKeyword]);
  // Hàm mở Snackbar
  const handleSnackbarOpen = (
    message: string,
    severity: "success" | "error"
  ) => {
    setSnackbarMessage(message); // Đặt nội dung thông báo
    setSnackbarSeverity(severity); // Đặt loại thông báo
    setSnackbarOpen(true); // Mở Snackbar
  };

  // Hàm đóng Snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false); // Đóng Snackbar
  };

  const handleOpenEdit = (topic: any) => {
    setEditMode("edit");
    setSelectedTopic(topic);
    setOpenDialog(true);
  };

  useEffect(() => {
    if (accessToken) {
      setIsLoading(true);
      apiService
        .get("/grades", {
          // headers: {
          //   Authorization: `Bearer ${accessToken}`, // Thêm accessToken vào header
          // },
        })
        .then((response) => {
          const fetchedGrades = response.data.data.grades;
          setGrades(fetchedGrades); // Lưu danh sách lớp học vào state
          if (fetchedGrades.length > 0) {
            const firstGrade = fetchedGrades[0];
            setSelectedGradeId(firstGrade.gradeId); // Đặt selectedGradeId là gradeId của lớp học đầu tiên
            setSelectedGradeName(firstGrade.gradeName); // Đặt selectedGradeName là tên lớp học đầu tiên
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching grades:", error);
          setIsLoading(false);
        });
    }
  }, [accessToken]);
  useEffect(() => {
    if (accessToken) {
      setIsLoading(true);
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
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching grades:", error);
          setIsLoading(false);
        });
    }
  }, [accessToken]);
  useEffect(() => {
    if (accessToken) {
      setIsLoading(true);
      apiService
        .get("/subjects", {
          // headers: {
          //   Authorization: `Bearer ${accessToken}`, // Thêm accessToken vào header
          // },
        })
        .then((response) => {
          const fetchedSubjects = response.data.data.subjects;
          setSubjects(fetchedSubjects); // Lưu danh sách lớp học vào state
          if (fetchedSubjects.length > 0) {
            const firstSubject = fetchedSubjects[0];
            setSelectedSubjectId(firstSubject.subjectId); // Đặt selectedGradeId là gradeId của lớp học đầu tiên
            setSelectedSubjectName(firstSubject.subjectName); // Đặt selectedGradeName là tên lớp học đầu tiên
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching grades:", error);
          setIsLoading(false);
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
      setIsLoading(true);
      // Gọi API để lấy topics theo gradeId và semester
      apiService
        .get(
          `/topics?grade=${selectedGradeName}&semester=${selectedSemester}&search=${debouncedSearch}&page=${page}&subject=${selectedSubjectName}&bookType=${selectedBookName}`,
          {
            // headers: {
            //   Authorization: `Bearer ${accessToken}`,
            // },
          }
        )
        .then((response) => {
          console.log("response", response);
          setTopics(response.data.data.topics); // Lưu danh sách topics vào state
          setTotalItems(response.data.data.totalItems);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching topics:", error);
          setIsLoading(false);
        });
    }
  }, [
    selectedGradeName,
    selectedSemester,
    accessToken,
    debouncedSearch,
    selectedBookName,
    selectedSubjectName,
  ]); // Chạy lại khi gradeId hoặc semester thay đổi

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
    setEditMode("add");
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  useEffect(() => {
    if (
      selectedGradeName &&
      selectedSemester &&
      selectedBookName &&
      selectedSubjectName
    ) {
      setIsLoading(true);
      apiService
        .get(
          `/topics?grade=${selectedGradeName}&semester=${selectedSemester}&search=${debouncedSearch}&page=${page}&subject=${selectedSubjectName}&bookType=${selectedBookName}`
        )
        .then((response) => {
          setTopics(response.data.data.topics); // Set topics data
          // Set total items and total pages for pagination
          setTotalItems(response.data.data.totalItems);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching topics:", error);
          setIsLoading(false);
        });
    }
  }, [selectedGradeName, selectedSemester, page, rowsPerPage, accessToken]);

  // Refresh topics list after adding a new topic
  const handleTopicAdded = () => {
    // Re-fetch topics after adding a new one
    if (
      selectedGradeName &&
      selectedSemester &&
      selectedBookName &&
      selectedSubjectName
    ) {
      setIsLoading(true);
      apiService
        .get(
          `/topics?grade=${selectedGradeName}&semester=${selectedSemester}&search=${debouncedSearch}&page=${page}&subject=${selectedSubjectName}&bookType=${selectedBookName}`
        )
        .then((response) => {
          setTopics(response.data.data.topics);
          setTotalItems(response.data.data.totalItems);
          // handleSnackbarOpen(response.data.message, "success");
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching topics:", error);
          setIsLoading(false);
        });
    }
  };
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (topics.length > 0) {
      if (event.target.checked) {
        const newSelected = topics.map((topic) => topic.topicId);
        setSelected(newSelected);
        setOpenDelete(true); // Mở DeleteDialog nếu chọn tất cả
      } else {
        setSelected([]);
        setOpenDelete(false); // Đóng DeleteDialog nếu bỏ chọn tất cả
      }
    }
  };

  const handleCloseDelete = () => {
    setSelected([]); // Đảm bảo xóa tất cả các mục đã chọn
    setOpenDelete(false); // Đóng DeleteDialog
  };
  const handleDelete = async () => {
    try {
      const response = await apiService.delete("/topics", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        data: selected, // Send selected topics to delete
      });

      console.log("Delete response: ", response);

      // Show success snackbar message
      handleSnackbarOpen(response.data.message, "success");

      // Clear selected items after delete
      setSelected([]);

      // Reload topics list after delete
      if (
        selectedGradeName &&
        selectedSemester &&
        selectedBookName &&
        selectedSubjectName
      ) {
        setIsLoading(true);
        apiService
          .get(
            `/topics?grade=${selectedGradeName}&semester=${selectedSemester}&search=${debouncedSearch}&page=${page}&subject=${selectedSubjectName}&bookType=${selectedBookName}`
          )
          .then((response) => {
            setTopics(response.data.data.topics); // Update topics state
            setTotalItems(response.data.data.totalItems);
            setIsLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching topics after delete:", error);
            setIsLoading(false);
          });
      }
    } catch (error: any) {
      console.error("Failed to delete topics: ", error.message);

      // Show error snackbar message
      handleSnackbarOpen("Xóa chủ đề thất bại", "error");
      setIsLoading(false);
    }
  };

  const handleCheckboxClick = (
    event: React.ChangeEvent<HTMLInputElement>,
    topicId: number
  ) => {
    const updatedSelected = event.target.checked
      ? [...selected, topicId] // Thêm topicId nếu checkbox được chọn
      : selected.filter((id) => id !== topicId); // Loại bỏ topicId nếu checkbox bị bỏ chọn

    setSelected(updatedSelected);

    // Kiểm tra nếu không có checkbox nào được chọn
    if (updatedSelected.length === 0) {
      setOpenDelete(false); // Đóng DeleteDialog
    } else {
      setOpenDelete(true); // Mở DeleteDialog
    }
  };
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
            Quản lý Chủ điểm
          </Typography>
          {/* {editMode === "add" && ( */}
          <Button onClick={handleOpenDialog}>Thêm mới</Button>
          {/* )} */}
        </Box>

        {/* Các Select */}
        <Box sx={{ display: "flex", gap: 2 }}>
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

        {/* Bảng danh sách topic */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              boxShadow: 4,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              mb: 1,
            }}
          >
            <TableContainer
              sx={{
                borderRadius: "8px 8px 0 0",
                flexGrow: 1,
                overflow: "auto", // Enable vertical scrolling if content overflows
              }}
            >
              <Table size="small">
                <TableHead sx={{ backgroundColor: "#FFFBF3" }}>
                  <TableRow>
                    <TableCell sx={{ width: "5%", border: "none" }}></TableCell>
                    <TableCell
                      sx={{ width: "10%", border: "none" }}
                    ></TableCell>
                    <TableCell sx={{ width: "15%", border: "none" }}>
                      Thứ tự
                    </TableCell>
                    <TableCell sx={{ width: "70%", border: "none" }}>
                      Tên chủ điểm
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ width: "5%" }}>
                      <Checkbox
                        indeterminate={
                          selected.length > 0 &&
                          topics.length > 0 &&
                          selected.length < topics.length
                        }
                        sx={{
                          color: "#637381",
                          "&.Mui-checked, &.MuiCheckbox-indeterminate": {
                            color: "#99BC4D",
                          },
                          p: 0,
                          ml: 1.5,
                        }}
                        checked={
                          topics.length > 0 && selected.length === topics.length
                        }
                        onChange={handleSelectAllClick}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ width: "10%" }}></TableCell>
                    <TableCell sx={{ width: "15%" }}>
                      <TextField
                        sx={{
                          p: 0,
                          m: 0,
                          bgcolor: "#EAEDF0",
                          borderRadius: "4px",
                        }}
                        disabled
                      ></TextField>
                    </TableCell>
                    <TableCell sx={{ width: "70%" }}>
                      <TextField
                        sx={{
                          p: 0,
                          m: 0,
                          bgcolor: "#FFF",
                          borderRadius: "4px",
                        }}
                        placeholder="Tìm kiếm..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                      ></TextField>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    // Hiển thị thông báo "Đang tải dữ liệu..." khi dữ liệu đang được tải
                    <TableRow>
                      {/* <TableCell colSpan={4} align="center">
                        Đang tải dữ liệu...
                      </TableCell> */}
                    </TableRow>
                  ) : topics.length === 0 ? (
                    // Hiển thị thông báo "Không có dữ liệu để hiển thị" khi không có dữ liệu
                    <TableRow>
                      {/* <TableCell colSpan={4} align="center">
                        Không có dữ liệu để hiển thị
                      </TableCell> */}
                    </TableRow>
                  ) : (
                    // Hiển thị danh sách dữ liệu nếu có
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
                              onChange={(event) =>
                                handleCheckboxClick(event, topic.topicId)
                              }
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
              count={totalItems} // Total number of items (use the state we set from API response)
              page={page}
              onPageChange={handleChangePage} // Function to handle page change
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage} // Function to handle change in number of rows per page
              rowsPerPageOptions={[10, 25, 50]} // Options for number of rows per page
            />
          </Box>
        </Box>

        <DialogPopup
          open={openDialog}
          onClose={handleCloseDialog}
          onTopicAdded={handleTopicAdded}
          accessToken={accessToken}
          selectedGradeId={selectedGradeId}
          selectedSemester={selectedSemester}
          selectedSubjectId={selectedSubjectId}
          selectedBookId={selectedBookId}
          type={editMode} // "add" hoặc "edit"
          topic={selectedTopic} // Dữ liệu topic khi sửa
          onSuccess={(message: string) => {
            handleSnackbarOpen(message, "success");
            handleTopicAdded(); // Làm mới danh sách topics
          }}
        />
      </Box>
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

export default TopicPage;
