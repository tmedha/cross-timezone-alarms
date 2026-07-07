import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { DisplayTimeZoneMode, Settings } from '../domain/alarm';
import { getDeviceTimeZone, resolveDisplayTimeZone } from '../domain/displayTimeZone';
import { defaultSettings, loadSettings, saveSettings } from '../data/settingsRepository';

interface SettingsContextValue {
  settings: Settings;
  isLoaded: boolean;
  deviceTimeZone: string;
  displayTimeZone: string;
  setHomeTimeZone: (zone: string) => void;
  setDisplayTimeZoneMode: (mode: DisplayTimeZoneMode) => void;
  setManualTimeZone: (zone: string) => void;
  setSimulatorTimeZone: (zone: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);
  const [deviceTimeZone, setDeviceTimeZone] = useState(getDeviceTimeZone);

  useEffect(() => {
    let cancelled = false;
    loadSettings().then((loaded) => {
      if (!cancelled) {
        setSettings(loaded);
        setIsLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveSettings(settings);
    }
  }, [settings, isLoaded]);

  // Re-read the device zone whenever the app returns to foreground, so "Automatic"
  // mode picks up real travel (a new SIM/network timezone) without a restart.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setDeviceTimeZone(getDeviceTimeZone());
      }
    });
    return () => subscription.remove();
  }, []);

  const setHomeTimeZone = useCallback((zone: string) => {
    setSettings((prev) => ({ ...prev, homeTimeZone: zone }));
  }, []);

  const setDisplayTimeZoneMode = useCallback((mode: DisplayTimeZoneMode) => {
    setSettings((prev) => ({ ...prev, displayTimeZoneMode: mode }));
  }, []);

  const setManualTimeZone = useCallback((zone: string) => {
    setSettings((prev) => ({ ...prev, manualTimeZone: zone, displayTimeZoneMode: 'manual' }));
  }, []);

  const setSimulatorTimeZone = useCallback((zone: string) => {
    setSettings((prev) => ({
      ...prev,
      simulatorTimeZone: zone,
      displayTimeZoneMode: 'simulator',
    }));
  }, []);

  const displayTimeZone = useMemo(
    () => resolveDisplayTimeZone(settings, deviceTimeZone),
    [settings, deviceTimeZone]
  );

  const value = useMemo(
    () => ({
      settings,
      isLoaded,
      deviceTimeZone,
      displayTimeZone,
      setHomeTimeZone,
      setDisplayTimeZoneMode,
      setManualTimeZone,
      setSimulatorTimeZone,
    }),
    [
      settings,
      isLoaded,
      deviceTimeZone,
      displayTimeZone,
      setHomeTimeZone,
      setDisplayTimeZoneMode,
      setManualTimeZone,
      setSimulatorTimeZone,
    ]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
