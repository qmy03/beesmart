// import { Card, CardContent, Typography } from "@mui/material";
// import { BarChart } from "@mui/x-charts/BarChart";

// const LessonViewsBarChart = ({ data, month, year }: { data: { date: string; views: number }[], month: number, year: number }) => {
//   // Định nghĩa mảng màu thủ công
//   const colorPalette = ["#1976d2", "#42a5f5", "#90caf9"];

//   return (
//     <Card variant="outlined" sx={{ width: "100%" }}>
//       <CardContent>
//         <Typography component="h2" variant="subtitle2" gutterBottom>
//           Lượt truy cập bài học trong tháng {month}/{year}
//         </Typography>
//         <BarChart
//           borderRadius={8}
//           colors={colorPalette}
//           xAxis={[{ scaleType: "band", categoryGapRatio: 0.5, data: data.map((item) => item.date) }]}
//           series={[{ id: "lesson-views", label: "Lượt truy cập", data: data.map((item) => item.views) }]}
//           height={250}
//           margin={{ left: 50, right: 0, top: 40, bottom: 20 }}
//           grid={{ horizontal: true }}
//         />
//       </CardContent>
//     </Card>
//   );
// };

// export default LessonViewsBarChart;
import { Box, Card, CardContent, Typography } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const QuizViewsBarChart = ({
  data,
  month,
  year,
}: {
  data: any[];
  month: number;
  year: number;
}) => {
  const classes = ["Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5"]; // Các lớp học
  const colors = ["#1877F2", "#8E33FF", "#00B8D9", "#FF5630", "#22C55E"]; // Bảng màu

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
        <Typography fontWeight={600} fontSize={20} gutterBottom>
          Lượt nộp bài quiz trong tháng {month}/{year}
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
export default QuizViewsBarChart;
