import { useState } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useStreamStatus } from "../hooks/useStreamStatus";
import { useSystemHealth } from "../hooks/useSystemHealth";
import LiveStream from "../components/stream/LiveStream";
import HUDOverlay from "../components/stream/HUDOverlay";
import StreamStatusBar from "../components/stream/StreamStatusBar";
import HUDCard from "../components/hud/HUDCard";
import ArcGauge from "../components/hud/ArcGauge";
import HUDButton from "../components/common/HUDButton";

export default function LiveView() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { status: streamStatus } = useStreamStatus();
  const { health } = useSystemHealth();
  const [armed, setArmed] = useState(false);

  return (
    <div className={`h-full ${isDesktop ? "flex gap-4 p-4" : "flex flex-col"}`}>
      {/* Stream area */}
      <div className={`relative ${isDesktop ? "flex-[3] min-h-0" : "aspect-video w-full"} bg-black rounded-lg overflow-hidden`}>
        <LiveStream />
        <HUDOverlay streamStatus={streamStatus} armed={armed} />
      </div>

      {/* Sidebar / bottom panel */}
      <div className={`${isDesktop ? "flex-1 flex flex-col gap-3 min-w-[280px]" : "p-3 flex flex-col gap-3"}`}>
        {/* Stream status */}
        <StreamStatusBar status={streamStatus} />

        {/* Arm/disarm toggle */}
        <HUDCard glow={armed ? "red" : "none"} className="flex items-center justify-between">
          <div>
            <div className="font-mono text-sm text-hud-text">System Status</div>
            <div className={`font-mono text-xs mt-1 ${armed ? "text-hud-red" : "text-hud-green"}`}>
              {armed ? "◉ ARMED" : "○ DISARMED"}
            </div>
          </div>
          <HUDButton
            variant={armed ? "danger" : "primary"}
            onClick={() => setArmed(!armed)}
          >
            {armed ? "DISARM" : "ARM"}
          </HUDButton>
        </HUDCard>

        {/* Health gauges */}
        {health && (
          <HUDCard className="flex flex-wrap justify-around gap-4">
            <div className="relative">
              <ArcGauge value={health.cpu_percent} label="CPU" />
            </div>
            <div className="relative">
              <ArcGauge value={health.ram_percent} label="RAM" />
            </div>
            {health.gpu_percent != null && (
              <div className="relative">
                <ArcGauge value={health.gpu_percent} label="GPU" />
              </div>
            )}
            <div className="relative">
              <ArcGauge value={health.disk_percent} label="Disk" />
            </div>
          </HUDCard>
        )}

        {/* Health details */}
        {health && (
          <HUDCard glow="none" className="font-mono text-xs space-y-1.5 text-hud-text-dim">
            <div className="flex justify-between">
              <span>RAM</span>
              <span>{health.ram_used_gb} / {health.ram_total_gb} GB</span>
            </div>
            <div className="flex justify-between">
              <span>Disk</span>
              <span>{health.disk_used_gb} / {health.disk_total_gb} GB</span>
            </div>
            {health.gpu_name && (
              <div className="flex justify-between">
                <span>GPU</span>
                <span>{health.gpu_name}</span>
              </div>
            )}
            {health.gpu_temp_c != null && (
              <div className="flex justify-between">
                <span>GPU Temp</span>
                <span>{health.gpu_temp_c}°C</span>
              </div>
            )}
          </HUDCard>
        )}
      </div>
    </div>
  );
}
