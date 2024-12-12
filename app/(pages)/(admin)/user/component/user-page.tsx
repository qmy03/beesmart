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
  Switch,
  Snackbar,
  Alert,
  TablePagination,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import apiService from "@/app/untils/api";

const UserPage = () => {
  const { accessToken } = useAuth(); // Lấy accessToken từ context
  const [users, setUsers] = useState<any[]>([]); // State để lưu danh sách người dùng
  const [loading, setLoading] = useState(false); // State để xử lý loading
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Dữ liệu hiển thị trên trang hiện tại
  const paginatedUsers = users.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const handleSnackbarClose = () => {
    setSnackbarOpen(false); // Đóng Snackbar
  };
  useEffect(() => {
    if (accessToken) {
      setLoading(true);
      // Gọi API để lấy danh sách người dùng
      apiService
        .get("/users", {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Thêm accessToken vào header
          },
        })
        .then((response) => {
          setUsers(response.data.data); // Lưu danh sách người dùng vào state
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching users:", error);
          setLoading(false);
        });
    }
  }, [accessToken]); // Chạy lại khi accessToken thay đổi

  const handleStatusChange = async (userId: string, currentStatus: boolean) => {
    try {
      // Toggle the active status
      const newStatus = !currentStatus;

      // Gửi API để cập nhật trạng thái người dùng
      const response = await apiService.patch(
        `/users/${userId}/status?active=${newStatus}`, // Include the `active` query parameter
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Thêm accessToken vào header
          },
        }
      );

      if (response.status === 200) {
        // Cập nhật lại trạng thái trong danh sách người dùng
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.userId === userId ? { ...user, active: newStatus } : user
          )
        );
        showSnackbar(response.data.message, "success"); // Hiển thị thông báo thành công
      }
    } catch (error) {
      showSnackbar("Cập nhật trạng thái thất bại", "error"); // Hiển thị thông báo lỗi
      console.error("Error updating user status:", error);
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true); // Mở snackbar
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false); // Đóng snackbar
  };

  return (
    <Layout>
      <Box sx={{ display: "flex", flexDirection: "column", padding: "0 10px" }}>
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
            Quản lý Người dùng
          </Typography>
          <Button>Thêm mới</Button>
        </Box>

        {/* Bảng danh sách người dùng */}
        <Box sx={{ marginY: 2, maxHeight: "50vh" }}>
          {loading ? (
            <Typography>Đang tải...</Typography>
          ) : (
            <>
              <Box sx={{ boxShadow: 4, borderRadius: 2 }}>
                <TableContainer
                  sx={{
                    // boxShadow: 4,
                    borderRadius: 2,
                    flex: 1,
                    height: "80vh",
                    width: "76vw", // Set a fixed height for the table
                    overflow: "auto",
                  }}
                >
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: "#FFFBF3" }}>
                      <TableRow>
                        <TableCell>Mã người dùng</TableCell>
                        <TableCell>Tên người dùng</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Vai trò</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Ngày tạo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.userId}>
                          <TableCell>{user.userId}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>
                            <Switch
                              sx={{ fontSize: "small" }}
                              checked={user.active}
                              onChange={() =>
                                handleStatusChange(user.userId, user.active)
                              }
                              name="active"
                              color="primary"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <div>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="flex-end"
                  >
                    <TablePagination
                      component="div"
                      count={users.length}
                      page={page}
                      onPageChange={handleChangePage}
                      rowsPerPage={rowsPerPage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </Box>
                </div>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* Snackbar */}
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

export default UserPage;
