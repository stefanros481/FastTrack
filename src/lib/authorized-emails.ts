/**
 * Edge-compatible utility for parsing and validating the AUTHORIZED_EMAILS allowlist.
 * No Prisma or Node.js-only imports — safe for middleware (edge runtime).
 */

const MAX_AUTHORIZED_EMAILS = 5;

/**
 * Parses the authorized email list from environment variables.
 * Checks AUTHORIZED_EMAILS (plural) first, falls back to AUTHORIZED_EMAIL (singular).
 * Returns up to 5 trimmed, lowercased, deduplicated emails.
 */
export function getAuthorizedEmails(): string[] {
  const raw =
    process.env.AUTHORIZED_EMAILS || process.env.AUTHORIZED_EMAIL || "";

  const emails = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);

  // Deduplicate preserving order
  const unique = [...new Set(emails)];

  return unique.slice(0, MAX_AUTHORIZED_EMAILS);
}

/**
 * Checks if a given email is in the authorized allowlist.
 * Comparison is case-insensitive with whitespace trimmed.
 */
export function isAuthorizedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAuthorizedEmails().includes(email.toLowerCase().trim());
}
