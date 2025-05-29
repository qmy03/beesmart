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
  Checkbox,
} from "@mui/material";

import React, { useState, useEffect } from "react";
import apiService from "@/app/untils/api";
import DeleteDialog from "@/app/components/admin/delete-dialog";

interface User {
  userId: string;
  username: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

interface UserResponse {
  data: User[];
  message: string;
}

const UserPage = () => {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleSelectRowClick = (
    event: React.ChangeEvent<HTMLInputElement>,
    userId: string
  ) => {
    const checked = event.target.checked;
    let newSelected: string[] = [];

    if (checked) {
      newSelected = [...selected, userId];
    } else {
      newSelected = selected.filter((id) => id !== userId);
    }

    setSelected(newSelected);
    setOpenDelete(newSelected.length > 0);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = users.map((user) => user.userId);
      setSelected(newSelected);
      setOpenDelete(true);
    } else {
      setSelected([]);
      setOpenDelete(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await apiService.delete<UserResponse>("/users", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        data: selected,
      });

      setUsers(users.filter((user) => !selected.includes(user.userId)));
      setOpenDelete(false);
      showSnackbar(response.data.message, "success");
    } catch (error) {
      console.error("Error deleting users:", error);
      showSnackbar("Error deleting users", "error");
    }
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setSelected([]);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedUsers = users.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  useEffect(() => {
    if (accessToken) {
      setLoading(true);
      apiService
        .get<UserResponse>("/users", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          setUsers(response.data.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching users:", error);
          setLoading(false);
        });
    }
  }, [accessToken]);

  const handleStatusChange = async (userId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;

      const response = await apiService.patch<UserResponse>(
        `/users/${userId}/status?active=${newStatus}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.userId === userId ? { ...user, active: newStatus } : user
          )
        );
        showSnackbar(response.data.message, "success");
      }
    } catch (error) {
      showSnackbar("Cập nhật trạng thái thất bại", "error");
      console.error("Error updating user status:", error);
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Layout>
      <Box sx={{ display: "flex", flexDirection: "column", padding: "0 10px" }}>
        <Box
          sx={{
            display: "flex",
            padding: "12px 8px",
            alignItems: "center",
            boxShadow: 4,
            borderRadius: "8px",
          }}
        >
          <Typography fontWeight={700} flexGrow={1}>
            Quản lý Người dùng
          </Typography>
        </Box>

        <Box sx={{ marginY: 2, maxHeight: "50vh" }}>
          {loading ? (
            <Typography>Đang tải...</Typography>
          ) : (
            <>
              <Box sx={{ boxShadow: 4, borderRadius: 2, overflow: "auto" }}>
                <TableContainer
                  sx={{
                    borderRadius: 2,
                    flex: 1,
                    height: "80vh",
                    overflow: "auto",
                  }}
                >
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: "#FFFBF3" }}>
                      <TableRow>
                        <TableCell>
                          <Checkbox
                            indeterminate={
                              selected.length > 0 &&
                              users.length > 0 &&
                              selected.length < users.length
                            }
                            sx={{
                              color: "#637381",
                              "&.Mui-checked, &.MuiCheckbox-indeterminate": {
                                color: "#99BC4D",
                              },
                              "&.MuiCheckbox-indeterminate": {
                                color: "#99BC4D",
                              },
                            }}
                            checked={
                              users.length > 0 &&
                              selected.length === users.length
                            }
                            onChange={handleSelectAllClick}
                          />
                        </TableCell>
                        <TableCell>Tên người dùng</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Vai trò</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Ngày tạo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((user) => {
                          const isItemSelected =
                            selected.indexOf(user.userId) !== -1;
                          return (
                            <TableRow
                              key={user.userId}
                              hover
                              role="checkbox"
                              aria-checked={isItemSelected}
                              selected={isItemSelected}
                            >
                              <TableCell>
                                <Checkbox
                                  sx={{
                                    color: "#637381",
                                    "&.Mui-checked": {
                                      color: "#99BC4D",
                                    },
                                  }}
                                  checked={isItemSelected}
                                  onChange={(event) =>
                                    handleSelectRowClick(event, user.userId)
                                  }
                                  inputProps={{
                                    "aria-labelledby": user.userId,
                                  }}
                                />
                              </TableCell>
                              <TableCell>{user.username}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.role}</TableCell>
                              <TableCell>
                                <Switch
                                  size="small"
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
                          );
                        })}
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
      <DeleteDialog
        open={openDelete}
        handleClose={handleCloseDelete}
        quantity={selected.length}
        onDelete={handleDelete}
      />
    </Layout>
  );
};

export default UserPage;
