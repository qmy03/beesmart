import { Box, Card, CardContent, Typography } from "@mui/material";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
const transformData = (rawData: any) => {
  return rawData.map((item: any) => ({
    date: item.date,
    ...item.averages, // Trích xuất các giá trị "Lớp 1", "Lớp 2", ...
  }));
};

const QuizAverageBarChart = ({
  data,
  month,
  year,
}: {
  data: any;
  month: number;
  year: number;
}) => {
  const classes = ["Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5"];
  const colors = ["#FF6B6B", "#4ECDC4", "#1A535C", "#FF8C00", "#2E8B57"];

  // Chuyển đổi dữ liệu
  const chartData = transformData(data);
  console.log(chartData);
  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: "900px",
          "&::-webkit-scrollbar": {
            height: "6px", // Đặt chiều cao của thanh cuộn ngang
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#888", // Màu của thanh kéo
            borderRadius: "10px", // Làm tròn góc
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#555", // Màu khi hover
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1", // Màu nền của thanh cuộn
          },
        }}
      >
        <Typography fontWeight={600} gutterBottom fontSize={20}>
          Điểm trung bình quiz trong tháng {month}/{year}
        </Typography>
        <Box
          sx={{
            overflowX: "auto",
            width: "100%",
            "&::-webkit-scrollbar": {
              height: "6px", // Kích thước của thanh cuộn ngang
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
            data={chartData}
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
            <Legend/>
            {classes.map((cls, index) => (
              <Line
                key={cls}
                type="monotone"
                dataKey={cls} // Chỉ cần sử dụng tên key trực tiếp
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

export default QuizAverageBarChart;
