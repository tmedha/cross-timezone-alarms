import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Weekday } from '../domain/alarm';

const DAY_LABELS: Record<Weekday, string> = {
  0: 'S',
  1: 'M',
  2: 'T',
  3: 'W',
  4: 'T',
  5: 'F',
  6: 'S',
};

const ALL_DAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

interface Props {
  selected: Weekday[];
  onChange: (days: Weekday[]) => void;
}

export function RepeatDaySelector({ selected, onChange }: Props) {
  const toggle = (day: Weekday) => {
    if (selected.includes(day)) {
      onChange(selected.filter((d) => d !== day));
    } else {
      onChange([...selected, day].sort());
    }
  };

  return (
    <View style={styles.row}>
      {ALL_DAYS.map((day) => {
        const active = selected.includes(day);
        return (
          <Pressable
            key={day}
            onPress={() => toggle(day)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{DAY_LABELS[day]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e8f0',
  },
  chipActive: {
    backgroundColor: '#2563eb',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#fff',
  },
});
