"use client";

import { useState, useEffect, useRef } from "react";

export type ConnectionStatus = "connecting" | "online" | "offline";

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkHealth() {
      try {
        const res = await fetch("/api/health");
        if (cancelled) return;
        if (res.ok) {
          setStatus("online");
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        } else {
          setStatus("offline");
          startRetry();
        }
      } catch {
        if (cancelled) return;
        setStatus("offline");
        startRetry();
      }
    }

    function startRetry() {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        checkHealth();
      }, 5000);
    }

    checkHealth();

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return status;
}
