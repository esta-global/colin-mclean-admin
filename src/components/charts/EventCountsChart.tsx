import React, { useEffect, useState } from "react";
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
  Legend
);

type EventItem = {
  eventName: string;
  eventCount: number;
};

const EventCountsChart: React.FC = () => {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });

  const chartOptions = {
    responsive: true,
    indexAxis: "y" as const,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
      title: {
        display: true,
        text: "Top GA4 Events",
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Event Count",
        },
      },
      y: {
        ticks: {
          autoSkip: false,
          maxRotation: 0,
        },
        title: {
          display: true,
          text: "Event Name",
        },
      },
    },
  };

  useEffect(() => {
    async function fetchEventCounts() {
      try {
        const response = await get(
          "/googleAnalytics/getEventCountsByName",
          true
        );

        if (response?.status === 200) {
          const events: EventItem[] = response.body;

          const labels = events.map((e) => e.eventName);
          const counts = events.map((e) => e.eventCount);

          setChartData({
            labels,
            datasets: [
              {
                label: "Event Count",
                data: counts,
                backgroundColor: "#6366f1",
              },
            ],
          });
        } else {
          toast.error(response?.message || "Failed to load event data");
        }
      } catch (error) {
        toast.error("Error loading event chart data");
        console.error(error);
      }
    }

    fetchEventCounts();
  }, []);

  return (
    <div style={{ height: "500px", overflowY: "auto" }}>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default EventCountsChart;
