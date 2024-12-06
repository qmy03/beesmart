import { Avatar, Checkbox, FormControl, FormControlLabel, IconButton, InputAdornment, Typography } from "@mui/material";
import Image from "next/image";
import React, { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Button } from "@/app/components/button";
import TextField from "@/app/components/textfield";
import { useAuth } from "@/app/hooks/AuthContext"; // Import useAuth hook
import SnackbarComponent from "@/app/components/snackbar"; // Import the Snackbar component

const LoginForm = () => {
  const { loginUser } = useAuth(); // Destructure loginUser from AuthContext
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await loginUser(username, password); // Use the loginUser function from AuthContext
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Login failed");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form className="space-y-3" onSubmit={handleLogin}>
      <div className="flex-1 rounded-lg bg-white px-6 pb-7 pt-4 shadow-lg">
        <div className="flex flex-col items-center gap-2">
          <Typography variant="h5" className="mb-3 text-l font-bold text-center">
            Đăng nhập vào hệ thống
          </Typography>
          <Image src="/logo.png" width={144} height={98} alt="Logo" />
        </div>
        <div className=" flex flex-col w-full relative pt-3">
          <FormControl>
            <Typography fontSize="14px" fontWeight={700}>
              Tên đăng nhập <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              label="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={50}
            />
          </FormControl>
          <FormControl sx={{ paddingTop: "16px" }}>
            <Typography fontSize="14px" fontWeight={700}>
              Mật khẩu <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              label="Nhập mật khẩu"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility}>
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
          <div className="flex items-center justify-between mt-2">
            <FormControlLabel
              control={<Checkbox sx={{ color: "#99BC4D" }} />}
              label="Nhớ đăng nhập"
              sx={{ fontSize: "14px", color: "black" }}
            />
            <Button variant="text">Quên mật khẩu?</Button>
          </div>
          {errorMessage && <Typography color="error">{errorMessage}</Typography>}
          <Button variant="contained" type="submit" className="mt-4 w-full">
            Đăng nhập
          </Button>
        </div>
      </div>
      <SnackbarComponent
        open={errorMessage !== null}
        message={errorMessage || ""}
        severity="error"
        onClose={() => setErrorMessage(null)}
      />
    </form>
  );
};

export default LoginForm;
