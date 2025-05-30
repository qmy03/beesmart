import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  MenuItem,
  TextField as MuiTextField,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import TextField from "@/app/components/textfield";

const LessonViewsBarChart = ({
  data,
  month,
  year,
  selectedSubject,
  setSelectedSubject,
  subjects,
}: {
  data: any[];
  month: number;
  year: number;
  selectedSubject: string;
  setSelectedSubject: React.Dispatch<React.SetStateAction<string>>;
  subjects: { subjectId: string; subjectName: string }[];
}) => {
  const classes = ["Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5"];
  const colors = ["#1877F2", "#8E33FF", "#00B8D9", "#FF5630", "#22C55E"];

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
          <Typography fontWeight={600} fontSize={20}>
            Lượt truy cập bài học trong tháng {month}/{year}
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
            "&::-webkit-scrollbar": { height: 6 },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#888",
              borderRadius: 10,
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#f1f1f1",
            },
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ width: 1400 }}>
            <LineChart
              width={1400}
              height={400}
              data={data}
              margin={{top: 10, right: 30, left: -15 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                interval={0}
                tick={{ fontSize: 12, angle: -45, textAnchor: "end" }}
                height={60}
              />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [`${value} lượt`, name]}
                labelFormatter={(label) => `Ngày ${label}`}
                cursor={data && data.length > 0 ? undefined : false}
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
        </Box>

        {/* Legend đứng yên ở đây */}
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
              <Typography fontSize={16} color={colors[index]}>{cls}</Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default LessonViewsBarChart;
