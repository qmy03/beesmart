import { Box, Typography, Link } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Sử dụng useRouter để điều hướng
import FacebookIcon from "@mui/icons-material/Facebook";
import YouTubeIcon from "@mui/icons-material/YouTube";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import EmailIcon from "@mui/icons-material/Email";
const Footer = () => {
  const router = useRouter();

  return (
    <Box
      sx={{
        backgroundColor: "#FFFBF3", 
        padding: "20px 100px",
        display: "flex",
        gap: 4,
        borderTop: "1px solid #ccc",
        width: "100%", 
        justifyContent: "center",
      }}
    >
      <Box sx={{ flex: "1", minWidth: "40%" }}>
        <Typography
          sx={{ fontWeight: "bold", marginBottom: "10px", fontSize: "16px" }}
        >
          Giới thiệu
        </Typography>
        <Link
          onClick={() => router.push("/general-regulations")}
          sx={{
            display: "block",
            color: "#555",
            cursor: "pointer",
            marginBottom: "5px",
            textDecoration: "none",
          }}
        >
          Quy định chung
        </Link>
        <Link
          onClick={() => router.push("/privacy-policy")}
          sx={{
            display: "block",
            color: "#555",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          Chính sách bảo mật
        </Link>
        <Box sx={{ marginTop: "20px" }}>
          <Typography
            sx={{ fontWeight: "bold", marginBottom: "5px", fontSize: "16px" }}
          >
            Thông tin liên hệ
          </Typography>
          <Box sx={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <PhoneInTalkIcon sx={{ color: "#99BC4D" }} fontSize="small" />
            <Box>
              <Typography sx={{ display: "flex", alignItems: "center" }}>
                Hỗ trợ trực tuyến: 0987654321
              </Typography>
              <Typography>Thời gian: 8h30 - 21h00 (Thứ 2 - Thứ 7)</Typography>
            </Box>
          </Box>
          <Typography sx={{ marginTop: "5px" }}>
            <EmailIcon sx={{ color: "#99BC4D" }} fontSize="small" />{" "}
            beesmart669@gmail.com
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: "1", minWidth: "40%" }}>
        <Typography
          sx={{ fontWeight: "bold", marginBottom: "10px", fontSize: "16px" }}
        >
          Về BeeSmart
        </Typography>
        {[
          { name: "Trang chủ", path: "/home" },
          { name: "Danh sách chủ điểm", path: "/skill-list" },
          { name: "Đăng ký", path: "/sign-up" },
          { name: "Đăng nhập", path: "/login" },
          { name: "Hướng dẫn sử dụng", path: "/instructions" },
        ].map((item, index) => (
          <Link
            key={index}
            onClick={() => router.push(item.path)}
            sx={{
              display: "block",
              color: "#555",
              cursor: "pointer",
              marginBottom: "5px",
              textDecoration: "none",
            }}
          >
            {item.name}
          </Link>
        ))}
      </Box>

      <Box
        sx={{
          flex: "1",
          minWidth: "200px",
        }}
      >
        <img
          src="/logo.png"
          alt="Logo"
          style={{ width: 80, height: "auto", cursor: "pointer" }}
        />
        <Typography sx={{ marginY: "10px" }}>© 2024 BeeSmart.co</Typography>
        <Typography>Mạng xã hội</Typography>
        <Box sx={{ display: "flex", gap: "10px" }}>
          <FacebookIcon
            sx={{ cursor: "pointer", color: "#3b5998" }}
            onClick={() => router.push("https://facebook.com")}
          />
          <YouTubeIcon
            sx={{ cursor: "pointer", color: "#ff0000" }}
            onClick={() => router.push("https://youtube.com")}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
