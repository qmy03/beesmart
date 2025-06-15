// import React, { useEffect, useState } from "react";
// import Layout from "@/app/components/user/Home/layout";
// import {
//   Box,
//   CssBaseline,
//   MenuItem,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TablePagination,
//   TableRow,
//   Typography,
// } from "@mui/material";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/app/hooks/AuthContext";
// import apiService from "@/app/untils/api";
// import AccountCircleIcon from "@mui/icons-material/AccountCircle";
// import TextField from "@/app/components/textfield";
// interface ApiResponse<T> {
//   status: number;
//   data: T;
// }

// interface GradeData {
//   grades: { gradeId: string; gradeName: string }[];
// }

// interface Student {
//   userId: string;
//   fullName: string;
//   username: string;
//   grade?: string;
// }

// interface QuizRecord {
//   quizId: string;
//   timeSpent: number;
// }

// interface QuizRecordsResponse {
//   quizRecords: QuizRecord[];
//   totalItems: number;
// }

// const DashboardReportPage: React.FC = () => {
//   const { accessToken, userInfo } = useAuth();
//   console.log("userInfo", userInfo?.userId);
//   const router = useRouter();
//   const [students, setStudents] = useState<any[]>([]);
//   const [startDate, setStartDate] = useState<string>("");
//   const [endDate, setEndDate] = useState<string>("");
//   const [studentStats, setStudentStats] = useState<any>(null);
//   const [grades, setGrades] = useState<any[]>([]);
//   const [selectedGrade, setSelectedGrade] = useState<string>("");
//   const [activeStudent, setActiveStudent] = useState<any>(null);
//   const [daysDifference, setDaysDifference] = useState<number>(0);
//   const [quizRecords, setQuizRecords] = useState<any[]>([]);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [totalItems, setTotalItems] = useState(0);
//   useEffect(() => {
//     const today = new Date();
//     const sevenDaysAgo = new Date(today);
//     sevenDaysAgo.setDate(today.getDate() - 7);

//     const formatDate = (date: Date) =>
//       `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

//     setStartDate(formatDate(sevenDaysAgo));
//     setEndDate(formatDate(today));
//   }, []);

//   useEffect(() => {
//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       const end = new Date(endDate);
//       const timeDiff = end.getTime() - start.getTime();
//       const daysDiff = timeDiff / (1000 * 3600 * 24);
//       setDaysDifference(daysDiff);
//     }
//   }, [startDate, endDate]);

//   useEffect(() => {
//     if (accessToken) {
//       apiService
//         .get<ApiResponse<GradeData>>("/grades")
//         .then((response) => {
//           if (response.data && response.data.status === 200) {
//             setGrades(response.data.data.grades);
//           }
//         })
//         .catch((error) => {
//           console.error("Error fetching grades:", error);
//         });
//     }
//   }, [accessToken]);

//   useEffect(() => {
//     if (accessToken) {
//       if (userInfo?.role === "PARENT") {
//         apiService
//           .get<ApiResponse<Student[]>>("/users/parent/students", {
//             headers: { Authorization: `Bearer ${accessToken}` },
//           })
//           .then((response) => {
//             if (response.data && response.data.status === 200) {
//               setStudents(response.data.data);
//               setActiveStudent(response.data.data[0]);
//             }
//           })
//           .catch((error) => {
//             console.error("Error fetching students:", error);
//           });
//       } else {
//         setActiveStudent({ userId: userInfo?.userId });
//       }
//     }
//   }, [accessToken, userInfo?.role, userInfo?.userId]);

//   const formatDateForBackend = (date: string) => {
//     const [year, month, day] = date.split("-");
//     return `${day}-${month}-${year}`;
//   };

//   useEffect(() => {
//     if (activeStudent && userInfo?.role === "PARENT") {
//       setSelectedGrade(activeStudent.grade);
//     } else {
//       if (userInfo?.grade) {
//         setSelectedGrade(userInfo?.grade);
//       }
//     }
//   }, [activeStudent]);

//   useEffect(() => {
//     if (activeStudent && startDate && endDate) {
//       const formattedStartDate = formatDateForBackend(startDate);
//       const formattedEndDate = formatDateForBackend(endDate);

//       console.log("formattedStartDate", formattedStartDate);
//       console.log("formattedEndDate", formattedEndDate);

//       apiService
//         .get<ApiResponse<any>>(
//           `/statistics/user/${activeStudent.userId}/aggregate?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
//           {
//             headers: { Authorization: `Bearer ${accessToken}` },
//           }
//         )
//         .then((response) => {
//           if (response.data && response.data.status === 200) {
//             setStudentStats(response.data.data);
//           }
//         })
//         .catch((error) => {
//           console.error("Error fetching student statistics:", error);
//         });
//     }
//   }, [activeStudent, startDate, endDate, accessToken]);
//   const formatTimeSpent = (timeInSeconds: number): string => {
//     const minutes = Math.floor(timeInSeconds / 60);
//     const seconds = timeInSeconds % 60;
//     return `${minutes}' ${seconds}s`;
//   };

//   useEffect(() => {
//     const fetchQuizRecords = async () => {
//       try {
//         const response = await apiService.get<ApiResponse<QuizRecordsResponse>>(
//           `/statistics/user/${activeStudent.userId}/quiz-records?page=${page}`,
//           {
//             headers: { Authorization: `Bearer ${accessToken}` },
//           }
//         );
//         if (response.data?.status === 200) {
//           const formattedRecords = response.data.data.quizRecords.map(
//             (record) => ({
//               ...record,
//               timeSpentFormatted: formatTimeSpent(record.timeSpent),
//             })
//           );

//           setQuizRecords(formattedRecords);
//           setTotalItems(response.data.data.totalItems);
//         }
//       } catch (error) {
//         console.error("Error fetching quiz records:", error);
//       }
//     };

//     if (accessToken && activeStudent) {
//       fetchQuizRecords();
//     }
//   }, [accessToken, activeStudent, page, rowsPerPage]);

//   const handleChangePage = (event: unknown, newPage: number) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };
//   const handleStudentClick = (student: any) => {
//     setActiveStudent(student);
//     setPage(0);
//   };

//   return (
//     <Layout>
//       <CssBaseline />
//       <Box
//         sx={{
//           display: "flex",
//           flexDirection: "column",
//           gap: "20px",
//           backgroundColor: "#EFF3E6",
//           height: "100%",
//         }}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             gap: "20px",
//             alignItems: "center",
//             justifyContent: "center",
//             padding: "40px 80px 0px 80px",
//           }}
//         >
//           <Typography
//             fontSize="16px"
//             color="#000000"
//             fontWeight={700}
//             textAlign="center"
//           >
//             Đánh giá học sinh
//           </Typography>
//           <TextField
//             sx={{ maxWidth: "100px", fontSize: "16px" }}
//             value={selectedGrade}
//             onChange={(e) => setSelectedGrade(e.target.value)}
//             label=""
//             disabled
//           >
//             {grades.map((grade) => (
//               <MenuItem key={grade.gradeId} value={grade.gradeId}>
//                 {grade.gradeName}
//               </MenuItem>
//             ))}
//           </TextField>
//         </Box>
//         {activeStudent && (
//           <Box
//             sx={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <Typography fontSize="32px" fontWeight="bold" color="#99BC4D">
//               {activeStudent.fullName}
//             </Typography>
//           </Box>
//         )}
//         <Box
//           sx={{
//             border: "1px solid #A8A8A8",
//             marginX: "350px",
//             paddingY: "8px",
//             borderRadius: 6,
//             alignItems: "center",
//             backgroundColor: "#99BC4D",
//           }}
//         >
//           <Typography
//             fontSize="20px"
//             color="#000000"
//             fontWeight={700}
//             textAlign="center"
//           >
//             Đánh giá chung
//           </Typography>
//         </Box>

//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           {students.length > 0 ? (
//             students.map((student, index) => (
//               <div
//                 key={index}
//                 style={{
//                   display: "inline-block",
//                   margin: "10px",
//                   cursor: "pointer",
//                   paddingBottom: 4,
//                 }}
//                 onClick={() => handleStudentClick(student)}
//               >
//                 <Box
//                   style={{
//                     width: "80px",
//                     height: "80px",
//                     borderRadius: "50%",
//                     backgroundColor:
//                       student === activeStudent ? "#99BC4D" : "#A8A8A8",
//                     color: "white",
//                     display: "flex",
//                     flexDirection: "column",
//                     justifyContent: "center",
//                     alignItems: "center",
//                     fontWeight: "bold",
//                     gap: 3,
//                   }}
//                 >
//                   <AccountCircleIcon sx={{ borderBottom: "1px solid white" }} />
//                   {student.username}
//                 </Box>
//               </div>
//             ))
//           ) : (
//             <></>
//           )}
//         </Box>

//         {studentStats && (
//           <Box
//             sx={{
//               display: "flex",
//               flexDirection: "column",
//               padding: "0 40px 40px",
//             }}
//           >
//             <Box
//               sx={{
//                 padding: "20px",
//                 border: "1px solid #A8A8A8",
//                 borderRadius: 2,
//                 bgcolor: "#FFFFFF",
//               }}
//             >
//               <Box
//                 sx={{
//                   borderBottom: "1px solid #A8A8A8",
//                   display: "flex",
//                   pb: 2,
//                   alignItems: "center",
//                 }}
//               >
//                 <Typography
//                   fontSize="26px"
//                   color="#99BC4D"
//                   fontWeight={600}
//                   sx={{ flexGrow: 1 }}
//                 >
//                   Trong {daysDifference} ngày qua...
//                 </Typography>
//                 <Box
//                   sx={{
//                     display: "flex",
//                     gap: 2,
//                     justifyContent: "center",
//                     alignItems: "center",
//                   }}
//                 >
//                   Từ
//                   <TextField
//                     type="date"
//                     value={startDate}
//                     onChange={(e) => setStartDate(e.target.value)}
//                     label=""
//                   />
//                   đến
//                   <TextField
//                     type="date"
//                     value={endDate}
//                     onChange={(e) => setEndDate(e.target.value)}
//                     label=""
//                   />
//                 </Box>
//               </Box>
//               <Box
//                 sx={{
//                   paddingY: 4,
//                   borderBottom: "1px solid #A8A8A8",
//                   display: "flex",
//                   gap: 2,
//                   justifyContent: "space-between",
//                 }}
//               >
//                 <Box>
//                   <Box sx={{ display: "flex" }}>
//                     <img src="/icon-quiz.png" width={50} height={50} />
//                     <Typography fontSize="35px">
//                       {studentStats.numberOfQuestionsAnswered}
//                     </Typography>
//                   </Box>
//                   <Typography color="#000000" fontWeight={600} sx={{ pl: 6.5 }}>
//                     Câu hỏi đã trả lời
//                   </Typography>
//                 </Box>
//                 <Box>
//                   <Box sx={{ display: "flex" }}>
//                     <img src="/icon-quiz.png" width={50} height={50} />
//                     <Typography fontSize="35px">
//                       {studentStats.numberOfQuizzesDone}
//                     </Typography>
//                   </Box>
//                   <Typography color="#000000" fontWeight={600} sx={{ pl: 6.5 }}>
//                     Số bài kiểm tra đã làm
//                   </Typography>
//                 </Box>
//                 <Box>
//                   <Box sx={{ display: "flex" }}>
//                     <img src="/icon_clock.png" width={50} height={50} />
//                     <Typography fontSize="35px">
//                       <Typography fontSize="35px">
//                         {studentStats.timeSpentDoingQuizzes
//                           ? formatTimeSpent(studentStats.timeSpentDoingQuizzes)
//                           : "0' 0s"}
//                       </Typography>
//                     </Typography>
//                   </Box>
//                   <Typography color="#000000" fontWeight={600} sx={{ pl: 6.5 }}>
//                     Số phút đã làm bài kiểm tra
//                   </Typography>
//                 </Box>
//               </Box>
//               <Typography
//                 fontSize="20px"
//                 color="#99BC4D"
//                 fontWeight={600}
//                 sx={{ flexGrow: 1, py: 3 }}
//               >
//                 Lịch sử làm bài
//               </Typography>
//               <Box sx={{ height: "70vh", boxShadow: 3, borderRadius: 3 }}>
//                 <TableContainer
//                   sx={{ borderRadius: 3, overflow: "auto", height: "60vh" }}
//                 >
//                   <Table size="small">
//                     <TableHead sx={{ bgcolor: "#FFFBF3" }}>
//                       <TableRow>
//                         <TableCell sx={{ paddingY: "16px" }}>
//                           Tên bài kiểm tra
//                         </TableCell>
//                         <TableCell>Tổng số câu hỏi</TableCell>
//                         <TableCell>Số đáp án đúng</TableCell>
//                         <TableCell>Điểm</TableCell>
//                         <TableCell>Thời gian hoàn thành</TableCell>
//                         <TableCell>Ngày</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {quizRecords && quizRecords.length > 0 ? (
//                         quizRecords.map((record, index) => (
//                           <TableRow key={index}>
//                             <TableCell sx={{ paddingY: "16px" }}>
//                               {record.quizName}
//                             </TableCell>
//                             <TableCell>{record.totalQuestions}</TableCell>
//                             <TableCell>{record.correctAnswers}</TableCell>
//                             <TableCell>{record.points}</TableCell>
//                             <TableCell>{record.timeSpentFormatted}</TableCell>
//                             <TableCell>
//                               {new Date(record.createdAt).toLocaleString()}
//                             </TableCell>
//                           </TableRow>
//                         ))
//                       ) : (
//                         <TableRow>
//                           <TableCell
//                             colSpan={6}
//                             align="center"
//                             sx={{ paddingY: "16px" }}
//                           >
//                             Không có dữ liệu
//                           </TableCell>
//                         </TableRow>
//                       )}
//                     </TableBody>
//                   </Table>
//                 </TableContainer>
//                 <TablePagination
//                   component="div"
//                   count={totalItems}
//                   page={page}
//                   onPageChange={handleChangePage}
//                   rowsPerPage={rowsPerPage}
//                   onRowsPerPageChange={handleChangeRowsPerPage}
//                 />
//               </Box>
//               {/* )} */}
//             </Box>
//           </Box>
//         )}
//       </Box>
//     </Layout>
//   );
// };

// export default DashboardReportPage;
import React, { useEffect, useState } from "react";
import Layout from "@/app/components/user/Home/layout";
import {
  Box,
  CssBaseline,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Link,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/AuthContext";
import apiService from "@/app/untils/api";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import TextField from "@/app/components/textfield";
import Image from "next/image";

interface ApiResponse<T> {
  status: number;
  data: T;
  message: string;
}

interface GradeData {
  grades: { gradeId: string; gradeName: string }[];
}

interface Student {
  userId: string;
  fullName: string;
  username: string;
  grade?: string;
}

interface QuizRecord {
  recordId: string;
  topicName: string;
  lessonName: string;
  quizName: string;
  totalQuestions: number;
  correctAnswers: number;
  points: number;
  timeSpent: number;
  timeSpentFormatted?: string;
  createdAt: string;
}

interface QuizRecordsResponse {
  quizRecords: QuizRecord[];
  totalItems: number;
}

interface Subject {
  subjectId: string;
  subjectName: string;
}

interface SubjectsResponse {
  subjects: Subject[];
  totalItems: number;
}

const DashboardReportPage: React.FC = () => {
  const { accessToken, userInfo } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [studentStats, setStudentStats] = useState<any>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [daysDifference, setDaysDifference] = useState<number>(0);
  const [quizRecords, setQuizRecords] = useState<QuizRecord[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");

  // Initialize date range (last 7 days)
  useEffect(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const formatDate = (date: Date) =>
      `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

    setStartDate(formatDate(sevenDaysAgo));
    setEndDate(formatDate(today));
  }, []);

  // Calculate days difference
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const timeDiff = end.getTime() - start.getTime();
      const daysDiff = timeDiff / (1000 * 3600 * 24);
      setDaysDifference(daysDiff);
    }
  }, [startDate, endDate]);

  // Fetch grades
  useEffect(() => {
    if (accessToken) {
      apiService
        .get<ApiResponse<GradeData>>("/grades")
        .then((response) => {
          if (response.data && response.data.status === 200) {
            setGrades(response.data.data.grades);
          }
        })
        .catch((error) => {
          console.error("Error fetching grades:", error);
        });
    }
  }, [accessToken]);

  // Fetch subjects
  useEffect(() => {
    if (accessToken) {
      apiService
        .get<ApiResponse<SubjectsResponse>>("/subjects")
        .then((response) => {
          if (response.data && response.data.status === 200) {
            setSubjects(response.data.data.subjects);
            // Set the first subject as default if available
            if (response.data.data.subjects.length > 0) {
              setSelectedSubjectId(response.data.data.subjects[0].subjectId);
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching subjects:", error);
        });
    }
  }, [accessToken]);

  // Fetch students (for parent role)
  useEffect(() => {
    if (accessToken) {
      if (userInfo?.role === "PARENT") {
        apiService
          .get<ApiResponse<Student[]>>("/users/parent/students", {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
          .then((response) => {
            if (response.data && response.data.status === 200) {
              setStudents(response.data.data);
              setActiveStudent(response.data.data[0]);
            }
          })
          .catch((error) => {
            console.error("Error fetching students:", error);
          });
      } else {
        setActiveStudent({
          userId: userInfo?.userId,
          username: userInfo?.username,
          fullName: userInfo?.fullName,
        });
      }
    }
  }, [
    accessToken,
    userInfo?.role,
    userInfo?.userId,
    userInfo?.username,
    userInfo?.fullName,
  ]);

  // Set selected grade
  useEffect(() => {
    if (activeStudent && userInfo?.role === "PARENT") {
      setSelectedGrade(activeStudent.grade);
    } else if (userInfo?.grade) {
      setSelectedGrade(userInfo.grade);
    }
  }, [activeStudent, userInfo?.grade, userInfo?.role]);

  // Fetch student statistics
  useEffect(() => {
    if (activeStudent && startDate && endDate) {
      const formattedStartDate = formatDateForBackend(startDate);
      const formattedEndDate = formatDateForBackend(endDate);

      apiService
        .get<ApiResponse<any>>(
          `/statistics/user/${activeStudent.userId}/aggregate?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        )
        .then((response) => {
          if (response.data && response.data.status === 200) {
            setStudentStats(response.data.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching student statistics:", error);
        });
    }
  }, [activeStudent, startDate, endDate, accessToken]);

  // Fetch quiz records
  useEffect(() => {
    const fetchQuizRecords = async () => {
      try {
        // Find the selected subject's name based on selectedSubjectId
        const selectedSubject = subjects.find(
          (subject) => subject.subjectId === selectedSubjectId
        );
        const subjectQuery = selectedSubject
          ? `&subject=${encodeURIComponent(selectedSubject.subjectName)}`
          : "";
        const response = await apiService.get<ApiResponse<QuizRecordsResponse>>(
          `/statistics/user/${activeStudent.userId}/quiz-records?page=${page}&size=${rowsPerPage}${subjectQuery}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (response.data?.status === 200) {
          const formattedRecords = response.data.data.quizRecords.map(
            (record) => ({
              ...record,
              timeSpentFormatted: formatTimeSpent(record.timeSpent),
            })
          );

          setQuizRecords(formattedRecords);
          setTotalItems(response.data.data.totalItems);
        }
      } catch (error) {
        console.error("Error fetching quiz records:", error);
      }
    };

    if (accessToken && activeStudent && selectedSubjectId) {
      fetchQuizRecords();
    }
  }, [
    accessToken,
    activeStudent,
    page,
    rowsPerPage,
    selectedSubjectId,
    subjects,
  ]);

  const formatTimeSpent = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}' ${seconds}s`;
  };

  const formatDateForBackend = (date: string) => {
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStudentClick = (student: Student) => {
    setActiveStudent(student);
    setPage(0);
  };

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubjectId(subject.subjectId);
    setPage(0);
  };

  const getSubjectImage = (subjectName: string) => {
    switch (subjectName) {
      case "Toán":
        return "/math1.png";
      case "Tiếng Việt":
        return "/literature.png";
      case "Tự nhiên và xã hội":
        return "/nature_and_society.png";
      default:
        return "/subject-default.png";
    }
  };

  return (
    <Layout>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          padding: "20px 40px",
          gap: "12px",
          backgroundColor: "#EFF3E6",
          flexGrow: 1,
          height: "100%",
          overflowY: "auto",
        }}
      >
        {/* Subject selection */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {subjects.map((subject) => (
            <Box
              key={subject.subjectId}
              onClick={() => handleSubjectClick(subject)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                backgroundColor:
                  selectedSubjectId === subject.subjectId ? "#FFF" : "#none",
                cursor: "pointer",
                width: "15%",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#E1F5FE",
                },
              }}
            >
              <img
                src={getSubjectImage(subject.subjectName)}
                alt={subject.subjectName}
                width={60}
                height={60}
              />
              <Typography
                fontSize="14px"
                fontWeight={600}
                sx={{ marginTop: "5px", textAlign: "center" }}
              >
                {subject.subjectName}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            fontSize="16px"
            color="#000000"
            fontWeight={700}
            textAlign="center"
          >
            Đánh giá học sinh
          </Typography>
          <TextField
            sx={{ maxWidth: "100px", fontSize: "16px" }}
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            label=""
            disabled
          >
            {grades.map((grade) => (
              <MenuItem key={grade.gradeId} value={grade.gradeId}>
                {grade.gradeName}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        {activeStudent && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography fontSize="32px" fontWeight="bold" color="#99BC4D">
              {activeStudent.fullName}
            </Typography>
          </Box>
        )}
        <Box
          sx={{
            border: "1px solid #A8A8A8",
            marginX: "350px",
            paddingY: "8px",
            borderRadius: 6,
            alignItems: "center",
            backgroundColor: "#99BC4D",
          }}
        >
          <Typography
            fontSize="20px"
            color="#000000"
            fontWeight={700}
            textAlign="center"
          >
            Đánh giá chung
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {students.length > 0 ? (
            students.map((student, index) => (
              <Box
                key={index}
                onClick={() => handleStudentClick(student)}
                sx={{
                  display: "inline-block",
                  margin: "10px",
                  cursor: "pointer",
                  paddingBottom: "4px",
                }}
              >
                <Box
                  sx={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    backgroundColor:
                      student === activeStudent ? "#99BC4D" : "#A8A8A8",
                    color: "white",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: "bold",
                    gap: "3px",
                  }}
                >
                  <AccountCircleIcon sx={{ borderBottom: "1px solid white" }} />
                  {student.username}
                </Box>
              </Box>
            ))
          ) : (
            <></>
          )}
        </Box>
        {studentStats && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              padding: "0 40px 40px",
            }}
          >
            <Box
              sx={{
                padding: "20px",
                border: "1px solid #A8A8A8",
                borderRadius: 2,
                bgcolor: "#FFFFFF",
              }}
            >
              <Box
                sx={{
                  borderBottom: "1px solid #A8A8A8",
                  display: "flex",
                  pb: 2,
                  alignItems: "center",
                }}
              >
                <Typography
                  fontSize="26px"
                  color="#99BC4D"
                  fontWeight={600}
                  sx={{ flexGrow: 1 }}
                >
                  Trong {daysDifference} ngày...
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  Từ
                  <TextField
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  đến
                  <TextField
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Box>
              </Box>
              <Box
                sx={{
                  paddingY: 3,
                  borderBottom: "1px solid #A8A8A8",
                  display: "flex",
                  gap: 2,
                  justifyContent: "space-between",
                  flex: 1,
                }}
              >
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Image src="/list.png" width={80} height={80} alt="Quiz" />
                  <Box>
                    <Typography fontSize="35px">
                      {studentStats.numberOfQuestionsAnswered}
                    </Typography>
                    <Typography color="#000000" fontWeight={600}>
                      Câu hỏi đã trả lời
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Image src="/list.png" width={80} height={80} alt="Quiz" />
                  <Box>
                    <Typography fontSize="35px">
                      {studentStats.numberOfQuizzesDone}
                    </Typography>
                    <Typography color="#000000" fontWeight={600}>
                      Số bài kiểm tra đã làm
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Image src="/clock.png" width={80} height={80} alt="Clock" />
                  <Box>
                    <Typography fontSize="35px">
                      {studentStats.timeSpentDoingQuizzes
                        ? formatTimeSpent(studentStats.timeSpentDoingQuizzes)
                        : "0' 0s"}
                    </Typography>
                    <Typography color="#000000" fontWeight={600}>
                      Số phút đã làm bài kiểm tra
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Typography
                fontSize="20px"
                color="#99BC4D"
                fontWeight={600}
                sx={{ flexGrow: 1, py: 3 }}
              >
                Lịch sử làm bài
              </Typography>
              <Box
                sx={{
                  height: "70vh",
                  boxShadow: 3,
                  borderRadius: 3,
                  overflowX: "auto",
                }}
              >
                <Box>
                  <TableContainer
                    sx={{
                      borderRadius: 3,
                      overflow: "auto",
                      height: "60vh",
                      minWidth: "1600px",
                    }}
                  >
                    <Table size="small">
                      <TableHead sx={{ bgcolor: "#FFFBF3" }}>
                        <TableRow>
                          <TableCell sx={{ paddingY: "16px" }}>
                            Tên bài kiểm tra
                          </TableCell>
                          <TableCell>Tên chủ đề</TableCell>
                          <TableCell>Tên bài học</TableCell>
                          <TableCell>Tổng số câu hỏi</TableCell>
                          <TableCell>Số đáp án đúng</TableCell>
                          <TableCell>Điểm</TableCell>
                          <TableCell>Thời gian hoàn thành</TableCell>
                          <TableCell>Ngày</TableCell>
                          <TableCell>Xem lại</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {quizRecords && quizRecords.length > 0 ? (
                          quizRecords.map((record, index) => (
                            <TableRow key={index}>
                              <TableCell sx={{ paddingY: "16px" }}>
                                {record.quizName}
                              </TableCell>
                              <TableCell>{record.topicName}</TableCell>
                              <TableCell>{record.lessonName}</TableCell>
                              <TableCell>{record.totalQuestions}</TableCell>
                              <TableCell>{record.correctAnswers}</TableCell>
                              <TableCell>{record.points}</TableCell>
                              <TableCell>{record.timeSpentFormatted}</TableCell>
                              <TableCell>
                                {new Date(record.createdAt).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Link
                                  href={`/skill-test/${record.recordId}`}
                                  sx={{
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                    color: "#1976d2",
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    router.push(
                                      `/skill-test/${record.recordId}`
                                    );
                                  }}
                                >
                                  Xem lại bài làm
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              align="center"
                              sx={{ paddingY: "16px" }}
                            >
                              Không có dữ liệu
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                <TablePagination
                  component="div"
                  count={totalItems}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Layout>
  );
};

export default DashboardReportPage;
