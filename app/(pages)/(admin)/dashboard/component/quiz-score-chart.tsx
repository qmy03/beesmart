import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import apiService from "@/app/untils/api";
import { useAuth } from "@/app/hooks/AuthContext";
import { Box, Card, CardContent, Typography } from "@mui/material";

interface ScoreRangeData {
  "0.0 - 3.4": number;
  "3.5 - 4.9": number;
  "5.0 - 6.4": number;
  "6.5 - 7.9": number;
  "8.0 - 10.0": number;
}

interface SubjectData extends ScoreRangeData {
  subject: string;
}

interface ApiResponseData {
  [subject: string]: Partial<ScoreRangeData>;
}

interface ApiResponse {
  data: ApiResponseData | { data: ApiResponseData };
  status: number;
  statusText: string;
  headers: any;
  config: any;
  request?: any;
}

interface DebugInfo {
  rawData?: ApiResponseData;
  transformedData?: SubjectData[];
  timestamp?: string;
  error?: {
    status: number;
    statusText: string;
    data: any;
    url?: string;
  };
}

const QuizScoreChart: React.FC = () => {
  const { accessToken } = useAuth();
  const [data, setData] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  const fetchQuizScoreData = async (): Promise<ApiResponse> => {
    try {
      console.log(
        "Making API request to: /statistics/admin/quiz-score-by-subject"
      );
      console.log("Access token exists:", !!accessToken);

      const response = await apiService.get(
        "/statistics/admin/quiz-score-by-subject",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", response);
      return response as ApiResponse;
    } catch (error: any) {
      console.error("API Error Details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setDebugInfo(null);

        if (!accessToken) {
          throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
        }

        const response = await fetchQuizScoreData();

        console.log("Full response structure:", response);

        let responseData: ApiResponseData;
        if (response.data && typeof response.data === "object") {
          if ("data" in response.data && response.data.data) {
            responseData = response.data.data as ApiResponseData;
          } else {
            responseData = response.data as ApiResponseData;
          }
        } else {
          throw new Error("Cấu trúc dữ liệu trả về không đúng");
        }

        console.log("Processed response data:", responseData);

        if (!responseData || typeof responseData !== "object") {
          throw new Error("Dữ liệu trả về không hợp lệ");
        }

        const subjects = ["Toán", "Tự nhiên và xã hội"];
        const scoreRanges: (keyof ScoreRangeData)[] = [
          "0.0 - 3.4",
          "3.5 - 4.9",
          "5.0 - 6.4",
          "6.5 - 7.9",
          "8.0 - 10.0",
        ];

        const transformedData: SubjectData[] = subjects.map((subject) => {
          const subjectData: SubjectData = {
            subject: subject,
            "0.0 - 3.4": 0,
            "3.5 - 4.9": 0,
            "5.0 - 6.4": 0,
            "6.5 - 7.9": 0,
            "8.0 - 10.0": 0,
          };

          scoreRanges.forEach((range) => {
            subjectData[range] = responseData[subject]?.[range] || 0;
          });

          return subjectData;
        });

        console.log("Transformed data:", transformedData);
        setData(transformedData);

        setDebugInfo({
          rawData: responseData,
          transformedData: transformedData,
          timestamp: new Date().toISOString(),
        });
      } catch (err: any) {
        console.error("Fetch error:", err);

        let errorMessage = "Lỗi không xác định";

        if (err.response) {
          const status = err.response.status;
          const serverMessage =
            err.response.data?.message ||
            err.response.data?.error ||
            err.response.statusText;

          switch (status) {
            case 401:
              errorMessage = "Không có quyền truy cập. Vui lòng đăng nhập lại.";
              break;
            case 403:
              errorMessage = "Không có quyền truy cập dữ liệu này.";
              break;
            case 404:
              errorMessage = "Không tìm thấy API endpoint.";
              break;
            case 500:
              errorMessage = `Lỗi server nội bộ. ${serverMessage ? `Chi tiết: ${serverMessage}` : ""}`;
              break;
            default:
              errorMessage = `Lỗi server: ${status} - ${serverMessage}`;
          }

          setDebugInfo({
            error: {
              status: status,
              statusText: err.response.statusText,
              data: err.response.data,
              url: err.config?.url,
            },
            timestamp: new Date().toISOString(),
          });
        } else if (err.request) {
          errorMessage =
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
        } else {
          errorMessage = err.message || "Lỗi không xác định";
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);

  const colors: Record<keyof ScoreRangeData, string> = {
    "0.0 - 3.4": "#ef4444",
    "3.5 - 4.9": "#f97316",
    "5.0 - 6.4": "#eab308",
    "6.5 - 7.9": "#22c55e",
    "8.0 - 10.0": "#3b82f6",
  };

  const retryFetch = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  const calculateSubjectTotal = (subjectName: string): number => {
    const subjectData = data.find((item) => item.subject === subjectName);
    if (!subjectData) return 0;

    return Object.keys(colors).reduce((sum, range) => {
      return sum + (subjectData[range as keyof ScoreRangeData] || 0);
    }, 0);
  };

  // if (loading) {
  //   return (
  //     <Box className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
  //       <Box className="text-center">
  //         <Box className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></Box>
  //         <p className="text-gray-600">Đang tải dữ liệu...</p>
  //       </Box>
  //     </Box>
  //   );
  // }

  if (error) {
    return (
      <Box className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
        <Box className="text-center max-w-md">
          <Box className="text-red-500 text-xl mb-2">⚠️</Box>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={retryFetch}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Thử lại
          </button>

          {process.env.NODE_ENV === "development" && debugInfo && (
            <details className="mt-4 text-left text-xs bg-gray-100 p-2 rounded">
              <summary className="cursor-pointer font-medium">
                Debug Info
              </summary>
              <pre className="mt-2 overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent sx={{ p: 2 }}>
        <Typography fontWeight={600} fontSize={20}>
          Thống kê số thí sinh theo môn học và phân bố điểm
        </Typography>

        <Box className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            {data && data.length > 0 ? (
              <BarChart
                data={data}
                margin={{
                  top: 70,
                  // right: 30,
                  // left: 20,
                  bottom: 20,
                }}
                barCategoryGap="30%"
                barGap={2}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis
                  dataKey="subject"
                  tick={{ fontSize: 12 }}
                  textAnchor="middle"
                  height={60}
                />
                <YAxis
                  label={{
                    value: "Thí sinh",
                    position: "top",
                    offset: 25,
                    style: {
                      textAnchor: "middle",
                      fill: "#6E7987",
                      // fontWeight: "bold",
                    },
                  }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `${value} thí sinh`,
                    `${name} điểm`,
                  ]}
                  labelFormatter={(label) => `Môn: ${label}`}
                  contentStyle={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                {/* <Legend wrapperStyle={{ paddingTop: "20px" }} /> */}
                <Bar
                  dataKey="0.0 - 3.4"
                  fill="#ef4444"
                  name="0.0 - 3.4"
                  radius={[12, 12, 4, 4]}
                />
                <Bar
                  dataKey="3.5 - 4.9"
                  fill="#f97316"
                  name="3.5 - 4.9"
                  radius={[12, 12, 4, 4]}
                />
                <Bar
                  dataKey="5.0 - 6.4"
                  fill="#eab308"
                  name="5.0 - 6.4"
                  radius={[12, 12, 4, 4]}
                />
                <Bar
                  dataKey="6.5 - 7.9"
                  fill="#22c55e"
                  name="6.5 - 7.9"
                  radius={[12, 12, 4, 4]}
                />
                <Bar
                  dataKey="8.0 - 10.0"
                  fill="#3b82f6"
                  name="8.0 - 10.0"
                  radius={[12, 12, 4, 4]}
                />
              </BarChart>
            ) : (
              <Box
                sx={{
                  height: 400,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography color="text.secondary">
                  Đang tải dữ liệu...
                </Typography>
              </Box>
            )}
          </ResponsiveContainer>
        </Box>

        <Box>
          <Box className="flex flex-wrap gap-4 items-center justify-center">
            {Object.entries(colors).map(([range, color]) => (
              <Box key={range} className="flex items-center gap-2">
                <Box
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: color }}
                ></Box>
                <span className="text-sm text-gray-600">{range} điểm</span>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuizScoreChart;
