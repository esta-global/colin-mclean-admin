import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { get } from "../../utills";
import { toast } from "react-toastify";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
);

type TopPageItem = {
  pagePath: string;
  screenPageViews: number;
  activeUsers: number;
  averageSessionDuration: number;
};

type PropsType = {
  startDate: any;
  endDate: any;
};

function TopPagesChart(props: PropsType) {
  const [loading, setLoading] = useState<boolean>(true);
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });

  const chartOptions = {
    responsive: true,
    indexAxis: "y" as const, // horizontal bars
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Value",
        },
      },
      y: {
        title: {
          display: true,
          text: "Page Path",
        },
      },
    },
  };

  useEffect(() => {
    async function fetchTopPages(selectedDate: PropsType) {
      try {
        setLoading(true);
        let url = `/googleAnalytics/getTopPages?startDate=${selectedDate.startDate}&endDate=${selectedDate.endDate}`;
        const response = await get(url, true);

        if (response?.status === 200) {
          const topPages: TopPageItem[] = response.body;
          const labels = topPages.map((item) => item.pagePath);

          const datasets = [
            {
              label: "Page Views",
              data: topPages.map((item) => item.screenPageViews),
              backgroundColor: "#3b82f6",
            },
            {
              label: "Active Users",
              data: topPages.map((item) => item.activeUsers),
              backgroundColor: "#10b981",
            },
            {
              label: "Avg. Session Duration (s)",
              data: topPages.map((item) => item.averageSessionDuration),
              backgroundColor: "#f59e0b",
            },
          ];

          setChartData({ labels, datasets });
        } else {
          // toast.error(response?.message || "Failed to fetch top pages");
        }
      } catch (err) {
        toast.error("Error while loading top pages data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTopPages(props);
  }, [props]);

  return (
    <div style={{ height: "300px" }}>
      {!loading && <Bar data={chartData} options={chartOptions} />}
    </div>
  );
}

export default TopPagesChart;
