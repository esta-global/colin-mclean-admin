import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { get } from "../../utills";
import { toast } from "react-toastify";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

type TrafficSourceItem = {
  sessionSource: string;
  sessionMedium: string;
  sessions: number;
  engagedSessions: number;
  conversions: number;
};

type PropsType = {
  startDate: any;
  endDate: any;
};

export default function TrafficSourcesChart(props: PropsType) {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const, // horizontal bars
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
        text: "Traffic Sources Overview",
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Count",
        },
      },
      y: {
        title: {
          display: true,
          text: "Source / Medium",
        },
      },
    },
  };

  useEffect(() => {
    async function fetchTrafficSources(selectedDate: PropsType) {
      try {
        let url = `/googleAnalytics/getTrafficSources?startDate=${selectedDate.startDate}&endDate=${selectedDate.endDate}`;

        const response = await get(url, true);
        if (response?.status === 200) {
          const sources: TrafficSourceItem[] = response.body;

          const labels = sources.map(
            (item) => `${item.sessionSource} / ${item.sessionMedium}`,
          );

          const sessions = sources.map((item) => item.sessions);
          const engaged = sources.map((item) => item.engagedSessions);
          const conversions = sources.map((item) => item.conversions);

          setChartData({
            labels,
            datasets: [
              {
                label: "Sessions",
                data: sessions,
                backgroundColor: "#3b82f6",
              },
              {
                label: "Engaged Sessions",
                data: engaged,
                backgroundColor: "#10b981",
              },
              {
                label: "Conversions",
                data: conversions,
                backgroundColor: "#f59e0b",
              },
            ],
          });
        } else {
          // toast.error(response?.message || "Failed to fetch traffic sources");
        }
      } catch (error) {
        // toast.error("Error loading traffic source data");
        console.error(error);
      }
    }

    fetchTrafficSources(props);
  }, [props]);

  return (
    <div style={{ height: "300px" }}>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}
