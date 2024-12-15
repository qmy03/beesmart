"use client";
import React from "react";
import Layout from "@/app/components/user/Home/layout";
import { Box, CssBaseline, Typography } from "@mui/material";
import theme from "@/app/components/theme";

const HomePage: React.FC = () => {
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
          Hướng Dẫn Sử Dụng
        </Typography>

        {/* Nội dung */}
        <Box
          sx={{
            maxWidth: "800px",
            textAlign: "justify",
            fontSize: "18px",
            lineHeight: 1.6,
            color: "#555",
            pt: 2,
          }}
        >
          <Typography paragraph fontSize="16px">
            Chào mừng bạn đến với nền tảng BeeSmart! Để bắt đầu sử dụng dịch vụ
            của chúng tôi, vui lòng làm theo các bước sau:
          </Typography>
          <Typography fontSize="16px" paragraph>
            <strong>1. Đăng ký tài khoản:</strong> Nhấp vào nút "Đăng ký" ở góc
            phải trên cùng, sau đó điền đầy đủ thông tin cần thiết.
          </Typography>
          <img src="/home-page.png"></img>
          <Typography paragraph pt={1} pl={2} fontSize="16px">
            <strong>a. Đăng ký tài khoản học sinh:</strong>
          </Typography>
          <img src="/sign-up-page.png"></img>
          <Typography paragraph pt={1} pl={2} fontSize="16px">
            <strong>b. Đăng ký tài khoản phụ huynh:</strong>
          </Typography>
          <img src="/sign-up-parent.png"></img>
          <Typography paragraph pt={1} fontSize="16px">
            <strong>2. Đăng nhập:</strong> Sử dụng email và mật khẩu của bạn để
            truy cập nền tảng.
          </Typography>
          <Typography paragraph fontSize="16px">
            <strong>3. Khám phá nội dung:</strong> Chọn các bài học, bài kiểm
            tra, hoặc trò chơi học tập từ menu chính. Bạn có thể truy cập nội
            dung phù hợp với trình độ của mình.
          </Typography>
          <img src="/login-page.png"></img>
          <Typography paragraph fontSize="16px" pt={2}>
            <strong>4. Theo dõi tiến độ:</strong> Tại trang cá nhân, bạn có thể
            theo dõi thành tích học tập của mình và xem những nội dung đã hoàn
            thành.
          </Typography>
          <img src="/homework-history.png"></img>
          <Typography paragraph fontSize="16px" pt={2}>
            Nếu bạn gặp bất kỳ khó khăn nào trong quá trình sử dụng, vui lòng
            liên hệ với đội ngũ hỗ trợ của chúng tôi qua email:{" "}
            <strong>beesmart669@gmail.com</strong>.
          </Typography>
        </Box>
      </Box>
    </Layout>
  );
};

export default HomePage;
