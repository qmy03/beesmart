"use client";
import React from "react";
import { CircularProgress, Box } from "@mui/material";

interface ProgressOverlayProps {
  isLoading: boolean;
}

const ProgressOverlay: React.FC<ProgressOverlayProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        zIndex: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <CircularProgress size={30} sx={{color: "white"}} />
    </Box>
  );
};

export default ProgressOverlay;