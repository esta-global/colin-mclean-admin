import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { get } from "../../utills";
// import { toast } from "react-toastify";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
);

type WishlistItem = {
  name: string;
  totalOrders: number;
};

type PropsType = {
  startDate: any;
  endDate: any;
};

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#14b8a6", // teal
  "#ec4899", // pink
  "#6366f1", // indigo
  "#22c55e", // lime
  "#f97316", // orange
];

export default function TopOrderProductsBarChart(props: PropsType) {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Top Products by Total Orders",
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Total Orders",
        },
      },
    },
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const url = `/orders/report/topOrderProducts?startDate=${props.startDate}&endDate=${props.endDate}`;
        const response = await get(url, true);

        if (response?.status === 200) {
          const products: WishlistItem[] = response.body?.topProducts.slice(
            0,
            10,
          );

          setChartData({
            labels: products.map((p) => p.name),
            datasets: [
              {
                label: "Total Orders",
                data: products.map((p) => p.totalOrders),
                backgroundColor: products.map(
                  (_, index) => COLORS[index % COLORS.length],
                ),
                borderRadius: 8,
                barThickness: 22,
              },
            ],
          });
        } else {
          // toast.error("Failed to fetch orders data");
        }
      } catch (error) {
        // toast.error("Error loading orders data");
      }
    }

    fetchData();
  }, [props]);

  return (
    <div style={{ height: "420px", width: "100%" }}>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}
