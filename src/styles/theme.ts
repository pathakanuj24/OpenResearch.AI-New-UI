import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1a73e8", light: "#4285f4", dark: "#1557b0" },
    secondary: { main: "#5f6368" },
    success: { main: "#22c55e", light: "#4ade80", dark: "#16a34a" },
    error: { main: "#ef4444", light: "#f87171", dark: "#dc2626" },
    warning: { main: "#f59e0b", light: "#fbbf24", dark: "#d97706" },
    background: { default: "#f8fafc", paper: "#ffffff" },
    text: { primary: "#0f172a", secondary: "#64748b" },
    divider: "rgba(0,0,0,0.06)",
  },
  typography: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-0.025em" },
    h2: { fontWeight: 700, letterSpacing: "-0.02em" },
    h3: { fontWeight: 700, letterSpacing: "-0.015em" },
    h4: { fontWeight: 600, letterSpacing: "-0.01em" },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.5 },
  },
  shape: { borderRadius: 12 },
  shadows: [
    "none",
    "0 1px 2px rgba(0,0,0,0.04)",
    "0 1px 3px rgba(0,0,0,0.06)",
    "0 2px 4px rgba(0,0,0,0.06)",
    "0 4px 6px rgba(0,0,0,0.06)",
    "0 6px 10px rgba(0,0,0,0.06)",
    "0 8px 16px rgba(0,0,0,0.06)",
    "0 12px 24px rgba(0,0,0,0.06)",
    "0 16px 32px rgba(0,0,0,0.06)",
    "0 20px 40px rgba(0,0,0,0.08)",
    "0 24px 48px rgba(0,0,0,0.08)",
    "0 28px 56px rgba(0,0,0,0.08)",
    "0 32px 64px rgba(0,0,0,0.08)",
    "0 36px 72px rgba(0,0,0,0.10)",
    "0 40px 80px rgba(0,0,0,0.10)",
    "0 44px 88px rgba(0,0,0,0.10)",
    "0 48px 96px rgba(0,0,0,0.10)",
    "0 52px 104px rgba(0,0,0,0.12)",
    "0 56px 112px rgba(0,0,0,0.12)",
    "0 60px 120px rgba(0,0,0,0.12)",
    "0 64px 128px rgba(0,0,0,0.12)",
    "0 68px 136px rgba(0,0,0,0.14)",
    "0 72px 144px rgba(0,0,0,0.14)",
    "0 76px 152px rgba(0,0,0,0.14)",
    "0 80px 160px rgba(0,0,0,0.14)",
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": {
            width: 6,
            height: 6,
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0,0,0,0.15)",
            borderRadius: 3,
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(0,0,0,0.25)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "8px 18px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          "&:hover": {
            boxShadow: "0 2px 8px rgba(26,115,232,0.25)",
          },
        },
        sizeSmall: {
          padding: "6px 14px",
          fontSize: 13,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: "#fff",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0,0,0,0.15)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderWidth: 1.5,
          },
        },
        notchedOutline: {
          borderColor: "rgba(0,0,0,0.1)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
        sizeSmall: {
          height: 24,
          fontSize: 12,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          minHeight: 44,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 2.5,
          borderRadius: 2,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "rgba(0,0,0,0.06)",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});
