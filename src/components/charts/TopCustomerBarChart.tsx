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
  ChartOptions,
} from "chart.js";
import { get } from "../../utills";
import { toast } from "react-toastify";

// Register the required components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
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
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

type PropsType = {
  startDate: any;
  endDate: any;
};

function TopCustomerBarChart(props: PropsType) {
  const [loading, setLoading] = useState<boolean>(true);
  let [data, setData] = useState<ChartData>({
    labels: [],
    datasets: [],
  });

  // Get Customers
  useEffect(
    function () {
      async function getData(selectedDate: PropsType) {
        setLoading(true);
        let url = `/orders/report/topCustomers?startDate=${selectedDate.startDate}&endDate=${selectedDate.endDate}`;

        const apiResponse = await get(url, true);

        if (apiResponse?.status == 200) {
          let totalAmountSpent = apiResponse?.body?.map(
            (item: any) => item.totalAmountSpent
          );
          let customers = apiResponse?.body?.map((item: any) => item.name);

          setData({
            labels: customers,
            datasets: [
              {
                label: "Total Spent",
                data: totalAmountSpent,
                backgroundColor: [
                  "rgba(255, 99, 132, 0.2)",
                  "rgba(255, 159, 64, 0.2)",
                  "rgba(255, 205, 86, 0.2)",
                  "rgba(75, 192, 192, 0.2)",
                  "rgba(54, 162, 235, 0.2)",
                  "rgba(153, 102, 255, 0.2)",
                  "rgba(201, 203, 207, 0.2)",
                  "rgba(100, 181, 246, 0.2)", // Light Blue
                  "rgba(255, 171, 145, 0.2)", // Light Coral
                  "rgba(174, 213, 129, 0.2)", // Light Green
                ],
                borderColor: [
                  "rgb(255, 99, 132)",
                  "rgb(255, 159, 64)",
                  "rgb(255, 205, 86)",
                  "rgb(75, 192, 192)",
                  "rgb(54, 162, 235)",
                  "rgb(153, 102, 255)",
                  "rgb(201, 203, 207)",
                  "rgb(100, 181, 246)", // Light Blue
                  "rgb(255, 171, 145)", // Light Coral
                  "rgb(174, 213, 129)", // Light Green
                ],
                borderWidth: 0,
              },
            ],
          });
        } else {
          toast.error(apiResponse?.message);
        }
        setLoading(false);
      }

      getData(props);
    },
    [props]
  );

  // Define the data for the chart using your dataset
  // const data: ChartData = ;

  // Define options for the chart
  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      //   legend: {
      //     position: "top",
      //   },
      //   title: {
      //     display: true,
      //     text: "Monthly Sales Data",
      //   },
    },
  };

  return <Bar data={data} options={options} />;
}

export default TopCustomerBarChart;
