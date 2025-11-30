import { useRef, useEffect } from "react";
import { useTheme } from "@mui/material";
import Chart from "chart.js/auto";
import { palette } from "../utils/theme";

export default function BarChart() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext("2d");

    const textColor = isDark ? "#f5f5f5" : "#333333";
    const gridColor = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";

    const data = {
      labels: [
        "Mean IGS",
        "Current IGS",
        "Mean Growth Score",
        "Current Growth Score",
        "Mean Inclusion Score",
        "Current Inclusion Score",
      ],
      datasets: [
        {
          label: "Census Tract 105",
          data: [24, 23, 27.75, 23, 20.375, 23],
          backgroundColor: palette.dark.tract2,
          borderRadius: 4,
          barPercentage: 0.9,
          categoryPercentage: 0.6,
        },
        {
          label: "Census Tract 1100",
          data: [47.625, 50, 48.875, 59, 46, 41],
          backgroundColor: palette.dark.tract1,
          borderRadius: 4,
          barPercentage: 0.9,
          categoryPercentage: 0.6,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Mean and Latest Scores by Census Tract",
          color: textColor,
          font: {
            size: 22,
            weight: "700",
          },
          padding: {
            top: 10,
            bottom: 20,
          },
        },
        legend: {
          position: "top",
          labels: {
            color: textColor,
            font: {
              size: 14,
              weight: "500",
            },
            padding: 16,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: textColor,
            font: {
              size: 13,
              weight: "500",
            },
          },
        },
        y: {
          beginAtZero: true,
          suggestedMax: 60,
          grid: {
            color: gridColor,
          },
          ticks: {
            color: textColor,
            font: {
              size: 12,
            },
          },
        },
      },
    };

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data,
      options,
    });

    return () => chartRef.current?.destroy();
  }, [isDark]);

  return (
    <div
      style={{
        width: "100%",
        height: 380,
        padding: "1rem 2rem",
        background: isDark ? "#202124" : "#ffffff",
        borderRadius: "10px",
        border: isDark ? "0.05px solid #888383a9" : "1px solid #e0e0e0",
        boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
