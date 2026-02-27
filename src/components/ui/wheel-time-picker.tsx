"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  WheelPicker,
  WheelPickerWrapper,
  type WheelPickerOption,
} from "@ncdai/react-wheel-picker";
import "@ncdai/react-wheel-picker/style.css";

interface WheelTimePickerProps {
  value: string; // "HH:MM" format
  onChange: (time: string) => void;
}

function padTwo(n: number): string {
  return n.toString().padStart(2, "0");
}

const hourOptions: WheelPickerOption[] = Array.from({ length: 24 }, (_, i) => ({
  label: padTwo(i),
  value: i.toString(),
}));

const minuteOptions: WheelPickerOption[] = Array.from(
  { length: 60 },
  (_, i) => ({
    label: padTwo(i),
    value: i.toString(),
  })
);

export function WheelTimePicker({ value, onChange }: WheelTimePickerProps) {
  const [open, setOpen] = useState(false);

  const [initialHour, initialMinute] = value.split(":").map(Number);
  const [selectedHour, setSelectedHour] = useState(
    (initialHour || 0).toString()
  );
  const [selectedMinute, setSelectedMinute] = useState(
    (initialMinute || 0).toString()
  );

  const handleOpen = () => {
    const [h, m] = value.split(":").map(Number);
    setSelectedHour((h || 0).toString());
    setSelectedMinute((m || 0).toString());
    setOpen(true);
  };

  const handleConfirm = () => {
    const time = `${padTwo(parseInt(selectedHour))}:${padTwo(parseInt(selectedMinute))}`;
    onChange(time);
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="min-h-11 px-3 rounded-xl bg-[--color-background] text-base border border-slate-200 dark:border-slate-700 transition-all"
      >
        {value || "00:00"}
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black motion-safe:animate-fade-in"
          onClick={handleCancel}
        >
          <div
            className="w-full max-w-md bg-[--color-card] rounded-t-3xl p-4 pb-8 motion-safe:animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handleCancel}
                className="text-[--color-text-muted] text-base font-medium min-h-11 min-w-11 flex items-center justify-center"
              >
                Cancel
              </button>
              <span className="text-base font-semibold text-[--color-text]">
                Select Time
              </span>
              <button
                type="button"
                onClick={handleConfirm}
                className="text-[--color-primary] text-base font-semibold min-h-11 min-w-11 flex items-center justify-center"
              >
                Done
              </button>
            </div>

            <div className="relative max-w-48 mx-auto">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2.5rem] bg-[--color-secondary] rounded-lg pointer-events-none" />
              <WheelPickerWrapper className="w-full relative">
                <WheelPicker
                  options={hourOptions}
                  value={selectedHour}
                  onValueChange={setSelectedHour}
                  infinite
                  classNames={{
                    optionItem:
                      "text-[--color-text-muted] text-base opacity-40",
                    highlightWrapper:
                      "rounded-lg",
                    highlightItem:
                      "font-semibold text-[--color-text] text-base",
                  }}
                />
                <WheelPicker
                  options={minuteOptions}
                  value={selectedMinute}
                  onValueChange={setSelectedMinute}
                  infinite
                  classNames={{
                    optionItem:
                      "text-[--color-text-muted] text-base opacity-40",
                    highlightWrapper:
                      "rounded-lg",
                    highlightItem:
                      "font-semibold text-[--color-text] text-base",
                  }}
                />
              </WheelPickerWrapper>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
