"use client";

import { useRef, useCallback, useState, useEffect } from "react";

interface UseLongPressOptions {
  duration?: number;
  onComplete?: () => void;
}

interface UseLongPressReturn {
  progress: number;
  isPressed: boolean;
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerUp: () => void;
    onPointerLeave: () => void;
    onPointerCancel: () => void;
  };
  reset: () => void;
}

export function useLongPress({
  duration = 5000,
  onComplete,
}: UseLongPressOptions = {}): UseLongPressReturn {
  const [progress, setProgress] = useState(0);
  const [isPressed, setIsPressed] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);

  // Keep callback ref fresh without re-triggering effects
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const cancelAnimation = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    cancelAnimation();
    startTimeRef.current = null;
    completedRef.current = false;
    setIsPressed(false);
    setProgress(0);
  }, [cancelAnimation]);

  const tick = useCallback(() => {
    if (startTimeRef.current === null || completedRef.current) return;

    const elapsed = performance.now() - startTimeRef.current;
    const currentProgress = Math.min(elapsed / duration, 1);
    setProgress(currentProgress);

    if (currentProgress >= 1) {
      completedRef.current = true;
      setIsPressed(false);
      onCompleteRef.current?.();
      return;
    }

    rafIdRef.current = requestAnimationFrame(tick);
  }, [duration]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only respond to primary button (touch or left mouse)
      if (e.button !== 0) return;

      completedRef.current = false;
      startTimeRef.current = performance.now();
      setIsPressed(true);
      setProgress(0);
      rafIdRef.current = requestAnimationFrame(tick);
    },
    [tick],
  );

  const handleRelease = useCallback(() => {
    if (!completedRef.current) {
      reset();
    }
  }, [reset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cancelAnimation();
  }, [cancelAnimation]);

  return {
    progress,
    isPressed,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerUp: handleRelease,
      onPointerLeave: handleRelease,
      onPointerCancel: handleRelease,
    },
    reset,
  };
}
