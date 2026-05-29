/**
 * Extract a user-facing message from a thrown value, falling back to a
 * Croatian default if `err` isn't an Error.
 */
export function toErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}
