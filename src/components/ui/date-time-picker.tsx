"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  error?: boolean;
  id?: string;
}

function padTwo(n: number): string {
  return n.toString().padStart(2, "0");
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function DateTimePicker({
  value,
  onChange,
  error,
  id,
}: DateTimePickerProps) {
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [timeOpen, setTimeOpen] = React.useState(false);

  const hours = value.getHours();
  const minutes = value.getMinutes();

  const handleDateSelect = (selected: Date | undefined) => {
    if (!selected) return;
    const merged = new Date(selected);
    merged.setHours(hours, minutes, 0, 0);
    onChange(merged);
    setCalendarOpen(false);
  };

  const setTime = (h: number, m: number) => {
    const updated = new Date(value);
    updated.setHours(clamp(h, 0, 23), clamp(m, 0, 59), 0, 0);
    onChange(updated);
  };

  return (
    <div className="flex gap-2" id={id}>
      {/* Date picker */}
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "flex-1 justify-start text-left font-normal min-h-11 rounded-xl",
              error && "border-red-500"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            {format(value, "MMM d, yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            defaultMonth={value}
            onSelect={handleDateSelect}
          />
        </PopoverContent>
      </Popover>

      {/* Time picker — always 24h */}
      <Popover open={timeOpen} onOpenChange={setTimeOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-28 shrink-0 justify-start text-left font-normal min-h-11 rounded-xl tabular-nums",
              error && "border-red-500"
            )}
          >
            <Clock className="mr-2 h-4 w-4 shrink-0" />
            {padTwo(hours)}:{padTwo(minutes)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <label className="text-xs text-muted-foreground mb-1">Hour</label>
              <input
                type="number"
                min={0}
                max={23}
                value={padTwo(hours)}
                onChange={(e) => setTime(parseInt(e.target.value) || 0, minutes)}
                className="w-14 h-10 text-center text-lg font-mono rounded-lg border border-input bg-background text-foreground tabular-nums"
              />
            </div>
            <span className="text-xl font-bold mt-5">:</span>
            <div className="flex flex-col items-center">
              <label className="text-xs text-muted-foreground mb-1">Min</label>
              <input
                type="number"
                min={0}
                max={59}
                value={padTwo(minutes)}
                onChange={(e) => setTime(hours, parseInt(e.target.value) || 0)}
                className="w-14 h-10 text-center text-lg font-mono rounded-lg border border-input bg-background text-foreground tabular-nums"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
