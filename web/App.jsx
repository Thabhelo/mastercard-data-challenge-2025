import React, { useMemo, useState } from "react";
import { ThemeProvider, createTheme, styled } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TractComparisonDashboard from "./components/TractComparisonDashboard";
import InterventionSimulator from "./components/InterventionSimulator";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";

// Modern SaaS color palette
const colors = {
  primary: "#3b82f6",
  secondary: "#06b6d4",
  emerald: "#10b981",
  amber: "#f59e0b",
  slate800: "#1e293b",
  slate600: "#475569",
  slate50: "#f8fafc",
};

const dashboardTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    primary: { main: colors.primary },
    secondary: { main: colors.secondary },
    error: { main: "#ef4444" },
    success: { main: colors.emerald },
    warning: { main: colors.amber },
    text: {
      primary: colors.slate800,
      secondary: colors.slate600,
    },
    divider: "#e2e8f0",
  },
  typography: {
    fontFamily: [
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "sans-serif",
    ].join(","),
    h1: { fontWeight: 800, fontSize: "2.5rem", letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, fontSize: "2rem", letterSpacing: "-0.01em" },
    h3: { fontWeight: 600, fontSize: "1.25rem", letterSpacing: 0 },
    body1: { fontSize: "1rem" },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

const Root = styled("div")(() => ({
  background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
  color: colors.slate800,
  position: "relative",
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
}));

const Header = styled("header")(() => ({
  minHeight: 140,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "3rem 0 3.5rem 0",
  borderRadius: "0 0 40px 40px",
  marginBottom: 24,
  background: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
  boxShadow: "0 4px 30px rgba(0,0,0,0.05)",
  position: "relative",
  overflow: "hidden",
  borderBottom: "1px solid #e2e8f0",
}));

const HeaderAccent = styled("div")(() => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 4,
  background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.emerald} 100%)`,
}));

const Footer = styled(Paper)(() => ({
  marginTop: "auto",
  width: "100%",
  background: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
  color: colors.slate600,
  borderRadius: "40px 40px 0 0",
  boxShadow: "0 -4px 30px rgba(0,0,0,0.03)",
  padding: "1.5rem 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "row",
  gap: 24,
  fontSize: "1rem",
  fontWeight: 500,
  borderTop: "1px solid #e2e8f0",
}));

const StyledTabs = styled(Tabs)(() => ({
  marginBottom: 32,
  "& .MuiTabs-indicator": {
    backgroundColor: colors.primary,
    height: 3,
    borderRadius: 3,
  },
}));

const StyledTab = styled(Tab)(() => ({
  textTransform: "none",
  fontWeight: 600,
  fontSize: "1rem",
  color: colors.slate600,
  "&.Mui-selected": {
    color: colors.primary,
  },
}));

function App() {
  const [comparisonData, setComparisonData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [isDark, setIsDark] = useState(false); // Light mode default
  const [activeTab, setActiveTab] = useState(0); // 0 = Dashboard, 1 = Intervention Simulator

  const theme = useMemo(
    () => dashboardTheme(isDark ? "dark" : "light"),
    [isDark]
  );

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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={dashboardTheme}>
      <CssBaseline />
      <Root>
        <Header>
          <HeaderAccent />
          <Typography
            variant="h1"
            component="div"
            sx={{
              mb: 1.5,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              fontSize: { xs: "1.8rem", sm: "2.3rem", md: "2.8rem" },
              color: colors.slate800,
              textAlign: "center",
            }}
          >
            County Inequality Data Dashboard
          </Typography>
          <Box
            sx={{
              width: 80,
              height: 4,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              mb: 2,
            }}
          />
          <Typography
            sx={{
              fontWeight: 500,
              color: colors.slate600,
              fontSize: { xs: "1rem", sm: "1.15rem" },
              textAlign: "center",
            }}
          >
            Data-driven Insights for Economic Inclusion
          </Typography>

          {/* Tab Navigation */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "1rem",
                  color: theme.palette.text.secondary,
                  "&.Mui-selected": {
                    color: "#10b981",
                    fontWeight: 600,
                  },
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#10b981",
                  height: 3,
                  borderRadius: 2,
                },
              }}
            >
              <Tab label="Dashboard" />
              <Tab label="Intervention Simulator" />
            </Tabs>
          </Box>
        </Header>

        {/* Navigation Tabs */}
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <StyledTabs value={tabValue} onChange={handleTabChange}>
            <StyledTab label="Dashboard" />
            <StyledTab label="Intervention Simulator" />
          </StyledTabs>
        </Box>

        <main>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 12 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  border: `4px solid ${colors.slate50}`,
                  borderTopColor: colors.primary,
                  animation: "spin 1s linear infinite",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: "center", mt: 10 }}>
              <Typography
                sx={{ color: "#ef4444", fontWeight: 700, fontSize: 20, mb: 1 }}
              >
                Error loading data
              </Typography>
              <Typography sx={{ color: colors.slate600 }}>{error}</Typography>
            </Box>
          ) : (
            <>
              {activeTab === 0 && (
                <TractComparisonDashboard data={comparisonData} />
              )}
              {activeTab === 1 && <InterventionSimulator />}
            </>
          )}
        </main>
      </Root>
    </ThemeProvider>
  );
}

export default App;
