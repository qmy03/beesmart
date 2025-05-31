import TextField from "@/app/components/textfield";
import { Box, Card, CardContent, MenuItem, Typography } from "@mui/material";
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
    ...item.averages,
  }));
};

const QuizAverageBarChart = ({
  data,
  month,
  year,
  selectedSubject,
  setSelectedSubject,
  subjects1,
}: {
  data: any;
  month: number;
  year: number;
  selectedSubject: string;
  setSelectedSubject: React.Dispatch<React.SetStateAction<string>>;
  subjects1: { subjectId: string; subjectName: string }[];
}) => {
  const classes = ["Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5"];
  const colors = ["#FF6B6B", "#4ECDC4", "#1A535C", "#FF8C00", "#2E8B57"];

  // Kiểm tra và xử lý data trước khi transform
  const chartData = data && Array.isArray(data) ? transformData(data) : [];

  console.log(chartData);
  const CustomTick = ({ x, y, payload }: any) => (
    <text
      x={x}
      y={y}
      dy={16}
      textAnchor="end"
      transform={`rotate(-45, ${x}, ${y})`}
      fontSize={12}
      fill="#666"
    >
      {payload.value}
    </text>
  );
  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            mb: 3,
          }}
        >
          <Typography fontWeight={600} gutterBottom fontSize={20}>
            Điểm trung bình quiz trong tháng {month}/{year}
          </Typography>
          <TextField
            select
            label="Môn học"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            sx={{ maxWidth: 200 }}
            disabled={!subjects1 || subjects1.length === 0} // Disable khi chưa có data
          >
            {subjects1 && subjects1.length > 0 ? (
              subjects1.map((subject) => (
                <MenuItem
                  key={subject.subjectId}
                  value={subject.subjectName}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "#BCD181 !important",
                      color: "white",
                      opacity: 1,
                    },
                    "&:hover": {
                      backgroundColor: "#BCD181",
                    },
                  }}
                >
                  {subject.subjectName}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Đang tải...</MenuItem>
            )}
          </TextField>
        </Box>

        <Box
          sx={{
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
          <Box sx={{ width: 1400 }}>
            {chartData && chartData.length > 0 ? (
              <LineChart
                width={1400}
                height={400}
                data={chartData}
                margin={{ top: 10, right: 30, left: -15 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  interval={0}
                  tick={<CustomTick />}
                  height={60}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [`${value} điểm`, name]}
                  labelFormatter={(label) => `Ngày ${label}`}
                  cursor={undefined}
                />
                {classes.map((cls, index) => (
                  <Line
                    key={cls}
                    type="monotone"
                    dataKey={cls}
                    stroke={colors[index]}
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            ) : (
              <Box
                sx={{
                  height: 400,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography color="text.secondary">
                  Đang tải dữ liệu...
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 3,
          }}
        >
          {classes.map((cls, index) => (
            <Box
              key={cls}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {/* Line with dot in center */}
              <Box
                sx={{
                  position: "relative",
                  width: 35,
                  height: 2,
                  backgroundColor: colors[index],
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 10,
                    height: 10,
                    backgroundColor: "#fff",
                    borderRadius: "50%",
                    border: `2px solid ${colors[index]}`,
                  }}
                />
              </Box>
              <Typography fontSize={16} color={colors[index]}>
                {cls}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuizAverageBarChart;
