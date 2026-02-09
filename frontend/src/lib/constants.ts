export const COLORS = {
  cyan: "#00f0ff",
  cyanDim: "#00a0aa",
  amber: "#ffb800",
  red: "#ff3040",
  green: "#00ff88",
  base: "#0a0a0f",
  surface: "#12121a",
  elevated: "#1a1a2e",
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export const MEDIAMTX_WEBRTC_PORT = 8889;

export const POLL_INTERVALS = {
  streamStatus: 2000,
  systemHealth: 5000,
} as const;
