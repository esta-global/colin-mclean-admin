import { BarChart } from "@mui/x-charts/BarChart";

export default function BarAnimation() {
  return (
    <BarChart
      height={350}
      series={[
        { label: "Online", data: [4, 3, 1, 2, 4] },
        { label: "Offline", data: [1, 6, 9, 2, 4] },
      ]}
      xAxis={[
        {
          scaleType: "band",
          data: ["Jan", "Feb", "March", "April", "May"],
        },
      ]}
    />
  );
}
