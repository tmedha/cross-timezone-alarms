import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { Alarm } from '../domain/alarm';
import { useAlarms } from '../state/AlarmsContext';
import { registerBackgroundNotificationTask } from './backgroundTasks';
import { cancelAlarmNotification, requestNotificationPermissions, scheduleAlarmNotification } from './notificationScheduler';

/**
 * Keeps each alarm's real OS-scheduled notification in sync with app state: schedules/cancels
 * on create/edit/toggle/delete, resyncs everything on foreground (DST/drift safety net), and
 * reconciles recurring alarms' next occurrence when a notification fires while foregrounded.
 */
export function useNotificationSync(): void {
  const { alarms, isLoaded, setAlarmNotificationId, setAlarmEnabled, resyncSchedules } = useAlarms();
  const syncedSignatures = useRef<Map<string, string>>(new Map());
  const previousAlarms = useRef<Map<string, Alarm>>(new Map());

  useEffect(() => {
    requestNotificationPermissions();
    registerBackgroundNotificationTask();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') resyncSchedules();
    });
    return () => subscription.remove();
  }, [resyncSchedules]);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const alarmId = notification.request.content.data?.alarmId as string | undefined;
      if (!alarmId) return;
      const alarm = alarms.find((a) => a.id === alarmId);
      if (!alarm) return;
      if (alarm.repeatDays.length > 0) {
        resyncSchedules();
      } else {
        setAlarmEnabled(alarmId, false);
      }
    });
    return () => subscription.remove();
  }, [alarms, resyncSchedules, setAlarmEnabled]);

  useEffect(() => {
    if (!isLoaded) return;

    (async () => {
      const currentIds = new Set(alarms.map((a) => a.id));

      for (const [id, prevAlarm] of previousAlarms.current) {
        if (!currentIds.has(id)) {
          await cancelAlarmNotification(prevAlarm.notificationId);
          syncedSignatures.current.delete(id);
        }
      }

      for (const alarm of alarms) {
        const signature = `${alarm.enabled}|${alarm.nextFireUTC}`;
        if (syncedSignatures.current.get(alarm.id) === signature) continue;

        const notificationId = await scheduleAlarmNotification(alarm);
        syncedSignatures.current.set(alarm.id, signature);
        if (notificationId !== alarm.notificationId) {
          setAlarmNotificationId(alarm.id, notificationId);
        }
      }

      previousAlarms.current = new Map(alarms.map((a) => [a.id, a]));
    })();
  }, [alarms, isLoaded, setAlarmNotificationId]);
}
