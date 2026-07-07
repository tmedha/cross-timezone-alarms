import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Alarm } from '../domain/alarm';
import { useNow } from '../utils/useNow';
import { formatConvertedTime, formatOriginalIntent } from '../utils/time';
import { CountdownText } from './CountdownText';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface Props {
  alarm: Alarm;
  displayTimeZone: string;
  use24Hour: boolean;
  onToggle: (enabled: boolean) => void;
  onPress: () => void;
}

export function AlarmCard({ alarm, displayTimeZone, use24Hour, onToggle, onPress }: Props) {
  const now = useNow(30_000); // converted-time label only needs coarse refresh, not per-second

  const repeatSummary =
    alarm.repeatDays.length === 0
      ? alarm.oneTimeDate ?? 'One-time'
      : alarm.repeatDays.length === 7
      ? 'Every day'
      : alarm.repeatDays.map((d) => DAY_LABELS[d]).join(' ');

  return (
    <Pressable style={[styles.card, !alarm.enabled && styles.cardDisabled]} onPress={onPress}>
      <View style={styles.headerRow}>
        <Text style={styles.label} numberOfLines={1}>
          {alarm.label || 'Alarm'}
        </Text>
        <Switch value={alarm.enabled} onValueChange={onToggle} />
      </View>

      <Text style={styles.original}>{formatOriginalIntent(alarm, use24Hour)}</Text>
      <Text style={styles.converted}>
        → {formatConvertedTime(alarm.nextFireUTC, displayTimeZone, now, use24Hour)}
      </Text>

      <View style={styles.footerRow}>
        <Text style={styles.repeat}>{repeatSummary}</Text>
        {alarm.enabled && <CountdownText nextFireUTC={alarm.nextFireUTC} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    flexShrink: 1,
    marginRight: 8,
  },
  original: {
    fontSize: 15,
    color: '#334155',
    marginTop: 6,
  },
  converted: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  repeat: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
});
