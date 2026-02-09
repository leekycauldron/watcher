import { useCallback, useEffect, useState } from "react";
import { getStreamStatus } from "../lib/api";
import { POLL_INTERVALS } from "../lib/constants";
import type { StreamStatus } from "../lib/types";

export function useStreamStatus() {
  const [status, setStatus] = useState<StreamStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await getStreamStatus();
      setStatus(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch stream status");
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_INTERVALS.streamStatus);
    return () => clearInterval(id);
  }, [refresh]);

  return { status, error, refresh };
}
