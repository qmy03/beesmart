import React, { useEffect, useState } from "react";
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
  DialogActions,
  IconButton,
} from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
import { Button } from "../../button";
import SearchIcon from "@mui/icons-material/Search";
import TextField from "../../textfield";
import { useAuth } from "@/app/hooks/AuthContext";
import apiService from "@/app/untils/api";
import VideoThumbnail from "../../capture-frame";
import { useRouter } from "next/navigation";
import Image from "next/image";
const SkillListPage: React.FC = () => {
  const { accessToken, userInfo } = useAuth();
  const gradeUser = userInfo?.grade;
  console.log("gradeUser", gradeUser);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<string>("Học kì 1");
  const [loading, setLoading] = useState(false);
  const [grades, setGrades] = useState<any[]>([]);
  const [bookTypes, setBookTypes] = useState<any[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const [selectedGradeName, setSelectedGradeName] = useState<string>("");
  const [selectedBookTypeId, setSelectedBookTypeId] = useState<string>("");
  const [selectedBookTypeName, setSelectedBookTypeName] = useState<string>("");
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [topicQuizzes, setTopicQuizzes] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>("");
  const router = useRouter();
  const handleLessonClick = (lessonId: string) => {
    router.push(`/skill-detail/${lessonId}?grade=${selectedGradeName}`);
  };
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const termMapping: { [key: string]: string } = {
    "Học kì 1": "term1",
    "Học kì 2": "term2",
  };

  const handleTermChange = (termDisplay: string) => {
    setSelectedTerm(termDisplay);
    setLessons([]);
    setSelectedTopic(null);
  };

  useEffect(() => {
    apiService.get("/grades").then((response) => {
      setGrades(response.data.data.grades);
    });
  }, []);

  useEffect(() => {
    apiService.get("/subjects").then((response) => {
      setSubjects(response.data.data.subjects);
      if (response.data.data.subjects && response.data.data.subjects.length > 0) {
        setSelectedSubjectId(response.data.data.subjects[0].subjectId);
        setSelectedSubjectName(response.data.data.subjects[0].subjectName);
      }
    });
  }, []);

  useEffect(() => {
    apiService.get("/book-types").then((response) => {
      setBookTypes(response.data.data.bookTypes);
      if (response.data.data.bookTypes && response.data.data.bookTypes.length > 0) {
        setSelectedBookTypeId(response.data.data.bookTypes[0].bookId);
        setSelectedBookTypeName(response.data.data.bookTypes[0].bookName);
      }
    });
  }, []);

  useEffect(() => {
    if (!grades.length) return;
    if (userInfo?.grade) {
      const userGrade = grades.find(
        (grade) => grade.gradeName === userInfo.grade
      );
      if (userGrade) {
        setSelectedGradeId(userGrade.gradeId);
        setSelectedGradeName(userGrade.gradeName);
      } else {
        setSelectedGradeId(grades[0]?.gradeId);
        setSelectedGradeName(grades[0]?.gradeName);
      }
    } else {
      setSelectedGradeId(grades[0]?.gradeId);
      setSelectedGradeName(grades[0]?.gradeName);
    }
  }, [userInfo, grades]);

  useEffect(() => {
    if (
      !selectedGradeName ||
      !selectedTerm ||
      !selectedBookTypeName ||
      !selectedSubjectName
    )
      return;

    setLoading(true);

    apiService
      .get(
        `/topics?grade=${selectedGradeName}&semester=${selectedTerm}&bookType=${selectedBookTypeName}&subject=${selectedSubjectName}`
      )
      .then((response) => {
        console.log("responseeeee", response);
        const topicsData = response.data.data.topics || [];
        setTopics(topicsData);
        console.log("quizz", topicsData);
        // Chỉ set topic khi chưa có topic được chọn
        if (!selectedTopic && topicsData.length > 0) {
          setSelectedTopic(topicsData[0]); // Set topic đầu tiên
        }
      })
      .catch((error) => {
        console.error("Error fetching topics:", error);
        setTopics([]);
      })
      .finally(() => setLoading(false));
  }, [
    selectedGradeName,
    selectedTerm,
    selectedBookTypeName,
    selectedSubjectName,
  ]);

  useEffect(() => {
    if (selectedTopic && topicQuizzes.length === 0) {
      fetchLessonsAndQuizzes(selectedTopic.topicId);
    }
  }, [selectedTopic?.topicId]); // Chỉ lắng nghe sự thay đổi của `topicId`.

  // Fetch lessons and quizzes when the selected topic changes
  const fetchLessonsAndQuizzes = (topicId: string) => {
    setLoading(true);

    apiService
      .get(`/topics/${topicId}/lessons-and-quizzes`)
      .then((response) => {
        console.log("responseLQ", response);
        const lessonsData = response.data.data.lessons || [];
        const quizzesData = response.data.data.quizzes || [];

        // Chỉ set state nếu topic hiện tại vẫn là topicId này
        if (selectedTopic?.topicId === topicId) {
          setLessons(lessonsData);
          setTopicQuizzes(quizzesData);
        }
      })
      .catch((error) => {
        console.error("Error fetching lessons and quizzes:", error);
        if (selectedTopic?.topicId === topicId) {
          setLessons([]);
          setTopicQuizzes([]);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    console.log("Updated topicQuizzes:", topicQuizzes);
  }, [topicQuizzes]);

  useEffect(() => {
    const topicId = sessionStorage.getItem("notificationTopicId");

    if (topicId && topics.length > 0) {
      const matchedTopic = topics.find(t => t.topicId === topicId);
      if (matchedTopic) {
        setSelectedTopic(matchedTopic);
        sessionStorage.removeItem("notificationTopicId"); // cleanup
      }
    }
  }, [topics]);

  const handleSubjectClick = (subject: any) => {
    setSelectedSubjectId(subject.subjectId);
    setSelectedSubjectName(subject.subjectName);
    setSelectedTopic(null);
    setLessons([]);
  };

  const getSubjectImage = (subjectName: string) => {
    switch (subjectName) {
      case "Toán":
        return "/math1.png";
      case "Tiếng Việt":
        return "/literature.png";
      case "Toán Tiếng Anh":
        return "/calculator.png";
      case "Tự nhiên và xã hội":
        return "/nature_and_society.png";
        case "Tin học":
        return "/it.png";
      default:
        return "/subject-default.png"; // Default image
    }
  };

  const handleGradeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedGrade = event.target.value as string;
    const selectedGradeItem = grades.find(
      (grade) => grade.gradeName === selectedGrade
    );
    if (selectedGradeItem) {
      setSelectedGradeId(selectedGradeItem.gradeId);
      setSelectedGradeName(selectedGradeItem.gradeName);
      setSelectedTopic(null); // Reset selected topic when grade changes
      setLessons([]); // Clear lessons when grade changes
    }
  };

  const handleBookTypeChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const selectedBookType = event.target.value as string;
    const selectedBookTypeItem = bookTypes.find(
      (bookType) => bookType.bookName === selectedBookType
    );
    if (selectedBookTypeItem) {
      setSelectedBookTypeId(selectedBookTypeItem.bookId);
      setSelectedBookTypeName(selectedBookTypeItem.bookName);
      setSelectedTopic(null);
      setLessons([]);
    }
  };

  const filteredTopics = topics.filter((topic) =>
    topic.topicName.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handlePracticeClick = (lessonId: string) => {
    console.log("lessonId", lessonId);
    // Fetch quizzes for this lesson and open the dialog
    apiService
      .get(`/lessons/${lessonId}/quizzes`)
      .then((response) => {
        console.log("response", response);
        setQuizzes(response.data.data.quizzes);
        setDialogOpen(true);
      })
      .catch((error) => console.error("Error fetching quizzes:", error));
  };

  const handleQuizClick = (quizId: string) => {
    router.push(`/skill-practice/${quizId}`);
  };

  const hasLessons =
    selectedTopic && selectedTopic.lessons && selectedTopic.lessons.length > 0;
  const hasQuizzes =
    selectedTopic && selectedTopic.quizzes && selectedTopic.quizzes.length > 0;

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
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3.5,
            padding: 2,
          }}
        >
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
                backgroundColor:
                  selectedSubjectId === subject.subjectId ? "#FFFFFF" : "none",
                cursor: "pointer",
                width: "15%",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#E1F5FE",
                },
              }}
            >
              <img
                src={getSubjectImage(subject.subjectName)}
                alt={""}
                width={60}
                height={60}
              />
              <Typography
                fontSize="14px"
                fontWeight={600}
                sx={{ marginTop: "5px", textAlign: "center" }}
              >
                {subject.subjectName}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Header */}
        <Box
          sx={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography fontSize="26px" color="#000000" fontWeight={700}>
            Danh sách chủ điểm
          </Typography>
          <Box sx={{ display: "flex", gap: 4 }}>
            <FormControl fullWidth size="small">
              <TextField
                select
                value={selectedGradeName} // Giá trị lớp học hiện tại
                onChange={handleGradeChange} // Thay đổi lớp học
                label=""
                sx={{ minWidth: 200, backgroundColor: "white" }}
              >
                {grades.map((grade) => (
                  <MenuItem
                    key={grade.gradeId}
                    value={grade.gradeName}
                    sx={{
                      "&.Mui-selected": {
                        backgroundColor: "#BCD181 !important",
                        color: "white",
                      },
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
                value={selectedBookTypeName} // Giá trị lớp học hiện tại
                onChange={handleBookTypeChange} // Thay đổi lớp học
                label="Loại sách"
                sx={{ minWidth: 200, backgroundColor: "white" }}
              >
                {bookTypes.map((bookType) => (
                  <MenuItem
                    key={bookType.bookId}
                    value={bookType.bookName}
                    sx={{
                      "&.Mui-selected": {
                        backgroundColor: "#BCD181 !important",
                        color: "white",
                      },
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
        <Box sx={{ display: "flex", gap: "20px" }}>
          {/* Sidebar */}
          <Box
            sx={{ width: "30%", backgroundColor: "white", borderRadius: "8px" }}
          >
            {/* Chọn học kỳ */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "16px",
              }}
            >
              {["Học kì 1", "Học kì 2"].map((termDisplay) => (
                <Box
                  key={termDisplay}
                  sx={{
                    flex: 1, // Đảm bảo mỗi box chiếm toàn bộ chiều rộng còn lại
                    textAlign: "center", // Canh giữa nội dung
                    padding: "15px 0", // Khoảng cách nội dung
                    borderTopRightRadius: "8px",
                    borderTopLeftRadius: "8px",
                    cursor: "pointer",
                    backgroundColor:
                      selectedTerm === termDisplay ? "#99BC4D" : "#FFFFFF",
                    color: selectedTerm === termDisplay ? "white" : "#A8A8A8",
                    fontWeight: 600,
                  }}
                  onClick={() => handleTermChange(termDisplay)}
                >
                  {termDisplay}
                </Box>
              ))}
            </Box>
            {/* Tìm kiếm */}
            <Box sx={{ padding: "8px" }}>
              <TextField
                variant="outlined"
                placeholder="Tìm kiếm..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon fontSize="small" sx={{ fill: "#99BC4D" }} />
                  ),
                }}
                sx={{ flex: 1 }}
              />
              {/* Danh sách chủ điểm */}
              <Box sx={{ marginTop: "8px" }}>
                {loading ? (
                  <CircularProgress size="30px" />
                ) : filteredTopics.length > 0 ? (
                  filteredTopics.map((topic, index) => (
                    <Box
                      key={topic.topicId}
                      sx={{
                        display: "flex", // Đặt flex để bố trí icon và text cùng hàng
                        alignItems: "center",
                        padding: "10px",
                        borderRadius: "5px",
                        marginBottom: "10px",
                        cursor: "pointer",
                        backgroundColor:
                          selectedTopic?.topicId === topic.topicId
                            ? "#C1E9F9"
                            : "transparent",
                        borderBottom: "1px solid #E0E0E0", // Đường thẳng kết nối giữa các box
                      }}
                      onClick={() => setSelectedTopic(topic)}
                    >
                      {/* Hình ảnh icon */}
                      <Box
                        component="img"
                        src="/icon-topic.png" // Thay bằng đường dẫn thực tế đến icon của bạn
                        alt="icon topic"
                        sx={{
                          width: "24px",
                          height: "24px",
                          marginRight: "10px", // Tạo khoảng cách giữa icon và text
                        }}
                      />

                      {/* Nội dung chủ đề */}
                      <Box sx={{ flex: 1 }}>
                        <Typography fontSize="16px" fontWeight={600}>
                          {topic.topicName}
                        </Typography>
                        <Typography variant="body2" color="#A8A8A8">
                          Chủ điểm: {topic.lessons.length}
                        </Typography>
                      </Box>

                      {/* Hình ảnh liên kết */}
                    </Box>
                  ))
                ) : (
                  <Typography color="#A8A8A8" fontStyle="italic">
                    Không có chủ điểm nào.
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Lessons Box */}
          <Box sx={{ width: "70%" }}>
            {selectedTopic ? (
              <Box sx={{ gap: 4 }}>
                {/* Box tiêu đề chủ điểm */}
                <Box
                  sx={{
                    backgroundColor: "white",
                    alignItems: "center",
                    gap: 2,
                    padding: "24px",
                    borderRadius: "16px",
                    border: "1px solid #A8A8A8",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <img src="/math.png" width={40} height={40}></img>
                    <Typography fontSize={20} fontWeight={700}>
                      Bài học của chủ điểm: {selectedTopic.topicName}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: "flex", gap: 4 }}>
                    <Typography
                      fontSize={16}
                      fontStyle="italic"
                      color="#A8A8A8"
                      sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                        paddingTop: "16px",
                      }}
                    >
                      Bài học: {selectedTopic.lessons.length}
                    </Typography>
                    <Typography
                      fontSize={16}
                      fontStyle="italic"
                      color="#A8A8A8"
                      sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                        paddingTop: "16px",
                      }}
                    >
                      Bài kiểm tra: {selectedTopic.quizzes.length}
                    </Typography>
                  </Box>
                </Box>

                {/* Box danh sách bài học - Only show if there are lessons */}
                {hasLessons && (
                  <Box
                    sx={{
                      backgroundColor: "white",
                      display: "grid", // Sử dụng grid layout
                      gridTemplateColumns: "repeat(2, 1fr)", // Mỗi hàng 2 cột
                      gap: "16px", // Khoảng cách giữa các box
                      marginTop: "16px",
                      padding: "24px",
                      borderRadius: "16px",
                      border: "1px solid #A8A8A8",
                    }}
                  >
                    {loading ? (
                      <CircularProgress size="30px" />
                    ) : (
                      selectedTopic.lessons.map((lessonsData: any) => (
                        <Box
                          key={lessonsData.lessonId}
                          sx={{
                            border: "0.5px solid #A8A8A8",
                            borderRadius: "8px",
                            backgroundColor: "#f9f9f9",
                            overflow: "hidden",
                          }}
                        >
                          {lessonsData.content && (
                            <Typography variant="body2" color="#A8A8A8">
                              {/* {lesson.content} */}
                            </Typography>
                          )}
                          {lessonsData.content &&
                            lessonsData.content.includes(".mp4") && (
                              <Box
                                sx={{ cursor: "pointer" }}
                                onClick={() =>
                                  handleLessonClick(lessonsData.lessonId)
                                }
                              >
                                <VideoThumbnail
                                  videoUrl={lessonsData.content}
                                  captureTime={60}
                                />
                              </Box>
                            )}
                          <Box
                            sx={{
                              padding: 2,
                              backgroundColor: "white",
                              borderBottomLeftRadius: "16px",
                              borderBottomRightRadius: "16px",
                            }}
                          >
                            <Typography
                              fontSize="20px"
                              fontWeight={600}
                              color="#99BC4D"
                            >
                              {lessonsData.lessonName}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 4,
                                marginTop: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  handleLessonClick(lessonsData.lessonId)
                                }
                              >
                                <Image
                                  src="/icon-video.png"
                                  width={24}
                                  height={24}
                                  alt=""
                                ></Image>
                                <Typography
                                  fontSize="16px"
                                  color="#469ADF"
                                  fontWeight={600}
                                >
                                  Video bài giảng
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  handlePracticeClick(lessonsData.lessonId)
                                }
                              >
                                <Image
                                  src="/icon-quiz.png"
                                  width={24}
                                  height={24}
                                  alt=""
                                ></Image>
                                <Typography
                                  fontSize="16px"
                                  color="#469ADF"
                                  fontWeight={600}
                                >
                                  Thực hành
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                )}

                {/* Box danh sách bài kiểm tra - Only show if there are quizzes */}
                {hasQuizzes && (
                  <Box
                    sx={{
                      backgroundColor: "white",
                      display: "grid", // Sử dụng grid layout
                      gridTemplateColumns: "repeat(2, 1fr)", // Mỗi hàng 2 cột
                      gap: "16px", // Khoảng cách giữa các box
                      marginTop: "16px",
                      padding: "24px",
                      borderRadius: "16px",
                      border: "1px solid #A8A8A8",
                    }}
                  >
                    {loading ? (
                      <CircularProgress size="30px" />
                    ) : (
                      selectedTopic.quizzes.map((quizzesData: any) => (
                        <Box
                          key={quizzesData.quizId}
                          sx={{
                            border: "0.5px solid #A8A8A8",
                            borderRadius: "16px",
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          <img src="/quiz.png"></img>
                          <Box
                            sx={{
                              padding: 2,
                              backgroundColor: "white",
                              borderBottomLeftRadius: "16px",
                              borderBottomRightRadius: "16px",
                            }}
                          >
                            <Typography
                              fontSize="20px"
                              fontWeight={600}
                              color="#99BC4D"
                            >
                              {quizzesData.title}
                            </Typography>
                            <Typography
                              fontSize="16px"
                              fontWeight={600}
                              color="#555"
                            >
                              Thời gian làm bài
                            </Typography>
                            <Typography sx={{ pb: 1 }}>
                              {quizzesData.quizDuration} phút
                            </Typography>
                            <Button
                              fullWidth
                              onClick={() =>
                                handleQuizClick(quizzesData.quizId)
                              }
                            >
                              Làm bài kiểm tra
                            </Button>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                )}
              </Box>
            ) : (
              <></>
            )}
          </Box>
        </Box>
        <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth>
          <DialogTitle sx={{ minWidth: "400px", display: "flex" }}>
            <Typography sx={{ flexGrow: 1, fontSize: "20px", fontWeight: 700 }}>
              Chọn Quiz
            </Typography>
            {/* <CloseIcon onClick={handleCloseDialog} /> */}
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ paddingBottom: 3 }}>
              Vui lòng chọn quiz bên dưới để luyện tập
            </Typography>
            {quizzes.map((quizzesData: any) => (
              <Box
                key={quizzesData.quizId}
                sx={{
                  marginBottom: "10px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Button onClick={() => handleQuizClick(quizzesData.quizId)}>
                  {quizzesData.title}
                </Button>
              </Box>
            ))}
          </DialogContent>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default SkillListPage;
