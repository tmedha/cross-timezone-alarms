import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from '../domain/alarm';
import { detectUses24HourClock, getDeviceTimeZone } from '../domain/displayTimeZone';

const STORAGE_KEY = '@cross_timezone_alarms/settings';

export function defaultSettings(): Settings {
  return {
    homeTimeZone: getDeviceTimeZone(),
    displayTimeZoneMode: 'automatic',
    use24HourClock: detectUses24HourClock(),
  };
}

export async function loadSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultSettings();
  try {
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...defaultSettings(), ...parsed };
  } catch {
    return defaultSettings();
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
