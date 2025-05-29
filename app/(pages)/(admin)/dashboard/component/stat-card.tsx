import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { SvgIconComponent } from "@mui/icons-material";

export type StatCardProps = {
  title: string;
  value: string | number;
  Icon: SvgIconComponent;
  bgColor: string;
  bgColorIcon: string;
  iconColor?: string;
  textColor?: string;
};

export default function StatCard({
  title,
  value,
  Icon,
  bgColor,
  bgColorIcon,
  iconColor = "white",
  textColor = "white",
}: StatCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        flexGrow: 1,
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={2}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box sx={{padding: 1, borderRadius: "50%", bgcolor: bgColorIcon, mb: 1}}>
              <Icon sx={{ fontSize: 40, color: iconColor }} />
            </Box>

            <Typography variant="h4" component="p" sx={{ color: textColor }}>
              {value}
            </Typography>
            <Typography
              component="h2"
              variant="subtitle2"
              sx={{ color: textColor }}
            >
              {title}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
