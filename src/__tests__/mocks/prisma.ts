import { vi } from "vitest";

export const mockPrisma = {
  fastingSession: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  userSettings: {
    findUnique: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));
