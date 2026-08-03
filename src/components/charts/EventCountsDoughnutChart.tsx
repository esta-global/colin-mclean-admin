import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { get } from "../../utills";
import { toast } from "react-toastify";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

type EventItem = {
  eventName: string;
  eventCount: number;
};

type PropsType = {
  startDate: any;
  endDate: any;
};

export default function EventCountsDoughnutChart(props: PropsType) {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
      },
      title: {
        display: true,
        text: "Top GA4 Events",
      },
    },
  };

  useEffect(() => {
    async function fetchData(selectedDate: PropsType) {
      try {
        let url = `/googleAnalytics/getEventCountsByName?startDate=${selectedDate.startDate}&endDate=${selectedDate.endDate}`;
        const response = await get(url, true);

        if (response?.status === 200) {
          const events: EventItem[] = response.body.slice(0, 6); // Top 6 only

          const labels = events.map((e) => e.eventName);
          const data = events.map((e) => e.eventCount);

          const backgroundColors = [
            "#3b82f6",
            "#10b981",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
            "#14b8a6",
          ];

          setChartData({
            labels,
            datasets: [
              {
                label: "Event Count",
                data,
                backgroundColor: backgroundColors,
              },
            ],
          });
        } else {
          // toast.error(response?.message || "Failed to fetch event data");
        }
      } catch (err) {
        toast.error("Error loading event data");
        console.error(err);
      }
    }

    fetchData(props);
  }, [props]);

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <Doughnut data={chartData} options={chartOptions} />
    </div>
  );
}
