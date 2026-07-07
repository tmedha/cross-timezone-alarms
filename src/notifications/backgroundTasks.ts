import { DateTime } from 'luxon';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { loadAlarms, saveAlarms } from '../data/alarmsRepository';
import { computeNextFireUTC } from '../domain/scheduling';
import { scheduleAlarmNotification } from './notificationScheduler';

export const BACKGROUND_NOTIFICATION_TASK = 'cross-timezone-alarms/background-notification-task';

/**
 * When a scheduled notification fires while the app is backgrounded (not foreground, not
 * killed), this reconciles storage directly: recurring alarms get their next occurrence
 * recomputed and rescheduled; one-time alarms are disabled. There is no React state to update
 * here, so it reads/writes AsyncStorage via the same repository the UI uses.
 */
async function reconcileFiredAlarm(alarmId: string): Promise<void> {
  const alarms = await loadAlarms();
  const index = alarms.findIndex((a) => a.id === alarmId);
  if (index === -1) return;

  const alarm = alarms[index];
  const isRecurring = alarm.repeatDays.length > 0;
  const updated = isRecurring
    ? { ...alarm, nextFireUTC: computeNextFireUTC(alarm, DateTime.utc()) }
    : { ...alarm, enabled: false, nextFireUTC: null };

  updated.notificationId = await scheduleAlarmNotification(updated);
  alarms[index] = updated;
  await saveAlarms(alarms);
}

function extractAlarmId(data: unknown): string | undefined {
  const notification = (data as { notification?: { request?: { content?: { data?: { alarmId?: string } } } } } | undefined)
    ?.notification;
  return notification?.request?.content?.data?.alarmId;
}

if (!TaskManager.isTaskDefined(BACKGROUND_NOTIFICATION_TASK)) {
  TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
    if (error) return;
    const alarmId = extractAlarmId(data);
    if (alarmId) await reconcileFiredAlarm(alarmId);
  });
}

export function registerBackgroundNotificationTask(): void {
  Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch(() => {
    // Best-effort: some dev/runtime environments don't support background task registration.
  });
}
