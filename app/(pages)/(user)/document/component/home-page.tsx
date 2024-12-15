"use client";
import React from "react";
import Layout from "@/app/components/user/Home/layout";
import { Box, CssBaseline, Typography, Card, CardContent, CardActions} from "@mui/material";
import theme from "@/app/components/theme";
import { Button } from "@/app/components/button";
const HomePage: React.FC = () => {
  const resources = [
    {
      title: "Bài tập Toán lớp 1",
      description: "Tài liệu bài tập giúp học sinh lớp 1 ôn luyện các phép toán cơ bản.",
      downloadLink: "/resources/toan-lop-1.pdf",
    },
    {
      title: "Bài tập Toán lớp 2",
      description: "Tài liệu bài tập giúp học sinh lớp 2 luyện tập phép cộng, trừ và nhân.",
      downloadLink: "/resources/toan-lop-2.pdf",
    },
    {
      title: "Đề kiểm tra Toán lớp 3",
      description: "Tổng hợp các đề kiểm tra giúp học sinh lớp 3 rèn luyện kỹ năng giải bài tập.",
      downloadLink: "/resources/de-kiem-tra-lop-3.pdf",
    },
    {
      title: "Tài liệu học hình học lớp 4",
      description: "Giới thiệu các khái niệm cơ bản và bài tập thực hành về hình học.",
      downloadLink: "/resources/hinh-hoc-lop-4.pdf",
    },
    {
      title: "Bài tập nâng cao lớp 5",
      description: "Các bài toán nâng cao giúp học sinh lớp 5 chuẩn bị cho kỳ thi quan trọng.",
      downloadLink: "/resources/toan-nang-cao-lop-5.pdf",
    },
  ];

  return (
    <Layout>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "40px 20px",
          gap: "20px",
        }}
      >
        {/* Tiêu đề */}
        <Typography
          fontSize="32px"
          color={theme.palette.primary.main}
          fontWeight={700}
          textAlign="center"
        >
          Tài Liệu Miễn Phí
        </Typography>

        {/* Nội dung */}
        <Box
          sx={{
            maxWidth: "800px",
            textAlign: "center",
            fontSize: "18px",
            lineHeight: 1.6,
            color: "#555",
            pt: 2,
          }}
        >
          <Typography paragraph>
            Chào mừng bạn đến với kho tài liệu học toán miễn phí của BeeSmart. Tại đây, bạn có thể tải xuống các tài liệu học tập phù hợp với từng khối lớp để hỗ trợ quá trình học tập của học sinh.
          </Typography>
        </Box>

        {/* Danh sách tài liệu */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            width: "100%",
            maxWidth: "1200px",
          }}
        >
          {resources.map((resource, index) => (
            <Card key={index} sx={{ boxShadow: 3, padding: "10px" }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} color={theme.palette.primary.main} gutterBottom>
                  {resource.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {resource.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  color="primary"
                  href={resource.downloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Xem thêm
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      </Box>
    </Layout>
  );
};

export default HomePage;
