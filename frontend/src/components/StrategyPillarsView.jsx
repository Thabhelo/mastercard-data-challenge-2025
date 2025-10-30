import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import WifiIcon from '@mui/icons-material/Wifi';
import BuildIcon from '@mui/icons-material/Build';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import ApartmentIcon from '@mui/icons-material/Apartment';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import PaidIcon from '@mui/icons-material/Paid';

const pillarConfig = {
  digital_infrastructure: {
    title: 'Digital Infrastructure',
    icon: <WifiIcon fontSize="large" sx={{ color: '#00d9ff' }} />,
    accent: '#00d9ff',
  },
  workforce_development: {
    title: 'Workforce Development',
    icon: <BuildIcon fontSize="large" sx={{ color: '#8b5cf6' }} />,
    accent: '#8b5cf6'
  },
  entrepreneurship: {
    title: 'Entrepreneurship',
    icon: <BusinessCenterIcon fontSize="large" sx={{ color: '#ec4899' }} />,
    accent: '#ec4899',
  },
  housing_transportation: {
    title: 'Housing & Transportation',
    icon: <ApartmentIcon fontSize="large" sx={{ color: '#f59e0b' }} />,
    accent: '#f59e0b',
  },
  health_wellbeing: {
    title: 'Health & Wellbeing',
    icon: <HealthAndSafetyIcon fontSize="large" sx={{ color: '#10b981' }} />,
    accent: '#10b981',
  },
  policy_income: {
    title: 'Policy & Income',
    icon: <PaidIcon fontSize="large" sx={{ color: '#6366f1' }} />,
    accent: '#6366f1',
  }
};

const variants = {
  grid: { visible: { transition: { staggerChildren: 0.13 } } },
  card: {
    hidden: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.54, type: 'spring', bounce: 0.31 } }
  }
};

const GapBar = ({ value, color }) => (
  <motion.div
    initial={{ width: 0 }}
    animate={{ width: `${Math.min(Math.abs(value), 100)}%` }}
    transition={{ duration: 1.1, type: 'spring', bounce: 0.1 }}
    style={{
      background: color,
      borderRadius: 14,
      height: 7,
      minWidth: 8,
      marginLeft: 5,
      marginRight: 8,
      display: 'inline-block',
      verticalAlign: 'middle'
    }}
  />
);

function PriorityChip({ priority, color }) {
  return (
    <motion.div initial={{ scale: 0.77, opacity: 0 }} animate={{ scale: 1, opacity: 0.93 }} transition={{ delay: 0.23 }}>
      <Chip label={`${priority.toUpperCase()} PRIORITY`} sx={{
        bgcolor: priority === 'high' ? '#292039' : priority === 'medium' ? '#292042' : '#232a33',
        color: color,
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: 0.03,
        px: 1.6,
        py: 0.5,
        borderRadius: 99
      }} />
    </motion.div>
  );
}

function StrategyPillarsView({ pillars }) {
  // Priority logic
  const calculatePriorityLevel = (metrics) => {
    const gaps = Object.values(metrics).filter(v => v !== null);
    if (gaps.length === 0) return 'low';
    const avgGap = Math.abs(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    if (avgGap >= 30) return 'high';
    if (avgGap >= 15) return 'medium';
    return 'low';
  };

  return (
    <Box component={motion.div} initial="hidden" animate="visible" variants={variants.grid}
      sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 4, width: '100%' }}>
      {Object.entries(pillars).map(([key, pillar], idx) => {
        const config = pillarConfig[key];
        if (!config) return null;
        const priority = calculatePriorityLevel(pillar.metrics);
        const realMetrics = Object.entries(pillar.metrics).filter(([, val]) => val !== null && val !== undefined);
        if (realMetrics.length === 0) return null;
        return (
          <Box
            component={motion.div} key={key}
            variants={variants.card}
            sx={{
              background: t => t.palette.background.paper,
              borderRadius: 4,
              boxShadow: t => t.palette.mode === 'dark' ? '0 6px 22px #000A, 0 1.5px 7px #1113' : '0 2px 8px #2e355811',
              p: 3,
              position: 'relative',
              minWidth: 230,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.7,
              overflow: 'visible',
            }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.7 }}>
              <span style={{
                background: config.accent,
                borderRadius: '50%',
                padding: 7,
                boxShadow: `0 0 30px 3px ${config.accent}22` }}>
                {config.icon}
              </span>
              <Typography variant="h3" fontWeight={700} fontSize={19} sx={{ ml: 0.7 }}>{config.title}</Typography>
              <PriorityChip priority={priority} color={config.accent} />
            </Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
              {pillar.description}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.3 }}>
              {realMetrics.map(([name, gap]) => (
                <Box key={name} sx={{
                  display: 'flex', alignItems: 'center', gap: 1.3, mt: 0.2
                }}>
                  <Typography sx={{ color: config.accent, fontWeight: 600, fontSize: 16, minWidth: 56 }}>{name} </Typography>
                  <GapBar value={gap} color={config.accent} />
                  <motion.span
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.53, type: 'spring', bounce: 0.39 }}
                    style={{ fontWeight: 700, color: gap > 0 ? config.accent : '#ef4444', fontSize: 15, letterSpacing: '0.013em' }}>
                    {gap > 0 ? '+' : ''}{gap.toFixed(1)}
                  </motion.span>
                </Box>
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export default StrategyPillarsView;

