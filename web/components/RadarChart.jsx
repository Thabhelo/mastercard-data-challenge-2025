import { useRef, useEffect } from "react";
import { useTheme } from "@mui/material";
import Chart from "chart.js/auto";
import { palette } from "../utils/theme";

export default function RadarChart() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    const textColor = isDark ? "#ddd" : "#333";
    const gridColor = isDark
      ? "rgba(200, 200, 200, 0.2)"
      : "rgba(0, 0, 0, 0.1)";

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
          backgroundColor: palette.dark.tract1 + "22",
          borderColor: palette.dark.tract1,
          pointBackgroundColor: palette.dark.tract1,
          pointBorderColor: isDark ? "#fff" : "#333",
          pointHoverBackgroundColor: isDark ? "#fff" : "#333",
          pointHoverBorderColor: palette.dark.tract1,
        },
        {
          label: "Tract 105",
          data: [24, 23, 28, 21, 27.75, 23, 40, 21, 20.375, 23, 23, 16],
          fill: true,
          backgroundColor: palette.dark.tract2 + "33",
          borderColor: palette.dark.tract2,
          pointBackgroundColor: palette.dark.tract2,
          pointBorderColor: isDark ? "#fff" : "#333",
          pointHoverBackgroundColor: isDark ? "#fff" : "#333",
          pointHoverBorderColor: palette.dark.tract2,
        },
      ],
    };

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
              color: textColor,
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
              color: gridColor,
            },
            angleLines: {
              color: isDark
                ? "rgba(200, 200, 200, 0.3)"
                : "rgba(0, 0, 0, 0.15)",
            },
            pointLabels: {
              color: textColor,
              font: { size: 14, weight: "300" },
            },
            ticks: {
              color: isDark ? "#bbb" : "#666",
              font: { size: 15 },
              showLabelBackdrop: false,
            },
            suggestedMin: 0,
            suggestedMax: 10,
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [isDark]);

  return (
    <div style={{ width: "65%" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
