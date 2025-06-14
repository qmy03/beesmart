// // import Layout from "@/app/components/admin/layout";
// // import { Button } from "@/app/components/button";
// // import { AuthProvider, useAuth } from "@/app/hooks/AuthContext";
// // import {
// //   Box,
// //   Typography,
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableContainer,
// //   TableHead,
// //   TableRow,
// //   Select,
// //   MenuItem,
// //   Snackbar,
// //   Alert,
// //   TablePagination,
// // } from "@mui/material";
// // import React, { useState, useEffect, useMemo } from "react";
// // import apiService from "@/app/untils/api";
// // import TextField from "@/app/components/textfield";

// // interface User {
// //   userId: string;
// //   username: string;
// //   role: string;
// // }

// // interface UsersResponse {
// //   data: User[];
// // }

// // interface QuizRecord {
// //   recordId: string;
// //   quizName: string;
// //   totalQuestions: number;
// //   correctAnswers: number;
// //   points: number;
// //   timeSpent: number;
// //   createdAt: string;
// // }

// // interface QuizRecordsData {
// //   quizRecords: QuizRecord[];
// //   totalItems: number;
// // }

// // interface QuizRecordsResponse {
// //   data: QuizRecordsData;
// // }

// // const StatisticHomeworkHistory = () => {
// //   const { accessToken } = useAuth();
// //   const [users, setUsers] = useState<any[]>([]);
// //   const [selectedUser, setSelectedUser] = useState("");
// //   const [quizRecords, setQuizRecords] = useState<any[]>([]);
// //   const [loading, setLoading] = useState(false);
// //   const [totalItems, setTotalItems] = useState(0);

// //   const [snackbarOpen, setSnackbarOpen] = useState(false);
// //   const [snackbarMessage, setSnackbarMessage] = useState("");
// //   const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
// //     "success"
// //   );

// //   const [page, setPage] = useState(0);
// //   const [rowsPerPage, setRowsPerPage] = useState(10);

// //   // Search filters
// //   const [searchFilters, setSearchFilters] = useState({
// //     quizName: "",
// //     totalQuestions: "",
// //     correctAnswers: "",
// //     points: "",
// //     timeSpent: "",
// //     createdAt: "",
// //   });

// //   const handleSnackbarClose = () => {
// //     setSnackbarOpen(false);
// //   };

// //   const handleChangePage = (event: unknown, newPage: number) => {
// //     setPage(newPage);
// //   };

// //   const handleChangeRowsPerPage = (
// //     event: React.ChangeEvent<HTMLInputElement>
// //   ) => {
// //     setRowsPerPage(parseInt(event.target.value, 10));
// //     setPage(0);
// //   };

// //   const handleSearchFilterChange =
// //     (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
// //       setSearchFilters((prev) => ({
// //         ...prev,
// //         [field]: event.target.value,
// //       }));
// //       setPage(0); // Reset to first page when filtering
// //     };

// //   // Format date to dd/mm/yyyy
// //   const formatDate = (dateString: string): string => {
// //     const date = new Date(dateString);
// //     const day = String(date.getDate()).padStart(2, "0");
// //     const month = String(date.getMonth() + 1).padStart(2, "0");
// //     const year = date.getFullYear();
// //     return `${day}/${month}/${year}`;
// //   };

// //   // Format time for display
// //   const formatTime = (seconds: number): string => {
// //     const minutes = Math.floor(seconds / 60);
// //     const remainingSeconds = seconds % 60;
// //     return `${minutes}'${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}s`;
// //   };

// //   // Filtered quiz records based on search criteria
// //   const filteredQuizRecords = useMemo(() => {
// //     return quizRecords.filter((record) => {
// //       const matchQuizName =
// //         !searchFilters.quizName ||
// //         record.quizName
// //           .toLowerCase()
// //           .includes(searchFilters.quizName.toLowerCase());

// //       const matchTotalQuestions =
// //         !searchFilters.totalQuestions ||
// //         record.totalQuestions.toString().includes(searchFilters.totalQuestions);

// //       const matchCorrectAnswers =
// //         !searchFilters.correctAnswers ||
// //         record.correctAnswers.toString().includes(searchFilters.correctAnswers);

// //       const matchPoints =
// //         !searchFilters.points ||
// //         record.points.toString().includes(searchFilters.points);

// //       const matchTimeSpent =
// //         !searchFilters.timeSpent ||
// //         formatTime(record.timeSpent)
// //           .toLowerCase()
// //           .includes(searchFilters.timeSpent.toLowerCase());

// //       const matchCreatedAt =
// //         !searchFilters.createdAt ||
// //         formatDate(record.createdAt)
// //           .toLowerCase()
// //           .includes(searchFilters.createdAt.toLowerCase());

// //       return (
// //         matchQuizName &&
// //         matchTotalQuestions &&
// //         matchCorrectAnswers &&
// //         matchPoints &&
// //         matchTimeSpent &&
// //         matchCreatedAt
// //       );
// //     });
// //   }, [quizRecords, searchFilters]);

// //   // Paginated filtered records
// //   const paginatedRecords = useMemo(() => {
// //     const startIndex = page * rowsPerPage;
// //     const endIndex = startIndex + rowsPerPage;
// //     return filteredQuizRecords.slice(startIndex, endIndex);
// //   }, [filteredQuizRecords, page, rowsPerPage]);

// //   useEffect(() => {
// //     if (accessToken) {
// //       setLoading(true);
// //       apiService
// //         .get<UsersResponse>("/users", {
// //           headers: {
// //             Authorization: `Bearer ${accessToken}`,
// //           },
// //         })
// //         .then((response) => {
// //           const userList = response.data.data;
// //           const students = userList.filter(
// //             (user: any) => user.role === "STUDENT"
// //           );
// //           setUsers(students);
// //           if (students.length > 0) {
// //             setSelectedUser(students[0].userId);
// //           }
// //           setLoading(false);
// //         })
// //         .catch((error) => {
// //           console.error("Error fetching users:", error);
// //           setLoading(false);
// //         });
// //     }
// //   }, [accessToken]);

// //   useEffect(() => {
// //     console.log("Fetching data for page:", page);
// //     if (selectedUser) {
// //       setLoading(true);
// //       apiService
// //         .get<QuizRecordsResponse>(
// //           `/statistics/user/${selectedUser}/quiz-records?page=${page}`,
// //           {
// //             headers: {
// //               Authorization: `Bearer ${accessToken}`,
// //             },
// //           }
// //         )
// //         .then((response) => {
// //           console.log("Data fetched:", response.data);
// //           const data = response.data.data;
// //           setQuizRecords(data.quizRecords);
// //           setTotalItems(data.totalItems);
// //           setLoading(false);
// //         })
// //         .catch((error) => {
// //           console.error("Error fetching quiz records:", error);
// //           setLoading(false);
// //         });
// //     }
// //   }, [selectedUser, accessToken]);

// //   const handleUserChange = (event: React.ChangeEvent<{ value: unknown }>) => {
// //     setSelectedUser(event.target.value as string);
// //     setPage(0);
// //     // Reset search filters when changing user
// //     setSearchFilters({
// //       quizName: "",
// //       totalQuestions: "",
// //       correctAnswers: "",
// //       points: "",
// //       timeSpent: "",
// //       createdAt: "",
// //     });
// //   };

// //   return (
// //     <Layout>
// //       <Box
// //         sx={{
// //           display: "flex",
// //           flexDirection: "column",
// //           padding: "0 10px",
// //           flex: 1,
// //           height: "100%", 
// //         }}
// //       >
// //         <Box
// //           sx={{
// //             display: "flex",
// //             padding: "0 8px",
// //             margin: 0,
// //             alignItems: "center",
// //             boxShadow: 4,
// //             borderRadius: "8px",
// //           }}
// //         >
// //           <Typography fontWeight={700} flexGrow={1}>
// //             Thống kê Lịch sử Làm bài
// //           </Typography>
// //           <TextField
// //             size="small"
// //             label=""
// //             select
// //             value={selectedUser}
// //             onChange={handleUserChange}
// //             sx={{ width: 200, padding: 0, margin:"4px" }}
// //           >
// //             {users.map((user) => (
// //               <MenuItem key={user.userId} value={user.userId}>
// //                 {user.username}
// //               </MenuItem>
// //             ))}
// //           </TextField>
// //         </Box>
// //         <Box sx={{ marginTop: 2 }}>
// //           <Box sx={{ boxShadow: 4, borderRadius: 2 }}>
// //             <TableContainer
// //               sx={{
// //                 borderRadius: 2,
// //                 height: "76vh",
// //                 overflow: "auto",
// //               }}
// //             >
// //               <Table size="small">
// //                 <TableHead sx={{ backgroundColor: "#FFFBF3" }}>
// //                   <TableRow>
// //                     <TableCell
// //                       sx={{ width: "25%", pb: "0", border: "none" }}
// //                     >
// //                       Tên bài kiểm tra
// //                     </TableCell>
// //                     <TableCell sx={{ width: "15%", pb: "0", border: "none" }}>
// //                       Tổng câu hỏi
// //                     </TableCell>
// //                     <TableCell sx={{ width: "15%", pb: "0", border: "none" }}>
// //                       Đáp án đúng
// //                     </TableCell>
// //                     <TableCell sx={{ width: "10%", pb: "0", border: "none" }}>
// //                       Điểm
// //                     </TableCell>
// //                     <TableCell sx={{ width: "15%", pb: "0", border: "none" }}>
// //                       Thời gian làm bài
// //                     </TableCell>
// //                     <TableCell sx={{ width: "20%", pb: "0", border: "none" }}>
// //                       Ngày làm bài
// //                     </TableCell>
// //                   </TableRow>
// //                   {/* Search Row */}
// //                   <TableRow>
// //                     <TableCell sx={{ paddingTop: 0 }}>
// //                       <TextField
// //                         label=""
// //                         value={searchFilters.quizName}
// //                         onChange={handleSearchFilterChange("quizName")}
// //                         size="small"
// //                         sx={{ width: "100%", bgcolor: "white" }}
// //                       />
// //                     </TableCell>
// //                     <TableCell sx={{ paddingTop: 0 }}>
// //                       <TextField
// //                         label=""
// //                         value={searchFilters.totalQuestions}
// //                         onChange={handleSearchFilterChange("totalQuestions")}
// //                         size="small"
// //                         sx={{ width: "100%", bgcolor: "white" }}
// //                       />
// //                     </TableCell>
// //                     <TableCell sx={{ paddingTop: 0 }}>
// //                       <TextField
// //                         label=""
// //                         value={searchFilters.correctAnswers}
// //                         onChange={handleSearchFilterChange("correctAnswers")}
// //                         size="small"
// //                         sx={{ width: "100%", bgcolor: "white" }}
// //                       />
// //                     </TableCell>
// //                     <TableCell sx={{ paddingTop: 0 }}>
// //                       <TextField
// //                         label=""
// //                         value={searchFilters.points}
// //                         onChange={handleSearchFilterChange("points")}
// //                         size="small"
// //                         sx={{ width: "100%", bgcolor: "white" }}
// //                       />
// //                     </TableCell>
// //                     <TableCell sx={{ paddingTop: 0 }}>
// //                       <TextField
// //                         label=""
// //                         value={searchFilters.timeSpent}
// //                         onChange={handleSearchFilterChange("timeSpent")}
// //                         size="small"
// //                         sx={{ width: "100%", bgcolor: "white" }}
// //                       />
// //                     </TableCell>
// //                     <TableCell sx={{ paddingTop: 0 }}>
// //                       <TextField
// //                         label=""
// //                         value={searchFilters.createdAt}
// //                         onChange={handleSearchFilterChange("createdAt")}
// //                         size="small"
// //                         sx={{ width: "100%", bgcolor: "white" }}
// //                       />
// //                     </TableCell>
// //                   </TableRow>
// //                 </TableHead>
// //                 <TableBody>
// //                   {loading ? (
// //                     <TableRow>
// //                       <TableCell
// //                         colSpan={6}
// //                         align="center"
// //                         sx={{ paddingY: "12px" }}
// //                       >
// //                         Đang tải dữ liệu...
// //                       </TableCell>
// //                     </TableRow>
// //                   ) : paginatedRecords.length === 0 ? (
// //                     <TableRow>
// //                       <TableCell
// //                         colSpan={6}
// //                         align="center"
// //                         sx={{ paddingY: "12px" }}
// //                       >
// //                         {filteredQuizRecords.length === 0 &&
// //                         quizRecords.length > 0
// //                           ? "Không tìm thấy kết quả phù hợp"
// //                           : "Không có dữ liệu"}
// //                       </TableCell>
// //                     </TableRow>
// //                   ) : (
// //                     paginatedRecords.map((record) => (
// //                       <TableRow key={record.recordId}>
// //                         <TableCell sx={{ paddingY: "12px" }}>
// //                           {record.quizName}
// //                         </TableCell>
// //                         <TableCell>{record.totalQuestions}</TableCell>
// //                         <TableCell>{record.correctAnswers}</TableCell>
// //                         <TableCell>{record.points}</TableCell>
// //                         <TableCell>{formatTime(record.timeSpent)}</TableCell>
// //                         <TableCell>{formatDate(record.createdAt)}</TableCell>
// //                       </TableRow>
// //                     ))
// //                   )}
// //                 </TableBody>
// //               </Table>
// //             </TableContainer>
// //             <TablePagination
// //               component="div"
// //               count={filteredQuizRecords.length}
// //               page={page}
// //               onPageChange={handleChangePage}
// //               rowsPerPage={rowsPerPage}
// //               onRowsPerPageChange={handleChangeRowsPerPage}
// //               labelDisplayedRows={({ from, to, count }) =>
// //                 `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
// //               }
// //             />
// //           </Box>
// //         </Box>
// //       </Box>

// //       {/* Snackbar */}
// //       <Snackbar
// //         open={snackbarOpen}
// //         autoHideDuration={3000}
// //         onClose={handleSnackbarClose}
// //         anchorOrigin={{ vertical: "top", horizontal: "right" }}
// //       >
// //         <Alert
// //           onClose={handleSnackbarClose}
// //           severity={snackbarSeverity}
// //           sx={{ width: "100%" }}
// //         >
// //           {snackbarMessage}
// //         </Alert>
// //       </Snackbar>
// //     </Layout>
// //   );
// // };

// // export default StatisticHomeworkHistory;

// import Layout from "@/app/components/admin/layout";
// import { AuthProvider, useAuth } from "@/app/hooks/AuthContext";
// import {
//   Box,
//   Typography,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Select,
//   MenuItem,
//   Snackbar,
//   Alert,
//   TablePagination,
// } from "@mui/material";
// import React, { useState, useEffect, useMemo } from "react";
// import apiService from "@/app/untils/api";
// import TextField from "@/app/components/textfield";

// interface User {
//   userId: string;
//   username: string;
//   role: string;
// }

// interface Subject {
//   subjectId: string;
//   subjectName: string;
// }

// interface UsersResponse {
//   data: User[];
// }

// interface SubjectsResponse {
//   data: {
//     subjects: Subject[];
//   };
// }

// interface QuizRecord {
//   recordId: string;
//   quizName: string;
//   totalQuestions: number;
//   correctAnswers: number;
//   points: number;
//   timeSpent: number;
//   createdAt: string;
// }

// interface QuizRecordsData {
//   quizRecords: QuizRecord[];
//   totalItems: number;
// }

// interface QuizRecordsResponse {
//   data: QuizRecordsData;
// }

// const StatisticHomeworkHistory = () => {
//   const { accessToken } = useAuth();
//   const [users, setUsers] = useState<User[]>([]);
//   const [subjects, setSubjects] = useState<Subject[]>([]);
//   const [selectedUser, setSelectedUser] = useState("");
//   const [selectedSubject, setSelectedSubject] = useState("");
//   const [quizRecords, setQuizRecords] = useState<QuizRecord[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [totalItems, setTotalItems] = useState(0);

//   const [snackbarOpen, setSnackbarOpen] = useState(false);
//   const [snackbarMessage, setSnackbarMessage] = useState("");
//   const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
//     "success"
//   );

//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);

//   // Search filters
//   const [searchFilters, setSearchFilters] = useState({
//     quizName: "",
//     totalQuestions: "",
//     correctAnswers: "",
//     points: "",
//     timeSpent: "",
//     createdAt: "",
//   });

//   const handleSnackbarClose = () => {
//     setSnackbarOpen(false);
//   };

//   const handleChangePage = (event: unknown, newPage: number) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const handleSearchFilterChange =
//     (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
//       setSearchFilters((prev) => ({
//         ...prev,
//         [field]: event.target.value,
//       }));
//       setPage(0); // Reset to first page when filtering
//     };

//   // Format date to dd/mm/yyyy
//   const formatDate = (dateString: string): string => {
//     const date = new Date(dateString);
//     const day = String(date.getDate()).padStart(2, "0");
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const year = date.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   // Format time for display
//   const formatTime = (seconds: number): string => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes}'${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}s`;
//   };

//   // Filtered quiz records based on search criteria
//   const filteredQuizRecords = useMemo(() => {
//     return quizRecords.filter((record) => {
//       const matchQuizName =
//         !searchFilters.quizName ||
//         record.quizName
//           .toLowerCase()
//           .includes(searchFilters.quizName.toLowerCase());

//       const matchTotalQuestions =
//         !searchFilters.totalQuestions ||
//         record.totalQuestions.toString().includes(searchFilters.totalQuestions);

//       const matchCorrectAnswers =
//         !searchFilters.correctAnswers ||
//         record.correctAnswers.toString().includes(searchFilters.correctAnswers);

//       const matchPoints =
//         !searchFilters.points ||
//         record.points.toString().includes(searchFilters.points);

//       const matchTimeSpent =
//         !searchFilters.timeSpent ||
//         formatTime(record.timeSpent)
//           .toLowerCase()
//           .includes(searchFilters.timeSpent.toLowerCase());

//       const matchCreatedAt =
//         !searchFilters.createdAt ||
//         formatDate(record.createdAt)
//           .toLowerCase()
//           .includes(searchFilters.createdAt.toLowerCase());

//       return (
//         matchQuizName &&
//         matchTotalQuestions &&
//         matchCorrectAnswers &&
//         matchPoints &&
//         matchTimeSpent &&
//         matchCreatedAt
//       );
//     });
//   }, [quizRecords, searchFilters]);

//   // Paginated filtered records
//   const paginatedRecords = useMemo(() => {
//     const startIndex = page * rowsPerPage;
//     const endIndex = startIndex + rowsPerPage;
//     return filteredQuizRecords.slice(startIndex, endIndex);
//   }, [filteredQuizRecords, page, rowsPerPage]);

//   // Fetch users and subjects
//   useEffect(() => {
//     if (accessToken) {
//       setLoading(true);
//       Promise.all([
//         apiService.get<UsersResponse>("/users", {
//           headers: { Authorization: `Bearer ${accessToken}` },
//         }),
//         apiService.get<SubjectsResponse>("/subjects", {
//           headers: { Authorization: `Bearer ${accessToken}` },
//         }),
//       ])
//         .then(([usersResponse, subjectsResponse]) => {
//           const userList = usersResponse.data.data;
//           const students = userList.filter((user) => user.role === "STUDENT");
//           setUsers(students);
//           if (students.length > 0) {
//             setSelectedUser(students[0].userId);
//           }

//           const subjectList = subjectsResponse.data.data.subjects;
//           setSubjects(subjectList);
//           if (subjectList.length > 0) {
//             setSelectedSubject(subjectList[0].subjectName);
//           }
//           setLoading(false);
//         })
//         .catch((error) => {
//           console.error("Error fetching data:", error);
//           setSnackbarMessage("Lỗi khi tải dữ liệu người dùng hoặc môn học");
//           setSnackbarSeverity("error");
//           setSnackbarOpen(true);
//           setLoading(false);
//         });
//     }
//   }, [accessToken]);

//   // Fetch quiz records
//   useEffect(() => {
//     if (selectedUser && selectedSubject) {
//       setLoading(true);
//       const url = `/statistics/user/${selectedUser}/quiz-records?page=${page}&subject=${encodeURIComponent(selectedSubject)}`;
//       apiService
//         .get<QuizRecordsResponse>(url, {
//           headers: { Authorization: `Bearer ${accessToken}` },
//         })
//         .then((response) => {
//           const data = response.data.data;
//           setQuizRecords(data.quizRecords);
//           setTotalItems(data.totalItems);
//           setLoading(false);
//         })
//         .catch((error) => {
//           console.error("Error fetching quiz records:", error);
//           setSnackbarMessage("Lỗi khi tải lịch sử bài kiểm tra");
//           setSnackbarSeverity("error");
//           setSnackbarOpen(true);
//           setQuizRecords([]);
//           setTotalItems(0);
//           setLoading(false);
//         });
//     }
//   }, [selectedUser, selectedSubject, page, accessToken]);

//   const handleUserChange = (event: React.ChangeEvent<{ value: unknown }>) => {
//     setSelectedUser(event.target.value as string);
//     setPage(0);
//     setSearchFilters({
//       quizName: "",
//       totalQuestions: "",
//       correctAnswers: "",
//       points: "",
//       timeSpent: "",
//       createdAt: "",
//     });
//   };

//   const handleSubjectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
//     setSelectedSubject(event.target.value as string);
//     setPage(0);
//     setSearchFilters({
//       quizName: "",
//       totalQuestions: "",
//       correctAnswers: "",
//       points: "",
//       timeSpent: "",
//       createdAt: "",
//     });
//   };

//   return (
//     <Layout>
//       <Box
//         sx={{
//           display: "flex",
//           flexDirection: "column",
//           padding: "0 10px",
//           flex: 1,
//           height: "100%",
//         }}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             padding: "0 8px",
//             margin: 0,
//             alignItems: "center",
//             boxShadow: 4,
//             borderRadius: "8px",
//           }}
//         >
//           <Typography fontWeight={700} flexGrow={1}>
//             Thống kê Lịch sử Làm bài
//           </Typography>
//           <TextField
//             size="small"
//             label=""
//             select
//             value={selectedUser}
//             onChange={handleUserChange}
//             sx={{ width: 180, padding: 0, margin: "4px" }}
//           >
//             {users.map((user) => (
//               <MenuItem key={user.userId} value={user.userId}>
//                 {user.username}
//               </MenuItem>
//             ))}
//           </TextField>
//           <TextField
//             size="small"
//             label=""
//             select
//             value={selectedSubject}
//             onChange={handleSubjectChange}
//             sx={{ width: 180, padding: 0, margin: "4px" }}
//           >
//             {subjects.map((subject) => (
//               <MenuItem key={subject.subjectId} value={subject.subjectName}>
//                 {subject.subjectName}
//               </MenuItem>
//             ))}
//           </TextField>
//         </Box>
//         <Box sx={{ marginTop: 2 }}>
//           <Box sx={{ boxShadow: 4, borderRadius: 2 }}>
//             <TableContainer
//               sx={{
//                 borderRadius: 2,
//                 height: "80vh",
//                 overflow: "auto",
//               }}
//             >
//               <Table size="small">
//                 <TableHead sx={{ backgroundColor: "#FFFBF3" }}>
//                   <TableRow>
//                     <TableCell sx={{ width: "25%", pb: "0", border: "none" }}>
//                       Tên bài kiểm tra
//                     </TableCell>
//                     <TableCell sx={{ width: "15%", pb: "0", border: "none" }}>
//                       Tổng câu hỏi
//                     </TableCell>
//                     <TableCell sx={{ width: "15%", pb: "0", border: "none" }}>
//                       Đáp án đúng
//                     </TableCell>
//                     <TableCell sx={{ width: "10%", pb: "0", border: "none" }}>
//                       Điểm
//                     </TableCell>
//                     <TableCell sx={{ width: "15%", pb: "0", border: "none" }}>
//                       Thời gian làm bài
//                     </TableCell>
//                     <TableCell sx={{ width: "20%", pb: "0", border: "none" }}>
//                       Ngày làm bài
//                     </TableCell>
//                   </TableRow>
//                   <TableRow>
//                     <TableCell sx={{ paddingTop: 0 }}>
//                       <TextField
//                         label=""
//                         value={searchFilters.quizName}
//                         onChange={handleSearchFilterChange("quizName")}
//                         size="small"
//                         sx={{ width: "100%", bgcolor: "white" }}
//                       />
//                     </TableCell>
//                     <TableCell sx={{ paddingTop: 0 }}>
//                       <TextField
//                         label=""
//                         value={searchFilters.totalQuestions}
//                         onChange={handleSearchFilterChange("totalQuestions")}
//                         size="small"
//                         sx={{ width: "100%", bgcolor: "white" }}
//                       />
//                     </TableCell>
//                     <TableCell sx={{ paddingTop: 0 }}>
//                       <TextField
//                         label=""
//                         value={searchFilters.correctAnswers}
//                         onChange={handleSearchFilterChange("correctAnswers")}
//                         size="small"
//                         sx={{ width: "100%", bgcolor: "white" }}
//                       />
//                     </TableCell>
//                     <TableCell sx={{ paddingTop: 0 }}>
//                       <TextField
//                         label=""
//                         value={searchFilters.points}
//                         onChange={handleSearchFilterChange("points")}
//                         size="small"
//                         sx={{ width: "100%", bgcolor: "white" }}
//                       />
//                     </TableCell>
//                     <TableCell sx={{ paddingTop: 0 }}>
//                       <TextField
//                         label=""
//                         value={searchFilters.timeSpent}
//                         onChange={handleSearchFilterChange("timeSpent")}
//                         size="small"
//                         sx={{ width: "100%", bgcolor: "white" }}
//                       />
//                     </TableCell>
//                     <TableCell sx={{ paddingTop: 0 }}>
//                       <TextField
//                         label=""
//                         value={searchFilters.createdAt}
//                         onChange={handleSearchFilterChange("createdAt")}
//                         size="small"
//                         sx={{ width: "100%", bgcolor: "white" }}
//                       />
//                     </TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {loading ? (
//                     <TableRow>
//                       <TableCell
//                         colSpan={6}
//                         align="center"
//                         sx={{ paddingY: "12px" }}
//                       >
//                         Đang tải dữ liệu...
//                       </TableCell>
//                     </TableRow>
//                   ) : paginatedRecords.length === 0 ? (
//                     <TableRow>
//                       <TableCell
//                         colSpan={6}
//                         align="center"
//                         sx={{ paddingY: "12px" }}
//                       >
//                         {filteredQuizRecords.length === 0 &&
//                         quizRecords.length > 0
//                           ? "Không tìm thấy kết quả phù hợp"
//                           : "Không có dữ liệu"}
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     paginatedRecords.map((record) => (
//                       <TableRow key={record.recordId}>
//                         <TableCell sx={{ paddingY: "12px" }}>
//                           {record.quizName}
//                         </TableCell>
//                         <TableCell>{record.totalQuestions}</TableCell>
//                         <TableCell>{record.correctAnswers}</TableCell>
//                         <TableCell>{record.points}</TableCell>
//                         <TableCell>{formatTime(record.timeSpent)}</TableCell>
//                         <TableCell>{formatDate(record.createdAt)}</TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//             <TablePagination
//               component="div"
//               count={filteredQuizRecords.length}
//               page={page}
//               onPageChange={handleChangePage}
//               rowsPerPage={rowsPerPage}
//               onRowsPerPageChange={handleChangeRowsPerPage}
//               labelDisplayedRows={({ from, to, count }) =>
//                 `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
//               }
//             />
//           </Box>
//         </Box>

//         <Snackbar
//           open={snackbarOpen}
//           autoHideDuration={3000}
//           onClose={handleSnackbarClose}
//           anchorOrigin={{ vertical: "top", horizontal: "right" }}
//         >
//           <Alert
//             onClose={handleSnackbarClose}
//             severity={snackbarSeverity}
//             sx={{ width: "100%" }}
//           >
//             {snackbarMessage}
//           </Alert>
//         </Snackbar>
//       </Box>
//     </Layout>
//   );
// };

// export default StatisticHomeworkHistory;
import Layout from "@/app/components/admin/layout";
import { AuthProvider, useAuth } from "@/app/hooks/AuthContext";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  TablePagination,
  Link,
} from "@mui/material";
import React, { useState, useEffect, useMemo } from "react";
import apiService from "@/app/untils/api";
import TextField from "@/app/components/textfield";
import { useRouter } from "next/navigation";

interface User {
  userId: string;
  username: string;
  role: string;
}

interface Subject {
  subjectId: string;
  subjectName: string;
}

interface UsersResponse {
  data: User[];
}

interface SubjectsResponse {
  data: {
    subjects: Subject[];
  };
}

interface QuizRecord {
  recordId: string;
  quizName: string;
  totalQuestions: number;
  correctAnswers: number;
  points: number;
  timeSpent: number;
  createdAt: string;
}

interface QuizRecordsData {
  quizRecords: QuizRecord[];
  totalItems: number;
}

interface QuizRecordsResponse {
  data: QuizRecordsData;
}

const StatisticHomeworkHistory = () => {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [quizRecords, setQuizRecords] = useState<QuizRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Search filters
  const [searchFilters, setSearchFilters] = useState({
    quizName: "",
    totalQuestions: "",
    correctAnswers: "",
    points: "",
    timeSpent: "",
    createdAt: "",
  });

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
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

  const handleSearchFilterChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchFilters((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      setPage(0); // Reset to first page when filtering
    };

  // Format date to dd/mm/yyyy
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format time for display
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}'${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}s`;
  };

  // Filtered quiz records based on search criteria
  const filteredQuizRecords = useMemo(() => {
    return quizRecords.filter((record) => {
      const matchQuizName =
        !searchFilters.quizName ||
        record.quizName
          .toLowerCase()
          .includes(searchFilters.quizName.toLowerCase());

      const matchTotalQuestions =
        !searchFilters.totalQuestions ||
        record.totalQuestions.toString().includes(searchFilters.totalQuestions);

      const matchCorrectAnswers =
        !searchFilters.correctAnswers ||
        record.correctAnswers.toString().includes(searchFilters.correctAnswers);

      const matchPoints =
        !searchFilters.points ||
        record.points.toString().includes(searchFilters.points);

      const matchTimeSpent =
        !searchFilters.timeSpent ||
        formatTime(record.timeSpent)
          .toLowerCase()
          .includes(searchFilters.timeSpent.toLowerCase());

      const matchCreatedAt =
        !searchFilters.createdAt ||
        formatDate(record.createdAt)
          .toLowerCase()
          .includes(searchFilters.createdAt.toLowerCase());

      return (
        matchQuizName &&
        matchTotalQuestions &&
        matchCorrectAnswers &&
        matchPoints &&
        matchTimeSpent &&
        matchCreatedAt
      );
    });
  }, [quizRecords, searchFilters]);

  // Paginated filtered records
  const paginatedRecords = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredQuizRecords.slice(startIndex, endIndex);
  }, [filteredQuizRecords, page, rowsPerPage]);

  // Fetch users and subjects
  useEffect(() => {
    if (accessToken) {
      setLoading(true);
      Promise.all([
        apiService.get<UsersResponse>("/users", {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        apiService.get<SubjectsResponse>("/subjects", {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ])
        .then(([usersResponse, subjectsResponse]) => {
          const userList = usersResponse.data.data;
          const students = userList.filter((user) => user.role === "STUDENT");
          setUsers(students);
          if (students.length > 0) {
            setSelectedUser(students[0].userId);
          }

          const subjectList = subjectsResponse.data.data.subjects;
          setSubjects(subjectList);
          if (subjectList.length > 0) {
            setSelectedSubject(subjectList[0].subjectName);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setSnackbarMessage("Lỗi khi tải dữ liệu người dùng hoặc môn học");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          setLoading(false);
        });
    }
  }, [accessToken]);

  // Fetch quiz records
  useEffect(() => {
    if (selectedUser && selectedSubject) {
      setLoading(true);
      const url = `/statistics/user/${selectedUser}/quiz-records?page=${page}&subject=${encodeURIComponent(selectedSubject)}`;
      apiService
        .get<QuizRecordsResponse>(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          const data = response.data.data;
          setQuizRecords(data.quizRecords);
          setTotalItems(data.totalItems);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching quiz records:", error);
          setSnackbarMessage("Lỗi khi tải lịch sử bài kiểm tra");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          setQuizRecords([]);
          setTotalItems(0);
          setLoading(false);
        });
    }
  }, [selectedUser, selectedSubject, page, accessToken]);

  const handleUserChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedUser(event.target.value as string);
    setPage(0);
    setSearchFilters({
      quizName: "",
      totalQuestions: "",
      correctAnswers: "",
      points: "",
      timeSpent: "",
      createdAt: "",
    });
  };

  const handleSubjectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedSubject(event.target.value as string);
    setPage(0);
    setSearchFilters({
      quizName: "",
      totalQuestions: "",
      correctAnswers: "",
      points: "",
      timeSpent: "",
      createdAt: "",
    });
  };

  const handleReviewClick = (recordId: string) => {
    router.push(`/skill-test/${recordId}`);
  };

  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          padding: "0 10px",
          flex: 1,
          height: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            padding: "0 8px",
            margin: 0,
            alignItems: "center",
            boxShadow: 4,
            borderRadius: "8px",
          }}
        >
          <Typography fontWeight={700} flexGrow={1}>
            Thống kê Lịch sử Làm bài
          </Typography>
          <TextField
            size="small"
            label=""
            select
            value={selectedUser}
            onChange={handleUserChange}
            sx={{ width: 180, padding: 0, margin: "4px" }}
          >
            {users.map((user) => (
              <MenuItem key={user.userId} value={user.userId}>
                {user.username}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            label=""
            select
            value={selectedSubject}
            onChange={handleSubjectChange}
            sx={{ width: 180, padding: 0, margin: "4px" }}
          >
            {subjects.map((subject) => (
              <MenuItem key={subject.subjectId} value={subject.subjectName}>
                {subject.subjectName}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        <Box sx={{ marginTop: 2 }}>
          <Box sx={{ boxShadow: 4, borderRadius: 2 }}>
            <TableContainer
              sx={{
                borderRadius: 2,
                height: "80vh",
                overflow: "auto",
              }}
            >
              <Table size="small">
                <TableHead sx={{ backgroundColor: "#FFFBF3" }}>
                  <TableRow>
                    <TableCell sx={{ width: "20%", pb: "0", border: "none" }}>
                      Tên bài kiểm tra
                    </TableCell>
                    <TableCell sx={{ width: "12%", pb: "0", border: "none" }}>
                      Tổng câu hỏi
                    </TableCell>
                    <TableCell sx={{ width: "15%", pb: "0", border: "none" }}>
                      Đáp án đúng
                    </TableCell>
                    <TableCell sx={{ width: "10%", pb: "0", border: "none" }}>
                      Điểm
                    </TableCell>
                    <TableCell sx={{ width: "15%", pb: "0", border: "none" }}>
                      Thời gian làm bài
                    </TableCell>
                    <TableCell sx={{ width: "15%", pb: "0", border: "none" }}>
                      Ngày làm bài
                    </TableCell>
                    <TableCell sx={{ width: "13%", pb: "0", border: "none" }}>
                      Xem lại
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ paddingTop: 0 }}>
                      <TextField
                        label=""
                        value={searchFilters.quizName}
                        onChange={handleSearchFilterChange("quizName")}
                        size="small"
                        sx={{ width: "100%", bgcolor: "white" }}
                      />
                    </TableCell>
                    <TableCell sx={{ paddingTop: 0 }}>
                      <TextField
                        label=""
                        value={searchFilters.totalQuestions}
                        onChange={handleSearchFilterChange("totalQuestions")}
                        size="small"
                        sx={{ width: "100%", bgcolor: "white" }}
                      />
                    </TableCell>
                    <TableCell sx={{ paddingTop: 0 }}>
                      <TextField
                        label=""
                        value={searchFilters.correctAnswers}
                        onChange={handleSearchFilterChange("correctAnswers")}
                        size="small"
                        sx={{ width: "100%", bgcolor: "white" }}
                      />
                    </TableCell>
                    <TableCell sx={{ paddingTop: 0 }}>
                      <TextField
                        label=""
                        value={searchFilters.points}
                        onChange={handleSearchFilterChange("points")}
                        size="small"
                        sx={{ width: "100%", bgcolor: "white" }}
                      />
                    </TableCell>
                    <TableCell sx={{ paddingTop: 0 }}>
                      <TextField
                        label=""
                        value={searchFilters.timeSpent}
                        onChange={handleSearchFilterChange("timeSpent")}
                        size="small"
                        sx={{ width: "100%", bgcolor: "white" }}
                      />
                    </TableCell>
                    <TableCell sx={{ paddingTop: 0 }}>
                      <TextField
                        label=""
                        value={searchFilters.createdAt}
                        onChange={handleSearchFilterChange("createdAt")}
                        size="small"
                        sx={{ width: "100%", bgcolor: "white" }}
                      />
                    </TableCell>
                    <TableCell sx={{ paddingTop: 0 }}><TextField
                        label=""
                        value={searchFilters.createdAt}
                        onChange={handleSearchFilterChange("createdAt")}
                        size="small"
                        sx={{ width: "100%", bgcolor: "#E9E9E9" }}
                        disabled
                      /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        align="center"
                        sx={{ paddingY: "12px" }}
                      >
                        Đang tải dữ liệu...
                      </TableCell>
                    </TableRow>
                  ) : paginatedRecords.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        align="center"
                        sx={{ paddingY: "12px" }}
                      >
                        {filteredQuizRecords.length === 0 &&
                        quizRecords.length > 0
                          ? "Không tìm thấy kết quả phù hợp"
                          : "Không có dữ liệu"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRecords.map((record) => (
                      <TableRow key={record.recordId}>
                        <TableCell sx={{ paddingY: "12px" }}>
                          {record.quizName}
                        </TableCell>
                        <TableCell>{record.totalQuestions}</TableCell>
                        <TableCell>{record.correctAnswers}</TableCell>
                        <TableCell>{record.points}</TableCell>
                        <TableCell>{formatTime(record.timeSpent)}</TableCell>
                        <TableCell>{formatDate(record.createdAt)}</TableCell>
                        <TableCell>
                          <Link
                            component="button"
                            underline="always"
                            onClick={() => handleReviewClick(record.recordId)}
                            sx={{ cursor: "pointer", color: "primary.main" }}
                          >
                            Xem lại bài làm
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredQuizRecords.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
              }
            />
          </Box>
        </Box>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default StatisticHomeworkHistory;