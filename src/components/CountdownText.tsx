import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';
import { useNow } from '../utils/useNow';
import { formatCountdown } from '../utils/time';

interface Props {
  nextFireUTC: string | null;
  style?: TextStyle;
}

export function CountdownText({ nextFireUTC, style }: Props) {
  const now = useNow();
  return <Text style={[styles.text, style]}>{formatCountdown(nextFireUTC, now)}</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
});
