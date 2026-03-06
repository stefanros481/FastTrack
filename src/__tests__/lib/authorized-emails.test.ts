import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getAuthorizedEmails,
  isAuthorizedEmail,
} from "@/lib/authorized-emails";

describe("getAuthorizedEmails", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.AUTHORIZED_EMAILS;
    delete process.env.AUTHORIZED_EMAIL;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("parses comma-separated AUTHORIZED_EMAILS", () => {
    process.env.AUTHORIZED_EMAILS = "a@test.com,b@test.com";
    expect(getAuthorizedEmails()).toEqual(["a@test.com", "b@test.com"]);
  });

  it("falls back to AUTHORIZED_EMAIL (singular)", () => {
    process.env.AUTHORIZED_EMAIL = "single@test.com";
    expect(getAuthorizedEmails()).toEqual(["single@test.com"]);
  });

  it("prefers AUTHORIZED_EMAILS over AUTHORIZED_EMAIL", () => {
    process.env.AUTHORIZED_EMAILS = "plural@test.com";
    process.env.AUTHORIZED_EMAIL = "singular@test.com";
    expect(getAuthorizedEmails()).toEqual(["plural@test.com"]);
  });

  it("returns empty array when no env vars set", () => {
    expect(getAuthorizedEmails()).toEqual([]);
  });

  it("trims whitespace", () => {
    process.env.AUTHORIZED_EMAILS = " a@test.com , b@test.com ";
    expect(getAuthorizedEmails()).toEqual(["a@test.com", "b@test.com"]);
  });

  it("lowercases emails", () => {
    process.env.AUTHORIZED_EMAILS = "User@Test.COM";
    expect(getAuthorizedEmails()).toEqual(["user@test.com"]);
  });

  it("deduplicates emails", () => {
    process.env.AUTHORIZED_EMAILS = "a@test.com,A@Test.com,a@test.com";
    expect(getAuthorizedEmails()).toEqual(["a@test.com"]);
  });

  it("caps at 5 emails", () => {
    process.env.AUTHORIZED_EMAILS =
      "a@t.com,b@t.com,c@t.com,d@t.com,e@t.com,f@t.com";
    expect(getAuthorizedEmails()).toHaveLength(5);
  });

  it("filters empty entries from trailing commas", () => {
    process.env.AUTHORIZED_EMAILS = "a@test.com,,b@test.com,";
    expect(getAuthorizedEmails()).toEqual(["a@test.com", "b@test.com"]);
  });
});

describe("isAuthorizedEmail", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.AUTHORIZED_EMAILS = "user@example.com,admin@example.com";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns true for authorized email", () => {
    expect(isAuthorizedEmail("user@example.com")).toBe(true);
  });

  it("returns false for unauthorized email", () => {
    expect(isAuthorizedEmail("stranger@example.com")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(isAuthorizedEmail("USER@Example.COM")).toBe(true);
  });

  it("trims whitespace", () => {
    expect(isAuthorizedEmail("  user@example.com  ")).toBe(true);
  });

  it("returns false for null", () => {
    expect(isAuthorizedEmail(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isAuthorizedEmail(undefined)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isAuthorizedEmail("")).toBe(false);
  });
});
