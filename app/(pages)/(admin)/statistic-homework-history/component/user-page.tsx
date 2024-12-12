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
  Snackbar,
  Alert,
  TablePagination,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import apiService from "@/app/untils/api";
import TextField from "@/app/components/textfield";

const StatisticHomeworkHistory = () => {
  const { accessToken } = useAuth(); // Lấy accessToken từ context
  const [users, setUsers] = useState<any[]>([]); // Danh sách người dùng
  const [selectedUser, setSelectedUser] = useState(""); // Người dùng được chọn
  const [quizRecords, setQuizRecords] = useState<any[]>([]); // Lịch sử làm bài kiểm tra
  const [loading, setLoading] = useState(false); // Xử lý trạng thái loading

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const [page, setPage] = useState(0); // Trạng thái trang hiện tại
  const [rowsPerPage, setRowsPerPage] = useState(5); // Số dòng mỗi trang

  const handleSnackbarClose = () => {
    setSnackbarOpen(false); // Đóng Snackbar
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage); // Cập nhật trang khi người dùng thay đổi
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10)); // Cập nhật số dòng mỗi trang
    setPage(0); // Đặt lại trang về trang đầu tiên khi thay đổi số dòng mỗi trang
  };

  // Lấy danh sách người dùng
  // Lấy danh sách người dùng và lọc theo role
  useEffect(() => {
    if (accessToken) {
      setLoading(true);
      apiService
        .get("/users", {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Thêm accessToken vào header
          },
        })
        .then((response) => {
          const userList = response.data.data;
          const students = userList.filter(
            (user: any) => user.role === "STUDENT"
          ); // Lọc chỉ người dùng có role là "STUDENT"
          setUsers(students); // Lưu danh sách người dùng là STUDENT
          if (students.length > 0) {
            setSelectedUser(students[0].userId); // Chọn người dùng đầu tiên
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching users:", error);
          setLoading(false);
        });
    }
  }, [accessToken]);

  // Lấy danh sách lịch sử làm bài của user được chọn
  useEffect(() => {
    if (selectedUser) {
      setLoading(true);
      apiService
        .get(`/statistics/user/${selectedUser}/quiz-records`, {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Thêm accessToken vào header
          },
        })
        .then((response) => {
          setQuizRecords(response.data.data.quizRecords); // Lưu lịch sử làm bài
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching quiz records:", error);
          setLoading(false);
        });
    }
  }, [selectedUser, accessToken]);

  const handleUserChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedUser(event.target.value as string); // Cập nhật user được chọn
  };

  return (
    <Layout>
      <Box sx={{ display: "flex", flexDirection: "column", padding: "0 10px" }}>
        <Box
          sx={{
            display: "flex",
            paddingX: "12px",
            alignItems: "center",
            boxShadow: 4,
            borderRadius: "8px",
          }}
        >
          <Typography fontWeight={700} flexGrow={1}>
            Thống kê Lịch sử Làm bài
          </Typography>
          <TextField
            label=""
            select
            value={selectedUser}
            onChange={handleUserChange}
            sx={{ width: 300 }}
          >
            {users.map((user) => (
              <MenuItem key={user.userId} value={user.userId}>
                {user.username}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Bảng lịch sử làm bài */}
        <Box sx={{ marginTop: 2 }}>
          {loading ? (
            <Typography>Đang tải...</Typography>
          ) : (
            <Box sx={{ boxShadow: 4, borderRadius: 2 }}>
              <TableContainer
                sx={{
                  // boxShadow: 4,
                  borderRadius: 2,
                  height: "75vh",
                  overflow: "auto",
                }}
              >
                <Table size="small">
                  <TableHead sx={{ backgroundColor: "#FFFBF3" }}>
                    <TableRow>
                      <TableCell sx={{ width: "35%", padding: "16px" }}>
                        Tên bài kiểm tra
                      </TableCell>
                      <TableCell sx={{ width: "15%" }}>Tổng câu hỏi</TableCell>
                      <TableCell sx={{ width: "15%" }}>Đáp án đúng</TableCell>
                      <TableCell sx={{ width: "5%" }}>Điểm</TableCell>
                      <TableCell sx={{ width: "15%" }}>
                        Thời gian làm bài
                      </TableCell>
                      <TableCell sx={{ width: "15%" }}>Ngày làm bài</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {quizRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          Không có dữ liệu
                        </TableCell>
                      </TableRow>
                    ) : (
                      quizRecords
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((record) => (
                          <TableRow key={record.recordId}>
                            <TableCell>{record.quizName}</TableCell>
                            <TableCell>{record.totalQuestions}</TableCell>
                            <TableCell>{record.correctAnswers}</TableCell>
                            <TableCell>{record.points}</TableCell>
                            <TableCell>{record.timeSpent}</TableCell>
                            <TableCell>
                              {new Date(record.createdAt).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={quizRecords.length} // Tổng số mục
                page={page} // Trang hiện tại
                onPageChange={handleChangePage} // Xử lý thay đổi trang
                rowsPerPage={rowsPerPage} // Số dòng mỗi trang
                onRowsPerPageChange={handleChangeRowsPerPage} // Xử lý thay đổi số dòng mỗi trang
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* Snackbar */}
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

export default StatisticHomeworkHistory;
