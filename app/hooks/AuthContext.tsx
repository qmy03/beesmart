import React, { createContext, useContext, useState, useEffect } from "react";
import apiService from "../untils/api";
import SnackbarComponent from "../components/snackbar";
import { useRouter } from "next/navigation";

interface AuthContextType {
  registerUser: (userData: {
    username: string;
    email: string;
    password: string;
    role: string;
    grade: string;
  }) => Promise<string | null>;
  loginUser: (username: string, password: string) => Promise<void>;
  logoutUser: () => void;
  accessToken: string | null;
  refreshToken: string | null;
  userInfo: { username: string; role: string; grade: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{
    username: string;
    role: string;
    grade: string;
  } | null>(null); // New state for user info
  const router = useRouter();

  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
    }
    if (storedRefreshToken) {
      setRefreshToken(storedRefreshToken);
    }
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
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

  const registerUser = async (userData: {
    username: string;
    email: string;
    password: string;
    role: string;
    grade: string;
  }) => {
    try {
      const response = await apiService.post("/auth/register", userData);
      console.log("userData", userData);
      console.log("response", response);
      showSnackbar(
        response.data.message || "Registration successful, please login",
        "success"
      );
    } catch (err: any) {
      showSnackbar(
        err.response?.data?.message || "Registration failed",
        "error"
      );
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
        const { accessToken, refreshToken, role, grade } = response.data.data;
        const userInfo = { username, role, grade }; // Thêm grade vào userInfo
        console.log("userInfoLogin", userInfo);
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        setUserInfo(userInfo);

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userInfo", JSON.stringify(userInfo));

        showSnackbar("Đăng nhập thành công", "success");

        setTimeout(() => {
          if (role === "SYSTEM_ADMIN") {
            router.push("/dashboard");
          } else if (role === "PARENT") {
            router.push("/dashboard-report");
          } else {
            router.push("/home");
          }
        }, 2000);
      }
    } catch (error: any) {
      showSnackbar(error.response.data.message, "error");
    }
  };

  const logoutUser = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };

      const response = await apiService.post("/auth/logout", {}, config);

      if (response.status === 200) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userInfo");
        setAccessToken(null);
        setRefreshToken(null);
        setUserInfo(null);
        router.push("/login");
        showSnackbar(response.data.message, "success");
      }
    } catch (error) {
      showSnackbar(error.response?.data?.message || "Logout failed", "error");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        registerUser,
        loginUser,
        logoutUser,
        accessToken,
        refreshToken,
        userInfo,
      }}
    >
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
