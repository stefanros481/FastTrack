export interface CompletedSession {
  id: string;
  startedAt: string;
  endedAt: string;
  goalMinutes: number | null;
  notes: string | null;
}
