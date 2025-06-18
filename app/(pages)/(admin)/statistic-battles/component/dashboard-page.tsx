import { Box, Card, Typography } from "@mui/material";
import TextField from "@/app/components/textfield";
import { useEffect, useState } from "react";
import apiService from "@/app/untils/api";
import Layout from "@/app/components/admin/layout";
import QuizAverageBarChart from "../../dashboard/component/quiz-average-bar-chart";
import BattleStatisticsChart from "../../dashboard/component/battle-statistics-chart";
import BattleScoreChart from "../../dashboard/component/battle-score-chart";
import QuizStatisticsChart from "../../dashboard/component/quiz-statistics-chart";

interface Subject {
  subjectId: string;
  subjectName: string;
}

interface BattleStatistics {
  [key: string]: number;
}

interface BattleScoreData {
  [subject: string]: {
    "0-50": number;
    "51-70": number;
    "71-90": number;
    "91-100": number;
  };
}

const StatisticBattlesPage = () => {
  // const accessToken = localStorage.getItem("accessToken");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${new Date().getMonth() + 1}`.padStart(2, "0")
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    `${new Date().getFullYear()}`
  );
  const [battleAverageData, setBattleAverageData] = useState<
    { date: string; averages: { [key: string]: number } }[]
  >([]);
  const [selectedSubjectForBattleAverage, setSelectedSubjectForBattleAverage] =
    useState<string>("");
  const [subjects, setSubjects] = useState<
    { subjectId: string; subjectName: string }[]
  >([]);
  const [dateInput, setDateInput] = useState<string>(
    `${selectedMonth.padStart(2, "0")}-${selectedYear}`
  );
  const [error, setError] = useState<string>("");
  const [battleStatistics, setBattleStatistics] = useState<BattleStatistics>(
    {}
  );
  const [battleScoreData, setBattleScoreData] = useState<BattleScoreData>({});
  const [battleStatisticsLoading, setBattleStatisticsLoading] = useState(false);
  const [battleScoreLoading, setBattleScoreLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      setAccessToken(token);
    }
  }, []);
  useEffect(() => {
    const fetchSubjectsAndStats = async () => {
      if (!accessToken) {
        setError("Không tìm thấy token xác thực");
        return;
      }

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };

        // Fetch subjects and battle statistics
        const [subjectsResponse, battleStatsResponse, battleScoreResponse] =
          await Promise.all([
            apiService.get("/subjects", config),
            apiService.get("/statistics/admin/battle-users-by-subject", config),
            apiService.get("/statistics/admin/battle-score-by-subject", config),
          ]);

        // Set subjects
        const subjectsData = subjectsResponse.data?.data?.subjects || [];
        setSubjects(subjectsData);
        if (subjectsData.length > 0) {
          setSelectedSubjectForBattleAverage(subjectsData[0].subjectName);
        }

        // Set battle statistics
        if (battleStatsResponse.data.status === 200) {
          setBattleStatistics(battleStatsResponse.data.data);
        } else {
          console.warn(
            "Battle statistics API failed:",
            battleStatsResponse.data.message
          );
          setBattleStatistics({});
        }

        // Set battle score data
        if (battleScoreResponse.data.status === 200) {
          setBattleScoreData(battleScoreResponse.data.data);
        } else {
          console.warn(
            "Battle score API failed:",
            battleScoreResponse.data.message
          );
          setBattleScoreData({});
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        setError("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setBattleStatisticsLoading(false);
        setBattleScoreLoading(false);
      }
    };

    fetchSubjectsAndStats();
  }, [accessToken]);

  useEffect(() => {
    const fetchBattleAverageData = async () => {
      if (!accessToken || !selectedSubjectForBattleAverage) return;
      try {
        const date = `${selectedMonth.padStart(2, "0")}-${selectedYear}`;
        const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };
        const averageResponse = await apiService.get(
          `/statistics/admin/battle-average-by-month?date=${date}&subject=${encodeURIComponent(selectedSubjectForBattleAverage)}`,
          config
        );
        if (averageResponse.data.status === 200) {
          const chartData = Object.entries(averageResponse.data.data).map(
            ([date, averages]: [string, any]) => ({
              date,
              averages,
            })
          );
          setBattleAverageData(chartData);
        } else {
          setBattleAverageData([]);
        }
      } catch (error) {
        console.error("Error fetching battle average data:", error);
        setBattleAverageData([]);
      }
    };

    fetchBattleAverageData();
  }, [
    accessToken,
    selectedMonth,
    selectedYear,
    selectedSubjectForBattleAverage,
  ]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateInput(value);

    const regex = /^(\d{2})-(\d{4})$/;
    const match = value.match(regex);

    if (match) {
      const month = match[1];
      const year = match[2];
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      if (
        monthNum >= 1 &&
        monthNum <= 12 &&
        yearNum >= 1900 &&
        yearNum <= 9999
      ) {
        setSelectedMonth(month);
        setSelectedYear(year);
        setError("");
      } else {
        setError("Vui lòng nhập tháng (01-12) và năm hợp lệ (ví dụ: 06-2025)");
      }
    } else {
      setError("Vui lòng nhập đúng định dạng: MM-YYYY (ví dụ: 06-2025)");
    }
  };

  useEffect(() => {
    setDateInput(`${selectedMonth.padStart(2, "0")}-${selectedYear}`);
  }, [selectedMonth, selectedYear]);

  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          padding: "0 10px",
          gap: 2,
          flex: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            padding: "12px",
            alignItems: "center",
            boxShadow: 4,
            borderRadius: "8px",
            backgroundColor: "#FFFFFF",
          }}
        >
          <Typography fontWeight={700} flexGrow={1}>
            Thống kê Battle
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexDirection: "column",
            overflowX: "auto",
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              width: "100%",
            }}
          >
            <TextField
              type="text"
              value={dateInput}
              onChange={handleDateChange}
              label="Chọn tháng và năm"
              placeholder="MM-YYYY (ví dụ: 06-2025)"
              sx={{ flexGrow: 1 }}
              error={!!error}
              helperText={error}
            />
          </Box>
          <QuizAverageBarChart
            data={battleAverageData}
            month={Number(selectedMonth)}
            year={Number(selectedYear)}
            selectedSubject={selectedSubjectForBattleAverage}
            setSelectedSubject={setSelectedSubjectForBattleAverage}
            subjects1={subjects}
            type="arena"
            loading={false}
          />
          <Box
            sx={{
              display: "flex",
              gap: 2,
              width: "100%",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            <Card
              variant="outlined"
              sx={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <QuizStatisticsChart
                data={battleStatistics}
                loading={battleStatisticsLoading}
                type="battle"
              />
            </Card>
            <Card
              variant="outlined"
              sx={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <Box sx={{ width: "100%", height: 400 }}>
                <BattleScoreChart
                  data={battleScoreData}
                  loading={battleScoreLoading}
                />
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default StatisticBattlesPage;
