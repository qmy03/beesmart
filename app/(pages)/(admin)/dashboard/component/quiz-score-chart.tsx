import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Box, Card, CardContent, Typography } from "@mui/material";

interface ScoreRangeData {
  "0.0 - 3.4": number;
  "3.5 - 4.9": number;
  "5.0 - 6.4": number;
  "6.5 - 7.9": number;
  "8.0 - 10.0": number;
}

interface SubjectData extends ScoreRangeData {
  subject: string;
}

interface ApiResponseData {
  [subject: string]: Partial<ScoreRangeData>;
}

interface QuizScoreChartProps {
  data: ApiResponseData;
  loading: boolean;
}

const QuizScoreChart: React.FC<QuizScoreChartProps> = ({ data, loading }) => {
  // Transform data từ props
  const transformedData: SubjectData[] = React.useMemo(() => {
    if (!data || typeof data !== "object") return [];

    const subjects = Object.keys(data);
    const scoreRanges: (keyof ScoreRangeData)[] = [
      "0.0 - 3.4",
      "3.5 - 4.9",
      "5.0 - 6.4",
      "6.5 - 7.9",
      "8.0 - 10.0",
    ];

    return subjects.map((subject) => {
      const subjectData: SubjectData = {
        subject: subject,
        "0.0 - 3.4": 0,
        "3.5 - 4.9": 0,
        "5.0 - 6.4": 0,
        "6.5 - 7.9": 0,
        "8.0 - 10.0": 0,
      };

      // Gán giá trị từ data, giữ nguyên giá trị 0 nếu không có data
      scoreRanges.forEach((range) => {
        subjectData[range] = data[subject]?.[range] ?? 0;
      });

      return subjectData;
    });
  }, [data]);

  const colors: Record<keyof ScoreRangeData, string> = {
    "0.0 - 3.4": "#ef4444",
    "3.5 - 4.9": "#f97316",
    "5.0 - 6.4": "#eab308",
    "6.5 - 7.9": "#22c55e",
    "8.0 - 10.0": "#3b82f6",
  };

  return (
    <Card sx={{ width: "100%" }}>
      <CardContent
        sx={{ p: 2, display: "flex", flexDirection: "column", flex: 1 }}
      >
        <Typography fontWeight={600} fontSize={20} sx={{ mb: 2 }}>
          Thống kê lượt làm bài quiz theo môn học và phân bố điểm{" "}
        </Typography>

        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            {!loading && transformedData && transformedData.length > 0 ? (
              <BarChart
                data={transformedData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
                // Cố định độ rộng của bars
                barCategoryGap="10%"
                maxBarSize={60} // Giới hạn độ rộng tối đa của mỗi bar
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis
                  dataKey="subject"
                  tick={{ fontSize: 12 }}
                  textAnchor="middle"
                  height={60}
                />
                <YAxis
                  label={{
                    value: "Số lượt làm bài",
                    angle: -90,
                    position: "insideLeft",
                    textAnchor: "middle",
                  }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `${value} thí sinh`,
                    `${name} điểm`,
                  ]}
                  labelFormatter={(label) => `Môn: ${label}`}
                  contentStyle={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="0.0 - 3.4"
                  fill="#ef4444"
                  name="0.0 - 3.4"
                  radius={[12, 12, 4, 4]}
                />
                <Bar
                  dataKey="3.5 - 4.9"
                  fill="#f97316"
                  name="3.5 - 4.9"
                  radius={[12, 12, 4, 4]}
                />
                <Bar
                  dataKey="5.0 - 6.4"
                  fill="#eab308"
                  name="5.0 - 6.4"
                  radius={[12, 12, 4, 4]}
                />
                <Bar
                  dataKey="6.5 - 7.9"
                  fill="#22c55e"
                  name="6.5 - 7.9"
                  radius={[12, 12, 4, 4]}
                />
                <Bar
                  dataKey="8.0 - 10.0"
                  fill="#3b82f6"
                  name="8.0 - 10.0"
                  radius={[12, 12, 4, 4]}
                />
              </BarChart>
            ) : (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography color="text.secondary">
                  {loading ? "Đang tải dữ liệu..." : "Không có dữ liệu"}
                </Typography>
              </Box>
            )}
          </ResponsiveContainer>
        </Box>

        {/* Legend */}
        <Box sx={{}}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {Object.entries(colors).map(([range, color]) => (
              <Box
                key={range}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    backgroundColor: color,
                    borderRadius: "50%",
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {range}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuizScoreChart;
