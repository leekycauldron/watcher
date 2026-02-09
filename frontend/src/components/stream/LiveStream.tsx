import { useCallback, useEffect, useRef, useState } from "react";
import WebRTCPlayer from "./WebRTCPlayer";
import MJPEGPlayer from "./MJPEGPlayer";

type ConnectionState = "connecting" | "webrtc" | "mjpeg" | "disconnected";

interface LiveStreamProps {
  onLoadedData?: () => void;
}

export default function LiveStream({ onLoadedData }: LiveStreamProps) {
  const [state, setState] = useState<ConnectionState>("connecting");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Start with WebRTC, fallback to MJPEG after 5s
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setState((prev) => (prev === "connecting" ? "mjpeg" : prev));
    }, 5000);
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const handleWebRTCConnected = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setState("webrtc");
  }, []);

  const handleWebRTCError = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setState("mjpeg");
  }, []);

  return (
    <div className="relative w-full h-full bg-black">
      {/* Connection state badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-2 py-1 bg-black/60 rounded font-mono text-xs">
        <span
          className={`w-2 h-2 rounded-full ${
            state === "webrtc"
              ? "bg-hud-green"
              : state === "mjpeg"
                ? "bg-hud-amber"
                : state === "connecting"
                  ? "bg-hud-cyan animate-pulse-glow"
                  : "bg-hud-red"
          }`}
        />
        <span className="text-hud-text-dim uppercase tracking-wider">
          {state === "webrtc"
            ? "WebRTC"
            : state === "mjpeg"
              ? "MJPEG"
              : state === "connecting"
                ? "Connecting..."
                : "Disconnected"}
        </span>
      </div>

      {/* Player */}
      {state === "mjpeg" ? (
        <MJPEGPlayer onLoad={onLoadedData} />
      ) : (
        <WebRTCPlayer
          onConnected={handleWebRTCConnected}
          onError={handleWebRTCError}
          onLoadedData={onLoadedData}
        />
      )}
    </div>
  );
}
