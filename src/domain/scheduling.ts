import { DateTime } from 'luxon';
import { Alarm, Weekday } from './alarm';

// Enough days to guarantee we find a match for any non-empty repeatDays set.
const DAYS_TO_SEARCH = 8;

/**
 * Computes the next absolute instant (in `now`'s zone, convert with .toUTC() as needed)
 * at which `alarm` should fire, given the current instant `now`.
 *
 * The wall-clock hour/minute is always resolved against `alarm.sourceTimeZone`, so the
 * same alarm produces a different UTC instant across a DST boundary in that zone —
 * this must be recomputed per-occurrence, never cached as a fixed offset.
 */
export function computeNextFireInstant(alarm: Alarm, now: DateTime): DateTime | null {
  const nowInSource = now.setZone(alarm.sourceTimeZone);

  if (alarm.repeatDays.length === 0) {
    if (!alarm.oneTimeDate) return null;
    const candidate = DateTime.fromISO(alarm.oneTimeDate, { zone: alarm.sourceTimeZone }).set({
      hour: alarm.hour,
      minute: alarm.minute,
      second: 0,
      millisecond: 0,
    });
    if (!candidate.isValid) return null;
    return candidate.toMillis() > now.toMillis() ? candidate : null;
  }

  for (let offset = 0; offset < DAYS_TO_SEARCH; offset++) {
    const candidateDay = nowInSource.startOf('day').plus({ days: offset });
    const weekday = (candidateDay.weekday % 7) as Weekday; // Luxon Mon=1..Sun=7 -> our Sun=0..Sat=6

    if (!alarm.repeatDays.includes(weekday)) continue;

    const candidate = candidateDay.set({
      hour: alarm.hour,
      minute: alarm.minute,
      second: 0,
      millisecond: 0,
    });

    if (candidate.toMillis() > now.toMillis()) {
      return candidate;
    }
  }

  return null;
}

/** Convenience wrapper returning the ISO UTC instant string stored on the Alarm record. */
export function computeNextFireUTC(alarm: Alarm, now: DateTime): string | null {
  const next = computeNextFireInstant(alarm, now);
  return next ? next.toUTC().toISO() : null;
}
