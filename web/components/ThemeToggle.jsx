import { motion } from "framer-motion";

// Inspired by uiverse.io toggle switches
function ThemeToggle({ isDark, onToggle }) {
  return (
    <label className="theme-toggle" style={{ position: "relative", cursor: "pointer" }}>
      <input
        type="checkbox"
        checked={isDark}
        onChange={onToggle}
        style={{ display: "none" }}
      />
      <motion.div
        style={{
          width: 70,
          height: 34,
          borderRadius: 50,
          background: isDark
            ? "linear-gradient(145deg, #1a1a2e, #2d2d44)"
            : "linear-gradient(145deg, #87CEEB, #E0F7FA)",
          padding: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: isDark ? "flex-end" : "flex-start",
          boxShadow: isDark
            ? "inset 2px 2px 6px #0a0a15, inset -2px -2px 6px #2a2a40"
            : "inset 2px 2px 6px #6bb8d6, inset -2px -2px 6px #ffffff",
          position: "relative",
          overflow: "hidden",
        }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Stars for dark mode */}
        {isDark && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                position: "absolute",
                width: 3,
                height: 3,
                borderRadius: "50%",
                background: "#fff",
                left: 12,
                top: 8,
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              style={{
                position: "absolute",
                width: 2,
                height: 2,
                borderRadius: "50%",
                background: "#fff",
                left: 20,
                top: 14,
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              style={{
                position: "absolute",
                width: 2,
                height: 2,
                borderRadius: "50%",
                background: "#fff",
                left: 8,
                top: 20,
              }}
            />
          </>
        )}

        {/* Clouds for light mode */}
        {!isDark && (
          <>
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 0.8, x: 0 }}
              style={{
                position: "absolute",
                width: 14,
                height: 6,
                borderRadius: 10,
                background: "#fff",
                right: 10,
                top: 8,
              }}
            />
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 0.6, x: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                position: "absolute",
                width: 10,
                height: 5,
                borderRadius: 10,
                background: "#fff",
                right: 18,
                top: 18,
              }}
            />
          </>
        )}

        {/* Toggle circle (sun/moon) */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: isDark
              ? "linear-gradient(145deg, #c9c9c9, #e8e8e8)"
              : "linear-gradient(145deg, #FFD700, #FFA500)",
            boxShadow: isDark
              ? "0 0 8px rgba(200,200,200,0.4)"
              : "0 0 12px rgba(255,165,0,0.6)",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Moon craters */}
          {isDark && (
            <>
              <div
                style={{
                  position: "absolute",
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#b0b0b0",
                  left: 6,
                  top: 5,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: 3,
                  height: 3,
                  borderRadius: "50%",
                  background: "#a0a0a0",
                  right: 6,
                  bottom: 8,
                }}
              />
            </>
          )}

          {/* Sun rays */}
          {!isDark && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{
                position: "absolute",
                inset: -4,
                borderRadius: "50%",
                border: "2px dashed rgba(255,165,0,0.3)",
              }}
            />
          )}
        </motion.div>
      </motion.div>
    </label>
  );
}

export default ThemeToggle;

