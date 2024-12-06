//snackbar.tsx
import React, { useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";

interface SnackbarProps {
  open: boolean;
  message: string;
  severity: "success" | "error";
  onClose: () => void;
  duration?: number; // Duration in milliseconds, default to 3000
}

const SnackbarComponent: React.FC<SnackbarProps> = ({
  open,
  message,
  severity,
  onClose,
  duration = 3000,
}) => {
  // Automatically close the Snackbar after a duration
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  return (
    <Snackbar open={open} autoHideDuration={duration} onClose={onClose} anchorOrigin={{vertical: "top", horizontal: "right"}}>
      <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarComponent;
