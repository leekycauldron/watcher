import type { StreamStatus } from "../../lib/types";
import StatusIndicator from "../hud/StatusIndicator";

interface StreamStatusBarProps {
  status: StreamStatus | null;
}

export default function StreamStatusBar({ status }: StreamStatusBarProps) {
  if (!status) return null;

  return (
    <div className="flex items-center gap-4 px-3 py-2 bg-hud-surface border border-hud-border rounded font-mono text-xs">
      <div className="flex items-center gap-2">
        <StatusIndicator
          status={status.connected ? "healthy" : "critical"}
          size="sm"
        />
        <span className="text-hud-text-dim">
          {status.connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      {status.connected && (
        <>
          <span className="text-hud-text-dim">
            {status.width}x{status.height}
          </span>
          <span className="text-hud-text-dim">{status.fps} FPS</span>
        </>
      )}

      {status.error && (
        <span className="text-hud-red text-[10px] truncate max-w-48">
          {status.error}
        </span>
      )}

      {status.reconnect_attempts > 0 && (
        <span className="text-hud-amber text-[10px]">
          Reconnecting ({status.reconnect_attempts})...
        </span>
      )}
    </div>
  );
}
