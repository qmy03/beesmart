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
} from "@mui/material";
import { Button } from "../../button";
import SearchIcon from "@mui/icons-material/Search";
import TextField from "../../textfield";
import { useAuth } from "@/app/hooks/AuthContext";
import apiService from "@/app/untils/api";
import VideoThumbnail from "../../capture-frame";
import { useRouter } from "next/navigation";
const SkillListPage: React.FC = () => {
  const { accessToken } = useAuth();

  const [selectedTerm, setSelectedTerm] = useState<string>("Học kì 1");
  const [loading, setLoading] = useState(false);
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const [selectedGradeName, setSelectedGradeName] = useState<string>("");
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any>(null); // New state to store selected topic
  const [lessons, setLessons] = useState<any[]>([]); // New state to store lessons
  const [searchText, setSearchText] = useState<string>("");
  const router = useRouter();
  const handleLessonClick = (lessonId: string) => {
    router.push(`/skill-detail/${lessonId}?grade=${selectedGradeName}`);
  }
  const termMapping: { [key: string]: string } = {
    "Học kì 1": "term1",
    "Học kì 2": "term2",
  };

  const handleTermChange = (termDisplay: string) => {
    setSelectedTerm(termDisplay);
  };

  useEffect(() => {
    if (accessToken) {
      setLoading(true);
      apiService
        .get("/grades", {
          // headers: {
          //   Authorization: `Bearer ${accessToken}`,
          // },
        })
        .then((response) => {
          const fetchedGrades = response.data;
          setGrades(fetchedGrades);
          if (fetchedGrades.length > 0) {
            const firstGrade = fetchedGrades[0];
            setSelectedGradeId(firstGrade.gradeId);
            setSelectedGradeName(firstGrade.gradeName);
          }
        })
        .catch((error) => console.error("Error fetching grades:", error))
        .finally(() => setLoading(false));
    }
  }, [accessToken]);

  useEffect(() => {
    if (selectedGradeId && selectedTerm) {
      const termCode = termMapping[selectedTerm];
      setLoading(true);
      apiService
        .get(
          `/topics/grade/${selectedGradeId}/semester?semester=${selectedTerm}`
          // {
          //   headers: { Authorization: `Bearer ${accessToken}` },
          // }
        )
        .then((response) => {
          const topicsData = response.data.data.topics;
          if (Array.isArray(topicsData)) {
            setTopics(topicsData);
          } else {
            console.error("Invalid topics data:", topicsData);
            setTopics([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching topics:", error);
          setTopics([]);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedGradeId, selectedTerm, accessToken]);

  // Fetch lessons when a topic is selected
  useEffect(() => {
    if (selectedTopic) {
      setLoading(true);
      apiService
        .get(`/topics/${selectedTopic.topicId}/lessons`, {
          // headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          const lessonsData = response.data.data.lessons;
          const totalItems = response.data.data.totalItems;
          console.log("totalItems", totalItems);
          console.log("response", response);
          if (Array.isArray(lessonsData)) {
            setLessons(lessonsData);
          } else {
            console.error("Invalid lessons data:", lessonsData);
            setLessons([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching lessons:", error);
          setLessons([]);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedTopic, accessToken]);

  const handleGradeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedGrade = event.target.value as string;
    const selectedGradeItem = grades.find(
      (grade) => grade.gradeName === selectedGrade
    );
    if (selectedGradeItem) {
      setSelectedGradeId(selectedGradeItem.gradeId);
      setSelectedGradeName(selectedGradeItem.gradeName);
    }
  };

  const filteredTopics = topics.filter((topic) =>
    topic.topicName.toLowerCase().includes(searchText.toLowerCase())
  );

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
        }}
      >
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
            {/* Chọn lớp học */}
            <FormControl fullWidth size="small">
              <TextField
                select
                value={selectedGradeName}
                onChange={handleGradeChange}
                label="Chọn lớp học"
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
          </Box>
        </Box>

        {/* Body */}
        <Box sx={{ display: "flex", gap: "20px" }}>
          {/* Sidebar */}
          <Box
            sx={{ width: "25%", backgroundColor: "white", borderRadius: "8px" }}
          >
            {/* Chọn học kỳ */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
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
              {/* Danh sách chủ điểm */}
              <Box sx={{ marginTop: "8px" }}>
                {loading ? (
                  <CircularProgress />
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
                        <Typography variant="body1" fontWeight={600}>
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
          <Box sx={{ width: "75%" }}>
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
                  <Typography
                    fontSize={16}
                    fontStyle="italic"
                    color="#A8A8A8"
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                      padding: "16px",
                    }}
                  >
                    Bài học: {lessons.length}
                  </Typography>
                </Box>

                {/* Box danh sách bài học */}
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
                    <CircularProgress />
                  ) : lessons.length > 0 ? (
                    lessons.map((lesson) => (
                      <Box
                        key={lesson.lessonId}
                        onClick={() => handleLessonClick(lesson.lessonId)}
                        sx={{
                          border: "0.5px solid #A8A8A8",
                          borderRadius: "16px",
                          backgroundColor: "#f9f9f9",
                        }}
                      >
                        {lesson.content && (
                          <Typography variant="body2" color="#A8A8A8">
                            {/* {lesson.content} */}
                          </Typography>
                        )}
                        {lesson.content && lesson.content.includes(".mp4") && (
                          <Box>
                            <VideoThumbnail
                              videoUrl={lesson.content}
                              captureTime={60}
                            />
                          </Box>
                        )}
                        <Box sx={{ padding: 2, backgroundColor: "white", borderBottomLeftRadius: "16px", borderBottomRightRadius: "16px" }}>
                          <Typography
                            fontSize="20px"
                            fontWeight={600}
                            color="#99BC4D"
                          >
                            {lesson.lessonName}
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
                            <Box sx={{display: "flex", flexDirection: "column", alignItems: "center",}}>
                              <img
                                src="/icon-video.png"
                                width={24}
                                height={24}
                              ></img>
                              <Typography fontSize="16px" color="#469ADF" fontWeight={600}>
                                Video bài giảng
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center"}}>
                              <img
                                src="/icon-quiz.png"
                                width={24}
                                height={24}
                              ></img>
                              <Typography fontSize="16px" color="#469ADF" fontWeight={600}>
                                Thực hành
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Typography color="#A8A8A8" fontStyle="italic">
                      Không có bài học nào.
                    </Typography>
                  )}
                </Box>
              </Box>
            ) : (
              <Typography variant="h6" color="#A8A8A8" fontStyle="italic">
                Chọn chủ điểm để xem bài học.
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default SkillListPage;
