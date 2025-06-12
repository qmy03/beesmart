import {
  Avatar,
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Typography,
} from "@mui/material";
import Image from "next/image";
import React, { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Button } from "@/app/components/button";
import TextField from "@/app/components/textfield";
import { useAuth } from "@/app/hooks/AuthContext"; // Import useAuth hook
import SnackbarComponent from "@/app/components/snackbar"; // Import the Snackbar component
import Link from "next/link";
import ForgotPassword from "./dialog-forgot-password";
import Layout from "@/app/components/user/Home/layout";

const LoginForm = () => {
  const { loginUser } = useAuth();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openForgotPassword, setOpenForgotPassword] = useState(false); // Quản lý trạng thái dialog
  const [passwordError, setPasswordError] = useState(false);
  const [userNameError, setUserNameError] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    let isValid = true;

    if (!userName.trim()) {
      setUserNameError(true);
      isValid = false;
    } else {
      setUserNameError(false);
    }

    if (!password.trim()) {
      setPasswordError(true);
      isValid = false;
    } else {
      setPasswordError(false);
    }

    if (!isValid) {
      return;
    }

    try {
      await loginUser(userName, password);
    } catch (error: any) {
      setErrorMessage("Tên tài khoản hoặc mật khẩu không đúng");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleOpenDialog = () => {
    setOpenForgotPassword(true);
  };

  const handleCloseDialog = () => {
    setOpenForgotPassword(false);
  };

  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          paddingY: 3,
          alignItems: "center",
          backgroundColor: "#EFF3E6",
          minHeight: "100vh",
        }}
      >
        <form className=" w-[40vw] space-y-3" onSubmit={handleLogin}>
          <div className="flex-1 rounded-lg bg-white px-6 pb-7 pt-4 shadow-lg">
            <div className="flex flex-col items-center gap-2">
              <Typography fontSize="28px" className="mb-3 text-l font-bold">
                Đăng nhập vào hệ thống
              </Typography>
              <Image src="/logo.png" width={144} height={98} alt="Logo" />
            </div>
            <div className="flex flex-col w-full relative pt-3">
              <FormControl>
                <Typography fontSize="16px" fontWeight={700}>
                  Tên đăng nhập <span style={{ color: "red" }}>*</span>
                </Typography>
                <TextField
                  label="Nhập tên đăng nhập"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  error={userNameError}
                  helperText={
                    userNameError ? "Vui lòng nhập tên đăng nhập" : ""
                  }
                  FormHelperTextProps={{
                    sx: {
                      paddingY: "2px",
                      marginX: 0,
                      color: "red",
                      fontSize: 14,
                    },
                  }}
                />
              </FormControl>
              <FormControl sx={{ paddingTop: "16px" }}>
                <Typography fontSize="16px" fontWeight={700}>
                  Nhập mật khẩu <span style={{ color: "red" }}>*</span>
                </Typography>
                <TextField
                  type={showPassword ? "text" : "password"}
                  label="Nhập mật khẩu"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={passwordError}
                  helperText={passwordError ? "Vui lòng nhập mật khẩu" : ""}
                  FormHelperTextProps={{
                    sx: {
                      paddingY: "2px",
                      marginX: 0,
                      color: "red",
                      fontSize: 14,
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={togglePasswordVisibility}>
                          {showPassword ? (
                            <VisibilityOffIcon
                              fontSize="small"
                              sx={{ color: "#99BC4D" }}
                            />
                          ) : (
                            <VisibilityIcon
                              fontSize="small"
                              sx={{ color: "#99BC4D" }}
                            />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
              <div className="flex items-center justify-between mt-2 mb-2">
                <FormControlLabel
                  control={<Checkbox sx={{ color: "#99BC4D" }} />}
                  label="Nhớ đăng nhập"
                  sx={{
                    fontSize: "14px",
                    color: "black",
                    ".css-rizt0-MuiTypography-root": {
                      fontSize: "14px",
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  sx={{ border: "none" }}
                  onClick={handleOpenDialog}
                >
                  Quên mật khẩu?
                </Button>
              </div>
              {errorMessage && (
                <Typography color="error">{errorMessage}</Typography>
              )}
              <Button variant="contained" type="submit" sx={{ marginTop: 4 }}>
                Đăng nhập
              </Button>
              <Typography
                variant="body2"
                align="center"
                sx={{ marginTop: 2, color: "#6b7280 " }}
                // className="mt-5 text-sm text-gray-500"
              >
                Bạn chưa có tài khoản?{" "}
                <Link
                  href="/sign-up"
                  className="text-[#99BC4D] hover:underline font-bold"
                >
                  Đăng ký ngay
                </Link>
              </Typography>
            </div>
          </div>
          <SnackbarComponent
            open={errorMessage !== null}
            message={errorMessage || ""}
            severity="error"
            onClose={() => setErrorMessage(null)}
          />
        </form>
        <ForgotPassword open={openForgotPassword} onClose={handleCloseDialog} />
      </Box>
    </Layout>
  );
};

export default LoginForm;
