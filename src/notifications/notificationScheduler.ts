import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Alarm } from '../domain/alarm';
import { loadSettings } from '../data/settingsRepository';
import { formatOriginalIntent } from '../utils/time';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}

export async function cancelAlarmNotification(notificationId: string | undefined): Promise<void> {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Platform doesn't support real notifications (e.g. web dev preview) — nothing to cancel.
  }
}

/**
 * Syncs a single alarm's scheduled OS notification with its current `enabled`/`nextFireUTC`
 * state: cancels any existing notification, then schedules a fresh one if applicable.
 * Returns the new notification id, or undefined if nothing is scheduled (including on
 * platforms like web where real scheduled notifications aren't supported at all).
 */
export async function scheduleAlarmNotification(alarm: Alarm): Promise<string | undefined> {
  await cancelAlarmNotification(alarm.notificationId);

  if (!alarm.enabled || !alarm.nextFireUTC) return undefined;

  const fireDate = new Date(alarm.nextFireUTC);
  if (fireDate.getTime() <= Date.now()) return undefined;

  const { use24HourClock } = await loadSettings();

  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: alarm.label || 'Alarm',
        body: formatOriginalIntent(alarm, use24HourClock),
        sound: true,
        data: { alarmId: alarm.id },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: fireDate,
      },
    });
  } catch (err) {
    console.warn('Failed to schedule alarm notification', err);
    return undefined;
  }
}
