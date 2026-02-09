import { useCallback, useEffect, useState } from "react";
import { getConfig, updateConfig } from "../lib/api";
import { useSystemHealth } from "../hooks/useSystemHealth";
import HUDCard from "../components/hud/HUDCard";
import HUDButton from "../components/common/HUDButton";

export default function Settings() {
  const { health } = useSystemHealth();
  const [rtspUrl, setRtspUrl] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConfig()
      .then((data) => {
        setRtspUrl(data.config.rtsp_url ?? "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      await updateConfig("rtsp_url", rtspUrl);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      /* show error in future */
    }
  }, [rtspUrl]);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="font-mono text-lg text-hud-cyan tracking-wider">SETTINGS</h1>

      {/* RTSP URL */}
      <HUDCard>
        <h2 className="font-mono text-sm text-hud-text mb-3">Stream Source</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-hud-text-dim mb-1 font-mono">
              RTSP URL
            </label>
            <input
              type="text"
              value={loading ? "" : rtspUrl}
              onChange={(e) => setRtspUrl(e.target.value)}
              placeholder="rtsp://localhost:8554/cam"
              className="w-full bg-hud-base border border-hud-border rounded px-3 py-2 font-mono text-sm text-hud-text focus:outline-none focus:border-hud-cyan/50 transition-colors"
              disabled={loading}
            />
          </div>
          <div className="flex items-center gap-3">
            <HUDButton onClick={handleSave} disabled={loading}>
              SAVE
            </HUDButton>
            {saved && (
              <span className="text-hud-green text-xs font-mono">Saved!</span>
            )}
          </div>
        </div>
      </HUDCard>

      {/* System info */}
      {health && (
        <HUDCard glow="none">
          <h2 className="font-mono text-sm text-hud-text mb-3">System Info</h2>
          <div className="font-mono text-xs space-y-1.5 text-hud-text-dim">
            <div className="flex justify-between">
              <span>CPU</span>
              <span>{health.cpu_percent}%</span>
            </div>
            <div className="flex justify-between">
              <span>RAM</span>
              <span>{health.ram_used_gb} / {health.ram_total_gb} GB ({health.ram_percent}%)</span>
            </div>
            <div className="flex justify-between">
              <span>Disk</span>
              <span>{health.disk_used_gb} / {health.disk_total_gb} GB ({health.disk_percent}%)</span>
            </div>
            {health.gpu_name && (
              <>
                <div className="flex justify-between">
                  <span>GPU</span>
                  <span>{health.gpu_name}</span>
                </div>
                {health.gpu_percent != null && (
                  <div className="flex justify-between">
                    <span>GPU Load</span>
                    <span>{health.gpu_percent.toFixed(1)}%</span>
                  </div>
                )}
                {health.gpu_temp_c != null && (
                  <div className="flex justify-between">
                    <span>GPU Temp</span>
                    <span>{health.gpu_temp_c}°C</span>
                  </div>
                )}
              </>
            )}
          </div>
        </HUDCard>
      )}

      {/* Placeholder sections */}
      <HUDCard glow="none" className="opacity-50">
        <h2 className="font-mono text-sm text-hud-text mb-2">Detection</h2>
        <p className="text-xs text-hud-text-dim">Coming in Stage 2</p>
      </HUDCard>

      <HUDCard glow="none" className="opacity-50">
        <h2 className="font-mono text-sm text-hud-text mb-2">Notifications</h2>
        <p className="text-xs text-hud-text-dim">Coming in Stage 2</p>
      </HUDCard>
    </div>
  );
}
