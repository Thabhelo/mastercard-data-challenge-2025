import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  Legend,
} from "recharts";
import { Typography, useTheme, Box } from "@mui/material";
import { palette } from "../utils/theme.jsx";

function TimeSeriesComparison({ data }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  
  const { years, tract_105_igs, tract_1100_igs } = data;
  const series = years.map((year, i) => ({
    year: year.toString(),
    "Tract 105": tract_105_igs[i],
    "Tract 1100": tract_1100_igs[i],
    threshold: 45,
  }));

  const textColor = isDark ? "#bbbfbc" : "#666666";
  const gridColor = isDark ? "#334155" : "#e0e0e0";

  return (
    <Box
      sx={{
        background: isDark ? "#202124" : "#ffffff",
        padding: "30px",
        borderRadius: "10px",
        border: isDark ? "0.05px solid #888383a9" : "1px solid #e0e0e0",
        boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.06)",
        minWidth: 320,
      }}
    >
      <Typography variant="h2" sx={{ fontWeight: 700, fontSize: "1.7rem", mb: 2 }}>
        IGS Time Series Analysis (2017-2024)
      </Typography>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={series}>
          <XAxis
            dataKey="year"
            stroke={textColor}
            tickLine={false}
            axisLine={false}
            fontSize={13}
          />
          <YAxis
            stroke={textColor}
            domain={["dataMin-2", "dataMax+2"]}
            tick={{ fontSize: 13, fill: textColor }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 5"
            stroke={gridColor}
          />
          <Tooltip
            contentStyle={{
              background: isDark ? "#1a1a2edd" : "#ffffffee",
              borderRadius: 16,
              color: isDark ? "#fff" : "#333",
              borderColor: isDark ? "#334155" : "#e0e0e0",
              boxShadow: isDark ? "none" : "0 4px 12px rgba(0,0,0,0.1)",
            }}
            labelStyle={{ color: palette.dark.tract2 }}
            cursor={{ stroke: palette.dark.tract2, strokeDasharray: 2 }}
          />

          <Line
            type="monotone"
            dataKey="Tract 105"
            stroke={palette.dark.tract2}
            strokeWidth={3}
            dot={false}
            activeDot={{
              r: 6,
              fill: palette.dark.tract2,
              stroke: isDark ? "#fff" : "#333",
              strokeWidth: 3,
            }}
            strokeLinejoin="round"
          />
          <Line
            type="monotone"
            dataKey="Tract 1100"
            stroke={palette.dark.tract1}
            strokeWidth={3}
            dot={false}
            activeDot={{
              r: 6,
              fill: palette.dark.tract1,
              stroke: isDark ? "#fff" : "#333",
              strokeWidth: 3,
            }}
            strokeLinejoin="round"
          />
          <Line
            type="stepAfter"
            dataKey="threshold"
            stroke="#64748b"
            strokeWidth={2}
            dot={false}
            legendType="none"
            strokeDasharray="4 4"
          />
          <Legend
            verticalAlign="top"
            height={30}
            iconType="plainline"
            wrapperStyle={{ color: isDark ? "#ffffff" : "#333333", fontSize: 14 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}

export default TimeSeriesComparison;
