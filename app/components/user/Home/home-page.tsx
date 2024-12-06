"use client";
import React from "react";
import Layout from "./layout";
import { Box, CssBaseline, Typography } from "@mui/material";
import Image from "next/image";
import { Button } from "../../button";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import theme from "../../theme";
const HomePage: React.FC = () => {
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
            display: "flex",
            gap: "20px",
            alignItems: "center",
            padding: "40px 80px 0 80px",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography fontSize="48px" color="#99BC4D" fontWeight={700}>
              Tự học trực tuyến với BeeSmart
            </Typography>
            <Typography fontSize="20px" color="#8A8A8A" pt="24px" pb="16px">
              Nền tảng học toán dành cho học sinh tiểu học, giúp trẻ khám phá
              kiến thức qua các bài học sinh động và trò chơi vui nhộn.
            </Typography>
            <Button>Học thử ngay</Button>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Image src="/hero.png" width={523} height={523} alt="Hero"></Image>
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
            Các khóa học Toán của BeeSmart
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
                width: 260,
                height: 300,
                boxShadow: 4,
                borderRadius: "16px",
                cursor: "pointer",
                transition: "transform 0.3s ease-in-out", // Thêm transition để hiệu ứng mượt mà
                "&:hover": {
                  transform: "scale(1.1)", // Tăng kích thước lên 1.5 lần
                },
              }}
            >
              {/* Ảnh nền */}
              <Image
                src="/course1.png"
                layout="fill"
                objectFit="cover"
                alt="Course 1"
                style={{ borderRadius: "16px" }}
              />

              {/* Nội dung chữ và nút */}
              <Box
                sx={{
                  position: "absolute",
                  top: "70%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  alignItems: "center",
                  width: "95%",
                }}
              >
                {/* Dòng chữ chính */}
                <Typography
                  sx={{
                    fontSize: "20px",
                    color: "#70CBF2",
                    fontWeight: 700,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  Lớp 1
                </Typography>

                {/* Dòng chữ phụ */}
                <Typography
                  sx={{
                    fontSize: "15px",
                    color: "#000000",
                    marginTop: "16px",
                    marginBottom: "10px",
                    textAlign: "center", // Khoảng cách giữa 2 dòng
                  }}
                >
                  Toán học bắt đầu từ những con số!
                </Typography>

                {/* Nút thêm */}
                <Button
                  variant="outlined"
                  sx={{
                    // Khoảng cách với dòng chữ
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
            <Box
              sx={{
                position: "relative",
                width: 260,
                height: 300,
                boxShadow: 4,
                borderRadius: "16px",
                cursor: "pointer",
                transition: "transform 0.3s ease-in-out", // Thêm transition để hiệu ứng mượt mà
                "&:hover": {
                  transform: "scale(1.1)", // Tăng kích thước lên 1.5 lần
                },
              }}
            >
              {/* Ảnh nền */}
              <Image
                src="/course2.png"
                layout="fill"
                objectFit="cover"
                alt="Course 1"
                style={{ borderRadius: "16px" }}
              />

              {/* Nội dung chữ và nút */}
              <Box
                sx={{
                  position: "absolute",
                  top: "70%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  alignItems: "center",
                  width: "95%",
                }}
              >
                {/* Dòng chữ chính */}
                <Typography
                  sx={{
                    fontSize: "20px",
                    color: "#94E9AB",
                    fontWeight: 700,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  Lớp 2
                </Typography>

                {/* Dòng chữ phụ */}
                <Typography
                  sx={{
                    fontSize: "15px",
                    color: "#000000",
                    marginTop: "16px",
                    marginBottom: "10px",
                    textAlign: "center", // Khoảng cách giữa 2 dòng
                  }}
                >
                  Cùng đếm và tính, khám phá thế giới!
                </Typography>

                {/* Nút thêm */}
                <Button
                  variant="outlined"
                  sx={{
                    // Khoảng cách với dòng chữ
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
            <Box
              sx={{
                position: "relative",
                width: 260,
                height: 300,
                boxShadow: 4,
                borderRadius: "16px",
                cursor: "pointer",
                transition: "transform 0.3s ease-in-out", // Thêm transition để hiệu ứng mượt mà
                "&:hover": {
                  transform: "scale(1.1)", // Tăng kích thước lên 1.5 lần
                },
              }}
            >
              {/* Ảnh nền */}
              <Image
                src="/course3.png"
                layout="fill"
                objectFit="cover"
                alt="Course 1"
                style={{ borderRadius: "16px" }}
              />

              {/* Nội dung chữ và nút */}
              <Box
                sx={{
                  position: "absolute",
                  top: "70%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  alignItems: "center",
                  width: "95%",
                }}
              >
                {/* Dòng chữ chính */}
                <Typography
                  sx={{
                    fontSize: "20px",
                    color: "#F2D39A",
                    fontWeight: 700,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  Lớp 3
                </Typography>

                {/* Dòng chữ phụ */}
                <Typography
                  sx={{
                    fontSize: "15px",
                    color: "#000000",
                    marginTop: "16px",
                    marginBottom: "10px",
                    textAlign: "center", // Khoảng cách giữa 2 dòng
                  }}
                >
                  Phép cộng, phép trừ - kiến thức vững chắc!
                </Typography>

                {/* Nút thêm */}
                <Button
                  variant="outlined"
                  sx={{
                    // Khoảng cách với dòng chữ
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
            <Box
              sx={{
                position: "relative",
                width: 260,
                height: 300,
                boxShadow: 4,
                borderRadius: "16px",
                cursor: "pointer",
                transition: "transform 0.3s ease-in-out", // Thêm transition để hiệu ứng mượt mà
                "&:hover": {
                  transform: "scale(1.1)", // Tăng kích thước lên 1.5 lần
                },
              }}
            >
              {/* Ảnh nền */}
              <Image
                src="/course4.png"
                layout="fill"
                objectFit="cover"
                alt="Course 1"
                style={{ borderRadius: "16px" }}
              />

              {/* Nội dung chữ và nút */}
              <Box
                sx={{
                  position: "absolute",
                  top: "70%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  alignItems: "center",
                  width: "95%",
                }}
              >
                {/* Dòng chữ chính */}
                <Typography
                  sx={{
                    fontSize: "20px",
                    color: "#FFADC5",
                    fontWeight: 700,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  Lớp 4
                </Typography>

                {/* Dòng chữ phụ */}
                <Typography
                  sx={{
                    fontSize: "15px",
                    color: "#000000",
                    marginTop: "16px",
                    marginBottom: "10px",
                    textAlign: "center", // Khoảng cách giữa 2 dòng
                  }}
                >
                  Nhân, chia dễ dàng - thành công dễ thấy!
                </Typography>

                {/* Nút thêm */}
                <Button
                  variant="outlined"
                  sx={{
                    // Khoảng cách với dòng chữ
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
            <Box
              sx={{
                position: "relative",
                width: 260,
                height: 300,
                boxShadow: 4,
                borderRadius: "16px",
                cursor: "pointer",
                transition: "transform 0.3s ease-in-out", // Thêm transition để hiệu ứng mượt mà
                "&:hover": {
                  transform: "scale(1.1)", // Tăng kích thước lên 1.5 lần
                },
              }}
            >
              {/* Ảnh nền */}
              <Image
                src="/course5.png"
                layout="fill"
                objectFit="cover"
                alt="Course 1"
                style={{ borderRadius: "16px" }}
              />

              {/* Nội dung chữ và nút */}
              <Box
                sx={{
                  position: "absolute",
                  top: "70%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  alignItems: "center",
                  width: "95%",
                }}
              >
                {/* Dòng chữ chính */}
                <Typography
                  sx={{
                    fontSize: "20px",
                    color: "#E4AD81",
                    fontWeight: 700,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  Lớp 5
                </Typography>

                {/* Dòng chữ phụ */}
                <Typography
                  sx={{
                    fontSize: "15px",
                    color: "#000000",
                    marginTop: "16px",
                    marginBottom: "10px",
                    textAlign: "center", // Khoảng cách giữa 2 dòng
                  }}
                >
                  Toán mở rộng - tư duy không giới hạn!
                </Typography>

                {/* Nút thêm */}
                <Button
                  variant="outlined"
                  sx={{
                    // Khoảng cách với dòng chữ
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
