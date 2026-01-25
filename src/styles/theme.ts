import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1a73e8", light: "#4285f4", dark: "#1557b0" },
    secondary: { main: "#5f6368" },
    background: { default: "#f7f8fb", paper: "#ffffff" },
    text: { primary: "#111827", secondary: "#6b7280" },
  },
  typography: {
    fontFamily: "var(--font-inter), Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    h1: { fontWeight: 900, letterSpacing: "-0.04em" },
    h2: { fontWeight: 850, letterSpacing: "-0.03em" },
    h3: { fontWeight: 800, letterSpacing: "-0.02em" },
    button: { textTransform: "none", fontWeight: 800 },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          padding: "10px 18px",
          boxShadow: "none",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: "#fff",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 14px 30px rgba(16,24,40,0.06)",
        },
      },
    },
  },
});
