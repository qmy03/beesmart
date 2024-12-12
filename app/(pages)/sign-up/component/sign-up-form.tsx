// import React, { useState } from "react";
// import {
//   Checkbox,
//   FormControl,
//   FormControlLabel,
//   Typography,
// } from "@mui/material";
// import TextField from "@/app/components/textfield";
// import useSignupForm from "@/app/hooks/useSignupForm";
// import { Button } from "@/app/components/button";
// import SnackbarComponent from "@/app/components/snackbar";

// const SignUpForm: React.FC = () => {
//   const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
//   const [snackbarOpen, setSnackbarOpen] = useState(false);
//   const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
//     "success"
//   );

//   const handleSnackbarClose = () => {
//     setSnackbarOpen(false);
//   };

//   const {
//     userName,
//     userNameError,
//     password,
//     passwordAgain,
//     passwordError,
//     passwordAgainError,
//     passwordMismatchError,
//     email,
//     emailError,
//     setUserName,
//     setPassword,
//     setPasswordAgain,
//     setEmail,
//     register,
//   } = useSignupForm((message, isError) => {
//     setSnackbarMessage(message);
//     setSnackbarSeverity(isError ? "error" : "success"); // Set severity based on error status
//     setSnackbarOpen(true); // Open the Snackbar when message is set
//   });

//   return (
//     <form
//       className="space-y-3"
//       onSubmit={(e) => {
//         e.preventDefault();
//         register();
//       }}
//     >
//       <div className="flex-1 rounded-lg bg-white px-6 pb-7 pt-4 shadow-lg">
//         <div className="flex flex-col items-center">
//           <Typography variant="h5" className="mb-4 text-l font-bold ">
//             Đăng ký tài khoản
//           </Typography>
//         </div>
//         <div className="flex flex-col w-full relative pt-3">
//           <div className="flex flex-col gap-4">
//             <FormControl>
//               <Typography fontSize="14px" fontWeight={700}>
//                 Tên đăng nhập<span style={{ color: "red" }}>*</span>
//               </Typography>
//               <TextField
//                 label="Nhập tên đăng nhập"
//                 value={userName}
//                 onChange={(e) => setUserName(e.target.value)}
//                 error={userNameError}
//                 helperText={userNameError ? "Vui lòng nhập tên đăng nhập" : ""}
//                 maxLength={50}
//               />
//             </FormControl>
//             <div className="flex gap-1">
//               <FormControl fullWidth>
//                 <Typography fontSize="14px" fontWeight={700}>
//                   Nhập mật khẩu <span style={{ color: "red" }}>*</span>
//                 </Typography>
//                 <TextField
//                   label="Nhập mật khẩu"
//                   fullWidth
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   error={passwordError}
//                   helperText={passwordError ? "Vui lòng nhập mật khẩu" : ""}
//                 />
//               </FormControl>
//               <FormControl
//                 fullWidth
//                 error={passwordAgainError || passwordMismatchError}
//               >
//                 <Typography fontSize="14px" fontWeight={700}>
//                   Nhập lại mật khẩu <span style={{ color: "red" }}>*</span>
//                 </Typography>
//                 <TextField
//                   label="Nhập lại mật khẩu"
//                   fullWidth
//                   type="password"
//                   value={passwordAgain}
//                   onChange={(e) => setPasswordAgain(e.target.value)}
//                   error={passwordAgainError || passwordMismatchError}
//                   helperText={
//                     passwordAgainError
//                       ? "Vui lòng nhập lại mật khẩu"
//                       : passwordMismatchError
//                       ? "Mật khẩu không khớp"
//                       : ""
//                   }
//                 />
//               </FormControl>
//             </div>
//             <FormControl>
//               <Typography fontSize="14px" fontWeight={700}>
//                 Email<span style={{ color: "red" }}>*</span>
//               </Typography>
//               <TextField
//                 label="Nhập email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 error={emailError}
//                 helperText={
//                   emailError
//                     ? "Vui lòng nhập email"
//                     : "Vui lòng nhập đúng email để xác thực tài khoản"
//                 }
//                 maxLength={50}
//               />
//             </FormControl>
//             <div className="flex items-center justify-center mt-2">
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     sx={{
//                       color: "#99BC4D", // Default color
//                       "&.Mui-checked": {
//                         color: "#99BC4D", // Color when checked
//                       },
//                       "&:hover": {
//                         backgroundColor: "#EDF0ED", // Background color on hover
//                       },
//                     }}
//                   />
//                 }
//                 label={
//                   <Typography sx={{ fontSize: "14px" }}>
//                     Đồng ý với{" "}
//                     <span style={{ color: "#99BC4D" }}>Điều khoản sử dụng</span>{" "}
//                     và{" "}
//                     <span style={{ color: "#99BC4D" }}>Chính sách bảo mật</span>{" "}
//                     của BeeSmart
//                   </Typography>
//                 }
//               />
//             </div>
//             <Button variant="contained" type="submit" className="mt-4 w-full">
//               Đăng ký
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Snackbar for displaying messages */}
//       <SnackbarComponent
//         open={snackbarOpen}
//         message={snackbarMessage || ""}
//         severity={snackbarSeverity}
//         onClose={handleSnackbarClose}
//       />
//     </form>
//   );
// };

// export default SignUpForm;
import React, { useState } from "react";
import {
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Typography,
  Checkbox,
  Box,
  InputAdornment,
  IconButton,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import TextField from "@/app/components/textfield";
import useSignupForm from "@/app/hooks/useSignupForm";
import { Button } from "@/app/components/button";
import SnackbarComponent from "@/app/components/snackbar";
import Link from "next/link";
import Layout from "@/app/components/user/Home/layout";
import Person4Icon from "@mui/icons-material/Person4";
import FaceIcon from "@mui/icons-material/Face";
const SignUpForm: React.FC = () => {
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [role, setRole] = useState<string>("STUDENT"); // Default role
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordAgain, setShowPasswordAgain] = useState(false);
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
    setSnackbarSeverity(isError ? "error" : "success");
    setSnackbarOpen(true);
  });
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const togglePasswordAgainVisibility = () => {
    setShowPasswordAgain(!showPasswordAgain);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register({ role }); // Truyền role vào hàm register
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
        }}
      >
        <form className="pt-3 w-[70vw] space-y-3" onSubmit={handleSubmit}>
          <div className="flex-1 rounded-lg bg-white px-6 pb-4 pt-4 shadow-lg">
            <div className="flex flex-col items-center">
              <Typography fontSize="28px" className="mb-3 text-l font-bold">
                Đăng ký tài khoản
              </Typography>
            </div>
            <div className="flex flex-col w-full relative pt-3">
              <div className="flex flex-col gap-2">
                <FormControl>
                  <Typography
                    fontSize="20px"
                    fontWeight={700}
                    textAlign="center"
                  >
                    Hãy chọn loại tài khoản phù hợp với bạn
                  </Typography>
                  <Box
                    sx={{
                      pt: 2,
                      display: "flex",
                      gap: 9,
                      justifyContent: "center",
                    }}
                  >
                    {/* Box Học sinh */}
                    <Box
                      onClick={() => setRole("STUDENT")}
                      sx={{
                        paddingY: 1,
                        width: "110px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1,
                        border:
                          role === "STUDENT"
                            ? "2px solid #99BC4D"
                            : "2px solid #ccc",
                        borderRadius: 2,
                        cursor: "pointer",
                        backgroundColor:
                          role === "STUDENT" ? "#F0F5E5" : "white",
                        boxShadow: role === "STUDENT" ? "3" : "none",
                      }}
                    >
                      <FaceIcon />
                      <Typography
                        sx={{ color: role === "STUDENT" ? "#99BC4D" : "black" }}
                      >
                        Học sinh
                      </Typography>
                    </Box>

                    {/* Box Phụ huynh */}
                    <Box
                      onClick={() => setRole("PARENT")}
                      sx={{
                        paddingY: 1,
                        width: "110px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1,
                        border:
                          role === "PARENT"
                            ? "2px solid #99BC4D"
                            : "2px solid #ccc",
                        borderRadius: 2,
                        cursor: "pointer",
                        backgroundColor:
                          role === "PARENT" ? "#F0F5E5" : "white",
                        boxShadow: role === "PARENT" ? "3" : "none",
                      }}
                    >
                      <Person4Icon />
                      <Typography
                        sx={{ color: role === "PARENT" ? "#99BC4D" : "black" }}
                      >
                        Phụ huynh
                      </Typography>
                    </Box>
                  </Box>
                </FormControl>

                <FormControl>
                  <Typography fontSize="14px" fontWeight={700}>
                    Tên đăng nhập<span style={{ color: "red" }}> *</span>
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
                    maxLength={50}
                  />
                </FormControl>
                <div className="flex gap-8">
                  <FormControl fullWidth>
                    <Typography fontSize="14px" fontWeight={700}>
                      Nhập mật khẩu <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      type={showPassword ? "text" : "password"}
                      label="Nhập mật khẩu"
                      fullWidth
                      // type="password"
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
                      type={showPasswordAgain ? "text" : "password"}
                      value={passwordAgain}
                      onChange={(e) => setPasswordAgain(e.target.value)}
                      error={passwordAgainError || passwordMismatchError}
                      sx={{
                        ".css-186ql75-MuiFormHelperText-root.Mui-error": {
                          color: "red",
                        },
                      }}
                      helperText={
                        passwordAgainError
                          ? "Vui lòng nhập lại mật khẩu"
                          : passwordMismatchError
                            ? "Mật khẩu không khớp"
                            : ""
                      }
                      FormHelperTextProps={{
                        sx: {
                          paddingY: 1,
                          marginX: 0,
                          color: "red",
                          fontSize: 14,
                        },
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={togglePasswordAgainVisibility}>
                              {showPasswordAgain ? (
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
                </div>
                <FormControl>
                  <Typography fontSize="14px" fontWeight={700}>
                    Email<span style={{ color: "red" }}> *</span>
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
                    FormHelperTextProps={{
                      sx: {
                        paddingY: "2px",
                        marginX: 0,
                        color: "red",
                        fontSize: 14,
                      },
                    }}
                    maxLength={50}
                  />
                </FormControl>

                {/* Role Selection */}

                <div className="flex items-center justify-center mt-2">
                  <FormControlLabel
                    control={
                      <Checkbox
                        sx={{
                          color: "#99BC4D",
                          "&.Mui-checked": { color: "#99BC4D" },
                          "&:hover": { backgroundColor: "#EDF0ED" },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: "14px", fontWeight: 700 }}>
                        Đồng ý với{" "}
                        <span style={{ color: "#99BC4D" }}>
                          Điều khoản sử dụng
                        </span>{" "}
                        và{" "}
                        <span style={{ color: "#99BC4D" }}>
                          Chính sách bảo mật
                        </span>{" "}
                        của BeeSmart
                      </Typography>
                    }
                  />
                </div>
                <Button
                  variant="contained"
                  type="submit"
                  className="mt-4 w-full"
                >
                  Đăng ký
                </Button>
                <Typography
                  variant="body2"
                  align="center"
                  className="mt-3 text-sm text-gray-600"
                >
                  Bạn đã có tài khoản?{" "}
                  <Link
                    href="/login"
                    className="text-[#99BC4D] hover:underline font-bold"
                  >
                    Đăng nhập ngay
                  </Link>
                </Typography>
              </div>
            </div>
          </div>

          {/* Snackbar */}
          <SnackbarComponent
            open={snackbarOpen}
            message={snackbarMessage || ""}
            severity={snackbarSeverity}
            onClose={handleSnackbarClose}
          />
        </form>
      </Box>
    </Layout>
  );
};

export default SignUpForm;
