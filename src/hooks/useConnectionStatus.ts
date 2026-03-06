"use client";

import { useState, useEffect, useRef } from "react";

export type ConnectionStatus = "connecting" | "online" | "offline" | "unavailable";

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const failCountRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    function handleFailure() {
      failCountRef.current++;
      setStatus(failCountRef.current >= 3 ? "unavailable" : "offline");
      startRetry();
    }

    async function checkHealth() {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      try {
        const res = await fetch("/api/health", { signal: controller.signal });
        clearTimeout(timeout);
        if (cancelled) return;
        if (res.ok) {
          failCountRef.current = 0;
          setStatus("online");
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        } else {
          handleFailure();
        }
      } catch {
        clearTimeout(timeout);
        if (cancelled) return;
        handleFailure();
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
