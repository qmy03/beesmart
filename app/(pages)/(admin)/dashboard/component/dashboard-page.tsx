import Layout from "@/app/components/admin/layout";
import { Box, Card, CircularProgress, Grid, Typography } from "@mui/material";
import StatCard from "./stat-card";
import LessonViewsBarChart from "./lesson-view-bar-chart";
import QuizStatisticsChart from "./quiz-statistics-chart";
import QuizAverageBarChart from "./quiz-average-bar-chart";
import apiService from "@/app/untils/api";

import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ClassIcon from "@mui/icons-material/Class";
import PlayLessonIcon from "@mui/icons-material/PlayLesson";
import SubjectIcon from "@mui/icons-material/Subject";

import { useEffect, useState } from "react";
import {
  AccountCircle,
  Class,
  MenuBook,
  School,
  SvgIconComponent,
} from "@mui/icons-material";
import QuizScoreChart from "./quiz-score-chart";
import BattleScoreChart from "./battle-score-chart";
import BattleStatisticsChart from "./battle-statistics-chart";
import { useAuth } from "@/app/hooks/AuthContext";

interface DashboardStats {
  totalUsers: number;
  totalGrades: number;
  totalSubjects: number;
  totalLessons: number;
}
interface Subject {
  subjectId: string;
  subjectName: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

interface ChartDataItem {
  date: string;
  "Lớp 1": number;
  "Lớp 2": number;
  "Lớp 3": number;
  "Lớp 4": number;
  "Lớp 5": number;
}

interface QuizStatistics {
  [key: string]: number;
}
interface BattleStatistics {
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
interface BattleScoreData {
  [subject: string]: {
    "0-50": number;
    "51-70": number;
    "71-90": number;
    "91-100": number;
  };
}

const DashboardPage = () => {
  // const accessToken = localStorage.getItem("accessToken");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const { isLoading, setIsLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalGrades: 0,
    totalSubjects: 0,
    totalLessons: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chart data states
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [chartLoading, setChartLoading] = useState(false);
  // const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial load

  // Quiz and Battle average states
  const [quizAverageData, setQuizAverageData] = useState<ChartDataItem[]>([]);
  const [quizAverageLoading, setQuizAverageLoading] = useState(false);
  const [battleAverageData, setBattleAverageData] = useState<ChartDataItem[]>(
    []
  );
  const [battleAverageLoading, setBattleAverageLoading] = useState(false);

  // Quiz statistics states
  const [quizStatistics, setQuizStatistics] = useState<QuizStatistics>({});
  const [quizLoading, setQuizLoading] = useState(false);
  const [battleStatistics, setBattleStatistics] = useState<BattleStatistics>(
    {}
  );
  const [battleLoading, setBattleLoading] = useState(false);
  // Thêm state cho Quiz Score Data
  const [quizScoreData, setQuizScoreData] = useState<QuizScoreData>({});
  const [quizScoreLoading, setQuizScoreLoading] = useState(false);
  const [battleScoreData, setBattleScoreData] = useState<BattleScoreData>({});
  const [battleScoreLoading, setBattleScoreLoading] = useState(false);

  // Current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const dateParam = `${currentMonth}-${currentYear}`;
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("accessToken");
      setAccessToken(token);
    }
  }, []);
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!accessToken) {
        setError("Không tìm thấy token xác thực");
        setIsLoading(false);
        // setDataLoading(false);
        // setIsInitialLoad(false);
        return;
      }

      try {
        setIsLoading(true);
        // setDataLoading(true);
        setError(null);

        const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };

        // Fetch all dashboard data including quiz statistics
        const [
          usersResponse,
          gradesResponse,
          subjectsResponse,
          lessonsResponse,
          quizStatsResponse,
          battleStatsResponse,
          quizScoreResponse, // Thêm API quiz score
          battleScoreResponse, // Thêm API battle score
        ] = await Promise.all([
          apiService.get("/users", config),
          apiService.get("/grades", config),
          apiService.get("/subjects", config),
          apiService.get("/lessons", config),
          apiService.get("/statistics/admin/quiz-submit-statistics", config),
          apiService.get("/statistics/admin/battle-users-by-subject", config),
          apiService.get("/statistics/admin/quiz-score-by-subject", config), // API mới
          apiService.get("/statistics/admin/battle-score-by-subject", config),
        ]);

        // Check response status for main APIs
        if (usersResponse.data.status !== 200) {
          throw new Error(`Lỗi API users: ${usersResponse.data.message}`);
        }
        if (gradesResponse.data.status !== 200) {
          throw new Error(`Lỗi API grades: ${gradesResponse.data.message}`);
        }
        if (subjectsResponse.data.status !== 200) {
          throw new Error(`Lỗi API subjects: ${subjectsResponse.data.message}`);
        }
        if (lessonsResponse.data.status !== 200) {
          throw new Error(`Lỗi API lessons: ${lessonsResponse.data.message}`);
        }

        // Update stats
        setStats({
          totalUsers: usersResponse.data.data?.length || 0,
          totalGrades: gradesResponse.data.data?.totalItems || 0,
          totalSubjects: subjectsResponse.data.data?.totalItems || 0,
          totalLessons: lessonsResponse.data.data?.totalItems || 0,
        });

        // Get subjects list for chart
        const subjectsList = subjectsResponse.data.data?.subjects || [];
        setSubjects(subjectsList);

        // Set default subject to first subject
        if (subjectsList.length > 0 && !selectedSubject) {
          setSelectedSubject(subjectsList[0].subjectName);
        }

        // Handle quiz statistics
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
        }
        if (battleStatsResponse.data.status === 200) {
          // Sử dụng dữ liệu trực tiếp từ API vì đã có đầy đủ môn học
          setBattleStatistics(battleStatsResponse.data.data);
        } else {
          console.warn(
            "Battle statistics API failed:",
            battleStatsResponse.data.message
          );
        }
        if (quizScoreResponse.data.status === 200) {
          setQuizScoreData(quizScoreResponse.data.data);
        } else {
          console.warn(
            "Quiz score statistics API failed:",
            quizScoreResponse.data.message
          );
          // Set empty data thay vì để loading
          setQuizScoreData({});
        }
        if (battleScoreResponse.data.status === 200) {
          setBattleScoreData(battleScoreResponse.data.data);
        } else {
          console.warn(
            "Battle score statistics API failed:",
            battleScoreResponse.data.message
          );
          // Set empty data thay vì để loading
          setBattleScoreData({});
        }
      } catch (err: any) {
        console.error("Lỗi khi fetch dashboard data:", err);
        let errorMessage = "Có lỗi xảy ra khi tải dữ liệu";

        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
      } finally {
        setIsLoading(false);
        // setDataLoading(false);
        // setIsInitialLoad(false);
        setQuizScoreLoading(false);
        setBattleScoreLoading(false);
        // setQuizAverageLoading(false);
        // setBattleAverageLoading(false);
      }
    };

    fetchDashboardData();
  }, [accessToken]);

  useEffect(() => {
    const fetchChartData = async () => {
      if (!accessToken || !selectedSubject || subjects.length === 0) {
        console.log("[fetchChartData] Missing required data:", {
          accessToken: !!accessToken,
          selectedSubject,
          subjectsLength: subjects.length,
        });
        return;
      }

      try {
        setChartLoading(true);
        console.log("[fetchChartData] Fetching lesson views with:", {
          selectedSubject,
          dateParam,
        });

        const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };

        const response = await apiService.get(
          `/statistics/admin/record-lesson-by-month?date=${dateParam}&subject=${encodeURIComponent(selectedSubject)}`,
          config
        );

        if (response.data.status === 200) {
          const rawData = response.data.data;
          console.log("[fetchChartData] Raw API response:", rawData);

          if (rawData && Object.keys(rawData).length > 0) {
            const transformedData = Object.entries(rawData).map(
              ([date, values]: [string, any]) => ({
                date,
                "Lớp 1": values["Lớp 1"] || 0,
                "Lớp 2": values["Lớp 2"] || 0,
                "Lớp 3": values["Lớp 3"] || 0,
                "Lớp 4": values["Lớp 4"] || 0,
                "Lớp 5": values["Lớp 5"] || 0,
              })
            );
            console.log("[fetchChartData] Transformed data:", transformedData);
            setChartData(transformedData);
          } else {
            console.log("[fetchChartData] No lesson view data available");
            setChartData([]);
          }
        } else {
          console.warn("Lesson views API failed:", response.data.message);
          setChartData([]);
        }
      } catch (err: any) {
        console.error("Lỗi khi fetch chart data:", err);
        setChartData([]);
      } finally {
        setChartLoading(false);
      }
    };

    fetchChartData();
  }, [accessToken, selectedSubject, dateParam, subjects.length]);

  useEffect(() => {
    const fetchAverageData = async () => {
      // Thêm kiểm tra điều kiện đầy đủ hơn
      if (!accessToken || !selectedSubject || subjects.length === 0) {
        console.log("[fetchAverageData] Missing required data:", {
          accessToken: !!accessToken,
          selectedSubject,
          subjectsLength: subjects.length,
        });
        return;
      }

      try {
        console.log("[fetchAverageData] Starting fetch with:", {
          selectedSubject,
          dateParam,
        });

        setQuizAverageLoading(true);
        setBattleAverageLoading(true);

        const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };

        const [quizAverageResponse, battleAverageResponse] = await Promise.all([
          apiService.get(
            `/statistics/admin/quiz-average-by-month?date=${dateParam}&subject=${encodeURIComponent(selectedSubject)}`,
            config
          ),
          apiService.get(
            `/statistics/admin/battle-average-by-month?date=${dateParam}&subject=${encodeURIComponent(selectedSubject)}`,
            config
          ),
        ]);

        console.log("[fetchAverageData] API responses:", {
          quiz: quizAverageResponse.data,
          battle: battleAverageResponse.data,
        });

        // Handle quiz average
        if (quizAverageResponse.data.status === 200) {
          const rawData = quizAverageResponse.data.data;

          if (rawData && Object.keys(rawData).length > 0) {
            const transformedQuizAverage = Object.entries(rawData).map(
              ([date, values]: [string, any]) => ({
                date,
                averages: {
                  "Lớp 1": values["Lớp 1"] || 0,
                  "Lớp 2": values["Lớp 2"] || 0,
                  "Lớp 3": values["Lớp 3"] || 0,
                  "Lớp 4": values["Lớp 4"] || 0,
                  "Lớp 5": values["Lớp 5"] || 0,
                },
              })
            );

            console.log(
              "[fetchAverageData] Transformed quiz data:",
              transformedQuizAverage
            );
            setQuizAverageData(transformedQuizAverage);
          } else {
            console.log("[fetchAverageData] No quiz data available");
            setQuizAverageData([]);
          }
        } else {
          console.warn(
            "Quiz average API failed:",
            quizAverageResponse.data.message
          );
          setQuizAverageData([]);
        }

        // Handle battle average
        if (battleAverageResponse.data.status === 200) {
          const rawData = battleAverageResponse.data.data;

          if (rawData && Object.keys(rawData).length > 0) {
            const transformedBattleAverage = Object.entries(rawData).map(
              ([date, values]: [string, any]) => ({
                date,
                averages: {
                  "Lớp 1": values["Lớp 1"] || 0,
                  "Lớp 2": values["Lớp 2"] || 0,
                  "Lớp 3": values["Lớp 3"] || 0,
                  "Lớp 4": values["Lớp 4"] || 0,
                  "Lớp 5": values["Lớp 5"] || 0,
                },
              })
            );

            console.log(
              "[fetchAverageData] Transformed battle data:",
              transformedBattleAverage
            );
            setBattleAverageData(transformedBattleAverage);
          } else {
            console.log("[fetchAverageData] No battle data available");
            setBattleAverageData([]);
          }
        } else {
          console.warn(
            "Battle average API failed:",
            battleAverageResponse.data.message
          );
          setBattleAverageData([]);
        }
      } catch (err: any) {
        console.error("Lỗi khi fetch average data:", err);
        setQuizAverageData([]);
        setBattleAverageData([]);
      } finally {
        setQuizAverageLoading(false);
        setBattleAverageLoading(false);
      }
    };

    fetchAverageData();
  }, [accessToken, selectedSubject, dateParam, subjects.length]); // Thêm subjects.length vào dependency
  const statsConfig = [
    {
      title: "Tài khoản hiện có",
      value: stats.totalUsers,
      label: "Tài khoản",
      Icon: AccountCircle,
      bgColor: "#E3F2FD",
      bgColorIcon: "#1976D2",
      iconColor: "#FFFFFF",
      textColor: "#1976D2",
    },
    {
      title: "Tổng số môn học",
      value: stats.totalSubjects,
      label: "Môn học",
      Icon: MenuBook,
      bgColor: "#F3E5F5",
      bgColorIcon: "#7B1FA2",
      iconColor: "#FFFFFF",
      textColor: "#7B1FA2",
    },
    {
      title: "Tổng số lớp học",
      value: stats.totalGrades,
      label: "Lớp học",
      Icon: Class,
      bgColor: "#E8F5E8",
      bgColorIcon: "#388E3C",
      iconColor: "#FFFFFF",
      textColor: "#388E3C",
    },
    {
      title: "Tổng số bài học",
      value: stats.totalLessons,
      label: "Bài học",
      Icon: School,
      bgColor: "#FFF3E0",
      bgColorIcon: "#F57C00",
      iconColor: "#FFFFFF",
      textColor: "#F57C00",
    },
  ];

  // Show loading only for initial load
  // if (dataLoading && isInitialLoad) {
  //   return (
  //     <Layout>
  //       <Box
  //         sx={{
  //           position: "absolute",
  //           top: 0,
  //           left: 0,
  //           right: 0,
  //           bottom: 0,
  //           backgroundColor: "rgba(0, 0, 0, 0.1)",
  //           zIndex: 10, // Đảm bảo overlay nằm trên nội dung main nhưng không vượt qua Sidebar
  //           display: "flex",
  //           justifyContent: "center",
  //           alignItems: "center",
  //         }}
  //       >
  //         <CircularProgress size={30} color="inherit" />
  //       </Box>
  //     </Layout>
  //   );
  // }

  if (error) {
    return (
      <Layout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            backgroundColor: "#F4F5F9",
            flex: 1,
          }}
        >
          <Typography color="error" variant="h6">
            {error}
          </Typography>
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
          padding: "0 10px",
          gap: 2,
          backgroundColor: "#F4F5F9",
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
            Tổng quan
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {statsConfig.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatCard
                title={stat.title}
                value={stat.value}
                label={stat.label}
                Icon={stat.Icon}
                bgColor={stat.bgColor}
                bgColorIcon={stat.bgColorIcon}
                iconColor={stat.iconColor}
                textColor={stat.textColor}
              />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 2 }}>
          <LessonViewsBarChart
            data={chartData}
            month={currentMonth}
            year={currentYear}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            subjects={subjects}
            loading={chartLoading}
            hasData={chartData.length > 0}
          />
        </Box>
        <Box sx={{ display: "flex", flex: 1, gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <QuizStatisticsChart
              data={quizStatistics}
              loading={quizLoading}
              type="quiz"
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <QuizStatisticsChart
              data={battleStatistics}
              loading={battleLoading}
              type="battle"
            />
          </Box>
        </Box>
        <Box sx={{ display: "flex", flex: 1, gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <QuizScoreChart data={quizScoreData} loading={quizScoreLoading} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <BattleScoreChart
              data={battleScoreData}
              loading={battleScoreLoading}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", flex: 1, gap: 2 }}>
          <QuizAverageBarChart
            data={quizAverageData}
            month={currentMonth}
            year={currentYear}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            subjects1={subjects}
            type="quiz"
            loading={quizAverageLoading}
          />
        </Box>
        <Box sx={{ display: "flex", flex: 1, gap: 2 }}>
          <QuizAverageBarChart
            data={battleAverageData}
            month={currentMonth}
            year={currentYear}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            subjects1={subjects}
            type="arena"
            loading={battleAverageLoading}
          />
        </Box>
      </Box>
    </Layout>
  );
};

export default DashboardPage;
