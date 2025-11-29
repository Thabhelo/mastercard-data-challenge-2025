import {
  Box,
  Typography,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  useTheme,
  Avatar,
} from "@mui/material";
import { motion } from "framer-motion";
import WifiIcon from "@mui/icons-material/Wifi";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import ApartmentIcon from "@mui/icons-material/Apartment";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { palette } from "../utils/theme.jsx";

const unifiedAccent = palette.dark.tract2;
const recConfig = {
  digital_infrastructure: {
    icon: <WifiIcon fontSize="large" sx={{ color: unifiedAccent }} />,
    color: unifiedAccent,
  },
  entrepreneurship: {
    icon: <BusinessCenterIcon fontSize="large" sx={{ color: unifiedAccent }} />,
    color: unifiedAccent,
  },
  housing_transportation: {
    icon: <ApartmentIcon fontSize="large" sx={{ color: unifiedAccent }} />,
    color: unifiedAccent,
  },
  workforce_development: {
    icon: <GroupWorkIcon fontSize="large" sx={{ color: unifiedAccent }} />,
    color: unifiedAccent,
  },
};

const gridVariants = {
  visible: { transition: { staggerChildren: 0.13 } },
};
const cardVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.52, type: "spring", bounce: 0.2 },
  },
};

function RecChip({ label, color }) {
  if (label.toLowerCase() === "high") {
    color = "#FF0000";
  } else if (label.toLowerCase() === "medium") {
    color = "#FFA500";
  } else if (label.toLowerCase() === "low") {
    color = "#008000";
  }
  return (
    <Chip
      label={label}
      sx={{
        bgcolor: color + "22",
        color: color,
        fontWeight: 700,
        fontSize: 14,
        px: 1.6,
        py: 0.6,
        borderRadius: 99,
        mr: 1.3,
      }}
    />
  );
}

function InterventionRecommendations({ pillars }) {
  const theme = useTheme();
  const recommendations = [
    {
      pillar: "digital_infrastructure",
      title: "Expand Broadband Access",
      priority: "HIGH",
      gap: pillars.digital_infrastructure.metrics["Internet Access Score"],
      actions: [
        "Partner with ISPs to deploy last-mile fiber infrastructure",
        "Publicize Affordable Connectivity Program through local hubs",
        "Establish digital literacy training",
        "Launch device lending for households",
      ],
      impact: "Could improve IGS by 8-12 pts",
      timeline: "12-18 months",
    },
    {
      pillar: "entrepreneurship",
      title: "Support Small Business Creation",
      priority: "HIGH",
      gap: pillars.entrepreneurship.metrics[
        "Minority/Women Owned Businesses Score"
      ],
      actions: [
        "Micro-loans and grants for startups",
        "Business incubator and mentoring",
        "Business planning and accounting help",
        "Procurement set-asides for local small business",
      ],
      impact: "Could improve IGS by 5-8 pts, 15-20 new businesses",
      timeline: "9-12 months",
    },
    {
      pillar: "housing_transportation",
      title: "Improve Housing Affordability",
      priority: "HIGH",
      gap: pillars.housing_transportation.metrics["Affordable Housing Score"],
      actions: [
        "Leverage housing tax credits",
        "Renovate vacant properties",
        "Rent-to-own programs",
        "Develop public transit links to jobs",
      ],
      impact: "Could improve IGS by 6-10 pts, reduce burden",
      timeline: "18-24 months",
    },
    {
      pillar: "workforce_development",
      title: "Sector-Aligned Training Programs",
      priority: "MEDIUM",
      gap: pillars.workforce_development.metrics[
        "Labor Market Engagement Index Score"
      ],
      actions: [
        "Launch apprenticeships",
        "GED and adult ed expansion",
        "Provide child care for trainees",
        "Employer-partnered curriculum",
      ],
      impact: "Could improve IGS by 4-7 pts",
      timeline: "12-15 months",
    },
  ];
  const filtered = recommendations.filter(
    (r) => typeof r.gap === "number" && Math.abs(r.gap) > 5
  );

  return (
    <Box
      component={motion.div}
      initial="hidden"
      animate="visible"
      variants={gridVariants}
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4,1fr)" },
        gap: 4,
        width: "100%",
        minHeight: 300,
      }}
    >
      {filtered.map((rec, i) => {
        const recTheme = recConfig[rec.pillar];
        const showGap = typeof rec.gap === "number";
        return (
          <Paper
            component={motion.div}
            variants={cardVariants}
            elevation={5}
            key={rec.title}
            sx={{
              borderRadius: "20px",
              py: 3,
              px: 1,
              // background: "black",
              background: "#202124",
              border: `0.05px solid #888383a9`,
              // boxShadow:
              //   theme.palette.mode === "dark"
              //     ? "0 8px 26px #022e"
              //     : "0 2px 12px #bcbcbcff",
              minWidth: 215,
              minHeight: 260,
              display: "flex",
              flexDirection: "column",
              gap: 1.3,
              position: "relative",
              overflow: "visible",
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 0.8,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: recTheme.color + "22",
                  color: recTheme.color,
                  width: 44,
                  height: 44,
                  boxShadow: theme.shadows[4],
                  mr: 0.6,
                }}
              >
                {recTheme.icon}
              </Avatar>
              <Typography
                variant="h3"
                fontWeight={600}
                fontSize={16}
                sx={{ flex: 1 }}
              >
                {rec.title}
              </Typography>
              <RecChip label={rec.priority} color={recTheme.color} />
            </Box>
            {showGap && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  mt: 0.5,
                  mb: 0.6,
                }}
              >
                <Typography
                  color={"white"}
                  fontWeight={600}
                  fontSize={16}
                  paddingLeft={1}
                >
                  Gap:
                </Typography>
                <motion.span
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.47, type: "spring", bounce: 0.18 }}
                  style={{
                    color: "orange",
                    fontWeight: 700,
                    fontSize: 20,
                  }}
                >
                  {rec.gap.toFixed(1)} pts
                </motion.span>
              </Box>
            )}
            <List
              sx={{
                pl: 1,
                pr: 1,
                display: "flex",
                flexDirection: "column",
                gap: 0.7,
              }}
            >
              {rec.actions.map((action, idx) => (
                <ListItem
                  disableGutters
                  sx={{
                    py: 0,
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "row",
                    gap: 0,
                  }}
                  key={action}
                  component={motion.li}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.23 + idx * 0.08 }}
                >
                  <ListItemIcon>
                    <CheckCircleRoundedIcon
                      sx={{ color: recTheme.color, fontSize: 23, minWidth: 0 }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={action}
                    primaryTypographyProps={{
                      fontSize: 15,
                      color: theme.palette.text.secondary,
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
              ))}
            </List>
            {/* <Stack
              direction="row"
              spacing={2}
              sx={{ mt: 1.6, flexWrap: "wrap" }}
            > */}
            <Box sx={{ mt: "auto" }}>
              <div
                style={{ border: "0.5px solid #888383a9", marginBottom: 10 }}
              ></div>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    color: "white",
                    display: "flex",
                    alignContent: "center",
                    // justifyContent: "flex-start",
                    fontSize: 14,
                    gap: 40,
                    paddingLeft: 6,
                  }}
                >
                  <div style={{ color: palette.dark.tract2 }}>Effect: </div>{" "}
                  {/* <RecChip label={rec.impact} color={recTheme.color} /> */}
                  <div style={{ color: "white", paddingRight: 4 }}>
                    {rec.impact}
                  </div>
                </div>{" "}
                <div
                  style={{
                    fontWeight: 600,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    fontSize: 14,
                    paddingLeft: 6,
                  }}
                >
                  <div style={{ color: palette.dark.tract2 }}>Timeline:</div>
                  <RecChip
                    label={rec.timeline}
                    color={theme.palette.secondary.main}
                  />
                </div>
              </div>
              {/* </Stack> */}
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}
export default InterventionRecommendations;
