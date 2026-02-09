interface StatusIndicatorProps {
  status: "healthy" | "warning" | "critical" | "offline";
  size?: "sm" | "md";
}

const STATUS_COLORS = {
  healthy: { dot: "bg-hud-green", ring: "border-hud-green/40", shadow: "shadow-[0_0_6px_var(--color-hud-green-glow)]" },
  warning: { dot: "bg-hud-amber", ring: "border-hud-amber/40", shadow: "shadow-[0_0_6px_var(--color-hud-amber-glow)]" },
  critical: { dot: "bg-hud-red", ring: "border-hud-red/40", shadow: "shadow-[0_0_6px_var(--color-hud-red-glow)]" },
  offline: { dot: "bg-hud-text-dim", ring: "border-hud-text-dim/40", shadow: "" },
};

export default function StatusIndicator({ status, size = "md" }: StatusIndicatorProps) {
  const colors = STATUS_COLORS[status];
  const s = size === "sm" ? "w-2 h-2" : "w-3 h-3";
  const ring = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <span className={`relative inline-flex items-center justify-center ${ring}`}>
      <span
        className={`absolute inset-0 rounded-full border ${colors.ring} ${
          status !== "offline" ? "animate-pulse-glow" : ""
        }`}
      />
      <span className={`relative rounded-full ${s} ${colors.dot} ${colors.shadow}`} />
    </span>
  );
}
