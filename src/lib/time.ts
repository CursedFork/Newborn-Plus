/**
 * Produces a `datetime-local` input value matching the user's local clock.
 * `toISOString()` is always UTC, which shows the wrong time in a datetime-local
 * input — this offsets by the browser's UTC offset to produce a local string.
 */
export function toLocalInputValue(d: Date = new Date()): string {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

/** Returns the user's IANA timezone name (e.g. "America/New_York"). */
export function localTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/** Parses a date-only string (YYYY-MM-DD) at local noon to avoid UTC midnight
 *  shifting the date by one day in behind-UTC timezones. */
export function parseDateSafe(dateStr: string): Date {
  return new Date(dateStr + 'T12:00:00Z')
}
