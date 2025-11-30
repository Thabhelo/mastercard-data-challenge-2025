import Paper from "@mui/material/Paper";
import { createTheme, styled } from "@mui/material/styles";

export const palette = {
  dark: {
    background: "#1b1b1f", //"#0f0f1e",
    paper: "#1a1a2e",
    accent: "#00d9ff",
    accent2: "#8b5cf6",
    accent3: "#ec4899",
    text: "#ffffff",
    textSecondary: "#94a3b8",
    border: "#1e293b",
    divider: "#334155",
    shadow: "0 4px 32px rgba(0,0,0,0.55)",
    chartBlue: "#3b82f6",
    chartPurple: "#ff7f0e",
    tract1: "#ff7f0e",
    tract2: "#1f77b4",
  },
  light: {
    background: "#f8f9fa",
    paper: "#ffffff",
    accent: "#1e40af",
    accent2: "#8b5cf6",
    accent3: "#ea4eaa",
    text: "#181b1b",
    textSecondary: "#697181",
    border: "#eaeaea",
    divider: "#dde3e9",
    shadow: "0 2px 16px 0 rgba(20,60,140,0.11)",
    chartBlue: "#1d4ed8",
    chartPurple: "#b376fa",
    tract1: "#ff7f0e",
    tract2: "#1f77b4",
  },
};

export const dashboardTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      background: {
        default: palette[mode].background,
        paper: palette[mode].paper,
      },
      primary: { main: palette[mode].accent },
      secondary: { main: palette[mode].accent2 },
      error: { main: "#ef4444" },
      text: {
        primary: palette[mode].text,
        secondary: palette[mode].textSecondary,
      },
      divider: palette[mode].divider,
    },
    typography: {
      fontFamily: ["Inter", "Roboto", "Arial", "sans-serif"].join(","),
      h1: { fontWeight: 500, fontSize: "2.5rem", letterSpacing: 0 },
      h2: { fontWeight: 500, fontSize: "2rem", letterSpacing: 0 },
      h3: { fontWeight: 500, fontSize: "1.25rem", letterSpacing: 0 },
      body1: { fontSize: "1.05rem" },
    },
    shape: { borderRadius: 20 },
  });

export const Root = styled("div")(({ theme }) => ({
  background: theme.palette.background.default,
  color: theme.palette.text.primary,
  position: "relative",
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
}));

export const Header = styled("header")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "2.7rem 0 2rem 0",
  marginBottom: 36,
  // boxShadow:
  //   theme.palette.mode === "dark" ? palette.dark.shadow : palette.light.shadow,
  position: "relative",
  overflow: "visible",
}));

// Dark theme removed; light-only UI

export const Footer = styled(Paper)(({ theme }) => ({
  marginTop: "auto",
  width: "100%",
  background: theme.palette.background.paper,
  color: theme.palette.text.secondary,
  borderRadius: "36px 36px 0 0",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 -3px 19px #0007, 0 0.5px 6px #1113"
      : "0 -2px 12px #b5b5bf13",
  padding: "1.3rem 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "row",
  gap: 22,
  fontSize: "1.13rem",
  fontWeight: 500,
  position: "relative",
}));

export const Divider = styled("div")(({ theme }) => ({
  width: "88%",
  height: 2,
  background: theme.palette.divider,
  opacity: 0.13,
  borderRadius: 8,
  margin: "0.1rem auto 1.25rem auto",
}));
