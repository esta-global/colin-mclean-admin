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
  Legend
);

type DeviceStatItem = {
  deviceCategory: string;
  browser: string;
  operatingSystem: string;
  activeUsers: number;
  screenPageViews: number;
};

type PropsType = {
  startDate: any;
  endDate: any;
};

export default function DeviceStatsChart(props: PropsType) {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
      title: {
        display: true,
        text: "Device Usage Stats",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Device Category",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Count",
        },
      },
    },
  };

  useEffect(() => {
    async function fetchDeviceStats(selectedDate: PropsType) {
      try {
        let url = `/googleAnalytics/getDeviceStats?startDate=${selectedDate.startDate}&endDate=${selectedDate.endDate}`;
        const response = await get(url, true);
        if (response?.status === 200) {
          const deviceStats: DeviceStatItem[] = response.body;

          // Group by device category
          const grouped: { [key: string]: { users: number; views: number } } =
            {};

          for (const item of deviceStats) {
            const key = item.deviceCategory;
            if (!grouped[key]) {
              grouped[key] = { users: 0, views: 0 };
            }
            grouped[key].users += item.activeUsers;
            grouped[key].views += item.screenPageViews;
          }

          const labels = Object.keys(grouped);
          const activeUsersData = labels.map((key) => grouped[key].users);
          const pageViewsData = labels.map((key) => grouped[key].views);

          setChartData({
            labels,
            datasets: [
              {
                label: "Active Users",
                data: activeUsersData,
                backgroundColor: "#3b82f6",
              },
              {
                label: "Page Views",
                data: pageViewsData,
                backgroundColor: "#f59e0b",
              },
            ],
          });
        } else {
          toast.error(response?.message || "Failed to load device stats");
        }
      } catch (err) {
        toast.error("Error loading device stats");
        console.error(err);
      }
    }

    fetchDeviceStats(props);
  }, [props]);

  return (
    <div style={{ height: "300px" }}>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}
