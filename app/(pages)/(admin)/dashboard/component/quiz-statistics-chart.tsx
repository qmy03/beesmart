import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#1877f2", "#ff5630", "#ffab00", "#5119b7", "#22C55E", "#9333ea"];

interface QuizStatisticsChartProps {
  data: { [key: string]: number };
  loading?: boolean;
  type?: 'quiz' | 'battle';
}

const QuizStatisticsChart: React.FC<QuizStatisticsChartProps> = ({
  data,
  loading = false,
  type = 'quiz',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Transform data for chart
  const chartData = Object.keys(data).map((key) => ({
    label: key,
    value: data[key],
  }));

  // Định nghĩa title và empty message
  const getTitle = () => {
    return type === 'quiz'
      ? 'Tỉ lệ phần trăm làm bài quiz theo từng lớp'
      : 'Tỉ lệ phần trăm tham gia battle theo từng môn học';
  };

  const getEmptyMessage = () => {
    return type === 'quiz'
      ? 'Chưa có dữ liệu thống kê bài kiểm tra'
      : 'Chưa có dữ liệu thống kê battle';
  };

  // Tách dữ liệu cho pie chart (chỉ lớp có giá trị > 0)
  const pieData = chartData.filter(item => item.value > 0);

  // Loading skeleton
  const LoadingSkeleton = () => (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: isMobile ? 200 : 300 }}>
      <Skeleton variant="circular" width={isMobile ? 150 : 200} height={isMobile ? 150 : 200} animation="wave" />
    </Box>
  );

  // Empty state
  const EmptyState = () => (
    <Box
      sx={{
        height: isMobile ? 200 : 300,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "text.secondary",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Không có dữ liệu
      </Typography>
      <Typography variant="body2">
        {getEmptyMessage()}
      </Typography>
    </Box>
  );

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <Box
          sx={{
            backgroundColor: "white",
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            {data.name}: {data.value}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Custom label
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={isMobile ? 10 : 12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  // Custom Legend
  const CustomLegend = (props: any) => {
    const { payload } = props;

    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 1,
          mt: 1,
          maxWidth: '100%',
          overflowX: 'auto',
          px: 1,
        }}
      >
        {chartData.map((entry, index) => (
          <Box
            key={entry.label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              minWidth: isMobile ? 80 : 100,
            }}
          >
            <Box
              sx={{
                width: isMobile ? 12 : 16,
                height: isMobile ? 12 : 16,
                backgroundColor: COLORS[index % COLORS.length],
                borderRadius: '50%',
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: "#666",
                fontSize: isMobile ? 12 : 14,
                whiteSpace: 'nowrap',
              }}
            >
              {entry.label}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  // Tính toán outerRadius dựa trên kích thước màn hình
  const getOuterRadius = () => {
    if (isMobile) return 70;
    if (isTablet) return 100;
    return 120;
  };

  return (
    <Card sx={{ width: "100%", height: '100%' }}>
      <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography fontWeight={600} fontSize={isMobile ? 16 : 20} mb={2}>
          {type === 'quiz' ? 'Tỷ lệ học sinh tham gia làm bài kiểm tra' : 'Tỷ lệ học sinh tham gia đấu trường'}
        </Typography>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            minHeight: isMobile ? 250 : 350,
          }}
        >
          {loading ? (
            <LoadingSkeleton />
          ) : pieData.length > 0 ? (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height={isMobile ? 200 : isTablet ? 250 : 300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={getOuterRadius()}
                    fill="#8884d8"
                    labelLine={false}
                    label={renderCustomLabel}
                  >
                    {pieData.map((entry, index) => {
                      const originalIndex = chartData.findIndex(item => item.label === entry.label);
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[originalIndex % COLORS.length]}
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <CustomLegend />
            </Box>
          ) : (
            <EmptyState />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuizStatisticsChart;