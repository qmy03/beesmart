import Layout from "@/app/components/admin/layout";
import { Box, Card, Grid, Typography } from "@mui/material";
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
import { SvgIconComponent } from "@mui/icons-material";
import QuizScoreChart from "./quiz-score-chart";
import BattleScoreChart from "./battle-score-chart";
import BattleStatisticsChart from "./battle-statistics-chart";

interface SummaryDataItem {
  title: string;
  value: any;
  Icon: SvgIconComponent;
  bgColor: string;
  bgColorIcon: string;
  iconColor: string;
  textColor: string;
  label: string;
}

interface Subject {
  subjectId: string;
  subjectName: string;
}

const DashboardPage = () => {
  // const [accessToken, setAccessToken] = useState<string | null>(null);
  const accessToken = localStorage.getItem("accessToken");
  const [summaryData, setSummaryData] = useState<SummaryDataItem[]>([]);
  const [subjects, setSubjects] = useState<
    { subjectId: string; subjectName: string }[]
  >([]);

  const [lessonViewData, setLessonViewData] = useState<
    { date: string; views: number }[]
  >([]);
  const [quizAverageData, setQuizAverageData] = useState<
    { date: string; averages: { [key: string]: number } }[]
  >([]);
  const [battleAverageData, setBattleAverageData] = useState<
    { date: string; averages: { [key: string]: number } }[]
  >([]);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Tạo state riêng biệt cho từng component
  const [selectedSubjectForLessonView, setSelectedSubjectForLessonView] =
    useState<string>("");
  const [selectedSubjectForQuizAverage, setSelectedSubjectForQuizAverage] =
    useState<string>("");
  const [selectedSubjectForBattleAverage, setSelectedSubjectForBattleAverage] =
    useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     const token = localStorage.getItem("accessToken");
  //     setAccessToken(token);
  //   }
  // }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        const response = (await apiService.get("/subjects")) as {
          data: {
            data: {
              subjects: Subject[];
              totalItems: number;
              totalPages: number;
              currentPage: number;
            };
          };
        };
        console.log("Fetched subjects:", response.data);

        const data = response.data?.data?.subjects || [];

        setSubjects(data);
        if (data.length > 0) {
          setSelectedSubjectForLessonView(data[0].subjectName);
          setSelectedSubjectForQuizAverage(data[0].subjectName);
          setSelectedSubjectForBattleAverage(data[0].subjectName);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách môn học:", error);
      } finally {
        setLoading(false); // Kết thúc tải
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!accessToken) {
        console.error("Access token is missing");
        return;
      }
      setLoading(true);
      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        };

        const [userRes, subjectRes, gradeRes, lessonRes] = await Promise.all([
          fetch("http://localhost:8080/api/users", { headers }),
          fetch("http://localhost:8080/api/subjects", { headers }),
          fetch("http://localhost:8080/api/grades", { headers }),
          fetch("http://localhost:8080/api/lessons?page&size", { headers }),
        ]);

        const userData = await userRes.json();
        const subjectData = await subjectRes.json();
        const gradeData = await gradeRes.json();
        const lessonData = await lessonRes.json();

        setSummaryData([
          {
            title: "Tài khoản hiện có",
            label: "Tài khoản",
            value: userData.data.length,
            Icon: PeopleAltIcon,
            bgColor: "#D0ECFE",
            bgColorIcon: "#FFFFFF",
            iconColor: "#1877F2",
            textColor: "#0C44AE",
          },
          {
            title: "Môn học hiện có",
            label: "Môn học",
            value: subjectData.data.totalItems,
            Icon: SubjectIcon,
            bgColor: "#EFD6FF",
            bgColorIcon: "#FFFFFF",
            iconColor: "#8E33FF",
            textColor: "#5119B7",
          },
          {
            title: "Lớp học hiện có",
            label: "Lớp học",
            value: gradeData.data.grades.length,
            Icon: ClassIcon,
            bgColor: "#FFF5CC",
            bgColorIcon: "#FFFFFF",
            iconColor: "#FFAB00",
            textColor: "#D79102",
          },
          {
            title: "Bài học hiện có",
            label: "Bài học",
            value: lessonData.data.totalItems,
            Icon: PlayLessonIcon,
            bgColor: "#FFE9D5",
            bgColorIcon: "#FFFFFF",
            iconColor: "#FD9058",
            textColor: "#B76E00",
          },
        ]);
      } catch (error) {
        console.error("Error fetching summary:", error);
      } finally {
        setLoading(false); // Kết thúc tải
      }
    };

    fetchSummary();
  }, [accessToken]);

  // useEffect(() => {
  //   const fetchQuizAverageData = async () => {
  //     if (!accessToken || !selectedSubjectForQuizAverage) return;
  //     setLoading(true);
  //     try {
  //       const res = await fetch(
  //         `http://localhost:8080/api/statistics/admin/quiz-average-by-month?date=${currentMonth}-${currentYear}&subject=${selectedSubjectForQuizAverage}`,
  //         {
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${accessToken}`,
  //           },
  //         }
  //       );

  //       const data = await res.json();
  //       if (data.status === 200) {
  //         const chartData = Object.keys(data.data).map((date) => ({
  //           date,
  //           averages: data.data[date],
  //         }));
  //         setQuizAverageData(chartData);
  //       } else {
  //         console.error("Lỗi khi lấy quiz average:", data.message);
  //       }
  //     } catch (err) {
  //       console.error("Error fetching quiz averages:", err);
  //     } finally {
  //       setLoading(false); // Kết thúc tải
  //     }
  //   };

  //   fetchQuizAverageData();
  // }, [accessToken, selectedSubjectForQuizAverage]);
  // useEffect(() => {
  //   const fetchBattleAverageData = async () => {
  //     if (!accessToken || !selectedSubjectForBattleAverage) return;
  //     setLoading(true);
  //     try {
  //       const res = await fetch(
  //         `http://localhost:8080/api/statistics/admin/battle-average-by-month?date=${currentMonth}-${currentYear}&subject=${selectedSubjectForBattleAverage}`,
  //         {
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${accessToken}`,
  //           },
  //         }
  //       );

  //       const data = await res.json();
  //       if (data.status === 200) {
  //         const chartData = Object.keys(data.data).map((date) => ({
  //           date,
  //           averages: data.data[date],
  //         }));
  //         setBattleAverageData(chartData);
  //       } else {
  //         console.error("Lỗi khi lấy quiz average:", data.message);
  //       }
  //     } catch (err) {
  //       console.error("Error fetching quiz averages:", err);
  //     } finally {
  //       setLoading(false); // Kết thúc tải
  //     }
  //   };

  //   fetchBattleAverageData();
  // }, [accessToken, selectedSubjectForBattleAverage]); // Thêm dependency selectedSubjectForQuizAverage
  // useEffect(() => {
  //   const fetchLessonViewData = async () => {
  //     if (!accessToken || !selectedSubjectForLessonView) return;
  //     setLoading(true);
  //     try {
  //       const res = await fetch(
  //         `http://localhost:8080/api/statistics/admin/record-lesson-by-month?date=${currentMonth}-${currentYear}&subject=${selectedSubjectForLessonView}`,
  //         {
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${accessToken}`,
  //           },
  //         }
  //       );

  //       const data = await res.json();
  //       if (data.status === 200) {
  //         const chartData = Object.keys(data.data).map((date) => ({
  //           date,
  //           ...data.data[date],
  //         }));
  //         setLessonViewData(chartData);
  //       } else {
  //         console.error("Lỗi khi lấy lesson view:", data.message);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching lesson view data:", error);
  //     } finally {
  //       setLoading(false); // Kết thúc tải
  //     }
  //   };

  //   fetchLessonViewData();
  // }, [accessToken, selectedSubjectForLessonView]);
  useEffect(() => {
    const fetchAllChartData = async () => {
      if (
        !accessToken ||
        !selectedSubjectForLessonView ||
        !selectedSubjectForQuizAverage ||
        !selectedSubjectForBattleAverage
      )
        return;

      setLoading(true);
      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        };

        const [lessonRes, quizRes, battleRes] = await Promise.all([
          fetch(
            `http://localhost:8080/api/statistics/admin/record-lesson-by-month?date=${currentMonth}-${currentYear}&subject=${selectedSubjectForLessonView}`,
            { headers }
          ),
          fetch(
            `http://localhost:8080/api/statistics/admin/quiz-average-by-month?date=${currentMonth}-${currentYear}&subject=${selectedSubjectForQuizAverage}`,
            { headers }
          ),
          fetch(
            `http://localhost:8080/api/statistics/admin/battle-average-by-month?date=${currentMonth}-${currentYear}&subject=${selectedSubjectForBattleAverage}`,
            { headers }
          ),
        ]);

        const lessonData = await lessonRes.json();
        const quizData = await quizRes.json();
        const battleData = await battleRes.json();

        if (lessonData.status === 200) {
          const lessonChart = Object.keys(lessonData.data).map((date) => ({
            date,
            ...lessonData.data[date],
          }));
          setLessonViewData(lessonChart);
        }

        if (quizData.status === 200) {
          const quizChart = Object.keys(quizData.data).map((date) => ({
            date,
            averages: quizData.data[date],
          }));
          setQuizAverageData(quizChart);
        }

        if (battleData.status === 200) {
          const battleChart = Object.keys(battleData.data).map((date) => ({
            date,
            averages: battleData.data[date],
          }));
          setBattleAverageData(battleChart);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu tổng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllChartData();
  }, [
    accessToken,
    selectedSubjectForLessonView,
    selectedSubjectForQuizAverage,
    selectedSubjectForBattleAverage,
  ]);

  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          padding: "0 10px",
          gap: 2,
          backgroundColor: "#F4F5F9",
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

        <Grid container spacing={2}>
          {summaryData.map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatCard {...item} />
            </Grid>
          ))}
        </Grid>

        <Card sx={{ my: 1, flexGrow: 1, borderRadius: 2, boxShadow: 3 }}>
          <LessonViewsBarChart
            data={lessonViewData}
            month={currentMonth}
            year={currentYear}
            selectedSubject={selectedSubjectForLessonView}
            setSelectedSubject={setSelectedSubjectForLessonView}
            subjects={subjects}
            loading={loading}
          />
        </Card>
        <Box sx={{ display: "flex", flex: 1, gap: 2 }}>
          <Card
            sx={{
              my: 1,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              padding: 3,
              boxShadow: 3,
              flex: 1,
            }}
          >
            <Typography fontWeight={600} fontSize="20px">
              Tỉ lệ phần trăm làm bài quiz theo từng lớp
            </Typography>
            <QuizStatisticsChart />
          </Card>
          <Card
            sx={{
              my: 1,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              padding: 3,
              boxShadow: 3,
              flex: 1,
            }}
          >
            <Typography fontWeight={600} fontSize="20px">
              Tỉ lệ phần trăm học sinh tham gia đấu trường
            </Typography>
            <BattleStatisticsChart />
          </Card>
        </Box>
        <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
          <Card sx={{ my: 1, flex: 1, borderRadius: 2, boxShadow: 3 }}>
            <QuizAverageBarChart
              data={quizAverageData}
              month={currentMonth}
              year={currentYear}
              selectedSubject={selectedSubjectForQuizAverage}
              setSelectedSubject={setSelectedSubjectForQuizAverage}
              subjects1={subjects}
              type={"quiz"}
            />
          </Card>
          <Card sx={{ my: 1, flex: 1, borderRadius: 2, boxShadow: 3 }}>
            <QuizAverageBarChart
              data={battleAverageData}
              month={currentMonth}
              year={currentYear}
              selectedSubject={selectedSubjectForBattleAverage}
              setSelectedSubject={setSelectedSubjectForBattleAverage}
              subjects1={subjects}
              type={"arena"}
            />
          </Card>
        </Box>
        <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
          <Card sx={{ my: 1, flex: 1, borderRadius: 2, boxShadow: 3 }}>
            <QuizScoreChart />
          </Card>
          <Card sx={{ my: 1, flex: 1, borderRadius: 2, boxShadow: 3 }}>
            <BattleScoreChart />
          </Card>
        </Box>
      </Box>
    </Layout>
  );
};

export default DashboardPage;
