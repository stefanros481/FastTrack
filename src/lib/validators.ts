import { z } from "zod";

export const sessionEditSchema = z
  .object({
    sessionId: z.string().min(1),
    startedAt: z.coerce.date(),
    endedAt: z.coerce.date(),
  })
  .refine((data) => data.startedAt < data.endedAt, {
    message: "Start time must be before end time",
    path: ["startedAt"],
  })
  .refine((data) => data.startedAt <= new Date(), {
    message: "Start time cannot be in the future",
    path: ["startedAt"],
  })
  .refine((data) => data.endedAt <= new Date(), {
    message: "End time cannot be in the future",
    path: ["endedAt"],
  });

export type SessionEditInput = z.infer<typeof sessionEditSchema>;

export const noteSchema = z.object({
  sessionId: z.string().min(1),
  note: z.string().max(280).nullable(),
});

export type UpdateNoteInput = z.infer<typeof noteSchema>;

export const deleteSessionSchema = z.object({
  sessionId: z.string().min(1),
});

export type DeleteSessionInput = z.infer<typeof deleteSessionSchema>;

export const goalMinutesSchema = z.number().int().min(60).max(4320);

export const customGoalHoursSchema = z.number().min(1).max(72).positive();

export const themeSchema = z.enum(["dark", "light", "system"]);

export const reminderTimeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Invalid time format. Expected HH:MM")
  .nullable();

export const maxDurationMinutesSchema = z
  .number()
  .int()
  .min(60, "Must be at least 60 minutes (1 hour)")
  .max(4320, "Must be at most 4320 minutes (72 hours)")
  .nullable();

export const activeStartTimeSchema = z
  .object({
    sessionId: z.string().min(1),
    startedAt: z.coerce.date(),
  })
  .refine((data) => data.startedAt <= new Date(), {
    message: "Start time cannot be in the future",
    path: ["startedAt"],
  });
