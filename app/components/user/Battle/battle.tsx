// import React, { useState, useEffect, useRef } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Layout from "@/app/components/user/Home/layout";
// import { useAuth } from "@/app/hooks/AuthContext";
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
//   Divider,
//   Button,
// } from "@mui/material";
// import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
// import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
// import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
// import TextField from "@/app/components/textfield";

// export default function BattleDetailPage() {
//     const router = useRouter();
//     const { battleId } = useParams();
//     const { userInfo, accessToken } = useAuth();
//     const [battleData, setBattleData] = useState(null);
//     const [questions, setQuestions] = useState([]);
//     const [answers, setAnswers] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [timeLeft, setTimeLeft] = useState(0);
//     const [currentPage, setCurrentPage] = useState(0);
//     const [isSubmitted, setIsSubmitted] = useState(false);
//     const [dialogOpen, setDialogOpen] = useState(false);
//     const [battleResult, setBattleResult] = useState(null);
//     const [websocket, setWebsocket] = useState(null);
//     const wsRef = useRef(null);

//     // WebSocket connection
//     useEffect(() => {
//         if (battleId && userInfo && accessToken) {
//             const ws = new WebSocket(`ws://localhost:8080/ws/battle?battleId=${battleId}&userId=${userInfo.userId}&battle-token=${accessToken}`);
//             wsRef.current = ws;
//             setWebsocket(ws);

//             ws.onopen = () => {
//                 console.log('WebSocket connected');
//             };

//             ws.onmessage = (event) => {
//                 const data = JSON.parse(event.data);
//                 console.log('WebSocket message received:', data);

//                 switch (data.type) {
//                     case 'BATTLE_START':
//                         setBattleData(data.battleData);
//                         setQuestions(data.questions || []);
//                         setTimeLeft(data.timeLimit || 300); // 5 minutes default
//                         setLoading(false);
//                         break;
                    
//                     case 'QUESTION_UPDATE':
//                         setQuestions(data.questions || []);
//                         break;
                    
//                     case 'BATTLE_UPDATE':
//                         setBattleData(data.battleData);
//                         break;
                    
//                     case 'BATTLE_END':
//                         setBattleResult(data.result);
//                         setDialogOpen(true);
//                         setIsSubmitted(true);
//                         break;
                    
//                     case 'OPPONENT_ANSWER':
//                         // Handle opponent's answer if needed
//                         console.log('Opponent answered:', data);
//                         break;
                    
//                     default:
//                         console.log('Unknown message type:', data.type);
//                 }
//             };

//             ws.onerror = (error) => {
//                 console.error('WebSocket error:', error);
//                 setError('Connection error occurred');
//             };

//             ws.onclose = () => {
//                 console.log('WebSocket disconnected');
//             };

//             return () => {
//                 if (ws.readyState === WebSocket.OPEN) {
//                     ws.close();
//                 }
//             };
//         }
//     }, [battleId, userInfo, accessToken]);

//     // Timer countdown
//     useEffect(() => {
//         if (timeLeft > 0 && !isSubmitted) {
//             const timer = setTimeout(() => {
//                 setTimeLeft(timeLeft - 1);
//             }, 1000);
//             return () => clearTimeout(timer);
//         } else if (timeLeft === 0 && !isSubmitted) {
//             handleSubmit();
//         }
//     }, [timeLeft, isSubmitted]);

//     // Handle answer changes
//     const handleAnswerChange = (questionIndex, answerIndex) => {
//         const updatedAnswers = [...answers];
//         updatedAnswers[questionIndex] = { selectedAnswerIndex: answerIndex };
//         setAnswers(updatedAnswers);
        
//         // Send answer to WebSocket
//         if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//             wsRef.current.send(JSON.stringify({
//                 type: 'ANSWER_SUBMIT',
//                 questionIndex,
//                 answer: answerIndex,
//                 timestamp: Date.now()
//             }));
//         }
//     };

//     const handleTextFieldChange = (e) => {
//         const updatedAnswers = [...answers];
//         updatedAnswers[currentPage] = {
//             inputAnswer: e.target.value,
//         };
//         setAnswers(updatedAnswers);
        
//         // Send answer to WebSocket
//         if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//             wsRef.current.send(JSON.stringify({
//                 type: 'ANSWER_SUBMIT',
//                 questionIndex: currentPage,
//                 answer: e.target.value,
//                 timestamp: Date.now()
//             }));
//         }
//     };

//     const handleCheckboxChange = (index, e) => {
//         const updatedAnswers = [...answers];
//         const selectedAnswers = updatedAnswers[currentPage]?.selectedAnswers || [];

//         if (e.target.checked) {
//             selectedAnswers.push(index);
//         } else {
//             const idx = selectedAnswers.indexOf(index);
//             if (idx > -1) selectedAnswers.splice(idx, 1);
//         }

//         updatedAnswers[currentPage] = {
//             selectedAnswers,
//         };
//         setAnswers(updatedAnswers);
        
//         // Send answer to WebSocket
//         if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//             wsRef.current.send(JSON.stringify({
//                 type: 'ANSWER_SUBMIT',
//                 questionIndex: currentPage,
//                 answer: selectedAnswers,
//                 timestamp: Date.now()
//             }));
//         }
//     };

//     const handleNext = () => {
//         if (currentPage < questions.length - 1) {
//             setCurrentPage(currentPage + 1);
//         }
//     };

//     const handlePrevious = () => {
//         if (currentPage > 0) {
//             setCurrentPage(currentPage - 1);
//         }
//     };

//     const handleSubmit = () => {
//         if (isSubmitted) return;

//         // Send final submission to WebSocket
//         if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//             wsRef.current.send(JSON.stringify({
//                 type: 'BATTLE_SUBMIT',
//                 answers: answers,
//                 timestamp: Date.now()
//             }));
//         }
        
//         setIsSubmitted(true);
//     };

//     // Format time display
//     const formatTime = (seconds) => {
//         const minutes = Math.floor(seconds / 60);
//         const remainingSeconds = seconds % 60;
//         return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
//     };

//     // Find current user and opponent
//     const getCurrentUserAndOpponent = () => {
//         if (!battleData || !userInfo) return { currentUser: null, opponent: null };

//         const currentUser = battleData?.playerScores?.find(
//             player => player.userId === userInfo.userId
//         );
//         const opponent = battleData?.playerScores?.find(
//             player => player.userId !== userInfo.userId
//         );

//         return { currentUser, opponent };
//     };

//     if (loading) {
//         return (
//             <Layout>
//                 <Box
//                     sx={{
//                         display: "flex",
//                         flexDirection: "column",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         height: "100vh",
//                         backgroundColor: "#EFF3E6",
//                     }}
//                 >
//                     <Typography variant="h5">Connecting to battle...</Typography>
//                 </Box>
//             </Layout>
//         );
//     }

//     if (error) {
//         return (
//             <Layout>
//                 <Box
//                     sx={{
//                         display: "flex",
//                         flexDirection: "column",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         height: "100vh",
//                         backgroundColor: "#EFF3E6",
//                     }}
//                 >
//                     <Typography variant="h5" color="error">{error}</Typography>
//                 </Box>
//             </Layout>
//         );
//     }

//     const { currentUser, opponent } = getCurrentUserAndOpponent();
//     const question = questions[currentPage];

//     if (!question) {
//         return (
//             <Layout>
//                 <Box
//                     sx={{
//                         display: "flex",
//                         flexDirection: "column",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         height: "100vh",
//                         backgroundColor: "#EFF3E6",
//                     }}
//                 >
//                     <Typography variant="h5">Waiting for questions...</Typography>
//                 </Box>
//             </Layout>
//         );
//     }

//     return (
//         <Layout>
//             <Box
//                 sx={{
//                     display: "flex",
//                     flexDirection: "column",
//                     backgroundColor: "#EFF3E6",
//                     padding: "40px 120px",
//                     height: "100%",
//                 }}
//             >
//                 <Box
//                     sx={{
//                         display: "flex",
//                         flexDirection: "column",
//                         bgcolor: "#FFFFFF",
//                         border: "1px solid #ccc",
//                         borderRadius: 4,
//                         flex: 1,
//                     }}
//                 >
//                     {/* Header */}
//                     <Typography
//                         sx={{
//                             fontSize: "32px",
//                             fontWeight: "600",
//                             textAlign: "center",
//                             paddingY: "8px",
//                         }}
//                     >
//                         Battle Arena
//                     </Typography>
//                     <Divider />

//                     {/* Battle Status Bar */}
//                     <Box
//                         sx={{
//                             display: "flex",
//                             justifyContent: "space-between",
//                             alignItems: "center",
//                             padding: "16px 40px",
//                             backgroundColor: "#f5f5f5",
//                         }}
//                     >
//                         <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//                             <Box
//                                 sx={{
//                                     width: 40,
//                                     height: 40,
//                                     backgroundColor: "#2196F3",
//                                     borderRadius: "50%",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     color: "white",
//                                     fontWeight: "bold",
//                                 }}
//                             >
//                                 {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
//                             </Box>
//                             <Box>
//                                 <Typography fontSize="14px" color="gray">You</Typography>
//                                 <Typography fontWeight="bold">{currentUser?.score || 0} pts</Typography>
//                             </Box>
//                         </Box>

//                         <Typography
//                             sx={{
//                                 fontSize: "24px",
//                                 fontWeight: "bold",
//                                 color: timeLeft < 60 ? "red" : "#99BC4D",
//                             }}
//                         >
//                             VS
//                         </Typography>

//                         <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//                             <Box>
//                                 <Typography fontSize="14px" color="gray" textAlign="right">Opponent</Typography>
//                                 <Typography fontWeight="bold" textAlign="right">{opponent?.score || 0} pts</Typography>
//                             </Box>
//                             <Box
//                                 sx={{
//                                     width: 40,
//                                     height: 40,
//                                     backgroundColor: "#f44336",
//                                     borderRadius: "50%",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     color: "white",
//                                     fontWeight: "bold",
//                                 }}
//                             >
//                                 {opponent?.username?.charAt(0).toUpperCase() || 'O'}
//                             </Box>
//                         </Box>
//                     </Box>

//                     {/* Main Content */}
//                     <Box
//                         sx={{
//                             display: "flex",
//                             justifyContent: "center",
//                             padding: "40px",
//                             gap: "20px",
//                         }}
//                     >
//                         {/* Question Area */}
//                         <Box
//                             sx={{
//                                 flex: 3,
//                                 display: "flex",
//                                 flexDirection: "column",
//                                 border: "1px solid #ccc",
//                                 borderRadius: 4,
//                             }}
//                         >
//                             <Typography
//                                 fontSize="16px"
//                                 fontWeight={700}
//                                 sx={{
//                                     padding: "8px 20px",
//                                     backgroundColor: "#99BC4D",
//                                     borderTopLeftRadius: "16px",
//                                     borderTopRightRadius: "16px",
//                                     color: "#fff",
//                                 }}
//                             >
//                                 Câu hỏi số {currentPage + 1}
//                             </Typography>
//                             <Divider />
//                             <Box
//                                 sx={{
//                                     marginBottom: "20px",
//                                     display: "flex",
//                                     flexDirection: "column",
//                                     gap: 2,
//                                     padding: "20px",
//                                 }}
//                             >
//                                 <Typography fontSize="16px" fontWeight={700}>
//                                     {question.content}
//                                 </Typography>

//                                 <FormControl component="fieldset">
//                                     {question.image && (
//                                         <img
//                                             src={question.image}
//                                             alt="Question"
//                                             style={{ maxWidth: "50%" }}
//                                         />
//                                     )}
                                    
//                                     {question.questionType === "FILL_IN_THE_BLANK" && (
//                                         <TextField
//                                             value={answers[currentPage]?.inputAnswer || ""}
//                                             onChange={handleTextFieldChange}
//                                             sx={{ width: "30%", bgcolor: "white" }}
//                                             disabled={timeLeft === 0 || isSubmitted}
//                                         />
//                                     )}
                                    
//                                     {question.questionType === "MULTIPLE_CHOICE" && (
//                                         <RadioGroup
//                                             value={answers[currentPage]?.selectedAnswerIndex ?? -1}
//                                             onChange={(e) => handleAnswerChange(currentPage, parseInt(e.target.value))}
//                                             disabled={timeLeft === 0 || isSubmitted}
//                                             sx={{ display: "flex", flexDirection: "column" }}
//                                         >
//                                             {question.options
//                                                 .filter((option) => option.trim() !== "")
//                                                 .map((option, index) => (
//                                                     <FormControlLabel
//                                                         key={index}
//                                                         value={index.toString()}
//                                                         control={<Radio />}
//                                                         label={option}
//                                                         sx={{
//                                                             "& .MuiTypography-root": { fontSize: "16px" },
//                                                         }}
//                                                     />
//                                                 ))}
//                                         </RadioGroup>
//                                     )}

//                                     {question.questionType === "MULTI_SELECT" && (
//                                         <Box>
//                                             {question.options
//                                                 .filter((option) => option.trim() !== "")
//                                                 .map((option, index) => (
//                                                     <FormControlLabel
//                                                         key={index}
//                                                         sx={{
//                                                             display: "flex",
//                                                             flexDirection: "row",
//                                                             "& .MuiTypography-root": { fontSize: "16px" },
//                                                         }}
//                                                         control={
//                                                             <Checkbox
//                                                                 checked={
//                                                                     answers[currentPage]?.selectedAnswers?.includes(index) || false
//                                                                 }
//                                                                 onChange={(e) => handleCheckboxChange(index, e)}
//                                                                 disabled={timeLeft === 0 || isSubmitted}
//                                                             />
//                                                         }
//                                                         label={option}
//                                                     />
//                                                 ))}
//                                         </Box>
//                                     )}
//                                 </FormControl>
//                             </Box>

//                             {/* Navigation buttons */}
//                             <Box
//                                 sx={{
//                                     display: "flex",
//                                     justifyContent: "space-between",
//                                     marginBottom: "20px",
//                                     paddingX: "20px",
//                                 }}
//                             >
//                                 <Button
//                                     variant="outlined"
//                                     onClick={handlePrevious}
//                                     disabled={currentPage === 0}
//                                     sx={{ textTransform: "none" }}
//                                 >
//                                     <KeyboardDoubleArrowLeftIcon /> Câu hỏi trước
//                                 </Button>
//                                 <Button
//                                     variant="outlined"
//                                     onClick={handleNext}
//                                     disabled={currentPage === questions.length - 1}
//                                     sx={{ textTransform: "none" }}
//                                 >
//                                     Câu hỏi sau <KeyboardDoubleArrowRightIcon />
//                                 </Button>
//                             </Box>
//                         </Box>

//                         {/* Side Panel */}
//                         <Box
//                             sx={{
//                                 flex: 1,
//                                 width: "250px",
//                                 display: "flex",
//                                 flexDirection: "column",
//                                 gap: "20px",
//                                 backgroundColor: "#fff",
//                             }}
//                         >
//                             {/* Timer */}
//                             <Typography
//                                 sx={{
//                                     textAlign: "center",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     gap: 1,
//                                     border: "1px solid #ccc",
//                                     padding: "8px",
//                                     bgcolor: timeLeft < 60 ? "#ff4444" : "#99BC4D",
//                                     color: "#fff",
//                                 }}
//                                 fontSize="24px"
//                             >
//                                 <AccessAlarmIcon sx={{ fontSize: "24px" }} />
//                                 {formatTime(timeLeft)}
//                             </Typography>

//                             {/* Question List */}
//                             <Box
//                                 sx={{
//                                     padding: 1,
//                                     display: "flex",
//                                     flexDirection: "column",
//                                     gap: 2,
//                                     border: "1px solid #ccc",
//                                     borderRadius: 2,
//                                 }}
//                             >
//                                 <Typography
//                                     variant="h6"
//                                     fontWeight={700}
//                                     sx={{
//                                         textAlign: "center",
//                                         borderBottom: "1px dashed #ccc",
//                                         padding: "8px",
//                                     }}
//                                 >
//                                     Danh sách câu hỏi
//                                 </Typography>
//                                 <Box
//                                     sx={{
//                                         display: "flex",
//                                         gap: "8px",
//                                         marginY: "20px",
//                                         flexWrap: "wrap",
//                                     }}
//                                 >
//                                     {questions.map((_, index) => {
//                                         const isAnswered =
//                                             answers[index] &&
//                                             (answers[index]?.inputAnswer ||
//                                                 answers[index]?.selectedAnswers?.length > 0 ||
//                                                 answers[index]?.selectedAnswerIndex !== undefined);
//                                         const isCurrent = index === currentPage;

//                                         return (
//                                             <Button
//                                                 key={index}
//                                                 variant="contained"
//                                                 onClick={() => setCurrentPage(index)}
//                                                 sx={{
//                                                     backgroundColor: isCurrent
//                                                         ? isAnswered
//                                                             ? "#99BC4D"
//                                                             : "#FF9900"
//                                                         : isAnswered
//                                                             ? "#99BC4D"
//                                                             : "transparent",
//                                                     color: isCurrent
//                                                         ? "#fff"
//                                                         : isAnswered
//                                                             ? "#fff"
//                                                             : "#000",
//                                                     "&:hover": {
//                                                         backgroundColor: isCurrent
//                                                             ? isAnswered
//                                                                 ? "#7A9F38"
//                                                                 : "#FF7A00"
//                                                             : isAnswered
//                                                                 ? "#7A9F38"
//                                                                 : "#D9D9D9",
//                                                     },
//                                                 }}
//                                             >
//                                                 {index + 1}
//                                             </Button>
//                                         );
//                                     })}
//                                 </Box>
//                             </Box>

//                             {/* Submit Button */}
//                             <Button
//                                 variant="contained"
//                                 color="primary"
//                                 onClick={handleSubmit}
//                                 disabled={timeLeft === 0 || isSubmitted}
//                                 sx={{
//                                     textTransform: "none",
//                                     ":hover": { backgroundColor: "#99BC4D" },
//                                     color: "#FFF",
//                                 }}
//                             >
//                                 {isSubmitted ? "Đã nộp bài" : "Nộp bài"}
//                             </Button>
//                         </Box>
//                     </Box>
//                 </Box>
//             </Box>

//             {/* Battle Result Dialog */}
//             <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
//                 {dialogOpen && battleResult && (
//                     <Box sx={{ paddingX: "20px", backgroundColor: "#fff" }}>
//                         <DialogTitle>
//                             <Typography fontSize="20px" fontWeight={600} textAlign="center">
//                                 Kết quả Battle
//                             </Typography>
//                         </DialogTitle>
//                         <DialogContent>
//                             <Box sx={{ textAlign: "center", marginBottom: "20px" }}>
//                                 <Typography variant="h4" fontWeight="bold" color={
//                                     battleResult.winner === userInfo.userId ? "green" : "red"
//                                 }>
//                                     {battleResult.winner === userInfo.userId ? "CHIẾN THẮNG!" : "THẤT BẠI!"}
//                                 </Typography>
//                             </Box>
//                             <Box sx={{ display: "flex", justifyContent: "space-around", marginBottom: "20px" }}>
//                                 <Box sx={{ textAlign: "center" }}>
//                                     <Typography variant="h6">Bạn</Typography>
//                                     <Typography variant="h4" fontWeight="bold" color="blue">
//                                         {battleResult.playerScores.find(p => p.userId === userInfo.userId)?.score || 0}
//                                     </Typography>
//                                 </Box>
//                                 <Box sx={{ textAlign: "center" }}>
//                                     <Typography variant="h6">Đối thủ</Typography>
//                                     <Typography variant="h4" fontWeight="bold" color="red">
//                                         {battleResult.playerScores.find(p => p.userId !== userInfo.userId)?.score || 0}
//                                     </Typography>
//                                 </Box>
//                             </Box>
//                         </DialogContent>
//                         <DialogActions>
//                             <Button
//                                 variant="contained"
//                                 color="primary"
//                                 onClick={() => router.push('/battles')}
//                                 sx={{ textTransform: "none" }}
//                             >
//                                 Quay lại danh sách Battle
//                             </Button>
//                         </DialogActions>
//                     </Box>
//                 )}
//             </Dialog>
//         </Layout>
//     );
// }