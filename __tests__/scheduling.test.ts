import { DateTime } from 'luxon';
import { Alarm } from '../src/domain/alarm';
import { computeNextFireInstant, computeNextFireUTC } from '../src/domain/scheduling';

function baseAlarm(overrides: Partial<Alarm> = {}): Alarm {
  return {
    id: 'test-alarm',
    label: 'Test',
    hour: 18,
    minute: 0,
    sourceTimeZone: 'America/Chicago',
    repeatDays: [],
    enabled: true,
    nextFireUTC: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('computeNextFireInstant', () => {
  it('converts 6:00 PM America/Chicago to 4:30 AM Asia/Kolkata the next day (the motivating example)', () => {
    const alarm = baseAlarm({
      hour: 18,
      minute: 0,
      sourceTimeZone: 'America/Chicago',
      repeatDays: [],
      oneTimeDate: '2026-07-08',
    });
    const now = DateTime.fromISO('2026-07-08T00:00:00', { zone: 'America/Chicago' });

    const next = computeNextFireInstant(alarm, now);
    expect(next).not.toBeNull();

    const inIndia = next!.setZone('Asia/Kolkata');
    expect(inIndia.hour).toBe(4);
    expect(inIndia.minute).toBe(30);
  });

  it('keeps firing at 6:00 PM local time across the US spring-forward DST boundary, shifting the UTC instant by an hour', () => {
    const alarm = baseAlarm({
      hour: 18,
      minute: 0,
      sourceTimeZone: 'America/Chicago',
      repeatDays: [0, 1, 2, 3, 4, 5, 6], // every day
    });

    // Before spring-forward (2026-03-08 in the US): CST = UTC-6
    const beforeDst = DateTime.fromISO('2026-03-01T12:00:00', { zone: 'America/Chicago' });
    const beforeNext = computeNextFireInstant(alarm, beforeDst)!;
    expect(beforeNext.setZone('America/Chicago').hour).toBe(18);
    expect(beforeNext.offset).toBe(-6 * 60);

    // After spring-forward: CDT = UTC-5
    const afterDst = DateTime.fromISO('2026-03-15T12:00:00', { zone: 'America/Chicago' });
    const afterNext = computeNextFireInstant(alarm, afterDst)!;
    expect(afterNext.setZone('America/Chicago').hour).toBe(18);
    expect(afterNext.offset).toBe(-5 * 60);

    // The UTC instant for "6 PM local" genuinely shifted by an hour across the boundary.
    expect(afterNext.toUTC().hour).not.toBe(beforeNext.toUTC().hour);
  });

  it('keeps firing at 6:00 PM local time across the US fall-back DST boundary', () => {
    const alarm = baseAlarm({
      hour: 18,
      minute: 0,
      sourceTimeZone: 'America/Chicago',
      repeatDays: [0, 1, 2, 3, 4, 5, 6],
    });

    const beforeFallBack = DateTime.fromISO('2026-10-25T12:00:00', { zone: 'America/Chicago' });
    const beforeNext = computeNextFireInstant(alarm, beforeFallBack)!;
    expect(beforeNext.offset).toBe(-5 * 60); // still CDT

    const afterFallBack = DateTime.fromISO('2026-11-05T12:00:00', { zone: 'America/Chicago' });
    const afterNext = computeNextFireInstant(alarm, afterFallBack)!;
    expect(afterNext.offset).toBe(-6 * 60); // back to CST

    expect(afterNext.setZone('America/Chicago').hour).toBe(18);
    expect(beforeNext.setZone('America/Chicago').hour).toBe(18);
  });

  it('skips non-selected weekdays and picks the next valid recurrence day', () => {
    // Mon/Wed/Fri only
    const alarm = baseAlarm({
      hour: 7,
      minute: 0,
      sourceTimeZone: 'America/Chicago',
      repeatDays: [1, 3, 5],
    });

    // 2026-07-07 is a Tuesday.
    const now = DateTime.fromISO('2026-07-07T08:00:00', { zone: 'America/Chicago' });
    const next = computeNextFireInstant(alarm, now)!;
    const nextLocal = next.setZone('America/Chicago');

    expect(nextLocal.weekday).toBe(3); // Wednesday (Luxon Mon=1..Sun=7)
    expect(nextLocal.day).toBe(8);
    expect(nextLocal.hour).toBe(7);
  });

  it('fires today if the scheduled time has not yet passed, on a matching recurrence day', () => {
    const alarm = baseAlarm({
      hour: 20,
      minute: 0,
      sourceTimeZone: 'America/Chicago',
      repeatDays: [0, 1, 2, 3, 4, 5, 6],
    });

    const now = DateTime.fromISO('2026-07-07T08:00:00', { zone: 'America/Chicago' });
    const next = computeNextFireInstant(alarm, now)!;
    const nextLocal = next.setZone('America/Chicago');

    expect(nextLocal.day).toBe(7);
    expect(nextLocal.hour).toBe(20);
  });

  it('rolls to the next occurrence if the scheduled time today has already passed', () => {
    const alarm = baseAlarm({
      hour: 6,
      minute: 0,
      sourceTimeZone: 'America/Chicago',
      repeatDays: [0, 1, 2, 3, 4, 5, 6],
    });

    const now = DateTime.fromISO('2026-07-07T08:00:00', { zone: 'America/Chicago' });
    const next = computeNextFireInstant(alarm, now)!;
    const nextLocal = next.setZone('America/Chicago');

    expect(nextLocal.day).toBe(8);
    expect(nextLocal.hour).toBe(6);
  });

  it('treats a one-time alarm with a past date/time as already fired', () => {
    const alarm = baseAlarm({
      hour: 6,
      minute: 0,
      sourceTimeZone: 'America/Chicago',
      repeatDays: [],
      oneTimeDate: '2026-01-01',
    });

    const now = DateTime.fromISO('2026-07-07T08:00:00', { zone: 'America/Chicago' });
    expect(computeNextFireInstant(alarm, now)).toBeNull();
  });

  it('returns null for a one-time alarm with no oneTimeDate set', () => {
    const alarm = baseAlarm({ repeatDays: [], oneTimeDate: undefined });
    const now = DateTime.fromISO('2026-07-07T08:00:00', { zone: 'America/Chicago' });
    expect(computeNextFireInstant(alarm, now)).toBeNull();
  });
});

describe('computeNextFireUTC', () => {
  it('returns an ISO UTC string', () => {
    const alarm = baseAlarm({
      hour: 18,
      minute: 0,
      sourceTimeZone: 'America/Chicago',
      repeatDays: [],
      oneTimeDate: '2026-07-08',
    });
    const now = DateTime.fromISO('2026-07-08T00:00:00', { zone: 'America/Chicago' });

    const result = computeNextFireUTC(alarm, now);
    expect(result).toMatch(/Z$/);
    expect(DateTime.fromISO(result!).isValid).toBe(true);
  });
});
