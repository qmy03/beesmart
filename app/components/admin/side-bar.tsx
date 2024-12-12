"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LogoutIcon from "@mui/icons-material/Logout";
import { Button } from "../button";
const Sidebar: React.FC = () => {
  const { accessToken, logoutUser, userInfo } = useAuth(); // Lấy accessToken từ context
  console.log("userInfo", userInfo?.username);
  // const username = userInfo?.username;
  console.log("ABCtoken", accessToken);
  const defaultUser = { username: "Guest", role: "user" };
  const currentUser = userInfo || defaultUser;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const router = useRouter();
  const pathname = usePathname(); // Get the current path
  // const { accessToken, logoutUser, userInfo } = useAuth();
  // console.log("AaaaccessToken", accessToken);
  // console.log("userInfo", userInfo);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigateTo = (path: string) => {
    router.push(path);
  };
  const handleUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const menuList = [
    {
      name: "Tổng quan",
      icon: <DashboardIcon fontSize="small" />,
      path: "/dashboard",
    },
    {
      name: "Quản lý bài học",
      icon: <PlayLessonIcon fontSize="small" />,
      // path: "/dashboard",
      subMenu: [
        {
          name: "Lớp học",
          path: "/grade",
          icon: <FiberManualRecordIcon sx={{ fontSize: "8px" }} />,
        },
        {
          name: "Chủ điểm",
          path: "/topic",
          icon: <FiberManualRecordIcon sx={{ fontSize: "8px" }} />,
        },
        {
          name: "Bài học",
          path: "/lesson",
          icon: <FiberManualRecordIcon sx={{ fontSize: "8px" }} />,
        },
        {
          name: "Bài tập",
          path: "/quiz",
          icon: <FiberManualRecordIcon sx={{ fontSize: "8px" }} />,
        },
      ],
    },
    {
      name: "Người dùng",
      icon: <PeopleAltIcon fontSize="small" />,
      subMenu: [
        {
          name: "Quản lý người dùng",
          path: "/user",
          icon: <FiberManualRecordIcon sx={{ fontSize: "8px" }} />,
        },
        {
          name: "Lịch sử làm bài",
          path: "/statistic-homework-history",
          icon: <FiberManualRecordIcon sx={{ fontSize: "8px" }} />,
        },
      ],
    },
    {
      name: "Báo cáo",
      icon: <AssessmentIcon fontSize="small" />,
      subMenu: [
        {
          name: "Thống kê Bài học",
          path: "/statistic-lessons",
          icon: <FiberManualRecordIcon sx={{ fontSize: "8px" }} />,
        },
        {
          name: "Thống kê Quiz",
          path: "/statistic-quizzes",
          icon: <FiberManualRecordIcon sx={{ fontSize: "8px" }} />,
        },
        // {
        //   name: "Thống kê Bài học",
        //   path: "/statistic-lessons",
        //   icon: <FiberManualRecordIcon sx={{ fontSize: "8px" }} />,
        // },
      ],
    },
  ];

  // Automatically expand the "Dashboard" menu if the current path is inside its submenu
  useEffect(() => {
    if (
      pathname.startsWith("/grade") ||
      pathname.startsWith("/topic") ||
      pathname.startsWith("/lesson")
    ) {
      setOpenMenus((prevOpenMenus) => {
        // Ensure "Dashboard" is open when on its subpages
        if (!prevOpenMenus.includes("Dashboard")) {
          return [...prevOpenMenus, "Dashboard"];
        }
        return prevOpenMenus;
      });
    }
  }, [pathname]);

  const toggleMenu = (menuName: string) => {
    setOpenMenus((prevOpenMenus) =>
      prevOpenMenus.includes(menuName)
        ? prevOpenMenus.filter((name) => name !== menuName)
        : [...prevOpenMenus, menuName]
    );
  };

  return (
    <aside
      className={`bg-[#FFFBF3] text-black h-screen flex flex-col ${isCollapsed ? "w-13" : "w-64"} transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <div className="flex items-center">
            <Image src="/logo.png" alt="BeeSmart Logo" width={50} height={50} />
            <span className="ml-2 font-bold text-xl text-[#99BC4D]">
              BeeSmart
            </span>
          </div>
        )}
        <button
          className="text-gray-600 hover:text-gray-900"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <MenuIcon fontSize="small" />
          ) : (
            <MenuOpenIcon fontSize="small" />
          )}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1">
        <ul className="mt-4">
          {menuList.map((menu, index) => (
            <li key={index} className="p-2">
              <div
                className={`flex justify-between items-center cursor-pointer p-2  flex-1 ${pathname === menu.path ? "bg-[#99BC4D]" : "hover:bg-[#99BC4D]"}`}
                onClick={() =>
                  menu.subMenu ? toggleMenu(menu.name) : navigateTo(menu.path)
                }
              >
                <div className="flex items-center">
                  {menu.icon}
                  {!isCollapsed && <span className="ml-2">{menu.name}</span>}
                </div>
                {!isCollapsed &&
                  menu.subMenu &&
                  (openMenus.includes(menu.name) ? (
                    <ExpandLess
                      fontSize="small"
                      className="text-gray-600 hover:text-gray-900"
                    />
                  ) : (
                    <ExpandMore
                      fontSize="small"
                      className="text-gray-600 hover:text-gray-900"
                    />
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
                        onClick={() => navigateTo(subMenuItem.path)}
                      >
                        <div className="flex items-center">
                          {subMenuItem.icon && (
                            <span className="mr-2">{subMenuItem.icon}</span>
                          )}
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderTop: "1px solid #A8A8A8",
          padding: 1,
          borderBottom: "1px solid #A8A8A8",
          marginBottom: 1,
        }}
      >
        <Avatar
          sx={{
            border: "2px solid #BB9066",
            color: "white",
            bgcolor: "#99BC4D",
          }}
        >
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
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleUserMenuClose}
        >
          <MenuItem onClick={logoutUser} sx={{ gap: 1 }}>
            <LogoutIcon sx={{ color: "grey" }} />
            Đăng xuất
          </MenuItem>
        </Menu>
      </Box>
      {/* <div className="p-4 border-t border-gray-300">
        <button
          className="w-full text-left text-red-600 hover:text-red-800 flex items-center"
          onClick={logoutUser} // Gọi hàm logoutUser từ useAuth
        >
          <LogoutIcon fontSize="small" className="mr-2" />
          Đăng xuất
        </button>
      </div> */}
    </aside>
  );
};

export default Sidebar;
