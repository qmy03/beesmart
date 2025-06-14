import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import apiService from "@/app/untils/api";
import { useAuth } from "@/app/hooks/AuthContext";
import { Box, Card, CardContent, Typography } from "@mui/material";

interface ScoreRangeData {
  "0-50": number;
  "51-70": number;
  "71-90": number;
  "91-100": number;
}

interface SubjectData extends ScoreRangeData {
  subject: string;
}

interface ApiResponseData {
  [subject: string]: Partial<ScoreRangeData>;
}

// interface ApiResponse {
//   data: ApiResponseData | { data: ApiResponseData };
//   status: number;
//   statusText: string;
//   headers: any;
//   config: any;
//   request?: any;
// }

// interface DebugInfo {
//   rawData?: ApiResponseData;
//   transformedData?: SubjectData[];
//   timestamp?: string;
//   error?: {
//     status: number;
//     statusText: string;
//     data: any;
//     url?: string;
//   };
// }
interface BattleScoreChartProps {
  data: ApiResponseData;
  loading: boolean;
}

const BattleScoreChart: React.FC<BattleScoreChartProps> = ({
  data,
  loading,
}) => {
  // const { accessToken } = useAuth();
  const transformedData: SubjectData[] = React.useMemo(() => {
    if (!data || typeof data !== "object") return [];

    const subjects = Object.keys(data);
    const scoreRanges: (keyof ScoreRangeData)[] = [
      "0-50",
      "51-70",
      "71-90",
      "91-100",
    ];

    return subjects.map((subject) => {
      const subjectData: SubjectData = {
        subject: subject,
        "0-50": 0,
        "51-70": 0,
        "71-90": 0,
        "91-100": 0,
      };

      // Gán giá trị từ data, giữ nguyên giá trị 0 nếu không có data
      scoreRanges.forEach((range) => {
        subjectData[range] = data[subject]?.[range] ?? 0;
      });

      return subjectData;
    });
  }, [data]);
  const colors: Record<keyof ScoreRangeData, string> = {
    "0-50": "#ef4444",
    "51-70": "#f97316",
    "71-90": "#eab308",
    "91-100": "#22c55e",
  };

  return (
    <Card sx={{ width: "100%" }}>
      <CardContent sx={{ p: 2 }}>
        <Typography fontWeight={600} fontSize={20} sx={{ mb: 2 }}>
          Thống kê số thí sinh theo môn học và phân bố điểm Đấu trường
        </Typography>

        <Box height={400}>
          <ResponsiveContainer width="100%" height="100%">
            {!loading && transformedData && transformedData.length > 0 ? (
              <BarChart
                data={transformedData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  // bottom: 5,
                }}
                barCategoryGap="20%"
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
                    value: "Số thí sinh",
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
                  dataKey="0-50"
                  fill="#ef4444"
                  name="0-50"
                  radius={[12, 12, 4, 4]}
                />
                <Bar
                  dataKey="51-70"
                  fill="#f97316"
                  name="51-70"
                  radius={[12, 12, 4, 4]}
                />
                <Bar
                  dataKey="71-90"
                  fill="#eab308"
                  name="71-90"
                  radius={[12, 12, 4, 4]}
                />
                <Bar
                  dataKey="91-100"
                  fill="#22c55e"
                  name="91-100"
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

export default BattleScoreChart;
