import { DateTime } from 'luxon';
import { Alarm } from '../domain/alarm';
import { getZoneLabel } from '../data/timezoneCities';

export function formatOriginalIntent(alarm: Alarm): string {
  const time = DateTime.fromObject({ hour: alarm.hour, minute: alarm.minute });
  return `${time.toFormat('h:mm a')} · ${getZoneLabel(alarm.sourceTimeZone)}`;
}

export function formatConvertedTime(
  nextFireUTC: string | null,
  displayTimeZone: string,
  now: DateTime
): string {
  if (!nextFireUTC) return 'Not scheduled';

  const fireInstant = DateTime.fromISO(nextFireUTC, { zone: 'utc' }).setZone(displayTimeZone);
  const nowInDisplay = now.setZone(displayTimeZone);

  let dayLabel: string;
  if (fireInstant.hasSame(nowInDisplay, 'day')) {
    dayLabel = 'today';
  } else if (fireInstant.hasSame(nowInDisplay.plus({ days: 1 }), 'day')) {
    dayLabel = 'tomorrow';
  } else {
    dayLabel = fireInstant.toFormat('ccc, LLL d');
  }

  return `${fireInstant.toFormat('h:mm a')} ${dayLabel}, ${fireInstant.offsetNameShort}`;
}

export function formatCountdown(nextFireUTC: string | null, now: DateTime): string {
  if (!nextFireUTC) return 'Not scheduled';

  const diffMs = DateTime.fromISO(nextFireUTC, { zone: 'utc' }).toMillis() - now.toMillis();
  if (diffMs <= 0) return 'Ringing…';

  const totalMinutes = Math.round(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return hours > 0 ? `Rings in ${hours}h ${minutes}m` : `Rings in ${minutes}m`;
}

export function formatClock(zone: string, now: DateTime): string {
  return now.setZone(zone).toFormat('h:mm:ss a');
}

export function formatZoneDateLabel(zone: string, now: DateTime): string {
  return now.setZone(zone).toFormat('ccc, LLL d');
}

/** Formats a JS Date's calendar fields as "YYYY-MM-DD" using its local getters (no zone conversion). */
export function toISODateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
