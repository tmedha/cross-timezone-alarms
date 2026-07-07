export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday .. 6 = Saturday

export interface Alarm {
  id: string;
  label: string;
  hour: number; // intended wall-clock hour in sourceTimeZone, 0-23
  minute: number; // 0-59
  sourceTimeZone: string; // IANA zone, e.g. "America/Chicago"
  repeatDays: Weekday[]; // empty array means one-time
  oneTimeDate?: string; // "YYYY-MM-DD" in sourceTimeZone, required when repeatDays is empty
  enabled: boolean;
  nextFireUTC: string | null; // cached ISO instant, recomputed on save/fire/edit
  notificationId?: string; // id returned by expo-notifications for the currently scheduled fire
  createdAt: string;
}

export type DisplayTimeZoneMode = 'automatic' | 'manual' | 'simulator';

export interface Settings {
  homeTimeZone: string; // IANA zone; user's fixed "home base"
  displayTimeZoneMode: DisplayTimeZoneMode;
  manualTimeZone?: string; // IANA zone, used when mode === 'manual'
  simulatorTimeZone?: string; // IANA zone, used when mode === 'simulator'
}

export function isRecurring(alarm: Pick<Alarm, 'repeatDays'>): boolean {
  return alarm.repeatDays.length > 0;
}
