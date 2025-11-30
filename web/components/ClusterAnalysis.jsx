import { useState, useEffect } from "react";
import { Box, Typography, Paper, Chip, useTheme } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { palette } from "../utils/theme";

function ClusterAnalysis() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [data, setData] = useState(null);
  const [hoveredTract, setHoveredTract] = useState(null);
  const [selectedTract, setSelectedTract] = useState(null);

  useEffect(() => {
    fetch("/data/cluster_analysis.json")
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) return null;

  const { tracts, focus_tracts, stats } = data;

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1, flexWrap: "wrap" }}>
        <Typography variant="h2" sx={{ fontWeight: 700, fontSize: "1.7rem" }}>
          Cluster Analysis from Unsupervised Learning
        </Typography>
        <Chip
          label="K-Means Clustering"
          size="small"
          sx={{
            bgcolor: palette.dark.tract2 + "22",
            color: palette.dark.tract2,
            fontWeight: 600,
            fontSize: 11,
          }}
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 900 }}>
        All {stats.total_tracts} census tracts visualized by IGS metrics. Bubble size represents IGS score 
        (larger = higher inclusion). <strong style={{ color: "#ef4444" }}>Red</strong> = Tract 105 (focus), 
        <strong style={{ color: "#10b981" }}> Green</strong> = Tract 1100 (benchmark). 
        Click any bubble to view details.
      </Typography>

      <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {/* Interactive Bubble Chart */}
        <Paper
          sx={{
            flex: "1 1 500px",
            minHeight: 400,
            background: isDark ? "#202124" : "#ffffff",
            borderRadius: "10px",
            border: isDark ? "0.05px solid #888383a9" : "1px solid #e0e0e0",
            boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
            p: 3,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            IGS Distribution Across Talladega County Tracts
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
            Hover or click bubbles to explore • Size = IGS Score ({stats.igs_range[0]} - {stats.igs_range[1]})
          </Typography>

          {/* Chart area */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: 320,
              background: isDark 
                ? "radial-gradient(circle at 20% 80%, rgba(239,68,68,0.05) 0%, transparent 40%), radial-gradient(circle at 80% 30%, rgba(16,185,129,0.05) 0%, transparent 40%)"
                : "radial-gradient(circle at 20% 80%, rgba(239,68,68,0.08) 0%, transparent 40%), radial-gradient(circle at 80% 30%, rgba(16,185,129,0.08) 0%, transparent 40%)",
              borderRadius: 2,
              border: isDark ? "1px solid #333" : "1px solid #e8e8e8",
            }}
          >
            {/* Grid lines */}
            <svg
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
            >
              {[25, 50, 75].map((pct) => (
                <line
                  key={`v-${pct}`}
                  x1={`${pct}%`}
                  y1="0"
                  x2={`${pct}%`}
                  y2="100%"
                  stroke={isDark ? "#333" : "#e0e0e0"}
                  strokeDasharray="4,4"
                />
              ))}
              {[25, 50, 75].map((pct) => (
                <line
                  key={`h-${pct}`}
                  x1="0"
                  y1={`${pct}%`}
                  x2="100%"
                  y2={`${pct}%`}
                  stroke={isDark ? "#333" : "#e0e0e0"}
                  strokeDasharray="4,4"
                />
              ))}
            </svg>

            {/* Axis labels */}
            <Typography
              sx={{
                position: "absolute",
                bottom: -24,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: 11,
                color: isDark ? "#888" : "#666",
              }}
            >
              ← Lower IGS | Higher IGS →
            </Typography>
            <Typography
              sx={{
                position: "absolute",
                left: -30,
                top: "50%",
                transform: "rotate(-90deg) translateX(-50%)",
                fontSize: 11,
                color: isDark ? "#888" : "#666",
                transformOrigin: "left center",
              }}
            >
              Inclusion Score →
            </Typography>

            {/* Bubbles */}
            {tracts.map((tract) => {
              const isHovered = hoveredTract === tract.tract_fips;
              const isSelected = selectedTract === tract.tract_fips;
              const isActive = isHovered || isSelected;
              const size = tract.bubble_size;
              
              return (
                <motion.div
                  key={tract.tract_fips}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: isActive ? 1.2 : 1, 
                    opacity: tract.is_focus ? 1 : (isActive ? 1 : 0.7),
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onMouseEnter={() => setHoveredTract(tract.tract_fips)}
                  onMouseLeave={() => setHoveredTract(null)}
                  onClick={() => setSelectedTract(selectedTract === tract.tract_fips ? null : tract.tract_fips)}
                  style={{
                    position: "absolute",
                    left: `${tract.x}%`,
                    top: `${100 - tract.y}%`,
                    transform: "translate(-50%, -50%)",
                    cursor: "pointer",
                    zIndex: isActive ? 10 : tract.is_focus ? 5 : 1,
                  }}
                >
                  {/* Bubble */}
                  <Box
                    sx={{
                      width: size,
                      height: size,
                      borderRadius: "50%",
                      background: tract.is_focus 
                        ? `radial-gradient(circle at 30% 30%, ${tract.color}, ${tract.color}cc)`
                        : isDark 
                          ? `radial-gradient(circle at 30% 30%, #64748b, #475569)`
                          : `radial-gradient(circle at 30% 30%, #94a3b8, #64748b)`,
                      boxShadow: tract.is_focus 
                        ? `0 0 ${isActive ? 20 : 12}px ${tract.color}66`
                        : isActive 
                          ? `0 0 12px ${isDark ? '#64748b88' : '#64748b66'}`
                          : 'none',
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: tract.is_focus 
                        ? "2px solid rgba(255,255,255,0.4)"
                        : isActive 
                          ? `2px solid ${isDark ? '#888' : '#666'}`
                          : "1px solid rgba(255,255,255,0.2)",
                      transition: "box-shadow 0.2s",
                    }}
                  >
                    <Typography 
                      sx={{ 
                        fontSize: size > 35 ? 11 : 9, 
                        fontWeight: 700, 
                        color: "#fff",
                        textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                      }}
                    >
                      {tract.igs.toFixed(0)}
                    </Typography>
                  </Box>

                  {/* Label for focus tracts or hovered */}
                  {(tract.is_focus || isActive) && (
                    <Typography
                      sx={{
                        position: "absolute",
                        top: size / 2 + 8,
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: 10,
                        fontWeight: 600,
                        color: tract.is_focus ? tract.color : (isDark ? "#aaa" : "#666"),
                        whiteSpace: "nowrap",
                        textShadow: isDark ? "0 1px 3px rgba(0,0,0,0.8)" : "0 1px 2px rgba(255,255,255,0.8)",
                      }}
                    >
                      {tract.tract_short}
                    </Typography>
                  )}

                  {/* Tooltip */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        style={{
                          position: "absolute",
                          bottom: size / 2 + 15,
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: isDark ? "#1a1a2eee" : "#ffffffee",
                          borderRadius: 10,
                          padding: "10px 14px",
                          whiteSpace: "nowrap",
                          border: isDark ? "1px solid #444" : "1px solid #ddd",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                          zIndex: 20,
                          minWidth: 140,
                        }}
                      >
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: tract.color, mb: 0.5 }}>
                          {tract.tract_name}
                        </Typography>
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.5, fontSize: 11 }}>
                          <Typography sx={{ color: isDark ? "#999" : "#666" }}>IGS Score:</Typography>
                          <Typography sx={{ fontWeight: 600, color: isDark ? "#fff" : "#333" }}>{tract.igs}</Typography>
                          <Typography sx={{ color: isDark ? "#999" : "#666" }}>Growth:</Typography>
                          <Typography sx={{ fontWeight: 600, color: isDark ? "#fff" : "#333" }}>{tract.growth}</Typography>
                          <Typography sx={{ color: isDark ? "#999" : "#666" }}>Inclusion:</Typography>
                          <Typography sx={{ fontWeight: 600, color: isDark ? "#fff" : "#333" }}>{tract.inclusion}</Typography>
                        </Box>
                        {tract.is_focus && (
                          <Chip
                            label={tract.tract_fips.includes("010500") ? "Focus Tract" : "Benchmark"}
                            size="small"
                            sx={{
                              mt: 1,
                              height: 18,
                              fontSize: 9,
                              bgcolor: tract.color + "22",
                              color: tract.color,
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </Box>

          {/* Legend */}
          <Box sx={{ display: "flex", gap: 3, mt: 4, justifyContent: "center", flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: "#ef4444", border: "2px solid rgba(255,255,255,0.3)" }} />
              <Typography sx={{ fontSize: 11, color: isDark ? "#aaa" : "#666" }}>Tract 105 (Focus)</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: "#10b981", border: "2px solid rgba(255,255,255,0.3)" }} />
              <Typography sx={{ fontSize: 11, color: isDark ? "#aaa" : "#666" }}>Tract 1100 (Benchmark)</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: isDark ? "#64748b" : "#94a3b8" }} />
              <Typography sx={{ fontSize: 11, color: isDark ? "#aaa" : "#666" }}>Other Tracts</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Side Panel - Tract Rankings */}
        <Paper
          sx={{
            flex: "0 0 280px",
            background: isDark ? "#202124" : "#ffffff",
            borderRadius: "10px",
            border: isDark ? "0.05px solid #888383a9" : "1px solid #e0e0e0",
            boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.06)",
            p: 2.5,
            maxHeight: 450,
            overflow: "auto",
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
            All Tracts by IGS
          </Typography>
          
          {[...tracts].sort((a, b) => b.igs - a.igs).map((tract, idx) => (
            <Box
              key={tract.tract_fips}
              component={motion.div}
              whileHover={{ x: 4 }}
              onMouseEnter={() => setHoveredTract(tract.tract_fips)}
              onMouseLeave={() => setHoveredTract(null)}
              onClick={() => setSelectedTract(selectedTract === tract.tract_fips ? null : tract.tract_fips)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                py: 1,
                px: 1.5,
                mb: 0.5,
                borderRadius: 2,
                cursor: "pointer",
                background: (hoveredTract === tract.tract_fips || selectedTract === tract.tract_fips)
                  ? (isDark ? "#2a2a2e" : "#f5f5f5")
                  : "transparent",
                borderLeft: `3px solid ${tract.is_focus ? tract.color : "transparent"}`,
                transition: "background 0.15s",
              }}
            >
              <Typography sx={{ fontSize: 12, color: isDark ? "#666" : "#999", width: 20 }}>
                #{idx + 1}
              </Typography>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: tract.is_focus ? tract.color : (isDark ? "#64748b" : "#94a3b8"),
                  flexShrink: 0,
                }}
              />
              <Typography sx={{ fontSize: 13, fontWeight: tract.is_focus ? 600 : 400, flex: 1 }}>
                {tract.tract_name}
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: tract.is_focus ? tract.color : (isDark ? "#fff" : "#333") }}>
                {tract.igs}
              </Typography>
            </Box>
          ))}
          
          <Box sx={{ mt: 2, pt: 2, borderTop: isDark ? "1px solid #333" : "1px solid #eee" }}>
            <Typography sx={{ fontSize: 11, color: isDark ? "#666" : "#999" }}>
              County Average: <strong style={{ color: isDark ? "#fff" : "#333" }}>{stats.igs_mean.toFixed(1)}</strong>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default ClusterAnalysis;
