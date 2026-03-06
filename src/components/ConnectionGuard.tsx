"use client";

import { useState, useEffect, useRef, cloneElement, isValidElement, type ReactElement } from "react";
import { useConnection } from "@/contexts/ConnectionContext";

interface ConnectionGuardProps {
  children: ReactElement<{ disabled?: boolean; className?: string }>;
}

export default function ConnectionGuard({ children }: ConnectionGuardProps) {
  const status = useConnection();
  const isDisabled = status !== "online";
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isDisabled && showTooltip) {
      setShowTooltip(false);
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
        tooltipTimeoutRef.current = null;
      }
    }
  }, [isDisabled, showTooltip]);

  const handleClick = (e: React.MouseEvent) => {
    if (!isDisabled) return;
    e.preventDefault();
    e.stopPropagation();

    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    setShowTooltip(true);
    tooltipTimeoutRef.current = setTimeout(() => setShowTooltip(false), 2000);
  };

  if (!isValidElement(children)) return children;

  return (
    <div ref={containerRef} className="relative inline-flex" onClick={handleClick}>
      {cloneElement(children, {
        disabled: isDisabled || children.props.disabled,
      })}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-slate-800 dark:bg-slate-700 text-white text-xs whitespace-nowrap z-50 motion-safe:animate-fade-in">
          System connecting, please wait...
        </div>
      )}
    </div>
  );
}
