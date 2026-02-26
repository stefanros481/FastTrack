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
