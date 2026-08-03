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

type GeoDataItem = {
  country: string;
  city: string;
  activeUsers: number;
};

type PropsType = {
  startDate: any;
  endDate: any;
};

export default function TopGeoLocationsChart(props: PropsType) {
  const [loading, setLoading] = useState<boolean>(true);
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });

  const chartOptions = {
    responsive: true,
    indexAxis: "y" as const, // Horizontal bar chart
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
          text: "Active Users",
        },
      },
      y: {
        title: {
          display: true,
          text: "Location",
        },
      },
    },
  };

  useEffect(() => {
    async function fetchGeoData(selectedDate: PropsType) {
      try {
        setLoading(true);
        let url = `/googleAnalytics/getUserGeoData?startDate=${selectedDate.startDate}&endDate=${selectedDate.endDate}`;
        const response = await get(url, true);

        if (response?.status === 200) {
          const geoData: GeoDataItem[] = response.body;

          const labels = geoData.map((item) =>
            item.city && item.city !== "(not set)"
              ? `${item.city}, ${item.country}`
              : item.country,
          );

          const dataset = {
            label: "Active Users",
            data: geoData.map((item) => item.activeUsers),
            backgroundColor: "#3b82f6",
          };

          setChartData({ labels, datasets: [dataset] });
        } else {
          // toast.error(response?.message || "Failed to fetch geo data");
        }
      } catch (err) {
        toast.error("Error fetching geo data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchGeoData(props);
  }, [props]);

  return (
    <div style={{ height: "300px" }}>
      {!loading && <Bar data={chartData} options={chartOptions} />}
    </div>
  );
}
