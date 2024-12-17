// "use client";
// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import apiService from "@/app/untils/api";
// import Layout from "@/app/components/user/Home/layout";
// import {
//   Box,
//   Typography,
//   Radio,
//   RadioGroup,
//   FormControlLabel,
//   FormControl,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Checkbox,
// } from "@mui/material";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/app/hooks/AuthContext";
// import { Button } from "../../button";
// import TextField from "../../textfield";
// const SkillPracticePage = () => {
//   const router = useRouter();
//   const { quizId } = useParams();
//   const [questions, setQuestions] = useState<any[]>([]);
//   const [answers, setAnswers] = useState<any[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [timeLeft, setTimeLeft] = useState<number>(0); // 10 minutes in seconds
//   const { accessToken } = useAuth();
//   const [dialogOpen, setDialogOpen] = useState<boolean>(false);
//   const [quizResult, setQuizResult] = useState<any>(null);
//   const [quizDuration, setQuizDuration] = useState<number>(0);

//   useEffect(() => {
//     // Countdown timer
//     const timer = setInterval(() => {
//       setTimeLeft((prevTime) => {
//         if (prevTime <= 1) {
//           clearInterval(timer); // Stop the timer when time is up
//           return 0;
//         }
//         return prevTime - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer); // Clean up interval on component unmount
//   }, []);

//   const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
//     const updatedAnswers = [...answers];
//     updatedAnswers[questionIndex] = { selectedAnswerIndex: answerIndex };
//     setAnswers(updatedAnswers);
//   };

//   useEffect(() => {
//     if (timeLeft > 0) {
//       // Chỉ chạy timer nếu timeLeft > 0
//       const timer = setInterval(() => {
//         setTimeLeft((prevTime) => {
//           if (prevTime <= 1) {
//             clearInterval(timer); // Dừng timer khi hết giờ
//             return 0;
//           }
//           return prevTime - 1;
//         });
//       }, 1000);

//       return () => clearInterval(timer); // Clean up interval
//     }
//   }, [timeLeft]); // Thêm timeLeft vào dependency

//   useEffect(() => {
//     if (quizId) {
//       setLoading(true);
//       apiService
//         .get(`/quizzes/${quizId}/questions`)
//         .then((response) => {
//           console.log("responseQ", response);
//           setQuestions(response.data.data.questions);

//           // Lấy quizDuration từ response
//           const duration = response.data.data.quizDuration || 10; // Mặc định 10 nếu không có
//           setQuizDuration(duration); // Lưu quizDuration vào state
//           setTimeLeft(duration * 60); // Đặt thời gian đếm ngược
//         })
//         .catch((error) => {
//           console.error("Error fetching questions:", error);
//         })
//         .finally(() => {
//           setLoading(false);
//         });
//     }
//   }, [quizId]);

//   const handleSubmit = () => {
//     const totalQuizTime = quizDuration * 60; // Total quiz time in seconds

//     // Calculate time spent in seconds (difference between total time and remaining time)
//     const timeSpent = totalQuizTime - timeLeft;

//     const payload = {
//       timeSpent: timeSpent, // Time spent in seconds
//       answers: answers
//         .map((answer, index) => {
//           const question = questions[index];
//           if (question.questionType === "MULTIPLE_CHOICE") {
//             return {
//               questionId: question.questionId,
//               selectedAnswer: question.options[answer.selectedAnswerIndex],
//             };
//           } else if (question.questionType === "MULTI_SELECT") {
//             return {
//               questionId: question.questionId,
//               selectedAnswers: answer.selectedAnswers.map(
//                 (idx: number) => question.options[idx]
//               ),
//             };
//           } else if (question.questionType === "FILL_IN_THE_BLANK") {
//             return {
//               questionId: question.questionId,
//               selectedAnswer: answer.inputAnswer,
//             };
//           }
//           return null;
//         })
//         .filter(Boolean), // Filter out any null answers
//     };

//     console.log("payload", payload);

//     apiService
//       .post(`/quizzes/${quizId}/submit-quiz`, payload, {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       })
//       .then((response) => {
//         console.log("Quiz submitted successfully", response.data);
//         setQuizResult(response.data.data);
//         setDialogOpen(true);
//       })
//       .catch((error) => {
//         console.error(
//           "Error submitting quiz:",
//           error.response?.data || error.message
//         );
//       });
//   };

//   const formatTime = (seconds: number) => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
//   };

//   if (loading) {
//     return (
//       <Layout>
//         <Box
//           sx={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             justifyContent: "center",
//             height: "100vh",
//             backgroundColor: "#EFF3E6",
//           }}
//         >
//           <Typography variant="h5">Loading questions...</Typography>
//         </Box>
//       </Layout>
//     );
//   }

//   return (
//     <Layout>
//       <Box
//         sx={{
//           display: "flex",
//           flexDirection: "column",
//           padding: "40px 80px",
//           gap: "20px",
//           backgroundColor: "#EFF3E6",
//           alignItems: "center",
//         }}
//       >
//         <Typography sx={{ fontSize: "32px", fontWeight: "600" }}>
//           Luyện tập Quiz
//         </Typography>

//         {/* Timer */}
//         <Typography variant="h5">{formatTime(timeLeft)}</Typography>

//         {/* Display questions */}
//         <Box>
//           {questions.map((question: any, questionIndex: number) => (
//             <Box
//               key={question.questionId}
//               sx={{
//                 marginBottom: "20px",
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: 2,
//               }}
//             >
//               <Typography variant="h6" fontWeight={700}>
//                 Câu hỏi số {questionIndex + 1}: {question.content}
//               </Typography>

//               <FormControl component="fieldset" sx={{ alignItems: "center" }}>
//                 {question.questionType === "FILL_IN_THE_BLANK" && (
//                   <TextField
//                     value={answers[questionIndex]?.inputAnswer || ""}
//                     onChange={(e) => {
//                       const updatedAnswers = [...answers];
//                       updatedAnswers[questionIndex] = {
//                         inputAnswer: e.target.value,
//                       };
//                       setAnswers(updatedAnswers);
//                     }}
//                     sx={{ width: "30%", bgcolor: "white" }}
//                     disabled={timeLeft === 0}
//                   />
//                 )}
//                 {question.image && (
//                   <img
//                     src={question.image}
//                     alt="Question"
//                     style={{ maxWidth: "50%" }}
//                   />
//                 )}
//                 {question.questionType === "MULTIPLE_CHOICE" && (
//                   <RadioGroup
//                     value={answers[questionIndex]?.selectedAnswerIndex ?? -1}
//                     onChange={(e) =>
//                       handleAnswerChange(
//                         questionIndex,
//                         parseInt(e.target.value)
//                       )
//                     }
//                     disabled={timeLeft === 0} // Disable input when time is up
//                     sx={{ display: "flex", flexDirection: "row", gap: 4 }}
//                   >
//                     {question.options.map((option: string, index: number) => (
//                       <FormControlLabel
//                         key={index}
//                         value={index.toString()}
//                         control={<Radio />}
//                         label={option}
//                       />
//                     ))}
//                   </RadioGroup>
//                 )}

//                 {question.questionType === "MULTI_SELECT" && (
//                   <Box>
//                     {question.options.map((option: string, index: number) => (
//                       <FormControlLabel
//                         sx={{ display: "flex", flexDirection: "row" }}
//                         key={index}
//                         control={
//                           <Checkbox
//                             checked={
//                               answers[questionIndex]?.selectedAnswers?.includes(
//                                 index
//                               ) || false
//                             }
//                             onChange={(e) => {
//                               const updatedAnswers = [...answers];
//                               const selectedAnswers =
//                                 updatedAnswers[questionIndex]
//                                   ?.selectedAnswers || [];
//                               if (e.target.checked) {
//                                 selectedAnswers.push(index);
//                               } else {
//                                 const idx = selectedAnswers.indexOf(index);
//                                 if (idx > -1) selectedAnswers.splice(idx, 1);
//                               }
//                               updatedAnswers[questionIndex] = {
//                                 selectedAnswers,
//                               };
//                               setAnswers(updatedAnswers);
//                             }}
//                           />
//                         }
//                         label={option}
//                       />
//                     ))}
//                   </Box>
//                 )}
//               </FormControl>
//             </Box>
//           ))}
//         </Box>

//         {/* Submit button */}
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={handleSubmit}
//           disabled={timeLeft === 0} // Disable submit when time is up
//         >
//           Nộp bài
//         </Button>
//       </Box>
//       <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
//         <DialogTitle fontSize="32px">
//           Chúc mừng bạn đã hoàn thành Bài luyện tập!
//         </DialogTitle>
//         <DialogContent>
//           <Typography>Số điểm: {quizResult?.points || 0}/10</Typography>
//           <Typography>
//             Số câu đúng: {quizResult?.correctAnswers || 0}/
//             {quizResult?.totalQuestions || 0}
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button
//             onClick={() => {
//               setDialogOpen(false);
//               router.push(`/skill-list`);
//             }}
//           >
//             Hoàn thành
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Layout>
//   );
// };

// export default SkillPracticePage;

"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import apiService from "@/app/untils/api";
import Layout from "@/app/components/user/Home/layout";
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Divider,
  Button,
} from "@mui/material";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/AuthContext";
// import { Button } from "../../button";
import TextField from "../../textfield";
import { Key } from "@mui/icons-material";
const SkillPracticePage = () => {
  const router = useRouter();
  const { quizId } = useParams();
  const [questions, setQuestions] = useState<any[]>([]);
  // const [answers, setAnswers] = useState<any[]>([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(0); // 10 minutes in seconds
  const { accessToken } = useAuth();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [quizDuration, setQuizDuration] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleTextFieldChange = (e) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentPage] = {
      inputAnswer: e.target.value,
    };
    setAnswers(updatedAnswers);
  };
  const handleRadioChange = (e) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentPage] = {
      selectedAnswerIndex: e.target.value,
    };
    setAnswers(updatedAnswers);
  };

  // Hàm xử lý khi Checkbox thay đổi
  const handleCheckboxChange = (index, e) => {
    const updatedAnswers = [...answers];
    const selectedAnswers = updatedAnswers[currentPage]?.selectedAnswers || [];

    if (e.target.checked) {
      selectedAnswers.push(index);
    } else {
      const idx = selectedAnswers.indexOf(index);
      if (idx > -1) selectedAnswers.splice(idx, 1);
    }

    updatedAnswers[currentPage] = {
      selectedAnswers,
    };
    setAnswers(updatedAnswers);
  };
  const handleNext = () => {
    if (currentPage < questions.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const question = questions[currentPage];

  useEffect(() => {
    // Countdown timer
    if (isSubmitted) return; // Nếu đã nộp bài thì không chạy timer nữa
  
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer); // Dừng timer khi hết giờ
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  
    return () => clearInterval(timer); // Clean up interval on component unmount
  }, [isSubmitted]); // Khi isSubmitted thay đổi thì sẽ chạy lại
  

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = { selectedAnswerIndex: answerIndex };
    setAnswers(updatedAnswers);
  };

  useEffect(() => {
    if (timeLeft > 0) {
      // Chỉ chạy timer nếu timeLeft > 0
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer); // Dừng timer khi hết giờ
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer); // Clean up interval
    }
  }, [timeLeft]); // Thêm timeLeft vào dependency

  useEffect(() => {
    if (quizId) {
      setLoading(true);
      apiService
        .get(`/quizzes/${quizId}/questions`)
        .then((response) => {
          console.log("responseQ", response);
          setQuestions(response.data.data.questions);

          // Lấy quizDuration từ response
          const duration = response.data.data.quizDuration || 10; // Mặc định 10 nếu không có
          setQuizDuration(duration); // Lưu quizDuration vào state
          setTimeLeft(duration * 60); // Đặt thời gian đếm ngược
        })
        .catch((error) => {
          console.error("Error fetching questions:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [quizId]);

  const handleSubmit = () => {
    if (isSubmitted) return; // Nếu đã nộp bài, không thực hiện gì thêm.
  
    const totalQuizTime = quizDuration * 60; // Tổng thời gian quiz tính bằng giây
    const timeSpent = totalQuizTime - timeLeft; // Thời gian đã sử dụng
  
    const payload = {
      timeSpent,
      answers: answers
        .map((answer, index) => {
          const question = questions[index];
          if (question.questionType === "MULTIPLE_CHOICE") {
            return {
              questionId: question.questionId,
              selectedAnswer: question.options[answer.selectedAnswerIndex],
            };
          } else if (question.questionType === "MULTI_SELECT") {
            return {
              questionId: question.questionId,
              selectedAnswers: answer.selectedAnswers.map((idx) => question.options[idx]),
            };
          } else if (question.questionType === "FILL_IN_THE_BLANK") {
            return {
              questionId: question.questionId,
              selectedAnswer: answer.inputAnswer,
            };
          }
          return null;
        })
        .filter(Boolean),
    };
  
    console.log("payload", payload);
  
    apiService
      .post(`/quizzes/${quizId}/submit-quiz`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        console.log("Quiz submitted successfully", response.data);
        setQuizResult(response.data.data);
        setDialogOpen(true);
        setIsSubmitted(true); // Đánh dấu đã nộp bài
      })
      .catch((error) => {
        console.error("Error submitting quiz:", error.response?.data || error.message);
      });
  };
  useEffect(() => {
    if (timeLeft === 0 && !isSubmitted) {
      handleSubmit(); // Gọi hàm nộp bài khi hết giờ
    }
  }, [timeLeft, isSubmitted]);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <Layout>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "#EFF3E6",
          }}
        >
          <Typography variant="h5">Loading questions...</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#EFF3E6",
          padding: "40px 120px",
          height: "100%",
          // alignItem: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            // padding: "40px",
            // alignItems: "center",
            // justifyContent: "space-between",
            bgcolor: "#FFFFFF",
            border: "1px solid #ccc",
            borderRadius: 4,
            flex: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: "32px",
              fontWeight: "600",
              textAlign: "center",
              paddingY: "8px",
            }}
          >
            Luyện tập Quiz
          </Typography>
          <Divider />
          {/* Timer */}

          {/* Left Section: Question Area */}
          <Box sx={{}}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center", // To align the left and right sections
                padding: "40px",
                gap: "20px",
                // backgroundColor: "#EFF3E6",
                // alignItems: "flex-start",
              }}
            >
              <Box
                sx={{
                  flex: 3,
                  display: "flex",
                  flexDirection: "column",
                  // alignItems: "center",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                }}
              >
                {/* Question display */}
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography
                    fontSize="16px"
                    fontWeight={700}
                    sx={{
                      padding: "8px 20px",
                      backgroundColor: "#99BC4D",
                      borderTopLeftRadius: "16px",
                      borderTopRightRadius: "16px",
                      color: "#fff",
                    }}
                  >
                    Câu hỏi số {currentPage + 1}
                  </Typography>
                  <Divider />
                  <Box
                    sx={{
                      marginBottom: "20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      padding: "20px",
                    }}
                  >
                    <Typography fontSize="16px" fontWeight={700}>
                      {question.content}
                    </Typography>

                    {/* Render the different question types (radio, checkbox, text input) */}
                    <FormControl
                      component="fieldset"
                      // sx={{ alignItems: "center" }}
                    >
                      {question.image && (
                        <img
                          src={question.image}
                          alt="Question"
                          style={{ maxWidth: "50%" }}
                        />
                      )}
                      {question.questionType === "FILL_IN_THE_BLANK" && (
                        <TextField
                          value={answers[currentPage]?.inputAnswer || ""}
                          onChange={(e) => {
                            const updatedAnswers = [...answers];
                            updatedAnswers[currentPage] = {
                              inputAnswer: e.target.value,
                            };
                            setAnswers(updatedAnswers);
                          }}
                          sx={{ width: "30%", bgcolor: "white" }}
                          disabled={timeLeft === 0}
                        />
                      )}
                      {question.questionType === "MULTIPLE_CHOICE" && (
                        <RadioGroup
                          value={
                            answers[currentPage]?.selectedAnswerIndex ?? -1
                          }
                          onChange={(e) =>
                            handleAnswerChange(
                              currentPage,
                              parseInt(e.target.value)
                            )
                          }
                          disabled={timeLeft === 0}
                          sx={{ display: "flex", flexDirection: "column" }}
                        >
                          {question.options.map((option, index) => (
                            <FormControlLabel
                              key={index}
                              value={index.toString()}
                              control={<Radio />}
                              label={option}
                              sx={{
                                "& .MuiTypography-root": { fontSize: "16px" },
                              }} // Sửa fontSize của label
                            />
                          ))}
                        </RadioGroup>
                      )}

                      {question.questionType === "MULTI_SELECT" && (
                        <Box>
                          {question.options.map((option, index) => (
                            <FormControlLabel
                              key={index}
                              sx={{
                                display: "flex",
                                flexDirection: "row",
                                "& .MuiTypography-root": { fontSize: "16px" }, // Sửa fontSize của label
                              }}
                              control={
                                <Checkbox
                                  checked={
                                    answers[
                                      currentPage
                                    ]?.selectedAnswers?.includes(index) || false
                                  }
                                  onChange={(e) => {
                                    const updatedAnswers = [...answers];
                                    const selectedAnswers =
                                      updatedAnswers[currentPage]
                                        ?.selectedAnswers || [];
                                    if (e.target.checked) {
                                      selectedAnswers.push(index);
                                    } else {
                                      const idx =
                                        selectedAnswers.indexOf(index);
                                      if (idx > -1)
                                        selectedAnswers.splice(idx, 1);
                                    }
                                    updatedAnswers[currentPage] = {
                                      selectedAnswers,
                                    };
                                    setAnswers(updatedAnswers);
                                  }}
                                />
                              }
                              label={option}
                            />
                          ))}
                        </Box>
                      )}
                    </FormControl>
                  </Box>

                  {/* Navigation buttons */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "20px",
                      paddingX: "20px",
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={handlePrevious}
                      disabled={currentPage === 0}
                      sx={{textTransform: "none"}}
                    >
                      <KeyboardDoubleArrowLeftIcon /> Câu hỏi trước
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleNext}
                      disabled={currentPage === questions.length - 1}
                      sx={{textTransform: "none"}}
                    >
                      Câu hỏi sau <KeyboardDoubleArrowRightIcon />
                    </Button>
                  </Box>
                </Box>
              </Box>

              {/* Right Section: Side panel for Question Numbers and Submit button */}
              <Box
                sx={{
                  flex: 1,
                  width: "250px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  // paddingX: "20px",
                  backgroundColor: "#fff",
                  // boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Typography
                  sx={{
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    border: "1px solid #ccc",
                    padding: "8px",
                    bgcolor: "#99BC4D",
                    color: "#fff",
                  }}
                  fontSize="24px"
                >
                  <AccessAlarmIcon sx={{ fontSize: "24px" }} />{" "}
                  {formatTime(timeLeft)}
                </Typography>
                {/* Question numbers */}
                <Box
                  sx={{
                    padding: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    border: "1px solid #ccc",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{
                      textAlign: "center",
                      borderBottom: "1px dashed #ccc",
                      padding: "8px",
                    }}
                  >
                    Danh sách câu hỏi
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      // justifyContent: "center",
                      gap: "8px",
                      marginY: "20px",
                      flexWrap: "wrap",
                    }}
                  >
                    {questions.map((_, index) => {
                      const isAnswered =
                        answers[index] &&
                        (answers[index]?.inputAnswer ||
                          answers[index]?.selectedAnswers?.length > 0 ||
                          answers[index]?.selectedAnswerIndex !== undefined); // Câu hỏi đã trả lời khi có giá trị trả lời
                      const isCurrent = index === currentPage;
                      // const isSelected =
                      //   answers[index]?.selectedAnswerIndex !== undefined;

                      return (
                        <Button
                          key={index}
                          variant="contained"
                          onClick={() => setCurrentPage(index)}
                          sx={{
                            backgroundColor: isCurrent
                              ? isAnswered
                                ? "#99BC4D" // Xanh lá khi đã trả lời
                                : "#FF9900" // Cam khi chưa trả lời
                              : isAnswered
                                ? "#99BC4D"
                                : "transparent", // Màu xám khi chưa trả lời
                            color: isCurrent
                              ? isAnswered
                                ? "#fff"
                                : "#fff"
                              : isAnswered
                                ? "#fff"
                                : "#000",
                            "&:hover": {
                              backgroundColor: isCurrent
                                ? isAnswered
                                  ? "#7A9F38"
                                  : "#FF7A00"
                                : isAnswered
                                  ? "#7A9F38"
                                  : "#D9D9D9",
                            },
                            // border: isSelected ? "2px solid #4CAF50" : "none", // Thêm viền xanh khi đã chọn câu trả lời
                          }}
                        >
                          {index + 1}
                        </Button>
                      );
                    })}
                  </Box>
                </Box>

                {/* Submit button */}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={timeLeft === 0}
                  sx={{textTransform: "none", ":hover": {backgroundColor: "#99BC4D"}, color: "#FFF"}}
                >
                  Nộp bài
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Dialog for quiz results */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle fontSize="24px">
          Chúc mừng bạn đã hoàn thành Bài luyện tập!
        </DialogTitle>
        <DialogContent>
          <Typography>Số điểm: {quizResult?.points || 0}/10</Typography>
          <Typography>
            Số câu đúng: {quizResult?.correctAnswers || 0}/
            {quizResult?.totalQuestions || 0}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDialogOpen(false);
              router.push(`/skill-list`);
            }}
            sx={{textTransform: "none", ":hover": {backgroundColor: "#99BC4D"}, color: "#FFF", marginRight: 2}}
            variant="contained"
          >
            Hoàn thành
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default SkillPracticePage;
