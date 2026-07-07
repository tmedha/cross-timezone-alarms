import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm } from '../domain/alarm';

const STORAGE_KEY = '@cross_timezone_alarms/alarms';

export async function loadAlarms(): Promise<Alarm[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Alarm[]) : [];
  } catch {
    return [];
  }
}

export async function saveAlarms(alarms: Alarm[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
}
