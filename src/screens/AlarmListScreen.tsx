import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { AlarmCard } from '../components/AlarmCard';
import { DualClockHeader } from '../components/DualClockHeader';
import { useAlarms } from '../state/AlarmsContext';
import { useSettings } from '../state/SettingsContext';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AlarmList'>;

export function AlarmListScreen({ navigation }: Props) {
  const { alarms, setAlarmEnabled } = useAlarms();
  const { settings, displayTimeZone } = useSettings();

  return (
    <View style={styles.container}>
      <DualClockHeader
        homeTimeZone={settings.homeTimeZone}
        targetTimeZone={displayTimeZone}
        use24Hour={settings.use24HourClock}
      />

      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No alarms yet. Tap + to add one.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <AlarmCard
            alarm={item}
            displayTimeZone={displayTimeZone}
            use24Hour={settings.use24HourClock}
            onToggle={(enabled) => setAlarmEnabled(item.id, enabled)}
            onPress={() => navigation.navigate('AlarmEdit', { alarmId: item.id })}
          />
        )}
      />

      <View style={styles.actionsRow}>
        <Pressable style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingsButtonText}>Settings</Text>
        </Pressable>
        <Pressable
          style={styles.addButton}
          onPress={() => navigation.navigate('AlarmEdit', { alarmId: undefined })}
        >
          <Text style={styles.addButtonText}>+ Add alarm</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 24,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 15,
  },
  actionsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#cbd5e1',
    backgroundColor: '#f1f5f9',
  },
  settingsButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
  },
  settingsButtonText: {
    color: '#334155',
    fontWeight: '600',
  },
  addButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#2563eb',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
