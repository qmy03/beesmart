import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { mathSessionData } from "../data/math-session-data";
function AreaGradient({ color, id }: { color: string; id: string }) {
    return (
      <defs>
        <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.5} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
    );
  }
  
const SessionsChart = ({ data }: { data: typeof mathSessionData }) => {
  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Thống kê lượt truy cập theo lớp - Môn Toán
        </Typography>
        <LineChart
          xAxis={[
            {
              scaleType: "point",
              data: data.xAxis,
            },
          ]}
          series={data.series.map((s) => ({
            ...s,
            showMark: false,
            curve: "linear",
          }))}
          height={250}
          margin={{ left: 50, right: 20, top: 20, bottom: 20 }}
          grid={{ horizontal: true }}
        />
      </CardContent>
    </Card>
  );
};

export default SessionsChart;
