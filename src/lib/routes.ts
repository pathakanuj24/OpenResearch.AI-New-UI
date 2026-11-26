export const routes = {
  home: "/",
  features: "/features",
  how: "/how-it-works",
  about: "/about",
  contact: "/contact",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  signedOut: "/signed-out",
  today: "/today",
  paper: (id: string, view?: "read" | "trail") => `/papers/${id}${view === "trail" ? "?view=trail" : ""}`,
  resources: "/resources",
  learning: "/learning",
  settings: "/settings",
  // kept for old imports
  dashboard: "/today",
};
