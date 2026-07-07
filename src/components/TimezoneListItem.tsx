import { DateTime } from 'luxon';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CityTimezone } from '../data/timezoneCities';

interface Props {
  city: CityTimezone;
  onPress: (city: CityTimezone) => void;
}

export function TimezoneListItem({ city, onPress }: Props) {
  const offsetLabel = DateTime.now().setZone(city.timezone).toFormat('ZZ');
  const region = city.stateAnsi ? `${city.province}, ${city.country}` : city.country;

  return (
    <Pressable style={styles.row} onPress={() => onPress(city)}>
      <View style={styles.textBlock}>
        <Text style={styles.city}>{city.city}</Text>
        <Text style={styles.region}>{region}</Text>
      </View>
      <View style={styles.offsetBlock}>
        <Text style={styles.offset}>UTC{offsetLabel}</Text>
        <Text style={styles.zone}>{city.timezone}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  textBlock: {
    flexShrink: 1,
  },
  city: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  region: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  offsetBlock: {
    alignItems: 'flex-end',
  },
  offset: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
  },
  zone: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
});
