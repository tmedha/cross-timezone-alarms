import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNow } from '../utils/useNow';
import { formatClock, formatZoneDateLabel } from '../utils/time';
import { getZoneLabel } from '../data/timezoneCities';

interface Props {
  homeTimeZone: string;
  targetTimeZone: string;
  use24Hour: boolean;
}

/** Persistent header: always shows Home time alongside Target/Local time, live-ticking. */
export function DualClockHeader({ homeTimeZone, targetTimeZone, use24Hour }: Props) {
  const now = useNow();
  const sameZone = homeTimeZone === targetTimeZone;

  return (
    <View style={styles.container}>
      <ClockBlock label="HOME" zone={homeTimeZone} now={now} use24Hour={use24Hour} />
      <View style={styles.divider} />
      <ClockBlock
        label={sameZone ? 'TARGET (same as home)' : 'TARGET'}
        zone={targetTimeZone}
        now={now}
        use24Hour={use24Hour}
      />
    </View>
  );
}

function ClockBlock({
  label,
  zone,
  now,
  use24Hour,
}: {
  label: string;
  zone: string;
  now: ReturnType<typeof useNow>;
  use24Hour: boolean;
}) {
  return (
    <View style={styles.block}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.time}>{formatClock(zone, now, use24Hour)}</Text>
      <Text style={styles.sub}>{getZoneLabel(zone)}</Text>
      <Text style={styles.sub}>{formatZoneDateLabel(zone, now)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#0f172a',
  },
  block: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#334155',
    marginHorizontal: 8,
  },
  label: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  time: {
    color: '#f8fafc',
    fontSize: 24,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
  sub: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 2,
  },
});
