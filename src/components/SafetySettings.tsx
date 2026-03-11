"use client";

import { useState, useTransition } from "react";
import { updateMaxDuration } from "@/app/actions/settings";
import { Slider } from "@/components/ui/slider";
import { useConnection } from "@/contexts/ConnectionContext";

interface SafetySettingsProps {
  maxDurationMinutes: number;
}

export default function SafetySettings({
  maxDurationMinutes,
}: SafetySettingsProps) {
  const [hours, setHours] = useState(maxDurationMinutes / 60);
  const [isPending, startTransition] = useTransition();
  const connectionStatus = useConnection();
  const isOffline = connectionStatus !== "online";

  const handleCommit = (value: number[]) => {
    const newHours = value[0];
    startTransition(async () => {
      await updateMaxDuration(newHours * 60);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <label className="text-base text-[--color-text]">
          Max Duration Alert
        </label>
        <span className="text-base font-semibold text-[--color-primary] tabular-nums">
          {hours}h
        </span>
      </div>
      <Slider
        value={[hours]}
        onValueChange={(v) => setHours(v[0])}
        onValueCommit={handleCommit}
        min={1}
        max={72}
        step={1}
        disabled={isPending || isOffline}
        aria-label="Maximum fasting duration in hours"
      />
      <div className="flex justify-between text-sm text-[--color-text-muted]">
        <span>1h</span>
        <span>72h</span>
      </div>
    </div>
  );
}
