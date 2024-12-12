"use client";

import Layout from "@/app/components/admin/layout";
import { useAuth } from "@/app/hooks/AuthContext";
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
} from "@mui/material";
import React, { useState, useEffect } from "react";
import apiService from "@/app/untils/api";

const GradePage = () => {
  const { accessToken } = useAuth(); // Lấy accessToken từ context
  const [grades, setGrades] = useState<any[]>([]); // State để lưu danh sách lớp học
  const [loading, setLoading] = useState(false); // State để xử lý loading

  // State cho pagination
  const [page, setPage] = useState(0); // Trang hiện tại
  const [rowsPerPage, setRowsPerPage] = useState(10); // Số dòng hiển thị mỗi trang

  useEffect(() => {
    if (accessToken) {
      setLoading(true);
      // Gọi API để lấy danh sách lớp học
      apiService
        .get("/grades")
        .then((response) => {
          setGrades(response.data); // Lưu danh sách lớp học vào state
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching grades:", error);
          setLoading(false);
        });
    }
  }, [accessToken]); // Chạy lại khi accessToken thay đổi

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
            Quản lý Lớp học
          </Typography>
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
                    width: "76vw", // Set a fixed height for the table
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
                      {/* Hiển thị các dòng theo pagination */}
                      {grades
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((grade, index) => (
                          <TableRow key={grade.gradeId}>
                            <TableCell>
                              {page * rowsPerPage + index + 1}
                            </TableCell>{" "}
                            {/* Số thứ tự */}
                            <TableCell>{grade.gradeName}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* Pagination */}
                <TablePagination
                  component="div"
                  count={grades.length} // Tổng số lớp học
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Layout>
  );
};

export default GradePage;