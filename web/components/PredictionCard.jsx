import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  Paper,
} from "@mui/material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
  Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { API_ENDPOINTS } from "../config";

const interventionOptions = [
  { key: "digital", label: "Digital" },
  { key: "housing", label: "Housing" },
  { key: "entrepreneurship", label: "Entrepreneurship" },
  { key: "workforce", label: "Workforce" },
];

function fetchPrediction(tractId, interventions) {
  return fetch(API_ENDPOINTS.predict, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tract: tractId, interventions }),
  })
    .then((res) => res.json())
    .then((data) => data.predictions);
}

function PredictionCard({
  tractId,
  tractName,
  mode = "whatif",
  yearsAhead = 5,
  title,
  simulate = false,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [active, setActive] = useState([]);
  const [pred, setPred] = useState([null, null, null, null, null]);
  const [baseline, setBaseline] = useState([null, null, null, null, null]);
  const [years, setYears] = useState([1, 2, 3, 4, 5]);
  const [loading, setLoading] = useState(true);
  const [staticData, setStaticData] = useState(null);

  // Load static data once for robustness
  useEffect(() => {
    fetch("/data/predictions_105.json")
      .then((res) => res.json())
      .then((data) => setStaticData(data))
      .catch((err) => console.log("No static data found"));
  }, []);

  // Load baseline (no interventions) when tract changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // If it's tract 105 and we have static data, use it
    if (tractId === "1121010500" && staticData) {
      setBaseline(staticData.baseline || []);
      setYears(staticData.years || [1, 2, 3, 4, 5]);
      setLoading(false);
      return;
    }

    fetch(API_ENDPOINTS.predict, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tract: tractId,
        interventions: [],
        years_ahead: yearsAhead,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        setBaseline(data.predictions || []);
        setYears(data.years || [1, 2, 3, 4, 5]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch baseline:", err);
        if (isMounted) {
          // Fallback for demo if API is offline
          const fallback = [23.0, 23.1, 23.2, 23.3, 23.4];
          setBaseline(fallback);
          setYears([1, 2, 3, 4, 5]);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [tractId, yearsAhead, staticData]);

  // Load current scenario when interventions change
  useEffect(() => {
    if (mode !== "whatif") {
      // In baseline mode, mirror baseline as pred for rendering simplicity
      setPred(baseline);
      return;
    }
    if (simulate) {
      // If we have static model data for Tract 105, use the "all interventions" scenario
      if (tractId === "1121010500" && staticData) {
        const allKey = "digital,entrepreneurship,housing,workforce";
        if (staticData.scenarios[allKey]) {
          setPred(staticData.scenarios[allKey]);
          return;
        }
      }

      // Fallback: Generate a simple uplift path over baseline for presentation purposes
      // Slightly stronger than before: (+0.15, +0.30, ... per year) with bounds [0, 100]
      const sim = (baseline || []).map((b, i) => {
        if (typeof b !== "number") return null;
        const uplift = 1.5 * (i + 1); // Increasing uplift
        const val = Math.min(100, Math.max(0, b + uplift));
        return Number(val.toFixed(2));
      });
      setPred(sim);
      return;
    }
    setLoading(true);

    // If it's tract 105 and we have static data, use it
    if (tractId === "1121010500" && staticData) {
      const key = active.sort().join(",");
      const preds = staticData.scenarios[key] || staticData.baseline;
      setPred(preds);
      setYears(staticData.years || [1, 2, 3, 4, 5]);
      setLoading(false);
      return;
    }

    fetch(API_ENDPOINTS.predict, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tract: tractId,
        interventions: active,
        years_ahead: yearsAhead,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setPred(data.predictions || []);
        setYears(data.years || [1, 2, 3, 4, 5]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch prediction:", err);
        // Fallback logic could go here if needed
        setLoading(false);
      });
  }, [
    tractId,
    JSON.stringify(active),
    mode,
    yearsAhead,
    JSON.stringify(baseline),
    staticData,
  ]);
  const chartData = pred.map((y, idx) => ({
    year: `+${years[idx]}`,
    value:
      mode === "whatif"
        ? y
        : baseline && baseline[idx] != null
        ? baseline[idx]
        : y,
    baseline:
      mode === "whatif"
        ? baseline && baseline[idx] != null
          ? baseline[idx]
          : null
        : null,
  }));
  const chartColor = theme.palette.primary.main;
  const subtle = theme.palette.mode === "dark" ? "#93a3b540" : "#93a3b54a";
  const baselineStroke = theme.palette.mode === "dark" ? "#93a3b5" : "#6b7280";

  const deltaAt = (i) => {
    if (pred[i] == null || baseline[i] == null) return null;
    const d = Number((pred[i] - baseline[i]).toFixed(2));
    return d === 0 ? 0 : d;
  };

  // Compute a tight y-domain based on baseline and scenario with small padding
  const yDomain = React.useMemo(() => {
    const values = [];
    pred.forEach((v) => {
      if (typeof v === "number") values.push(v);
    });
    baseline.forEach((v) => {
      if (typeof v === "number") values.push(v);
    });
    if (values.length === 0) return ["auto", "auto"];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = Math.max(1, (max - min) * 0.08); // at least 1 pt padding
    return [
      Math.max(0, Math.floor((min - pad) * 10) / 10),
      Math.min(100, Math.ceil((max + pad) * 10) / 10),
    ];
  }, [JSON.stringify(pred), JSON.stringify(baseline)]);

  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{
        borderRadius: "20px",
        p: 4,
        width: "100%",
        background: isDark ? "#1a1a2e" : "#ffffff",
        border: isDark ? "0.05px solid #888383a9" : "1px solid #e0e0e0",
        boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.08)",
        mt: 2,
        minHeight: 420,
      }}
    >
      <Typography variant="h3" fontWeight={700} align="center" sx={{ mb: 2 }}>
        {title ||
          (mode === "whatif"
            ? "5-Year IGS Projection (With our suggested interventions)"
            : "5-Year IGS Projection (Status Quo)")}
      </Typography>
      <Typography
        color="text.secondary"
        fontWeight={500}
        mb={2}
        sx={{ fontSize: 17 }}
      >
        {tractName || ""}
      </Typography>
      {mode === "whatif" && !simulate && (
        <ToggleButtonGroup
          value={active}
          onChange={(e, v) => setActive(v)}
          size="small"
          color="primary"
          sx={{ mb: 2 }}
        >
          {interventionOptions.map((opt) => (
            <ToggleButton
              key={opt.key}
              value={opt.key}
              sx={{
                fontWeight: 700,
                letterSpacing: 0.03,
                mx: 0.5,
                borderRadius: 99,
                px: 2,
                py: 0.5,
              }}
            >
              {opt.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      )}
      <Box sx={{ my: 1.5, width: "100%", height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 12, right: 24, left: 0, bottom: 8 }}
          >
            <defs>
              <linearGradient id="futureArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.45} />
                <stop
                  offset="100%"
                  stopColor={theme.palette.background.paper}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 4"
              stroke={theme.palette.divider}
              opacity={0.27}
            />
            <XAxis
              dataKey="year"
              stroke={theme.palette.text.secondary}
              fontSize={13}
            />
            <YAxis
              stroke={theme.palette.text.secondary}
              fontSize={13}
              width={34}
              domain={yDomain}
            />
            <Tooltip
              contentStyle={{
                background: theme.palette.background.paper + "e6",
                borderRadius: 12,
                color: theme.palette.text.primary,
              }}
              labelStyle={{ color: chartColor }}
              active={loading ? false : undefined}
            />
            <ReferenceLine
              x="+1"
              stroke={theme.palette.text.secondary}
              strokeDasharray="1 2"
              label={{
                value: "Today",
                position: "insideTopLeft",
                fill: theme.palette.text.secondary,
                fontSize: 12,
                opacity: 0.7,
              }}
            />
            {/* Baseline (no interventions) */}
            {mode === "whatif" && (
              <Line
                type="monotone"
                dataKey="baseline"
                stroke={baselineStroke}
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
                name="Baseline"
              />
            )}
            <Area
              dataKey="value"
              stroke={chartColor}
              fill="url(#futureArea)"
              strokeWidth={3.25}
              dot={false}
              isAnimationActive={true}
            />
            <Line
              dataKey="value"
              stroke={chartColor}
              strokeWidth={3.1}
              dot={{ r: 4 }}
              isAnimationActive={true}
            />
            <Legend
              verticalAlign="top"
              height={20}
              wrapperStyle={{ fontSize: 14 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "center",
          flexWrap: "wrap",
          mb: 1,
        }}
      >
        {!loading &&
          pred.length &&
          years.length &&
          pred.map((pv, idx) => (
            <Paper
              elevation={1}
              key={idx}
              sx={{
                px: 2.2,
                py: 1.1,
                borderRadius: 3,
                background:
                  theme.palette.mode === "dark" ? "#223c4e" : "#f7faff",
                minWidth: 70,
              }}
            >
              <Typography
                variant="subtitle2"
                color={theme.palette.text.secondary}
                fontWeight={600}
                sx={{ fontSize: 13, textAlign: "center" }}
              >{`Year +${years[idx]}`}</Typography>
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{
                  color: chartColor,
                  textAlign: "center",
                  fontVariantNumeric: "tabular-nums",
                  mt: 0.2,
                }}
              >
                {pv != null ? pv.toFixed(1) : "-"}
              </Typography>
              {mode === "whatif" && deltaAt(idx) !== null && (
                <Box
                  sx={{ display: "flex", justifyContent: "center", mt: 0.4 }}
                >
                  <Chip
                    size="small"
                    label={`${deltaAt(idx) >= 0 ? "+" : ""}${deltaAt(idx)}`}
                    sx={{
                      height: 20,
                      fontSize: 12,
                      color:
                        deltaAt(idx) >= 0
                          ? theme.palette.success.main
                          : theme.palette.error.main,
                      background: subtle,
                      borderRadius: 1.5,
                    }}
                  />
                </Box>
              )}
            </Paper>
          ))}
      </Box>
      <Box sx={{ mt: 2, mb: 1.5, textAlign: "center", minHeight: 40 }}>
        <AnimatePresence>
          {!loading && pred[4] && (
            <motion.span
              key={active.join(",") + pred[4]}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.44 }}
              style={{
                fontWeight: 800,
                fontSize: 28,
                color: chartColor,
                letterSpacing: 0.01,
              }}
            >
              {pred[4].toFixed(1)}
            </motion.span>
          )}
        </AnimatePresence>
        {/* Minimalist delta summary at year +5 */}
        {mode === "whatif" && !loading && deltaAt(4) !== null && (
          <Chip
            size="small"
            label={`${deltaAt(4) >= 0 ? "▲" : "▼"} ${Math.abs(
              deltaAt(4)
            ).toFixed(2)} vs baseline`}
            sx={{
              ml: 1,
              height: 24,
              fontSize: 12,
              color:
                deltaAt(4) >= 0
                  ? theme.palette.success.main
                  : theme.palette.error.main,
              background: subtle,
            }}
          />
        )}
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 400,
            fontSize: 14,
            opacity: 0.83,
            mt: 1,
          }}
        >
          Projected IGS after 5 years
          {mode === "whatif"
            ? ` | Scenario: ${
                active.length ? active.join(", ") : "Current trend"
              }`
            : ""}
        </Typography>
      </Box>
    </Paper>
  );
}

export default PredictionCard;
