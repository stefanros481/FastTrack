"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  WheelPicker,
  WheelPickerWrapper,
  type WheelPickerOption,
} from "@ncdai/react-wheel-picker";
import "@ncdai/react-wheel-picker/style.css";
import { format, subDays, startOfDay } from "date-fns";

interface WheelDateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  maxDate?: Date;
  error?: boolean;
}

function padTwo(n: number): string {
  return n.toString().padStart(2, "0");
}

function generateDateOptions(maxDate?: Date): WheelPickerOption[] {
  const end = maxDate ? startOfDay(maxDate) : startOfDay(new Date());
  const options: WheelPickerOption[] = [];
  for (let i = 89; i >= 0; i--) {
    const d = subDays(end, i);
    options.push({
      label: format(d, "MMM d"),
      value: format(d, "yyyy-MM-dd"),
    });
  }
  return options;
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

export function WheelDateTimePicker({
  value,
  onChange,
  maxDate,
  error,
}: WheelDateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    format(value, "yyyy-MM-dd")
  );
  const [selectedHour, setSelectedHour] = useState(
    value.getHours().toString()
  );
  const [selectedMinute, setSelectedMinute] = useState(
    value.getMinutes().toString()
  );

  const dateOptions = useMemo(() => generateDateOptions(maxDate), [maxDate]);

  const handleOpen = () => {
    setSelectedDate(format(value, "yyyy-MM-dd"));
    setSelectedHour(value.getHours().toString());
    setSelectedMinute(value.getMinutes().toString());
    setOpen(true);
  };

  const handleConfirm = () => {
    const [year, month, day] = selectedDate.split("-").map(Number);
    let hour = parseInt(selectedHour);
    let minute = parseInt(selectedMinute);

    const result = new Date(year, month - 1, day, hour, minute, 0, 0);

    if (maxDate && result > maxDate) {
      hour = maxDate.getHours();
      minute = maxDate.getMinutes();
      const clamped = new Date(year, month - 1, day, hour, minute, 0, 0);
      onChange(clamped);
    } else {
      onChange(result);
    }
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
        className={`w-full text-left min-h-11 px-4 py-2 rounded-xl bg-[--color-background] text-base border ${
          error
            ? "border-red-500"
            : "border-slate-200 dark:border-slate-700"
        } transition-all`}
      >
        {format(value, "MMM d, yyyy")} &middot; {padTwo(value.getHours())}:
        {padTwo(value.getMinutes())}
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 motion-safe:animate-fade-in"
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
                Select Date & Time
              </span>
              <button
                type="button"
                onClick={handleConfirm}
                className="text-[--color-primary] text-base font-semibold min-h-11 min-w-11 flex items-center justify-center"
              >
                Done
              </button>
            </div>

            <div className="relative">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2.5rem] bg-[--color-secondary] rounded-lg pointer-events-none" />
              <WheelPickerWrapper className="w-full relative">
                <WheelPicker
                  options={dateOptions}
                  value={selectedDate}
                  onValueChange={setSelectedDate}
                  classNames={{
                    optionItem:
                      "text-[--color-text-muted] text-base",
                    highlightWrapper:
                      "rounded-lg",
                    highlightItem:
                      "font-semibold text-[--color-text] text-base",
                  }}
                />
                <WheelPicker
                  options={hourOptions}
                  value={selectedHour}
                  onValueChange={setSelectedHour}
                  infinite
                  classNames={{
                    optionItem:
                      "text-[--color-text-muted] text-base",
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
                      "text-[--color-text-muted] text-base",
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
