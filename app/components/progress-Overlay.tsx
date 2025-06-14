// "use client";
// import React from "react";
// import { Backdrop, CircularProgress } from "@mui/material";
// import { useAuth } from "../hooks/AuthContext";

// interface ProgressOverlayProps {
//   isLoading: boolean;
// }

// const ProgressOverlay: React.FC<ProgressOverlayProps> = ({ isLoading }) => {
//   if (!isLoading) return null;
//   return (
//     <Backdrop
//       sx={{
//         backgroundColor: "rgba(0, 0, 0, 0.1)",
//         color: "#fff",
//         zIndex: (theme) => theme.zIndex.modal + 1,
//       }}
//       open={isLoading}
//     >
//       <CircularProgress size={30} color="inherit" />
//     </Backdrop>
//   );
// };

// export default ProgressOverlay;
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
        zIndex: 10, // Đảm bảo overlay nằm trên nội dung main nhưng không vượt qua Sidebar
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress size={30} sx={{color: "white"}} />
    </Box>
  );
};

export default ProgressOverlay;