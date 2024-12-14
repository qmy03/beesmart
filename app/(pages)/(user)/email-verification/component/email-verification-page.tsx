// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useSearchParams } from "next/navigation";
// import { Box, Typography, Button, TextField } from "@mui/material";
// import Layout from "@/app/components/user/Home/layout";
// import SnackbarComponent from "@/app/components/snackbar";
// import apiService from "@/app/untils/api";

// const EmailVerification: React.FC = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const token = searchParams.get("token");

//   const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
//   const [snackbarOpen, setSnackbarOpen] = useState(false);
//   const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
//     "success"
//   );
//   const [email, setEmail] = useState<string>("");
//   const [resendEmail, setResendEmail] = useState(false);
//   const [isVerified, setIsVerified] = useState(false); // Track verification status

//   useEffect(() => {
//     if (token && !isVerified) {
//       apiService
//         .get(`/auth/verify?token=${token}`)
//         .then((response) => {
//           const data = response.data;
//           if (data.success) {
//             setSnackbarMessage("Email verified successfully!");
//             setSnackbarSeverity("success");
//             setSnackbarOpen(true);
//             setIsVerified(true);
//             // Xóa token khỏi URL sau khi xác thực thành công
//             router.push("/login"); // Chuyển hướng sau khi xác thực
//           } else {
//             setSnackbarMessage(data?.message || "Verification failed.");
//             // setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//           }
//         })
//         .catch((error) => {
//           console.error("API Error: ", error.response || error);
//           setSnackbarMessage("An error occurred. Please try again.");
//           setSnackbarSeverity("error");
//           setSnackbarOpen(true);
//         });
//     }
//   }, [token, isVerified, router]);

//   const handleResendEmail = () => {
//     if (email) {
//       // Use ApiService to resend verification email
//       apiService
//         .get(`/auth/resend-confirm-email?email=${email}`)
//         .then((response) => {
//           const data = response.data;
//           if (data.success) {
//             setSnackbarMessage("Verification email sent successfully!");
//             setSnackbarSeverity("success");
//             setSnackbarOpen(true);
//           } else {
//             setSnackbarMessage("Failed to resend email. Please try again.");
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//           }
//         })
//         .catch(() => {
//           setSnackbarMessage("Failed to resend email. Please try again.");
//           setSnackbarSeverity("error");
//           setSnackbarOpen(true);
//         });
//     } else {
//       setSnackbarMessage("Please enter your email address.");
//       setSnackbarSeverity("error");
//       setSnackbarOpen(true);
//     }
//   };

//   const handleSnackbarClose = () => {
//     setSnackbarOpen(false);
//   };

//   return (
    
//   );
// };

// export default EmailVerification;
// "use client"; // Chỉ thị client-side rendering trong Next.js 13+

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation"; // Sử dụng useSearchParams thay vì useRouter
// import apiService from "@/app/untils/api";
// import Layout from "@/app/components/user/Home/layout";
// import { Box } from "@mui/material";

// const EmailVerification = () => {
//   const searchParams = useSearchParams();
//   const token = searchParams?.get("token"); // Lấy token từ URL
//   const [status, setStatus] = useState<"loading" | "success" | "error">(
//     "loading"
//   );
//   const [isVerified, setIsVerified] = useState(false); // Thêm state để kiểm tra nếu đã xác thực

//   // Kiểm tra nếu token có trong URL, sau đó thực hiện xác thực
//   useEffect(() => {
//     if (token && !isVerified) {
//       // Kiểm tra nếu token có và chưa xác thực
//       // Gửi request xác thực đến API backend sử dụng apiService
//       apiService
//         .get(`/auth/verify?token=${token}`)
//         .then((response) => {
//           // Nếu xác thực thành công
//           console.log("Xác thực thành công:", response.data.message);
//           setStatus("success");
//           setIsVerified(true); // Đánh dấu là đã xác thực
//         })
//         .catch((error) => {
//           // Lỗi chi tiết
//           console.error(
//             "Lỗi xác thực:",
//             error.response ? error.response.data : error.message
//           );
//           // setStatus('error');
//         });
//     } else if (!token) {
//       setStatus("error"); // Nếu không có token
//     }
//   }, [token, isVerified]); // Thêm isVerified để tránh gọi lại API sau khi đã xác thực

//   if (status === "loading") {
//     return <div>Đang xác thực...</div>;
//   }

//   return (
//     <Layout>
//       <Box>
//         {status === "success" ? (
//           <div>
//             <h1>Xác thực thành công!</h1>
//             <p>
//               Cảm ơn bạn đã xác thực email. Bạn có thể bắt đầu sử dụng dịch vụ
//               ngay bây giờ.
//             </p>
//           </div>
//         ) : (
//           <div>
//             <h1>Đã xảy ra lỗi!</h1>
//             <p>Không thể xác thực email của bạn. Vui lòng thử lại sau.</p>
//           </div>
//         )}
//       </Box>
//     </Layout>
//   );
// };

// export default EmailVerification;
"use client"; // Chỉ thị client-side rendering trong Next.js 13+

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import apiService from "@/app/untils/api";
import Layout from "@/app/components/user/Home/layout";
import { Box, Button, TextField, Typography } from "@mui/material";

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
          setStatus("success");
          setMessage(response.data.message);
          setTimeout(() => router.push("/login"), 3000); // Điều hướng sau 3 giây
        })
        .catch((error) => {
          if (status !== "success") {
            // setStatus("error");
            setMessage(
              error.response?.data?.message || "Không thể xác thực email của bạn."
            );
          }
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
      .get(`/auth/resend-confirm-email?email=${email}`)
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
      <Box sx={{ textAlign: "center", padding: "20px" }}>
        {status === "loading" ? (
          <Typography variant="h6">Đang xác thực...</Typography>
        ) : status === "success" ? (
          <div>
            <Typography variant="h5" color="primary">
              Xác thực thành công!
            </Typography>
            <Typography>
              Cảm ơn bạn đã xác thực email. Bạn sẽ được chuyển đến trang đăng nhập.
            </Typography>
          </div>
        ) : (
          <div>
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
          </div>
        )}
      </Box>
    </Layout>
  );
};

export default EmailVerification;

