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
interface User {
  userId: string;
  username: string;
  role: string;
}

interface UsersResponse {
  data: User[];
}

interface QuizRecord {
  recordId: string;
  quizName: string;
  totalQuestions: number;
  correctAnswers: number;
  points: number;
  timeSpent: number;
  createdAt: string;
}

interface QuizRecordsData {
  quizRecords: QuizRecord[];
  totalItems: number;
}

interface QuizRecordsResponse {
  data: QuizRecordsData;
}

const StatisticHomeworkHistory = () => {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<any[]>([]); 
  const [selectedUser, setSelectedUser] = useState("");
  const [quizRecords, setQuizRecords] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false); 
  const [totalItems, setTotalItems] = useState(0);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(10); 

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
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

  useEffect(() => {
    if (accessToken) {
      setLoading(true);
      apiService
        .get<UsersResponse>("/users", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          const userList = response.data.data;
          const students = userList.filter(
            (user: any) => user.role === "STUDENT"
          ); 
          setUsers(students);
          if (students.length > 0) {
            setSelectedUser(students[0].userId);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching users:", error);
          setLoading(false);
        });
    }
  }, [accessToken]);

  useEffect(() => {
    console.log("Fetching data for page:", page);
    if (selectedUser) {
      setLoading(true);
      apiService
        .get<QuizRecordsResponse>(`/statistics/user/${selectedUser}/quiz-records?page=${page}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          console.log("Data fetched:", response.data);
          const data = response.data.data;
          setQuizRecords(data.quizRecords);
          setTotalItems(data.totalItems);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching quiz records:", error);
          setLoading(false);
        });
    }
  }, [selectedUser, accessToken, page]);
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60); 
    const remainingSeconds = seconds % 60;
    return `${minutes}'${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}s`;
  };
  const handleUserChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedUser(event.target.value as string);
    setPage(0); 
  };

  return (
    <Layout>
      <Box sx={{ display: "flex", flexDirection: "column", padding: "0 10px" }}>
        <Box
          sx={{
            display: "flex",
            paddingX: "12px",
            paddingY: 0,
            margin: 0,
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
        <Box sx={{ marginTop: 2 }}>
          <Box sx={{ boxShadow: 4, borderRadius: 2 }}>
            <TableContainer
              sx={{
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Đang tải dữ liệu...
                      </TableCell>
                    </TableRow>
                  ) : quizRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  ) : (
                    quizRecords
                      // .slice(
                      //   page * rowsPerPage,
                      //   page * rowsPerPage + rowsPerPage
                      // )
                      .map((record) => (
                        <TableRow key={record.recordId}>
                          <TableCell>{record.quizName}</TableCell>
                          <TableCell>{record.totalQuestions}</TableCell>
                          <TableCell>{record.correctAnswers}</TableCell>
                          <TableCell>{record.points}</TableCell>
                          <TableCell>{formatTime(record.timeSpent)}</TableCell>
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
              count={totalItems}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>
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
