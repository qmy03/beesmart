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

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const router = useRouter();
  const pathname = usePathname(); // Get the current path

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const menuList = [
    {
      name: "Dashboard",
      icon: <DashboardIcon fontSize="small" />,
      path: "/dashboard",
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
      path: "/user",
      subMenu: [{ name: "Quản lý người dùng", path: "/user/manage",
        icon: <FiberManualRecordIcon sx={{ fontSize: "8px" }} /> }],
    },
    {
      name: "Báo cáo",
      icon: <AssessmentIcon fontSize="small" />,
      path: "/reports",
      subMenu: [
        { name: "Thống kê Lớp học", path: "/reports/classes",
            icon: <FiberManualRecordIcon sx={{ fontSize: "8px" }} /> },
        { name: "Thống kê Chủ điểm", path: "/reports/topics",
            icon: <FiberManualRecordIcon sx={{ fontSize: "8px" }} /> },
        { name: "Thống kê Bài học", path: "/reports/lessons",
            icon: <FiberManualRecordIcon sx={{ fontSize: "8px" }} /> },
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
                className={`flex justify-between items-center cursor-pointer p-2 ${pathname === menu.path ? "bg-[#99BC4D]" : "hover:bg-[#99BC4D]"}`}
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
    </aside>
  );
};

export default Sidebar;
