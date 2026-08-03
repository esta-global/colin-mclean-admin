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
  totalInquiries: number;
};

type PropsType = {
  startDate: string; // DD-MM-YYYY
  endDate: string; // DD-MM-YYYY
};

// --------------------
// Component
// --------------------
export default function TopCountriesInquiriesBarChart({
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
        text: "Top Countries by Inquiries",
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
          text: "Total Inquiries",
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

        const url = `/inquiries/report/topCountriesInquiries?limit=10&startDate=${startDate}&endDate=${endDate}`;

        const response = await get(url, true);

        if (response?.status !== 200) {
          // toast.error(response?.message || "Failed to fetch data");
          return;
        }

        let geoData: GeoDataItem[] = response?.body?.topCountries || [];

        // Sort descending (better UX)
        geoData = geoData.sort((a, b) => b.totalInquiries - a.totalInquiries);

        const labels = geoData.map((item) => item.country);
        const values = geoData.map((item) => item.totalInquiries);

        setChartData({
          labels,
          datasets: [
            {
              label: "Total Inquiries",
              data: values,
              backgroundColor: "rgba(59, 130, 246, 0.8)",
              borderRadius: 6,
              barThickness: 40,
            },
          ],
        });
      } catch (error) {
        toast.error("Error fetching inquiry data");
        console.error(error);
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
