import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
} from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#1877f2", "#ff5630", "#ffab00", "#5119b7", "#22C55E", "#9333ea"];

interface QuizStatisticsChartProps {
  data: { [key: string]: number };
  loading?: boolean;
  type?: 'quiz' | 'battle'; // Thêm type để phân biệt quiz hay battle
}

const QuizStatisticsChart: React.FC<QuizStatisticsChartProps> = ({
  data,
  loading = false,
  type = 'quiz', // Default là quiz
}) => {
  // Transform data for chart - hiển thị tất cả lớp hoặc môn học tùy theo type
  const chartData = Object.keys(data).map((key) => ({
    label: key,
    value: data[key],
  }));

  // Định nghĩa title và empty message dựa theo type
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

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
      <Skeleton variant="circular" width={300} height={300} animation="wave" />
    </Box>
  );

  // Empty state component
  const EmptyState = () => (
    <Box
      sx={{
        height: 350,
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

  // Custom tooltip formatter
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

  // Custom label formatter
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for very small slices
    
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
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  // Custom Legend Content để hiển thị tất cả lớp
  const CustomLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'center', 
          gap: 2, 
          mt: 1 
        }}
      >
        {chartData.map((entry, index) => (
          <Box 
            key={entry.label}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
            }}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                backgroundColor: COLORS[index % COLORS.length],
                borderRadius: '50%',
                // opacity: entry.value > 0 ? 1 : 0.3, // Làm mờ những lớp có giá trị 0
              }}
            />
            <Typography 
              variant="body2" 
              sx={{ 
                color: "#666",
                fontSize: "14px" 
              }}
            >
              {entry.label}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Card sx={{ width: "100%" }}>
      <CardContent sx={{ p: 2 }}>
        <Typography fontWeight={600} fontSize={20} mb={2}>
          {type === 'quiz' ? 'Tỷ lệ học sinh tham gia làm bài kiểm tra' : 'Tỷ lệ học sinh tham gia đấu trường'}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          {loading ? (
            <LoadingSkeleton />
          ) : pieData.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <PieChart width={400} height={420}>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  fill="#8884d8"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {pieData.map((entry, index) => {
                    // Tìm index trong chartData để lấy đúng màu
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
              <CustomLegend />
            </Box>
          ) : (
            <LoadingSkeleton />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuizStatisticsChart;