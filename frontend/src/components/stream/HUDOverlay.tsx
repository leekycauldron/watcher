import type { StreamStatus } from "../../lib/types";
import ScanLineOverlay from "../hud/ScanLineOverlay";

interface HUDOverlayProps {
  streamStatus: StreamStatus | null;
  armed: boolean;
}

function CornerBracket({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const isTop = position.startsWith("t");
  const isLeft = position.endsWith("l");

  return (
    <svg
      width="32"
      height="32"
      className={`absolute ${isTop ? "top-2" : "bottom-2"} ${isLeft ? "left-2" : "right-2"}`}
      style={{
        transform: `scale(${isLeft ? 1 : -1}, ${isTop ? 1 : -1})`,
      }}
    >
      <path
        d="M2 28V8L8 2H28"
        fill="none"
        stroke="var(--color-hud-cyan)"
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />
    </svg>
  );
}

export default function HUDOverlay({ streamStatus, armed }: HUDOverlayProps) {
  const now = new Date();
  const timestamp = now.toLocaleTimeString("en-US", { hour12: false });

  return (
    <div className="absolute inset-0 pointer-events-none">
      <ScanLineOverlay />

      {/* Corner brackets */}
      <CornerBracket position="tl" />
      <CornerBracket position="tr" />
      <CornerBracket position="bl" />
      <CornerBracket position="br" />

      {/* Top-right readout */}
      <div className="absolute top-3 right-3 text-right font-mono text-[10px] space-y-0.5">
        <div className={armed ? "text-hud-red" : "text-hud-green"}>
          {armed ? "◉ ARMED" : "○ DISARMED"}
        </div>
        <div className="text-hud-text-dim">{timestamp}</div>
      </div>

      {/* Bottom-left readout */}
      {streamStatus && (
        <div className="absolute bottom-3 left-3 font-mono text-[10px] space-y-0.5">
          <div className="text-hud-text-dim">
            {streamStatus.width}x{streamStatus.height} @ {streamStatus.fps} FPS
          </div>
          <div className="text-hud-text-dim">
            {streamStatus.connected ? "STREAM ACTIVE" : "NO SIGNAL"}
          </div>
        </div>
      )}

      {/* Bottom-right — connection type */}
      <div className="absolute bottom-3 right-3 font-mono text-[10px] text-hud-text-dim">
        REC ●
      </div>
    </div>
  );
}
