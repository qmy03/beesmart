"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import apiService from "@/app/untils/api"; 
import Layout from "@/app/components/user/Home/layout";
import {
  Box,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Button } from "../../button";
import ErrorIcon from "@mui/icons-material/Error";
import Close from "@mui/icons-material/Close";
import { useAuth } from "@/app/hooks/AuthContext";
interface Lesson {
  lessonId: string;
  lessonName: string;
  content: string;
  viewCount: number;
}

interface Quiz {
  quizId: string;
  title: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface QuizzesResponse {
  quizzes: Quiz[];
}
const SkillDetailPage = () => {
  const { accessToken } = useAuth();
  const { lessonId } = useParams(); 
  const searchParams = useSearchParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quizzes, setQuizzes] = useState<any[]>([]); 
  const [dialogOpen, setDialogOpen] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null);
  const [isTokenReady, setIsTokenReady] = useState(false); 
  const grade = searchParams.get("grade");

  useEffect(() => {
    const tokenInterval = setInterval(() => {
      if (accessToken) {
        setIsTokenReady(true);
        clearInterval(tokenInterval); 
      }
    }, 100); 

    return () => clearInterval(tokenInterval); 
  }, [accessToken]);

  useEffect(() => {
    if (!isTokenReady) return;

    if (!accessToken) {
      setError("Vui lòng đăng nhập để tiếp tục xem bài học.");
      setLoading(false);
      return;
    }

    if (lessonId) {
      setLoading(true);
      apiService
        .get<ApiResponse<Lesson>>(`/lessons/${lessonId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          setLesson(response.data.data);
        })
        .catch((error) => {
          setError(error.response?.data?.message || "Có lỗi xảy ra.");
        })
        .finally(() => {
          setLoading(false);
        });

      apiService
        .get<ApiResponse<QuizzesResponse>>(`/lessons/${lessonId}/quizzes`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          setQuizzes(response.data.data.quizzes);
        })
        .catch((error) => {
          console.error("Error fetching quizzes:", error);
        });
    }
  }, [lessonId, accessToken, isTokenReady]);
  const handleQuizClick = (quizId: string) => {
    router.push(`/skill-practice/${quizId}`);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <Layout>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "50vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)", 
          }}
        >
          <Box
            sx={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: 3,
              textAlign: "center",
            }}
          >
            <Typography
              color="error"
              sx={{
                marginBottom: "16px",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              <ErrorIcon fontSize="large" sx={{ color: "red" }} /> {error}
            </Typography>
            <Button onClick={() => router.push("/login")} variant="contained">
              Đăng nhập
            </Button>
          </Box>
        </Box>
      </Layout>
    );
  }

  if (!lesson) {
    return <div>Lesson not found</div>;
  }

  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          paddingY: "80px",
          gap: "20px",
          backgroundColor: "#EFF3E6",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            backgroundColor: "white",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <video style={{width: "80vw"}} controls>
            <source src={lesson.content} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <Box
            sx={{
              padding: 2,
              display: "flex",
              gap: 1,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column",gap: 1}}>
              <Typography fontWeight={700}>{grade && `${grade}`}</Typography>
              <Typography fontSize="24px">{lesson.lessonName}</Typography>
              <Typography
                fontSize="16px"
                fontWeight={700}
              >
                Lượt xem: {lesson.viewCount}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={() => setDialogOpen(true)}>
                Thực hành ngay
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Dialog to display quizzes */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth>
        <DialogTitle sx={{ minWidth: "400px", display: "flex" }}>
          <Typography sx={{ flexGrow: 1, fontSize: "20px", fontWeight: 700 }}>
            Chọn Quiz
          </Typography>
          <Close onClick={handleCloseDialog} />
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ paddingBottom: 3 }}>
            Vui lòng chọn quiz bên dưới để luyện tập
          </Typography>
          {quizzes.map((quiz: any) => (
            <Box
              key={quiz.quizId}
              sx={{
                marginBottom: "10px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Button onClick={() => handleQuizClick(quiz.quizId)}>
                {quiz.title}
              </Button>
            </Box>
          ))}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default SkillDetailPage;
