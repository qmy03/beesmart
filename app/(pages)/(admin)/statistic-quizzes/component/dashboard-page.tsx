import { Box, Card, Grid, Typography } from "@mui/material";
import TextField from "@/app/components/textfield";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/AuthContext";
import QuizViewsBarChart from "../../dashboard/component/quiz-view-bar-chart";
import apiService from "@/app/untils/api";
import Layout from "@/app/components/admin/layout";
import QuizAverageBarChart from "../../dashboard/component/quiz-average-bar-chart";

interface SummaryDataItem {
  title: string;
  value: any;
  Icon: React.ComponentType;
  bgColor: string;
  bgColorIcon: string;
  iconColor: string;
  textColor: string;
}

const StatisticQuizzesPage = () => {
  const [lessonViewData, setLessonViewData] = useState<
    { date: string; views: number }[]
  >([]);
  const [summaryData, setSummaryData] = useState<SummaryDataItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${new Date().getMonth() + 1}`
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    `${new Date().getFullYear()}`
  );
  const { accessToken } = useAuth();
  const [quizAverageData, setQuizAverageData] = useState<
    { date: string; averages: { [key: string]: number } }[]
  >([]);

  useEffect(() => {
    const fetchQuizAverageData = async () => {
      try {
        if (accessToken) {
          const date = `${selectedMonth.padStart(2, "0")}-${selectedYear}`;
          const averageResponse = await fetch(
            `http://localhost:8080/api/statistics/admin/quiz-average-by-month?date=${date}`,
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
              return {
                date,
                averages,
              };
            });
            setQuizAverageData(chartData);
          }
        } else {
          console.error("Access token is missing");
        }
      } catch (error) {
        console.error("Error fetching average data:", error);
      }
    };

    fetchQuizAverageData();
  }, [accessToken, selectedMonth, selectedYear]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (accessToken) {
          const date = `${selectedMonth.padStart(2, "0")}-${selectedYear}`; // Format the date to mm-yyyy
          const lessonResponse = await fetch(
            `http://localhost:8080/api/statistics/admin/quiz-by-month?date=${date}`,
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
                ...dayData,
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

    fetchData();
  }, [accessToken, selectedMonth, selectedYear]);

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
            Thống kê Quiz
          </Typography>
        </Box>

        {/* Date picker for selecting month and year */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            margin: "0 0 32px 0",
            flexDirection: "column",
          }}
        >
          <TextField
            type="month"
            value={`${selectedYear}-${selectedMonth.padStart(2, "0")}`} // Format to yyyy-mm
            onChange={(e) => {
              const [year, month] = e.target.value.split("-");
              setSelectedMonth(month);
              setSelectedYear(year);
            }}
            label="Chọn tháng và năm"
            sx={{ flexGrow: 1 }}
          />
          <QuizViewsBarChart
            data={lessonViewData}
            month={Number(selectedMonth)}
            year={Number(selectedYear)}
          />
          <QuizAverageBarChart
            data={quizAverageData}
            month={Number(selectedMonth)}
            year={Number(selectedYear)}
          />
        </Box>

        {/* Displaying the lesson view chart */}
      </Box>
    </Layout>
  );
};

export default StatisticQuizzesPage;
