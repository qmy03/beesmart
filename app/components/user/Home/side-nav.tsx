"use client";
import apiService from "@/app/untils/api";
import React, { useEffect, useState, useRef } from "react";
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
  Autocomplete,
  CircularProgress,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { Button } from "../../button";
import TextField from "../../textfield";
import { usePathname, useRouter } from "next/navigation";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import MailIcon from "@mui/icons-material/Mail";
import FacebookIcon from "@mui/icons-material/Facebook";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useAuth } from "@/app/hooks/AuthContext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";
import DoneAllIcon from "@mui/icons-material/DoneAll";

// Interface for Notification
interface Notification {
  notificationId: string;
  title: string;
  message: string;
  link: string;
  type: string;
  read: boolean;
  createdAt: string;
}

const SideNav: React.FC = () => {
  const { accessToken, logoutUser, userInfo } = useAuth();
  const pathname = usePathname();
  const role = userInfo?.role;
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const websocketRef = useRef<WebSocket | null>(null);

  // Menu dropdown state
  const [dropdownEl, setDropdownEl] = useState<null | HTMLElement>(null);
  const [grades, setGrades] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isHovered, setIsHovered] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [options, setOptions] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  // Connect to WebSocket when user is logged in
  useEffect(() => {
    if (accessToken && userInfo) {
      // Fetch existing notifications first
      fetchNotifications();
      
      // Then establish WebSocket connection
      // Uncomment this when WebSocket is ready
      // connectWebSocket();
      
      // Clean up WebSocket connection on unmount
      return () => {
        if (websocketRef.current) {
          websocketRef.current.close();
        }
      };
    }
  }, [accessToken, userInfo]);

  // Fetch existing notifications from the backend
  const fetchNotifications = async () => {
    try {
      // Ensure the token is properly sent with the Authorization header
      const response = await apiService.get("/notifications", {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      console.log("Notification response:", response);
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Handle the case where notifications are in response.data.data (as shown in your sample response)
        setNotifications(response.data.data);
        const unread = response.data.data.filter((notification: Notification) => !notification.read).length;
        setUnreadCount(unread);
      } else if (response.data && Array.isArray(response.data)) {
        // Handle the case where notifications are directly in response.data
        setNotifications(response.data);
        const unread = response.data.filter((notification: Notification) => !notification.read).length;
        setUnreadCount(unread);
      } else {
        console.error("Unexpected notification response format:", response.data);
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Fallback to empty notifications list on error
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // Connect to WebSocket for real-time notifications
  const connectWebSocket = () => {
    if (!accessToken) return;
    
    // Fix the WebSocket URL format and token handling
    // Remove the extra slash and correctly format the WebSocket URL
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/notifications?noti-token=${accessToken}`;
    
    console.log("Connecting to notification WebSocket...");
    
    // Close existing connection if any
    if (websocketRef.current && websocketRef.current.readyState !== WebSocket.CLOSED) {
      websocketRef.current.close();
    }
    
    // Create new WebSocket connection
    websocketRef.current = new WebSocket(wsUrl);
    
    websocketRef.current.onopen = () => {
      console.log("Notification WebSocket connection established");
    };
    
    websocketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);
        
        if (data.type === 'NEW_NOTIFICATION') {
          // Play notification sound (optional)
          const audio = new Audio('/notification-sound.mp3');
          audio.play().catch(e => console.log('Sound play error:', e));
          
          // Add new notification to the list
          setNotifications(prev => [data.notification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show browser notification if supported
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(data.notification.title, {
              body: data.notification.message
            });
          }
        } else if (data.type === 'NOTIFICATION_READ') {
          // Update the read status of the notification
          setNotifications(prev => 
            prev.map(notification => 
              notification.notificationId === data.notificationId 
                ? { ...notification, read: true } 
                : notification
            )
          );
          
          // Update unread count if needed
          setUnreadCount(prev => {
            const notification = notifications.find(n => n.notificationId === data.notificationId);
            if (notification && !notification.read) {
              return Math.max(0, prev - 1);
            }
            return prev;
          });
        } else if (data.type === 'UNREAD_NOTIFICATIONS') {
          // Initialize with unread notifications
          setNotifications(data.notifications);
          setUnreadCount(data.notifications.length);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };
    
    websocketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    websocketRef.current.onclose = (event) => {
      console.log("WebSocket connection closed with code:", event.code);
      // Try to reconnect after 5 seconds if not closed intentionally
      if (event.code !== 1000) {
        console.log("Attempting to reconnect in 5 seconds...");
        setTimeout(connectWebSocket, 5000);
      }
    };
  };

  // Handle marking a notification as read
  const handleMarkAsRead = async (notificationId: string, link?: string) => {
    try {
      await apiService.put(`/notifications/${notificationId}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      // Update UI immediately
      setNotifications(prev => 
        prev.map(notification => 
          notification.notificationId === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Decrease unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Navigate to the link if provided
      if (link.startsWith("/topics/") && link.includes("/lessons-and-quizzes")) {
        const match = link.match(/^\/topics\/([^/]+)\/lessons-and-quizzes$/);
        const topicId = match ? match[1] : null;

        if (topicId) {
          sessionStorage.setItem("notificationTopicId", topicId);

          if (pathname === "/skill-list") {
            // Force a full reload (like pressing F5)
            window.location.href = "/skill-list";
          } else {
            router.push("/skill-list");
          }
        } else {
          router.push(link); // fallback
        }
      } else {
        router.push(link);
      }


      
      // Close notification dropdown
      setNotificationAnchorEl(null);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Handle marking all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await apiService.put('/notifications/read-all', {}, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      // Update UI immediately
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

    // Add these functions to control the dialog
  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  // Modify the existing handleDeleteAllNotifications function
  const handleDeleteAllNotifications = async () => {
    try {
      await apiService.delete('/notifications/delete-all', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      // Update UI immediately
      setNotifications([]);
      setUnreadCount(0);
      // Close the dialog after deletion
      closeDeleteDialog();
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  };

  // Handle retaking a quiz
  const handleRetakeQuiz = async (notificationId: string, link: string) => {
    // Mark as read first
    try {
      await apiService.put(`/notifications/${notificationId}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      // Update UI immediately
      setNotifications(prev => 
        prev.map(notification => 
          notification.notificationId === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Decrease unread count if needed
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.notificationId === notificationId);
        if (notification && !notification.read) {
          return Math.max(0, prev - 1);
        }
        return prev;
      });
      
      // Navigate to retake the quiz
      if (link) {
        router.push(link);
      }
      
      // Close notification dropdown
      setNotificationAnchorEl(null);
    } catch (error) {
      console.error("Error handling quiz retake:", error);
    }
  };

  // Handle clicking the notification bell
  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  // Handle closing the notification dropdown
  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  useEffect(() => {
    if (searchText.trim() === "") {
      setOptions([]);
      return;
    }

    const fetchLessons = async () => {
      setLoading(true);
      try {
        const response = await apiService.get(`/lessons?search=${searchText}`);
        setOptions(response.data.data.lessons || []);
      } catch (error) {
        console.error("Error fetching lessons:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(fetchLessons, 500); // Thực hiện debounce
    return () => clearTimeout(debounceFetch); // Hủy bỏ timeout khi người dùng nhập tiếp
  }, [searchText]);
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

  // Check if notification popover is open
  const notificationOpen = Boolean(notificationAnchorEl);
  const notificationId = notificationOpen ? 'notification-popover' : undefined;

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
            <Autocomplete
              size="small"
              freeSolo
              options={options}
              getOptionLabel={(option: any) => option.lessonName || ""}
              renderOption={(props, option: any) => (
                <li {...props}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <span>{option.lessonName}</span>
                    <span style={{ fontSize: "0.8rem", color: "#aaa" }}>
                      Views: {option.viewCount}
                    </span>
                  </div>
                </li>
              )}
              loading={loading}
              onInputChange={(event, value) => setSearchText(value)}
              onChange={(event, value) => {
                if (value && value.lessonId) {
                  router.push(`/skill-detail/${value.lessonId}`);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Tìm kiếm..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <SearchIcon
                        fontSize="small"
                        sx={{ fill: "#99BC4D", marginRight: 1 }}
                      />
                    ),
                    endAdornment: (
                      <>
                        {loading ? <></> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  sx={{
                    width: "30vw",
                    marginLeft: 6,
                    backgroundColor: "white",
                  }}
                />
              )}
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
              {accessToken && userInfo ? (
                <>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {/* Notification Bell */}
                    <IconButton 
                      onClick={handleNotificationClick}
                      size="large"
                      aria-describedby={notificationId}
                    >
                      <Badge badgeContent={unreadCount} color="error">
                        <NotificationsIcon sx={{ color: "#99BC4D" }} />
                      </Badge>
                    </IconButton>
                    
                    {/* Notification Popover */}
                    <Popover
                        id={notificationId}
                        open={notificationOpen}
                        anchorEl={notificationAnchorEl}
                        onClose={handleNotificationClose}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                        disableScrollLock={true} // Add this to prevent body scroll locking
                        sx={{
                          '& .MuiPopover-paper': {
                            overflow: 'hidden' // Add this to prevent Popover paper's default scrollbar
                          }
                        }}
                      >
                      <Box sx={{ width: 350 }}>
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: '#f5f5f5', 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <Typography sx={{ fontWeight: 'bold' }}>
                            Thông báo
                          </Typography>
                          <Box sx={{ display: 'flex' }}>
                            <Tooltip title="Đánh dấu tất cả đã đọc">
                              <IconButton 
                                size="small" 
                                onClick={handleMarkAllAsRead}
                                sx={{ 
                                  '&:hover': { 
                                    bgcolor: 'rgba(153, 188, 77, 0.1)' 
                                  },
                                  mr: 1
                                }}
                              >
                                <DoneAllIcon fontSize="small" sx={{ color: '#99BC4D' }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa tất cả thông báo">
                              <IconButton 
                                size="small" 
                                onClick={openDeleteDialog}
                                sx={{ 
                                  '&:hover': { 
                                    bgcolor: 'rgba(220, 0, 0, 0.1)' 
                                  } 
                                }}
                              >
                                <DeleteSweepIcon fontSize="small" sx={{ color: '#ff5252' }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        {/* Confirmation Dialog for Delete All */}
                        <Dialog
                          open={deleteDialogOpen}
                          onClose={closeDeleteDialog}
                          aria-labelledby="alert-dialog-title"
                          aria-describedby="alert-dialog-description"
                        >
                          <DialogTitle id="alert-dialog-title">
                            {"Xác nhận xóa"}
                          </DialogTitle>
                          <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                              Bạn có muốn xóa tất cả thông báo?
                            </DialogContentText>
                          </DialogContent>
                          <DialogActions>
                            <Button onClick={closeDeleteDialog} color="primary" variant="outlined">
                              Hủy
                            </Button>
                            <Button onClick={handleDeleteAllNotifications} color="error" variant="contained" autoFocus>
                              Xóa tất cả
                            </Button>
                          </DialogActions>
                        </Dialog>
                        <Divider />
                        {notifications.length === 0 ? (
                          <Typography sx={{ p: 2, textAlign: 'center', color: 'gray' }}>
                            Không có thông báo nào
                          </Typography>
                        ) : (
                          <List 
                            sx={{ 
                              maxHeight: 400, 
                              overflow: 'auto', 
                              padding: 0,
                              paddingBottom: 0, // Add bottom padding to prevent cutting off
                              // Add custom scrollbar styling
                              '&::-webkit-scrollbar': {
                                width: '6px' // Slightly wider scrollbar for better visibility
                              },
                              '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(153, 188, 77, 0.5)', // Slightly more visible
                                borderRadius: '4px'
                              },
                              '&::-webkit-scrollbar-track': {
                                backgroundColor: 'rgba(0, 0, 0, 0.05)', // Light track background
                                marginTop: 1,
                                marginBottom: 1
                              }
                            }}
                          >
                            {notifications.map((notification) => (
                              <React.Fragment key={notification.notificationId}>
                                <ListItem 
                                  component="div"
                                  onClick={() => handleMarkAsRead(notification.notificationId, notification.link)}
                                  sx={{ 
                                    bgcolor: notification.read ? 'white' : '#f0f8ff',
                                    '&:hover': { bgcolor: '#e8f4f8' },
                                    cursor: 'pointer',
                                    display: 'block',
                                    padding: '8px 16px'
                                  }}
                                >
                                  <ListItemText 
                                    primary={
                                      <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                                        {notification.title}
                                      </Typography>
                                    }
                                    secondary={
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        component="span"
                                      >
                                        {notification.message}
                                      </Typography>
                                    }
                                  />
                                  <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mt: 1
                                  }}>
                                    <Typography variant="caption" color="text.secondary">
                                      {notification.createdAt 
                                        ? new Date(notification.createdAt).toLocaleString('vi-VN', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })
                                        : 'Vừa xong'}
                                    </Typography>
                                    
                                    <Typography 
                                      variant="caption" 
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevent the parent click event
                                        handleRetakeQuiz(notification.notificationId, notification.link);
                                      }}
                                      sx={{ 
                                        color: '#99BC4D',
                                        cursor: 'pointer',
                                        '&:hover': {
                                          textDecoration: 'underline'
                                        }
                                      }}
                                    >
                                      Làm lại
                                    </Typography>
                                  </Box>
                                  <Tooltip title="Bấm vào đây để thực hiện lại bài quiz" placement="left">
                                    <span></span>
                                  </Tooltip>
                                </ListItem>
                                <Divider />
                              </React.Fragment>
                            ))}
                          </List>
                        )}
                      </Box>
                    </Popover>
                    
                    <Avatar
                      sx={{
                        border: "2px solid #BB9066",
                        color: "white",
                        bgcolor: "#99BC4D",
                        fontWeight: 600,
                      }}
                    >
                      {userInfo.username[0].toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography fontSize="16px" fontWeight={600} color="#555">
                        {userInfo.username}
                      </Typography>
                      <Typography variant="body1" color="#A8A8A8">
                        {userInfo.grade}
                      </Typography>
                    </Box>
                    <IconButton onClick={handleUserMenu}>
                      {anchorEl ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleUserMenuClose}
                    >
                      <MenuItem
                        onClick={() => router.push("/account/user-info")}
                        sx={{ gap: 1 }}
                      >
                        <AccountCircleIcon sx={{ color: "#99BC4D" }} /> Thông
                        tin cá nhân
                      </MenuItem>
                      <MenuItem
                        onClick={() => router.push("/account/homework-history")}
                        sx={{ gap: 1 }}
                      >
                        <AnalyticsIcon sx={{ color: "blue" }} /> Lịch sử làm bài
                      </MenuItem>
                      {role === "PARENT" && (
                        <MenuItem
                          onClick={() =>
                            router.push("/account/register-student")
                          }
                          sx={{ gap: 1 }}
                        >
                          <PersonAddIcon sx={{ color: "orange" }} /> Tạo tài
                          khoản cho con
                        </MenuItem>
                      )}
                      <MenuItem
                        onClick={() => router.push("/account/change-password")}
                        sx={{ gap: 1 }}
                      >
                        <LockIcon sx={{ color: "#555" }} /> Đổi mật khẩu
                      </MenuItem>
                      <MenuItem onClick={logoutUser} sx={{ gap: 1 }}>
                        <LogoutIcon sx={{ color: "grey" }} />
                        Đăng xuất
                      </MenuItem>
                    </Menu>
                  </Box>
                </>
              ) : (
                <>
                  {pathname === "/login" ? (
                    <Button
                      variant="contained"
                      onClick={() => handleNavigation("/sign-up")}
                    >
                      Đăng ký
                    </Button>
                  ) : pathname === "/sign-up" ? (
                    <Button
                      variant="outlined"
                      onClick={() => handleNavigation("/login")}
                    >
                      Đăng nhập
                    </Button>
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
                        onClick={() => handleNavigation("/sign-up")}
                        sx={{ ml: 1 }}
                      >
                        Đăng ký
                      </Button>
                    </>
                  )}
                </>
              )}
            </Box>
          </Box>
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
            onClick={() => handleNavigation("/home")}
          >
            Trang chủ
          </Button>
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
            onClick={() => handleNavigation("/dashboard-report")}
          >
            Đánh giá
          </Button>
          <Button
            fullWidth
            variant="text"
            sx={{ textTransform: "none", color: "white" }}
            onClick={() => handleNavigation("/document")}
          >
            Tài liệu miễn phí
          </Button>

          <Button
            fullWidth
            variant="text"
            sx={{ textTransform: "none", color: "white" }}
            onClick={() => handleNavigation("/about-us")}
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
            onClick={() => handleNavigation("/battle-home")}
          >
            Đấu trường
          </Button>
        </Box>
      </AppBar>
    </>
  );
};

export default SideNav;