import { useEffect, useRef } from "react";
import { MEDIAMTX_WEBRTC_PORT } from "../../lib/constants";

interface WebRTCPlayerProps {
  onConnected?: () => void;
  onError?: (err: string) => void;
  onLoadedData?: () => void;
}

export default function WebRTCPlayer({ onConnected, onError, onLoadedData }: WebRTCPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function connect() {
      try {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        pcRef.current = pc;

        pc.addTransceiver("video", { direction: "recvonly" });
        pc.addTransceiver("audio", { direction: "recvonly" });

        pc.ontrack = (ev) => {
          if (videoRef.current && ev.streams[0]) {
            videoRef.current.srcObject = ev.streams[0];
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Wait for ICE gathering to complete (or timeout)
        await new Promise<void>((resolve) => {
          if (pc.iceGatheringState === "complete") {
            resolve();
            return;
          }
          const timer = setTimeout(resolve, 2000);
          pc.onicegatheringstatechange = () => {
            if (pc.iceGatheringState === "complete") {
              clearTimeout(timer);
              resolve();
            }
          };
        });

        if (cancelled) return;

        const whepUrl = `http://${window.location.hostname}:${MEDIAMTX_WEBRTC_PORT}/cam/whep`;
        const res = await fetch(whepUrl, {
          method: "POST",
          headers: { "Content-Type": "application/sdp" },
          body: pc.localDescription!.sdp,
        });

        if (!res.ok) throw new Error(`WHEP ${res.status}`);

        const answerSdp = await res.text();
        await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

        if (!cancelled) onConnected?.();
      } catch (e) {
        if (!cancelled) {
          onError?.(e instanceof Error ? e.message : "WebRTC failed");
        }
      }
    }

    connect();

    return () => {
      cancelled = true;
      pcRef.current?.close();
      pcRef.current = null;
    };
  }, [onConnected, onError]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      onLoadedData={onLoadedData}
      className="w-full h-full object-contain bg-black"
    />
  );
}
