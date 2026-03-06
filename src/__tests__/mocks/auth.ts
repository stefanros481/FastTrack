import { vi } from "vitest";

export const mockAuth = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

export function mockAuthenticated(userId = "test-user-id") {
  mockAuth.mockResolvedValue({
    user: { id: userId, email: "test@example.com" },
  });
}

export function mockUnauthenticated() {
  mockAuth.mockResolvedValue(null);
}
