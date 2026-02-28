"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  error?: boolean;
  id?: string;
}

export function DateTimePicker({
  value,
  onChange,
  error,
  id,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const hourRef = React.useRef<HTMLButtonElement>(null);
  const minuteRef = React.useRef<HTMLButtonElement>(null);

  const selectedHour = value.getHours();
  const selectedMinute = Math.floor(value.getMinutes() / 5) * 5;

  const handleDateSelect = (selected: Date | undefined) => {
    if (!selected) return;
    const merged = new Date(selected);
    merged.setHours(value.getHours(), value.getMinutes(), 0, 0);
    onChange(merged);
  };

  const handleTimeChange = (type: "hour" | "minute", val: string) => {
    const updated = new Date(value);
    if (type === "hour") {
      updated.setHours(parseInt(val));
    } else {
      updated.setMinutes(parseInt(val));
    }
    onChange(updated);
  };

  React.useEffect(() => {
    if (isOpen) {
      hourRef.current?.scrollIntoView({ block: "center" });
      minuteRef.current?.scrollIntoView({ block: "center" });
    }
  }, [isOpen]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal min-h-11",
            error && "border-red-500"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {format(value, "MMM d, yyyy HH:mm")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[110]">
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={value}
            defaultMonth={value}
            onSelect={handleDateSelect}
          />
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            {/* Hours column */}
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {Array.from({ length: 24 }, (_, i) => i)
                  .reverse()
                  .map((hour) => {
                    const isSelected = selectedHour === hour;
                    return (
                      <Button
                        key={hour}
                        ref={isSelected ? hourRef : undefined}
                        size="icon"
                        variant={isSelected ? "default" : "ghost"}
                        className="sm:w-full shrink-0 aspect-square min-h-11 min-w-11"
                        onClick={() =>
                          handleTimeChange("hour", hour.toString())
                        }
                      >
                        {hour}
                      </Button>
                    );
                  })}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            {/* Minutes column */}
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => {
                  const isSelected = selectedMinute === minute;
                  return (
                    <Button
                      key={minute}
                      ref={isSelected ? minuteRef : undefined}
                      size="icon"
                      variant={isSelected ? "default" : "ghost"}
                      className="sm:w-full shrink-0 aspect-square min-h-11 min-w-11"
                      onClick={() =>
                        handleTimeChange("minute", minute.toString())
                      }
                    >
                      {minute.toString().padStart(2, "0")}
                    </Button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
