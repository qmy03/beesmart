"use client";
import React from "react";
import Layout from "./layout";
import { Box, CssBaseline, Typography } from "@mui/material";
import Image from "next/image";
import { Button } from "../../button";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import theme from "../../theme";
import { useRouter } from "next/navigation";
const HomePage: React.FC = () => {
  const router = useRouter();
  const handleSkillClick = () => {
    router.push("/skill-list");
  };
  return (
    <Layout>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "40px",
        }}
      >
        <Box
          sx={{
            position: "relative", // Tạo ngữ cảnh để căn chỉnh các phần tử con
            width: "100%", // Chiếm toàn bộ chiều rộng màn hình
            height: "100vh", // Chiếm toàn bộ chiều cao màn hình
          }}
        >
          {/* Ảnh */}
          <Box
            sx={{
              position: "absolute", // Đặt ảnh ở dưới và chiếm toàn bộ diện tích
              top: 0,
              left: 0,
              width: "100%", // Chiếm toàn bộ chiều rộng
              height: "100%", // Chiếm toàn bộ chiều cao
            }}
          >
            <Image src="/hero1.png" layout="fill" objectFit="fill" alt="Hero" />
          </Box>

          {/* Text */}
          <Box
            sx={{
              position: "absolute", // Đặt text lên trên ảnh
              top: "40%", // Căn giữa theo chiều dọc
              left: "15vw", // Căn trái
              transform: "translateY(-50%)", // Căn giữa dọc chính xác
              color: "#FFFFFF", // Màu chữ
              zIndex: 1, // Đảm bảo chữ luôn hiển thị trên ảnh
              fontWeight: 700,
              fontSize: "48px",
              maxWidth: "40%", // Giới hạn chiều rộng để không tràn ra ngoài
            }}
          >
            Tự học trực tuyến với BeeSmart
          </Box>

          <Box
            sx={{
              position: "absolute", // Đặt text lên trên ảnh
              top: "65%", // Căn theo chiều dọc dưới tiêu đề
              left: "15vw", // Căn trái
              transform: "translateY(-50%)", // Căn giữa dọc chính xác
              color: "#FFFFFF", // Màu chữ
              fontSize: "20px",
              fontWeight: 400,
              maxWidth: "40%", // Giới hạn chiều rộng để không tràn ra ngoài
            }}
          >
            Nền tảng học toán dành cho học sinh tiểu học, giúp trẻ khám phá kiến
            thức qua các bài học sinh động và trò chơi vui nhộn.
          </Box>

          <Box
            sx={{
              position: "absolute", // Đặt nút bấm lên trên ảnh
              top: "75%", // Vị trí nút
              left: "15vw", // Căn trái
              zIndex: 1, // Đảm bảo nút luôn hiển thị trên ảnh
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleSkillClick}
            >
              Học thử ngay
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px 40px 80px",
          }}
        >
          <Typography
            fontSize="32px"
            color="#000000"
            fontWeight={700}
            pb="20px"
            textAlign="center"
          >
            Chương trình học được quan tâm nhất
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 5,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: 400,
                height: 380,
                boxShadow: 4,
                borderRadius: "16px",
                cursor: "pointer",
                transition: "transform 0.3s ease-in-out", // Thêm transition để hiệu ứng mượt mà
                "&:hover": {
                  transform: "scale(1.1)", // Tăng kích thước lên 1.5 lần
                },
              }}
            >
              <Image
                src="/banner_2.png"
                width={400}
                height={225}
                alt=""
                style={{ borderRadius: "16px" }}
              ></Image>
              <Box sx={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 1}}>
                <Typography
                  sx={{
                    fontSize: "24px",
                    fontWeight: 700,
                  }}
                >
                  Toán BeeSmart
                </Typography>
                <Typography
                  sx={{
                    fontSize: "20px",
                    color: "#A8A8A8",
                  }}
                >
                  Lớp 1, 2, 3, 4, 5
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleSkillClick}
                  sx={{
                    border: "none",
                    backgroundColor: "#70CBF2",
                    color: "#fff",
                    fontWeight: "bold",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "#5BB0DA",
                    },
                  }}
                >
                  Khám phá ngay{" "}
                  <KeyboardDoubleArrowRightIcon fontSize="small" />
                </Button>
              </Box>
            </Box>
            
          </Box>
        </Box>
        <Box
          sx={{
            position: "relative", // Đặt container ở relative để các box con sử dụng absolute
            // width: "100vw",
            height: "auto", // Đảm bảo chiều cao tự động theo kích thước của hình ảnh
            overflow: "hidden", // Ẩn phần hình ảnh bị tràn ra ngoài nếu có
          }}
        >
          {/* Hình ảnh banner */}
          <img
            src="/banner.png"
            width="100%" // Chiếm toàn bộ chiều rộng của container
            height="auto" // Đảm bảo tỷ lệ chiều cao đúng
            style={{
              objectFit: "contain", // Đảm bảo hình ảnh sẽ bao phủ toàn bộ container mà không bị tràn
              objectPosition: "center", // Căn giữa hình ảnh
            }}
            alt="Banner"
          />

          {/* Các box con */}
          {[
            {
              top: "45%",
              left: "10%",
              text: "Hơn 50 bài giảng & khóa học",
              image: "/icon-banner/online-learning.png",
            },
            {
              top: "45%",
              left: "30%",
              text: "Không giới hạn lượt xem",
              image: "/icon-banner/clock.png",
            },
            {
              top: "45%",
              left: "50%",
              text: "Quiz game để ôn tập lại bài",
              image: "/icon-banner/quiz-game.png",
            },
            {
              top: "45%",
              left: "70%",
              text: "Hỗ trợ 24/7",
              image: "/icon-banner/support.png",
            },
            {
              top: "45%",
              left: "90%",
              text: "Đa nền tảng",
              image: "/icon-banner/cross-multi.png",
            },
          ].map((box, index) => (
            <Box
              key={index}
              sx={{
                position: "absolute",
                top: box.top,
                left: box.left,
                transform: "translate(-50%, -50%)", // Căn giữa box tại vị trí
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: 1,
              }}
            >
              <Image src={box.image} width={100} height={100} alt="Icon" />
              <Typography>{box.text}</Typography>
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center", // Căn giữa ảnh theo chiều ngang
            alignItems: "center", // Căn giữa ảnh theo chiều dọc (nếu cần)
            width: "100%", // Container sẽ chiếm toàn bộ chiều rộng
            height: "auto", // Tự động điều chỉnh theo nội dung
          }}
        >
          <Image
            src="/banner_1.png"
            width={1440} // Đặt đúng kích thước gốc của ảnh
            height={315} // Đặt đúng kích thước gốc của ảnh
            alt="Banner"
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column", // Hiển thị các phần tử theo cột
            alignItems: "center", // Căn giữa theo chiều ngang
            justifyContent: "center", // Căn giữa theo chiều dọc
          }}
        >
          <Typography
            fontSize="32px"
            color="#000000"
            fontWeight={700}
            pb="20px"
            textAlign="center"
          >
            Tại sao bạn nên chọn BeeSmart
          </Typography>

          {/* Container chứa các Box con */}
          <Box
            sx={{
              display: "flex",
              gap: "25px",
              padding: "10px",
              justifyContent: "center", // Căn giữa các phần tử con theo chiều ngang
              flexWrap: "wrap", // Tự động xuống dòng nếu vượt quá chiều rộng
              cursor: "pointer",
            }}
          >
            {[
              {
                text: "Học mọi lúc mọi nơi, không giới hạn số lần học",
                image: "/icon-banner/student.png",
              },
              {
                text: "Hỗ trợ giải đáp thắc mắc 24/7",
                image: "/icon-banner/support_learning.png",
              },
              {
                text: "Kho bài tập khổng lồ giúp nâng cao trình độ",
                image: "/icon-banner/book.png",
              },
              {
                text: "Làm bài kiểm tra định kỳ có điểm ngay sau khi làm",
                image: "/icon-banner/test.png",
              },
            ].map((item, index) => (
              <Box
                key={index}
                sx={{
                  width: "280px",
                  alignItems: "center", // Căn giữa nội dung trong Box
                  justifyContent: "center", // Căn giữa nội dung trong Box
                  textAlign: "center", // Căn giữa nội dung trong Box
                  boxShadow: 3,
                  borderRadius: "16px",
                  "&:hover": {
                    transform: "scale(1.1)", // Tăng kích thước lên 1.5 lần
                  },
                }}
              >
                <Image
                  src={item.image} // Đường dẫn ảnh thay đổi theo mảng
                  width={270}
                  height={173}
                  alt={item.text} // Thêm alt mô tả nội dung ảnh
                />
                <Typography>{item.text}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column", // Hiển thị các phần tử theo cột
            alignItems: "center", // Căn giữa theo chiều ngang
            justifyContent: "center", // Căn giữa theo chiều dọc
            pb: "40px",
          }}
        >
          <Typography
            fontSize="32px"
            color="#000000"
            fontWeight={700}
            pb="20px"
            textAlign="center"
          >
            Đồng hành cùng BeeSmart
          </Typography>

          {/* Container chứa các Box con */}
          <Box
            sx={{
              display: "flex",
              gap: "70px",
              padding: "10px",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {[
              "/icon-banner/logo_HM.png",
              "/icon-banner/logo_ĐTĐ.png",
              "/icon-banner/logo_TĐ.png",
              "/icon-banner/Logo_THĐ.png",
              "/icon-banner/logo_TL.png",
            ].map((imageSrc, index) => (
              <Box
                key={index}
                sx={{
                  width: "120px",
                  alignItems: "center", // Căn giữa nội dung trong Box
                  justifyContent: "center", // Căn giữa nội dung trong Box
                  borderRadius: "16px",
                  "&:hover": {
                    transform: "scale(1.1)", // Tăng kích thước lên khi hover
                  },
                }}
              >
                <Image
                  src={imageSrc} // Đường dẫn ảnh
                  width={270}
                  height={173}
                  alt="" // Alt có thể để trống nếu không cần mô tả
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default HomePage;
