import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { get } from "../../utills";
import { toast } from "react-toastify";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

type WishlistItem = {
  name: string;
  totalWishlists: number;
};

type PropsType = {
  startDate: any;
  endDate: any;
};

export default function TopWishlistProductsDoughnutChart(props: PropsType) {
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
        text: "Top Wishlists Products",
      },
    },
  };

  useEffect(() => {
    async function fetchData(selectedDate: PropsType) {
      try {
        let url = `/wishlists/report/topWishlistProducts?startDate=${selectedDate.startDate}&endDate=${selectedDate.endDate}`;
        const response = await get(url, true);

        if (response?.status === 200) {
          const wishlist: WishlistItem[] = response.body?.topProducts.slice(
            0,
            10,
          ); // Top 6 only

          const labels = wishlist.map((e) => e.name);
          const data = wishlist.map((e) => e.totalWishlists);

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
                label: "Total Wishlists",
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
