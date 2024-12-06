import React, { createContext, useContext, useState, useEffect } from "react";
import apiService from "../untils/api";
import SnackbarComponent from "../components/snackbar";
import { useRouter } from "next/navigation"; // Import useRouter

interface AuthContextType {
  registerUser: (userData: { username: string; email: string; password: string; role: string }) => Promise<string | null>;
  loginUser: (username: string, password: string) => Promise<void>;
  logoutUser: () => void; // Add logout function
  accessToken: string | null; // Add accessToken state
  refreshToken: string | null; // Add refreshToken state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [accessToken, setAccessToken] = useState<string | null>(null); // State for accessToken
  const [refreshToken, setRefreshToken] = useState<string | null>(null); // State for refreshToken
  const router = useRouter();

  // Check if tokens exist in localStorage when the component mounts
  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
    }
    if (storedRefreshToken) {
      setRefreshToken(storedRefreshToken);
    }
  }, []);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const hideSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const registerUser = async (userData: { username: string; email: string; password: string; role: string }) => {
    try {
      const response = await apiService.post("/auth/register", userData);
      showSnackbar("Vui lòng kiểm tra email để xác thực tài khoản của bạn", "success");
      return response.data.message;
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || "Registration failed", "error");
      return err.response?.data?.message;
    }
  };

  const loginUser = async (username: string, password: string) => {
    try {
      const response = await apiService.post("/auth/authenticate", {
        username,
        password,
      });
      if (response.status === 200) {
        const accessToken = response.data.data.accessToken;
        const refreshToken = response.data.data.refreshToken;
        console.log(accessToken, refreshToken);
        // Store both tokens in state and localStorage
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        showSnackbar("Đăng nhập thành công", "success");
        setTimeout(() => {
          router.push("/home");
        }, 2000);
      }
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || "Login failed", "error");
    }
  };

  const logoutUser = async () => {
    try {
      // Retrieve the accessToken from localStorage or state
      const accessToken = localStorage.getItem("accessToken");
  
      // Set up the headers with the accessToken
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Send the token in the Authorization header
        },
      };
  
      // Send the logout request with the token in the header
      const response = await apiService.post("/auth/logout", {}, config);
  
      if (response.status === 200) {
        // Clear the tokens and redirect to login page
        setAccessToken(null); // Remove accessToken from state
        setRefreshToken(null); // Remove refreshToken from state
        localStorage.removeItem("accessToken"); // Remove accessToken from localStorage
        localStorage.removeItem("refreshToken"); // Remove refreshToken from localStorage
        router.push("/login"); // Redirect to login page
        showSnackbar(response.data.message, "success"); // Display logout success message
      }
    } catch (error) {
      showSnackbar(error.response?.data?.message || "Logout failed", "error");
    }
  };
  
  

  return (
    <AuthContext.Provider value={{ registerUser, loginUser, logoutUser, accessToken, refreshToken }}>
      {children}
      <SnackbarComponent
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
