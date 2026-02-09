export interface StreamStatus {
  connected: boolean;
  fps: number;
  width: number;
  height: number;
  reconnect_attempts: number;
  last_frame_at: string | null;
  rtsp_url: string;
  error: string | null;
}

export interface SystemHealth {
  cpu_percent: number;
  ram_percent: number;
  ram_used_gb: number;
  ram_total_gb: number;
  gpu_name: string | null;
  gpu_percent: number | null;
  gpu_memory_percent: number | null;
  gpu_temp_c: number | null;
  disk_percent: number;
  disk_used_gb: number;
  disk_total_gb: number;
}

export interface SystemStatus {
  armed: boolean;
  uptime_seconds: number;
  stream: StreamStatus;
  health: SystemHealth;
}

export interface ConfigResponse {
  config: Record<string, string>;
}

export interface WsMessage {
  type: string;
  data: unknown;
}
