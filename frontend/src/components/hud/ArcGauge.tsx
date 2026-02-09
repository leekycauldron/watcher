interface ArcGaugeProps {
  value: number;       // 0-100
  label: string;
  unit?: string;
  size?: number;       // px
  color?: "cyan" | "amber" | "red" | "green";
}

const COLOR_MAP = {
  cyan: { stroke: "var(--color-hud-cyan)", glow: "var(--color-hud-cyan-glow)" },
  amber: { stroke: "var(--color-hud-amber)", glow: "var(--color-hud-amber-glow)" },
  red: { stroke: "var(--color-hud-red)", glow: "var(--color-hud-red-glow)" },
  green: { stroke: "var(--color-hud-green)", glow: "var(--color-hud-green-glow)" },
};

export default function ArcGauge({
  value,
  label,
  unit = "%",
  size = 80,
  color = "cyan",
}: ArcGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const arc = circumference * 0.75; // 270° arc
  const offset = arc - (arc * clamped) / 100;
  const c = COLOR_MAP[color];

  // Auto-color based on value
  const autoColor =
    clamped > 90 ? COLOR_MAP.red : clamped > 70 ? COLOR_MAP.amber : c;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="transform rotate-[135deg]">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-hud-border)"
          strokeWidth={4}
          strokeDasharray={`${arc} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={autoColor.stroke}
          strokeWidth={4}
          strokeDasharray={`${arc} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 4px ${autoColor.glow})`,
            transition: "stroke-dashoffset 0.6s ease-out, stroke 0.3s",
          }}
        />
      </svg>
      {/* Center value */}
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="font-mono text-sm font-medium text-hud-text">
          {Math.round(clamped)}
          <span className="text-xs text-hud-text-dim">{unit}</span>
        </span>
      </div>
      <span className="text-[10px] uppercase tracking-wider text-hud-text-dim font-medium -mt-1">
        {label}
      </span>
    </div>
  );
}
