import { vi } from "vitest";

export const mockRevalidatePath = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));
