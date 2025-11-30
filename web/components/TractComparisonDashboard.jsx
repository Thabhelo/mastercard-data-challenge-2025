import React from "react";
import { Box, Typography, Grid, Paper, useTheme } from "@mui/material";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import TimeSeriesComparison from "./TimeSeriesComparison";
import StrategyPillarsView from "./StrategyPillarsView";
import InterventionRecommendations from "./InterventionRecommendations";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupIcon from "@mui/icons-material/Group";
import PredictionCard from "./PredictionCard";
import { motion } from "framer-motion";

// Color palette
const colors = {
  primary: "#3b82f6",
  secondary: "#10b981",
  emerald: "#10b981",
  amber: "#f59e0b",
  slate800: "#1e293b",
  slate600: "#64748b",
  slate400: "#94a3b8",
  slate50: "#f8fafc",
};

// Circular IGS Gauge Component
const IGSGauge = ({ value, size = 80 }) => {
  const percentage = Math.min(100, Math.max(0, value));
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Box sx={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.slate600}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: 24,
            fontWeight: 700,
            color: colors.slate800,
            lineHeight: 1,
          }}
        >
          {Math.round(value)}
        </Typography>
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 500,
            color: colors.slate400,
            textTransform: "uppercase",
          }}
        >
          IGS
        </Typography>
      </Box>
    </Box>
  );
};

// Metric Row Component
const MetricRow = ({ label, value, showTrend = false, trendUp = true }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      py: 1,
      borderBottom: "1px solid #f1f5f9",
      "&:last-child": { borderBottom: "none" },
    }}
  >
    <Typography sx={{ fontSize: 14, color: colors.slate600, fontWeight: 500 }}>
      {label}
    </Typography>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Typography
        sx={{ fontSize: 14, fontWeight: 600, color: colors.slate800 }}
      >
        {typeof value === "number" ? Math.round(value) : value}
      </Typography>
      {showTrend && (
        <TrendingUpIcon
          sx={{
            fontSize: 16,
            color: trendUp ? colors.emerald : "#ef4444",
            transform: trendUp ? "none" : "rotate(180deg)",
          }}
        />
      )}
    </Box>
  </Box>
);

function TractComparisonDashboard({ data }) {
  const theme = useTheme();
  const { tract_105, tract_1100, strategic_pillars, time_series } = data;
  const igsGap = tract_1100.igs.latest - tract_105.igs.latest;

  // Radar chart data for multi-dimensional comparison
  const radarData = [
    {
      dimension: "IGS Score",
      tract105: tract_105.igs?.latest || 0,
      tract1100: tract_1100.igs?.latest || 0,
      fullMark: 100,
    },
    {
      dimension: "Growth",
      tract105: tract_105.growth?.latest || 0,
      tract1100: tract_1100.growth?.latest || 0,
      fullMark: 100,
    },
    {
      dimension: "Inclusion",
      tract105: tract_105.inclusion?.latest || 0,
      tract1100: tract_1100.inclusion?.latest || 0,
      fullMark: 100,
    },
    {
      dimension: "Employment",
      tract105: Math.min(
        100,
        (1 - (tract_105.gini_coefficient?.latest || 0.5)) * 100
      ),
      tract1100: Math.min(
        100,
        (1 - (tract_1100.gini_coefficient?.latest || 0.5)) * 100
      ),
      fullMark: 100,
    },
    {
      dimension: "Housing",
      tract105:
        strategic_pillars?.housing_transportation?.metrics?.[
          "Affordable Housing Score"
        ] || 30,
      tract1100: 65,
      fullMark: 100,
    },
    {
      dimension: "Digital Access",
      tract105:
        strategic_pillars?.digital_infrastructure?.metrics?.[
          "Internet Access Score"
        ] || 25,
      tract1100: 70,
      fullMark: 100,
    },
  ];

  // Tract Card Component - matching the screenshot design
  const TractCard = ({ tract, label, subtitle, isHigher }) => (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        borderRadius: "16px",
        p: 3,
        background: "#ffffff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        border: "1px solid #f1f5f9",
        height: "100%",
        minWidth: 320,
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            backgroundColor: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <GroupIcon sx={{ fontSize: 20, color: colors.primary }} />
        </Box>
        <Box>
          <Typography
            sx={{ fontSize: 16, fontWeight: 600, color: colors.slate800 }}
          >
            {label}
          </Typography>
          <Typography sx={{ fontSize: 13, color: colors.slate400 }}>
            {subtitle}
          </Typography>
        </Box>
      </Box>

      {/* Content - IGS Gauge and Metrics */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
        {/* IGS Gauge */}
        <IGSGauge value={tract.igs?.latest || 0} size={90} />

        {/* Metrics */}
        <Box sx={{ flex: 1, minWidth: 150 }}>
          <MetricRow
            label="Growth"
            value={tract.growth?.latest}
            showTrend
            trendUp={true}
          />
          <MetricRow
            label="Inclusion"
            value={tract.inclusion?.latest}
            showTrend={false}
          />
        </Box>
      </Box>
    </Paper>
  );

  // Gap Indicator Component
  const GapIndicator = () => (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      sx={{
        borderRadius: "16px",
        p: 3,
        background: "#fffbeb",
        border: "1px solid #fef3c7",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: 120,
        minHeight: 140,
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 600,
          color: colors.amber,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          mb: 0.5,
        }}
      >
        GAP
      </Typography>
      <Typography
        sx={{
          fontSize: 36,
          fontWeight: 700,
          color: colors.amber,
          lineHeight: 1,
        }}
      >
        {Math.abs(igsGap).toFixed(1)}
      </Typography>
      <Typography sx={{ fontSize: 12, color: "#b45309", mt: 0.5 }}>
        points
      </Typography>
      {/* Arrow indicator */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
        <Box
          sx={{
            width: 24,
            height: 2,
            backgroundColor: "#fcd34d",
            borderRadius: 1,
          }}
        />
        <Box
          sx={{
            width: 0,
            height: 0,
            borderTop: "4px solid transparent",
            borderBottom: "4px solid transparent",
            borderLeft: "6px solid #fcd34d",
          }}
        />
        <Box
          sx={{
            width: 24,
            height: 2,
            backgroundColor: "#fcd34d",
            borderRadius: 1,
          }}
        />
      </Box>
    </Paper>
  );

  return (
    <Box
      sx={{
        maxWidth: 1400,
        mx: "auto",
        mb: 7,
        px: { xs: 2, sm: 4, md: 6 },
        py: 2,
      }}
    >
      {/* Tract Comparison Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "stretch",
          gap: { xs: 2, md: 4 },
          mb: 4,
          flexWrap: { xs: "wrap", md: "nowrap" },
        }}
      >
        {/* Tract 105 Card */}
        <Box sx={{ flex: "1 1 400px", maxWidth: 500 }}>
          <TractCard
            tract={tract_105}
            label="Census Tract 105"
            subtitle="Lower Income Region"
          />
        </Box>

        {/* Gap Indicator */}
        <Box sx={{ flex: "0 0 auto", display: "flex", alignItems: "center" }}>
          <GapIndicator />
        </Box>

        {/* Tract 1100 Card */}
        <Box sx={{ flex: "1 1 400px", maxWidth: 500 }}>
          <TractCard
            tract={tract_1100}
            label="Census Tract 1100"
            subtitle="Higher Income Region"
          />
        </Box>
      </Box>

      {/* Radar Chart Section */}
      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        sx={{
          borderRadius: "16px",
          p: 4,
          mb: 4,
          background: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          border: "1px solid #f1f5f9",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box>
            <Typography
              sx={{ fontSize: 18, fontWeight: 700, color: colors.slate800 }}
            >
              Multi-Dimensional Comparison
            </Typography>
            <Typography sx={{ fontSize: 13, color: colors.slate400 }}>
              Tract performance across key indicators
            </Typography>
          </Box>
          {/* Legend */}
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: colors.primary,
                }}
              />
              <Typography sx={{ fontSize: 13, color: colors.slate600 }}>
                Tract 105
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: colors.secondary,
                }}
              />
              <Typography sx={{ fontSize: 13, color: colors.slate600 }}>
                Tract 1100
              </Typography>
            </Box>
          </Box>
        </Box>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: colors.slate600, fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: colors.slate400, fontSize: 10 }}
              axisLine={false}
            />
            <Radar
              name="Tract 105"
              dataKey="tract105"
              stroke={colors.primary}
              fill={colors.primary}
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Radar
              name="Tract 1100"
              dataKey="tract1100"
              stroke={colors.secondary}
              fill={colors.secondary}
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Time Series Section */}
      <Box sx={{ mt: 5, mb: 5 }}>
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{ fontSize: 18, fontWeight: 700, color: colors.slate800 }}
          >
            IGS Trends (2017-2024)
          </Typography>
          <Typography sx={{ fontSize: 13, color: colors.slate400 }}>
            Historical performance comparison
          </Typography>
        </Box>
        <TimeSeriesComparison data={time_series} />
      </Box>

      {/* Projection Cards */}
      <Box sx={{ mt: 5, mb: 5 }}>
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{ fontSize: 18, fontWeight: 700, color: colors.slate800 }}
          >
            5-Year IGS Projections
          </Typography>
          <Typography sx={{ fontSize: 13, color: colors.slate400 }}>
            Predicted outcomes with and without intervention
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: { xs: 3, md: 5 },
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "center",
          }}
        >
          <Box sx={{ flex: 1, maxWidth: 550 }}>
            <PredictionCard
              tractId={tract_105.fips || "1121010500"}
              tractName={tract_105.name || "Census Tract 105"}
              mode="baseline"
              yearsAhead={5}
              title="Status Quo Projection"
            />
          </Box>
          <Box sx={{ flex: 1, maxWidth: 550 }}>
            <PredictionCard
              tractId={tract_105.fips || "1121010500"}
              tractName={tract_105.name || "Census Tract 105"}
              mode="whatif"
              yearsAhead={5}
              title="With Interventions"
              simulate={true}
            />
          </Box>
        </Box>
      </Box>

      {/* Strategic Pillars */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{ fontSize: 18, fontWeight: 700, color: colors.slate800 }}
          >
            Strategic Intervention Pillars
          </Typography>
          <Typography sx={{ fontSize: 13, color: colors.slate400 }}>
            Key areas for targeted investment
          </Typography>
        </Box>
        <StrategyPillarsView pillars={strategic_pillars} />
      </Box>

      {/* Recommended Interventions */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{ fontSize: 18, fontWeight: 700, color: colors.slate800 }}
          >
            Recommended Interventions
          </Typography>
          <Typography sx={{ fontSize: 13, color: colors.slate400 }}>
            Priority actions based on gap analysis
          </Typography>
        </Box>
        <InterventionRecommendations
          pillars={strategic_pillars}
          tract105={tract_105}
          tract1100={tract_1100}
        />
      </Box>
    </Box>
  );
}

export default TractComparisonDashboard;
