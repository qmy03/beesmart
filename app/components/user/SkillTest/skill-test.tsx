"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import apiService from "@/app/untils/api";
import Layout from "@/app/components/user/Home/layout";
import { Box, Typography, Divider, Button, Card } from "@mui/material";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
interface QuestionResult {
  questionId: string;
  content: string;
  image?: string;
  options?: string[];
  correctAnswer?: string;
  correctAnswers?: string[];
  userAnswer?: string;
  answers?: string[];
  correct: boolean;
}

interface QuizRecord {
  recordId: string;
  username: string;
  quizName: string;
  totalQuestions: number;
  correctAnswers: number;
  points: number;
  timeSpent: number;
  questionResults: QuestionResult[];
  createdAt: string;
}

interface ApiResponse {
  status: number;
  message: string;
  data: QuizRecord;
}

const formatTimeSpent = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

const SkillTestPage = () => {
  const router = useRouter();
  const { recordId } = useParams();
  // const accessToken = localStorage.getItem("accessToken");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [quizRecord, setQuizRecord] = useState<QuizRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      setAccessToken(token);
    }
  }, []);
  useEffect(() => {
    if (recordId) {
      setLoading(true);
      apiService
        .get<ApiResponse>(`/quizzes/user/records/${recordId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          setQuizRecord(response.data.data);
        })
        .catch((err) => {
          console.error("Error fetching quiz record:", err);
          setError("Không thể tải kết quả bài quiz.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [recordId, accessToken]);

  if (loading) {
    return (
      <Layout>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "#EFF3E6",
          }}
        >
          <Typography variant="h5">Đang tải kết quả...</Typography>
        </Box>
      </Layout>
    );
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
            height: "100vh",
            backgroundColor: "#EFF3E6",
          }}
        >
          <Typography variant="h5" color="error">
            {error}
          </Typography>
        </Box>
      </Layout>
    );
  }

  if (!quizRecord) {
    return (
      <Layout>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "#EFF3E6",
          }}
        >
          <Typography variant="h5">Không tìm thấy kết quả.</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#EFF3E6",
          padding: "40px 120px",
          minHeight: "100vh",
        }}
      >
        <Box
          sx={{
            bgcolor: "#FFFFFF",
            border: "1px solid #ccc",
            borderRadius: 4,
          }}
        >
          <Typography
            sx={{
              fontSize: "32px",
              fontWeight: "600",
              textAlign: "center",
              paddingY: "8px",
              backgroundColor: "#90DD81",
              borderTopLeftRadius: "16px",
              borderTopRightRadius: "16px",
            }}
          >
            {quizRecord.quizName}
          </Typography>
          <Divider />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              flex: 1,
              padding: "40px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 5,
                flex: 1,
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Image src="/score.png" width={80} height={80} alt="Score" />
                <Box>
                  <Typography fontSize={32} fontWeight={600}>
                    {quizRecord.points.toFixed(1)}/10
                  </Typography>
                  <Typography fontWeight={600}>Điểm đạt được</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Image src="/clock.png" width={80} height={80} alt="Clock" />
                <Box>
                  <Typography fontSize={32} fontWeight={600}>
                    {formatTimeSpent(quizRecord.timeSpent)}
                  </Typography>
                  <Typography fontWeight={600}>Thời gian làm bài</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Image src="/list.png" width={80} height={80} alt="List" />
                <Box>
                  <Typography fontSize={32} fontWeight={600}>
                    {quizRecord.correctAnswers}/{quizRecord.totalQuestions}
                  </Typography>
                  <Typography fontWeight={600}>Số câu trả lời đúng</Typography>
                </Box>
              </Box>
            </Box>
            <Typography
              fontSize={24}
              fontWeight={600}
              textAlign="center"
              gutterBottom
            >
              KẾT QUẢ LÀM BÀI KIỂM TRA
            </Typography>
            {quizRecord.questionResults.map((question, index) => (
              <Box
                key={question.questionId}
                sx={{
                  marginBottom: "16px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <Box sx={{ backgroundColor: "#f9f9f9" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      padding: 1,
                    }}
                  >
                    {question.correct && (
                      <>
                        <CheckIcon
                          sx={{
                            color: "#1C84C6",
                            fontSize: 32,
                            fontWeight: 700,
                          }}
                        />
                        <Typography
                          fontSize={20}
                          fontWeight={600}
                          color="#1C84C6"
                        >
                          Câu hỏi {index + 1}
                        </Typography>
                      </>
                    )}
                    {!question.correct && (
                      <>
                        <CloseIcon
                          sx={{
                            color: "red",
                            fontSize: 32,
                            fontWeight: 700,
                          }}
                        />
                        <Typography fontSize={20} fontWeight={600} color="red">
                          Câu hỏi {index + 1}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />
                <Box sx={{ padding: 1 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    {question.content}
                  </Typography>

                  {question.image && (
                    <img
                      src={question.image}
                      alt="Question"
                      style={{
                        maxWidth: "300px",
                        marginTop: "10px",
                        marginBottom: "10px",
                        borderRadius: "5px",
                      }}
                    />
                  )}
                  <Box sx={{ display: "flex", gap: 3 }}>
                    {question.options &&
                      question.options.length > 0 &&
                      question.options
                        .filter((option) => option.trim() !== "")
                        .map((option, optIndex) => (
                          <>
                            <Card
                              sx={{
                                border: "1px solid #CCC",
                                display: "flex",
                                flex: 1,
                                borderRadius: "8px",
                                overflow: "hidden",
                                height: "50px",
                              }}
                            >
                              <Box
                                sx={{
                                  width: "40px",
                                  backgroundColor: "#e9e9e9",
                                }}
                              ></Box>
                              <Box
                                sx={{
                                  flex: 9,
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <Typography
                                  key={optIndex}
                                  sx={{
                                    padding: "4px 8px",
                                    borderRadius: "5px",
                                    backgroundColor: "transparent",
                                  }}
                                >
                                  {option}
                                </Typography>
                              </Box>
                            </Card>
                          </>
                        ))}
                  </Box>

                  <Typography variant="body1" fontWeight={600} sx={{ mt: 2 }}>
                    Đáp án bạn chọn là:
                  </Typography>
                  <Typography
                    sx={{
                      padding: "8px",
                      marginBottom: "4px",
                      borderRadius: "5px",
                      backgroundColor: question.correct ? "#99BC4D" : "#FFCCCB",
                    }}
                  >
                    {question.answers
                      ? question.answers.join(", ")
                      : question.userAnswer || "Không chọn"}
                  </Typography>

                  {!question.correct && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body1" fontWeight={600}>
                        Đáp án đúng:
                      </Typography>
                      <Typography
                        sx={{
                          padding: "8px",
                          backgroundColor: "#99BC4D",
                          borderRadius: "5px",
                        }}
                      >
                        {question.correctAnswers
                          ? question.correctAnswers.join(", ")
                          : question.correctAnswer}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            ))}

            <Button
              variant="contained"
              color="primary"
              sx={{
                marginTop: "20px",
                textTransform: "none",
                ":hover": { backgroundColor: "#99BC4D" },
                color: "#FFF",
              }}
              onClick={() => router.push("/skill-list")}
            >
              Quay lại danh sách
            </Button>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default SkillTestPage;
