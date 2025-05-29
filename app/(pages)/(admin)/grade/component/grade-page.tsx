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
interface Grade {
  gradeId: number;
  gradeName: string;
}

interface GradeResponse {
  data: {
    grades: Grade[];
  };
}

const GradePage = () => {
  const { accessToken, isLoading, setIsLoading } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [newGradeName, setNewGradeName] = useState("");
  const [error, setError] = useState("");
  const [openDelete, setOpenDelete] = useState(false);
  const [editMode, setEditMode] = useState<"add" | "edit">("add");
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const fetchGrades = (query = "") => {
    if (accessToken) {
      setIsLoading(true);

      const requestBody = query ? { gradeName: query } : {};

      apiService
        .get<GradeResponse>("/grades", {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: query ? { gradeName: query } : undefined,
        })
        .then((response) => {
          console.log("Fetched grades:", response.data.data.grades);
          setGrades(response.data.data.grades);
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
      fetchGrades();
    }
  }, [accessToken]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchGrades(value);
    }, 500);

    setSearchTimeout(timeout as unknown as NodeJS.Timeout);
  };
  useEffect(() => {
    if (accessToken) {
      setIsLoading(true);
      apiService
        .get<GradeResponse>("/grades", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          setGrades(response.data.data.grades);
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
    setSelectedGrade(null);
    setNewGradeName("");
    setError("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewGradeName("");
    setError("");
  };

  const handleSaveGrade = () => {
    if (!newGradeName.trim()) {
      setError("Tên môn học không được để trống!");
      return;
    }

    setIsLoading(true);

    const apiCall =
      editMode === "edit"
        ? apiService.put<GradeResponse>(
            `/grades/${selectedGrade?.gradeId}`,
            { gradeName: newGradeName.trim() },
            { headers: { Authorization: `Bearer ${accessToken}` } }
          )
        : apiService.post(
            "/grades",
            { gradeName: newGradeName.trim() },
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

    apiCall
      .then(() => {
        return apiService.get<GradeResponse>("/grades", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      })
      .then((response) => {
        setGrades(response.data.data.grades);
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
      .delete<GradeResponse>("/grades", {
        data: selected,
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(() => {
        return apiService.get<GradeResponse>("/grades", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      })
      .then((response) => {
        setGrades(response.data.data.grades);
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
    if (grades.length > 0) {
      if (event.target.checked) {
        const newSelected = grades.map((grade) => grade.gradeId);
        setSelected(newSelected);
        setOpenDelete(true);
      } else {
        setSelected([]);
        setOpenDelete(false);
      }
    }
  };
  const handleOpenEdit = (grade: any) => {
    setEditMode("edit");
    setSelectedGrade(grade);
    setError("");
    setOpenDialog(true);

    apiService
      .get<GradeResponse>(`/grades/${grade.gradeId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => {
        const grades = response.data.data.grades;
        if (grades.length > 0) {
          const gradeName = grades[0].gradeName;
          setNewGradeName(gradeName);
        } else {
          setError("Không tìm thấy lớp học.");
        }
      })

      .catch((error) => {
        console.error("Error fetching grade detail:", error);
        setError("Không thể lấy thông tin lớp học.");
      });
  };

  const handleCheckboxClick = (
    event: React.ChangeEvent<HTMLInputElement>,
    gradeId: number
  ) => {
    const updatedSelected = event.target.checked
      ? [...selected, gradeId]
      : selected.filter((id) => id !== gradeId);

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
            Quản lý Lớp học
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
          {isLoading ? (
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
                          Lớp
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Checkbox
                            indeterminate={
                              selected.length > 0 &&
                              grades.length > 0 &&
                              selected.length < grades.length
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
                              grades.length > 0 &&
                              selected.length === grades.length
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
                      {grades
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((grade, index) => {
                          const isItemSelected = selected.includes(
                            grade.gradeId
                          );

                          return (
                            <TableRow key={grade.gradeId}>
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
                                    handleCheckboxClick(event, grade.gradeId)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <EditIcon
                                  fontSize="small"
                                  sx={{ color: "#637381", cursor: "pointer" }}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleOpenEdit(grade);
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                {page * rowsPerPage + index + 1}
                              </TableCell>
                              <TableCell>{grade.gradeName}</TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={grades.length}
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
            {" "}
            <Typography fontSize="24px" fontWeight={600} sx={{ flexGrow: 1 }}>
              {editMode === "edit" ? "Chỉnh sửa lớp học" : "Thêm mới lớp học"}
            </Typography>
            <CloseIcon fontSize="small" onClick={handleCloseDialog} />
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Tên lớp"
              fullWidth
              value={newGradeName}
              onChange={(e) => setNewGradeName(e.target.value)}
              error={!!error}
              helperText={error}
              margin="normal"
            />
          </DialogContent>
          <DialogActions sx={{ marginRight: 2 }}>
            <Button onClick={handleSaveGrade} color="primary">
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
    </Layout>
  );
};

export default GradePage;
