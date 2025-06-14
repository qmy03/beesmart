import React, { useState } from "react";
import {
  //   Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  //   TextField,
  Typography,
  Snackbar,
  Grid,
  Alert,
  Box,
  FormHelperText,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import apiService from "@/app/untils/api";
import TextField from "@/app/components/textfield";
import { Button } from "@/app/components/button";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";

interface ForgotPasswordProps {
  open: boolean;
  onClose: () => void;
}
interface ApiResponse<T> {
  message: string;
  data: T;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ open, onClose }) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  ); // New state for severity
  const [step, setStep] = useState(1);
  const [resetToken, setResetToken] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const resetState = () => {
    setEmail("");
    setEmailError(false);
    setOtp(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
    setSnackbarMessage("");
    setResetToken("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setStep(1);
  };
  const handleClose = () => {
    resetState();
    onClose(); // Đóng popup
  };

  const toggleNewPasswordVisibility = () =>
    setShowNewPassword(!showNewPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleSnackbarClose = () => setOpenSnackbar(false);

  const handleSendOtp = async () => {
    try {
      const response = await apiService.post<ApiResponse<null>>(
        `/auth/forgot-password?email=${email}`
      );
      setSnackbarMessage(response.data.message);
      setSnackbarSeverity("success"); // Set to success
      setOpenSnackbar(true);
      setStep(2);
    } catch (error: any) {
      setSnackbarMessage(error.response?.data?.message || "Đã xảy ra lỗi");
      setSnackbarSeverity("error"); // Set to error
      setOpenSnackbar(true);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const otpCode = otp.join("");
      const response = await apiService.post<ApiResponse<string>>("/auth/verify-otp", {
        email,
        otp: otpCode,
      });
      const token = response.data.data;
      setResetToken(token);
      setSnackbarMessage(response.data.message);
      setSnackbarSeverity("success"); // Set to success
      setOpenSnackbar(true);
      setStep(3);
    } catch (error: any) {
      setSnackbarMessage(error.response?.data?.message || "Đã xảy ra lỗi");
      setSnackbarSeverity("error"); // Set to error
      setOpenSnackbar(true);
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await apiService.post<ApiResponse<null>>("/auth/reset-password", {
        token: resetToken,
        newPassword,
      });
      setSnackbarMessage(response.data.message);
      setSnackbarSeverity("success"); // Set to success
      setOpenSnackbar(true);
      onClose();
      setStep(1);
      setEmail("");
      setOtp(["", "", "", "", "", ""]);
      setNewPassword("");
      setConfirmPassword("");
      setResetToken("");
    } catch (error: any) {
      setSnackbarMessage(
        "Mật khẩu phải chứa ít nhất một chữ thường, một chữ hoa và một ký tự đặc biệt (@$!%*#?&)"
      );
      setSnackbarSeverity("error"); // Set to error
      setOpenSnackbar(true);
    }
  };
  const validateEmail = (email: string) => {
    // Regex kiểm tra email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);

    // Cập nhật trạng thái lỗi nếu không đúng định dạng
    setEmailError(!validateEmail(inputEmail));
  };

  return (
    <>
      {/* Dialog - Forgot Password */}
      <Dialog open={open} onClose={handleClose} fullWidth>
        {step === 1 && (
          <>
            <DialogTitle>
              <Box sx={{ display: "flex" }}>
                <Box sx={{ flexGrow: 1, fontSize: 20, fontWeight: 700 }}>
                  Quên mật khẩu
                </Box>
                <Close
                  fontSize="small"
                  onClick={handleClose}
                  sx={{ cursor: "pointer" }}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography fontSize={14}>
                Vui lòng nhập email để gửi OTP về email
              </Typography>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                error={emailError}
                helperText={
                  emailError ? "Vui lòng nhập đúng định dạng email ...@..." : ""
                }
                fullWidth
              />
            </DialogContent>
            <DialogActions sx={{ marginRight: 2 }}>
              <Button onClick={handleSendOtp} disabled={!email}>
                Gửi
              </Button>
            </DialogActions>
          </>
        )}
        {step === 2 && (
          <>
            <DialogTitle>
              <Box sx={{ display: "flex" }}>
                <Box sx={{ flexGrow: 1, fontSize: 20, fontWeight: 700 }}>
                  Nhập OTP
                </Box>
                <Close
                  fontSize="small"
                  onClick={handleClose}
                  sx={{ cursor: "pointer" }}
                />
              </Box>
            </DialogTitle>
            <DialogContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography fontSize={14}>
                Vui lòng nhập OTP đã được gửi đến email của bạn
              </Typography>
              <Grid
                container
                spacing={1}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {otp.map((digit, index) => (
                  <Grid item key={index}>
                    <TextField
                      value={digit}
                      onChange={(e) => {
                        const newOtp = [...otp];
                        newOtp[index] = e.target.value.slice(-1);
                        setOtp(newOtp);
                        if (e.target.value && index < 5) {
                          document.getElementById(`otp-${index + 1}`)?.focus();
                        }
                      }}
                      sx={{ width: 40 }}
                      id={`otp-${index}`}
                      inputProps={{
                        maxLength: 1,
                        style: { textAlign: "center" },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ marginRight: 2 }}>
              <Button
                onClick={handleVerifyOtp}
                disabled={otp.some((digit) => !digit)}
              >
                Xác nhận
              </Button>
            </DialogActions>
          </>
        )}
        {step === 3 && (
          <>
            <DialogTitle>
              <Box sx={{ display: "flex" }}>
                <Box sx={{ flexGrow: 1, fontSize: 20, fontWeight: 700 }}>
                  Đặt lại mật khẩu
                </Box>
                <Close fontSize="small" onClick={handleClose} sx={{cursor: "pointer"}} />
              </Box>
            </DialogTitle>
            <DialogContent
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  fontSize={14}
                  fontWeight={600}
                  sx={{ paddingBottom: "-4px" }}
                >
                  Mật khẩu mới
                </Typography>
                <TextField
                  label="Mật khẩu mới"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  
                  InputProps={{
                    endAdornment: (
                      <Box
                        sx={{ cursor: "pointer" }}
                        onClick={toggleNewPasswordVisibility}
                      >
                        {showNewPassword ? (
                          <VisibilityIcon
                            fontSize="small"
                            sx={{ color: "#99BC4D" }}
                          />
                        ) : (
                          <VisibilityOffIcon
                            fontSize="small"
                            sx={{ color: "#99BC4D" }}
                          />
                        )}
                      </Box>
                    ),
                  }}
                />
              </Box>
              <Box>
                <Typography fontSize={14} fontWeight={600}>
                  Xác nhận mật khẩu
                </Typography>
                <TextField
                  label="Xác nhận mật khẩu"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  error={newPassword !== confirmPassword}
                  sx={{
                    ".css-1epxxg8-MuiFormHelperText-root.Mui-error":{
                      color: "red",
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <Box
                        sx={{ cursor: "pointer" }}
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? (
                          <VisibilityIcon
                            fontSize="small"
                            sx={{ color: "#99BC4D" }}
                          />
                        ) : (
                          <VisibilityOffIcon
                            fontSize="small"
                            sx={{ color: "#99BC4D" }}
                          />
                        )}
                      </Box>
                    ),
                  }}
                />
                {newPassword !== confirmPassword && (
                  <FormHelperText error sx={{color: "red"}}>Mật khẩu không khớp</FormHelperText>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ marginRight: 2 }}>
              <Button
                onClick={handleResetPassword}
                disabled={!newPassword || newPassword !== confirmPassword}
              >
                Đặt lại mật khẩu
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{
            width: "100%", // Hoặc bạn có thể điều chỉnh width theo ý muốn
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ForgotPassword;
