import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Snackbar,
  Alert,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import apiService from "@/app/untils/api";
import { useAuth } from "@/app/hooks/AuthContext";
import Layout from "@/app/components/admin/layout";
import { Button } from "@/app/components/button";
import TextField from "@/app/components/textfield";
import CloseIcon from "@mui/icons-material/close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteDialog from "@/app/components/admin/delete-dialog";
import ProgressOverlay from "@/app/components/progress-Overlay";
const SubjectPage = () => {
  const { accessToken, isLoading, setIsLoading } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [error, setError] = useState("");
  const [openDelete, setOpenDelete] = useState(false);
  const [editMode, setEditMode] = useState<"add" | "edit">("add");
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const fetchSubjects = (query = "") => {
    if (accessToken) {
      setIsLoading(true);

      const requestBody = query ? { bookName: query } : {};

      apiService
        .get("/subjects", {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: query ? { search: query } : undefined,
        })
        .then((response) => {
          setSubjects(response.data.data.subjects);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching book types:", error);
          setIsLoading(false);
        });
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchSubjects();
    }
  }, [accessToken]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchSubjects(value);
    }, 500);

    setSearchTimeout(timeout as unknown as NodeJS.Timeout);
  };

  useEffect(() => {
    if (accessToken) {
      setIsLoading(true);
      apiService
        .get("/subjects", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          console.log("AAAAAAAAAA", response.data);
          setSubjects(response.data.data.subjects);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching grades:", error);
          setIsLoading(false);
        });
    }
  }, [accessToken]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = () => {
    setEditMode("add");
    setSelectedSubject(null);
    setNewSubjectName("");
    setError("");
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewSubjectName("");
    setError("");
  };

  const handleSaveSubject = () => {
    if (!newSubjectName.trim()) {
      setError("Tên môn học không được để trống!");
      return;
    }

    setIsLoading(true);

    const apiCall =
      editMode === "edit"
        ? apiService.put(
            `/subjects/${selectedSubject.subjectId}`,
            { subjectName: newSubjectName.trim() },
            { headers: { Authorization: `Bearer ${accessToken}` } }
          )
        : apiService.post(
            "/subjects",
            { subjectName: newSubjectName.trim() },
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

    apiCall
      .then(() => {
        return apiService.get("/subjects", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      })
      .then((response) => {
        setSubjects(response.data.data.subjects);
        setSnackbarMessage(
          editMode === "edit"
            ? "Cập nhật môn học thành công!"
            : "Thêm môn học mới thành công!"
        );
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        handleCloseDialog();
      })

      .catch((error) => {
        console.error("Error saving subject:", error);
        setError(
          error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại."
        );
      })
      .finally(() => setIsLoading(false));
  };
  const handleDeleteSubjects = () => {
    if (selected.length === 0) return;

    setIsLoading(true);
    apiService
      .delete("/subjects", {
        data: selected, // Gửi mảng subjectIds
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(() => {
        return apiService.get("/subjects", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      })
      .then((response) => {
        setSubjects(response.data.data.subjects);
        setSelected([]);
        setOpenDelete(false);
        setSnackbarMessage("Xóa môn học thành công!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        handleCloseDialog();
      })
      .catch((error) => {
        console.error("Error deleting subjects:", error);
      })
      .finally(() => setIsLoading(false));
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (subjects.length > 0) {
      if (event.target.checked) {
        const newSelected = subjects.map((subject) => subject.subjectId);
        setSelected(newSelected);
        setOpenDelete(true);
      } else {
        setSelected([]);
        setOpenDelete(false);
      }
    }
  };
  const handleOpenEdit = (subject: any) => {
    setEditMode("edit");
    setSelectedSubject(subject);
    setError("");
    setOpenDialog(true);

    // Gọi API lấy thông tin chi tiết
    apiService
      .get(`/subjects/${subject.subjectId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => {
        const { subjectName } = response.data.data;
        setNewSubjectName(subjectName); // set vào TextField
      })
      .catch((error) => {
        console.error("Error fetching grade detail:", error);
        setError("Không thể lấy thông tin lớp học.");
      });
  };
  const handleCheckboxClick = (
    event: React.ChangeEvent<HTMLInputElement>,
    subjectId: number
  ) => {
    const updatedSelected = event.target.checked
      ? [...selected, subjectId]
      : selected.filter((id) => id !== subjectId);

    setSelected(updatedSelected);

    if (updatedSelected.length === 0) {
      setOpenDelete(false);
    } else {
      setOpenDelete(true);
    }
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          padding: "0 10px",
          gap: 2,
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
            Quản lý Môn học
          </Typography>
          <Button onClick={handleOpenDialog}>Thêm mới</Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            minHeight: 0,
          }}
        >
          {loading ? (
            <Typography>Đang tải...</Typography>
          ) : (
            <>
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
                    overflow: "auto",
                  }}
                >
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: "#FFFBF3" }}>
                      <TableRow>
                        <TableCell
                          width="5%"
                          sx={{ border: "none" }}
                        ></TableCell>
                        <TableCell
                          width="5%"
                          sx={{ border: "none" }}
                        ></TableCell>
                        <TableCell width="20%" sx={{ border: "none" }}>
                          Số thứ tự
                        </TableCell>
                        <TableCell width="80%" sx={{ border: "none" }}>
                          Môn học
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Checkbox
                            indeterminate={
                              selected.length > 0 &&
                              subjects.length > 0 &&
                              selected.length < subjects.length
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
                              subjects.length > 0 &&
                              selected.length === subjects.length
                            }
                            onChange={handleSelectAllClick}
                            size="small"
                          />
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell>
                          {" "}
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
                        <TableCell>
                          <TextField
                            sx={{
                              p: 0,
                              m: 0,
                              bgcolor: "#FFF",
                              borderRadius: "4px",
                            }}
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {subjects
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((subject, index) => {
                          const isItemSelected = selected.includes(
                            subject.subjectId
                          );

                          return (
                            <TableRow key={subject.subjectId}>
                              <TableCell sx={{ paddingY: "12px" }}>
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
                                    handleCheckboxClick(
                                      event,
                                      subject.subjectId
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <EditIcon
                                  fontSize="small"
                                  sx={{ color: "#637381", cursor: "pointer" }}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleOpenEdit(subject);
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                {page * rowsPerPage + index + 1}
                              </TableCell>
                              <TableCell>{subject.subjectName}</TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={subjects.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </>
          )}
        </Box>

        <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
          <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
            <Typography fontSize="24px" fontWeight={600} sx={{ flexGrow: 1 }}>
              {editMode === "edit" ? "Chỉnh sửa môn học" : "Thêm mới môn học"}
            </Typography>
            <CloseIcon fontSize="small" onClick={handleCloseDialog} />
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Tên môn học"
              fullWidth
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              error={!!error}
              helperText={error}
              margin="normal"
            />
          </DialogContent>
          <DialogActions sx={{ marginRight: 2 }}>
            <Button onClick={handleSaveSubject} color="primary">
              {editMode === "edit" ? "Lưu" : "Thêm mới"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <DeleteDialog
        open={openDelete}
        handleClose={() => setOpenDelete(false)}
        quantity={selected.length}
        onDelete={handleDeleteSubjects}
      />
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
      <ProgressOverlay isLoading={isLoading}/>
    </Layout>
  );
};

export default SubjectPage;
