// "use client";
// import { useEffect, useState } from "react";
// import { useParams, useSearchParams } from "next/navigation";
// import apiService from "@/app/untils/api"; // Đảm bảo bạn có API service để gọi API
// import Layout from "@/app/components/user/Home/layout";
// import { Box, Typography } from "@mui/material";
// import { Button } from "../../button";

// const SkillDetailPage = () => {
//   const { lessonId } = useParams(); // Lấy lessonId từ URL
//   const searchParams = useSearchParams();
//   const [lesson, setLesson] = useState<any>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const grade = searchParams.get("grade");
//   useEffect(() => {
//     if (lessonId) {
//       setLoading(true);
//       apiService
//         .get(`/lessons/${lessonId}`)
//         .then((response) => {
//           setLesson(response.data.data);
//         })
//         .catch((error) => {
//           console.error("Error fetching lesson details:", error);
//         })
//         .finally(() => {
//           setLoading(false);
//         });
//     }
//   }, [lessonId]);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (!lesson) {
//     return <div>Lesson not found</div>;
//   }

//   return (
//     <Layout>
//       <Box
//         sx={{
//           display: "flex",
//           flexDirection: "column",
//           padding: "40px",
//           gap: "20px",
//           backgroundColor: "#EFF3E6",
//           alignItems: "center",
//         }}
//       >
//         <Box
//           sx={{
//             backgroundColor: "white",
//             display: "flex",
//             flexDirection: "column",
//           }}
//         >
//           <video controls>
//             <source src={lesson.content} type="video/mp4" />
//             Your browser does not support the video tag.
//           </video>
//           <Box
//             sx={{
//               padding: 2,
//               display: "flex",
//               flexDirection: "column",
//               gap: 1,
//             }}
//           >
//             <Typography fontWeight={700}>{grade && `${grade}`}</Typography>
//             <Typography fontSize="20px">{lesson.lessonName}</Typography>
//             {/* <p>{lesson.description}</p> */}
//             <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
//               <Button>Thực hành ngay</Button>
//             </Box>
//           </Box>
//         </Box>
//       </Box>
//     </Layout>
//   );
// };

// export default SkillDetailPage;
"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import apiService from "@/app/untils/api"; // Ensure you have the apiService for calling APIs
import Layout from "@/app/components/user/Home/layout";
import { Box, Typography, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Button } from "../../button";

const SkillDetailPage = () => {
  const { lessonId } = useParams(); // Get lessonId from the URL
  const searchParams = useSearchParams();
  const router = useRouter(); // Router for navigation
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quizzes, setQuizzes] = useState<any[]>([]); // State to store quizzes
  const [dialogOpen, setDialogOpen] = useState<boolean>(false); // Dialog open/close state
  const grade = searchParams.get("grade");

  useEffect(() => {
    if (lessonId) {
      setLoading(true);
      apiService
        .get(`/lessons/${lessonId}`)
        .then((response) => {
          setLesson(response.data.data);
        })
        .catch((error) => {
          console.error("Error fetching lesson details:", error);
        })
        .finally(() => {
          setLoading(false);
        });

      // Fetch quizzes related to the lesson
      apiService
        .get(`/lessons/${lessonId}/quizzes`)
        .then((response) => {
          setQuizzes(response.data.data.quizzes);
        })
        .catch((error) => {
          console.error("Error fetching quizzes:", error);
        });
    }
  }, [lessonId]);

  const handleQuizClick = (quizId: string) => {
    // Navigate to SkillPracticePage with the selected quizId
    router.push(`/skill-practice/${quizId}`);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!lesson) {
    return <div>Lesson not found</div>;
  }

  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          padding: "40px",
          gap: "20px",
          backgroundColor: "#EFF3E6",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            backgroundColor: "white",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <video controls>
            <source src={lesson.content} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <Box
            sx={{
              padding: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography fontWeight={700}>{grade && `${grade}`}</Typography>
            <Typography fontSize="20px">{lesson.lessonName}</Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={() => setDialogOpen(true)}>Thực hành ngay</Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Dialog to display quizzes */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} >
        <DialogTitle sx={{minWidth: "400px"}}>Chọn Quiz</DialogTitle>
        <DialogContent>
          {quizzes.map((quiz: any) => (
            <Box key={quiz.quizId} sx={{ marginBottom: "10px" }}>
              <Button onClick={() => handleQuizClick(quiz.quizId)}>
                {quiz.title}
              </Button>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default SkillDetailPage;
