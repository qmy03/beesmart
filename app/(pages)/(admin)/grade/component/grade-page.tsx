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
} from "@mui/material";
import React, { useState, useEffect } from "react";
import apiService from "@/app/untils/api";
import { useAuth } from "@/app/hooks/AuthContext";
import Layout from "@/app/components/admin/layout";
import { Button } from "@/app/components/button";
import TextField from "@/app/components/textfield";
import CloseIcon from "@mui/icons-material/close"
const GradePage = () => {
  const { accessToken } = useAuth(); // Lấy accessToken từ context
  const [grades, setGrades] = useState<any[]>([]); // State để lưu danh sách lớp học
  const [loading, setLoading] = useState(false); // State để xử lý loading

  // State cho pagination
  const [page, setPage] = useState(0); // Trang hiện tại
  const [rowsPerPage, setRowsPerPage] = useState(10); // Số dòng hiển thị mỗi trang

  // State cho dialog Thêm mới lớp
  const [openDialog, setOpenDialog] = useState(false); // Kiểm soát hộp thoại
  const [newGradeName, setNewGradeName] = useState(""); // Tên lớp mới
  const [error, setError] = useState(""); // Lưu thông báo lỗi (nếu có)

  // Lấy danh sách lớp học từ API
  useEffect(() => {
    if (accessToken) {
      setLoading(true);
      apiService
        .get("/grades", {
          headers: { Authorization: `Bearer ${accessToken}` }, // Gửi accessToken trong header
        })
        .then((response) => {
          setGrades(response.data); // Lưu danh sách lớp học vào state
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching grades:", error);
          setLoading(false);
        });
    }
  }, [accessToken]);

  // Hàm xử lý thay đổi trang
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Hàm xử lý thay đổi số dòng trên mỗi trang
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset về trang đầu tiên
  };

  // Mở dialog
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Đóng dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewGradeName("");
    setError("");
  };

  // Thêm mới lớp học
  const handleAddGrade = () => {
    if (!newGradeName.trim()) {
      setError("Tên lớp không được để trống!");
      return;
    }
  
    setLoading(true); // Hiển thị trạng thái loading khi thêm mới
    apiService
      .post(
        "/grades",
        { gradeName: newGradeName.trim() },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      .then(() => {
        // Gọi lại API để đảm bảo danh sách đồng bộ
        return apiService.get("/grades", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      })
      .then((response) => {
        setGrades(response.data); // Cập nhật danh sách từ server
        handleCloseDialog(); // Đóng hộp thoại
      })
      .catch((error) => {
        console.error("Error adding or fetching grades:", error);
        setError(
          error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại."
        );
      })
      .finally(() => setLoading(false));
  };
  return (
    <Layout>
      <Box sx={{ display: "flex", flexDirection: "column", padding: "0 10px" }}>
        <Box
          sx={{
            display: "flex",
            padding: "8px",
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

        {/* Bảng danh sách lớp học */}
        <Box sx={{ marginTop: 2 }}>
          {loading ? (
            <Typography>Đang tải...</Typography>
          ) : (
            <>
              <Box sx={{ boxShadow: 4, borderRadius: 2 }}>
                <TableContainer
                  sx={{
                    borderRadius: 2,
                    flex: 1,
                    height: "80vh",
                    overflow: "auto",
                  }}
                >
                  <Table>
                    <TableHead sx={{ backgroundColor: "#FFFBF3" }}>
                      <TableRow>
                        <TableCell sx={{ width: "20%" }}>Số thứ tự</TableCell>
                        <TableCell>Tên lớp</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {grades
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((grade, index) => (
                          <TableRow key={grade.gradeId}>
                            <TableCell>
                              {page * rowsPerPage + index + 1}
                            </TableCell>
                            <TableCell>{grade.gradeName}</TableCell>
                          </TableRow>
                        ))}
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

        {/* Hộp thoại Thêm mới lớp */}
        <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth >
          <DialogTitle sx={{display: "flex", alignItems: "center"}}><Typography fontSize="24px" fontWeight={600} sx={{flexGrow: 1}}>Thêm mới lớp học</Typography><CloseIcon fontSize="small" onClick={handleCloseDialog}/></DialogTitle>
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
          <DialogActions sx={{marginRight: 2}}>
            <Button onClick={handleAddGrade} color="primary">
              Thêm mới
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default GradePage;
