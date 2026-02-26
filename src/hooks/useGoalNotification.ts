"use client";

import { useRef, useCallback, useState } from "react";

interface UseGoalNotificationOptions {
  goalMinutes: number | null;
  elapsedMs: number;
  isActive: boolean;
}

interface UseGoalNotificationResult {
  showToast: boolean;
  toastMessage: string;
  dismissToast: () => void;
}

export function useGoalNotification({
  goalMinutes,
  elapsedMs,
  isActive,
}: UseGoalNotificationOptions): UseGoalNotificationResult {
  const notifiedRef = useRef(false);
  const prevActiveRef = useRef(isActive);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Reset when session ends
  if (prevActiveRef.current && !isActive) {
    notifiedRef.current = false;
    setShowToast(false);
  }
  prevActiveRef.current = isActive;

  // Check if goal reached
  if (
    isActive &&
    goalMinutes &&
    !notifiedRef.current &&
    elapsedMs >= goalMinutes * 60 * 1000
  ) {
    notifiedRef.current = true;
    const goalHours = goalMinutes / 60;
    const message = `You've reached your ${goalHours}h fasting goal!`;

    // Try browser notification
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("FastTrack", { body: message });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("FastTrack", { body: message });
          }
        });
      }
    }

    // Always show in-app toast as well (or as fallback)
    setToastMessage(message);
    setShowToast(true);
  }

  const dismissToast = useCallback(() => setShowToast(false), []);

  return { showToast, toastMessage, dismissToast };
}
