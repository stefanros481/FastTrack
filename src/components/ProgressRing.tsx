"use client";

import { CheckCircle2 } from "lucide-react";

interface ProgressRingProps {
  progress: number;
  goalReached: boolean;
  elapsedFormatted: string;
  percentText: string;
  remainingText: string;
}

const SIZE = 240;
const STROKE_WIDTH = 12;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ProgressRing({
  progress,
  goalReached,
  elapsedFormatted,
  percentText,
  remainingText,
}: ProgressRingProps) {
  const offset = CIRCUMFERENCE * (1 - Math.min(progress, 1));
  const strokeColor = goalReached
    ? "var(--color-success)"
    : "var(--color-primary)";

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="transform -rotate-90"
        >
          {/* Track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--color-primary-light)"
            strokeWidth={STROKE_WIDTH}
          />
          {/* Progress */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={strokeColor}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s ease" }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {goalReached ? (
            <div className="motion-safe:animate-bounce-in">
              <CheckCircle2
                size={32}
                className="text-[--color-success] mb-1"
              />
            </div>
          ) : null}
          <div
            className="text-3xl font-bold text-[--color-text] font-mono tracking-tight"
            suppressHydrationWarning
          >
            {elapsedFormatted}
          </div>
        </div>
      </div>

      {/* Secondary labels */}
      <div className="text-sm text-[--color-text-muted] mt-2 text-center">
        {goalReached ? (
          <span className="text-[--color-success] font-semibold">
            Goal reached!
          </span>
        ) : (
          <>
            {percentText} &middot; {remainingText}
          </>
        )}
      </div>
    </div>
  );
}
