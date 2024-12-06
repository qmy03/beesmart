"use client";

import Layout from "@/app/components/admin/layout";
import { Button } from "@/app/components/button";
import { AuthProvider, useAuth } from "@/app/hooks/AuthContext";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { useState, useEffect } from "react";
import apiService from "@/app/untils/api";

const GradePage = () => {
  const { accessToken } = useAuth();  // Lấy accessToken từ context
  const [grades, setGrades] = useState<any[]>([]);  // State để lưu danh sách lớp học
  const [loading, setLoading] = useState(false);  // State để xử lý loading

  useEffect(() => {
    if (accessToken) {
      setLoading(true);
      // Gọi API để lấy danh sách lớp học
      apiService
        .get("/grades", {
          // headers: {
          //   Authorization: `Bearer ${accessToken}`,  // Thêm accessToken vào header
          // },
        })
        .then((response) => {
          setGrades(response.data);  // Lưu danh sách lớp học vào state
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching grades:", error);
          setLoading(false);
        });
    }
  }, [accessToken]);  // Chạy lại khi accessToken thay đổi

  return (
    <Layout>
      <Box sx={{ display: "flex", flexDirection: "column", padding: "0 10px" }}>
        <Box sx={{ display: "flex", padding: "4px 8px", alignItems: "center", boxShadow: 4, borderRadius: "8px" }}>
          <Typography fontWeight={700} flexGrow={1}>
            Quản lý Lớp học
          </Typography>
          <Button>Thêm mới</Button>
        </Box>

        {/* Bảng danh sách lớp học */}
        <Box sx={{ marginTop: 2 }}>
          {loading ? (
            <Typography>Đang tải...</Typography>
          ) : (
            <TableContainer sx={{boxShadow: 4, borderRadius: 2}}>
              <Table>
                <TableHead sx={{backgroundColor: "#FFFBF3"}}>
                  <TableRow>
                    <TableCell>Mã lớp</TableCell>
                    <TableCell>Tên lớp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grades.map((grade) => (
                    <TableRow key={grade.gradeId}>
                      <TableCell>{grade.gradeId}</TableCell>
                      <TableCell>{grade.gradeName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </Layout>
  );
};

export default GradePage;
