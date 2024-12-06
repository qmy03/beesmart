// "use client";
// import apiService from "@/app/untils/api";
// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   AppBar,
//   Toolbar,
//   Typography,
//   IconButton,
//   Menu,
//   MenuItem,
//   InputBase,
//   Avatar,
// } from "@mui/material";
// import { Button } from "../../button";
// import TextField from "../../textfield";
// import { useRouter } from "next/navigation";
// import MenuIcon from "@mui/icons-material/Menu";
// import SearchIcon from "@mui/icons-material/Search";
// import MailIcon from "@mui/icons-material/Mail";
// import FacebookIcon from "@mui/icons-material/Facebook";
// import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
// import { useAuth } from "@/app/hooks/AuthContext";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import ExpandLessIcon from "@mui/icons-material/ExpandLess";
// const SideNav: React.FC = () => {
//   const { accessToken, logoutUser } = useAuth();
//   console.log("accessToken", accessToken);
//   const router = useRouter();
//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
//   const [user, setUser] = useState<{ name: string; email: string } | null>(
//     null
//   );

//   // Menu dropdown state
//   const [dropdownEl, setDropdownEl] = useState<null | HTMLElement>(null);
//   const [grades, setGrades] = useState<string[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");
//   const [isHovered, setIsHovered] = useState(false);

//   const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
//     setDropdownEl(event.currentTarget);
//     setIsHovered(true);
//   };

//   const handleMouseLeave = () => {
//     setDropdownEl(null);
//     setIsHovered(false);
//   };
//   const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
//     setDropdownEl(event.currentTarget);
//   };
//   useEffect(() => {
//     const fetchGrades = async () => {
//       setLoading(true);
//       try {
//         const response = await apiService.get("/grades");
//         // Extracting gradeName from response
//         const gradeNames = response.data.map(
//           (grade: { gradeName: string }) => grade.gradeName
//         );
//         setGrades(gradeNames); // Store gradeNames in state
//         setError(""); // Clear any previous error
//       } catch (error) {
//         setError("Failed to load grades.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchGrades();
//   }, []);
//   const handleMenuClose = () => {
//     setDropdownEl(null);
//   };

//   const handleUserMenu = (event: React.MouseEvent<HTMLElement>) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleUserMenuClose = () => {
//     setAnchorEl(null);
//   };

//   const handleNavigation = (path: string) => {
//     router.push(path);
//     handleMenuClose();
//   };

//   return (
//     <>
//       <AppBar position="static" sx={{ bgcolor: "#FFFBF3" }}>
//         <Toolbar
//           sx={{
//             flexDirection: "column",
//             alignItems: "start",
//             gap: 1,
//             paddingY: "16px",
//             marginX: "40px",
//           }}
//         >
//           {/* Hàng 1: Thông tin liên hệ */}
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "left",
//               width: "100%",
//               gap: 3,
//             }}
//           >
//             <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//               <MailIcon fontSize="small" sx={{ color: "#99BC4D" }} />
//               <Typography variant="body2" color="#99BC4D" fontWeight={700}>
//                 beesmart669@gmail.com
//               </Typography>
//             </Box>
//             <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//               <FacebookIcon fontSize="small" sx={{ color: "#99BC4D" }} />
//               <Typography variant="body2" color="#99BC4D" fontWeight={700}>
//                 Facebook BeeSmart
//               </Typography>
//             </Box>
//             <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//               <PhoneInTalkIcon fontSize="small" sx={{ color: "#99BC4D" }} />
//               <Typography variant="body2" color="#99BC4D" fontWeight={700}>
//                 0987654321
//               </Typography>
//             </Box>
//           </Box>

//           {/* Hàng 2: Logo, Search, Đăng nhập/Đăng ký */}
//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               width: "100%",
//               gap: 2,
//             }}
//           >
//             {/* Logo */}
//             <img
//               src="/logo.png"
//               alt="Logo"
//               style={{ width: 80, height: "auto", cursor: "pointer" }}
//               onClick={() => handleNavigation("/home")}
//             />
//             <TextField
//               variant="outlined"
//               InputProps={{
//                 startAdornment: (
//                   <SearchIcon fontSize="small" sx={{ fill: "#99BC4D" }} />
//                 ),
//               }}
//               placeholder="Tìm kiếm..."
//               sx={{ flex: 1, p: 0, m: 0 }}
//             />

//             {/* Buttons */}
//             {!user ? (
//               <>
//                 <Box
//                   sx={{
//                     display: "flex",
//                     gap: 2,
//                     flex: 1,
//                     justifyContent: "flex-end",
//                   }}
//                 >
//                   <Button
//                     variant="outlined"
//                     onClick={() => handleNavigation("/login")}
//                   >
//                     Đăng nhập
//                   </Button>
//                   <Button
//                     variant="contained"
//                     onClick={() => handleNavigation("/register")}
//                     sx={{ ml: 1 }}
//                   >
//                     Đăng ký
//                   </Button>
//                   <Button
//                     variant="contained"
//                     onClick={logoutUser}
//                     sx={{ ml: 1 }}
//                   >
//                     Đăng xuất
//                   </Button>
//                 </Box>
//               </>
//             ) : (
//               <Box sx={{ display: "flex", alignItems: "center" }}>
//                 <Avatar sx={{ cursor: "pointer" }} onClick={handleUserMenu}>
//                   {user.name[0]}
//                 </Avatar>
//                 <Typography
//                   variant="body2"
//                   sx={{ ml: 1, cursor: "pointer" }}
//                   onClick={handleUserMenu}
//                 >
//                   {user.name}
//                 </Typography>
//                 <Menu
//                   anchorEl={anchorEl}
//                   open={Boolean(anchorEl)}
//                   onClose={handleUserMenuClose}
//                 >
//                   <MenuItem onClick={() => handleNavigation("/profile")}>
//                     Tài khoản của bạn
//                   </MenuItem>
//                   <MenuItem
//                     onClick={() => handleNavigation("/change-password")}
//                   >
//                     Đổi mật khẩu
//                   </MenuItem>
//                   <MenuItem
//                     onClick={() => {
//                       setUser(null);
//                     }}
//                   >
//                     Đăng xuất
//                   </MenuItem>
//                 </Menu>
//               </Box>
//             )}
//           </Box>

//           {/* Hàng 3: Khóa học, Tài liệu miễn phí, Về chúng tôi... */}
//         </Toolbar>
//       </AppBar>
//       <AppBar
//         position="static"
//         sx={{ bgcolor: "#99BC4D", paddingX: 10, paddingY: 1 }}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             gap: 4,
//             bgcolor: "#99BC4D",
//             justifyContent: "center",
//             alignItem: "center",
//           }}
//           onMouseLeave={handleMouseLeave} // Đóng menu khi rời chuột khỏi khu vực
//         >
//           {/* Dropdown Khóa học */}
//           <Button
//             fullWidth
//             variant="text"
//             color="primary"
//             onMouseEnter={handleMouseEnter} // Mở menu khi hover
//             onClick={handleMouseEnter} // Mở menu khi click (tùy chọn)
//             endIcon={isHovered ? <ExpandLessIcon /> : <ExpandMoreIcon />} // Hiển thị biểu tượng
//             sx={{
//               textTransform: "none", // Giữ chữ không in hoa
//               color: "white",
//             }}
//           >
//             Khóa học
//           </Button>
//           <Menu
//             sx={{
//               ".css-1toxriw-MuiList-root-MuiMenu-list": {
//                 width: "100px",
//                 padding: 0,
//               },
//               ".MuiMenu-paper": {
//                 marginLeft: "65px",
//               },
//             }}
//             anchorEl={dropdownEl}
//             open={Boolean(dropdownEl)}
//             onClose={handleMouseLeave}
//             disableScrollLock // Tắt scroll lock để menu không làm ảnh hưởng cuộn trang
//             anchorOrigin={{
//               vertical: "bottom",
//               horizontal: "left",
//             }}
//             transformOrigin={{
//               vertical: "top",
//               horizontal: "left",
//             }}
//           >
//             {loading ? (
//               <MenuItem disabled>Đang tải...</MenuItem>
//             ) : error ? (
//               <MenuItem disabled>{error}</MenuItem>
//             ) : (
//               grades.map((gradeName) => (
//                 <MenuItem
//                   sx={{ borderBottom: "1px solid #99BC4D" }}
//                   key={gradeName}
//                   onClick={() => handleNavigation(`/course/${gradeName}`)}
//                 >
//                   {gradeName}
//                 </MenuItem>
//               ))
//             )}
//           </Menu>

//           <Button
//             fullWidth
//             variant="text"
//             color="primary"
//             onClick={() => handleNavigation("/document")}
//           >
//             Tài liệu miễn phí
//           </Button>
//           <Button
//             fullWidth
//             variant="text"
//             color="primary"
//             onClick={() => handleNavigation("/about-us")}
//           >
//             Về chúng tôi
//           </Button>
//           <Button
//             fullWidth
//             variant="text"
//             color="primary"
//             onClick={() => handleNavigation("/contact")}
//           >
//             Liên hệ
//           </Button>
//           <Button
//             fullWidth
//             variant="text"
//             color="primary"
//             onClick={() => handleNavigation("/minigame")}
//           >
//             Trò chơi
//           </Button>
//         </Box>
//       </AppBar>
//     </>
//   );
// };

// export default SideNav;
"use client";
import apiService from "@/app/untils/api";
import React, { useEffect, useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  InputBase,
  Avatar,
} from "@mui/material";
import { Button } from "../../button";
import TextField from "../../textfield";
import { useRouter } from "next/navigation";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import MailIcon from "@mui/icons-material/Mail";
import FacebookIcon from "@mui/icons-material/Facebook";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import { useAuth } from "@/app/hooks/AuthContext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const SideNav: React.FC = () => {
  const { accessToken, logoutUser } = useAuth();
  console.log("accessToken", accessToken); // Debugging: Log accessToken
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );

  // Menu dropdown state
  const [dropdownEl, setDropdownEl] = useState<null | HTMLElement>(null);
  const [grades, setGrades] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    setDropdownEl(event.currentTarget);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setDropdownEl(null);
    setIsHovered(false);
  };
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setDropdownEl(event.currentTarget);
  };

  useEffect(() => {
    const fetchGrades = async () => {
      setLoading(true);
      try {
        const response = await apiService.get("/grades");
        // Extracting gradeName from response
        const gradeNames = response.data.map(
          (grade: { gradeName: string }) => grade.gradeName
        );
        setGrades(gradeNames); // Store gradeNames in state
        setError(""); // Clear any previous error
      } catch (error) {
        setError("Failed to load grades.");
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  const handleMenuClose = () => {
    setDropdownEl(null);
  };

  const handleUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    handleMenuClose();
  };

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "#FFFBF3" }}>
        <Toolbar
          sx={{
            flexDirection: "column",
            alignItems: "start",
            gap: 1,
            paddingY: "16px",
            marginX: "40px",
          }}
        >
          {/* Hàng 1: Thông tin liên hệ */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "left",
              width: "100%",
              gap: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MailIcon fontSize="small" sx={{ color: "#99BC4D" }} />
              <Typography variant="body2" color="#99BC4D" fontWeight={700}>
                beesmart669@gmail.com
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FacebookIcon fontSize="small" sx={{ color: "#99BC4D" }} />
              <Typography variant="body2" color="#99BC4D" fontWeight={700}>
                Facebook BeeSmart
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PhoneInTalkIcon fontSize="small" sx={{ color: "#99BC4D" }} />
              <Typography variant="body2" color="#99BC4D" fontWeight={700}>
                0987654321
              </Typography>
            </Box>
          </Box>

          {/* Hàng 2: Logo, Search, Đăng nhập/Đăng ký */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              gap: 2,
            }}
          >
            {/* Logo */}
            <img
              src="/logo.png"
              alt="Logo"
              style={{ width: 80, height: "auto", cursor: "pointer" }}
              onClick={() => handleNavigation("/home")}
            />
            <TextField
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <SearchIcon fontSize="small" sx={{ fill: "#99BC4D" }} />
                ),
              }}
              placeholder="Tìm kiếm..."
              sx={{ flex: 1, p: 0, m: 0 }}
            />

            {/* Buttons - Conditionally render based on accessToken */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flex: 1,
                justifyContent: "flex-end",
              }}
            >
              {accessToken ? (
                <>
                  <Button variant="contained" onClick={logoutUser}>
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    onClick={() => handleNavigation("/login")}
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleNavigation("/register")}
                    sx={{ ml: 1 }}
                  >
                    Đăng ký
                  </Button>
                </>
              )}
            </Box>
          </Box>

          {/* Hàng 3: Khóa học, Tài liệu miễn phí, Về chúng tôi... */}
        </Toolbar>
      </AppBar>

      <AppBar
        position="static"
        sx={{ bgcolor: "#99BC4D", paddingX: 10, paddingY: 1 }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 4,
            bgcolor: "#99BC4D",
            justifyContent: "center",
            alignItem: "center",
          }}
          onMouseLeave={handleMouseLeave} // Đóng menu khi rời chuột khỏi khu vực
        >
          {/* Dropdown Khóa học */}
          {/* <Button
            fullWidth
            variant="text"
            color="primary"
            onMouseEnter={handleMouseEnter} // Mở menu khi hover
            onClick={handleMouseEnter} // Mở menu khi click (tùy chọn)
            endIcon={isHovered ? <ExpandLessIcon /> : <ExpandMoreIcon />} // Hiển thị biểu tượng
            sx={{
              textTransform: "none", // Giữ chữ không in hoa
              color: "white",
            }}
          >
            Khóa học
          </Button> */}
          <Menu
            sx={{
              ".css-1toxriw-MuiList-root-MuiMenu-list": {
                width: "100px",
                padding: 0,
              },
              ".MuiMenu-paper": {
                marginLeft: "65px",
              },
            }}
            anchorEl={dropdownEl}
            open={Boolean(dropdownEl)}
            onClose={handleMouseLeave}
            disableScrollLock // Tắt scroll lock để menu không làm ảnh hưởng cuộn trang
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            {loading ? (
              <MenuItem disabled>Đang tải...</MenuItem>
            ) : error ? (
              <MenuItem disabled>{error}</MenuItem>
            ) : (
              grades.map((gradeName) => (
                <MenuItem
                  sx={{ borderBottom: "1px solid #99BC4D" }}
                  key={gradeName}
                  onClick={() => handleNavigation(`/course/${gradeName}`)}
                >
                  {gradeName}
                </MenuItem>
              ))
            )}
          </Menu>
          <Button
            fullWidth
            variant="text"
            sx={{ textTransform: "none", color: "white" }}
            onClick={() => handleNavigation("/skill-list")}
          >
            Vào học
          </Button>

          <Button
            fullWidth
            variant="text"
            sx={{ textTransform: "none", color: "white" }}
            onClick={() => handleNavigation("/free-resources")}
          >
            Tài liệu miễn phí
          </Button>

          <Button
            fullWidth
            variant="text"
            sx={{ textTransform: "none", color: "white" }}
            onClick={() => handleNavigation("/about")}
          >
            Về chúng tôi
          </Button>
          <Button
            fullWidth
            variant="text"
            color="primary"
            onClick={() => handleNavigation("/contact")}
          >
            Liên hệ
          </Button>
          <Button
            fullWidth
            variant="text"
            color="primary"
            onClick={() => handleNavigation("/minigame")}
          >
            Trò chơi
          </Button>
        </Box>
      </AppBar>
    </>
  );
};

export default SideNav;
