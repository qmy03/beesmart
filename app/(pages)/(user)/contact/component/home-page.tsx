"use client";
import React from "react";
import Layout from "@/app/components/user/Home/layout";
import { Box, CssBaseline, Typography, TextField } from "@mui/material";
import { Button } from "@/app/components/button";
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
          Liên Hệ Với Chúng Tôi
        </Typography>

        {/* Nội dung liên hệ */}
        <Box
          sx={{
            maxWidth: "600px",
            textAlign: "center",
            fontSize: "18px",
            lineHeight: 1.6,
            color: "#555",
            pt: 2,
          }}
        >
          <Typography paragraph>
            Nếu bạn có bất kỳ câu hỏi hoặc cần hỗ trợ, vui lòng liên hệ với
            chúng tôi qua mẫu bên dưới hoặc qua email:{" "}
            <strong>beesmart669@gmail.com</strong>.
          </Typography>
        </Box>

        {/* Form liên hệ */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            width: "100%",
            maxWidth: "600px",
          }}
        >
          <TextField
            size="small"
            label="Họ và tên"
            variant="outlined"
            fullWidth
            required
          />
          <TextField
            size="small"
            label="Email"
            variant="outlined"
            type="email"
            fullWidth
            required
          />
          <TextField
            size="small"
            label="Nội dung"
            variant="outlined"
            multiline
            rows={4}
            fullWidth
            required
          />
          <Button
            variant="contained"
            color="primary"
            sx={{
              alignSelf: "flex-end",
            }}
          >
            Gửi
          </Button>
        </Box>
      </Box>
    </Layout>
  );
};

export default HomePage;
