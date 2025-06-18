import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { CircularProgress, Box, Typography } from "@mui/material";
import apiService from "@/app/untils/api";

const COLORS = ["#1877f2", "#ff5630", "#ffab00", "#5119b7", "#22C55E"];

const BattleStatisticsChart = () => {
  // const accessToken = localStorage.getItem("accessToken");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      setAccessToken(token);
    }
  }, []);
  useEffect(() => {
    const fetchBattleStatistics = async () => {
      try {
        const response = await apiService.get(
          "/statistics/admin/battle-users-by-subject",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const rawData = response.data.data;
        const total = Object.values(rawData).reduce(
          (sum, value) => sum + value,
          0
        );

        const processedData = Object.entries(rawData).map(
          ([subject, value]) => {
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return {
              name: subject,
              value: Number(percentage),
            };
          }
        );

        setChartData(processedData);
      } catch (err) {
        setError("Không thể tải dữ liệu thống kê.");
      } finally {
        setLoading(false);
      }
    };

    fetchBattleStatistics();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="300px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="300px"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      <PieChart width={400} height={400}>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
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
        <Tooltip formatter={(value) => `${value}%`} />
        <Legend />
      </PieChart>
    </Box>
  );
};

export default BattleStatisticsChart;
