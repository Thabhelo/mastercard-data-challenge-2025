import React from "react";
import { Box, Typography, Paper, Chip } from "@mui/material";
import { motion } from "framer-motion";
import WifiIcon from "@mui/icons-material/Wifi";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import HomeIcon from "@mui/icons-material/Home";
import SchoolIcon from "@mui/icons-material/School";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

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

const recConfig = {
  digital_infrastructure: {
    icon: <WifiIcon sx={{ fontSize: 22 }} />,
    color: colors.primary,
    bgColor: "#eff6ff",
  },
  entrepreneurship: {
    icon: <BusinessCenterIcon sx={{ fontSize: 22 }} />,
    color: colors.emerald,
    bgColor: "#dcfce7",
  },
  housing_transportation: {
    icon: <HomeIcon sx={{ fontSize: 22 }} />,
    color: colors.amber,
    bgColor: "#fef3c7",
  },
  workforce_development: {
    icon: <SchoolIcon sx={{ fontSize: 22 }} />,
    color: colors.secondary,
    bgColor: "#cffafe",
  },
};

// Priority badge component
const PriorityBadge = ({ priority }) => {
  const isHigh = priority === "HIGH";
  return (
    <Chip
      label={priority}
      size="small"
      sx={{
        backgroundColor: isHigh ? "#dcfce7" : "#fef3c7",
        color: isHigh ? colors.emerald : "#b45309",
        fontSize: 11,
        fontWeight: 700,
        height: 24,
        borderRadius: "6px",
      }}
    />
  );
};

// Gap score display
const GapScore = ({ gap, color }) => (
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "baseline",
      gap: 0.5,
      px: 2,
      py: 1,
      borderRadius: "10px",
      backgroundColor: "#f8fafc",
      border: "1px solid #e2e8f0",
    }}
  >
    <Typography sx={{ fontSize: 13, color: colors.slate400 }}>
      Gap Score:
    </Typography>
    <Typography sx={{ fontSize: 22, fontWeight: 700, color: color }}>
      {gap?.toFixed(1)}
    </Typography>
    <Typography sx={{ fontSize: 12, color: colors.slate400 }}>pts</Typography>
  </Box>
);

// Action item component
const ActionItem = ({ text, color }) => (
  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 0.75 }}>
    <CheckCircleIcon
      sx={{ fontSize: 18, color: color, mt: 0.2, flexShrink: 0 }}
    />
    <Typography sx={{ fontSize: 13, color: colors.slate600, lineHeight: 1.5 }}>
      {text}
    </Typography>
  </Box>
);

// Impact estimate component
const ImpactEstimate = ({ impact, timeline }) => (
  <Box sx={{ mt: "auto", pt: 3 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
      <TrendingUpIcon sx={{ fontSize: 16, color: colors.emerald }} />
      <Typography sx={{ fontSize: 13, color: colors.emerald, fontWeight: 600 }}>
        {impact}
      </Typography>
    </Box>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <AccessTimeIcon sx={{ fontSize: 16, color: colors.slate400 }} />
      <Typography sx={{ fontSize: 13, color: colors.slate600 }}>
        Timeline: <strong>{timeline}</strong>
      </Typography>
    </Box>
  </Box>
);

function InterventionRecommendations({ pillars }) {
  const recommendations = [
    {
      pillar: "digital_infrastructure",
      title: "Expand Broadband Access",
      priority: "HIGH",
      gap: pillars.digital_infrastructure?.metrics?.["Internet Access Score"],
      actions: [
        "Partner with ISPs for last-mile fiber",
        "Publicize Affordable Connectivity Program",
        "Digital literacy training programs",
        "Device lending for households",
      ],
      impact: "Could improve IGS by 8-12 pts",
      timeline: "12-18 months",
    },
    {
      pillar: "entrepreneurship",
      title: "Support Small Business Creation",
      priority: "HIGH",
      gap: pillars.entrepreneurship?.metrics?.[
        "Minority/Women Owned Businesses Score"
      ],
      actions: [
        "Micro-loans and startup grants",
        "Business incubator programs",
        "Free business planning services",
        "Local procurement set-asides",
      ],
      impact: "Could improve IGS by 5-8 pts",
      timeline: "9-12 months",
    },
    {
      pillar: "housing_transportation",
      title: "Improve Housing Affordability",
      priority: "HIGH",
      gap: pillars.housing_transportation?.metrics?.[
        "Affordable Housing Score"
      ],
      actions: [
        "Housing tax credit programs",
        "Vacant property renovation",
        "Rent-to-own initiatives",
        "Transit links to job centers",
      ],
      impact: "Could improve IGS by 6-10 pts",
      timeline: "18-24 months",
    },
    {
      pillar: "workforce_development",
      title: "Sector-Aligned Training",
      priority: "MEDIUM",
      gap: pillars.workforce_development?.metrics?.[
        "Labor Market Engagement Index Score"
      ],
      actions: [
        "Apprenticeship programs",
        "GED and adult education",
        "Childcare for trainees",
        "Employer-partnered curriculum",
      ],
      impact: "Could improve IGS by 4-7 pts",
      timeline: "12-15 months",
    },
  ];

  const filtered = recommendations.filter(
    (r) => typeof r.gap === "number" && Math.abs(r.gap) > 5
  );

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)",
        },
        gap: 3,
        width: "100%",
      }}
    >
      {filtered.map((rec, i) => {
        const recTheme = recConfig[rec.pillar];
        return (
          <Paper
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={rec.title}
            sx={{
              borderRadius: "16px",
              p: 3,
              background: "#ffffff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              border: "1px solid #f1f5f9",
              display: "flex",
              flexDirection: "column",
              minHeight: 400,
            }}
          >
            {/* Header - Icon and Priority */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2.5,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  backgroundColor: recTheme.bgColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: recTheme.color,
                }}
              >
                {recTheme.icon}
              </Box>
              <PriorityBadge priority={rec.priority} />
            </Box>

            {/* Title */}
            <Typography
              sx={{
                fontSize: 17,
                fontWeight: 700,
                color: colors.slate800,
                mb: 2,
                lineHeight: 1.3,
              }}
            >
              {rec.title}
            </Typography>

            {/* Gap Score */}
            {typeof rec.gap === "number" && (
              <Box sx={{ mb: 2.5 }}>
                <GapScore gap={rec.gap} color={recTheme.color} />
              </Box>
            )}

            {/* Actions List */}
            <Box sx={{ mb: 2 }}>
              {rec.actions.map((action, idx) => (
                <ActionItem key={idx} text={action} color={recTheme.color} />
              ))}
            </Box>

            {/* Impact Estimate */}
            <ImpactEstimate impact={rec.impact} timeline={rec.timeline} />
          </Paper>
        );
      })}
    </Box>
  );
}

export default InterventionRecommendations;
