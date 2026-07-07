import { Settings } from './alarm';

/**
 * Resolves which IANA zone the app should treat as "here right now" for display purposes.
 * Precedence: simulator override (dev/demo travel preview) > manual pin > automatic (device zone).
 */
export function resolveDisplayTimeZone(settings: Settings, deviceTimeZone: string): string {
  if (settings.displayTimeZoneMode === 'simulator' && settings.simulatorTimeZone) {
    return settings.simulatorTimeZone;
  }
  if (settings.displayTimeZoneMode === 'manual' && settings.manualTimeZone) {
    return settings.manualTimeZone;
  }
  return deviceTimeZone;
}

export function getDeviceTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
