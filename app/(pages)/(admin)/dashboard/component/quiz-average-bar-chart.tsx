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

const transformData = (rawData: any, type: "quiz" | "arena") => {
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
  type,
  loading,
}: {
  data: any;
  month: number;
  year: number;
  selectedSubject: string;
  setSelectedSubject: React.Dispatch<React.SetStateAction<string>>;
  subjects1: { subjectId: string; subjectName: string }[];
  type: "quiz" | "arena";
  loading?: boolean;
}) => {
  const classes = ["Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5"];
  const colors = ["#FF6B6B", "#4ECDC4", "#1A535C", "#FF8C00", "#2E8B57"];
  const title =
    type === "quiz"
      ? `Điểm trung bình quiz trong tháng ${month}/${year}`
      : `Điểm trung bình đấu trường trong tháng ${month}/${year}`;
  const chartData =
    data && Array.isArray(data) ? transformData(data, type) : [];

  console.log(chartData);
  const calculateChartWidth = (dataLength: number) => {
    const minWidth = 450; // Độ rộng tối thiểu
    const maxWidth = 1400; // Độ rộng tối đa
    const widthPerDay = 45; // Độ rộng cho mỗi ngày
    
    const calculatedWidth = Math.max(minWidth, dataLength * widthPerDay);
    return Math.min(calculatedWidth, maxWidth);
  };

  const chartWidth = calculateChartWidth(chartData?.length || 0);
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
    <Box sx={{ width: "100%" }}>
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
            {title}
          </Typography>
          <TextField
            select
            label="Môn học"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            sx={{ maxWidth: 200 }}
            disabled={!subjects1 || subjects1.length === 0}
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
          {loading ? (
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
          ) : chartData && chartData.length > 0 ? (
            <Box sx={{ minWidth: chartWidth }}>
              <LineChart
                width={chartWidth}
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
            </Box>
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
                gap: "3px",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: 30,
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
    </Box>
  );
};

export default QuizAverageBarChart;
