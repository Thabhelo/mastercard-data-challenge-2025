import React, { useMemo, useState } from 'react';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import TractComparisonDashboard from './components/TractComparisonDashboard';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';

const palette = {
  dark: {
    background: '#0f0f1e',
    paper: '#1a1a2e',
    accent: '#00d9ff',
    accent2: '#8b5cf6',
    accent3: '#ec4899',
    text: '#ffffff',
    textSecondary: '#94a3b8',
    border: '#1e293b',
    divider: '#334155',
    shadow: '0 4px 32px rgba(0,0,0,0.55)',
    chartBlue: '#3b82f6',
    chartPurple: '#a855f7'
  },
  light: {
    background: '#f2f2f2',
    paper: '#ffffff',
    accent: '#1e40af',
    accent2: '#8b5cf6',
    accent3: '#ea4eaa',
    text: '#181b1b',
    textSecondary: '#697181',
    border: '#eaeaea',
    divider: '#dde3e9',
    shadow: '0 2px 16px 0 rgba(20,60,140,0.11)',
    chartBlue: '#1d4ed8',
    chartPurple: '#b376fa'
  }
};

const dashboardTheme = mode => createTheme({
  palette: {
    mode,
    background: {
      default: palette[mode].background,
      paper: palette[mode].paper
    },
    primary: { main: palette[mode].accent },
    secondary: { main: palette[mode].accent2 },
    error: { main: '#ef4444' },
    text: {
      primary: palette[mode].text,
      secondary: palette[mode].textSecondary
    },
    divider: palette[mode].divider
  },
  typography: {
    fontFamily: ['Inter', 'Roboto', 'Arial', 'sans-serif'].join(','),
    h1: { fontWeight: 500, fontSize: '2.5rem', letterSpacing: 0 },
    h2: { fontWeight: 500, fontSize: '2rem', letterSpacing: 0 },
    h3: { fontWeight: 500, fontSize: '1.25rem', letterSpacing: 0 },
    body1: { fontSize: '1.05rem' }
  },
  shape: { borderRadius: 20 }
});

const Root = styled('div')(({ theme }) => ({
  background: theme.palette.background.default,
  color: theme.palette.text.primary,
  position: 'relative',
  display: 'flex', flexDirection: 'column',
  minHeight: '100vh'
}));

const Header = styled('header')(({ theme }) => ({
  minHeight: 120,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '2.7rem 0 3.3rem 0',
  borderRadius: `0 0 44px 44px`,
  marginBottom: 36,
  boxShadow: theme.palette.mode === 'dark' ? palette.dark.shadow : palette.light.shadow,
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(100deg, #212046 55%, #131a35 90%)'
    : 'linear-gradient(97deg, #f7f8fa 75%, #dee8ef 100%)',
  position: 'relative',
  overflow: 'visible',
}));

const HeaderGlow = styled('div')(({ theme }) => ({
  position: 'absolute',
  left: '50%',
  top: '50%',
  width: 520,
  height: 170,
  transform: 'translate(-50%,-50%)',
  borderRadius: 220,
  background: theme.palette.mode === 'dark'
    ? 'radial-gradient(circle, #8b5cf6aa 0%, rgba(0,217,255,0.33) 55%, transparent 80%)'
    : 'radial-gradient(circle, #6366f122 50%, #f2eaff55 90%, transparent 100%)',
  opacity: 0.31,
  filter: 'blur(16px)',
  zIndex: 0
}));

// Dark theme removed; light-only UI

const Footer = styled(Paper)(({ theme }) => ({
  marginTop: 'auto',
  width: '100%',
  background: theme.palette.background.paper,
  color: theme.palette.text.secondary,
  borderRadius: '36px 36px 0 0',
  boxShadow: theme.palette.mode === 'dark' ? '0 -3px 19px #0007, 0 0.5px 6px #1113' : '0 -2px 12px #b5b5bf13',
  padding: '1.3rem 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  gap: 22,
  fontSize: '1.13rem',
  fontWeight: 500,
  position: 'relative'
}));

const Divider = styled('div')(({ theme }) => ({
  width: '88%',
  height: 2,
  background: theme.palette.divider,
  opacity: 0.13,
  borderRadius: 8,
  margin: '0.1rem auto 1.25rem auto'
}));

function App() {
  const theme = useMemo(() => dashboardTheme('light'), []);
  const [comparisonData, setComparisonData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const comparisonResponse = await fetch('/data/tract_comparison.json');
        const comparison = await comparisonResponse.json();
        setComparisonData(comparison);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Root>
        {/* Theme toggle removed (light-only) */}
        <Header>
          <HeaderGlow />
          <Typography variant="h1" component="div" sx={{
            mb: 2.2, fontWeight: 800, letterSpacing: '-.025em',
            fontSize: { xs: '2.05rem', sm: '2.7rem', md: '3.12rem' },
            position: 'relative', zIndex: 1,
            color: theme.palette.text.primary,
            textAlign: 'center',
          }}>
            County Inequality Data Dashboard
            <Box sx={{
              width: 94,
              height: 4,
              borderRadius: 5.5,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(90deg, #00d9ff 0%, #1e90ff 78%)'
                : 'linear-gradient(90deg, #1e40af 0%, #00d9ff 78%)',
              mx: 'auto', mt: 1.1,
              animation: 'header-acc-underline 2.5s ease-in-out infinite alternate',
              '@keyframes header-acc-underline': {
                '0%': { width: 82, opacity: 0.81 },
                '100%': { width: 106, opacity: 1 }
              },
            }} />
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 400, color: theme.palette.text.secondary, fontSize: { xs: '1.03rem', sm: '1.27rem' }, mb: 0.7, letterSpacing: 0.01, zIndex: 1, textAlign: 'center' }}>
            Data-driven Insights for Economic Inclusion
          </Typography>
        </Header>
        <main>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 12 }}>
              <div className="loading-spinner"></div>
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', mt: 10 }}>
              <h2 style={{ color: theme.palette.error.main }}>Error loading data</h2>
              <p>{error}</p>
            </Box>
          ) : (
            <TractComparisonDashboard data={comparisonData} />
          )}
        </main>
        <Divider />
        <Footer component={motion.footer} initial={{ opacity: 0, y: 38 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} elevation={8}>
          <span style={{ fontWeight: 700, color: theme.palette.text.primary }}>
            County Inequality Data Dashboard
          </span>
          <span style={{ fontWeight: 400, color: theme.palette.primary.main, margin: '0 14px 0 14px' }}>
            Mastercard Data Challenge 2025
          </span>
          <span style={{ fontSize: '1.01em', opacity: 0.79 }}>
            Built by Team Tornadoes |
            <svg style={{ height: 22, verticalAlign: 'middle', marginLeft: 7, marginRight: 2 }} fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke={theme.palette.primary.main} strokeWidth="2"/><path d="M15 19.5V17a2 2 0 0 0-2-2h-3a2 2 0 1 0 0 4h7" stroke={theme.palette.primary.main} strokeWidth="1.5"/><circle cx="12" cy="8" r="3.5" stroke={theme.palette.primary.main} strokeWidth="1.5"/></svg>
          </span>
        </Footer>
      </Root>
    </ThemeProvider>
  );
}

export default App;
