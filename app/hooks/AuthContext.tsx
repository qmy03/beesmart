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
  userInfo: {
    username: string;
    role: string;
    grade: string;
    userId: string;
  } | null;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
interface ApiResponse {
  message?: string;
  data?: any;
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
    userId: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    setIsLoading(true);
    try {
      const response = await apiService.post<ApiResponse>(
        "/auth/register",
        userData
      );
      console.log("userData", userData);
      console.log("response", response);
      showSnackbar(
        response.data.message || "Registration successful, please login",
        "success"
      );
      return null;
    } catch (err: any) {
      showSnackbar(
        err.response?.data?.message || "Registration failed",
        "error"
      );
      return err.response?.data?.message;
    } finally {
      setIsLoading(false);
    }
  };

  const loginUser = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.post<ApiResponse>(
        "/auth/authenticate",
        {
          username,
          password,
        }
      );
      if (response.status === 200) {
        const { accessToken, refreshToken, role, grade, userId } =
          response.data.data;
        const userInfo = { username, role, grade, userId };
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
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };

      const response = await apiService.post<ApiResponse>(
        "/auth/logout",
        {},
        config
      );

      if (response.status === 200) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("selectedGradeName");
        localStorage.removeItem("selectedGradeId");
        localStorage.removeItem("selectedSubjectName");
        localStorage.removeItem("selectedSubjectId");
        localStorage.removeItem("selectedBookTypeName");
        localStorage.removeItem("selectedBookTypeId");
        localStorage.removeItem("selectedSemester");
        localStorage.removeItem("selectedTopic");
        setAccessToken(null);
        setRefreshToken(null);
        setUserInfo(null);
        router.push("/login");
        showSnackbar(response.data?.message || "Logout successful", "success");
      }
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || "Logout failed", "error");
    } finally {
      setIsLoading(false);
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
        isLoading,
        setIsLoading,
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
