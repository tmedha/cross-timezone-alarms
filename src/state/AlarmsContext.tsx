import { DateTime } from 'luxon';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alarm } from '../domain/alarm';
import { computeNextFireUTC } from '../domain/scheduling';
import { loadAlarms, saveAlarms } from '../data/alarmsRepository';

export type NewAlarmInput = Pick<
  Alarm,
  'label' | 'hour' | 'minute' | 'sourceTimeZone' | 'repeatDays' | 'oneTimeDate'
>;

interface AlarmsContextValue {
  alarms: Alarm[];
  isLoaded: boolean;
  addAlarm: (input: NewAlarmInput) => Alarm;
  updateAlarm: (id: string, patch: Partial<NewAlarmInput>) => void;
  deleteAlarm: (id: string) => void;
  setAlarmEnabled: (id: string, enabled: boolean) => void;
  setAlarmNotificationId: (id: string, notificationId: string | undefined) => void;
  resyncSchedules: () => void;
}

const AlarmsContext = createContext<AlarmsContextValue | undefined>(undefined);

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function withRecomputedSchedule(alarm: Alarm): Alarm {
  const nextFireUTC = alarm.enabled ? computeNextFireUTC(alarm, DateTime.utc()) : null;
  return { ...alarm, nextFireUTC };
}

export function AlarmsProvider({ children }: { children: React.ReactNode }) {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadAlarms().then((loaded) => {
      if (!cancelled) {
        setAlarms(loaded);
        setIsLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveAlarms(alarms);
    }
  }, [alarms, isLoaded]);

  const addAlarm = useCallback((input: NewAlarmInput): Alarm => {
    const alarm = withRecomputedSchedule({
      id: generateId(),
      enabled: true,
      nextFireUTC: null,
      createdAt: DateTime.utc().toISO()!,
      ...input,
    });
    setAlarms((prev) => [...prev, alarm]);
    return alarm;
  }, []);

  const updateAlarm = useCallback((id: string, patch: Partial<NewAlarmInput>) => {
    setAlarms((prev) =>
      prev.map((alarm) => (alarm.id === id ? withRecomputedSchedule({ ...alarm, ...patch }) : alarm))
    );
  }, []);

  const deleteAlarm = useCallback((id: string) => {
    setAlarms((prev) => prev.filter((alarm) => alarm.id !== id));
  }, []);

  const setAlarmEnabled = useCallback((id: string, enabled: boolean) => {
    setAlarms((prev) =>
      prev.map((alarm) => (alarm.id === id ? withRecomputedSchedule({ ...alarm, enabled }) : alarm))
    );
  }, []);

  const setAlarmNotificationId = useCallback((id: string, notificationId: string | undefined) => {
    setAlarms((prev) => prev.map((alarm) => (alarm.id === id ? { ...alarm, notificationId } : alarm)));
  }, []);

  // Recomputes nextFireUTC for every enabled alarm against the current instant. Used as a
  // safety net (e.g. on app foreground) to correct drift from being killed across a DST
  // boundary or a long time away, since the scheduling engine must never trust a stale cache.
  const resyncSchedules = useCallback(() => {
    setAlarms((prev) => prev.map((alarm) => (alarm.enabled ? withRecomputedSchedule(alarm) : alarm)));
  }, []);

  const value = useMemo(
    () => ({
      alarms,
      isLoaded,
      addAlarm,
      updateAlarm,
      deleteAlarm,
      setAlarmEnabled,
      setAlarmNotificationId,
      resyncSchedules,
    }),
    [
      alarms,
      isLoaded,
      addAlarm,
      updateAlarm,
      deleteAlarm,
      setAlarmEnabled,
      setAlarmNotificationId,
      resyncSchedules,
    ]
  );

  return <AlarmsContext.Provider value={value}>{children}</AlarmsContext.Provider>;
}

export function useAlarms(): AlarmsContextValue {
  const ctx = useContext(AlarmsContext);
  if (!ctx) throw new Error('useAlarms must be used within an AlarmsProvider');
  return ctx;
}
