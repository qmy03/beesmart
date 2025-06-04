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

interface Subject {
  subjectId: string;
  subjectName: string;
}

const StatisticQuizzesPage = () => {
  const accessToken = localStorage.getItem("accessToken");
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
  const [quizAverageData, setQuizAverageData] = useState<
    { date: string; averages: { [key: string]: number } }[]
  >([]);
  // Tạo state riêng biệt cho từng component
  const [selectedSubjectForQuizView, setSelectedSubjectForQuizView] =
    useState<string>("");
  const [selectedSubjectForQuizAverage, setSelectedSubjectForQuizAverage] =
    useState<string>("");
  const [subjects, setSubjects] = useState<
    { subjectId: string; subjectName: string }[]
  >([]);

  useEffect(() => {
    const fetchSubjects = async () => {
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
          // Khởi tạo cả hai state với môn học đầu tiên
          setSelectedSubjectForQuizView(data[0].subjectName);
          setSelectedSubjectForQuizAverage(data[0].subjectName);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách môn học:", error);
      }
    };
    fetchSubjects();
  }, []);
  useEffect(() => {
    const fetchQuizAverageData = async () => {
      if (!accessToken || !selectedSubjectForQuizAverage) return;
      try {
        if (accessToken) {
          const date = `${selectedMonth.padStart(2, "0")}-${selectedYear}`;
          const averageResponse = await fetch(
            `http://localhost:8080/api/statistics/admin/quiz-average-by-month?date=${date}&subject=${selectedSubjectForQuizAverage}`,
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
  }, [accessToken, selectedMonth, selectedYear, selectedSubjectForQuizAverage]);
  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken || !selectedSubjectForQuizView) return;
      try {
        if (accessToken) {
          const date = `${selectedMonth.padStart(2, "0")}-${selectedYear}`; // Format the date to mm-yyyy
          const lessonResponse = await fetch(
            `http://localhost:8080/api/statistics/admin/quiz-by-month?date=${date}&subject=${selectedSubjectForQuizView}`,
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
  }, [accessToken, selectedMonth, selectedYear, selectedSubjectForQuizView]);

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
          />
        </Box>

        {/* Displaying the lesson view chart */}
      </Box>
    </Layout>
  );
};

export default StatisticQuizzesPage;
