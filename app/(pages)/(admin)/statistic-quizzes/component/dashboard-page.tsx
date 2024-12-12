// import Layout from "@/app/components/admin/layout";
// import { Box, Card, Grid, Typography } from "@mui/material";
// // import StatCard from "./stat-card";
// // import SessionsChart from "./session-chart";
// // import { mathSessionData } from "../data/math-session-data";
// import LessonViewsBarChart from "../../dashboard/component/lesson-view-bar-chart";
// import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
// import ClassIcon from "@mui/icons-material/Class";
// import PlayLessonIcon from "@mui/icons-material/PlayLesson";
// import { useEffect, useState } from "react";
// import { useAuth } from "@/app/hooks/AuthContext";
// import apiService from "@/app/untils/api";
// import TextField from "@/app/components/textfield";
// // import QuizStatisticsChart from "./quiz-statistics-chart";
// interface SummaryDataItem {
//   title: string;
//   value: any;
//   Icon: React.ComponentType;
//   bgColor: string;
//   bgColorIcon: string;
//   iconColor: string;
//   textColor: string;
// }

// const StatisticLessonsPage = () => {
//   const [lessonViewData, setLessonViewData] = useState<
//     { date: string; views: number }[]
//   >([]);
//   const [summaryData, setSummaryData] = useState<SummaryDataItem[]>([]);
//   const { accessToken } = useAuth(); // Lấy accessToken từ context hoặc nơi lưu trữ
//   const currentMonth = new Date().getMonth() + 1; // getMonth() trả về tháng từ 0-11, do đó cần cộng thêm 1
//   const currentYear = new Date().getFullYear(); // Lấy năm hiện tại
//   // useEffect(() => {
//   //   const fetchData = async () => {
//   //     try {
//   //       if (accessToken) {
//   //         const lessonResponse = await fetch(`http://localhost:8080/api/statistics/admin/record-lesson-by-month?date=${currentMonth}-${currentYear}`, {
//   //           method: "GET",
//   //           headers: {
//   //             "Content-Type": "application/json",
//   //             Authorization: `Bearer ${accessToken}`,
//   //           },
//   //         });
//   //         const lessonData = await lessonResponse.json();
//   //         if (lessonData.status === 200) {
//   //           const chartData = Object.keys(lessonData.data).map(date => {
//   //             const views = Object.values(lessonData.data[date]);
//   //             return { date, views: views.reduce((acc, view) => acc + view, 0) }; // Tổng lượt truy cập trong ngày
//   //           });
//   //           setLessonViewData(chartData);
//   //         }
//   //       } else {
//   //         console.error("Access token is missing");
//   //       }
//   //     } catch (error) {
//   //       console.error("Error fetching data:", error);
//   //     }
//   //   };

//   //   fetchData();
//   // }, [accessToken]);
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         if (accessToken) {
//           const lessonResponse = await fetch(
//             `http://localhost:8080/api/statistics/admin/record-lesson-by-month?date=${currentMonth}-${currentYear}`,
//             {
//               method: "GET",
//               headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${accessToken}`,
//               },
//             }
//           );
//           const lessonData = await lessonResponse.json();
//           if (lessonData.status === 200) {
//             const chartData = Object.keys(lessonData.data).map((date) => {
//               const dayData = lessonData.data[date];
//               return {
//                 date,
//                 ...dayData, // Lưu từng lớp riêng biệt
//               };
//             });
//             setLessonViewData(chartData);
//           }
//         } else {
//           console.error("Access token is missing");
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };

//     fetchData();
//   }, [accessToken]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         if (accessToken) {
//           // Fetch total number of users with accessToken
//           const userResponse = await fetch("http://localhost:8080/api/users", {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${accessToken}`, // Thêm accessToken vào header cho API người dùng
//             },
//           });
//           const userData = await userResponse.json();
//           const totalUsers = userData.data.length;

//           // Fetch total number of classes without accessToken
//           const gradeResponse = await fetch("http://localhost:8080/api/grades");
//           const gradeData = await gradeResponse.json();
//           const totalGrades = gradeData.length;

//           // Fetch total number of lessons without accessToken
//           const lessonResponse = await fetch(
//             "http://localhost:8080/api/lessons?page&size"
//           );
//           const lessonData = await lessonResponse.json();
//           const totalLessons = lessonData.data.totalItems;

//           // Update summary data
//           setSummaryData([
//             {
//               title: "Tổng số tài khoản hiện có",
//               value: totalUsers,
//               Icon: PeopleAltIcon,
//               bgColor: "#D0ECFE",
//               bgColorIcon: "#FFFFFF",
//               iconColor: "#1877F2",
//               textColor: "#0C44AE",
//             },
//             {
//               title: "Tổng số lớp học",
//               value: totalGrades,
//               Icon: ClassIcon,
//               bgColor: "#EFD6FF",
//               bgColorIcon: "#FFFFFF",
//               iconColor: "#8E33FF",
//               textColor: "#5119B7",
//             },
//             {
//               title: "Tổng số bài học",
//               value: totalLessons,
//               Icon: PlayLessonIcon,
//               bgColor: "#FFF5CC",
//               bgColorIcon: "#FFFFFF",
//               iconColor: "#FFAB00",
//               textColor: "#B76E00",
//             },
//           ]);
//         } else {
//           console.error("Access token is missing");
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };

//     fetchData();
//   }, [accessToken]); // Hook sẽ chạy lại mỗi khi accessToken thay đổi

//   return (
//     <Layout>
//       <Box
//         sx={{
//           display: "flex",
//           flexDirection: "column",
//           padding: "0 10px",
//           gap: 2,
//         }}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             padding: "12px",
//             alignItems: "center",
//             boxShadow: 4,
//             borderRadius: "8px",
//           }}
//         >
//           <Typography fontWeight={700} flexGrow={1}>
//             Thống kê Bài học
//           </Typography>
//         </Box>

//         <Box sx={{ display: "flex", flexDirection: "column", marginY: 4, gap: 2, flexGrow: 1 }}>
//           <TextField
//           type="month"
//           ></TextField>
//           <LessonViewsBarChart
//             data={lessonViewData}
//             month={currentMonth}
//             year={currentYear}
//           />
//         </Box>
//       </Box>
//     </Layout>
//   );
// };

// export default StatisticLessonsPage;
import { Box, Card, Grid, Typography } from "@mui/material";
import TextField from "@/app/components/textfield";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/AuthContext";
import QuizViewsBarChart from "../../dashboard/component/quiz-view-bar-chart";
import apiService from "@/app/untils/api";
import Layout from "@/app/components/admin/layout";
import QuizAverageBarChart from "../../dashboard/component/quiz-average-bar-chart";

// Define the type of the data you want to display
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
  ); // Default to current month
  const [selectedYear, setSelectedYear] = useState<string>(
    `${new Date().getFullYear()}`
  ); // Default to current year
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
  // Fetch lesson data when the selected month or year changes
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
  }, [accessToken, selectedMonth, selectedYear]); // Dependency array includes selectedMonth and selectedYear

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
            month={selectedMonth}
            year={selectedYear}
          />
          <QuizAverageBarChart
            data={quizAverageData}
            month={selectedMonth}
            year={selectedYear}
          />
        </Box>

        {/* Displaying the lesson view chart */}
      </Box>
    </Layout>
  );
};

export default StatisticQuizzesPage;
