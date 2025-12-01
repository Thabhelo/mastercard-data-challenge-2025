import React, { useMemo } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import WifiIcon from "@mui/icons-material/Wifi";
import BuildIcon from "@mui/icons-material/Build";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import ApartmentIcon from "@mui/icons-material/Apartment";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import PaidIcon from "@mui/icons-material/Paid";
import { palette } from "../utils/theme.jsx";

// const unifiedAccent = "#1e40af";
const unifiedAccent = palette.dark.tract2;
const pillarConfig = {
  digital_infrastructure: {
    title: "Digital Infrastructure",
    icon: <WifiIcon fontSize="large" sx={{ color: unifiedAccent }} />,
    accent: unifiedAccent,
  },
  workforce_development: {
    title: "Workforce Development",
    icon: <BuildIcon fontSize="large" sx={{ color: unifiedAccent }} />,
    accent: unifiedAccent,
  },
  entrepreneurship: {
    title: "Entrepreneurship",
    icon: <BusinessCenterIcon fontSize="large" sx={{ color: unifiedAccent }} />,
    accent: unifiedAccent,
  },
  housing_transportation: {
    title: "Housing & Transportation",
    icon: <ApartmentIcon fontSize="large" sx={{ color: unifiedAccent }} />,
    accent: unifiedAccent,
  },
  health_wellbeing: {
    title: "Health & Wellbeing",
    icon: (
      <HealthAndSafetyIcon fontSize="large" sx={{ color: unifiedAccent }} />
    ),
    accent: unifiedAccent,
  },
  policy_income: {
    title: "Policy & Income",
    icon: <PaidIcon fontSize="large" sx={{ color: unifiedAccent }} />,
    accent: unifiedAccent,
  },
};

const variants = {
  card: {
    hidden: { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.54, type: "spring", bounce: 0.31 },
    },
  },
};

const GapBar = ({ value, color }) => (
  <motion.div
    initial={{ width: 0 }}
    animate={{ width: `${Math.min(Math.abs(value), 100)}%` }}
    transition={{ duration: 1.1, type: "spring", bounce: 0.1 }}
    style={{
      background: color,
      borderRadius: 14,
      height: 7,
      minWidth: 8,
      marginLeft: 5,
      marginRight: 8,
      display: "inline-block",
      verticalAlign: "middle",
    }}
  />
);

// Priority badges removed per request

function StrategyPillarsView({ pillars }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  
  const items = useMemo(() => {
    return Object.entries(pillars)
      .map(([key, pillar]) => {
        const config = pillarConfig[key];
        if (!config) return null;
        const realMetrics = Object.entries(pillar.metrics).filter(
          ([, val]) => val !== null && val !== undefined
        );
        if (realMetrics.length === 0) return null;
        const card = (
          <Box
            component={motion.div}
            key={key}
            variants={variants.card}
            sx={{
              background: isDark ? "#202124" : "#ffffff",
              borderRadius: "10px",
              p: 3,
              minHeight: 280,
              display: "flex",
              flexDirection: "column",
              gap: 1.7,
              border: isDark ? "0.05px solid #888383a9" : "1px solid #e0e0e0",
              boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 0.7,
              }}
            >
              {config.icon}
              <Typography
                variant="h3"
                fontWeight={700}
                fontSize={19}
                sx={{ ml: 0.7 }}
              >
                {config.title}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={500}
              sx={{ mb: 1 }}
            >
              {pillar.description}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.3 }}>
              {realMetrics.map(([name, gap]) => (
                <Box
                  key={name}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.3,
                    mt: 0.2,
                  }}
                >
                  <Typography
                    sx={{
                      color: isDark ? "#ddddddff" : "#333333",
                      fontWeight: 600,
                      fontSize: 14,
                      minWidth: 56,
                    }}
                  >
                    {name}
                  </Typography>
                  <GapBar value={gap} color={palette.dark.tract1} />
                  <motion.span
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.53, type: "spring", bounce: 0.39 }}
                    style={{
                      fontWeight: 700,
                      color: gap > 0 ? "white" : "#ef4444",
                      fontSize: 15,
                      letterSpacing: "0.013em",
                    }}
                  >
                    {gap > 0 ? "+" : ""}
                    {gap.toFixed(1)}
                  </motion.span>
                </Box>
              ))}
            </Box>
          </Box>
        );
        return { key, card };
      })
      .filter(Boolean)
      .slice(0, 4);
  }, [pillars, isDark]);

  if (!items.length) return null;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
        gap: 7.5,
        width: "100%",
      }}
    >
      {items.map(({ key, card }) => (
        <Box key={key}>{card}</Box>
      ))}
    </Box>
  );
}

export default StrategyPillarsView;
