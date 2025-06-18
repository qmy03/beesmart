import { Box, Card, Grid, Typography, CircularProgress } from "@mui/material";
import TextField from "@/app/components/textfield";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/AuthContext";
import QuizViewsBarChart from "../../dashboard/component/quiz-view-bar-chart";
import apiService from "@/app/untils/api";
import Layout from "@/app/components/admin/layout";
import QuizAverageBarChart from "../../dashboard/component/quiz-average-bar-chart";
import QuizScoreChart from "../../dashboard/component/quiz-score-chart";
import QuizStatisticsChart from "../../dashboard/component/quiz-statistics-chart";

interface SummaryDataItem {
  title: string;
  value: any;
  Icon: React.ComponentType;
  bgColor: string;
  bgColorIcon: string;
  iconColor: string;
  textColor: string;
}

interface Subject {
  subjectId: string;
  subjectName: string;
}

interface QuizStatistics {
  [key: string]: number;
}

interface QuizScoreData {
  [subject: string]: {
    "0.0 - 3.4": number;
    "3.5 - 4.9": number;
    "5.0 - 6.4": number;
    "6.5 - 7.9": number;
    "8.0 - 10.0": number;
  };
}

const StatisticQuizzesPage = () => {
  // const accessToken = localStorage.getItem("accessToken");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [lessonViewData, setLessonViewData] = useState<
    { date: string; views: number }[]
  >([]);
  const [summaryData, setSummaryData] = useState<SummaryDataItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${new Date().getMonth() + 1}`.padStart(2, "0")
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    `${new Date().getFullYear()}`
  );
  const [quizAverageData, setQuizAverageData] = useState<
    { date: string; averages: { [key: string]: number } }[]
  >([]);
  const [selectedSubjectForQuizView, setSelectedSubjectForQuizView] =
    useState<string>("");
  const [selectedSubjectForQuizAverage, setSelectedSubjectForQuizAverage] =
    useState<string>("");
  const [subjects, setSubjects] = useState<
    { subjectId: string; subjectName: string }[]
  >([]);
  const [dateInput, setDateInput] = useState<string>(
    `${selectedMonth.padStart(2, "0")}-${selectedYear}`
  );
  const [error, setError] = useState<string>("");
  const [quizStatistics, setQuizStatistics] = useState<QuizStatistics>({});
  const [quizScoreData, setQuizScoreData] = useState<QuizScoreData>({});
  const [quizStatisticsLoading, setQuizStatisticsLoading] = useState(false);
  const [quizScoreLoading, setQuizScoreLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      setAccessToken(token);
    }
  }, []);
  useEffect(() => {
    const fetchSubjectsAndStats = async () => {
      if (!accessToken) {
        setError("Không tìm thấy token xác thực");
        return;
      }

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };

        // Fetch subjects and quiz statistics
        const [subjectsResponse, quizStatsResponse, quizScoreResponse] =
          await Promise.all([
            apiService.get("/subjects", config),
            apiService.get("/statistics/admin/quiz-submit-statistics", config),
            apiService.get("/statistics/admin/quiz-score-by-subject", config),
          ]);

        // Set subjects
        const subjectsData = subjectsResponse.data?.data?.subjects || [];
        setSubjects(subjectsData);
        if (subjectsData.length > 0) {
          setSelectedSubjectForQuizView(subjectsData[0].subjectName);
          setSelectedSubjectForQuizAverage(subjectsData[0].subjectName);
        }

        // Set quiz statistics
        if (quizStatsResponse.data.status === 200) {
          const processedQuizData = {
            "Lớp 1": quizStatsResponse.data.data["Lớp 1"] || 0,
            "Lớp 2": quizStatsResponse.data.data["Lớp 2"] || 0,
            "Lớp 3": quizStatsResponse.data.data["Lớp 3"] || 0,
            "Lớp 4": quizStatsResponse.data.data["Lớp 4"] || 0,
            "Lớp 5": quizStatsResponse.data.data["Lớp 5"] || 0,
          };
          setQuizStatistics(processedQuizData);
        } else {
          console.warn(
            "Quiz statistics API failed:",
            quizStatsResponse.data.message
          );
          setQuizStatistics({});
        }

        // Set quiz score data
        if (quizScoreResponse.data.status === 200) {
          setQuizScoreData(quizScoreResponse.data.data);
        } else {
          console.warn(
            "Quiz score API failed:",
            quizScoreResponse.data.message
          );
          setQuizScoreData({});
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        setError("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setQuizStatisticsLoading(false);
        setQuizScoreLoading(false);
      }
    };

    fetchSubjectsAndStats();
  }, [accessToken]);

  useEffect(() => {
    const fetchQuizAverageData = async () => {
      if (!accessToken || !selectedSubjectForQuizAverage) return;
      try {
        const date = `${selectedMonth.padStart(2, "0")}-${selectedYear}`;
        const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };
        const averageResponse = await apiService.get(
          `/statistics/admin/quiz-average-by-month?date=${date}&subject=${encodeURIComponent(selectedSubjectForQuizAverage)}`,
          config
        );
        if (averageResponse.data.status === 200) {
          const chartData = Object.entries(averageResponse.data.data).map(
            ([date, averages]: [string, any]) => ({
              date,
              averages,
            })
          );
          setQuizAverageData(chartData);
        } else {
          setQuizAverageData([]);
        }
      } catch (error) {
        console.error("Error fetching average data:", error);
        setQuizAverageData([]);
      }
    };

    fetchQuizAverageData();
  }, [accessToken, selectedMonth, selectedYear, selectedSubjectForQuizAverage]);

  useEffect(() => {
    const fetchQuizViewData = async () => {
      if (!accessToken || !selectedSubjectForQuizView) return;
      try {
        const date = `${selectedMonth.padStart(2, "0")}-${selectedYear}`;
        const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };
        const lessonResponse = await apiService.get(
          `/statistics/admin/quiz-by-month?date=${date}&subject=${encodeURIComponent(selectedSubjectForQuizView)}`,
          config
        );
        if (lessonResponse.data.status === 200) {
          const chartData = Object.entries(lessonResponse.data.data).map(
            ([date, dayData]: [string, any]) => ({
              date,
              ...dayData,
            })
          );
          setLessonViewData(chartData);
        } else {
          setLessonViewData([]);
        }
      } catch (error) {
        console.error("Error fetching quiz view data:", error);
        setLessonViewData([]);
      }
    };

    fetchQuizViewData();
  }, [accessToken, selectedMonth, selectedYear, selectedSubjectForQuizView]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateInput(value);

    const regex = /^(\d{2})-(\d{4})$/;
    const match = value.match(regex);

    if (match) {
      const month = match[1];
      const year = match[2];
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      if (
        monthNum >= 1 &&
        monthNum <= 12 &&
        yearNum >= 1900 &&
        yearNum <= 9999
      ) {
        setSelectedMonth(month);
        setSelectedYear(year);
        setError("");
      } else {
        setError("Vui lòng nhập tháng (01-12) và năm hợp lệ (ví dụ: 06-2025)");
      }
    } else {
      setError("Vui lòng nhập đúng định dạng: MM-YYYY (ví dụ: 06-2025)");
    }
  };

  useEffect(() => {
    setDateInput(`${selectedMonth.padStart(2, "0")}-${selectedYear}`);
  }, [selectedMonth, selectedYear]);

  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          padding: "0 10px",
          gap: 2,
          flex: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            padding: "12px",
            alignItems: "center",
            boxShadow: 4,
            borderRadius: "8px",
            backgroundColor: "#FFFFFF",
          }}
        >
          <Typography fontWeight={700} flexGrow={1}>
            Thống kê Quiz
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexDirection: "column",
            overflowX: "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              width: "100%",
            }}
          >
            <TextField
              type="text"
              value={dateInput}
              onChange={handleDateChange}
              label="Chọn tháng và năm"
              placeholder="MM-YYYY (ví dụ: 06-2025)"
              sx={{ flexGrow: 1 }}
              error={!!error}
              helperText={error}
            />
          </Box>
          <QuizViewsBarChart
            data={lessonViewData}
            month={Number(selectedMonth)}
            year={Number(selectedYear)}
            selectedSubject={selectedSubjectForQuizView}
            setSelectedSubject={setSelectedSubjectForQuizView}
            subjects={subjects}
          />
          <QuizAverageBarChart
            data={quizAverageData}
            month={Number(selectedMonth)}
            year={Number(selectedYear)}
            selectedSubject={selectedSubjectForQuizAverage}
            setSelectedSubject={setSelectedSubjectForQuizAverage}
            subjects1={subjects}
            type="quiz"
          />
          <Box
            sx={{
              display: "flex",
              gap: 2,
              width: "100%", // Full width of parent
              flexWrap: "wrap", // Allow wrapping on smaller screens
              justifyContent: "space-between",
            }}
          >
            <Card
              variant="outlined"
              sx={{
                flex: 1,
                minWidth: 0, // Prevent overflow
                display: "flex",
                flexDirection: "column",
                width: "100%", // Full width within flex
              }}
            >
              <QuizStatisticsChart
                data={quizStatistics}
                loading={quizStatisticsLoading}
                type="quiz"
              />
            </Card>
            <Card
              variant="outlined"
              sx={{
                flex: 1,
                minWidth: 0, // Prevent overflow
                display: "flex",
                flexDirection: "column",
                width: "100%", // Full width within flex
              }}
            >
              <Box sx={{ width: "100%", height: 400 }}>
                <QuizScoreChart
                  data={quizScoreData}
                  loading={quizScoreLoading}
                />
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default StatisticQuizzesPage;
