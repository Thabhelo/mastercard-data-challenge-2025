import React, { useMemo } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { motion } from "framer-motion";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import WifiIcon from "@mui/icons-material/Wifi";
import BuildIcon from "@mui/icons-material/Build";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import HomeIcon from "@mui/icons-material/Home";

// Color palette
const colors = {
  primary: "#3b82f6",
  secondary: "#06b6d4",
  emerald: "#10b981",
  amber: "#f59e0b",
  slate800: "#1e293b",
  slate600: "#475569",
  slate400: "#94a3b8",
};

const pillarConfig = {
  digital_infrastructure: {
    title: "Digital Infrastructure",
    shortName: "Digital",
    icon: <WifiIcon sx={{ fontSize: 24 }} />,
    color: colors.primary,
    bgColor: "#eff6ff",
  },
  workforce_development: {
    title: "Workforce Development",
    shortName: "Workforce",
    icon: <BuildIcon sx={{ fontSize: 24 }} />,
    color: colors.secondary,
    bgColor: "#ecfeff",
  },
  entrepreneurship: {
    title: "Entrepreneurship",
    shortName: "Entrepreneurship",
    icon: <BusinessCenterIcon sx={{ fontSize: 24 }} />,
    color: colors.emerald,
    bgColor: "#dcfce7",
  },
  housing_transportation: {
    title: "Housing & Transportation",
    shortName: "Housing",
    icon: <HomeIcon sx={{ fontSize: 24 }} />,
    color: colors.amber,
    bgColor: "#fef3c7",
  },
};

function StrategyPillarsView({ pillars }) {
  const items = useMemo(() => {
    return Object.entries(pillars)
      .map(([key, pillar]) => {
        const config = pillarConfig[key];
        if (!config) return null;
        const realMetrics = Object.entries(pillar.metrics).filter(
          ([, val]) => val !== null && val !== undefined
        );
        if (realMetrics.length === 0) return null;
        return { key, pillar, config, realMetrics };
      })
      .filter(Boolean)
      .slice(0, 4);
  }, [pillars]);

  // Radar chart data for pillar performance
  const radarData = items.map(({ config, realMetrics }) => {
    const avgValue =
      realMetrics.reduce((sum, [, val]) => sum + Math.abs(val), 0) /
      realMetrics.length;
    return {
      pillar: config.shortName,
      current: Math.min(100, Math.max(0, 50 - avgValue)),
      target: 75,
      fullMark: 100,
    };
  });

  // Gap analysis bar chart data - sorted by gap descending
  const gapData = items
    .map(({ config, realMetrics }) => {
      const avgGap =
        realMetrics.reduce((sum, [, val]) => sum + Math.abs(val), 0) /
        realMetrics.length;
      return {
        name: config.shortName,
        gap: avgGap,
        color: config.color,
      };
    })
    .sort((a, b) => b.gap - a.gap);

  if (!items.length) return null;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Charts Section - Two cards side by side */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 3,
        }}
      >
        {/* Radar Chart */}
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{
            borderRadius: "16px",
            p: 4,
            background: "#ffffff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid #f1f5f9",
          }}
        >
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 700,
              color: colors.slate800,
              mb: 3,
              textAlign: "center",
            }}
          >
            Current vs Target Performance
          </Typography>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="pillar"
                tick={{ fill: colors.slate600, fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: colors.slate400, fontSize: 10 }}
                axisLine={false}
                tickCount={5}
              />
              <Radar
                name="Current"
                dataKey="current"
                stroke={colors.primary}
                fill={colors.primary}
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="Target"
                dataKey="target"
                stroke={colors.emerald}
                fill={colors.emerald}
                fillOpacity={0.1}
                strokeWidth={2}
                strokeDasharray="6 4"
              />
            </RadarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 4, mt: 2 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: colors.primary,
                }}
              />
              <Typography sx={{ fontSize: 13, color: colors.slate600 }}>
                Current
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: colors.emerald,
                }}
              />
              <Typography sx={{ fontSize: 13, color: colors.slate600 }}>
                Target
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Gap Analysis Bar Chart */}
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          sx={{
            borderRadius: "16px",
            p: 4,
            background: "#ffffff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid #f1f5f9",
          }}
        >
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 700,
              color: colors.slate800,
              mb: 3,
              textAlign: "center",
            }}
          >
            Gap Analysis by Category
          </Typography>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={gapData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                type="number"
                tick={{ fill: colors.slate400, fontSize: 11 }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
                domain={[0, 60]}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fill: colors.slate600, fontSize: 13 }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                formatter={(value) => [`${value.toFixed(1)} pts`, "Gap"]}
              />
              <Bar dataKey="gap" radius={[0, 6, 6, 0]} barSize={28}>
                {gapData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>
    </Box>
  );
}

export default StrategyPillarsView;
