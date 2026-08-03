import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { get } from "../../utills";
import { toast } from "react-toastify";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
);

type TrendItem = {
  date: string;
  activeUsers: number;
  newUsers: number;
  screenPageViews: number;
};

type PropsType = {
  startDate: any;
  endDate: any;
};

function DailyUserTrendsChart(props: PropsType) {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>({
    labels: [],
    datasets: [],
  });

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false, // ✅ KEY TO LET DIV CONTROL HEIGHT
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
    scales: {
      x: {
        title: { display: true, text: "Date" },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: "Count" },
      },
    },
  };

  useEffect(() => {
    async function getData(selectedDate: PropsType) {
      setLoading(true);
      let url = `/googleAnalytics/getDailyUserTrends?startDate=${selectedDate.startDate}&endDate=${selectedDate.endDate}`;
      const apiResponse = await get(url, true);

      if (apiResponse?.status === 200) {
        const trendData: TrendItem[] = apiResponse.body;

        setData({
          labels: trendData.map((item) => item.date),
          datasets: [
            {
              label: "Active Users",
              data: trendData.map((item) => item.activeUsers),
              borderColor: "#3b82f6",
              backgroundColor: "#3b82f644",
              tension: 0.3,
              fill: true,
            },
            {
              label: "New Users",
              data: trendData.map((item) => item.newUsers),
              borderColor: "#10b981",
              backgroundColor: "#10b98144",
              tension: 0.3,
              fill: true,
            },
            {
              label: "Page Views",
              data: trendData.map((item) => item.screenPageViews),
              borderColor: "#f59e0b",
              backgroundColor: "#f59e0b44",
              tension: 0.3,
              fill: true,
            },
          ],
        });
      } else {
        // toast.error(apiResponse?.message || "Failed to fetch chart data");
      }

      setLoading(false);
    }

    getData(props);
  }, [props]);

  return (
    <div style={{ height: "250px" }}>
      {!loading && <Line data={data} options={chartOptions} />}
    </div>
  );
}

export default DailyUserTrendsChart;
