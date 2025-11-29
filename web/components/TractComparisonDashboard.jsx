import { Box, Typography, Grid, Paper, useTheme, Avatar } from "@mui/material";
import TimeSeriesComparison from "./TimeSeriesComparison";
import StrategyPillarsView from "./StrategyPillarsView";
import InterventionRecommendations from "./InterventionRecommendations";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupIcon from "@mui/icons-material/Group";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import PredictionCard from "./PredictionCard";
import { motion } from "framer-motion";
import { palette } from "../utils/theme.jsx";
import RadarChart from "./RadarChart";
import BarChart from "./BarChart";

function TractComparisonDashboard({ data }) {
  const theme = useTheme();
  const { tract_105, tract_1100, strategic_pillars, time_series } = data;
  const igsGap = tract_1100.igs.latest - tract_105.igs.latest;

  // Compose quick stat array for the two tracts
  const statDefs = [
    {
      name: "IGS Score",
      key: "igs",
      color: theme.palette.primary.main,
      icon: <TrendingUpIcon />,
    },
    {
      name: "Growth",
      key: "growth",
      color: theme.palette.primary.main,
      icon: <TrendingUpIcon />,
    },
    {
      name: "Inclusion",
      key: "inclusion",
      color: theme.palette.primary.main,
      icon: <GroupIcon />,
    },
    {
      name: "Gini Coefficient",
      key: "gini_coefficient",
      color: theme.palette.primary.main,
      icon: <BusinessCenterIcon />,
    },
  ];

  const StatCard = ({ tract, label, color, icon }) => (
    <Paper
      // component={motion.div}
      // initial={{ opacity: 0, y: 20 }}
      // animate={{ opacity: 1, y: 0 }}
      // transition={{ duration: 0.5 }}
      // elevation={4}
      sx={{
        py: 4,
        px: 5,
        minWidth: 220,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        background: "#202124",
        borderRadius: "10px",
        border: `0.05px solid #888383a9`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <Avatar
          sx={{
            bgcolor: color,
            width: 35,
            height: 35,
            boxShadow: theme.shadows[4],
          }}
        >
          {icon}
        </Avatar>
        <Box sx={{ ml: 1 }}>
          <Typography variant="h6" fontWeight={600} color={color}>
            {label}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          mt: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        {statDefs.map((stat) =>
          tract[stat.key]?.latest !== undefined &&
          tract[stat.key]?.latest !== null ? (
            <Box
              key={stat.name}
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 0.7,
              }}
            >
              <Typography
                variant="body1"
                fontWeight={500}
                color={"#ffffff"}
                sx={{ minWidth: 92 }}
              >
                {stat.name}:
              </Typography>
              <Typography
                variant="body1"
                fontWeight={700}
                color={color}
                sx={{ fontSize: 20 }}
              >
                {tract[stat.key]?.latest}
              </Typography>
            </Box>
          ) : null
        )}
      </Box>
    </Paper>
  );

  return (
    <Box
      sx={{ maxWidth: 1440, mx: "auto", mb: 7, px: { xs: 2, sm: 3, md: 4 } }}
    >
      <Grid
        container
        spacing={17}
        justifyContent="center"
        alignItems="stretch"
        sx={{ mb: 4 }}
      >
        <Grid item xs={12} md={5} lg={4}>
          <StatCard
            tract={tract_105}
            label="Census Tract 105"
            color={palette.dark.tract2}
            icon={<GroupIcon />}
          />
        </Grid>
        <Grid
          item
          xs={12}
          md={2}
          lg={4}
          container
          direction="column"
          alignItems="center"
          justifyContent="center"
        >
          <Paper
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            elevation={0}
            sx={{
              boxShadow: "none",
              bgcolor: "transparent",
              mt: 5,
              mb: 7,
              textAlign: "center",
              // borderRadius: "20px",
            }}
          >
            <Typography
              variant="subtitle1"
              color={theme.palette.text.secondary}
              fontWeight={500}
              gutterBottom
            >
              Gap:{" "}
              <strong
                style={{ color: theme.palette.primary.main, fontSize: 24 }}
              >
                {igsGap.toFixed(1)}
              </strong>{" "}
              pts
            </Typography>
            <Typography variant="body2" color={theme.palette.text.secondary}>
              Inclusive Growth Score difference
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5} lg={4}>
          <StatCard
            tract={tract_1100}
            label="Census Tract 1100"
            color={palette.dark.tract1}
            icon={<GroupIcon />}
          />
        </Grid>
      </Grid>
      <Box sx={{ mt: 6, mb: 6 }}>
        <TimeSeriesComparison data={time_series} />
      </Box>
      <div style={{ fontSize: 30, fontWeight: 700, marginTop: "100px" }}>
        Radar Analysis
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          mb: 8,
        }}
      >
        <RadarChart />
      </div>
      <BarChart />
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h2"
          sx={{ mb: 3, mt: 10, fontWeight: 700, fontSize: "1.7rem" }}
        >
          Strategic Intervention Pillars
        </Typography>
        <StrategyPillarsView pillars={strategic_pillars} />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h2"
          sx={{ mb: 2, fontWeight: 700, fontSize: "2.0rem" }}
        >
          Recommended Interventions
        </Typography>
        <InterventionRecommendations
          pillars={strategic_pillars}
          tract105={tract_105}
          tract1100={tract_1100}
        />
      </Box>

      {/* Projection Cards: Status Quo vs What-If (side by side) */}
      <div style={{ fontSize: 30, fontWeight: 700, marginTop: 50 }}>
        Projects Based on Suggested Interventions
      </div>
      <Box sx={{ mb: 16 }}>
        <Grid container spacing={10}>
          <Grid item xs={12} md={6} sx={{ display: "flex" }}>
            <PredictionCard
              tractId={tract_105.fips || "1121010500"}
              tractName={tract_105.name || "Census Tract 105"}
              mode="baseline"
              yearsAhead={5}
              title="5-Year IGS Projection (Status Quo)"
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: "flex" }}>
            <PredictionCard
              tractId={tract_105.fips || "1121010500"}
              tractName={tract_105.name || "Census Tract 105"}
              mode="whatif"
              yearsAhead={5}
              title="5-Year IGS Projection (What‑If Interventions)"
              simulate={true}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default TractComparisonDashboard;
