import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { toast } from "react-toastify";
import { get } from "../../utills";

// Register the required components for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

type PropsType = {
  startDate: any;
  endDate: any;
};

function PieChart(props: PropsType) {
  const [topCategoriesLoading, setTopCategoriesLoading] =
    useState<boolean>(true);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  let [data, setData] = useState<any>({
    labels: [],
    datasets: [],
  });

  // Define options for the pie chart
  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      // title: {
      //   display: true,
      //   text: "Pie Chart Example",
      // },
    },
  };

  // Get Total Sales
  useEffect(
    function () {
      async function getData(selectedDate: PropsType) {
        setTopCategoriesLoading(true);

        let url = `/orders/report/topSellingCategories?startDate=${selectedDate.startDate}&endDate=${selectedDate.endDate}`;

        const apiResponse = await get(url, true);

        if (apiResponse?.status == 200) {
          setTopCategories(apiResponse?.body);
          let categories = apiResponse?.body?.map((item: any) => item.name);
          let saleAmounts = apiResponse?.body?.map(
            (item: any) => item.saleAmount
          );

          setData({
            labels: categories,
            datasets: [
              {
                label: "Value",
                data: saleAmounts, // Values for each section
                backgroundColor: [
                  "rgba(255, 99, 132, 0.6)",
                  "rgba(54, 162, 235, 0.6)",
                  "rgba(255, 206, 86, 0.6)",
                  "rgba(75, 192, 192, 0.6)",
                  "rgba(153, 102, 255, 0.6)",
                ],
                borderColor: [
                  "rgba(255, 99, 132, 1)",
                  "rgba(54, 162, 235, 1)",
                  "rgba(255, 206, 86, 1)",
                  "rgba(75, 192, 192, 1)",
                  "rgba(153, 102, 255, 1)",
                ],
                borderWidth: 0,
              },
            ],
          });
        } else {
          toast.error(apiResponse?.message);
        }
        setTopCategoriesLoading(false);
      }

      getData(props);
    },
    [props]
  );

  // Define the data for the pie chart

  return <Doughnut data={data} options={options} />;
}

export default PieChart;
