import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DateTime } from 'luxon';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getZoneLabel } from '../data/timezoneCities';
import { DisplayTimeZoneMode } from '../domain/alarm';
import { RootStackParamList } from '../navigation/types';
import { useSettings } from '../state/SettingsContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const MODES: { key: DisplayTimeZoneMode; label: string }[] = [
  { key: 'automatic', label: 'Automatic' },
  { key: 'manual', label: 'Manual' },
  { key: 'simulator', label: 'Simulator' },
];

export function SettingsScreen({ navigation }: Props) {
  const {
    settings,
    deviceTimeZone,
    displayTimeZone,
    setHomeTimeZone,
    setDisplayTimeZoneMode,
    setManualTimeZone,
    setSimulatorTimeZone,
    setUse24HourClock,
  } = useSettings();

  const openPicker = (title: string, onSelect: (zone: string) => void) => {
    navigation.navigate('TimezonePicker', {
      title,
      onSelect: (city) => onSelect(city.timezone),
    });
  };

  const currentOffset = DateTime.now().setZone(displayTimeZone).toFormat('ZZ');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>Home timezone</Text>
      <Text style={styles.helper}>
        Your fixed home base — shown as the "Home" clock on the alarm list, independent of any
        single alarm.
      </Text>
      <Pressable
        style={styles.rowButton}
        onPress={() => openPicker('Choose home timezone', setHomeTimeZone)}
      >
        <Text style={styles.rowButtonText}>{getZoneLabel(settings.homeTimeZone)}</Text>
        <Text style={styles.rowButtonSub}>{settings.homeTimeZone}</Text>
      </Pressable>

      <Text style={styles.sectionLabel}>Display / target timezone</Text>
      <Text style={styles.helper}>
        Used to convert every alarm's ring time into "here and now." Automatic follows this
        device; Manual pins one zone; Simulator lets you preview a trip without traveling.
      </Text>

      <View style={styles.segmentRow}>
        {MODES.map((mode) => {
          const active = settings.displayTimeZoneMode === mode.key;
          return (
            <Pressable
              key={mode.key}
              style={[styles.segment, active && styles.segmentActive]}
              onPress={() => setDisplayTimeZoneMode(mode.key)}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                {mode.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {settings.displayTimeZoneMode === 'automatic' && (
        <View style={styles.readonlyRow}>
          <Text style={styles.rowButtonText}>{getZoneLabel(deviceTimeZone)}</Text>
          <Text style={styles.rowButtonSub}>Detected from this device ({deviceTimeZone})</Text>
        </View>
      )}

      {settings.displayTimeZoneMode === 'manual' && (
        <Pressable
          style={styles.rowButton}
          onPress={() => openPicker('Choose display timezone', setManualTimeZone)}
        >
          <Text style={styles.rowButtonText}>
            {getZoneLabel(settings.manualTimeZone ?? deviceTimeZone)}
          </Text>
          <Text style={styles.rowButtonSub}>{settings.manualTimeZone ?? deviceTimeZone}</Text>
        </Pressable>
      )}

      {settings.displayTimeZoneMode === 'simulator' && (
        <>
          <Text style={styles.demoBadge}>DEMO / TRAVEL PREVIEW — not used for real alarms</Text>
          <Pressable
            style={styles.rowButton}
            onPress={() => openPicker('Simulate traveling to...', setSimulatorTimeZone)}
          >
            <Text style={styles.rowButtonText}>
              {getZoneLabel(settings.simulatorTimeZone ?? deviceTimeZone)}
            </Text>
            <Text style={styles.rowButtonSub}>{settings.simulatorTimeZone ?? deviceTimeZone}</Text>
          </Pressable>
        </>
      )}

      <View style={styles.resolvedBox}>
        <Text style={styles.resolvedLabel}>Currently resolved to</Text>
        <Text style={styles.resolvedValue}>
          {getZoneLabel(displayTimeZone)} · UTC{currentOffset}
        </Text>
      </View>

      <Text style={styles.sectionLabel}>Clock format</Text>
      <Text style={styles.helper}>
        Applies everywhere times are shown: alarm times, the Home/Target clocks, and countdowns.
      </Text>
      <View style={styles.segmentRow}>
        <Pressable
          style={[styles.segment, !settings.use24HourClock && styles.segmentActive]}
          onPress={() => setUse24HourClock(false)}
        >
          <Text style={[styles.segmentText, !settings.use24HourClock && styles.segmentTextActive]}>
            12-hour
          </Text>
        </Pressable>
        <Pressable
          style={[styles.segment, settings.use24HourClock && styles.segmentActive]}
          onPress={() => setUse24HourClock(true)}
        >
          <Text style={[styles.segmentText, settings.use24HourClock && styles.segmentTextActive]}>
            24-hour
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 20,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  helper: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 10,
  },
  rowButton: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  readonlyRow: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
  },
  rowButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  rowButtonSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: '#2563eb',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  segmentTextActive: {
    color: '#fff',
  },
  demoBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  resolvedBox: {
    marginTop: 28,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#0f172a',
  },
  resolvedLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  resolvedValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
});
