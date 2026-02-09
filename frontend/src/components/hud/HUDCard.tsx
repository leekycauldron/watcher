import type { ReactNode } from "react";

interface HUDCardProps {
  children: ReactNode;
  className?: string;
  glow?: "cyan" | "amber" | "red" | "none";
}

export default function HUDCard({ children, className = "", glow = "cyan" }: HUDCardProps) {
  const glowClass =
    glow === "cyan"
      ? "glow-border"
      : glow === "amber"
        ? "glow-border-amber"
        : glow === "red"
          ? "glow-border-red"
          : "border border-hud-border";

  return (
    <div className={`clip-corner bg-hud-surface ${glowClass} p-4 ${className}`}>
      {children}
    </div>
  );
}
