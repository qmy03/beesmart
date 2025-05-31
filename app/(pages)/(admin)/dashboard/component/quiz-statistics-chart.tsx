import { useAuth } from "@/app/hooks/AuthContext";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#1877f2", "#ff5630", "#ffab00", "#5119b7", "#22C55E"];

const QuizStatisticsChart = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      setAccessToken(token);
    }
  }, []);

  const [quizStatistics, setQuizStatistics] = useState<{
    [key: string]: number;
  }>({});
  const chartData = Object.keys(quizStatistics).map((key) => ({
    label: key,
    value: quizStatistics[key],
  }));

  useEffect(() => {
    const fetchQuizStatistics = async () => {
      try {
        if (accessToken) {
          const response = await fetch(
            "http://localhost:8080/api/statistics/admin/quiz-submit-statistics",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          const data = await response.json();

          if (data.status === 200) {
            const processedData = {
              "Lớp 1": data.data["Lớp 1"] || 0,
              "Lớp 2": data.data["Lớp 2"] || 0,
              "Lớp 3": data.data["Lớp 3"] || 0,
              "Lớp 4": data.data["Lớp 4"] || 0,
              "Lớp 5": data.data["Lớp 5"] || 0,
            };

            setQuizStatistics(processedData);
          } else {
            console.error("Failed to fetch quiz statistics:", data.message);
          }
        } else {
          console.error("Access token is missing");
        }
      } catch (error) {
        console.error("Error fetching quiz statistics:", error);
      }
    };

    fetchQuizStatistics();
  }, [accessToken]);

  return (
    <Box
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <PieChart width={400} height={400}>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="label"
          cx="50%"
          cy="50%"
          outerRadius={150}
          fill="#8884d8"
          label
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </Box>
  );
};
export default QuizStatisticsChart;
