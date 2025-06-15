"use client";
import React, { useEffect, useState } from "react";
import Layout from "./layout";
import { Box, CircularProgress, CssBaseline, Typography } from "@mui/material";
import Image from "next/image";
import { Button } from "../../button";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import theme from "../../theme";
import { useRouter } from "next/navigation";
import apiService from "@/app/untils/api";
import { useAuth } from "@/app/hooks/AuthContext";
interface Subject {
  subjectId: string;
  subjectName: string;
}

interface ApiResponse<T> {
  status: number;
  message: string;
  data: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    subjects: T[];
  };
}
const HomePage: React.FC = () => {
  const userInfo = localStorage.getItem("userInfo");
  const grade = userInfo? JSON.parse(userInfo).grade : "Lớp 1"; // Lấy thông tin lớp từ localStorage, nếu không có thì mặc định là "Lớp 1"
  console.log("grade", grade);
  // console.log("userInfo", userInfo);
  const router = useRouter();
  const handleSkillClick = (subjectId: string) => {
    const gradeName = grade || "Lớp 1"; // Nếu userInfo null, mặc định là "Lớp 1"
    // router.push(`/skill-list?subjectId=${subjectId}&gradeName=${gradeName}`);
    router.push(`/skill-list`);
  };
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Ánh xạ hình ảnh và danh sách lớp cho từng môn học
  const getSubjectImage = (subjectName: string) => {
    switch (subjectName) {
      case "Toán":
        return "/banner_2.png";
      case "Tiếng Việt":
        return "/banner_3.png";
      case "Tự nhiên và xã hội":
        return "/banner_4.png";
      default:
        return "/subject-default.png";
    }
  };

  const getSubjectGrades = (subjectName: string) => {
    switch (subjectName) {
      case "Toán":
      case "Tiếng Việt":
        return "Lớp 1, 2, 3, 4, 5";
      case "Tự nhiên và xã hội":
        return "Lớp 1, 2, 3";
      default:
        return "Lớp 1, 2, 3, 4, 5";
    }
  };
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await apiService.get<ApiResponse<Subject>>("/subjects");
        setSubjects(response.data.data.subjects);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);
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
            position: "relative",
            width: "100%", 
            height: "100vh", 
          }}
        >
          <Box
            sx={{
              position: "absolute", 
              top: 0,
              left: 0,
              width: "100%", 
              height: "100%",
            }}
          >
            <Image src="/hero1.png" layout="fill" objectFit="fill" alt="Hero" />
          </Box>

          <Box
            sx={{
              position: "absolute", 
              top: "40%",
              left: "15vw", 
              transform: "translateY(-50%)", 
              color: "#FFFFFF", 
              zIndex: 1, 
              fontWeight: 700,
              fontSize: "48px",
              maxWidth: "40%", 
            }}
          >
            Tự học trực tuyến với BeeSmart
          </Box>

          <Box
            sx={{
              position: "absolute", 
              top: "65%",
              left: "15vw", 
              transform: "translateY(-50%)",
              color: "#FFFFFF", 
              fontSize: "20px",
              fontWeight: 400,
              maxWidth: "40%", 
            }}
          >
            Nền tảng học toán dành cho học sinh tiểu học, giúp trẻ khám phá kiến
            thức qua các bài học sinh động và trò chơi vui nhộn.
          </Box>

          <Box
            sx={{
              position: "absolute", 
              top: "75%",
              left: "15vw",
              zIndex: 1, 
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

        {/* <Box
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
                transition: "transform 0.3s ease-in-out",
                "&:hover": {
                  transform: "scale(1.1)", 
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
        </Box> */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 10px 40px 10px",
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
          {loading ? (
            <CircularProgress />
          ) : (
            <Box
              sx={{
                display: "flex",
                gap: 5,
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {subjects.map((subject) => (
                <Box
                  key={subject.subjectId}
                  sx={{
                    position: "relative",
                    width: 345,
                    height: 345,
                    boxShadow: 4,
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                    overflow: "hidden",
                  }}
                >
                  <Image
                    src={getSubjectImage(subject.subjectName)}
                    width={345}
                    height={194}
                    alt={subject.subjectName}
                  />
                  <Box
                    sx={{
                      padding: "8px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "24px",
                        fontWeight: 700,
                      }}
                    >
                      {subject.subjectName}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "16px",
                        color: "#A8A8A8",
                      }}
                    >
                      {getSubjectGrades(subject.subjectName)}
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        handleSkillClick(
                          subject.subjectId,
                          getSubjectGrades(subject.subjectName).split(", ")[0]
                        )
                      }
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
                      Khám phá ngay <KeyboardDoubleArrowRightIcon fontSize="small" />
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
        <Box
          sx={{
            position: "relative", 
            height: "auto",
            overflow: "hidden", 
          }}
        >
          <img
            src="/banner.png"
            width="100%" 
            height="auto" 
            style={{
              objectFit: "contain", 
              objectPosition: "center", 
            }}
            alt="Banner"
          />

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
                transform: "translate(-50%, -50%)",
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
            justifyContent: "center", 
            alignItems: "center", 
            width: "100%", 
            height: "auto",
          }}
        >
          <Image
            src="/banner_1.png"
            width={1440}
            height={315} 
            alt="Banner"
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center", 
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

          <Box
            sx={{
              display: "flex",
              gap: "25px",
              padding: "10px",
              justifyContent: "center", 
              flexWrap: "wrap",
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
                  alignItems: "center", 
                  justifyContent: "center", 
                  textAlign: "center",
                  boxShadow: 3,
                  borderRadius: "16px",
                  "&:hover": {
                    transform: "scale(1.1)", 
                  },
                }}
              >
                <Image
                  src={item.image} 
                  width={270}
                  height={173}
                  alt={item.text} 
                />
                <Typography>{item.text}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center", 
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
                  alignItems: "center", 
                  justifyContent: "center", 
                  borderRadius: "16px",
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Image
                  src={imageSrc}
                  width={270}
                  height={173}
                  alt=""
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
