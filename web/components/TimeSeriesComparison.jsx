import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { Box, Paper, Typography, Chip } from "@mui/material";
import { motion } from "framer-motion";
import ShowChartIcon from "@mui/icons-material/ShowChart";

// Color palette
const colors = {
  primary: "#3b82f6",
  secondary: "#10b981", // Green for Tract 1100
  threshold: "#f59e0b", // Orange threshold line
  slate800: "#1e293b",
  slate600: "#475569",
  slate400: "#94a3b8",
};

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        sx={{
          p: 2,
          borderRadius: "12px",
          background: "#ffffff",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          border: "1px solid #e2e8f0",
        }}
      >
        <Typography sx={{ fontWeight: 700, color: colors.slate800, mb: 1 }}>
          Year {label}
        </Typography>
        {payload.map(
          (entry, index) =>
            entry.dataKey !== "threshold" && (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: entry.color,
                  }}
                />
                <Typography sx={{ fontSize: 13, color: colors.slate600 }}>
                  {entry.name}:{" "}
                  <strong style={{ color: entry.color }}>
                    {entry.value?.toFixed(1)}
                  </strong>
                </Typography>
              </Box>
            )
        )}
      </Paper>
    );
  }
  return null;
};

function TimeSeriesComparison({ data }) {
  const { years, tract_105_igs, tract_1100_igs } = data;

  // Compose series for recharts
  const series = years.map((year, i) => ({
    year: year.toString(),
    "Tract 105": tract_105_igs[i],
    "Tract 1100": tract_1100_igs[i],
    threshold: 45,
  }));

  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      sx={{
        borderRadius: "16px",
        p: 4,
        background: "#ffffff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        border: "1px solid #f1f5f9",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              backgroundColor: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShowChartIcon sx={{ fontSize: 22, color: colors.primary }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontSize: 16, fontWeight: 600, color: colors.slate800 }}
            >
              IGS Trends (2017-2024)
            </Typography>
            <Typography sx={{ fontSize: 13, color: colors.slate400 }}>
              Historical Inclusive Growth Score comparison
            </Typography>
          </Box>
        </Box>

        {/* Legend badges */}
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Chip
            icon={
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: colors.primary,
                  ml: 0.5,
                }}
              />
            }
            label="Tract 105"
            size="small"
            sx={{
              backgroundColor: "#eff6ff",
              color: colors.primary,
              fontWeight: 600,
              fontSize: 12,
              "& .MuiChip-icon": { marginLeft: "8px" },
            }}
          />
          <Chip
            icon={
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: colors.secondary,
                  ml: 0.5,
                }}
              />
            }
            label="Tract 1100"
            size="small"
            sx={{
              backgroundColor: "#dcfce7",
              color: colors.secondary,
              fontWeight: 600,
              fontSize: 12,
              "& .MuiChip-icon": { marginLeft: "8px" },
            }}
          />
        </Box>
      </Box>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart
          data={series}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <defs>
            <linearGradient id="colorTract105" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3} />
              <stop
                offset="95%"
                stopColor={colors.primary}
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            vertical={false}
          />

          <XAxis
            dataKey="year"
            stroke={colors.slate400}
            tick={{ fill: colors.slate400, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />

          <YAxis
            stroke={colors.slate400}
            tick={{ fill: colors.slate400, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            domain={[15, 60]}
            width={35}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Orange threshold line */}
          <ReferenceLine
            y={45}
            stroke={colors.threshold}
            strokeDasharray="6 4"
            strokeWidth={2}
            label={{
              value: "Thre",
              position: "right",
              fill: colors.threshold,
              fontSize: 11,
            }}
          />

          {/* Tract 105 - Blue area */}
          <Area
            type="monotone"
            dataKey="Tract 105"
            stroke={colors.primary}
            strokeWidth={2}
            fill="url(#colorTract105)"
            dot={{ fill: "#fff", strokeWidth: 2, r: 4, stroke: colors.primary }}
            activeDot={{
              r: 6,
              stroke: colors.primary,
              strokeWidth: 2,
              fill: "#fff",
            }}
          />

          {/* Tract 1100 - Green line only (no area fill) */}
          <Line
            type="monotone"
            dataKey="Tract 1100"
            stroke={colors.secondary}
            strokeWidth={2}
            dot={{
              fill: "#fff",
              strokeWidth: 2,
              r: 4,
              stroke: colors.secondary,
            }}
            activeDot={{
              r: 6,
              stroke: colors.secondary,
              strokeWidth: 2,
              fill: "#fff",
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default TimeSeriesComparison;
