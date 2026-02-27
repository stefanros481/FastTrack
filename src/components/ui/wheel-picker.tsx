"use client";

import {
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

const ITEM_HEIGHT = 44; // matches min touch target
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface WheelPickerProps {
  items: { value: number | string; label: string }[];
  selectedValue: number | string;
  onChange: (value: number | string) => void;
  label?: ReactNode;
  className?: string;
}

export function WheelPicker({
  items,
  selectedValue,
  onChange,
  label,
  className,
}: WheelPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isUserScrolling = useRef(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout>>();

  const selectedIndex = items.findIndex((i) => i.value === selectedValue);

  // Scroll to selected value on mount and when selectedValue changes externally
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || isUserScrolling.current) return;
    const targetTop = selectedIndex * ITEM_HEIGHT;
    el.scrollTo({ top: targetTop, behavior: "instant" });
  }, [selectedIndex]);

  const handleScroll = useCallback(() => {
    isUserScrolling.current = true;
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    scrollTimeout.current = setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;

      // Snap to nearest item
      const rawIndex = Math.round(el.scrollTop / ITEM_HEIGHT);
      const index = Math.max(0, Math.min(rawIndex, items.length - 1));
      const targetTop = index * ITEM_HEIGHT;

      el.scrollTo({ top: targetTop, behavior: "smooth" });

      const item = items[index];
      if (item && item.value !== selectedValue) {
        onChange(item.value);
      }

      // Reset flag after animation settles
      setTimeout(() => {
        isUserScrolling.current = false;
      }, 150);
    }, 80);
  }, [items, selectedValue, onChange]);

  // Padding elements to allow first/last items to be centered
  const padCount = Math.floor(VISIBLE_ITEMS / 2);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {label && (
        <span className="text-xs text-muted-foreground font-medium mb-1.5 uppercase tracking-wider">
          {label}
        </span>
      )}
      <div
        className="relative overflow-hidden"
        style={{ height: CONTAINER_HEIGHT }}
      >
        {/* Highlight band */}
        <div
          className="absolute left-0 right-0 pointer-events-none z-10 border-y-2 border-indigo-500/40 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-lg"
          style={{
            top: padCount * ITEM_HEIGHT,
            height: ITEM_HEIGHT,
          }}
        />

        {/* Fade overlays */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white dark:from-slate-900 to-transparent pointer-events-none z-20" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none z-20" />

        {/* Scrollable list */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto scrollbar-none"
          style={{
            scrollSnapType: "y mandatory",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Top padding */}
          {Array.from({ length: padCount }).map((_, i) => (
            <div key={`pad-top-${i}`} style={{ height: ITEM_HEIGHT }} />
          ))}

          {items.map((item) => {
            const isSelected = item.value === selectedValue;
            return (
              <div
                key={item.value}
                className={cn(
                  "flex items-center justify-center font-mono text-lg transition-all select-none",
                  isSelected
                    ? "text-slate-900 dark:text-white font-bold scale-105"
                    : "text-slate-400 dark:text-slate-600 scale-95"
                )}
                style={{
                  height: ITEM_HEIGHT,
                  scrollSnapAlign: "center",
                }}
              >
                {item.label}
              </div>
            );
          })}

          {/* Bottom padding */}
          {Array.from({ length: padCount }).map((_, i) => (
            <div key={`pad-bot-${i}`} style={{ height: ITEM_HEIGHT }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Hide scrollbar utility (cross-browser)
const scrollbarStyle = `
.scrollbar-none::-webkit-scrollbar { display: none; }
.scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
`;

export function WheelPickerStyles() {
  return <style dangerouslySetInnerHTML={{ __html: scrollbarStyle }} />;
}
