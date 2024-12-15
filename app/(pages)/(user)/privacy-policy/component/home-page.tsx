"use client";
import React from "react";
import Layout from "@/app/components/user/Home/layout";
import { Box, CssBaseline, Typography } from "@mui/material";
import theme from "@/app/components/theme";

const PrivacyPolicyPage: React.FC = () => {
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
          Chính Sách Bảo Mật
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
          <Typography paragraph>
            Chúng tôi cam kết bảo vệ quyền riêng tư của bạn. Chính sách này giải
            thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân
            của bạn khi bạn sử dụng nền tảng BeeSmart.
          </Typography>
          <Typography paragraph>
            <strong>1. Thông tin thu thập:</strong> Chúng tôi thu thập thông tin
            cá nhân của bạn, bao gồm họ tên, email, và thông tin liên quan khi
            bạn đăng ký hoặc sử dụng các dịch vụ của chúng tôi.
          </Typography>
          <Typography paragraph>
            <strong>2. Mục đích sử dụng:</strong> Thông tin của bạn được sử dụng
            để cung cấp dịch vụ, cải thiện trải nghiệm người dùng, và liên lạc
            khi cần thiết.
          </Typography>
          <Typography paragraph>
            <strong>3. Bảo mật thông tin:</strong> Chúng tôi áp dụng các biện
            pháp bảo mật tiên tiến để bảo vệ thông tin cá nhân của bạn trước
            các truy cập trái phép.
          </Typography>
          <Typography paragraph>
            Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật, vui lòng liên
            hệ với chúng tôi qua email:{" "}
            <strong>beesmart669@gmail.com</strong>.
          </Typography>
        </Box>
      </Box>
    </Layout>
  );
};

export default PrivacyPolicyPage;
