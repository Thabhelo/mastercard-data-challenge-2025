import { useRef, useEffect } from "react";
import Chart from "chart.js/auto";
import { palette } from "../utils/theme";

const data = {
  labels: [
    "Mean IGS",
    "Current IGS",
    "Max IGS",
    "Min IGS",
    "Mean Growth Score",
    "Current Growth Score",
    "Max Growth Score",
    "Min Growth Score",
    "Mean Inclusion Score",
    "Current Inclusion Score",
    "Max Inclusion Score",
    "Min Inclusion Score",
  ],
  datasets: [
    {
      label: "Tract 1100",
      data: [47.625, 50, 56, 40, 48.875, 59, 59, 34, 46, 41, 55, 41],
      fill: true,
      backgroundColor: palette.dark.tract1 + 22,
      borderColor: palette.dark.tract1,
      pointBackgroundColor: palette.dark.tract1,
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: palette.dark.tract1,
    },
    {
      label: "Tract 105",
      data: [24, 23, 28, 21, 27.75, 23, 40, 21, 20.375, 23, 23, 16],
      fill: true,
      backgroundColor: palette.dark.tract2 + "33",
      borderColor: palette.dark.tract2,
      pointBackgroundColor: palette.dark.tract2,
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: palette.dark.tract2,
    },
  ],
};

export default function RadarChart() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    // Destroy old chart instance if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");

    chartRef.current = new Chart(ctx, {
      type: "radar",
      data: data,
      options: {
        responsive: true,
        elements: {
          line: {
            borderWidth: 3,
          },
        },
        plugins: {
          legend: {
            labels: {
              font: {
                size: 15,
                weight: "600",
              },
            },
          },
        },
        scales: {
          r: {
            grid: {
              color: "rgba(200, 200, 200, 0.2)",
            },
            angleLines: {
              color: "rgba(200, 200, 200, 0.3)",
            },
            pointLabels: {
              color: "#ddd",
              font: { size: 14, weight: "300" },
            },
            ticks: {
              // display: false, // clean aesthetic
              color: "#bbb",
              font: { size: 15 },
              showLabelBackdrop: false,
            },
            suggestedMin: 0,
            suggestedMax: 10,
            // max: 5,
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [data]);

  return (
    <div style={{ width: "65%" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
