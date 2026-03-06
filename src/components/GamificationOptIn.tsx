"use client";

import { useTransition } from "react";
import { updateGamificationSettings } from "@/app/actions/settings";
import { FEATURE_TOGGLES } from "@/components/GamificationSettings";

interface GamificationOptInProps {
  onChoice: (enabled: boolean) => void;
}

export default function GamificationOptIn({ onChoice }: GamificationOptInProps) {
  const [isPending, startTransition] = useTransition();

  const handleChoice = (enabled: boolean) => {
    onChoice(enabled);
    startTransition(async () => {
      await updateGamificationSettings({ enabled });
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-6">
      <div className="w-full max-w-sm bg-[--color-card] rounded-2xl p-6 motion-safe:animate-slide-up">
        <h2 className="text-xl font-semibold text-[--color-text] text-center mb-2">
          Join the Community?
        </h2>
        <p className="text-sm text-[--color-text-muted] text-center mb-6">
          Track your progress alongside others with social features:
        </p>

        <div className="space-y-3 mb-6">
          {FEATURE_TOGGLES.map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[--color-primary-light] dark:bg-[--color-primary]/10">
                <Icon size={18} className="text-[--color-primary]" />
              </div>
              <span className="text-sm text-[--color-text]">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleChoice(true)}
            disabled={isPending}
            className="w-full min-h-11 rounded-full bg-[--color-primary] text-white font-semibold text-base transition-all active:scale-95 hover:bg-[--color-primary-dark] disabled:opacity-60"
          >
            Join In
          </button>
          <button
            onClick={() => handleChoice(false)}
            disabled={isPending}
            className="w-full min-h-11 rounded-full bg-transparent text-[--color-text-muted] font-medium text-sm transition-all active:scale-95"
          >
            No Thanks
          </button>
        </div>

        <p className="text-xs text-[--color-text-muted] text-center mt-4">
          You can change this anytime in Settings
        </p>
      </div>
    </div>
  );
}
