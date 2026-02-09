import { useCallback, useEffect, useState } from "react";
import { getSystemHealth } from "../lib/api";
import { POLL_INTERVALS } from "../lib/constants";
import type { SystemHealth } from "../lib/types";

export function useSystemHealth() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await getSystemHealth();
      setHealth(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch health");
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_INTERVALS.systemHealth);
    return () => clearInterval(id);
  }, [refresh]);

  return { health, error, refresh };
}
