/**
 * Application constants
 */

export const APP_NAME = "Showg";
export const APP_DESCRIPTION = "Transform your GitHub profile into beautiful, shareable developer cards";

export const COLORS = {
  primary: "#00E5FF",
  secondary: "#FF00CC",
  tertiary: "#9D4BFF",
  background: "#0A0A0A",
} as const;

export const GRADIENTS = {
  primary: "linear-gradient(135deg, #00E5FF 0%, #FF00CC 50%, #9D4BFF 100%)",
  cyan: "#00E5FF",
  pink: "#FF00CC",
  purple: "#9D4BFF",
} as const;

export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  AUTH_CALLBACK: "/auth/callback",
} as const;

