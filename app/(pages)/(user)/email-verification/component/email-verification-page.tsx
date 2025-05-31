"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import apiService from "@/app/untils/api";
import Layout from "@/app/components/user/Home/layout";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
import { Button } from "@/app/components/button";
import TextField from "@/app/components/textfield";
interface VerifyResponse {
  message: string;
}

const EmailVerification = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token"); // Lấy token từ URL
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState(""); // Message thông báo
  const [email, setEmail] = useState(""); // Email để gửi lại xác thực

  useEffect(() => {
    // Chỉ thực hiện xác thực nếu trạng thái chưa phải là success
    if (token && status === "loading") {
      apiService
        .get(`/auth/verify?token=${token}`)
        .then((response) => {
          console.log("res", response);
          const data = response.data as VerifyResponse;
          setStatus("success");
          setMessage(data.message);
          setTimeout(() => router.push("/login"), 3000); // Điều hướng sau 3 giây
        })
        .catch((error) => {
          setStatus("error");
          setMessage(
            error.response?.data?.message || "Không thể xác thực email của bạn."
          );
        });
    } else if (!token && status === "loading") {
      setStatus("error");
      setMessage("Token không hợp lệ hoặc không tìm thấy.");
    }
  }, [token, status, router]);

  const resendEmailVerification = () => {
    if (!email) {
      setMessage("Vui lòng nhập email.");
      return;
    }

    apiService
      .get<VerifyResponse>(`/auth/resend-confirm-email?email=${email}`)
      .then((response) => {
        setMessage(response.data.message || "Email xác thực đã được gửi lại.");
      })
      .catch((error) => {
        setMessage(
          error.response?.data?.message || "Không thể gửi lại email xác thực."
        );
      });
  };
  return (
    <Layout>
      <Box
        sx={{
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "60px 120px",
        }}
      >
        {status === "loading" ? (
          <Typography variant="h6">Đang xác thực...</Typography>
        ) : status === "success" ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              padding: "20px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image src="/success.png" width={80} height={80} alt=""></Image>
            <Typography variant="h5" color="primary" fontWeight="bold">
              Xác thực thành công!
            </Typography>
            <Typography>
              Cảm ơn bạn đã xác thực email. Bạn sẽ được chuyển đến trang đăng
              nhập.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              padding: "20px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image src="/fail.png" width={80} height={80} alt=""></Image>
            <Typography variant="h5" color="error">
              Đã xảy ra lỗi!
            </Typography>
            <Typography>{message}</Typography>
            <Box sx={{ marginTop: "20px" }}>
              <TextField
                label="Nhập email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={resendEmailVerification}
                sx={{ marginTop: "10px" }}
              >
                Gửi lại email xác thực
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Layout>
  );
};

export default EmailVerification;
