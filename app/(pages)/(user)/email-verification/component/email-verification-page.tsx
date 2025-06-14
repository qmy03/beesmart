"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import apiService from "@/app/untils/api";
import Layout from "@/app/components/user/Home/layout";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import Image from "next/image";
import { Button } from "@/app/components/button";

interface VerifyResponse {
  status: number;
  message: string;
  data: any;
}

const EmailVerification = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);
  const hasVerified = useRef(false);

  useEffect(() => {
    const token = searchParams.get("token");

    // Ngăn việc gọi API nhiều lần (React Strict Mode)
    if (hasVerified.current) {
      return;
    }

    if (!token) {
      setVerificationStatus("error");
      setMessage("Token xác thực không hợp lệ hoặc không tìm thấy");
      return;
    }

    console.log("Attempting to verify token:", token);
    hasVerified.current = true;

    // Gọi API xác thực email
    const verifyEmail = async () => {
      try {
        const verifyUrl = `/auth/verify?token=${token}`;
        console.log("Calling API:", verifyUrl);

        const response = await apiService.get(verifyUrl);
        console.log("API Response:", response);

        // Kiểm tra response từ API
        if (response.status === 200 && response.data?.status === 200) {
          setVerificationStatus("success");
          setMessage(response.data.message || "Xác thực email thành công!");
        } else {
          setVerificationStatus("error");
          setMessage(response.data?.message || "Xác thực email thất bại");
        }
      } catch (error: any) {
        console.error("Verification error details:", error);

        setVerificationStatus("error");

        // Xử lý các loại lỗi khác nhau
        if (error.response?.status === 500) {
          setMessage(
            error.response?.data?.message || 
            "Lỗi server (500). Token có thể đã được sử dụng hoặc hết hạn."
          );
        } else if (error.response?.status === 404) {
          setMessage("Token không tồn tại hoặc đã hết hạn.");
        } else if (error.response?.status === 400) {
          setMessage("Token không hợp lệ.");
        } else if (error.response?.status === 401) {
          setMessage("Token không được ủy quyền hoặc đã hết hạn.");
        } else if (error.code === "ERR_NETWORK") {
          setMessage("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.");
        } else {
          setMessage(
            error.response?.data?.message || "Có lỗi xảy ra khi xác thực email"
          );
        }
      }
    };

    verifyEmail();
  }, []); // Empty dependency array

  // Separate useEffect for countdown and redirect
  useEffect(() => {
    if (verificationStatus === "success") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push("/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [verificationStatus, router]);

  const handleGoToLogin = () => {
    router.push("/login");
  };

  const handleRetryVerification = () => {
    setVerificationStatus("loading");
    setMessage("");
    hasVerified.current = false; // Reset để có thể thử lại
    
    // Trigger re-verification by getting token again
    const token = searchParams.get("token");
    if (token) {
      hasVerified.current = true;
      verifyEmail(token);
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const verifyUrl = `/auth/verify?token=${token}`;
      console.log("Retrying API:", verifyUrl);

      const response = await apiService.get(verifyUrl);
      console.log("Retry API Response:", response);

      if (response.status === 200 && response.data?.status === 200) {
        setVerificationStatus("success");
        setMessage(response.data.message || "Xác thực email thành công!");
      } else {
        setVerificationStatus("error");
        setMessage(response.data?.message || "Xác thực email thất bại");
      }
    } catch (error: any) {
      console.error("Retry verification error:", error);
      setVerificationStatus("error");
      setMessage(
        error.response?.data?.message || "Có lỗi xảy ra khi xác thực email"
      );
    }
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case "loading":
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            <CircularProgress size={60} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Đang xác thực email...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Vui lòng đợi trong giây lát
            </Typography>
          </Box>
        );

      case "success":
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                backgroundColor: "#4caf50",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <Typography sx={{ fontSize: "48px", color: "white" }}>
                ✓
              </Typography>
            </Box>

            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: "#4caf50", mb: 1 }}
            >
              Xác thực thành công!
            </Typography>

            <Typography
              variant="body1"
              sx={{ mb: 2, textAlign: "center", maxWidth: 400 }}
            >
              {message}
            </Typography>

            <Alert severity="success" sx={{ mb: 3 }}>
              Tài khoản của bạn đã được kích hoạt thành công. Bạn có thể đăng
              nhập ngay bây giờ.
            </Alert>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Tự động chuyển hướng sau {countdown} giây...
            </Typography>

            <Button
              onClick={handleGoToLogin}
              sx={{
                backgroundColor: "#1976d2",
                color: "white",
                padding: "12px 32px",
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "#1565c0",
                },
              }}
            >
              Đăng nhập ngay
            </Button>
          </Box>
        );

      case "error":
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                backgroundColor: "#f44336",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <Typography sx={{ fontSize: "48px", color: "white" }}>
                ✗
              </Typography>
            </Box>

            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: "#f44336", mb: 1 }}
            >
              Xác thực thất bại
            </Typography>

            <Typography
              variant="body1"
              sx={{ mb: 2, textAlign: "center", maxWidth: 400 }}
            >
              {message}
            </Typography>

            <Alert severity="error" sx={{ mb: 3 }}>
              {message}
            </Alert>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Button
                onClick={handleRetryVerification}
                variant="outlined"
                sx={{
                  borderColor: "#ff9800",
                  color: "#ff9800",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "16px",
                  fontWeight: 600,
                  minWidth: "140px",
                  "&:hover": {
                    borderColor: "#f57c00",
                    color: "#f57c00",
                  },
                }}
              >
                Thử lại
              </Button>

              <Button
                onClick={() => (window.location.href = "/register")}
                variant="outlined"
                sx={{
                  borderColor: "#1976d2",
                  color: "#1976d2",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "16px",
                  fontWeight: 600,
                  minWidth: "140px",
                }}
              >
                Đăng ký lại
              </Button>

              <Button
                onClick={handleGoToLogin}
                sx={{
                  backgroundColor: "#1976d2",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "16px",
                  fontWeight: 600,
                  minWidth: "140px",
                  "&:hover": {
                    backgroundColor: "#1565c0",
                  },
                }}
              >
                Về trang đăng nhập
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "60px 20px",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Box
          sx={{
            maxWidth: 600,
            width: "100%",
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "48px 32px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            border: "1px solid #e0e0e0",
          }}
        >
          {renderContent()}
        </Box>
      </Box>
    </Layout>
  );
};

export default EmailVerification;