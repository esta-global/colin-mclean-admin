import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

// Register the required components for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart: React.FC = () => {
  // Define the data for the doughnut chart
  const data = {
    labels: ["Offline Sales", "Online Sales"],
    datasets: [
      {
        data: [22789, 94678], // Values for offline and online sales
        backgroundColor: ["rgb(255, 99, 132)", "rgb(54, 162, 235)"],
        // borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
        borderWidth: 1,
        hoverOffset: 4,
      },
    ],
  };

  // Define options for the doughnut chart
  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    layout: { padding: 20 },
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return <Doughnut data={data} options={options} />;
};

export default DoughnutChart;
