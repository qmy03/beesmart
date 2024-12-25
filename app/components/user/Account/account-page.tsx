import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Snackbar,
  Alert,
  IconButton,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import EditIcon from "@mui/icons-material/Edit";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import Layout from "../Home/layout";
import apiService from "@/app/untils/api";
import { useAuth } from "@/app/hooks/AuthContext";
import TextField from "../../textfield";
import { useRouter, usePathname } from "next/navigation";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Visibility, VisibilityOff } from "@mui/icons-material";
const AccountPage: React.FC = () => {
  const [grades, setGrades] = useState<any[]>([]);
  const [studentInfo, setStudentInfo] = useState({
    fullName: "",
    username: "",
    password: "",
    grade: "",
    role: "STUDENT",
  });
  const [editableInfo, setEditableInfo] = useState({
    fullName: "",
    dateOfBirth: "",
    email: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [userInfo, setUserInfo] = useState<any | null>(null); // Lưu thông tin người dùng
  const { accessToken, logoutUser } = useAuth(); // Lấy accessToken từ context
  // const [activeTab, setActiveTab] = useState("Thông tin cá nhân"); // Tab hiện tại
  const [quizHistory, setQuizHistory] = useState<any[]>([]); // Lịch sử làm bài
  const [page, setPage] = useState(0); // Trang hiện tại
  const [rowsPerPage, setRowsPerPage] = useState(10); // Số dòng mỗi trang
  const [totalItems, setTotalItems] = useState(0); // Tổng số phần tử trong dữ liệu
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  ); // New state for severity
  const [errorConfirmPassword, setErrorConfirmPassword] = useState<
    string | null
  >(null);
  const activeTab = (() => {
    if (pathname.includes("/user-info")) return "Thông tin cá nhân";
    if (pathname.includes("/homework-history")) return "Lịch sử làm bài";
    if (pathname.includes("/change-password")) return "Đổi mật khẩu";
    if (pathname.includes("/register-student")) return "Tạo tài khoản cho con";
    return null;
  })();
  const handleCancel = () => {
    setIsEditing(false); // Reset the editing state to false
    router.push("/account/user-info"); // Navigate to the personal information page
  };

  const handleTabChange = (path: string) => {
    router.push(path);
  };

  const handleCloseSnackbar = () => setOpenSnackbar(false);
  const handleChangePassword = async () => {
    // Kiểm tra mật khẩu mới và xác nhận mật khẩu
    if (newPassword !== confirmNewPassword) {
      setErrorConfirmPassword("Mật khẩu không khớp!");
      return;
    }

    setErrorConfirmPassword(null); // Reset lỗi trước đó

    try {
      const response = await apiService.post(
        "/users/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response?.data?.status === 200) {
        setSnackbarMessage(response.data.message || "Đổi mật khẩu thành công!");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        // Reset các trường nhập mật khẩu
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setSnackbarMessage(response.data.message || "Đổi mật khẩu thất bại!");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Đổi mật khẩu thất bại!";
      // Kiểm tra cụ thể lỗi validation
      if (error.response?.data?.message === "Validation failed") {
        setSnackbarMessage(
          "Mật khẩu mới phải bao gồm ít nhất 8 kí tự, bao gồm kí tự hoa, thường và số!"
        );
      } else {
        setSnackbarMessage(errorMessage);
      }
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    newPage: number
  ) => {
    setPage(newPage); // Cập nhật trang khi người dùng thay đổi trang
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10)); // Cập nhật số dòng trên mỗi trang
    setPage(0); // Quay lại trang 0 khi thay đổi số dòng mỗi trang
  };

  // Fetch thông tin người dùng
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await apiService.get("/users/user-info", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log("userINFO", response);
        if (response?.data?.status === 200) {
          setUserInfo(response.data.data);
          setEditableInfo({
            fullName: response.data.data.fullName,
            dateOfBirth: formatDate1(response.data.data.dateOfBirth), // Format the date
            email: response.data.data.email,
          });
        } else {
          console.error("Failed to fetch user info:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, [accessToken]);

  // Helper function to format date as YYYY-MM-DD
  // Helper function to format date as dd-mm-yyyy
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0"); // Ensure two digits for day
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Ensure two digits for month
    const year = date.getFullYear();
    return `${day}-${month}-${year}`; // Format as dd-mm-yyyy
  };
  const formatDate1 = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Ensure two digits for month
    const day = date.getDate().toString().padStart(2, "0"); // Ensure two digits for day
    return `${year}-${month}-${day}`; // Format as yyyy-MM-dd
  };

  const handleUpdateUser = async () => {
    try {
      // Đảm bảo định dạng ngày là dd-mm-yyyy trước khi gửi xuống backend
      const updatedInfo = {
        ...editableInfo,
        dateOfBirth: formatDate(editableInfo.dateOfBirth), // Chuyển đổi ngày trước khi gửi
      };
      console.log(updatedInfo);
      const response = await apiService.put(
        "http://localhost:8080/api/users/user-info",
        updatedInfo,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response?.data?.status === 200) {
        setUserInfo(response.data.data); // Cập nhật lại thông tin người dùng
        setIsEditing(false); // Đổi lại chế độ không chỉnh sửa
        setSnackbarMessage("Cập nhật thông tin thành công!");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
      } else {
        setSnackbarMessage("Cập nhật thông tin thất bại!");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    } catch (error) {
      setSnackbarMessage("Cập nhật thông tin thất bại!");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };
  const id = userInfo?.userId;
  console.log(id);
  // Fetch lịch sử làm bài với phân trang
  const formatTimeSpent = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60); // Get the minutes
    const seconds = timeInSeconds % 60; // Get the remaining seconds
    return `${minutes}' ${seconds}s`; // Return formatted time
  };
  useEffect(() => {
    if (activeTab === "Lịch sử làm bài" && userInfo?.userId) {
      const fetchQuizHistory = async () => {
        try {
          const response = await apiService.get(
            `/statistics/user/${userInfo.userId}/quiz-records`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              params: {
                page: page,
                size: rowsPerPage,
              },
            }
          );
          if (response?.data?.status === 200) {
            setQuizHistory(response.data.data.quizRecords || []);
            setTotalItems(response.data.data.totalItems || 0);
          } else {
            console.error(
              "Failed to fetch quiz history:",
              response.data.message
            );
          }
        } catch (error) {
          console.error("Error fetching quiz history:", error);
        }
      };

      fetchQuizHistory();
    }
  }, [activeTab, userInfo, accessToken, page, rowsPerPage]);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await apiService.get("/grades");
        if (response?.data) {
          setGrades(response.data);
        }
      } catch (error) {
        console.error("Error fetching grades:", error);
      }
    };

    fetchGrades();
  }, []);

  // Handle student registration
  const handleRegisterStudent = async () => {
    // Basic frontend validation
    if (
      !studentInfo.fullName ||
      !studentInfo.username ||
      !studentInfo.password ||
      !studentInfo.grade
    ) {
      setSnackbarMessage("Vui lòng điền đầy đủ thông tin!");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await apiService.post(
        `/users/parent/create-student`,
        studentInfo,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      console.log("response", response);

      if (response?.data?.status === 200) {
        setSnackbarMessage(
          response?.data?.message || "Tạo tài khoản thành công!"
        );
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage(
          response?.data?.message || "Tạo tài khoản thất bại!"
        );
        setSnackbarSeverity("error");
      }
    } catch (error) {
      console.error(
        "Error creating student:",
        error.response?.data || error.message
      );

      if (error.response?.data?.message === "Username already exists") {
        setSnackbarMessage("Tên người dùng đã tồn tại! Vui lòng thử tên khác.");
      } else {
        setSnackbarMessage(
          error.response?.data?.message || "Tạo tài khoản thất bại!"
        );
      }
      setSnackbarSeverity("error");
    } finally {
      setOpenSnackbar(true);
    }
  };

  if (!userInfo) {
    return (
      <Layout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <Typography>Đang tải thông tin...</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
          padding: 7,
          bgcolor: "#f9f9f9",
          minHeight: "100vh",
          flex: 1,
        }}
      >
        {/* Box bên trái */}
        <Box
          sx={{
            flex: 1,
            bgcolor: "white",
            padding: 2,
            boxShadow: 4,
            borderRadius: 2,
          }}
        >
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Avatar
              sx={{
                bgcolor: "#99BC4D",
                width: 64,
                height: 64,
                fontSize: 32,
                margin: "0 auto",
                fontWeight: 600,
                border: "4px solid #BB9066",
              }}
            >
              {userInfo.username[0].toUpperCase()}
            </Avatar>
            <Typography fontSize="20px" fontWeight="bold" mt={1}>
              {userInfo.username}
            </Typography>
            <Typography fontSize="16px" color="#A8A8A8" mt={1}>
              {userInfo.grade}
            </Typography>
          </Box>
          <Divider sx={{ borderWidth: 1.5 }} />
          <Box sx={{ mt: 3 }}>
            <Button
              fullWidth
              startIcon={<AccountCircleIcon />}
              onClick={() => handleTabChange("/account/user-info")}
              sx={{
                justifyContent: "flex-start",
                textTransform: "none",
                color:
                  activeTab === "Thông tin cá nhân" ? "#99BC4D" : "#99BC4D",
                bgcolor:
                  activeTab === "Thông tin cá nhân" ? "#FFFBF3" : "white",
                "&:hover": { bgcolor: "#FFFBF3", color: "#99BC4D" },
              }}
            >
              Thông tin cá nhân
            </Button>
            <Button
              fullWidth
              startIcon={<AnalyticsIcon />}
              onClick={() => handleTabChange("/account/homework-history")}
              sx={{
                justifyContent: "flex-start",
                textTransform: "none",
                color: activeTab === "Lịch sử làm bài" ? "blue" : "blue",
                bgcolor: activeTab === "Lịch sử làm bài" ? "#FFFBF3" : "white",
                "&:hover": { bgcolor: "#FFFBF3", color: "blue" },
              }}
            >
              Lịch sử làm bài
            </Button>
            {userInfo.role === "PARENT" && (
              <Button
                fullWidth
                startIcon={<GroupAddIcon />}
                onClick={() => handleTabChange("/account/register-student")}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  color:
                    activeTab === "Tạo tài khoản cho con" ? "orange" : "orange",
                  bgcolor:
                    activeTab === "Tạo tài khoản cho con" ? "#FFFBF3" : "white",
                  "&:hover": { bgcolor: "#FFFBF3", color: "orange" },
                }}
              >
                Tạo tài khoản cho con
              </Button>
            )}
            <Button
              fullWidth
              startIcon={<LockIcon />}
              onClick={() => handleTabChange("/account/change-password")}
              sx={{
                justifyContent: "flex-start",
                textTransform: "none",
                color: activeTab === "Đổi mật khẩu" ? "#555" : "#555",
                bgcolor: activeTab === "Đổi mật khẩu" ? "#FFFBF3" : "white",
                "&:hover": { bgcolor: "#FFFBF3", color: "#555" },
              }}
            >
              Đổi mật khẩu
            </Button>
            <Button
              fullWidth
              startIcon={<LogoutIcon />}
              sx={{
                justifyContent: "flex-start",
                color: "red",
                textTransform: "none",
              }}
              onClick={logoutUser}
            >
              Đăng xuất
            </Button>
          </Box>
        </Box>

        {/* Box bên phải */}
        <Box
          sx={{
            flex: 4,
            bgcolor: "white",
            padding: 3,
            boxShadow: 4,
            borderRadius: 2,
          }}
        >
          {activeTab === "Thông tin cá nhân" && (
            <Box>
              {isEditing ? (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      aligntItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={handleCancel}
                  >
                    <Typography fontWeight={600}>
                      <KeyboardBackspaceIcon sx={{ marginRight: 1 }} />
                      Quay lại
                    </Typography>
                  </Box>
                  <Typography
                    fontSize={20}
                    fontWeight="bold"
                    mb={2}
                    color="#99BC4D"
                    sx={{ flexGrow: 1 }}
                    textAlign="center"
                  >
                    Cập nhật thông tin cá nhân
                  </Typography>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    variant="outlined"
                    value={editableInfo.fullName}
                    onChange={(e) =>
                      setEditableInfo({
                        ...editableInfo,
                        fullName: e.target.value,
                      })
                    }
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Ngày sinh"
                    type="date"
                    variant="outlined"
                    value={editableInfo.dateOfBirth}
                    onChange={(e) =>
                      setEditableInfo({
                        ...editableInfo,
                        dateOfBirth: e.target.value,
                      })
                    }
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    variant="outlined"
                    value={editableInfo.email}
                    disabled
                    sx={{ mb: 2 }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleUpdateUser}
                    sx={{
                      textTransform: "none",
                      color: "white",
                      ":hover": { bgcolor: "#99BC4D" },
                    }}
                  >
                    Cập nhật thông tin
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Box sx={{ display: "flex" }}>
                    <Typography
                      fontSize={20}
                      fontWeight="bold"
                      mb={2}
                      color="#99BC4D"
                      sx={{ flexGrow: 1 }}
                    >
                      Thông tin cá nhân
                    </Typography>

                    <Box
                      sx={{
                        border: "1px solid #A8A8A8",
                        display: "flex",
                        alignItems: "center",
                        padding: "0 16px",
                        borderRadius: 7,
                        cursor: "pointer",
                      }}
                      onClick={handleEditClick}
                    >
                      Cập nhật
                      <EditIcon fontSize="small" sx={{ marginLeft: 1 }} />
                    </Box>
                  </Box>
                  {/* <Divider sx={{pt: 1}}/> */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "150px 1fr",
                      gap: 2,
                      pt: 3,
                    }}
                  >
                    <Typography>Họ tên:</Typography>
                    <Typography fontWeight="bold">
                      {userInfo.fullName || "-"}
                    </Typography>

                    <Typography>Tên đăng nhập:</Typography>
                    <Typography fontWeight="bold">
                      {userInfo.username}
                    </Typography>

                    <Typography>Loại tài khoản:</Typography>
                    <Typography fontWeight="bold">
                      {userInfo.role || "-"}
                    </Typography>

                    <Typography>Ngày sinh:</Typography>
                    <Typography fontWeight="bold">
                      {userInfo.dateOfBirth || "-"}
                    </Typography>

                    {/* <Typography>Điện thoại:</Typography>
                <Typography fontWeight="bold">
                  {userInfo.phone || "-"}
                </Typography> */}

                    <Typography>Email:</Typography>
                    <Typography fontWeight="bold">{userInfo.email}</Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}
          {activeTab === "Lịch sử làm bài" && (
            <Box>
              <Typography
                fontSize={20}
                fontWeight="bold"
                mb={2}
                color="#99BC4D"
              >
                Lịch sử làm bài
              </Typography>
              <Box component={Paper}>
                <TableContainer sx={{ height: "58vh" }}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: "#FFFBF3" }}>
                      <TableRow>
                        <TableCell>Thứ tự</TableCell>
                        <TableCell>Tên bài kiểm tra</TableCell>
                        <TableCell>Số câu hỏi</TableCell>
                        <TableCell>Số câu đúng</TableCell>
                        <TableCell>Điểm</TableCell>
                        <TableCell>Thời gian (phút)</TableCell>
                        <TableCell>Ngày làm</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {quizHistory.map((record, index) => (
                        <TableRow key={record.recordId}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{record.quizName}</TableCell>
                          <TableCell>{record.totalQuestions}</TableCell>
                          <TableCell>{record.correctAnswers}</TableCell>
                          <TableCell>{record.points}</TableCell>
                          <TableCell>
                            {record.timeSpent
                              ? formatTimeSpent(record.timeSpent)
                              : "0' 0s"}
                          </TableCell>
                          <TableCell>
                            {new Date(record.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
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
                  rowsPerPageOptions={[5, 10, 25]}
                  labelRowsPerPage="Rows per page"
                />
              </Box>
            </Box>
          )}
          {activeTab === "Tạo tài khoản cho con" && (
            <Box>
              <Typography
                fontSize={20}
                fontWeight="bold"
                mb={2}
                color="#99BC4D"
              >
                Tạo tài khoản cho con
              </Typography>
              <Box display="flex" flexDirection="column">
                <Typography fontSize={14} color="#63A2DC" fontStyle="italic">
                  Lưu ý:
                  <br />
                  • Tài khoản được tạo sẽ có chung email với tài khoản của bạn
                  <br />
                  • Tài khoản được tạo sẽ tự động kích hoạt
                  <br />• Tài khoản được tạo sẽ tự động liên kết với tài khoản
                </Typography>
                <Box sx={{ display: "grid", marginY: 2, gap: 2 }}>
                  <Box>
                    <Typography fontSize={14} fontWeight="600">
                      Họ và tên
                    </Typography>
                    <TextField
                      label="Nhập họ và tên"
                      value={studentInfo.fullName}
                      onChange={(e) =>
                        setStudentInfo({
                          ...studentInfo,
                          fullName: e.target.value,
                        })
                      }
                    />
                  </Box>
                  <Box>
                    <Typography fontSize={14} fontWeight="600">
                      Tên đăng nhập
                    </Typography>
                    <TextField
                      label="Nhập tên đăng nhập"
                      value={studentInfo.username}
                      onChange={(e) =>
                        setStudentInfo({
                          ...studentInfo,
                          username: e.target.value,
                        })
                      }
                    />
                  </Box>
                  <Box>
                    <Typography fontSize={14} fontWeight="600">
                      Mật khẩu
                    </Typography>
                    <TextField
                      label="Nhập mật khẩu"
                      type="password"
                      value={studentInfo.password}
                      onChange={(e) =>
                        setStudentInfo({
                          ...studentInfo,
                          password: e.target.value,
                        })
                      }
                    />
                  </Box>
                  <Box>
                    <Typography fontSize={14} fontWeight="600">
                      Khối lớp
                    </Typography>
                    <TextField
                      select
                      label="Chọn khối lớp"
                      value={studentInfo.grade}
                      onChange={(e) =>
                        setStudentInfo({
                          ...studentInfo,
                          grade: e.target.value,
                        })
                      }
                    >
                      {grades.map((grade) => (
                        <MenuItem key={grade.gradeId} value={grade.gradeName}>
                          {grade.gradeName}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  onClick={handleRegisterStudent}
                  sx={{
                    textTransform: "none",
                    color: "white",
                    ":hover": { bgcolor: "#99BC4D" },
                  }}
                >
                  <PersonAddIcon sx={{ marginRight: "4px" }} /> Tạo tài khoản
                </Button>
              </Box>
            </Box>
          )}
          {activeTab === "Đổi mật khẩu" && (
            <Box>
              <Typography
                fontSize={20}
                fontWeight="bold"
                mb={2}
                color="#99BC4D"
              >
                Đổi mật khẩu
              </Typography>
              <Box display="flex" flexDirection="column">
                <Box sx={{ mb: 2 }}>
                  <Typography fontSize={14} fontWeight="600">
                    Mật khẩu hiện tại
                  </Typography>
                  <TextField
                    label="Nhập mật khẩu hiện tại"
                    type={showPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={togglePasswordVisibility}>
                            {showPassword ? (
                              <VisibilityOff
                                fontSize="small"
                                sx={{ color: "#99BC4D" }}
                              />
                            ) : (
                              <Visibility
                                fontSize="small"
                                sx={{ color: "#99BC4D" }}
                              />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography fontSize={14} fontWeight="600">
                    Mật khẩu mới
                  </Typography>

                  <TextField
                    label="Nhập mật khẩu mới"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={toggleNewPasswordVisibility}>
                            {showNewPassword ? (
                              <VisibilityOff
                                fontSize="small"
                                sx={{ color: "#99BC4D" }}
                              />
                            ) : (
                              <Visibility
                                fontSize="small"
                                sx={{ color: "#99BC4D" }}
                              />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography fontSize={14} fontWeight="600">
                    Xác nhận mật khẩu mới
                  </Typography>
                  <TextField
                    label="Nhập lại mật khẩu mới"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    error={!!errorConfirmPassword}
                    helperText={errorConfirmPassword}
                    fullWidth
                    sx={{
                      ".MuiFormHelperText-root.Mui-error": {
                        fontSize: "14px",
                        paddingY: "2px",
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={toggleConfirmPasswordVisibility}>
                            {showConfirmPassword ? (
                              <VisibilityOff
                                fontSize="small"
                                sx={{ color: "#99BC4D" }}
                              />
                            ) : (
                              <Visibility
                                fontSize="small"
                                sx={{ color: "#99BC4D" }}
                              />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Button
                  variant="contained"
                  onClick={handleChangePassword}
                  sx={{
                    textTransform: "none",
                    color: "white",
                    ":hover": { bgcolor: "#99BC4D" },
                  }}
                >
                  Đổi mật khẩu
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default AccountPage;
