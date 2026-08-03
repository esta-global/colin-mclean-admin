import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { get } from "../../utills";
import { toast } from "react-toastify";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Define the type for the chart data
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor: string;
    borderDash?: number[];
    tension: number;
    fill: boolean;
  }[];
}

const SalesBarChart = () => {
  const [loading, setLoading] = useState<boolean>(true);
  let [data, setData] = useState<ChartData>({
    labels: [],
    datasets: [],
  });

  // Get Total Sales
  useEffect(function () {
    async function getData() {
      setLoading(true);
      let url = `/orders/report/monthlySales?year=2025`;

      const apiResponse = await get(url, true);

      if (apiResponse?.status == 200) {
        let totalSales = apiResponse?.body?.map((item: any) => item.totalSales);
        let months = apiResponse?.body?.map((item: any) => item.month);

        setData({
          labels: months,
          datasets: [
            {
              label: "Total Sale",
              data: totalSales,
              borderColor: "rgba(33, 150, 243, 1)",
              backgroundColor: "rgba(33, 150, 243, 0.1)",
              tension: 0.4, // curved lines
              fill: true,
            },
            // {
            //   label: "Previous Period",
            //   data: [35, 38, 32, 20, 15, 60, 40],
            //   borderColor: "rgba(33, 150, 243, 0.4)",
            //   borderDash: [5, 5], // dotted line
            //   tension: 0.4,
            //   fill: false,
            // },
          ],
        });
      } else {
        toast.error(apiResponse?.message);
      }
      setLoading(false);
    }

    getData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 20 },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default SalesBarChart;
