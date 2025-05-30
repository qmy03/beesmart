// import React from "react";
// import Box from "@mui/material/Box";
// import Card from "@mui/material/Card";
// import CardContent from "@mui/material/CardContent";
// import Typography from "@mui/material/Typography";
// import Stack from "@mui/material/Stack";
// import { SvgIconComponent } from "@mui/icons-material";

// export type StatCardProps = {
//   title: string;
//   value: string | number;
//   Icon: SvgIconComponent;
//   bgColor: string;
//   bgColorIcon: string;
//   iconColor?: string;
//   textColor?: string;
// };

// export default function StatCard({
//   title,
//   value,
//   Icon,
//   bgColor,
//   bgColorIcon,
//   iconColor = "white",
//   textColor = "white",
// }: StatCardProps) {
//   return (
//     <Card
//       variant="outlined"
//       sx={{
//         flexGrow: 1,
//         backgroundColor: bgColor,
//         color: textColor,
//         shadow: 3,
//       }}
//     >
//       <CardContent>
//         <Stack
//           direction="row"
//           alignItems="center"
//           justifyContent="center"
//           spacing={2}
//         >
//           <Box
//             sx={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//             }}
//           >
//             <Box sx={{padding: 1, borderRadius: "50%", bgcolor: bgColorIcon, mb: 1}}>
//               <Icon sx={{ fontSize: 40, color: iconColor }} />
//             </Box>

//             <Typography variant="h4" component="p" sx={{ color: textColor }}>
//               {value}
//             </Typography>
//             <Typography
//               component="h2"
//               variant="subtitle2"
//               sx={{ color: textColor }}
//             >
//               {title}
//             </Typography>
//           </Box>
//         </Stack>
//       </CardContent>
//     </Card>
//   );
// }
import { Box, Typography, Paper } from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";

interface StatCardProps {
  title: string; // e.g., "Tổng số tài khoản hiện có"
  value: number;
  label: string; // e.g., "Tài khoản"
  Icon: SvgIconComponent;
  bgColor: string;
  bgColorIcon: string;
  iconColor: string;
  textColor: string;
}

const StatCard = ({
  title,
  value,
  label,
  Icon,
  bgColor,
  bgColorIcon,
  iconColor,
  textColor,
}: StatCardProps) => {
  return (
    <Paper
      elevation={3}
      sx={{
        display: "flex",
        alignItems: "center",
        padding: 2,
        backgroundColor: bgColor,
        height: "100%",
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          backgroundColor: bgColorIcon,
          color: iconColor,
          padding: 1,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 2,
        }}
      >
        <Icon sx={{ fontSize: 32 }} />
      </Box>

      <Box>
        {/* Value + Label (e.g., 2345 (Tài khoản)) */}
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 0.5 }}>
          <Typography fontSize={32} fontWeight={700} color={textColor}>
            {value}
          </Typography>
          <Typography variant="body2" color={textColor}>
            ({label})
          </Typography>
        </Box>
        {/* Title */}
        <Typography variant="subtitle1" fontWeight={600} color={textColor}>
          {title}
        </Typography>
      </Box>
    </Paper>
  );
};

export default StatCard;
