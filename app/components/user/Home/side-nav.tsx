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
import SportsIcon from "@mui/icons-material/Sports";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

interface Notification {
  notificationId: string;
  title: string;
  message: string;
  link: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status?: number;
}

interface LessonData {
  lessonId: string;
  lessonName: string;
  viewCount: number;
}

interface LessonsResponse {
  lessons: LessonData[];
}

interface BattleResponse {
  battleId: string;
}

interface NotificationResponse {
  data: Notification[];
}

interface Grade {
  gradeId: string;
  gradeName: string;
}

interface GradesResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  grades: Grade[];
}

const SideNav: React.FC = () => {
  // const accessToken = localStorage.getItem("accessToken");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { logoutUser, userInfo } = useAuth();
  const pathname = usePathname();
  const role = userInfo?.role;
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] =
    useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const websocketRef = useRef<WebSocket | null>(null);
  const [websocketConnected, setWebsocketConnected] = useState<boolean>(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const [dropdownEl, setDropdownEl] = useState<null | HTMLElement>(null);
  const [grades, setGrades] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isHovered, setIsHovered] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [options, setOptions] = useState<LessonData[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [battleAcceptedDialog, setBattleAcceptedDialog] = useState<{
    open: boolean;
    battleId: string | null;
  }>({ open: false, battleId: null });
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      setAccessToken(token);
    }
  }, []);
  // useEffect(() => {
  //   if (accessToken && userInfo) {
  //     connectWebSocket();
  //     fetchNotifications();
  //     return () => {
  //       if (websocketRef.current) {
  //         websocketRef.current.close();
  //       }
  //     };
  //   }
  // }, [accessToken, userInfo]);

  const cleanupWebSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
  };

  const connectWebSocket = () => {
    if (!accessToken) return;

    // Dọn dẹp kết nối cũ và timeout trước khi tạo kết nối mới
    cleanupWebSocket();

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/notifications?noti-token=${accessToken}`;
    console.log("Connecting to notification WebSocket:", wsUrl);

    websocketRef.current = new WebSocket(wsUrl);
    const maxAttempts = 3;

    websocketRef.current.onopen = () => {
      console.log("Notification WebSocket connection established");
      reconnectAttemptsRef.current = 0; // Reset số lần thử
      websocketRef.current?.send(JSON.stringify({ type: "GET_NOTIFICATIONS" }));
      // Gọi fetchNotifications sau 3 giây nếu không nhận được thông báo
      setTimeout(() => {
        if (notifications.length === 0) {
          console.log(
            "WebSocket did not return notifications, falling back to HTTP"
          );
          fetchNotifications();
        }
      }, 3000);
    };

    websocketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);

        if (data.type === "NEW_NOTIFICATION") {
          const audio = new Audio("/notification-sound.mp3");
          audio.play().catch((e) => console.log("Sound play error:", e));
          setNotifications((prev) => [data.notification, ...prev]);
          setUnreadCount((prev) => prev + 1);

          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification(data.notification.title, {
              body: data.notification.message,
            });
          }
        } else if (data.type === "BATTLE_INVITATION_ACCEPTED") {
          console.log(
            "Battle invitation accepted, showing dialog and redirecting to battle:",
            data.battleId
          );
          setBattleAcceptedDialog({ open: true, battleId: data.battleId });
          setTimeout(() => {
            setBattleAcceptedDialog({ open: false, battleId: null });
            router.push(`/battle-detail/${data.battleId}`);
          }, 2000);
        } else if (data.type === "NOTIFICATION_READ") {
          setNotifications((prev) =>
            prev.map((notification) =>
              notification.notificationId === data.notificationId
                ? { ...notification, read: true }
                : notification
            )
          );
          setUnreadCount((prev) => {
            const notification = notifications.find(
              (n) => n.notificationId === data.notificationId
            );
            if (notification && !notification.read) {
              return Math.max(0, prev - 1);
            }
            return prev;
          });
        } else if (data.type === "ALL_NOTIFICATIONS") {
          setNotifications(data.notifications || []);
          const unread = (data.notifications || []).filter(
            (notification: Notification) => !notification.read
          ).length;
          setUnreadCount(unread);
        } else if (data.type === "UNREAD_NOTIFICATIONS") {
          setNotifications((prev) => {
            const existingIds = new Set(prev.map((n) => n.notificationId));
            const newNotifications = data.notifications.filter(
              (n: Notification) => !existingIds.has(n.notificationId)
            );
            return [...newNotifications, ...prev];
          });
          setUnreadCount(data.notifications.length);
        } else if (data.type === "ALL_NOTIFICATIONS_DELETED") {
          setNotifications([]);
          setUnreadCount(0);
        } else if (data.type === "UNREAD_COUNT") {
          setUnreadCount(data.data.count || 0);
        } else if (data.type === "ERROR") {
          console.error("WebSocket error message:", data.message);
          fetchNotifications();
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
        fetchNotifications();
      }
    };

    websocketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      fetchNotifications();
    };

    websocketRef.current.onclose = (event) => {
      console.log("WebSocket connection closed with code:", event.code);
      if (event.code !== 1000 && reconnectAttemptsRef.current < maxAttempts) {
        const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(
          `Attempting to reconnect in ${delay / 1000} seconds (${reconnectAttemptsRef.current + 1}/${maxAttempts})...`
        );
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connectWebSocket();
        }, delay);
      } else if (reconnectAttemptsRef.current >= maxAttempts) {
        console.error("Max reconnect attempts reached. Please check server.");
        setError("Không thể kết nối thông báo. Vui lòng thử lại sau.");
      }
      fetchNotifications();
    };
  };
  useEffect(() => {
    if (accessToken && userInfo) {
      connectWebSocket();
      fetchNotifications();
      const pollInterval = setInterval(() => {
        if (!websocketConnected) {
          fetchNotifications();
        }
      }, 10000); // Gọi mỗi 10 giây nếu WebSocket không hoạt động
      return () => {
        clearInterval(pollInterval);
        if (websocketRef.current) {
          websocketRef.current.close();
        }
      };
    }
  }, [accessToken, userInfo, websocketConnected]);

  const fetchNotifications = async () => {
    try {
      const response = await apiService.get<ApiResponse<Notification[]>>(
        "/notifications",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("HTTP Notification response:", response);
      if (Array.isArray(response.data?.data)) {
        setNotifications(response.data.data);
        const unread = response.data.data.filter(
          (notification: Notification) => !notification.read
        ).length;
        setUnreadCount(unread);
      } else {
        console.error(
          "Unexpected notification response format:",
          response.data
        );
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error fetching notifications via HTTP:", error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // const connectWebSocket = () => {
  //   if (!accessToken) return;

  //   const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  //   const wsUrl = `${wsProtocol}//${window.location.host}/ws/notifications?noti-token=${accessToken}`;

  //   console.log("Connecting to notification WebSocket:", wsUrl);

  //   if (
  //     websocketRef.current &&
  //     websocketRef.current.readyState !== WebSocket.CLOSED
  //   ) {
  //     websocketRef.current.close();
  //   }

  //   websocketRef.current = new WebSocket(wsUrl);

  //   websocketRef.current.onopen = () => {
  //     console.log("Notification WebSocket connection established");
  //     setWebsocketConnected(true);
  //     websocketRef.current?.send(
  //       JSON.stringify({
  //         type: "GET_NOTIFICATIONS",
  //       })
  //     );
  //     setTimeout(() => {
  //       if (notifications.length === 0) {
  //         console.log(
  //           "WebSocket did not return notifications, falling back to HTTP"
  //         );
  //         fetchNotifications();
  //       }
  //     }, 3000);
  //   };

  //   websocketRef.current.onmessage = (event) => {
  //     try {
  //       const data = JSON.parse(event.data);
  //       console.log("WebSocket message received:", data);

  //       if (data.type === "NEW_NOTIFICATION") {
  //         const audio = new Audio("/notification-sound.mp3");
  //         audio.play().catch((e) => console.log("Sound play error:", e));
  //         setNotifications((prev) => [data.notification, ...prev]);
  //         setUnreadCount((prev) => prev + 1);

  //         if (
  //           "Notification" in window &&
  //           Notification.permission === "granted"
  //         ) {
  //           new Notification(data.notification.title, {
  //             body: data.notification.message,
  //           });
  //         }
  //       } else if (data.type === "NOTIFICATION_READ") {
  //         setNotifications((prev) =>
  //           prev.map((notification) =>
  //             notification.notificationId === data.notificationId
  //               ? { ...notification, read: true }
  //               : notification
  //           )
  //         );
  //         setUnreadCount((prev) => {
  //           const notification = notifications.find(
  //             (n) => n.notificationId === data.notificationId
  //           );
  //           if (notification && !notification.read) {
  //             return Math.max(0, prev - 1);
  //           }
  //           return prev;
  //         });
  //       } else if (data.type === "ALL_NOTIFICATIONS") {
  //         setNotifications(data.notifications || []);
  //         const unread = (data.notifications || []).filter(
  //           (notification: Notification) => !notification.read
  //         ).length;
  //         setUnreadCount(unread);
  //       } else if (data.type === "UNREAD_NOTIFICATIONS") {
  //         setNotifications((prev) => {
  //           const existingIds = new Set(prev.map((n) => n.notificationId));
  //           const newNotifications = data.notifications.filter(
  //             (n: Notification) => !existingIds.has(n.notificationId)
  //           );
  //           return [...newNotifications, ...prev];
  //         });
  //         setUnreadCount(data.notifications.length);
  //       } else if (data.type === "ALL_NOTIFICATIONS_DELETED") {
  //         setNotifications([]);
  //         setUnreadCount(0);
  //       } else if (data.type === "UNREAD_COUNT") {
  //         setUnreadCount(data.data.count || 0);
  //       } else if (data.type === "BATTLE_INVITATION_ACCEPTED") {
  //         console.log(
  //           "Battle invitation accepted, showing dialog and redirecting to battle:",
  //           data.battleId
  //         );
  //         setBattleAcceptedDialog({ open: true, battleId: data.battleId });
  //         setTimeout(() => {
  //           setBattleAcceptedDialog({ open: false, battleId: null });
  //           router.push(`/battle-detail/${data.battleId}`);
  //         }, 2000);
  //       } else if (data.type === "ERROR") {
  //         console.error("WebSocket error message:", data.message);
  //         fetchNotifications();
  //       }
  //     } catch (error) {
  //       console.error("Error processing WebSocket message:", error);
  //       fetchNotifications();
  //     }
  //   };

  //   websocketRef.current.onerror = (error) => {
  //     console.error("WebSocket error:", error);
  //     setWebsocketConnected(false);
  //     fetchNotifications();
  //   };

  //   websocketRef.current.onclose = (event) => {
  //     console.log("WebSocket connection closed with code:", event.code);
  //     setWebsocketConnected(false);
  //     if (event.code !== 1000) {
  //       console.log("Attempting to reconnect in 5 seconds...");
  //       setTimeout(connectWebSocket, 5000);
  //     }
  //     fetchNotifications();
  //   };
  // };
  // const connectWebSocket = () => {
  //   if (!accessToken) return;
  //   const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  //   const wsUrl = `${wsProtocol}//${window.location.host}/ws/notifications?noti-token=${accessToken}`;
  //   console.log("Connecting to notification WebSocket:", wsUrl);

  //   if (
  //     websocketRef.current &&
  //     websocketRef.current.readyState !== WebSocket.CLOSED
  //   ) {
  //     websocketRef.current.close();
  //   }

  //   websocketRef.current = new WebSocket(wsUrl);
  //   let reconnectAttempts = 0;
  //   const maxAttempts = 3;

  //   websocketRef.current.onopen = () => {
  //     console.log("Notification WebSocket connection established");
  //     setWebsocketConnected(true);
  //     websocketRef.current?.send(JSON.stringify({ type: "GET_NOTIFICATIONS" }));
  //     reconnectAttempts = 0; // Reset attempts on success
  //   };

  //   websocketRef.current.onmessage = (event) => {
  //     try {
  //       const data = JSON.parse(event.data);
  //       console.log("WebSocket message received:", data);

  //       if (data.type === "NEW_NOTIFICATION") {
  //         const audio = new Audio("/notification-sound.mp3");
  //         audio.play().catch((e) => console.log("Sound play error:", e));
  //         setNotifications((prev) => [data.notification, ...prev]);
  //         setUnreadCount((prev) => prev + 1);

  //         if (
  //           "Notification" in window &&
  //           Notification.permission === "granted"
  //         ) {
  //           new Notification(data.notification.title, {
  //             body: data.notification.message,
  //           });
  //         }
  //       } else if (data.type === "BATTLE_INVITATION_ACCEPTED") {
  //         console.log(
  //           "Battle invitation accepted, showing dialog and redirecting to battle:",
  //           data.battleId
  //         );
  //         setBattleAcceptedDialog({ open: true, battleId: data.battleId });
  //         setTimeout(() => {
  //           setBattleAcceptedDialog({ open: false, battleId: null });
  //           router.push(`/battle-detail/${data.battleId}`);
  //         }, 2000);
  //       } else if (data.type === "NOTIFICATION_READ") {
  //         setNotifications((prev) =>
  //           prev.map((notification) =>
  //             notification.notificationId === data.notificationId
  //               ? { ...notification, read: true }
  //               : notification
  //           )
  //         );
  //         setUnreadCount((prev) => {
  //           const notification = notifications.find(
  //             (n) => n.notificationId === data.notificationId
  //           );
  //           if (notification && !notification.read) {
  //             return Math.max(0, prev - 1);
  //           }
  //           return prev;
  //         });
  //       } else if (data.type === "ALL_NOTIFICATIONS") {
  //         setNotifications(data.notifications || []);
  //         const unread = (data.notifications || []).filter(
  //           (notification: Notification) => !notification.read
  //         ).length;
  //         setUnreadCount(unread);
  //       } else if (data.type === "UNREAD_NOTIFICATIONS") {
  //         setNotifications((prev) => {
  //           const existingIds = new Set(prev.map((n) => n.notificationId));
  //           const newNotifications = data.notifications.filter(
  //             (n: Notification) => !existingIds.has(n.notificationId)
  //           );
  //           return [...newNotifications, ...prev];
  //         });
  //         setUnreadCount(data.notifications.length);
  //       } else if (data.type === "ALL_NOTIFICATIONS_DELETED") {
  //         setNotifications([]);
  //         setUnreadCount(0);
  //       } else if (data.type === "UNREAD_COUNT") {
  //         setUnreadCount(data.data.count || 0);
  //       } else if (data.type === "ERROR") {
  //         console.error("WebSocket error message:", data.message);
  //         fetchNotifications();
  //       }
  //     } catch (error) {
  //       console.error("Error processing WebSocket message:", error);
  //       fetchNotifications();
  //     }
  //   };

  //   websocketRef.current.onclose = (event) => {
  //     console.log("WebSocket connection closed with code:", event.code);
  //     setWebsocketConnected(false);
  //     if (event.code !== 1000 && reconnectAttempts < maxAttempts) {
  //       console.log(
  //         `Attempting to reconnect in 5 seconds (${reconnectAttempts + 1}/${maxAttempts})...`
  //       );
  //       setTimeout(connectWebSocket, 5000);
  //       reconnectAttempts++;
  //     } else if (reconnectAttempts >= maxAttempts) {
  //       console.error("Max reconnect attempts reached. Please check server.");
  //       setError("Không thể kết nối thông báo. Vui lòng thử lại sau.");
  //     }
  //     fetchNotifications();
  //   };
  // };

  const handleMarkAsRead = async (notificationId: string, link?: string) => {
    try {
      await apiService.put(
        `/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.notificationId === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Safe link handling
      if (link) {
        if (
          link.startsWith("/topics/") &&
          link.includes("/lessons-and-quizzes")
        ) {
          const match = link.match(/^\/topics\/([^/]+)\/lessons-and-quizzes$/);
          const topicId = match ? match[1] : null;

          if (topicId) {
            sessionStorage.setItem("notificationTopicId", topicId);

            if (pathname === "/skill-list") {
              window.location.href = "/skill-list";
            } else {
              router.push("/skill-list");
            }
          } else {
            router.push(link);
          }
        } else {
          router.push(link);
        }
      }

      setNotificationAnchorEl(null);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.put(
        "/notifications/read-all",
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteAllNotifications = async () => {
    try {
      await apiService.delete("/notifications/delete-all", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setNotifications([]);
      setUnreadCount(0);
      closeDeleteDialog();
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  };

  const handleRetakeQuiz = async (notificationId: string, link: string) => {
    try {
      await apiService.put(
        `/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.notificationId === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      setUnreadCount((prev) => {
        const notification = notifications.find(
          (n) => n.notificationId === notificationId
        );
        if (notification && !notification.read) {
          return Math.max(0, prev - 1);
        }
        return prev;
      });

      if (link) {
        router.push(link);
      }

      setNotificationAnchorEl(null);
    } catch (error) {
      console.error("Error handling quiz retake:", error);
    }
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

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
        const response = await apiService.get<ApiResponse<LessonsResponse>>(
          `/lessons?search=${searchText}`
        );
        // Fix 2: Add proper null checking and type assertion
        if (response.data && response.data.data && response.data.data.lessons) {
          setOptions(response.data.data.lessons);
        } else {
          setOptions([]);
        }
      } catch (error) {
        console.error("Error fetching lessons:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(fetchLessons, 500);
    return () => clearTimeout(debounceFetch);
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
        const response =
          await apiService.get<ApiResponse<GradesResponse>>("/grades");
        if (response.data && response.data.data && response.data.data.grades) {
          const gradeNames = response.data.data.grades.map(
            (grade: Grade) => grade.gradeName
          );
          setGrades(gradeNames);
        } else {
          setGrades([]);
        }
        setError("");
      } catch (error) {
        setError("Failed to load grades.");
        setGrades([]);
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

  const notificationOpen = Boolean(notificationAnchorEl);
  const notificationId = notificationOpen ? "notification-popover" : undefined;
  const handleBattleInvitationAction = async (
    notificationId: string,
    invitationId: string | undefined,
    action: "accept" | "decline"
  ) => {
    // Fix: Add proper validation for invitationId
    if (!invitationId) {
      console.error("Invalid invitation ID");
      return;
    }

    try {
      await apiService.put(
        `/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const response = await apiService.post<ApiResponse<BattleResponse>>(
        `/battle-invitations/${invitationId}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.notificationId === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));

      if (action === "accept" && response.data?.data?.battleId) {
        router.push(`/battle-detail/${response.data.data.battleId}`);
      }

      setNotificationAnchorEl(null);

      console.log(`Battle invitation ${action}ed successfully`);
    } catch (error) {
      console.error(`Error ${action}ing battle invitation:`, error);
    }
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

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              gap: 2,
            }}
          >
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
                    <IconButton
                      onClick={handleNotificationClick}
                      size="large"
                      aria-describedby={notificationId}
                    >
                      <Badge badgeContent={unreadCount} color="error">
                        <NotificationsIcon sx={{ color: "#99BC4D" }} />
                      </Badge>
                    </IconButton>

                    <Popover
                      id={notificationId}
                      open={notificationOpen}
                      anchorEl={notificationAnchorEl}
                      onClose={handleNotificationClose}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      disableScrollLock={true}
                      sx={{
                        "& .MuiPopover-paper": {
                          overflow: "hidden",
                        },
                      }}
                    >
                      <Box sx={{ width: 350 }}>
                        <Box
                          sx={{
                            p: 2,
                            bgcolor: "#f5f5f5",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography sx={{ fontWeight: "bold" }}>
                            Thông báo
                          </Typography>
                          <Box sx={{ display: "flex" }}>
                            <Tooltip title="Đánh dấu tất cả đã đọc">
                              <IconButton
                                size="small"
                                onClick={handleMarkAllAsRead}
                                sx={{
                                  "&:hover": {
                                    bgcolor: "rgba(153, 188, 77, 0.1)",
                                  },
                                  mr: 1,
                                }}
                              >
                                <DoneAllIcon
                                  fontSize="small"
                                  sx={{ color: "#99BC4D" }}
                                />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa tất cả thông báo">
                              <IconButton
                                size="small"
                                onClick={openDeleteDialog}
                                sx={{
                                  "&:hover": {
                                    bgcolor: "rgba(220, 0, 0, 0.1)",
                                  },
                                }}
                              >
                                <DeleteSweepIcon
                                  fontSize="small"
                                  sx={{ color: "#ff5252" }}
                                />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
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
                            <Button
                              onClick={closeDeleteDialog}
                              color="primary"
                              variant="outlined"
                            >
                              Hủy
                            </Button>
                            <Button
                              onClick={handleDeleteAllNotifications}
                              color="error"
                              variant="contained"
                              autoFocus
                            >
                              Xóa tất cả
                            </Button>
                          </DialogActions>
                        </Dialog>
                        <Divider />
                        {notifications.length === 0 ? (
                          <Typography
                            sx={{ p: 2, textAlign: "center", color: "gray" }}
                          >
                            Không có thông báo nào
                          </Typography>
                        ) : (
                          <List
                            sx={{
                              maxHeight: 400,
                              overflow: "auto",
                              padding: 0,
                              paddingBottom: 0,
                              "&::-webkit-scrollbar": {
                                width: "6px",
                              },
                              "&::-webkit-scrollbar-thumb": {
                                backgroundColor: "rgba(153, 188, 77, 0.5)",
                                borderRadius: "4px",
                              },
                              "&::-webkit-scrollbar-track": {
                                backgroundColor: "rgba(0, 0, 0, 0.05)",
                                marginTop: 1,
                                marginBottom: 1,
                              },
                            }}
                          >
                            {/* {notifications.map((notification) => (
                              <React.Fragment key={notification.notificationId}>
                                <ListItem
                                  component="div"
                                  sx={{
                                    bgcolor: notification.read
                                      ? "white"
                                      : "#f0f8ff",
                                    "&:hover": { bgcolor: "#e8f4f8" },
                                    cursor: "pointer",
                                    display: "block",
                                    padding: "8px 16px",
                                  }}
                                >
                                  <ListItemText
                                    primary={
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                        }}
                                      >
                                        {notification.type ===
                                          "BATTLE_INVITATION" && (
                                          <SportsIcon
                                            sx={{
                                              color: "#ff9800",
                                              fontSize: 18,
                                            }}
                                          />
                                        )}
                                        <Typography
                                          variant="subtitle2"
                                          sx={{
                                            fontWeight: notification.read
                                              ? "normal"
                                              : "bold",
                                          }}
                                        >
                                          {notification.title}
                                        </Typography>
                                      </Box>
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
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      mt: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {notification.createdAt
                                        ? new Date(
                                            notification.createdAt
                                          ).toLocaleString("vi-VN", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })
                                        : "Vừa xong"}
                                    </Typography>
                                    {notification.type ===
                                      "BATTLE_INVITATION" &&
                                    !notification.read ? (
                                      <Box sx={{ display: "flex", gap: 1 }}>
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const invitationId =
                                              notification.link
                                                .split("/")
                                                .pop();
                                            handleBattleInvitationAction(
                                              notification.notificationId,
                                              invitationId,
                                              "accept"
                                            );
                                          }}
                                          sx={{
                                            color: "#4caf50",
                                            "&:hover": {
                                              bgcolor: "rgba(76, 175, 80, 0.1)",
                                            },
                                          }}
                                        >
                                          <CheckCircleIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const invitationId =
                                              notification.link
                                                .split("/")
                                                .pop();
                                            handleBattleInvitationAction(
                                              notification.notificationId,
                                              invitationId,
                                              "decline"
                                            );
                                          }}
                                          sx={{
                                            color: "#f44336",
                                            "&:hover": {
                                              bgcolor: "rgba(244, 67, 54, 0.1)",
                                            },
                                          }}
                                        >
                                          <CancelIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    ) : notification.type !==
                                        "BATTLE_INVITATION" &&
                                      (notification.type === "QUIZ_FAILED" ||
                                        notification.type === "QUIZ_RETAKE") ? (
                                      <Typography
                                        variant="caption"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRetakeQuiz(
                                            notification.notificationId,
                                            notification.link
                                          );
                                        }}
                                        sx={{
                                          color: "#99BC4D",
                                          cursor: "pointer",
                                          "&:hover": {
                                            textDecoration: "underline",
                                          },
                                        }}
                                      >
                                        Làm lại
                                      </Typography>
                                    ) : null}
                                  </Box>
                                  <Dialog
                                    open={battleAcceptedDialog.open}
                                    onClose={() => {}}
                                    aria-labelledby="battle-accepted-dialog-title"
                                    aria-describedby="battle-accepted-dialog-description"
                                    maxWidth="sm"
                                    fullWidth
                                  >
                                    <DialogTitle
                                      id="battle-accepted-dialog-title"
                                      sx={{
                                        textAlign: "center",
                                        color: "#4caf50",
                                      }}
                                    >
                                      🎉 Thách đấu được chấp nhận!
                                    </DialogTitle>
                                    <DialogContent
                                      sx={{ textAlign: "center", py: 3 }}
                                    >
                                      <DialogContentText
                                        id="battle-accepted-dialog-description"
                                        sx={{ fontSize: "16px" }}
                                      >
                                        Đối thủ đã chấp nhận lời thách đấu của
                                        bạn.
                                        <br />
                                        Đang chuyển đến trang battle...
                                      </DialogContentText>
                                      <Box sx={{ mt: 2 }}>
                                        <CircularProgress
                                          size={30}
                                          sx={{ color: "#4caf50" }}
                                        />
                                      </Box>
                                    </DialogContent>
                                  </Dialog>

                                  {notification.type !==
                                    "BATTLE_INVITATION" && (
                                    <Box
                                      onClick={() =>
                                        handleMarkAsRead(
                                          notification.notificationId,
                                          notification.link
                                        )
                                      }
                                      sx={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        cursor: "pointer",
                                      }}
                                    />
                                  )}
                                </ListItem>
                                <Divider />
                              </React.Fragment>
                            ))} */}
                            {/* {notifications.map((notification) => (
                              <React.Fragment key={notification.notificationId}>
                                <ListItem
                                  component="div"
                                  sx={{
                                    bgcolor: notification.read
                                      ? "white"
                                      : "#f0f8ff",
                                    "&:hover": { bgcolor: "#e8f4f8" },
                                    cursor: "pointer",
                                    display: "block",
                                    padding: "8px 16px",
                                  }}
                                >
                                  <ListItemText
                                    primary={
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                        }}
                                      >
                                        {notification.type ===
                                          "BATTLE_INVITATION" && (
                                          <SportsIcon
                                            sx={{
                                              color: "#ff9800",
                                              fontSize: 18,
                                            }}
                                          />
                                        )}
                                        {notification.type ===
                                          "BATTLE_ACCEPTED" && (
                                          <CheckCircleIcon
                                            sx={{
                                              color: "#4caf50",
                                              fontSize: 18,
                                            }}
                                          />
                                        )}
                                        <Typography
                                          variant="subtitle2"
                                          sx={{
                                            fontWeight: notification.read
                                              ? "normal"
                                              : "bold",
                                          }}
                                        >
                                          {notification.title}
                                        </Typography>
                                      </Box>
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
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      mt: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {notification.createdAt
                                        ? new Date(
                                            notification.createdAt
                                          ).toLocaleString("vi-VN", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })
                                        : "Vừa xong"}
                                    </Typography>
                                    {notification.type ===
                                      "BATTLE_INVITATION" &&
                                    !notification.read ? (
                                      <Box sx={{ display: "flex", gap: 1 }}>
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const invitationId =
                                              notification.link
                                                .split("/")
                                                .pop();
                                            handleBattleInvitationAction(
                                              notification.notificationId,
                                              invitationId,
                                              "accept"
                                            );
                                          }}
                                          sx={{
                                            color: "#4caf50",
                                            "&:hover": {
                                              bgcolor: "rgba(76, 175, 80, 0.1)",
                                            },
                                          }}
                                        >
                                          <CheckCircleIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const invitationId =
                                              notification.link
                                                .split("/")
                                                .pop();
                                            handleBattleInvitationAction(
                                              notification.notificationId,
                                              invitationId,
                                              "decline"
                                            );
                                          }}
                                          sx={{
                                            color: "#f44336",
                                            "&:hover": {
                                              bgcolor: "rgba(244, 67, 54, 0.1)",
                                            },
                                          }}
                                        >
                                          <CancelIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    ) : notification.type !==
                                        "BATTLE_INVITATION" &&
                                      (notification.type === "QUIZ_FAILED" ||
                                        notification.type === "QUIZ_RETAKE") ? (
                                      <Typography
                                        variant="caption"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRetakeQuiz(
                                            notification.notificationId,
                                            notification.link
                                          );
                                        }}
                                        sx={{
                                          color: "#99BC4D",
                                          cursor: "pointer",
                                          "&:hover": {
                                            textDecoration: "underline",
                                          },
                                        }}
                                      >
                                        Làm lại
                                      </Typography>
                                    ) : null}
                                  </Box>
                                  {notification.type !==
                                    "BATTLE_INVITATION" && (
                                    <Box
                                      onClick={() =>
                                        handleMarkAsRead(
                                          notification.notificationId,
                                          notification.link
                                        )
                                      }
                                      sx={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        cursor: "pointer",
                                      }}
                                    />
                                  )}
                                </ListItem>
                                <Divider />
                              </React.Fragment>
                            ))} */}
                            {/* {notifications.map((notification) => (
                              <React.Fragment key={notification.notificationId}>
                                <ListItem
                                  component="div"
                                  sx={{
                                    bgcolor: notification.read
                                      ? "white"
                                      : "#f0f8ff",
                                    "&:hover": { bgcolor: "#e8f4f8" },
                                    cursor: "pointer",
                                    display: "block",
                                    padding: "8px 16px",
                                  }}
                                >
                                  <ListItemText
                                    primary={
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                        }}
                                      >
                                        {notification.type ===
                                          "BATTLE_INVITATION" && (
                                          <SportsIcon
                                            sx={{
                                              color: "#ff9800",
                                              fontSize: 18,
                                            }}
                                          />
                                        )}
                                        {notification.type ===
                                          "BATTLE_ACCEPTED" && (
                                          <CheckCircleIcon
                                            sx={{
                                              color: "#4caf50",
                                              fontSize: 18,
                                            }}
                                          />
                                        )}
                                        <Typography
                                          variant="subtitle2"
                                          sx={{
                                            fontWeight: notification.read
                                              ? "normal"
                                              : "bold",
                                          }}
                                        >
                                          {notification.title}
                                        </Typography>
                                      </Box>
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
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      mt: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {notification.createdAt &&
                                      new Date(
                                        notification.createdAt
                                      ).toString() !== "Invalid Date"
                                        ? new Date(
                                            notification.createdAt
                                          ).toLocaleString("vi-VN", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit", // Thêm giây nếu muốn
                                          })
                                        : new Date().toLocaleString("vi-VN", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit", // Thêm giây nếu muốn
                                          })}
                                    </Typography>
                                    {notification.type ===
                                      "BATTLE_INVITATION" &&
                                    !notification.read ? (
                                      <Box sx={{ display: "flex", gap: 1 }}>
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const invitationId =
                                              notification.link
                                                .split("/")
                                                .pop();
                                            handleBattleInvitationAction(
                                              notification.notificationId,
                                              invitationId,
                                              "accept"
                                            );
                                          }}
                                          sx={{
                                            color: "#4caf50",
                                            "&:hover": {
                                              bgcolor: "rgba(76, 175, 80, 0.1)",
                                            },
                                          }}
                                        >
                                          <CheckCircleIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const invitationId =
                                              notification.link
                                                .split("/")
                                                .pop();
                                            handleBattleInvitationAction(
                                              notification.notificationId,
                                              invitationId,
                                              "decline"
                                            );
                                          }}
                                          sx={{
                                            color: "#f44336",
                                            "&:hover": {
                                              bgcolor: "rgba(244, 67, 54, 0.1)",
                                            },
                                          }}
                                        >
                                          <CancelIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    ) : notification.type !==
                                        "BATTLE_INVITATION" &&
                                      (notification.type === "QUIZ_FAILED" ||
                                        notification.type === "QUIZ_RETAKE") ? (
                                      <Typography
                                        variant="caption"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRetakeQuiz(
                                            notification.notificationId,
                                            notification.link
                                          );
                                        }}
                                        sx={{
                                          color: "#99BC4D",
                                          cursor: "pointer",
                                          "&:hover": {
                                            textDecoration: "underline",
                                          },
                                        }}
                                      >
                                        Làm lại
                                      </Typography>
                                    ) : null}
                                  </Box>
                                  {notification.type !==
                                    "BATTLE_INVITATION" && (
                                    <Box
                                      onClick={() =>
                                        handleMarkAsRead(
                                          notification.notificationId,
                                          notification.link
                                        )
                                      }
                                      sx={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        cursor: "pointer",
                                      }}
                                    />
                                  )}
                                </ListItem>
                                <Divider />
                              </React.Fragment>
                            ))} */}
                            {notifications.map((notification) => (
                              <React.Fragment key={notification.notificationId}>
                                <ListItem
                                  component="div"
                                  sx={{
                                    bgcolor: "white", // Luôn là màu trắng cho cả đã đọc và chưa đọc
                                    "&:hover": { bgcolor: "#e8f4f8" },
                                    cursor: "pointer",
                                    display: "block",
                                    padding: "8px 16px",
                                    position: "relative", // Để định vị chấm tròn
                                  }}
                                >
                                  <ListItemText
                                    primary={
                                      <Box
                                        sx={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                          }}
                                        >
                                          {notification.type ===
                                            "BATTLE_INVITATION" && (
                                            <SportsIcon
                                              sx={{
                                                color: "#ff9800",
                                                fontSize: 18,
                                              }}
                                            />
                                          )}
                                          {notification.type ===
                                            "BATTLE_ACCEPTED" && (
                                            <CheckCircleIcon
                                              sx={{
                                                color: "#4caf50",
                                                fontSize: 18,
                                              }}
                                            />
                                          )}
                                          <Typography
                                            variant="subtitle2"
                                            sx={{
                                              color: notification.read
                                                ? "text.secondary"
                                                : "#99BC4D",
                                              fontWeight: "bold", // Tiêu đề luôn in đậm
                                            }}
                                          >
                                            {notification.title}
                                          </Typography>
                                        </Box>
                                        {!notification.read && (
                                          <Box
                                            sx={{
                                              width: 10,
                                              height: 10,
                                              bgcolor: "#99BC4D",
                                              borderRadius: "50%",
                                              mr: 1,
                                            }}
                                          />
                                        )}
                                      </Box>
                                    }
                                    secondary={
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: notification.read
                                            ? "text.secondary"
                                            : "black",
                                          fontWeight: "normal",
                                        }}
                                        component="span"
                                      >
                                        {notification.message}
                                      </Typography>
                                    }
                                  />
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      mt: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {notification.createdAt &&
                                      new Date(
                                        notification.createdAt
                                      ).toString() !== "Invalid Date"
                                        ? new Date(
                                            notification.createdAt
                                          ).toLocaleString("vi-VN", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                          })
                                        : new Date().toLocaleString("vi-VN", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                          })}
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      {notification.type ===
                                        "BATTLE_INVITATION" &&
                                      !notification.read ? (
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const invitationId =
                                                notification.link
                                                  .split("/")
                                                  .pop();
                                              handleBattleInvitationAction(
                                                notification.notificationId,
                                                invitationId,
                                                "accept"
                                              );
                                            }}
                                            sx={{
                                              color: "#4caf50",
                                              "&:hover": {
                                                bgcolor:
                                                  "rgba(76, 175, 80, 0.1)",
                                              },
                                            }}
                                          >
                                            <CheckCircleIcon fontSize="small" />
                                          </IconButton>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const invitationId =
                                                notification.link
                                                  .split("/")
                                                  .pop();
                                              handleBattleInvitationAction(
                                                notification.notificationId,
                                                invitationId,
                                                "decline"
                                              );
                                            }}
                                            sx={{
                                              color: "#f44336",
                                              "&:hover": {
                                                bgcolor:
                                                  "rgba(244, 67, 54, 0.1)",
                                              },
                                            }}
                                          >
                                            <CancelIcon fontSize="small" />
                                          </IconButton>
                                        </Box>
                                      ) : notification.type !==
                                          "BATTLE_INVITATION" &&
                                        (notification.type === "QUIZ_FAILED" ||
                                          notification.type ===
                                            "QUIZ_RETAKE") ? (
                                        <Typography
                                          variant="caption"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRetakeQuiz(
                                              notification.notificationId,
                                              notification.link
                                            );
                                          }}
                                          sx={{
                                            color: "#99BC4D",
                                            cursor: "pointer",
                                            "&:hover": {
                                              textDecoration: "underline",
                                            },
                                          }}
                                        >
                                          Làm lại
                                        </Typography>
                                      ) : null}
                                      {/* Chấm tròn biểu thị chưa đọc */}
                                    </Box>
                                  </Box>
                                  {notification.type !==
                                    "BATTLE_INVITATION" && (
                                    <Box
                                      onClick={() =>
                                        handleMarkAsRead(
                                          notification.notificationId,
                                          notification.link
                                        )
                                      }
                                      sx={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        cursor: "pointer",
                                      }}
                                    />
                                  )}
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
          onMouseLeave={handleMouseLeave}
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
            disableScrollLock
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
          {accessToken && (
            <>
              <Button
                fullWidth
                variant="text"
                sx={{ textTransform: "none", color: "white" }}
                onClick={() => handleNavigation("/dashboard-report")}
              >
                Đánh giá
              </Button>
            </>
          )}
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
          {accessToken && (
            <Button
              fullWidth
              variant="text"
              color="primary"
              onClick={() => handleNavigation("/battle-home")}
            >
              Đấu trường
            </Button>
          )}
        </Box>
      </AppBar>
    </>
  );
};

export default SideNav;
