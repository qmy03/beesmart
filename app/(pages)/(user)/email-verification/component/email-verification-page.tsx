import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Box, Typography, Button, TextField } from "@mui/material";
import Layout from "@/app/components/user/Home/layout";
import SnackbarComponent from "@/app/components/snackbar";

const EmailVerification: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [email, setEmail] = useState<string>("");
  const [resendEmail, setResendEmail] = useState(false);
  const [isVerified, setIsVerified] = useState(false); // Track verification status

  useEffect(() => {
    if (token && !isVerified) {
      // Call API to verify email with token
      fetch(`http://localhost:8080/api/auth/verify?token=${token}`)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.success) {
            setSnackbarMessage("Email verified successfully!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
            setIsVerified(true); // Mark as verified
            setTimeout(() => {
              router.push("/login"); // Redirect to login after 10s
            }, 10000);
          } else {
            setSnackbarMessage(data?.message || "Verification failed.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
          }
        })
        .catch((error) => {
          console.error("API Error: ", error); // Log the error if the API call fails
          setSnackbarMessage("An error occurred. Please try again.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        });
    }
  }, [token, router, isVerified]); // Dependency array now includes isVerified

  const handleResendEmail = () => {
    if (email) {
      fetch(`http://localhost:8080/api/auth/resend-confirm-email?email=${email}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setSnackbarMessage("Verification email sent successfully!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
          } else {
            setSnackbarMessage("Failed to resend email. Please try again.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
          }
        })
        .catch(() => {
          setSnackbarMessage("Failed to resend email. Please try again.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        });
    } else {
      setSnackbarMessage("Please enter your email address.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          paddingY: 3,
          alignItems: "center",
          backgroundColor: "#EFF3E6",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "white",
            padding: 4,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Typography variant="h5">Email Verification</Typography>
          <Typography variant="body1" sx={{ marginTop: 2, marginBottom: 3 }}>
            We have sent you an email with a verification link. Please verify your email address to continue.
          </Typography>

          {snackbarSeverity === "error" && !resendEmail && (
            <Box sx={{ width: "100%", textAlign: "center" }}>
              <Typography variant="body2" color="error" sx={{ marginBottom: 2 }}>
                Something went wrong. Please try again.
              </Typography>
              <Button
                variant="contained"
                onClick={() => setResendEmail(true)}
                sx={{ width: "100%" }}
              >
                Resend Verification Email
              </Button>
            </Box>
          )}

          {resendEmail && (
            <Box sx={{ width: "100%", textAlign: "center" }}>
              <TextField
                label="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ marginBottom: 2 }}
              />
              <Button variant="contained" onClick={handleResendEmail}>
                Send Verification Email
              </Button>
            </Box>
          )}

          <SnackbarComponent
            open={snackbarOpen}
            message={snackbarMessage || ""}
            severity={snackbarSeverity}
            onClose={handleSnackbarClose}
          />
        </Box>
      </Box>
    </Layout>
  );
};

export default EmailVerification;
