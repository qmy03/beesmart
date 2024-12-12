import React, { useEffect, useState } from "react";
import Layout from "@/app/components/user/Home/layout";
import { Box, CssBaseline, MenuItem, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/AuthContext";
import apiService from "@/app/untils/api";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import TextField from "@/app/components/textfield";

const DashboardReportPage: React.FC = () => {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [studentStats, setStudentStats] = useState<any>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [activeStudent, setActiveStudent] = useState<any>(null); // To track active student
  const [daysDifference, setDaysDifference] = useState<number>(0);

  useEffect(() => {
    // Set default date range as the past 7 days
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const formatDate = (date: Date) =>
      `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

    setStartDate(formatDate(sevenDaysAgo));
    setEndDate(formatDate(today));
  }, []);

  useEffect(() => {
    // Calculate the difference in days when startDate or endDate changes
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const timeDiff = end.getTime() - start.getTime();
      const daysDiff = timeDiff / (1000 * 3600 * 24); // Convert milliseconds to days
      setDaysDifference(daysDiff);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (accessToken) {
      apiService
        .get("/grades")
        .then((response) => {
          if (response.data) {
            setGrades(response.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching grades:", error);
        });
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      apiService
        .get("/users/parent/students", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          if (response.data && response.data.status === 200) {
            setStudents(response.data.data);
            setActiveStudent(response.data.data[0]); // Set the first student as active by default
          }
        })
        .catch((error) => {
          console.error("Error fetching students:", error);
        });
    }
  }, [accessToken]);

  const formatDateForBackend = (date: string) => {
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`; // Đổi từ yyyy-mm-dd thành dd-mm-yyyy
  };

  useEffect(() => {
    // Set the selected grade when the active student changes
    if (activeStudent) {
      setSelectedGrade(activeStudent.grade); // Update the selected grade based on the active student
    }
  }, [activeStudent]);

  // Example: sending data to backend
  useEffect(() => {
    if (activeStudent && startDate && endDate) {
      const formattedStartDate = formatDateForBackend(startDate);
      const formattedEndDate = formatDateForBackend(endDate);

      console.log("formattedStartDate", formattedStartDate); // Kiểm tra định dạng dd-mm-yyyy
      console.log("formattedEndDate", formattedEndDate);

      apiService
        .get(
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

  const handleStudentClick = (student: any) => {
    setActiveStudent(student); // Set clicked student as active
  };

  return (
    <Layout>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          backgroundColor: "#EFF3E6",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 80px 0px 80px",
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
            sx={{ maxWidth: "100px" }}
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            label=""
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
        <Typography
          fontSize="20px"
          color="#000000"
          fontWeight={700}
          textAlign="center"
        >
          Đánh giá chung
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {students.length > 0 ? (
            students.map((student, index) => (
              <div
                key={index}
                style={{
                  display: "inline-block",
                  margin: "10px",
                  cursor: "pointer",
                }}
                onClick={() => handleStudentClick(student)}
              >
                <Box
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    backgroundColor:
                      student === activeStudent ? "#99BC4D" : "#A8A8A8", // Active student highlighted
                    color: "white",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: "bold",
                    gap: 3,
                  }}
                >
                  <AccountCircleIcon sx={{ borderBottom: "1px solid white" }} />
                  {student.username}
                </Box>
              </div>
            ))
          ) : (
            <p>No students found.</p>
          )}
        </Box>

        {/* Display student statistics if active */}
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
                  fontSize="20px"
                  color="#99BC4D"
                  fontWeight={600}
                  sx={{ flexGrow: 1 }}
                >
                  Trong {daysDifference} ngày qua
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
                    label=""
                  />
                  đến
                  <TextField
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    label=""
                  />
                </Box>
              </Box>
              <Box
                sx={{
                  paddingY: 4,
                  borderBottom: "1px solid #A8A8A8",
                  display: "flex",
                  gap: 2,
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Box sx={{ display: "flex" }}>
                    <img src="/icon-quiz.png" width={50} height={50} />
                    <Typography fontSize="35px">
                      {studentStats.numberOfQuestionsAnswered}
                    </Typography>
                  </Box>
                  <Typography color="#000000" fontWeight={600} sx={{ pl: 6.5 }}>
                    Câu hỏi đã trả lời
                  </Typography>
                </Box>
                <Box>
                  <Box sx={{ display: "flex" }}>
                    <img src="/icon-quiz.png" width={50} height={50} />
                    <Typography fontSize="35px">
                      {studentStats.numberOfQuizzesDone}
                    </Typography>
                  </Box>
                  <Typography color="#000000" fontWeight={600} sx={{ pl: 6.5 }}>
                    Số bài kiểm tra đã làm
                  </Typography>
                </Box>
                <Box>
                  <Box sx={{ display: "flex" }}>
                    <img src="/icon_clock.png" width={50} height={50} />
                    <Typography fontSize="35px">
                      {studentStats.timeSpentDoingQuizzes}
                    </Typography>
                  </Box>
                  <Typography color="#000000" fontWeight={600} sx={{ pl: 6.5 }}>
                    Số phút đã làm bài kiểm tra
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Layout>
  );
};

export default DashboardReportPage;