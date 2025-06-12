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
