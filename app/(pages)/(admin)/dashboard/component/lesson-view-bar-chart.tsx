// import React from "react";
// import {
//   Card,
//   CardContent,
//   Typography,
//   Box,
//   MenuItem,
//   TextField as MuiTextField,
// } from "@mui/material";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
// } from "recharts";
// import TextField from "@/app/components/textfield";

// const LessonViewsBarChart = ({
//   data,
//   month,
//   year,
//   selectedSubject,
//   setSelectedSubject,
//   subjects,
//   loading,
// }: {
//   data: any[];
//   month: number;
//   year: number;
//   selectedSubject: string;
//   setSelectedSubject: React.Dispatch<React.SetStateAction<string>>;
//   subjects: { subjectId: string; subjectName: string }[];
//   loading?: boolean;
// }) => {
//   const classes = ["Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5"];
//   const colors = ["#1877F2", "#8E33FF", "#00B8D9", "#FF5630", "#22C55E"];
//   const CustomTick = ({ x, y, payload }: any) => (
//     <text
//       x={x}
//       y={y}
//       dy={16}
//       textAnchor="end"
//       transform={`rotate(-45, ${x}, ${y})`}
//       fontSize={12}
//       fill="#666"
//     >
//       {payload.value}
//     </text>
//   );
//   return (
//     <Card sx={{ width: "100%" }}>
//       <CardContent sx={{ p: 2 }}>
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             flexWrap: "wrap",
//             mb: 3,
//           }}
//         >
//           <Typography fontWeight={600} fontSize={20}>
//             Lượt truy cập bài học trong tháng {month}/{year}
//           </Typography>

//           <TextField
//             select
//             label="Môn học"
//             value={selectedSubject}
//             onChange={(e) => setSelectedSubject(e.target.value)}
//             sx={{ maxWidth: 200 }}
//           >
//             {subjects.map((subject) => (
//               <MenuItem
//                 key={subject.subjectId}
//                 value={subject.subjectName}
//                 sx={{
//                   "&.Mui-selected": {
//                     backgroundColor: "#BCD181 !important",
//                     color: "white",
//                     opacity: 1,
//                   },
//                   "&:hover": {
//                     backgroundColor: "#BCD181",
//                   },
//                 }}
//               >
//                 {subject.subjectName}
//               </MenuItem>
//             ))}
//           </TextField>
//         </Box>

//         <Box
//           sx={{
//             overflowX: "auto",
//             width: "100%",
//             "&::-webkit-scrollbar": { height: 6 },
//             "&::-webkit-scrollbar-thumb": {
//               backgroundColor: "#888",
//               borderRadius: 10,
//             },
//             "&::-webkit-scrollbar-track": {
//               backgroundColor: "#f1f1f1",
//             },
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           {" "}
//           {loading ? (
//             <Box
//               sx={{
//                 height: 400,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <Typography color="text.secondary">
//                 Đang tải dữ liệu...
//               </Typography>
//             </Box>
//           ) : data && data.length > 0 && subjects.length > 0 ? (
//             <>
//               <Box sx={{ minWidth: 1400 }}>
//                 <LineChart
//                   width={1400}
//                   height={400}
//                   data={data}
//                   margin={{ top: 10, right: 30 }}
//                 >
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis
//                     dataKey="date"
//                     interval={0}
//                     tick={<CustomTick />}
//                     height={60}
//                   />
//                   <YAxis />
//                   <Tooltip
//                     formatter={(value, name) => [`${value} lượt`, name]}
//                     labelFormatter={(label) => `Ngày ${label}`}
//                     cursor={data && data.length > 0 ? undefined : false}
//                   />
//                   {classes.map((cls, index) => (
//                     <Line
//                       key={cls}
//                       type="monotone"
//                       dataKey={cls}
//                       stroke={colors[index]}
//                       strokeWidth={2}
//                       activeDot={{ r: 6 }}
//                     />
//                   ))}
//                 </LineChart>
//               </Box>
//             </>
//           ) : (
//             <Box
//               sx={{
//                 height: 400,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <Typography color="text.secondary">Đang tải dữ liệu...</Typography>
//             </Box>
//           )}
//         </Box>

//         {/* Legend đứng yên ở đây */}
//       </CardContent>
//     </Card>
//   );
// };

// export default LessonViewsBarChart;
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
  loading,
}: {
  data: any[];
  month: number;
  year: number;
  selectedSubject: string;
  setSelectedSubject: React.Dispatch<React.SetStateAction<string>>;
  subjects: { subjectId: string; subjectName: string }[];
  loading?: boolean;
}) => {
  const classes = ["Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5"];
  const colors = ["#1877F2", "#8E33FF", "#00B8D9", "#FF5630", "#22C55E"];
  
  // Tính toán độ rộng dựa trên số ngày
  const calculateChartWidth = (dataLength: number) => {
    const minWidth = 950; // Độ rộng tối thiểu
    const maxWidth = 1400; // Độ rộng tối đa
    const widthPerDay = 45; // Độ rộng cho mỗi ngày
    
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

  return (
    <Card sx={{ width: "100%" }}>
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
          ) : data && data.length > 0 && subjects.length > 0 ? (
            <>
              <Box sx={{ minWidth: chartWidth }}>
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
            </>
          ) : (
            <Box
              sx={{
                height: 400,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography color="text.secondary">Đang tải dữ liệu...</Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default LessonViewsBarChart;