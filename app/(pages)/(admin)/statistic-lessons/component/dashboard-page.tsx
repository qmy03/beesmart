import { Box, Card, Grid, Typography } from "@mui/material";
import TextField from "@/app/components/textfield";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/AuthContext";
import LessonViewsBarChart from "../../dashboard/component/lesson-view-bar-chart";
import apiService from "@/app/untils/api";
import Layout from "@/app/components/admin/layout";

interface SummaryDataItem {
  title: string;
  value: any;
  Icon: React.ComponentType;
  bgColor: string;
  bgColorIcon: string;
  iconColor: string;
  textColor: string;
}

const StatisticLessonsPage = () => {
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
  const [subjects, setSubjects] = useState<
    { subjectId: string; subjectName: string }[]
  >([]);
  const [selectedSubjectForLessonView, setSelectedSubjectForLessonView] =
    useState<string>("");
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await apiService.get("/subjects");
        const data = response.data?.data?.subjects || [];
        setSubjects(data);
        if (data.length > 0) {
          // Khởi tạo cả hai state với môn học đầu tiên
          setSelectedSubjectForLessonView(data[0].subjectName);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách môn học:", error);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (accessToken) {
          const date = `${selectedMonth.padStart(2, "0")}-${selectedYear}`;
          const lessonResponse = await fetch(
            `http://localhost:8080/api/statistics/admin/record-lesson-by-month?date=${date}&subject=${selectedSubjectForLessonView}`,
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
  }, [accessToken, selectedMonth, selectedYear, selectedSubjectForLessonView]);

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
            Thống kê Bài học
          </Typography>
        </Box>

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
            value={`${selectedYear}-${selectedMonth.padStart(2, "0")}`}
            onChange={(e) => {
              const [year, month] = e.target.value.split("-");
              setSelectedMonth(month);
              setSelectedYear(year);
            }}
            label="Chọn tháng và năm"
            sx={{ flexGrow: 1 }}
          />
          <LessonViewsBarChart
            data={lessonViewData}
            month={Number(selectedMonth)}
            year={Number(selectedYear)}
            selectedSubject={selectedSubjectForLessonView}
            setSelectedSubject={setSelectedSubjectForLessonView}
            subjects={subjects}
          />
        </Box>
      </Box>
    </Layout>
  );
};

export default StatisticLessonsPage;
