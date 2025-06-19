import TextField from "@/app/components/textfield";
import { Box, Card, CardContent, MenuItem, Skeleton, Typography } from "@mui/material";
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
  selectedSubject,
  setSelectedSubject,
  subjects,
  loading,
  hasData = false,
}: {
  data: any[];
  month: number;
  year: number;
  selectedSubject: string;
  setSelectedSubject: React.Dispatch<React.SetStateAction<string>>;
  subjects: { subjectId: string; subjectName: string }[];
  loading?: boolean;
  hasData?: boolean;
}) => {
  const classes = ["Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5"];
  const colors = ["#1877F2", "#8E33FF", "#00B8D9", "#FF5630", "#22C55E"];
  const calculateChartWidth = (dataLength: number) => {
    const minWidth = 950;
    const maxWidth = 1400;
    const widthPerDay = 45;

    const calculatedWidth = Math.max(minWidth, dataLength * widthPerDay);
    return Math.min(calculatedWidth, maxWidth);
  };

  const chartWidth = calculateChartWidth(data?.length || 0);
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
  const LoadingSkeleton = () => (
    <Box sx={{ minWidth: chartWidth }}>
      <Skeleton
        variant="rectangular"
        width="100%"
        height={400}
        animation="wave"
      />
    </Box>
  );

  // Empty state component
  const EmptyState = () => (
    <Box
      sx={{
        height: 400,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "text.secondary",
      }}
    >
      {/* <Typography variant="h6" gutterBottom>
          Không có dữ liệu
        </Typography>
        <Typography variant="body2">
          Chưa có dữ liệu cho {selectedSubject} trong tháng {month}/{year}
        </Typography> */}
    </Box>
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
          <Typography fontWeight={600} fontSize={20} gutterBottom>
            Lượt nộp bài kiểm tra trong tháng {month}/{year}
          </Typography>
          <TextField
            select
            label="Môn học"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            sx={{ maxWidth: 200 }}
          >
            {subjects.map((subject) => (
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
            ))}
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
            <LoadingSkeleton />
          ) : data && data.length > 0 && subjects.length > 0 ? (
            <Box sx={{ minWidth: chartWidth, display: "flex", justifyContent: "center" }}>
              <LineChart
                width={chartWidth}
                height={400}
                data={data}
                margin={{ top: 10, right: 30 }}
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
                  formatter={(value, name) => [`${value} lượt`, name]}
                  labelFormatter={(label) => `Ngày ${label}`}
                />
                {/* <Legend /> */}
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
            <LoadingSkeleton />
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
                gap: 1,
              }}
            >
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
export default QuizViewsBarChart;
