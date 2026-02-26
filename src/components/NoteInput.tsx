"use client";

import { useState, useTransition, useRef } from "react";
import { updateNote } from "@/app/actions/fasting";
import { noteSchema } from "@/lib/validators";

interface Props {
  sessionId: string;
  initialNote: string | null;
  onSaved?: () => void;
}

export default function NoteInput({ sessionId, initialNote, onSaved }: Props) {
  const [note, setNote] = useState(initialNote ?? "");
  const [isPending, startTransition] = useTransition();
  const [showSaved, setShowSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const charCount = note.length;
  const isWarning = charCount >= 260;

  const handleBlur = () => {
    const trimmed = note.trim();
    const noteValue = trimmed === "" ? null : trimmed;
    const initialTrimmed = (initialNote ?? "").trim();
    const initialValue = initialTrimmed === "" ? null : initialTrimmed;

    // Dirty check — skip save if unchanged
    if (noteValue === initialValue) return;

    // Client-side Zod validation
    const parsed = noteSchema.safeParse({ sessionId, note: noteValue });
    if (!parsed.success) {
      setError("Note must be 280 characters or less");
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await updateNote(sessionId, noteValue);
      if (result.success) {
        if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
        setShowSaved(true);
        savedTimeoutRef.current = setTimeout(() => setShowSaved(false), 1500);
        onSaved?.();
      } else {
        setError(result.error);
      }
    });
  };

  // Note: navigating away before blur may lose unsaved text (accepted per spec edge case)

  return (
    <div className="space-y-1">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={handleBlur}
        maxLength={280}
        placeholder="Add a note..."
        className="w-full rounded-xl bg-[--color-background] text-[--color-text] text-base p-4 min-h-11 resize-none border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        rows={3}
      />
      <div className="flex items-center justify-between px-1">
        <div className="text-sm min-h-5">
          {isPending && (
            <span className="text-[--color-text-muted]">Saving...</span>
          )}
          {showSaved && !isPending && (
            <span className="text-[--color-success]">Saved</span>
          )}
          {error && <span className="text-[--color-error]">{error}</span>}
        </div>
        <span
          className={`text-sm ${isWarning ? "text-[--color-error]" : "text-[--color-text-muted]"}`}
        >
          {charCount}/280
        </span>
      </div>
    </div>
  );
}
