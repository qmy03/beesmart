import TextField from "@/app/components/textfield";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/AuthContext";
import LessonViewsBarChart from "../../dashboard/component/lesson-view-bar-chart";
import apiService from "@/app/untils/api";
import Layout from "@/app/components/admin/layout";
import { Box, Card, Typography } from "@mui/material";

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

const StatisticLessonsPage = () => {
  const accessToken = localStorage.getItem("accessToken");
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
  const [subjects, setSubjects] = useState<
    { subjectId: string; subjectName: string }[]
  >([]);
  const [selectedSubjectForLessonView, setSelectedSubjectForLessonView] =
    useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [dateInput, setDateInput] = useState<string>(
    `${selectedMonth.padStart(2, "0")}-${selectedYear}`
  );
  const [error, setError] = useState<string>("");

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
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken, selectedMonth, selectedYear, selectedSubjectForLessonView]);

  // Xử lý khi người dùng thay đổi giá trị trong TextField
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateInput(value);

    // Kiểm tra định dạng "MM-YYYY" (ví dụ: "06-2025")
    const regex = /^(\d{2})-(\d{4})$/;
    const match = value.match(regex);

    if (match) {
      const month = match[1];
      const year = match[2];

      // Kiểm tra tính hợp lệ của tháng và năm
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

  // Cập nhật giá trị hiển thị khi selectedMonth hoặc selectedYear thay đổi
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
          gap: 1,
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
            Thống kê Bài học
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
          <Box
            sx={{
              width: "100%",
              flexGrow: 1,
              borderRadius: 2,
              // border: "none",
            }}
          >
            <LessonViewsBarChart
              data={lessonViewData}
              month={Number(selectedMonth)}
              year={Number(selectedYear)}
              selectedSubject={selectedSubjectForLessonView}
              setSelectedSubject={setSelectedSubjectForLessonView}
              subjects={subjects}
              loading={loading}
            />
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default StatisticLessonsPage;
