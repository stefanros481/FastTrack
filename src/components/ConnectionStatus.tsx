"use client";

import { useState, useEffect } from "react";
import type { ConnectionStatus as Status } from "@/hooks/useConnectionStatus";

interface Props {
  status: Status;
}

type Phase = "visible" | "fading" | "hidden";

export default function ConnectionStatus({ status }: Props) {
  const [phase, setPhase] = useState<Phase>("visible");

  useEffect(() => {
    if (status !== "online") {
      setPhase("visible");
      return;
    }

    // Auto-hide after 3s when online
    const fadeTimer = setTimeout(() => setPhase("fading"), 3000);
    const hideTimer = setTimeout(() => setPhase("hidden"), 3300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [status]);

  if (phase === "hidden") return null;

  const config = {
    connecting: {
      dotClass: "bg-[var(--color-warning)] motion-safe:animate-pulse",
      label: "Connecting...",
    },
    online: {
      dotClass: "bg-[var(--color-success)]",
      label: "Online",
    },
    offline: {
      dotClass: "bg-[var(--color-error)]",
      label: "Offline",
    },
    unavailable: {
      dotClass: "bg-[var(--color-error)]",
      label: "Unavailable",
    },
  }[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
      style={{ opacity: phase === "fading" ? 0 : 1, transition: "opacity 300ms" }}
    >
      <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}
