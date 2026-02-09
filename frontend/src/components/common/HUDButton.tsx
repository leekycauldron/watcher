import type { ButtonHTMLAttributes, ReactNode } from "react";

interface HUDButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  children: ReactNode;
}

const VARIANTS = {
  primary:
    "bg-hud-cyan/10 text-hud-cyan border-hud-cyan/30 hover:bg-hud-cyan/20 hover:shadow-[0_0_16px_rgba(0,240,255,0.2)]",
  ghost:
    "bg-transparent text-hud-text-dim border-hud-border hover:text-hud-text hover:border-hud-text-dim",
  danger:
    "bg-hud-red/10 text-hud-red border-hud-red/30 hover:bg-hud-red/20 hover:shadow-[0_0_16px_rgba(255,48,64,0.2)]",
};

export default function HUDButton({
  variant = "primary",
  children,
  className = "",
  ...props
}: HUDButtonProps) {
  return (
    <button
      className={`clip-corner-sm px-4 py-2 border font-mono text-sm tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
