import { useEffect, useState } from "react";
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

// --------------------
// Types
// --------------------
type GeoDataItem = {
  country: string;
  totalOrders: number;
};

type PropsType = {
  startDate: string; // DD-MM-YYYY
  endDate: string; // DD-MM-YYYY
};

// --------------------
// Component
// --------------------
export default function TopContriesOrdersBarChart({
  startDate,
  endDate,
}: PropsType) {
  const [loading, setLoading] = useState<boolean>(true);
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });

  // --------------------
  // Chart Options (VERTICAL)
  // --------------------
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Top Countries by Orders",
      },
      tooltip: {
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Country",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Total Orders",
        },
        ticks: {
          precision: 0,
        },
      },
    },
  };

  // --------------------
  // Fetch Data
  // --------------------
  useEffect(() => {
    async function fetchTopCountries() {
      try {
        setLoading(true);

        const url = `/orders/report/topCountriesOrders?limit=10&startDate=${startDate}&endDate=${endDate}`;

        const response = await get(url, true);

        if (response?.status !== 200) {
          // toast.error(response?.message || "Failed to fetch data");
          return;
        }

        let geoData: GeoDataItem[] = response?.body?.topCountries || [];

        // Sort descending
        geoData = geoData.sort((a, b) => b.totalOrders - a.totalOrders);

        const labels = geoData.map((item) => item.country);
        const values = geoData.map((item) => item.totalOrders);

        setChartData({
          labels,
          datasets: [
            {
              label: "Total Orders",
              data: values,
              backgroundColor: "#f59e0b", // ✅ Amber color
              hoverBackgroundColor: "#d97706", // optional darker hover
              borderRadius: 6,
              barThickness: 40,
            },
          ],
        });
      } catch (error) {
        // toast.error("Error fetching order data");
      } finally {
        setLoading(false);
      }
    }

    if (startDate && endDate) {
      fetchTopCountries();
    }
  }, [startDate, endDate]);

  // --------------------
  // Render
  // --------------------
  return (
    <div style={{ height: "350px", width: "100%" }}>
      {!loading && chartData.labels.length > 0 ? (
        <Bar data={chartData} options={chartOptions} />
      ) : (
        !loading && (
          <p className="text-center text-muted">
            No data available for selected date range
          </p>
        )
      )}
    </div>
  );
}
