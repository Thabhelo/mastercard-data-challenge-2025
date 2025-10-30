import React from 'react';
import { Box, Typography, Grid, Paper, useTheme, Avatar } from '@mui/material';
import TimeSeriesComparison from './TimeSeriesComparison';
import StrategyPillarsView from './StrategyPillarsView';
import InterventionRecommendations from './InterventionRecommendations';
import WifiIcon from '@mui/icons-material/Wifi';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';

const cardIcons = [<TrendingUpIcon fontSize="large" />, <GroupIcon fontSize="large" />, <BusinessCenterIcon fontSize="large" />, <WifiIcon fontSize="large" />];

function TractComparisonDashboard({ data }) {
  const theme = useTheme();
  const { tract_105, tract_1100, strategic_pillars, time_series } = data;
  const igsGap = tract_1100.igs.latest - tract_105.igs.latest;

  // Compose quick stat array for the two tracts
  const statDefs = [
    {
      name: 'IGS Score',
      key: 'igs',
      color: theme.palette.primary.main,
      icon: <TrendingUpIcon />
    },
    {
      name: 'Growth',
      key: 'growth',
      color: theme.palette.secondary.main,
      icon: <TrendingUpIcon />
    },
    {
      name: 'Inclusion',
      key: 'inclusion',
      color: theme.palette.chartBlue || theme.palette.primary.main,
      icon: <GroupIcon />
    },
    {
      name: 'Gini Coefficient',
      key: 'gini_coefficient',
      color: theme.palette.chartPurple || theme.palette.secondary.main,
      icon: <BusinessCenterIcon />
    }
  ];

  const StatCard = ({ tract, label, color, icon }) => (
    <Paper elevation={4} sx={{
      borderRadius: 4,
      p: 3,
      minWidth: 220,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      background: theme.palette.background.paper,
      boxShadow: theme.palette.mode === 'dark' ? theme.shadows[8] : theme.shadows[2],
      mb: 1
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Avatar sx={{ bgcolor: color, width: 44, height: 44, boxShadow: theme.shadows[4] }}>{icon}</Avatar>
        <Box sx={{ ml: 1 }}>
          <Typography variant="h6" fontWeight={600}>{label}</Typography>
        </Box>
      </Box>
      <Box sx={{ mt: 1 }}>
        {statDefs.map(stat =>
          tract[stat.key]?.latest !== undefined && tract[stat.key]?.latest !== null ? (
            <Box key={stat.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.7 }}>
              <Typography variant="body1" fontWeight={500} color={stat.color} sx={{ minWidth: 92 }}>{stat.name}:</Typography>
              <Typography variant="body1" fontWeight={700} color={theme.palette.text.primary} sx={{ fontSize: 24 }}>{tract[stat.key]?.latest}</Typography>
            </Box>
          ) : null
        )}
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', mb: 7, px: { xs: 2, sm: 3, md: 4 } }}>
      <Grid container spacing={4} justifyContent="center" alignItems="stretch" sx={{ mb: 4 }}>
        <Grid item xs={12} md={5} lg={4}>
          <StatCard tract={tract_105} label="Census Tract 105" color={theme.palette.primary.main} icon={<GroupIcon />} />
        </Grid>
        <Grid item xs={12} md={2} lg={4} container direction="column" alignItems="center" justifyContent="center">
          <Paper elevation={0} sx={{ boxShadow: 'none', bgcolor: 'transparent', mt: 5, mb: 7, textAlign: 'center' }}>
            <Typography variant="subtitle1" color={theme.palette.text.secondary} fontWeight={500} gutterBottom>
              Gap: <strong style={{ color: theme.palette.primary.main, fontSize: 24 }}>{igsGap.toFixed(1)}</strong> pts
            </Typography>
            <Typography variant="body2" color={theme.palette.text.secondary}>Inclusive Growth Score difference</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5} lg={4}>
          <StatCard tract={tract_1100} label="Census Tract 1100" color={theme.palette.secondary.main} icon={<GroupIcon />} />
        </Grid>
      </Grid>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h2" sx={{ mb: 2, fontWeight: 700, fontSize: '2.0rem' }}>IGS Trends (2017-2024)</Typography>
        <TimeSeriesComparison data={time_series} />
      </Box>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h2" sx={{ mb: 2, fontWeight: 700, fontSize: '2.0rem' }}>Strategic Intervention Pillars</Typography>
        <StrategyPillarsView pillars={strategic_pillars} />
      </Box>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h2" sx={{ mb: 2, fontWeight: 700, fontSize: '2.0rem' }}>Recommended Interventions</Typography>
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

