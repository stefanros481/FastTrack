"use client";

import { useTransition } from "react";
import { Moon, Monitor, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { updateTheme } from "@/app/actions/settings";

const THEME_OPTIONS = [
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
  { value: "light" as const, label: "Light", icon: Sun },
];

interface ThemeSelectorProps {
  currentTheme: string;
}

export default function ThemeSelector({ currentTheme }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();

  const activeTheme = theme || currentTheme;

  const handleSelect = (value: "dark" | "system" | "light") => {
    setTheme(value);
    startTransition(async () => {
      await updateTheme(value);
    });
  };

  return (
    <div>
      <p className="text-base text-[--color-text] mb-3">Theme</p>
      <div className="flex rounded-full bg-[--color-background] p-1">
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
          const isActive = activeTheme === value;
          return (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              disabled={isPending}
              className={`flex-1 flex items-center justify-center gap-2 min-h-11 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? "bg-[--color-primary] text-white shadow-sm"
                  : "text-[--color-text-muted]"
              } ${isPending ? "opacity-60" : ""}`}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
