import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Typography, Avatar, Divider } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import { useAuth } from "@/app/hooks/AuthContext";
import apiService from "@/app/untils/api";

const Aside = () => {
  const router = useRouter();
  const {accessToken} = useAuth();
  const [userInfo, setUserInfo] = useState<any | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await apiService.get("/users/user-info", {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Thêm accessToken vào header
          },
        });
        if (response?.data?.status === 200) {
          setUserInfo(response.data.data);
        } else {
          console.error("Failed to fetch user info:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, [accessToken]);
  return (
    <Box
      sx={{
        width: 240,
        bgcolor: "white",
        padding: 2,
        boxShadow: 1,
        borderRadius: 2,
        height: "100%",
      }}
    >
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Avatar
          sx={{
            bgcolor: "#99BC4D",
            width: 64,
            height: 64,
            fontSize: 32,
            margin: "0 auto",
          }}
        >
          {userInfo.username[0]}
        </Avatar>
        <Typography variant="h6" fontWeight="bold" mt={1}>
          {userInfo.username}
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ mt: 2 }}>
        <Button
          fullWidth
          startIcon={<AccountCircleIcon />}
          onClick={() => router.push("/account/user-info")}
          sx={{
            justifyContent: "flex-start",
            textTransform: "none",
            color: "blue",
            bgcolor: "white",
            "&:hover": { bgcolor: "#FFFBF3", color: "blue" },
          }}
        >
          Thông tin cá nhân
        </Button>
        <Button
          fullWidth
          startIcon={<LockIcon />}
          onClick={() => router.push("/account/change-password")}
          sx={{
            justifyContent: "flex-start",
            textTransform: "none",
            color: "blue",
            "&:hover": { bgcolor: "#FFFBF3", color: "blue" },
          }}
        >
          Đổi mật khẩu
        </Button>
        {userInfo.role === "PARENT" && (
          <Button
            fullWidth
            startIcon={<ChildCareIcon />}
            onClick={() => router.push("/account/register-students")}
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              color: "#99BC4D",
              "&:hover": { bgcolor: "#FFFBF3", color: "#99BC4D" },
            }}
          >
            Tạo tài khoản cho con
          </Button>
        )}
        <Button
          fullWidth
          startIcon={<LogoutIcon />}
          sx={{
            justifyContent: "flex-start",
            color: "red",
            textTransform: "none",
          }}
          onClick={() => {
            // Xử lý logout
            router.push("/login");
          }}
        >
          Đăng xuất
        </Button>
      </Box>
    </Box>
  );
};

export default Aside;
