"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export default function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      onClick={onDismiss}
      className="fixed bottom-24 left-4 right-4 z-[60] bg-[--color-success] text-white rounded-xl p-4 text-center font-semibold shadow-lg cursor-pointer motion-safe:animate-slide-up"
      role="alert"
    >
      {message}
    </div>
  );
}
