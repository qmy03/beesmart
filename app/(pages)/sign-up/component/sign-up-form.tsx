import React, { useState } from "react";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Typography,
} from "@mui/material";
import TextField from "@/app/components/textfield";
import useSignupForm from "@/app/hooks/useSignupForm";
import { Button } from "@/app/components/button";
import SnackbarComponent from "@/app/components/snackbar";

const SignUpForm: React.FC = () => {
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const {
    userName,
    userNameError,
    password,
    passwordAgain,
    passwordError,
    passwordAgainError,
    passwordMismatchError,
    email,
    emailError,
    setUserName,
    setPassword,
    setPasswordAgain,
    setEmail,
    register,
  } = useSignupForm((message, isError) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(isError ? "error" : "success"); // Set severity based on error status
    setSnackbarOpen(true); // Open the Snackbar when message is set
  });

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        register();
      }}
    >
      <div className="flex-1 rounded-lg bg-white px-6 pb-7 pt-4 shadow-lg">
        <div className="flex flex-col items-center">
          <Typography variant="h5" className="mb-4 text-l font-bold ">
            Đăng ký tài khoản
          </Typography>
        </div>
        <div className="flex flex-col w-full relative pt-3">
          <div className="flex flex-col gap-4">
            <FormControl>
              <Typography fontSize="14px" fontWeight={700}>
                Tên đăng nhập<span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                label="Nhập tên đăng nhập"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                error={userNameError}
                helperText={userNameError ? "Vui lòng nhập tên đăng nhập" : ""}
                maxLength={50}
              />
            </FormControl>
            <div className="flex gap-1">
              <FormControl fullWidth>
                <Typography fontSize="14px" fontWeight={700}>
                  Nhập mật khẩu <span style={{ color: "red" }}>*</span>
                </Typography>
                <TextField
                  label="Nhập mật khẩu"
                  fullWidth
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={passwordError}
                  helperText={passwordError ? "Vui lòng nhập mật khẩu" : ""}
                />
              </FormControl>
              <FormControl
                fullWidth
                error={passwordAgainError || passwordMismatchError}
              >
                <Typography fontSize="14px" fontWeight={700}>
                  Nhập lại mật khẩu <span style={{ color: "red" }}>*</span>
                </Typography>
                <TextField
                  label="Nhập lại mật khẩu"
                  fullWidth
                  type="password"
                  value={passwordAgain}
                  onChange={(e) => setPasswordAgain(e.target.value)}
                  error={passwordAgainError || passwordMismatchError}
                  helperText={
                    passwordAgainError
                      ? "Vui lòng nhập lại mật khẩu"
                      : passwordMismatchError
                      ? "Mật khẩu không khớp"
                      : ""
                  }
                />
              </FormControl>
            </div>
            <FormControl>
              <Typography fontSize="14px" fontWeight={700}>
                Email<span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                label="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                helperText={
                  emailError
                    ? "Vui lòng nhập email"
                    : "Vui lòng nhập đúng email để xác thực tài khoản"
                }
                maxLength={50}
              />
            </FormControl>
            <div className="flex items-center justify-center mt-2">
              <FormControlLabel
                control={
                  <Checkbox
                    sx={{
                      color: "#99BC4D", // Default color
                      "&.Mui-checked": {
                        color: "#99BC4D", // Color when checked
                      },
                      "&:hover": {
                        backgroundColor: "#EDF0ED", // Background color on hover
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "14px" }}>
                    Đồng ý với{" "}
                    <span style={{ color: "#99BC4D" }}>Điều khoản sử dụng</span>{" "}
                    và{" "}
                    <span style={{ color: "#99BC4D" }}>Chính sách bảo mật</span>{" "}
                    của BeeSmart
                  </Typography>
                }
              />
            </div>
            <Button variant="contained" type="submit" className="mt-4 w-full">
              Đăng ký
            </Button>
          </div>
        </div>
      </div>

      {/* Snackbar for displaying messages */}
      <SnackbarComponent
        open={snackbarOpen}
        message={snackbarMessage || ""}
        severity={snackbarSeverity}
        onClose={handleSnackbarClose}
      />
    </form>
  );
};

export default SignUpForm;
