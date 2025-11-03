import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, ToggleButton, ToggleButtonGroup, useTheme, Paper } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Area, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS } from '../config';

const interventionOptions = [
  { key: 'digital', label: 'Digital' },
  { key: 'housing', label: 'Housing' },
  { key: 'entrepreneurship', label: 'Entrepreneurship' },
  { key: 'workforce', label: 'Workforce' },
];

function fetchPrediction(tractId, interventions) {
  return fetch(API_ENDPOINTS.predict, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tract: tractId, interventions })
  })
    .then(res => res.json())
    .then(data => data.predictions);
}

function PredictionCard({ tractId, tractName }) {
  const theme = useTheme();
  const [active, setActive] = useState([]);
  const [pred, setPred] = useState([null, null, null, null, null]);
  const [years, setYears] = useState([1,2,3,4,5]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetch(API_ENDPOINTS.predict, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tract: tractId, interventions: active })
    })
    .then(res => res.json())
    .then(data => {
      setPred(data.predictions || []);
      setYears(data.years || [1,2,3,4,5]);
      setLoading(false);
    });
  }, [tractId, JSON.stringify(active)]);
  const chartData = pred.map((y, idx) => ({ year: `+${years[idx]}`, value: y }));
  const chartColor = theme.palette.primary.main;

  return (
    <Paper component={motion.div} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
      sx={{ borderRadius: 5, p: 4, maxWidth: 560, mx: 'auto', background: theme.palette.background.paper, boxShadow: theme.palette.mode === 'dark' ? '0 6px 32px #031a' : '0 1.5px 12px #2354', mt: 6 }}>
      <Typography
        variant="h3"
        fontWeight={700}
        align="center"
        sx={{ mb: 2 }}
      >
        5-Year IGS Projection Using a Ridge Regression Machine Learning Model
      </Typography>
      <Typography color="text.secondary" fontWeight={500} mb={2} sx={{ fontSize: 17 }}>
        {tractName || ''}
      </Typography>
      <ToggleButtonGroup value={active} onChange={(e, v) => setActive(v)} size="small" color="primary" sx={{ mb: 2 }}>
        {interventionOptions.map(opt => (
          <ToggleButton key={opt.key} value={opt.key} sx={{ fontWeight: 700, letterSpacing: 0.03, mx: 0.5, borderRadius: 99, px: 2, py: 0.5 }}>{opt.label}</ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Box sx={{ my: 1.5, width: '100%', height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 24, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="futureArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.45}/>
                <stop offset="100%" stopColor={theme.palette.background.paper} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 4" stroke={theme.palette.divider} opacity={0.27}/>
            <XAxis dataKey="year" stroke={theme.palette.text.secondary} fontSize={13}/>
            <YAxis stroke={theme.palette.text.secondary} fontSize={13} width={34} domain={['auto','auto']}/>
            <Tooltip contentStyle={{ background: theme.palette.background.paper+'e6', borderRadius: 12, color: theme.palette.text.primary }}
              labelStyle={{ color: chartColor }} active={loading ? false : undefined} />
            <ReferenceLine x="+1" stroke={theme.palette.text.secondary} strokeDasharray="1 2" label={{ value: 'Today', position: 'insideTopLeft', fill: theme.palette.text.secondary, fontSize: 12, opacity: .7  }} />
            <Area dataKey="value" stroke={chartColor} fill="url(#futureArea)" strokeWidth={3.25} dot={false} isAnimationActive={true} />
            <Line dataKey="value" stroke={chartColor} strokeWidth={3.1} dot={{ r: 4 }} isAnimationActive={true} />
            <Legend verticalAlign="top" height={20} wrapperStyle={{ fontSize: 15 }} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 1 }}>
        {!loading && pred.length && years.length && pred.map((pv, idx) => (
          <Paper elevation={1} key={idx} sx={{ px: 2.2, py: 1, borderRadius: 3, background: theme.palette.mode==='dark' ? '#223c4e' : '#f7faff', minWidth: 62 }}>
            <Typography variant="subtitle2" color={theme.palette.text.secondary} fontWeight={600} sx={{ fontSize: 13, textAlign: 'center' }}>{`Year +${years[idx]}`}</Typography>
            <Typography variant="h5" fontWeight={800} sx={{ color: chartColor, textAlign: 'center', fontVariantNumeric: 'tabular-nums', mt: 0.2 }}>
              {pv != null ? pv.toFixed(1) : '-'}</Typography>
          </Paper>
        ))}
      </Box>
      <Box sx={{ mt: 2, mb: 1.5, textAlign: 'center', minHeight: 40 }}>
        <AnimatePresence>
          {!loading && pred[4] && (
            <motion.span key={active.join(',')+pred[4]}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: .44 }}
              style={{ fontWeight: 800, fontSize: 28, color: chartColor, letterSpacing: 0.01 }}>
              {pred[4].toFixed(1)}
            </motion.span>
          )}
        </AnimatePresence>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 400, fontSize: 14, opacity: .83, mt: 1 }}>
          Projected IGS after 5 years | Scenario: {active.length ? active.join(", ") : 'Current trend'}
        </Typography>
      </Box>
    </Paper>
  );
}

export default PredictionCard;
