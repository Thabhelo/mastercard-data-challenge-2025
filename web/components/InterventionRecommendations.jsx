import React from 'react';
import { Box, Typography, Chip, Paper, List, ListItem, ListItemIcon, ListItemText, Stack, useTheme, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import WifiIcon from '@mui/icons-material/Wifi';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import ApartmentIcon from '@mui/icons-material/Apartment';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

const recConfig = {
  digital_infrastructure: {
    icon: <WifiIcon fontSize="large" sx={{ color: '#00d9ff' }} />, color: '#00d9ff'
  },
  entrepreneurship: {
    icon: <BusinessCenterIcon fontSize="large" sx={{ color: '#ec4899' }} />, color: '#ec4899'
  },
  housing_transportation: {
    icon: <ApartmentIcon fontSize="large" sx={{ color: '#f59e0b' }} />, color: '#f59e0b'
  },
  workforce_development: {
    icon: <GroupWorkIcon fontSize="large" sx={{ color: '#8b5cf6' }} />, color: '#8b5cf6'
  }
};

const gridVariants = {
  visible: { transition: { staggerChildren: 0.13 } }
};
const cardVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.52, type: 'spring', bounce: 0.29 } }
};

function RecChip({ label, color }) {
  return <Chip label={label} sx={{ bgcolor: color+'22', color: color, fontWeight: 700, fontSize: 14, px: 1.6, py: 0.6, borderRadius: 99, mr: 1.3 }} />;
}

function InterventionRecommendations({ pillars }) {
  const theme = useTheme();
  const recommendations = [
    {
      pillar: 'digital_infrastructure',
      title: 'Expand Broadband Access',
      priority: 'HIGH',
      gap: pillars.digital_infrastructure.metrics['Internet Access Score'],
      actions: [
        'Partner with ISPs to deploy last-mile fiber infrastructure',
        'Publicize Affordable Connectivity Program through local hubs',
        'Establish digital literacy training',
        'Launch device lending for households'
      ],
      impact: 'Could improve IGS by 8-12 pts',
      timeline: '12-18 months',
      cost: '$$'
    },
    {
      pillar: 'entrepreneurship',
      title: 'Support Small Business Creation',
      priority: 'HIGH',
      gap: pillars.entrepreneurship.metrics['Minority/Women Owned Businesses Score'],
      actions: [
        'Micro-loans and grants for startups',
        'Business incubator and mentoring',
        'Business planning and accounting help',
        'Procurement set-asides for local small business'
      ],
      impact: 'Could improve IGS by 5-8 pts, 15-20 new businesses',
      timeline: '9-12 months',
      cost: '$$'
    },
    {
      pillar: 'housing_transportation',
      title: 'Improve Housing Affordability',
      priority: 'HIGH',
      gap: pillars.housing_transportation.metrics['Affordable Housing Score'],
      actions: [
        'Leverage housing tax credits',
        'Renovate vacant properties',
        'Rent-to-own programs',
        'Develop public transit links to jobs'
      ],
      impact: 'Could improve IGS by 6-10 pts, reduce burden',
      timeline: '18-24 months',
      cost: '$$$'
    },
    {
      pillar: 'workforce_development',
      title: 'Sector-Aligned Training Programs',
      priority: 'MEDIUM',
      gap: pillars.workforce_development.metrics['Labor Market Engagement Index Score'],
      actions: [
        'Launch apprenticeships',
        'GED and adult ed expansion',
        'Provide child care for trainees',
        'Employer-partnered curriculum'
      ],
      impact: 'Could improve IGS by 4-7 pts',
      timeline: '12-15 months',
      cost: '$$'
    }
  ];
  const filtered = recommendations.filter(r => typeof r.gap === 'number' && Math.abs(r.gap) > 5);

  return (
    <Box component={motion.div} initial="hidden" animate="visible" variants={gridVariants}
      sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4,1fr)' }, gap: 4, width: '100%' }}>
      {filtered.map((rec, i) => {
        const recTheme = recConfig[rec.pillar];
        const showGap = typeof rec.gap === 'number';
        return (
          <Paper
            component={motion.div} variants={cardVariants}
            elevation={5} key={rec.title}
            sx={{
              borderRadius: 4,
              py: 3, px: 3,
              background: theme.palette.background.paper,
              boxShadow: theme.palette.mode === 'dark' ? '0 8px 26px #022e' : '0 2px 12px #bcbcbcff',
              minWidth: 215,
              display: 'flex', flexDirection: 'column',
              gap: 1.3,
              position: 'relative', overflow: 'visible', mb: 2
            }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.8 }}>
              <Avatar sx={{ bgcolor: recTheme.color+'22', color: recTheme.color, width: 44, height: 44, boxShadow: theme.shadows[4], mr: 0.6 }}>{recTheme.icon}</Avatar>
              <Typography variant="h3" fontWeight={700} fontSize={18} sx={{ flex: 1 }}>{rec.title}</Typography>
              <RecChip label={rec.priority} color={recTheme.color} />
            </Box>
            {showGap && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mt: 0.5, mb: 0.6 }}>
                <Typography color={recTheme.color} fontWeight={600} fontSize={16}>Gap:</Typography>
                <motion.span
                  initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.47, type: 'spring', bounce: 0.18 }}
                  style={{ color: recTheme.color, fontWeight: 700, fontSize: 20 }}>
                  {rec.gap.toFixed(1)} pts
                </motion.span>
              </Box>
            )}
            <List sx={{ pl: 1, pb: 1, pt: 0.3 }}>
              {rec.actions.map((action, idx) => (
                <ListItem disableGutters key={action} component={motion.li} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.23 + idx*0.08 }}>
                  <ListItemIcon>
                    <CheckCircleRoundedIcon sx={{ color: recTheme.color, fontSize: 23 }} />
                  </ListItemIcon>
                  <ListItemText primary={action} primaryTypographyProps={{ fontSize: 15, color: theme.palette.text.secondary, fontWeight: 500 }} />
                </ListItem>
              ))}
            </List>
            <Stack direction="row" spacing={2} sx={{ mt: 1.6, flexWrap: 'wrap' }}>
              <RecChip label={rec.impact} color={recTheme.color} />
              <RecChip label={rec.timeline} color={theme.palette.secondary.main} />
              <RecChip label={rec.cost} color={theme.palette.chartBlue || theme.palette.primary.main} />
            </Stack>
          </Paper>
        );
      })}
    </Box>
  );
}
export default InterventionRecommendations;

