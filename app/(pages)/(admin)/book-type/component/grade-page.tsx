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
  InputAdornment,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import apiService from "@/app/untils/api";
import { useAuth } from "@/app/hooks/AuthContext";
import Layout from "@/app/components/admin/layout";
import { Button } from "@/app/components/button";
import TextField from "@/app/components/textfield";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/close";
import SearchIcon from "@mui/icons-material/Search";
import DeleteDialog from "@/app/components/admin/delete-dialog";
const GradePage = () => {
  const { accessToken, isLoading, setIsLoading } = useAuth(); 
  const [bookTypes, setBookTypes] = useState<any[]>([]); 
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  ); 

  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openDialog, setOpenDialog] = useState(false); 
  const [newBookTypeName, setNewBookTypeName] = useState(""); 
  const [error, setError] = useState(""); 
  const [openDelete, setOpenDelete] = useState(false);
  const [editMode, setEditMode] = useState<"add" | "edit">("add");
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false); 
  const [snackbarMessage, setSnackbarMessage] = useState(""); 
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const fetchBookTypes = (query = "") => {
    if (accessToken) {
      setIsLoading(true);

      const requestBody = query ? { bookName: query } : {};

      apiService
        .get("/book-types", {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: query ? { bookName: query } : undefined,
        })
        .then((response) => {
          setBookTypes(response.data.data.bookTypes);
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
      fetchBookTypes();
    }
  }, [accessToken]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchBookTypes(value);
    }, 500); 

    setSearchTimeout(timeout as unknown as NodeJS.Timeout);
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

  const handleOpenDialog = () => {
    setEditMode("add");
    setSelectedBook(null);
    setNewBookTypeName("");
    setError("");
    setOpenDialog(true);
  };
  

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewBookTypeName("");
    setError("");
  };

  const handleSaveBook = () => {
    if (!newBookTypeName.trim()) {
      setError("Tên Loại sách không được để trống!");
      return;
    }

    setIsLoading(true);

    const apiCall =
      editMode === "edit"
        ? apiService.put(
            `/book-types/${selectedBook.bookId}`,
            { bookName: newBookTypeName.trim() },
            { headers: { Authorization: `Bearer ${accessToken}` } }
          )
        : apiService.post(
            "/book-types",
            { bookName: newBookTypeName.trim() },
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

    apiCall
      .then(() => {
        return fetchBookTypes(searchTerm);
      })
      .then(() => {
        setSnackbarMessage(
          editMode === "edit"
            ? "Cập nhật loại sách thành công!"
            : "Thêm loại sách mới thành công!"
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

  const handleDeleteBooks = () => {
    if (selected.length === 0) return;

    setIsLoading(true);
    apiService
      .delete("/book-types", {
        data: selected, 
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(() => {
        return fetchBookTypes(searchTerm);
      })
      .then(() => {
        setSelected([]);
        setOpenDelete(false);
        setSnackbarMessage("Xóa loại sách thành công!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error("Error deleting books:", error);
        setSnackbarMessage("Lỗi khi xóa loại sách!");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      })
      .finally(() => setIsLoading(false));
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (bookTypes.length > 0) {
      if (event.target.checked) {
        const newSelected = bookTypes.map((bookType) => bookType.bookId);
        setSelected(newSelected);
        setOpenDelete(true);
      } else {
        setSelected([]);
        setOpenDelete(false); 
      }
    }
  };

  const handleOpenEdit = (bookType: any) => {
    setEditMode("edit");
    setSelectedBook(bookType);
    setError("");
    setOpenDialog(true);

    console.log("bookType", bookType);
    // Gọi API lấy thông tin chi tiết
    apiService
      .get(`/book-types/${bookType.bookId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => {
        console.log("responseBT", response);
        const { bookName } = response.data.data;
        setNewBookTypeName(bookName); // set vào TextField
      })
      .catch((error) => {
        console.error("Error fetching grade detail:", error);
        setError("Không thể lấy thông tin lớp học.");
      });
  };

  const handleCheckboxClick = (
    event: React.ChangeEvent<HTMLInputElement>,
    bookId: number
  ) => {
    const updatedSelected = event.target.checked
      ? [...selected, bookId]
      : selected.filter((id) => id !== bookId); 

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
            Quản lý Loại sách
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
                      <TableCell width="5%" sx={{ border: "none" }}></TableCell>
                      <TableCell width="5%" sx={{ border: "none" }}></TableCell>
                      <TableCell width="20%" sx={{ border: "none" }}>
                        Số thứ tự
                      </TableCell>
                      <TableCell width="70%" sx={{ border: "none" }}>
                        Loại sách
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Checkbox
                          indeterminate={
                            selected.length > 0 &&
                            bookTypes.length > 0 &&
                            selected.length < bookTypes.length
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
                            bookTypes.length > 0 &&
                            selected.length === bookTypes.length
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
                    {bookTypes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          Không tìm thấy dữ liệu
                        </TableCell>
                      </TableRow>
                    ) : (
                      bookTypes
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((bookType, index) => {
                          const isItemSelected = selected.includes(
                            bookType.bookId
                          );

                          return (
                            <TableRow key={bookType.bookId}>
                              <TableCell sx={{ paddingY: "12px"}}>
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
                                    handleCheckboxClick(event, bookType.bookId)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <EditIcon
                                  fontSize="small"
                                  sx={{ color: "#637381", cursor: "pointer" }}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleOpenEdit(bookType);
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                {page * rowsPerPage + index + 1}
                              </TableCell>
                              <TableCell>{bookType.bookName}</TableCell>
                            </TableRow>
                          );
                        })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={bookTypes.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          )}
        </Box>

        <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
          <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
            <Typography fontSize="24px" fontWeight={600} sx={{ flexGrow: 1 }}>
              {editMode === "edit"
                ? "Chỉnh sửa loại sách"
                : "Thêm mới loại sách"}
            </Typography>
            <CloseIcon fontSize="small" onClick={handleCloseDialog} />
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Tên loại sách"
              fullWidth
              value={newBookTypeName}
              onChange={(e) => setNewBookTypeName(e.target.value)}
              error={!!error}
              helperText={error}
              margin="normal"
            />
          </DialogContent>
          <DialogActions sx={{ marginRight: 2 }}>
            <Button onClick={handleSaveBook} color="primary">
              {editMode === "edit" ? "Lưu" : "Thêm mới"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <DeleteDialog
        open={openDelete}
        handleClose={() => setOpenDelete(false)}
        quantity={selected.length}
        onDelete={handleDeleteBooks}
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
