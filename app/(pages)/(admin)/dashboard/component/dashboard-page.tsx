// import Layout from "@/app/components/admin/layout";
// import { Box, Card, Grid, Typography } from "@mui/material";
// import StatCard from "./stat-card";
// import SessionsChart from "./session-chart";
// import { mathSessionData } from "../data/math-session-data";
// import LessonViewsBarChart from "./lesson-view-bar-chart";
// import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
// import ClassIcon from "@mui/icons-material/Class";
// import PlayLessonIcon from "@mui/icons-material/PlayLesson";
// import { use, useEffect, useState } from "react";
// import { useAuth } from "@/app/hooks/AuthContext";
// import apiService from "@/app/untils/api";
// import QuizStatisticsChart from "./quiz-statistics-chart";
// import QuizAverageBarChart from "./quiz-average-bar-chart";
// import { SvgIconComponent } from "@mui/icons-material";
// import SubjectIcon from "@mui/icons-material/Subject";
// interface SummaryDataItem {
//   title: string;
//   value: any;
//   Icon: SvgIconComponent;
//   bgColor: string;
//   bgColorIcon: string;
//   iconColor: string;
//   textColor: string;
//   label: string;
// }

// const DashboardPage = () => {
//   const accessToken = localStorage.getItem("accessToken");
//   const [lessonViewData, setLessonViewData] = useState<
//     { date: string; views: number }[]
//   >([]);
//   const [quizAverageData, setQuizAverageData] = useState<
//     { date: string; averages: { [key: string]: number } }[]
//   >([]);
//   const [summaryData, setSummaryData] = useState<SummaryDataItem[]>([]);
//   useEffect(() => {
//     console.log("Access Token:", accessToken);
//     if (accessToken) {
//     } else {
//       console.error("Access token is missing");
//     }
//   }, [accessToken]);
//   const currentMonth = new Date().getMonth() + 1;
//   const currentYear = new Date().getFullYear();
//   const [selectedSubject, setSelectedSubject] = useState<string>("Toán");
//   const [subjects, setSubjects] = useState<
//     { subjectId: string; subjectName: string }[]
//   >([]);

//   useEffect(() => {
//     const fetchSubjects = async () => {
//       try {
//         const response = await apiService.get("/subjects");
//         const data = response.data?.data?.subjects || [];
//         console.log("Danh sách môn học:", data);
//         setSubjects(data);

//         if (data.length > 0 && !selectedSubject) {
//           setSelectedSubject(data[0].subjectName);
//         }
//       } catch (error) {
//         console.error("Lỗi khi lấy danh sách môn học:", error);
//       }
//     };

//     fetchSubjects();
//   }, []);
//   useEffect(() => {
//     if (
//       subjects.length > 0 &&
//       !subjects.find((s) => s.subjectName === selectedSubject)
//     ) {
//       setSelectedSubject(subjects[0].subjectName); // Gán lại giá trị hợp lệ
//     }
//   }, [subjects]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         if (accessToken) {
//           const userResponse = await fetch("http://localhost:8080/api/users", {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${accessToken}`,
//             },
//           });

//           const userData = await userResponse.json();
//           const totalUsers = userData.data.length;
//           const subjectResponse = await fetch(
//             "http://localhost:8080/api/subjects"
//           );
//           const subjectData = await subjectResponse.json();
//           const totalSubjects = subjectData.data.totalItems;

//           const gradeResponse = await fetch("http://localhost:8080/api/grades");
//           const gradeData = await gradeResponse.json();
//           const totalGrades = gradeData.data.grades.length;

//           const lessonResponse = await fetch(
//             "http://localhost:8080/api/lessons?page&size"
//           );
//           const lessonData = await lessonResponse.json();
//           const totalLessons = lessonData.data.totalItems;

//           setSummaryData([
//             {
//               title: "Tài khoản hiện có",
//               label: "Tài khoản",
//               value: totalUsers,
//               Icon: PeopleAltIcon,
//               bgColor: "#D0ECFE",
//               bgColorIcon: "#FFFFFF",
//               iconColor: "#1877F2",
//               textColor: "#0C44AE",
//             },
//             {
//               title: "Môn học hiện có",
//               label: "Môn học",
//               value: totalSubjects,
//               Icon: SubjectIcon,
//               bgColor: "#EFD6FF",
//               bgColorIcon: "#FFFFFF",
//               iconColor: "#8E33FF",
//               textColor: "#5119B7",
//             },
//             {
//               title: "Lớp học hiện có",
//               label: "Lớp học",
//               value: totalGrades,
//               Icon: ClassIcon,
//               bgColor: "#FFF5CC",
//               bgColorIcon: "#FFFFFF",
//               iconColor: "#FFAB00",
//               textColor: "#D79102",
//             },
//             {
//               title: "Bài học hiện có",
//               label: "Bài học",
//               value: totalLessons,
//               Icon: PlayLessonIcon,
//               bgColor: "#FFE9D5",
//               bgColorIcon: "#FFFFFF",
//               iconColor: "#FD9058",
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
//   }, [accessToken]);

//   useEffect(() => {
//     const fetchQuizAverageData = async () => {
//       try {
//         if (accessToken) {
//           const averageResponse = await fetch(
//             `http://localhost:8080/api/statistics/admin/quiz-average-by-month?date=${currentMonth}-${currentYear}`,
//             {
//               method: "GET",
//               headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${accessToken}`,
//               },
//             }
//           );
//           const averageData = await averageResponse.json();
//           if (averageData.status === 200) {
//             const chartData = Object.keys(averageData.data).map((date) => {
//               const averages = averageData.data[date];
//               return { date, averages };
//             });
//             setQuizAverageData(chartData);
//           } else {
//             console.error("Failed to fetch data:", averageData.message);
//           }
//         } else {
//           console.error("Access token is missing");
//         }
//       } catch (error) {
//         console.error("Error fetching average data:", error);
//       }
//     };

//     fetchQuizAverageData();
//   }, [accessToken]);
//   useEffect(() => {
//     const fetchDataRecord = async () => {
//       try {
//         console.log("Selected Subject:", selectedSubject);
//         if (accessToken) {
//           const lessonResponse = await fetch(
//             `http://localhost:8080/api/statistics/admin/record-lesson-by-month?date=${currentMonth}-${currentYear}&subject=${selectedSubject}`,
//             {
//               method: "GET",
//               headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${accessToken}`,
//               },
//             }
//           );
//           console.log("DATA Response:", lessonResponse);
//           const lessonData = await lessonResponse.json();
//           if (lessonData.status === 200) {
//             const chartData = Object.keys(lessonData.data).map((date) => {
//               const dayData = lessonData.data[date];
//               return {
//                 date,
//                 ...dayData,
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

//     fetchDataRecord();
//   }, [accessToken, selectedSubject]);

//   return (
//     <Layout>
//       <Box
//         sx={{
//           display: "flex",
//           flexDirection: "column",
//           padding: "0 10px",
//           gap: 2,
//           backgroundColor: "#F4F5F9",
//         }}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             padding: "12px",
//             alignItems: "center",
//             boxShadow: 4,
//             borderRadius: "8px",
//             backgroundColor: "#FFFFFF",
//           }}
//         >
//           <Typography fontWeight={700} flexGrow={1}>
//             Tổng quan
//           </Typography>
//         </Box>

//         <Grid container spacing={2}>
//           {summaryData.map((item, index) => (
//             <Grid item xs={12} sm={6} md={3} key={index}>
//               <StatCard
//                 title={item.title}
//                 value={item.value}
//                 label={item.label}
//                 Icon={item.Icon}
//                 bgColor={item.bgColor}
//                 bgColorIcon={item.bgColorIcon}
//                 iconColor={item.iconColor}
//                 textColor={item.textColor}
//               />
//             </Grid>
//           ))}
//         </Grid>

//         <Card
//           sx={{
//             display: "flex",
//             marginY: 2,
//             flexGrow: 1,
//             borderRadius: 2,
//             boxShadow: 3,
//           }}
//         >
//           <LessonViewsBarChart
//             data={lessonViewData}
//             month={currentMonth}
//             year={currentYear}
//             selectedSubject={selectedSubject}
//             setSelectedSubject={setSelectedSubject}
//             subjects={subjects}
//           />
//         </Card>
//         <Box sx={{ display: "flex", marginBottom: 4, gap: 2, flexGrow: 1 }}>
//           <QuizAverageBarChart
//             data={quizAverageData}
//             month={currentMonth}
//             year={currentYear}
//           />
//         </Box>
//         <Card
//           variant="outlined"
//           sx={{
//             marginBottom: 4,
//             borderRadius: 1,
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             padding: 3,
//           }}
//         >
//           <Typography fontWeight={700} fontSize="20px">
//             Tỉ lệ phần trăm làm bài quiz theo từng lớp
//           </Typography>
//           <QuizStatisticsChart />
//         </Card>
//       </Box>
//     </Layout>
//   );
// };

// export default DashboardPage;

import Layout from "@/app/components/admin/layout";
import { Box, Card, Grid, Typography } from "@mui/material";
import StatCard from "./stat-card";
import SessionsChart from "./session-chart"; // Nếu không dùng có thể xóa
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

const DashboardPage = () => {
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

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Tạo state riêng biệt cho từng component
  const [selectedSubjectForLessonView, setSelectedSubjectForLessonView] =
    useState<string>("");
  const [selectedSubjectForQuizAverage, setSelectedSubjectForQuizAverage] =
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
          setSelectedSubjectForQuizAverage(data[0].subjectName);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách môn học:", error);
      }
    };
    fetchSubjects();
  }, []);

  // 3. Fetch Summary Statistics
  useEffect(() => {
    const fetchSummary = async () => {
      if (!accessToken) {
        console.error("Access token is missing");
        return;
      }

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
      }
    };

    fetchSummary();
  }, [accessToken]);

  // 4. Fetch Quiz Average Chart - sử dụng selectedSubjectForQuizAverage
  useEffect(() => {
    const fetchQuizAverageData = async () => {
      if (!accessToken || !selectedSubjectForQuizAverage) return;

      try {
        const res = await fetch(
          `http://localhost:8080/api/statistics/admin/quiz-average-by-month?date=${currentMonth}-${currentYear}&subject=${selectedSubjectForQuizAverage}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await res.json();
        if (data.status === 200) {
          const chartData = Object.keys(data.data).map((date) => ({
            date,
            averages: data.data[date],
          }));
          setQuizAverageData(chartData);
        } else {
          console.error("Lỗi khi lấy quiz average:", data.message);
        }
      } catch (err) {
        console.error("Error fetching quiz averages:", err);
      }
    };

    fetchQuizAverageData();
  }, [accessToken, selectedSubjectForQuizAverage]); // Thêm dependency selectedSubjectForQuizAverage

  // 5. Fetch Lesson View Data - sử dụng selectedSubjectForLessonView
  useEffect(() => {
    const fetchLessonViewData = async () => {
      if (!accessToken || !selectedSubjectForLessonView) return;

      try {
        const res = await fetch(
          `http://localhost:8080/api/statistics/admin/record-lesson-by-month?date=${currentMonth}-${currentYear}&subject=${selectedSubjectForLessonView}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await res.json();
        if (data.status === 200) {
          const chartData = Object.keys(data.data).map((date) => ({
            date,
            ...data.data[date],
          }));
          setLessonViewData(chartData);
        } else {
          console.error("Lỗi khi lấy lesson view:", data.message);
        }
      } catch (error) {
        console.error("Error fetching lesson view data:", error);
      }
    };

    fetchLessonViewData();
  }, [accessToken, selectedSubjectForLessonView]);

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
          />
        </Card>

        <Card sx={{ my: 1, flexGrow: 1, borderRadius: 2, boxShadow: 3 }}>
          <QuizAverageBarChart
            data={quizAverageData}
            month={currentMonth}
            year={currentYear}
            selectedSubject={selectedSubjectForQuizAverage}
            setSelectedSubject={setSelectedSubjectForQuizAverage}
            subjects1={subjects}
          />
        </Card>

        <Card
          variant="outlined"
          sx={{
            mb: 4,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 3,
            boxShadow: 3,
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
