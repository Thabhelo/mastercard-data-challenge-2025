import React, { useMemo, useState } from "react";
import { ThemeProvider, createTheme, styled } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import TractComparisonDashboard from "./components/TractComparisonDashboard";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import ThemeToggle from "./components/ThemeToggle";
import {
  dashboardTheme,
  Header,
  Divider,
  Footer,
  Root,
} from "./utils/theme.jsx";

function App() {
  const [comparisonData, setComparisonData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [isDark, setIsDark] = useState(false); // Light mode default

  const theme = useMemo(() => dashboardTheme(isDark ? "dark" : "light"), [isDark]);

  const theme = useMemo(() => dashboardTheme("dark"), []);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const comparisonResponse = await fetch("/data/tract_comparison.json");
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
        {/* Theme Toggle */}
        <Box
          sx={{
            position: "fixed",
            top: 20,
            right: 24,
            zIndex: 1000,
          }}
        >
          <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
        </Box>

        <Header>
          <Typography
            variant="h1"
            component="div"
            sx={{
              mb: 1,
              fontWeight: 800,
              letterSpacing: "-.025em",
              fontSize: { xs: "2.05rem", sm: "2.7rem", md: "3.12rem" },
              position: "relative",
              zIndex: 1,
              color: theme.palette.text.primary,
              textAlign: "center",
            }}
          >
            County Inequality Data Dashboard
            <Box
              sx={{
                width: 800,
                height: 2.5,
                borderRadius: 10,
                background: "#ff7f0e",
                mx: "auto",
                mt: 1.1,
              }}
            />
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 400,
              color: theme.palette.text.secondary,
              fontSize: { xs: "1.03rem", sm: "1.27rem" },
              mb: 0.7,
              letterSpacing: 0.01,
              zIndex: 1,
              textAlign: "center",
            }}
          >
            Data-driven Insights for Economic Inclusion
          </Typography>
        </Header>
        <main>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 12 }}>
              <div className="loading-spinner"></div>
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: "center", mt: 10 }}>
              <h2 style={{ color: theme.palette.error.main }}>
                Error loading data
              </h2>
              <p>{error}</p>
            </Box>
          ) : (
            <TractComparisonDashboard data={comparisonData} />
          )}
        </main>
        <Divider />
        <Footer
          component={motion.footer}
          initial={{ opacity: 0, y: 38 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          elevation={8}
        >
          <span style={{ fontWeight: 700, color: theme.palette.text.primary }}>
            County Inequality Data Dashboard
          </span>
          <span
            style={{
              fontWeight: 400,
              color: theme.palette.primary.main,
              margin: "0 14px 0 14px",
            }}
          >
            Mastercard Data Challenge 2025
          </span>
          <span style={{ fontSize: "1.01em", opacity: 0.79 }}>
            Built by Team Tornadoes |
            <svg
              style={{
                height: 22,
                verticalAlign: "middle",
                marginLeft: 7,
                marginRight: 2,
              }}
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke={theme.palette.primary.main}
                strokeWidth="2"
              />
              <path
                d="M15 19.5V17a2 2 0 0 0-2-2h-3a2 2 0 1 0 0 4h7"
                stroke={theme.palette.primary.main}
                strokeWidth="1.5"
              />
              <circle
                cx="12"
                cy="8"
                r="3.5"
                stroke={theme.palette.primary.main}
                strokeWidth="1.5"
              />
            </svg>
          </span>
        </Footer>
      </Root>
    </ThemeProvider>
  );
}

export default App;
