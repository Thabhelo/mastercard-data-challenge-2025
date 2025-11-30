import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Slider,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import WifiIcon from "@mui/icons-material/Wifi";
import HomeIcon from "@mui/icons-material/Home";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

// Color palette
const colors = {
  primary: "#3b82f6",
  emerald: "#10b981",
  amber: "#f59e0b",
  slate800: "#1e293b",
  slate600: "#475569",
  slate400: "#94a3b8",
};

// Investment slider component
const InvestmentSlider = ({ icon, label, value, onChange, color }) => (
  <Paper
    sx={{
      borderRadius: "12px",
      p: 2.5,
      background: "#ffffff",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      border: "1px solid #f1f5f9",
      mb: 2,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "10px",
          backgroundColor: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography
          sx={{ fontSize: 14, fontWeight: 600, color: colors.slate800 }}
        >
          {label}
        </Typography>
        <Typography sx={{ fontSize: 12, color: colors.slate400 }}>
          Investment Level
        </Typography>
      </Box>
      <Box
        sx={{
          px: 1.5,
          py: 0.75,
          borderRadius: "8px",
          backgroundColor: `${color}10`,
          border: `1px solid ${color}30`,
        }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: color }}>
          {value}%
        </Typography>
      </Box>
    </Box>
    <Slider
      value={value}
      onChange={(e, newValue) => onChange(newValue)}
      min={0}
      max={100}
      sx={{
        color: color,
        height: 6,
        "& .MuiSlider-thumb": {
          width: 18,
          height: 18,
          backgroundColor: "#fff",
          border: `3px solid ${color}`,
          "&:hover, &.Mui-focusVisible": {
            boxShadow: `0 0 0 6px ${color}20`,
          },
        },
        "& .MuiSlider-track": {
          height: 6,
          borderRadius: 3,
        },
        "& .MuiSlider-rail": {
          height: 6,
          borderRadius: 3,
          backgroundColor: "#e2e8f0",
        },
      }}
    />
  </Paper>
);

// Summary card component
const SummaryCard = ({ title, value, subtitle, color, icon }) => (
  <Paper
    sx={{
      borderRadius: "12px",
      p: 2.5,
      background: "#ffffff",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      border: "1px solid #f1f5f9",
      textAlign: "center",
      flex: 1,
    }}
  >
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: "12px",
        backgroundColor: `${color}10`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: color,
        mx: "auto",
        mb: 1.5,
      }}
    >
      {icon}
    </Box>
    <Typography
      sx={{
        fontSize: 11,
        fontWeight: 600,
        color: colors.slate400,
        mb: 0.5,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {title}
    </Typography>
    <Typography
      sx={{ fontSize: 28, fontWeight: 700, color: color, lineHeight: 1 }}
    >
      {value}
    </Typography>
    <Typography sx={{ fontSize: 12, color: colors.slate400, mt: 0.5 }}>
      {subtitle}
    </Typography>
  </Paper>
);

function InterventionSimulator({
  tractId = "1121010500",
  tractName = "Census Tract 105",
}) {
  const [broadband, setBroadband] = useState(50);
  const [housing, setHousing] = useState(40);
  const [business, setBusiness] = useState(30);
  const [searchTract, setSearchTract] = useState(tractName);

  // Calculate projections based on investment levels
  const projectionData = useMemo(() => {
    const baselineStart = 23;
    const years = [2025, 2026, 2027, 2028, 2029];

    return years.map((year, index) => {
      const yearFactor = index + 1;

      // Baseline grows slowly (0.1 per year)
      const baselineValue = baselineStart + yearFactor * 0.1;

      // Intervention grows based on investment levels
      const broadbandEffect = (broadband / 100) * 0.8 * yearFactor;
      const housingEffect = (housing / 100) * 0.6 * yearFactor;
      const businessEffect = (business / 100) * 0.5 * yearFactor;

      const totalLift = broadbandEffect + housingEffect + businessEffect;
      const interventionValue = baselineStart + totalLift;

      return {
        year: year.toString(),
        baseline: Number(baselineValue.toFixed(2)),
        intervention: Number(Math.min(100, interventionValue).toFixed(2)),
      };
    });
  }, [broadband, housing, business]);

  // Calculate total budget estimate
  const totalBudget = useMemo(() => {
    const broadbandCost = broadband * 50000;
    const housingCost = housing * 75000;
    const businessCost = business * 25000;
    return (broadbandCost + housingCost + businessCost) / 1000000;
  }, [broadband, housing, business]);

  // Calculate 5-year lift
  const fiveYearLift = useMemo(() => {
    if (projectionData.length > 0) {
      const lastPoint = projectionData[projectionData.length - 1];
      return (lastPoint.intervention - lastPoint.baseline).toFixed(2);
    }
    return 0;
  }, [projectionData]);

  // Y-axis domain calculation
  const yDomain = useMemo(() => {
    const allValues = projectionData.flatMap((d) => [
      d.baseline,
      d.intervention,
    ]);
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    return [Math.floor(min - 5), Math.ceil(max + 10)];
  }, [projectionData]);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", py: 4, px: 2 }}>
      {/* Search Bar */}
      <Paper
        sx={{
          borderRadius: "50px",
          p: 0.5,
          mb: 4,
          background: "#ffffff",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          border: "1px solid #e2e8f0",
          maxWidth: 500,
          mx: "auto",
        }}
      >
        <TextField
          fullWidth
          value={searchTract}
          onChange={(e) => setSearchTract(e.target.value)}
          placeholder="Search census tract..."
          variant="standard"
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: colors.slate400, ml: 2 }} />
              </InputAdornment>
            ),
            sx: {
              px: 1,
              py: 1,
              fontSize: 15,
            },
          }}
        />
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "380px 1fr" },
          gap: 4,
        }}
      >
        {/* Left Column - Sliders */}
        <Box>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 700,
              color: colors.slate800,
              mb: 2.5,
            }}
          >
            Investment Controls
          </Typography>

          <InvestmentSlider
            icon={<WifiIcon sx={{ fontSize: 20 }} />}
            label="Broadband Investment"
            value={broadband}
            onChange={setBroadband}
            color={colors.primary}
          />

          <InvestmentSlider
            icon={<HomeIcon sx={{ fontSize: 20 }} />}
            label="Housing Investment"
            value={housing}
            onChange={setHousing}
            color={colors.amber}
          />

          <InvestmentSlider
            icon={<BusinessCenterIcon sx={{ fontSize: 20 }} />}
            label="Small Business Investment"
            value={business}
            onChange={setBusiness}
            color={colors.emerald}
          />

          {/* Summary Cards */}
          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <SummaryCard
              title="Total Budget"
              value={`$${totalBudget.toFixed(1)}M`}
              subtitle="Estimated investment"
              color={colors.primary}
              icon={<AccountBalanceWalletIcon sx={{ fontSize: 22 }} />}
            />
            <SummaryCard
              title="5-Year Lift"
              value={`+${fiveYearLift}`}
              subtitle="IGS points"
              color={colors.emerald}
              icon={<TrendingUpIcon sx={{ fontSize: 22 }} />}
            />
          </Box>
        </Box>

        {/* Right Column - Chart */}
        <Paper
          component={motion.div}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          sx={{
            borderRadius: "16px",
            p: 3,
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
              mb: 1,
              textAlign: "center",
            }}
          >
            Baseline vs Intervention Projection
          </Typography>

          {/* Legend */}
          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 4, mb: 2 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: colors.slate400,
                }}
              />
              <Typography sx={{ fontSize: 12, color: colors.slate600 }}>
                Baseline (Status Quo)
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
              <Typography sx={{ fontSize: 12, color: colors.slate600 }}>
                With Interventions
              </Typography>
            </Box>
          </Box>

          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart
              data={projectionData}
              margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient
                  id="colorIntervention"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={colors.emerald}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={colors.emerald}
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
                domain={yDomain}
                width={35}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />

              {/* Baseline line (dashed gray) */}
              <Line
                type="monotone"
                dataKey="baseline"
                name="Baseline (Status Quo)"
                stroke={colors.slate400}
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={{
                  fill: colors.slate400,
                  strokeWidth: 2,
                  r: 4,
                  stroke: "#fff",
                }}
              />

              {/* Intervention area + line (solid green with fill) */}
              <Area
                type="monotone"
                dataKey="intervention"
                name="With Interventions"
                stroke={colors.emerald}
                strokeWidth={2}
                fill="url(#colorIntervention)"
                dot={{
                  fill: colors.emerald,
                  strokeWidth: 2,
                  r: 4,
                  stroke: "#fff",
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>

          {/* Year-by-year values */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              mt: 2,
            }}
          >
            {projectionData.map((point, idx) => (
              <Box
                key={point.year}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: "10px",
                  backgroundColor: "#f1f5f9",
                  textAlign: "center",
                  minWidth: 70,
                }}
              >
                <Typography
                  sx={{ fontSize: 11, fontWeight: 500, color: colors.slate400 }}
                >
                  {point.year}
                </Typography>
                <Typography
                  sx={{ fontSize: 16, fontWeight: 700, color: colors.emerald }}
                >
                  {point.intervention.toFixed(1)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default InterventionSimulator;
