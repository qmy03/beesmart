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
} from "@mui/material";
import React, { useState, useEffect } from "react";
import apiService from "@/app/untils/api";
import theme from "@/app/components/theme";
import TextField from "@/app/components/textfield";
import DialogPopup from "./dialog-popup";
import EditIcon from "@mui/icons-material/Edit";
import DeleteDialog from "@/app/components/admin/delete-dialog";

const TopicPage = () => {
  const { accessToken } = useAuth(); // Lấy accessToken từ context
  const [grades, setGrades] = useState<any[]>([]); // State để lưu danh sách lớp học
  const [selectedGradeId, setSelectedGradeId] = useState<string>(""); // State để lưu gradeId
  const [selectedGradeName, setSelectedGradeName] = useState<string>(""); // State để lưu gradeName
  const [selectedSemester, setSelectedSemester] = useState<string>("Học kì 1"); // State để lưu học kỳ đã chọn
  const [topics, setTopics] = useState<any[]>([]); // State để lưu các topics
  const [loading, setLoading] = useState(false); // State để xử lý loading
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState<readonly number[]>([]);
  // Thêm state quản lý snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Trạng thái mở/đóng Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Nội dung thông báo
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  ); // Loại thông báo (success/error)
  const [openDelete, setOpenDelete] = useState(false);
  const isSelected = (topicId: number): boolean => {
    return selected.includes(topicId); // Kiểm tra nếu topicId đã được chọn
  };
  // Thêm state để quản lý chế độ edit và topic được chọn
  const [editMode, setEditMode] = useState<"add" | "edit">("add");
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
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
      setLoading(true);
      apiService
        .get("/grades", {
          // headers: {
          //   Authorization: `Bearer ${accessToken}`, // Thêm accessToken vào header
          // },
        })
        .then((response) => {
          const fetchedGrades = response.data;
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

  console.log("selectedGradeId", selectedGradeId);
  console.log("selectedSemester", selectedSemester);
  useEffect(() => {
    if (selectedGradeId && selectedSemester) {
      setLoading(true);
      // Gọi API để lấy topics theo gradeId và semester
      apiService
        .get(
          `/topics/grade/${selectedGradeId}/semester?semester=${selectedSemester}`,
          {
            // headers: {
            //   Authorization: `Bearer ${accessToken}`,
            // },
          }
        )
        .then((response) => {
          console.log("response", response);
          setTopics(response.data.data.topics); // Lưu danh sách topics vào state
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching topics:", error);
          setLoading(false);
        });
    }
  }, [selectedGradeId, selectedSemester, accessToken]); // Chạy lại khi gradeId hoặc semester thay đổi

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

  // Refresh topics list after adding a new topic
  const handleTopicAdded = () => {
    // Re-fetch topics after adding a new one
    if (selectedGradeId && selectedSemester) {
      setLoading(true);
      apiService
        .get(
          `/topics/grade/${selectedGradeId}/semester?semester=${selectedSemester}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        .then((response) => {
          setTopics(response.data.data.topics);
          handleSnackbarOpen(response.data.message, "success");
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching topics:", error);
          setLoading(false);
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
      if (selectedGradeId && selectedSemester) {
        setLoading(true);
        apiService
          .get(
            `/topics/grade/${selectedGradeId}/semester?semester=${selectedSemester}`,
            {
              // headers: {
              //   Authorization: `Bearer ${accessToken}`,
              // },
            }
          )
          .then((response) => {
            setTopics(response.data.data.topics); // Update topics state
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching topics after delete:", error);
            setLoading(false);
          });
      }
    } catch (error: any) {
      console.error("Failed to delete topics: ", error.message);

      // Show error snackbar message
      handleSnackbarOpen("Xóa chủ đề thất bại", "error");
      setLoading(false);
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
        <Box>
          {loading ? (
            <Typography>Đang tải...</Typography>
          ) : (
            <TableContainer
              sx={{
                boxShadow: 4,
                borderRadius: 2,
                flex: 1,
                maxHeight: "78vh", // Set a fixed height for the table
                overflowY: "auto", // Enable vertical scrolling if content overflows
              }}
            >
              <Table>
                <TableHead sx={{ backgroundColor: "#FFFBF3" }}>
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
                            color: "#99BC4D", // Màu cho trạng thái checked và indeterminate
                          },
                          "&.MuiCheckbox-indeterminate": {
                            color: "#99BC4D", // Màu cho trạng thái indeterminate
                          },
                        }}
                        checked={
                          topics.length > 0 && selected.length === topics.length
                        }
                        onChange={handleSelectAllClick}
                        defaultChecked
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ width: "5%" }}></TableCell>
                    <TableCell sx={{ width: "20%" }}>Mã topic</TableCell>
                    <TableCell sx={{ width: "30%" }}>Tên topic</TableCell>
                    {/* <TableCell>Chương</TableCell> */}
                    {/* <TableCell sx={{ width: "40%" }}>Bài học</TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topics.map((topic) => {
                    const isItemSelected = isSelected(topic.topicId); // Kiểm tra topic hiện tại có được chọn không
                    return (
                      <TableRow key={topic.topicId}>
                        <TableCell>
                          <Checkbox
                            size="small"
                            checked={isItemSelected}
                            sx={{
                              color: "#637381",
                              "&.Mui-checked": {
                                color: "#99BC4D",
                              },
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
                        <TableCell>{topic.topicId}</TableCell>
                        <TableCell>{topic.topicName}</TableCell>
                        {/* <TableCell>{topic.chapter}</TableCell> */}
                        {/* <TableCell>
                          {topic.lessons.map((lesson) => (
                            <div key={lesson.lessonId}>{lesson.lessonName}</div>
                          ))}
                        </TableCell> */}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
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
