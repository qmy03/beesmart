import { Card, CardContent, Typography, Box } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const LessonViewsBarChart = ({
  data,
  month,
  year,
}: {
  data: any[];
  month: number;
  year: number;
}) => {
  const classes = ["Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5"];
  const colors = ["#1877F2", "#8E33FF", "#00B8D9", "#FF5630", "#22C55E"];

  return (
    <Card variant="outlined" sx={{ width: "100%", overflowX: "auto" }}>
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: "900px",
          "&::-webkit-scrollbar": {
            height: "6px", 
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#888", 
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#555",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1", 
          },
        }}
      >
        <Typography fontWeight={600} fontSize={20} gutterBottom>
          Lượt truy cập bài học trong tháng {month}/{year}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflowX: "auto",
            width: "100%",
            "&::-webkit-scrollbar": {
              height: "6px", 
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#888",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#f1f1f1",
            },
          }}
        >
          <LineChart
            width={1200}
            height={400}
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              interval={0}
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            {classes.map((cls, index) => (
              <Line
                key={cls}
                type="monotone"
                dataKey={cls}
                stroke={colors[index]}
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LessonViewsBarChart;
