"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Layout from "../Home/layout";
import {
  Box,
  CssBaseline,
  FormControl,
  MenuItem,
  Typography,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { Button } from "../../button";
import SearchIcon from "@mui/icons-material/Search";
import TextField from "../../textfield";
import { useAuth } from "@/app/hooks/AuthContext";
import apiService from "@/app/untils/api";
import VideoThumbnail from "../../capture-frame";
import Image from "next/image";

interface Grade {
  gradeId: string;
  gradeName: string;
}

interface BookType {
  bookId: string;
  bookName: string;
}

interface Subject {
  subjectId: string;
  subjectName: string;
}

interface Lesson {
  lessonId: string;
  lessonName: string;
  content: string;
  viewCount?: number;
}

interface Quiz {
  quizId: string;
  title: string;
  quizDuration: number;
}

interface Topic {
  topicId: string;
  topicName: string;
  lessons: Lesson[];
  quizzes: Quiz[];
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface GradesResponse {
  grades: Grade[];
}

interface BookTypesResponse {
  bookTypes: BookType[];
}

interface SubjectsResponse {
  subjects: Subject[];
}

interface TopicsResponse {
  topics: Topic[];
}

interface QuizzesResponse {
  quizzes: Quiz[];
}

const SkillListPage: React.FC = () => {
  // const { userInfo } = useAuth();
  const userInfo = localStorage.getItem("userInfo");
  const userInfoParsed = userInfo ? JSON.parse(userInfo) : null;
  const accessToken = localStorage.getItem("accessToken");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isTopicsLoading, setIsTopicsLoading] = useState(false);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [bookTypes, setBookTypes] = useState<BookType[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const [selectedGradeName, setSelectedGradeName] = useState<string>("");
  const [selectedBookTypeId, setSelectedBookTypeId] = useState<string>("");
  const [selectedBookTypeName, setSelectedBookTypeName] = useState<string>("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>("Học kì 1");

  const termMapping: { [key: string]: string } = {
    "Học kì 1": "term1",
    "Học kì 2": "term2",
  };

  // Hàm xử lý thay đổi học kỳ
  const handleTermChange = (termDisplay: string) => {
    setSelectedTerm(termDisplay);
    setSelectedTopic(null);
    setTopics([]);
  };

  // Lấy subjectId và gradeName từ query params
  useEffect(() => {
    const subjectIdFromQuery = searchParams.get("subjectId");
    const gradeNameFromQuery = searchParams.get("gradeName");

    if (subjectIdFromQuery && gradeNameFromQuery && subjects.length > 0 && grades.length > 0) {
      const subject = subjects.find((s) => s.subjectId === subjectIdFromQuery);
      const grade = grades.find((g) => g.gradeName === gradeNameFromQuery);

      if (subject) {
        setSelectedSubjectId(subject.subjectId);
        setSelectedSubjectName(subject.subjectName);
      }
      if (grade) {
        setSelectedGradeId(grade.gradeId);
        setSelectedGradeName(grade.gradeName);
      }
    }
  }, [searchParams, subjects, grades]);

  // Tải dữ liệu ban đầu (grades, subjects, bookTypes)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Tải danh sách lớp
        const gradesResponse = await apiService.get<ApiResponse<GradesResponse>>("/grades");
        const gradesData = gradesResponse.data.data.grades;
        setGrades(gradesData);

        // Tải danh sách môn học
        const subjectsResponse = await apiService.get<ApiResponse<SubjectsResponse>>("/subjects");
        const subjectsData = subjectsResponse.data.data.subjects;
        setSubjects(subjectsData);

        // Tải danh sách loại sách
        const bookTypesResponse = await apiService.get<ApiResponse<BookTypesResponse>>("/book-types");
        const bookTypesData = bookTypesResponse.data.data.bookTypes;
        setBookTypes(bookTypesData);

        // Thiết lập giá trị mặc định nếu không có query params
        if (!searchParams.get("subjectId") && subjectsData.length > 0) {
          setSelectedSubjectId(subjectsData[0].subjectId);
          setSelectedSubjectName(subjectsData[0].subjectName);
        }
        if (!searchParams.get("gradeName") && gradesData.length > 0) {
          const userGrade = gradesData.find((grade) => grade.gradeName === userInfoParsed?.grade);
          if (userGrade) {
            setSelectedGradeId(userGrade.gradeId);
            setSelectedGradeName(userGrade.gradeName);
          } else {
            setSelectedGradeId(gradesData[0].gradeId);
            setSelectedGradeName(gradesData[0].gradeName);
          }
        }
        if (bookTypesData.length > 0) {
          setSelectedBookTypeId(bookTypesData[0].bookId);
          setSelectedBookTypeName(bookTypesData[0].bookName);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, [userInfo, searchParams]);

  // Hàm lấy danh sách chủ điểm
  const fetchTopics = useCallback(async () => {
    if (!selectedGradeName || !selectedTerm || !selectedBookTypeName || !selectedSubjectName) {
      return;
    }

    setIsTopicsLoading(true);
    try {
      const response = await apiService.get<ApiResponse<TopicsResponse>>(
        `/topics?grade=${selectedGradeName}&semester=${selectedTerm}&bookType=${selectedBookTypeName}&subject=${selectedSubjectName}`
      );
      const topicsData = response.data.data.topics || [];
      setTopics(topicsData);
      setSelectedTopic(topicsData[0] || null);
    } catch (error) {
      console.error("Error fetching topics:", error);
      setTopics([]);
      setSelectedTopic(null);
    } finally {
      setIsTopicsLoading(false);
    }
  }, [selectedGradeName, selectedTerm, selectedBookTypeName, selectedSubjectName]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  // Xử lý notification topic selection
  useEffect(() => {
    const topicId = sessionStorage.getItem("notificationTopicId");
    if (topicId && topics.length > 0) {
      const matchedTopic = topics.find((t) => t.topicId === topicId);
      if (matchedTopic) {
        setSelectedTopic(matchedTopic);
        sessionStorage.removeItem("notificationTopicId");
      }
    }
  }, [topics]);

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubjectId(subject.subjectId);
    setSelectedSubjectName(subject.subjectName);
    setSelectedTopic(null);
    setTopics([]);
  };

  const getSubjectImage = (subjectName: string) => {
    switch (subjectName) {
      case "Toán":
        return "/math1.png";
      case "Tiếng Việt":
        return "/literature.png";
      case "Tự nhiên và xã hội":
        return "/nature_and_society.png";
      default:
        return "/subject-default.png";
    }
  };

  const handleGradeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedGrade = event.target.value as string;
    const selectedGradeItem = grades.find((grade) => grade.gradeName === selectedGrade);
    if (selectedGradeItem) {
      setSelectedGradeId(selectedGradeItem.gradeId);
      setSelectedGradeName(selectedGradeItem.gradeName);
      setSelectedTopic(null);
    }
  };

  const handleBookTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedBookType = event.target.value as string;
    const selectedBookTypeItem = bookTypes.find((bookType) => bookType.bookName === selectedBookType);
    if (selectedBookTypeItem) {
      setSelectedBookTypeId(selectedBookTypeItem.bookId);
      setSelectedBookTypeName(selectedBookTypeItem.bookName);
      setSelectedTopic(null);
      setTopics([]);
    }
  };

  const filteredTopics = topics.filter((topic) =>
    topic.topicName.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handlePracticeClick = (lessonId: string) => {
    apiService
      .get<ApiResponse<QuizzesResponse>>(`/lessons/${lessonId}/quizzes`)
      .then((response) => {
        setQuizzes(response.data.data.quizzes);
        setDialogOpen(true);
      })
      .catch((error) => console.error("Error fetching lesson quizzes:", error));
  };

  const handleQuizClick = (quizId: string) => {
    router.push(`/skill-practice/${quizId}`);
  };

  const handleLessonClick = (lessonId: string) => {
    router.push(`/skill-detail/${lessonId}?grade=${selectedGradeName}`);
  };

  const hasLessons = selectedTopic && selectedTopic.lessons && selectedTopic.lessons.length > 0;
  const hasQuizzes = selectedTopic && selectedTopic.quizzes && selectedTopic.quizzes.length > 0;

  return (
    <Layout>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          padding: "40px",
          gap: "20px",
          backgroundColor: "#EFF3E6",
          flexGrow: 1,
          height: "100%",
          overflowY: "auto",
        }}
      >
        {/* Subjects Section */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, padding: 2 }}>
          {subjects.map((subject) => (
            <Box
              key={subject.subjectId}
              onClick={() => handleSubjectClick(subject)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                backgroundColor: selectedSubjectId === subject.subjectId ? "#FFFFFF" : "none",
                cursor: "pointer",
                width: "15%",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#E1F5FE",
                },
              }}
            >
              <img src={getSubjectImage(subject.subjectName)} alt={subject.subjectName} width={60} height={60} />
              <Typography fontSize="14px" fontWeight={600} sx={{ marginTop: "5px", textAlign: "center" }}>
                {subject.subjectName}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Header */}
        <Box sx={{ display: "flex", gap: "20px", alignItems: "center", justifyContent: "space-between" }}>
          <Typography fontSize="26px" color="#000000" fontWeight={700}>
            Danh sách chủ điểm
          </Typography>
          <Box sx={{ display: "flex", gap: 4 }}>
            <FormControl fullWidth size="small">
              <TextField
                select
                value={selectedGradeName}
                onChange={handleGradeChange}
                label=""
                sx={{ minWidth: 200, backgroundColor: "white" }}
              >
                {grades.map((grade) => (
                  <MenuItem
                    key={grade.gradeId}
                    value={grade.gradeName}
                    sx={{
                      "&.Mui-selected": { backgroundColor: "#BCD181 !important", color: "white" },
                      "&:hover": { backgroundColor: "#BCD181" },
                    }}
                  >
                    {grade.gradeName}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
            <FormControl fullWidth size="small">
              <TextField
                select
                value={selectedBookTypeName}
                onChange={handleBookTypeChange}
                label="Loại sách"
                sx={{ minWidth: 200, backgroundColor: "white" }}
              >
                {bookTypes.map((bookType) => (
                  <MenuItem
                    key={bookType.bookId}
                    value={bookType.bookName}
                    sx={{
                      "&.Mui-selected": { backgroundColor: "#BCD181 !important", color: "white" },
                      "&:hover": { backgroundColor: "#BCD181" },
                    }}
                  >
                    {bookType.bookName}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
          </Box>
        </Box>

        {/* Body */}
        <Box sx={{ display: "flex", gap: "20px", flex: 1 }}>
          {/* Sidebar */}
          <Box sx={{ flex: 3, backgroundColor: "white", borderRadius: "8px", height: "600px", display: "flex", flexDirection: "column" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "16px" }}>
              {["Học kì 1", "Học kì 2"].map((termDisplay) => (
                <Box
                  key={termDisplay}
                  sx={{
                    flex: 1,
                    textAlign: "center",
                    padding: "15px 0",
                    borderTopRightRadius: "8px",
                    borderTopLeftRadius: "8px",
                    cursor: "pointer",
                    backgroundColor: selectedTerm === termDisplay ? "#99BC4D" : "#FFFFFF",
                    color: selectedTerm === termDisplay ? "white" : "#A8A8A8",
                    fontWeight: 600,
                  }}
                  onClick={() => handleTermChange(termDisplay)}
                >
                  {termDisplay}
                </Box>
              ))}
            </Box>
            <Box sx={{ padding: "8px", flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
              {isTopicsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", flex: 1 }}>
                  <CircularProgress size="30px" />
                </Box>
              ) : (
                <>
                  <TextField
                    variant="outlined"
                    placeholder="Tìm kiếm..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ fill: "#99BC4D" }} /> }}
                    sx={{ flexShrink: 0 }}
                  />
                  <Box sx={{ marginTop: "8px", flex: 1 }}>
                    {filteredTopics.map((topic) => (
                      <Box
                        key={topic.topicId}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          padding: "10px",
                          borderRadius: "5px",
                          marginBottom: "10px",
                          cursor: "pointer",
                          backgroundColor: selectedTopic?.topicId === topic.topicId ? "#C1E9F9" : "transparent",
                          borderBottom: "1px solid #E0E0E0",
                        }}
                        onClick={() => setSelectedTopic(topic)}
                      >
                        <Box component="img" src="/icon-topic.png" alt="icon topic" sx={{ width: "24px", height: "24px", marginRight: "10px" }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography fontSize="16px" fontWeight={600}>
                            {topic.topicName}
                          </Typography>
                          <Typography variant="body2" color="#A8A8A8">
                            Bài học: {topic.lessons.length} | Bài kiểm tra: {topic.quizzes.length}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </Box>
          </Box>

          {/* Lessons Box */}
          <Box sx={{ flex: 7 }}>
            {selectedTopic ? (
              <Box sx={{ gap: 4 }}>
                <Box sx={{ backgroundColor: "white", alignItems: "center", gap: 2, padding: "24px", borderRadius: "16px", border: "1px solid #A8A8A8" }}>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <img src="/math.png" width={40} height={40} />
                    <Typography fontSize={20} fontWeight={700}>
                      Bài học của chủ điểm: {selectedTopic.topicName}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: "flex", gap: 4 }}>
                    <Typography fontSize={16} fontStyle="italic" color="#A8A8A8" sx={{ display: "flex", gap: 2, alignItems: "center", paddingTop: "16px" }}>
                      Bài học: {selectedTopic.lessons.length}
                    </Typography>
                    <Typography fontSize={16} fontStyle="italic" color="#A8A8A8" sx={{ display: "flex", gap: 2, alignItems: "center", paddingTop: "16px" }}>
                      Bài kiểm tra: {selectedTopic.quizzes.length}
                    </Typography>
                  </Box>
                </Box>
                {hasLessons && (
                  <Box sx={{ backgroundColor: "white", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginTop: "16px", padding: "24px", borderRadius: "16px", border: "1px solid #A8A8A8" }}>
                    {selectedTopic.lessons.map((lesson: Lesson) => (
                      <Box key={lesson.lessonId} sx={{ border: "0.5px solid #A8A8A8", borderRadius: "8px", backgroundColor: "#f9f9f9", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        {lesson.content && lesson.content.includes(".mp4") && (
                          <Box sx={{ width: "100%", cursor: "pointer" }} onClick={() => handleLessonClick(lesson.lessonId)}>
                            <VideoThumbnail videoUrl={lesson.content} thumbnailUrls={lesson.thumbnailUrls} captureTime={60} width={300} height={200} />
                          </Box>
                        )}
                        <Box sx={{ display: "flex", flexDirection: "column", flex: 1, padding: "16px", backgroundColor: "white", borderBottomLeftRadius: "8px", borderBottomRightRadius: "8px", width: "100%" }}>
                          <Typography fontSize="20px" fontWeight={600} color="#99BC4D" sx={{ flex: 2, overflow: "hidden", textOverflow: "ellipsis" }}>
                            {lesson.lessonName}
                          </Typography>
                          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 2 }}>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }} onClick={() => handleLessonClick(lesson.lessonId)}>
                              <Image src="/icon-video.png" width={24} height={24} alt="" />
                              <Typography fontSize="16px" color="#469ADF" fontWeight={600}>
                                Video bài giảng
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }} onClick={() => handlePracticeClick(lesson.lessonId)}>
                              <Image src="/icon-quiz.png" width={24} height={24} alt="" />
                              <Typography fontSize="16px" color="#469ADF" fontWeight={600}>
                                Thực hành
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
                {hasQuizzes && (
                  <Box sx={{ backgroundColor: "white", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginTop: "16px", padding: "24px", borderRadius: "16px", border: "1px solid #A8A8A8" }}>
                    {selectedTopic.quizzes.map((quiz: Quiz) => (
                      <Box key={quiz.quizId} sx={{ border: "0.5px solid #A8A8A8", borderRadius: "16px", backgroundColor: "#f9f9f9" }}>
                        <img src="/quiz.png" />
                        <Box sx={{ padding: 2, backgroundColor: "white", borderBottomLeftRadius: "16px", borderBottomRightRadius: "16px" }}>
                          <Typography fontSize="20px" fontWeight={600} color="#99BC4D">
                            {quiz.title}
                          </Typography>
                          <Typography fontSize="16px" fontWeight={600} color="#555">
                            Thời gian làm bài
                          </Typography>
                          <Typography sx={{ pb: 1 }}>{quiz.quizDuration} phút</Typography>
                          <Button fullWidth onClick={() => handleQuizClick(quiz.quizId)}>
                            Làm bài kiểm tra
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ) : (
              <Typography>Chọn một chủ điểm để xem chi tiết</Typography>
            )}
          </Box>
        </Box>

        {/* Dialog for Quiz Selection */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth>
          <DialogTitle sx={{ minWidth: "400px", display: "flex" }}>
            <Typography sx={{ flexGrow: 1, fontSize: "20px", fontWeight: 700 }}>
              Chọn Quiz
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ paddingBottom: 3 }}>
              Vui lòng chọn quiz bên dưới để luyện tập
            </Typography>
            {quizzes.map((quiz: Quiz) => (
              <Box key={quiz.quizId} sx={{ marginBottom: "10px", display: "flex", flexDirection: "column" }}>
                <Button onClick={() => handleQuizClick(quiz.quizId)}>{quiz.title}</Button>
              </Box>
            ))}
          </DialogContent>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default SkillListPage;