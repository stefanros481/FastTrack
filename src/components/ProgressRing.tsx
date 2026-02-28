"use client";

import { CheckCircle2 } from "lucide-react";

interface ProgressRingProps {
  progress: number;
  goalReached: boolean;
  elapsedFormatted: string;
  percentText: string;
  remainingText: string;
  longPressProgress?: number;
  isPressed?: boolean;
  longPressHandlers?: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerUp: () => void;
    onPointerLeave: () => void;
    onPointerCancel: () => void;
  };
  onEndSession?: () => void;
}

const SIZE = 240;
const STROKE_WIDTH = 12;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Confirmation circle is slightly inside the main ring
const CONFIRM_STROKE_WIDTH = 6;
const CONFIRM_RADIUS = RADIUS - STROKE_WIDTH / 2 - CONFIRM_STROKE_WIDTH / 2 - 4;
const CONFIRM_CIRCUMFERENCE = 2 * Math.PI * CONFIRM_RADIUS;

export default function ProgressRing({
  progress,
  goalReached,
  elapsedFormatted,
  percentText,
  remainingText,
  longPressProgress = 0,
  isPressed = false,
  longPressHandlers,
  onEndSession,
}: ProgressRingProps) {
  const offset = CIRCUMFERENCE * (1 - Math.min(progress, 1));
  const strokeColor = goalReached
    ? "var(--color-success)"
    : "var(--color-primary)";

  const confirmOffset = CONFIRM_CIRCUMFERENCE * (1 - longPressProgress);
  const showConfirmCircle = isPressed || longPressProgress > 0;
  const holdComplete = longPressProgress >= 1;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative touch-none select-none"
        style={{ width: SIZE, height: SIZE }}
        onContextMenu={(e) => e.preventDefault()}
        {...longPressHandlers}
      >
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
          {/* Confirmation circle (red, inner) */}
          {showConfirmCircle && (
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={CONFIRM_RADIUS}
              fill="none"
              stroke="var(--color-error)"
              strokeWidth={CONFIRM_STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={CONFIRM_CIRCUMFERENCE}
              strokeDashoffset={confirmOffset}
              style={{
                transition: isPressed
                  ? "none"
                  : "stroke-dashoffset 0.3s ease-out",
                opacity: longPressProgress > 0 ? 1 : 0,
              }}
            />
          )}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {goalReached && !isPressed ? (
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
        {isPressed ? (
          <span className="text-[--color-error] font-semibold">
            Hold to end...
          </span>
        ) : holdComplete ? (
          <span className="text-[--color-error] font-semibold">
            Session ended
          </span>
        ) : goalReached ? (
          <span className="text-[--color-success] font-semibold">
            Goal reached!
          </span>
        ) : (
          <>
            {percentText} &middot; {remainingText}
          </>
        )}
      </div>

      {/* Discoverability hint */}
      <div className="text-xs text-[--color-text-muted] mt-1 motion-safe:animate-fade-in">
        Hold ring to end
      </div>

      {/* Accessible fallback button */}
      {onEndSession && (
        <button
          className="sr-only"
          onClick={onEndSession}
          aria-label="End fasting session"
        >
          End session
        </button>
      )}
    </div>
  );
}
