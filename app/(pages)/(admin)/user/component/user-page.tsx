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
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import TextField from "@/app/components/textfield";
import React, { useState, useEffect, useMemo } from "react";
import apiService from "@/app/untils/api";
import DeleteDialog from "@/app/components/admin/delete-dialog";

// Helper function to format date to dd/mm/yyyy
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

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

  // Search states
  const [searchUsername, setSearchUsername] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchRole, setSearchRole] = useState("");
  const [searchStatus, setSearchStatus] = useState("All");
  const [searchDate, setSearchDate] = useState("");

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
      const newSelected = filteredUsers.map((user) => user.userId);
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

  // Filter users based on search criteria
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchUsername = user.username
        .toLowerCase()
        .includes(searchUsername.toLowerCase());
      const matchEmail = user.email
        .toLowerCase()
        .includes(searchEmail.toLowerCase());
      const matchRole = user.role
        .toLowerCase()
        .includes(searchRole.toLowerCase());

      let matchStatus = true;
      if (searchStatus === "On") {
        matchStatus = user.active === true;
      } else if (searchStatus === "Off") {
        matchStatus = user.active === false;
      }

      let matchDate = true;
      if (searchDate) {
        const userFormattedDate = formatDate(user.createdAt);
        matchDate = userFormattedDate.includes(searchDate);
      }

      return (
        matchUsername && matchEmail && matchRole && matchStatus && matchDate
      );
    });
  }, [
    users,
    searchUsername,
    searchEmail,
    searchRole,
    searchStatus,
    searchDate,
  ]);

  const paginatedUsers = filteredUsers.slice(
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
                      <TableCell sx={{ border: "none" }}></TableCell>
                      <TableCell sx={{ border: "none" }}>
                        Tên người dùng
                      </TableCell>
                      <TableCell sx={{ border: "none" }}>Email</TableCell>
                      <TableCell sx={{ border: "none" }}>Vai trò</TableCell>
                      <TableCell sx={{ border: "none" }}>Trạng thái</TableCell>
                      <TableCell sx={{ border: "none" }}>Ngày tạo</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ paddingTop: 0 }}>
                        {" "}
                        <Checkbox
                          size="small"
                          indeterminate={
                            selected.length > 0 &&
                            filteredUsers.length > 0 &&
                            selected.length < filteredUsers.length
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
                            filteredUsers.length > 0 &&
                            selected.length === filteredUsers.length
                          }
                          onChange={handleSelectAllClick}
                        />
                      </TableCell>
                      <TableCell sx={{ paddingTop: 0 }}>
                        <TextField
                          size="small"
                          sx={{
                            p: 0,
                            m: 0,
                            bgcolor: "#FFF",
                            borderRadius: "4px",
                          }}
                          placeholder=""
                          value={searchUsername}
                          onChange={(e) => setSearchUsername(e.target.value)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ paddingTop: 0 }}>
                        <TextField
                          size="small"
                          sx={{
                            p: 0,
                            m: 0,
                            bgcolor: "#FFF",
                            borderRadius: "4px",
                          }}
                          placeholder=""
                          value={searchEmail}
                          onChange={(e) => setSearchEmail(e.target.value)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ paddingTop: 0 }}>
                        <TextField
                          size="small"
                          sx={{
                            p: 0,
                            m: 0,
                            bgcolor: "#FFF",
                            borderRadius: "4px",
                          }}
                          placeholder=""
                          value={searchRole}
                          onChange={(e) => setSearchRole(e.target.value)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ paddingTop: 0 }}>
                        <FormControl size="small" sx={{ minWidth: 80 }}>
                          <TextField
                            select
                            value={searchStatus}
                            onChange={(e) => setSearchStatus(e.target.value)}
                            sx={{
                              bgcolor: "#FFF",
                              borderRadius: "4px",
                            }}
                          >
                            <MenuItem value="All">Tất cả</MenuItem>
                            <MenuItem value="On">Hoạt động</MenuItem>
                            <MenuItem value="Off">Không hoạt động</MenuItem>
                          </TextField>
                        </FormControl>
                      </TableCell>
                      <TableCell sx={{ paddingTop: 0 }}>
                        <TextField
                          size="small"
                          sx={{
                            p: 0,
                            m: 0,
                            bgcolor: "#FFF",
                            borderRadius: "4px",
                          }}
                          placeholder="dd/mm/yyyy"
                          value={searchDate}
                          onChange={(e) => setSearchDate(e.target.value)}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          align="center"
                          sx={{ paddingY: "12px" }}
                        >
                          Đang tải dữ liệu...
                        </TableCell>
                      </TableRow>
                    ) : paginatedUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ paddingY: "12px" }}>
                          Không có dữ liệu
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedUsers.map((user) => {
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
                                size="small"
                                sx={{
                                  color: "#637381",
                                  "&.Mui-checked": {
                                    color: "#99BC4D",
                                  },
                                  paddingY:0,
                                  // m:0,
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
                            <TableCell sx={{ paddingY: "12px" }}>{user.username}</TableCell>
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
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
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
                    count={filteredUsers.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </Box>
              </div>
            </Box>
          </>
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
