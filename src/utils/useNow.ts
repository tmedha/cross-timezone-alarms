import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';

/** Ticks once a second, giving components a live "now" to render clocks/countdowns from. */
export function useNow(intervalMs = 1000): DateTime {
  const [now, setNow] = useState(() => DateTime.utc());

  useEffect(() => {
    const id = setInterval(() => setNow(DateTime.utc()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
