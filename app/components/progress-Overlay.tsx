"use client";
import React from "react";
import { Backdrop, CircularProgress } from "@mui/material";
import { useAuth } from "../hooks/AuthContext";

interface ProgressOverlayProps {
  isLoading: boolean;
}

const ProgressOverlay: React.FC<ProgressOverlayProps> = ({ isLoading }) => {
  if (!isLoading) return null;
  return (
    <Backdrop
      sx={{
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        color: "#fff",
        zIndex: (theme) => theme.zIndex.modal + 1,
      }}
      open={isLoading}
    >
      <CircularProgress size={30} color="inherit" />
    </Backdrop>
  );
};

export default ProgressOverlay;