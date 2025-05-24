import Layout from "@/app/components/admin/layout";
import { Box, Card, Grid, Typography } from "@mui/material";
import StatCard from "./stat-card";
import SessionsChart from "./session-chart";
import { mathSessionData } from "../data/math-session-data";
import LessonViewsBarChart from "./lesson-view-bar-chart";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ClassIcon from "@mui/icons-material/Class";
import PlayLessonIcon from "@mui/icons-material/PlayLesson";
import { use, useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/AuthContext";
import apiService from "@/app/untils/api";
import QuizStatisticsChart from "./quiz-statistics-chart";
import QuizAverageBarChart from "./quiz-average-bar-chart";
interface SummaryDataItem {
  title: string;
  value: any;
  Icon: React.ComponentType;
  bgColor: string;
  bgColorIcon: string;
  iconColor: string;
  textColor: string;
}

const DashboardPage = () => {
  // const { accessToken } = useAuth();
  const accessToken = localStorage.getItem("accessToken");
  const [lessonViewData, setLessonViewData] = useState<
    { date: string; views: number }[]
  >([]);
  const [quizAverageData, setQuizAverageData] = useState<
    { date: string; averages: { [key: string]: number } }[]
  >([]);
  const [summaryData, setSummaryData] = useState<SummaryDataItem[]>([]);
  useEffect(() => {
    console.log("Access Token:", accessToken); // Add this line for debugging
    if (accessToken) {
      // API calls go here
    } else {
      console.error("Access token is missing");
    }
  }, [accessToken]);
  const currentMonth = new Date().getMonth() + 1; // getMonth() trả về tháng từ 0-11, do đó cần cộng thêm 1
  const currentYear = new Date().getFullYear(); // Lấy năm hiện tại
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (accessToken) {
          const userResponse = await fetch("http://localhost:8080/api/users", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`, // Thêm accessToken vào header cho API người dùng
            },
          });

          const userData = await userResponse.json();
          const totalUsers = userData.data.length;

          // Fetch total number of classes without accessToken
          const gradeResponse = await fetch("http://localhost:8080/api/grades");
          const gradeData = await gradeResponse.json();
          const totalGrades = gradeData.data.grades.length;

          // Fetch total number of lessons without accessToken
          const lessonResponse = await fetch(
            "http://localhost:8080/api/lessons?page&size"
          );
          const lessonData = await lessonResponse.json();
          const totalLessons = lessonData.data.totalItems;

          // Update summary data
          setSummaryData([
            {
              title: "Tổng số tài khoản hiện có",
              value: totalUsers,
              Icon: PeopleAltIcon,
              bgColor: "#D0ECFE",
              bgColorIcon: "#FFFFFF",
              iconColor: "#1877F2",
              textColor: "#0C44AE",
            },
            {
              title: "Tổng số lớp học",
              value: totalGrades,
              Icon: ClassIcon,
              bgColor: "#EFD6FF",
              bgColorIcon: "#FFFFFF",
              iconColor: "#8E33FF",
              textColor: "#5119B7",
            },
            {
              title: "Tổng số bài học",
              value: totalLessons,
              Icon: PlayLessonIcon,
              bgColor: "#FFF5CC",
              bgColorIcon: "#FFFFFF",
              iconColor: "#FFAB00",
              textColor: "#B76E00",
            },
          ]);
        } else {
          console.error("Access token is missing");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [accessToken]); // Hook sẽ chạy lại mỗi khi accessToken thay đổi

  useEffect(() => {
    const fetchQuizAverageData = async () => {
      try {
        if (accessToken) {
          const averageResponse = await fetch(
            `http://localhost:8080/api/statistics/admin/quiz-average-by-month?date=${currentMonth}-${currentYear}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          const averageData = await averageResponse.json();
          if (averageData.status === 200) {
            const chartData = Object.keys(averageData.data).map((date) => {
              const averages = averageData.data[date];
              return { date, averages };
            });
            setQuizAverageData(chartData);
          } else {
            console.error("Failed to fetch data:", averageData.message);
          }
        } else {
          console.error("Access token is missing");
        }
      } catch (error) {
        console.error("Error fetching average data:", error);
      }
    };

    fetchQuizAverageData();
  }, [accessToken]);
  useEffect(() => {
    const fetchDataRecord = async () => {
      try {
        if (accessToken) {
          const lessonResponse = await fetch(
            `http://localhost:8080/api/statistics/admin/record-lesson-by-month?date=${currentMonth}-${currentYear}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          const lessonData = await lessonResponse.json();
          if (lessonData.status === 200) {
            const chartData = Object.keys(lessonData.data).map((date) => {
              const dayData = lessonData.data[date];
              return {
                date,
                ...dayData, // Lưu từng lớp riêng biệt
              };
            });
            setLessonViewData(chartData);
          }
        } else {
          console.error("Access token is missing");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchDataRecord();
  }, [accessToken]);

  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          padding: "0 10px",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            padding: "12px",
            alignItems: "center",
            boxShadow: 4,
            borderRadius: "8px",
          }}
        >
          <Typography fontWeight={700} flexGrow={1}>
            Tổng quan
          </Typography>
        </Box>

        {/* Display StatCards */}
        <Grid container spacing={3}>
          {summaryData.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <StatCard
                title={item.title}
                value={item.value}
                Icon={item.Icon}
                bgColor={item.bgColor}
                bgColorIcon={item.bgColorIcon}
                iconColor={item.iconColor}
                textColor={item.textColor}
              />
            </Grid>
          ))}
        </Grid>

        {/* Add SessionsChart */}
        <Box sx={{ display: "flex", marginY: 4, gap: 2, flexGrow: 1 }}>
          <LessonViewsBarChart
            data={lessonViewData}
            month={currentMonth}
            year={currentYear}
          />
        </Box>
        <Box sx={{ display: "flex", marginBottom: 4, gap: 2, flexGrow: 1 }}>
          <QuizAverageBarChart
            data={quizAverageData}
            month={currentMonth}
            year={currentYear}
          />
        </Box>
        <Card
          variant="outlined"
          sx={{
            marginBottom: 4,
            borderRadius: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 3,
          }}
        >
          <Typography fontWeight={700} fontSize="20px">
            Tỉ lệ phần trăm làm bài quiz theo từng lớp
          </Typography>
          <QuizStatisticsChart />
        </Card>
      </Box>
    </Layout>
  );
};

export default DashboardPage;
