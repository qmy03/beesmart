import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"; // Use usePathname to get the current path
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import PlayLessonIcon from "@mui/icons-material/PlayLesson";
import { useAuth } from "@/app/hooks/AuthContext";
import { Avatar, Box, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LogoutIcon from "@mui/icons-material/Logout";
import Image from "next/image";

const Sidebar: React.FC = () => {
  const { logoutUser } = useAuth();
  const accessToken = localStorage.getItem("accessToken");
  const userInfo = localStorage.getItem("userInfo");

  // Parse userInfo if it's available and valid
  const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;

  console.log("ABCtoken", accessToken);
  console.log("userInfo", parsedUserInfo);

  const defaultUser = { username: "Guest", role: "user" };
  const currentUser = parsedUserInfo || defaultUser; // Use parsed userInfo or defaultUser if none exists
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const navigateTo = (path: string, parentMenuName?: string) => {
    router.push(path);
    if (parentMenuName && !openMenus.includes(parentMenuName)) {
      setOpenMenus((prevOpenMenus) => [...prevOpenMenus, parentMenuName]);
    }
  };

  const handleUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const menuList = [
    { name: "Tổng quan", icon: <DashboardIcon fontSize="small" />, path: "/dashboard" },
    {
      name: "Quản lý bài học",
      icon: <PlayLessonIcon fontSize="small" />,
      subMenu: [
        { name: "Môn học", path: "/subject", icon: <FiberManualRecordIcon sx={{ fontSize: "8px" }} /> },
        { name: "Loại sách", path: "/book-type", icon: <FiberManualRecordIcon sx={{ fontSize: "8px" }} /> },
        { name: "Lớp học", path: "/grade", icon: <FiberManualRecordIcon sx={{ fontSize: "8px" }} /> },
        { name: "Chủ điểm", path: "/topic", icon: <FiberManualRecordIcon sx={{ fontSize: "8px" }} /> },
        { name: "Bài học", path: "/lesson", icon: <FiberManualRecordIcon sx={{ fontSize: "8px" }} /> },
        { name: "Bài tập", path: "/quiz", icon: <FiberManualRecordIcon sx={{ fontSize: "8px" }} /> },
      ],
    },
    {
      name: "Người dùng",
      icon: <PeopleAltIcon fontSize="small" />,
      subMenu: [
        { name: "Quản lý người dùng", path: "/user", icon: <FiberManualRecordIcon sx={{ fontSize: "8px" }} /> },
        { name: "Lịch sử làm bài", path: "/statistic-homework-history", icon: <FiberManualRecordIcon sx={{ fontSize: "8px" }} /> },
      ],
    },
    {
      name: "Báo cáo",
      icon: <AssessmentIcon fontSize="small" />,
      subMenu: [
        { name: "Thống kê Bài học", path: "/statistic-lessons", icon: <FiberManualRecordIcon sx={{ fontSize: "8px" }} /> },
        { name: "Thống kê Quiz", path: "/statistic-quizzes", icon: <FiberManualRecordIcon sx={{ fontSize: "8px" }} /> },
      ],
    },
  ];

  useEffect(() => {
    menuList.forEach((menu) => {
      if (
        menu.subMenu &&
        menu.subMenu.some((subMenuItem) => pathname.startsWith(subMenuItem.path))
      ) {
        setOpenMenus((prevOpenMenus) =>
          prevOpenMenus.includes(menu.name)
            ? prevOpenMenus
            : [...prevOpenMenus, menu.name]
        );
      }
    });
  }, [pathname]);

  const toggleMenu = (menuName: string) => {
    setOpenMenus((prevOpenMenus) =>
      prevOpenMenus.includes(menuName)
        ? prevOpenMenus.filter((name) => name !== menuName)
        : [...prevOpenMenus, menuName]
    );
  };

  return (
    <aside className={`bg-[#FFFBF3] text-black h-screen flex flex-col ${isCollapsed ? "w-13" : "w-56"} transition-all duration-300 text-base`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <div className="flex items-center">
            <Image src="/logo.png" alt="BeeSmart Logo" width={50} height={50} />
            <span className="ml-2 font-bold text-xl text-[#99BC4D]">BeeSmart</span>
          </div>
        )}
        <button className="text-gray-600 hover:text-gray-900" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <MenuIcon fontSize="small" /> : <MenuOpenIcon fontSize="small" />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="mt-4">
          {menuList.map((menu, index) => (
            <li key={index} className="p-2">
              <div
                className={`flex justify-between items-center cursor-pointer p-2  flex-1 ${pathname === menu.path ? "bg-[#99BC4D]" : "hover:bg-[#99BC4D]"}`}
                onClick={() => menu.subMenu ? toggleMenu(menu.name) : navigateTo(menu.path)}
              >
                <div className="flex items-center">
                  {menu.icon}
                  {!isCollapsed && <span className="ml-2">{menu.name}</span>}
                </div>
                {!isCollapsed &&
                  menu.subMenu &&
                  (openMenus.includes(menu.name) ? (
                    <ExpandLess fontSize="small" className="text-gray-600 hover:text-gray-900" />
                  ) : (
                    <ExpandMore fontSize="small" className="text-gray-600 hover:text-gray-900" />
                  ))}
              </div>
              {/* Submenu */}
              {!isCollapsed &&
                menu.subMenu &&
                openMenus.includes(menu.name) && (
                  <ul className="ml-7 mt-2">
                    {menu.subMenu.map((subMenuItem, subIndex) => (
                      <li
                        key={subIndex}
                        className={`cursor-pointer p-2 ${pathname === subMenuItem.path ? "bg-[#99BC4D]" : "hover:bg-[#99BC4D]"}`}
                        onClick={() => navigateTo(subMenuItem.path, menu.name)}
                      >
                        <div className="flex items-center">
                          {subMenuItem.icon && <span className="mr-2">{subMenuItem.icon}</span>}
                          {subMenuItem.name}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
            </li>
          ))}
        </ul>
      </nav>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, borderTop: "1px solid #A8A8A8", padding: 1, borderBottom: "1px solid #A8A8A8", marginBottom: 1 }}>
        <Avatar sx={{ border: "2px solid #BB9066", color: "white", bgcolor: "#99BC4D" }}>
          {currentUser.username[0]}
        </Avatar>
        {!isCollapsed && (
          <>
            <Typography variant="body1" fontWeight={600} sx={{ flexGrow: 1 }}>
              {currentUser.username}
            </Typography>
            <IconButton onClick={handleUserMenu}>
              {anchorEl ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </>
        )}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleUserMenuClose}>
          <MenuItem onClick={logoutUser} sx={{ gap: 1 }}>
            <LogoutIcon />
            Đăng xuất
          </MenuItem>
        </Menu>
      </Box>
    </aside>
  );
};

export default Sidebar;

// import React, { useState, useEffect } from "react";
// import { useRouter, usePathname } from "next/navigation";
// import Image from "next/image";
// import { styled } from "@mui/material/styles";
// import {
//   Box,
//   List,
//   ListItem,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   Collapse,
//   Avatar,
//   IconButton,
//   Menu,
//   MenuItem,
//   Typography,
//   Divider
// } from "@mui/material";
// import {
//   ExpandMore,
//   ExpandLess,
//   Menu as MenuIcon,
//   MenuOpen as MenuOpenIcon,
//   Dashboard as DashboardIcon,
//   PeopleAlt as PeopleAltIcon,
//   Assessment as AssessmentIcon,
//   FiberManualRecord as FiberManualRecordIcon,
//   PlayLesson as PlayLessonIcon,
//   Logout as LogoutIcon
// } from "@mui/icons-material";
// import { useAuth } from "@/app/hooks/AuthContext";

// // Custom styled component for the sidebar
// const SidebarContainer = styled(Box)<{ collapsed: boolean }>(({ theme, collapsed }) => ({
//   backgroundColor: "#FFFBF3",
//   height: "100vh",
//   display: "flex",
//   flexDirection: "column",
//   width: collapsed ? 65 : 224,
//   transition: "width 0.3s",
//   color: "black",
//   overflow: "hidden"
// }));

// const Sidebar: React.FC = () => {
//   const { logoutUser } = useAuth();
//   const accessToken = localStorage.getItem("accessToken");
//   const userInfo = localStorage.getItem("userInfo");

//   // Parse userInfo if it's available and valid
//   const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;

//   console.log("ABCtoken", accessToken);
//   console.log("userInfo", parsedUserInfo);

//   const defaultUser = { username: "Guest", role: "user" };
//   const currentUser = parsedUserInfo || defaultUser;
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [openMenus, setOpenMenus] = useState<string[]>([]);
//   const router = useRouter();
//   const pathname = usePathname();
//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

//   const menuList = [
//     { name: "Tổng quan", icon: <DashboardIcon fontSize="small" />, path: "/dashboard" },
//     {
//       name: "Quản lý bài học",
//       icon: <PlayLessonIcon fontSize="small" />,
//       subMenu: [
//         { name: "Môn học", path: "/subject", icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} /> },
//         { name: "Loại sách", path: "/book-type", icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} /> },
//         { name: "Lớp học", path: "/grade", icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} /> },
//         { name: "Chủ điểm", path: "/topic", icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} /> },
//         { name: "Bài học", path: "/lesson", icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} /> },
//         { name: "Bài tập", path: "/quiz", icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} /> },
//       ],
//     },
//     {
//       name: "Người dùng",
//       icon: <PeopleAltIcon fontSize="small" />,
//       subMenu: [
//         { name: "Quản lý người dùng", path: "/user", icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} /> },
//         { name: "Lịch sử làm bài", path: "/statistic-homework-history", icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} /> },
//       ],
//     },
//     {
//       name: "Báo cáo",
//       icon: <AssessmentIcon fontSize="small" />,
//       subMenu: [
//         { name: "Thống kê Bài học", path: "/statistic-lessons", icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} /> },
//         { name: "Thống kê Quiz", path: "/statistic-quizzes", icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} /> },
//       ],
//     },
//   ];

//   const navigateTo = (path: string, parentMenuName?: string) => {
//     router.push(path);
//     if (parentMenuName && !openMenus.includes(parentMenuName)) {
//       setOpenMenus((prevOpenMenus) => [...prevOpenMenus, parentMenuName]);
//     }
//   };

//   const handleUserMenu = (event: React.MouseEvent<HTMLElement>) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleUserMenuClose = () => {
//     setAnchorEl(null);
//   };

//   useEffect(() => {
//     menuList.forEach((menu) => {
//       if (menu.subMenu && menu.subMenu.some((subMenuItem) => pathname.startsWith(subMenuItem.path))) {
//         setOpenMenus((prevOpenMenus) =>
//           prevOpenMenus.includes(menu.name) ? prevOpenMenus : [...prevOpenMenus, menu.name]
//         );
//       }
//     });
//   }, [pathname]);

//   const toggleMenu = (menuName: string) => {
//     setOpenMenus((prevOpenMenus) =>
//       prevOpenMenus.includes(menuName)
//         ? prevOpenMenus.filter((name) => name !== menuName)
//         : [...prevOpenMenus, menuName]
//     );
//   };

//   return (
//     <SidebarContainer collapsed={isCollapsed}>
//       {/* Header */}
//       <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2 }}>
//         {!isCollapsed && (
//           <Box sx={{ display: "flex", alignItems: "center" }}>
//             <Image src="/logo.png" alt="BeeSmart Logo" width={50} height={50} />
//             <Typography sx={{ ml: 1, fontWeight: "bold", fontSize: "1.25rem", color: "#99BC4D" }}>
//               BeeSmart
//             </Typography>
//           </Box>
//         )}
//         <IconButton
//           onClick={() => setIsCollapsed(!isCollapsed)}
//           sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}
//         >
//           {isCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
//         </IconButton>
//       </Box>

//       {/* Menu */}
//       <List sx={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden", pt: 0 }}>
//         {menuList.map((menu, index) => (
//           <React.Fragment key={index}>List
//             <ListItem disablePadding sx={{ display: "block" }}>
//               <ListItemButton
//                 sx={{
//                   minHeight: 48,
//                   px: 2.5,
//                   backgroundColor: pathname === menu.path ? "#99BC4D" : "inherit",
//                   "&:hover": { backgroundColor: "#99BC4D" },
//                 }}
//                 onClick={() => (menu.subMenu ? toggleMenu(menu.name) : navigateTo(menu.path))}
//               >
//                 <ListItemIcon sx={{ minWidth: 0, mr: isCollapsed ? 0 : 2, justifyContent: "center" }}>
//                   {menu.icon}
//                 </ListItemIcon>
//                 {!isCollapsed && (
//                   <ListItemText primary={menu.name} />
//                 )}
//                 {!isCollapsed && menu.subMenu && (
//                   openMenus.includes(menu.name) ? <ExpandLess sx={{fontSize: 16}}/> : <ExpandMore sx={{fontSize: 16}}/>
//                 )}
//               </ListItemButton>
//             </ListItem>
            
//             {/* Submenu */}
//             {!isCollapsed && menu.subMenu && (
//               <Collapse in={openMenus.includes(menu.name)} timeout="auto" unmountOnExit>
//                 <List component="div" disablePadding>
//                   {menu.subMenu.map((subMenuItem, subIndex) => (
//                     <ListItemButton
//                       key={subIndex}
//                       sx={{ 
//                         pl: 6,
//                         backgroundColor: pathname === subMenuItem.path ? "#99BC4D" : "inherit",
//                         "&:hover": { backgroundColor: "#99BC4D" },
//                       }}
//                       onClick={() => navigateTo(subMenuItem.path, menu.name)}
//                     >
//                       <ListItemIcon sx={{ minWidth: 20 }}>
//                         {subMenuItem.icon}
//                       </ListItemIcon>
//                       <ListItemText primary={subMenuItem.name} />
//                     </ListItemButton>
//                   ))}
//                 </List>
//               </Collapse>
//             )}
//           </React.Fragment>
//         ))}
//       </List>
      
//       {/* User Profile */}
//       <Divider />
//       <Box sx={{ 
//         display: "flex", 
//         alignItems: "center", 
//         p: 1.5, 
//         borderTop: "1px solid #A8A8A8", 
//       }}>
//         <Avatar sx={{ 
//           border: "2px solid #BB9066", 
//           bgcolor: "#99BC4D", 
//           color: "white",
//           width: 40, 
//           height: 40 
//         }}>
//           {currentUser.username[0]}
//         </Avatar>
//         {!isCollapsed && (
//           <>
//             <Typography 
//               variant="body1" 
//               fontWeight={600} 
//               sx={{ ml: 1.5, flexGrow: 1 }}
//             >
//               {currentUser.username}
//             </Typography>
//             <IconButton onClick={handleUserMenu} size="small">
//               {Boolean(anchorEl) ? <ExpandLess /> : <ExpandMore />}
//             </IconButton>
//           </>
//         )}
//         <Menu
//           anchorEl={anchorEl}
//           open={Boolean(anchorEl)}
//           onClose={handleUserMenuClose}
//           anchorOrigin={{
//             vertical: "bottom",
//             horizontal: "right",
//           }}
//           transformOrigin={{
//             vertical: "top",
//             horizontal: "right",
//           }}
//         >
//           <MenuItem onClick={logoutUser} sx={{ gap: 1 }}>
//             <LogoutIcon fontSize="small" />
//             <Typography>Đăng xuất</Typography>
//           </MenuItem>
//         </Menu>
//       </Box>
//       <Divider />
//     </SidebarContainer>
//   );
// };

// export default Sidebar;