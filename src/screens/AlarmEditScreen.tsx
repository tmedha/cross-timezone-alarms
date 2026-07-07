import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DateTime } from 'luxon';
import React, { useLayoutEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { RepeatDaySelector } from '../components/RepeatDaySelector';
import { Weekday } from '../domain/alarm';
import { getZoneLabel } from '../data/timezoneCities';
import { RootStackParamList } from '../navigation/types';
import { NewAlarmInput, useAlarms } from '../state/AlarmsContext';
import { useSettings } from '../state/SettingsContext';
import { toISODateLocal } from '../utils/time';

type Props = NativeStackScreenProps<RootStackParamList, 'AlarmEdit'>;

function nextAvailableDate(hour: number, minute: number, zone: string): string {
  const now = DateTime.now().setZone(zone);
  const todayAtTime = now.set({ hour, minute, second: 0, millisecond: 0 });
  const target = todayAtTime > now ? todayAtTime : todayAtTime.plus({ days: 1 });
  return target.toISODate()!;
}

export function AlarmEditScreen({ route, navigation }: Props) {
  const { alarmId } = route.params ?? {};
  const { alarms, addAlarm, updateAlarm, deleteAlarm } = useAlarms();
  const { settings } = useSettings();

  const existing = alarmId ? alarms.find((a) => a.id === alarmId) : undefined;

  const [label, setLabel] = useState(existing?.label ?? '');
  const [hour, setHour] = useState(existing?.hour ?? 8);
  const [minute, setMinute] = useState(existing?.minute ?? 0);
  const [sourceTimeZone, setSourceTimeZone] = useState(existing?.sourceTimeZone ?? settings.homeTimeZone);
  const [repeatDays, setRepeatDays] = useState<Weekday[]>(existing?.repeatDays ?? []);
  const [oneTimeDate, setOneTimeDate] = useState<string>(
    existing?.oneTimeDate ?? nextAvailableDate(existing?.hour ?? 8, existing?.minute ?? 0, sourceTimeZone)
  );
  const [showTimePicker, setShowTimePicker] = useState(Platform.OS === 'ios');
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');

  useLayoutEffect(() => {
    navigation.setOptions({ title: existing ? 'Edit Alarm' : 'New Alarm' });
  }, [navigation, existing]);

  const openTimezonePicker = () => {
    navigation.navigate('TimezonePicker', {
      title: 'Choose alarm timezone',
      onSelect: (city) => setSourceTimeZone(city.timezone),
    });
  };

  const onTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== 'ios') setShowTimePicker(false);
    if (event.type === 'dismissed' || !date) return;
    setHour(date.getHours());
    setMinute(date.getMinutes());
  };

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== 'ios') setShowDatePicker(false);
    if (event.type === 'dismissed' || !date) return;
    setOneTimeDate(toISODateLocal(date));
  };

  const handleSave = () => {
    const input: NewAlarmInput = {
      label: label.trim(),
      hour,
      minute,
      sourceTimeZone,
      repeatDays,
      oneTimeDate: repeatDays.length === 0 ? oneTimeDate : undefined,
    };

    if (existing) {
      updateAlarm(existing.id, input);
    } else {
      addAlarm(input);
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!existing) return;
    Alert.alert('Delete alarm?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteAlarm(existing.id); navigation.goBack(); } },
    ]);
  };

  const timeValue = new Date(2000, 0, 1, hour, minute);
  const dateValue = new Date(`${oneTimeDate}T00:00:00`);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>Label</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Wake up call"
        placeholderTextColor="#94a3b8"
        value={label}
        onChangeText={setLabel}
      />

      <Text style={styles.sectionLabel}>Time</Text>
      {Platform.OS !== 'ios' && (
        <Pressable style={styles.rowButton} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.rowButtonText}>
            {DateTime.fromJSDate(timeValue).toFormat('h:mm a')}
          </Text>
        </Pressable>
      )}
      {showTimePicker && (
        <DateTimePicker
          value={timeValue}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}

      <Text style={styles.sectionLabel}>Timezone</Text>
      <Pressable style={styles.rowButton} onPress={openTimezonePicker}>
        <Text style={styles.rowButtonText}>{getZoneLabel(sourceTimeZone)}</Text>
        <Text style={styles.rowButtonSub}>{sourceTimeZone}</Text>
      </Pressable>

      <Text style={styles.sectionLabel}>Repeat</Text>
      <RepeatDaySelector selected={repeatDays} onChange={setRepeatDays} />

      {repeatDays.length === 0 && (
        <>
          <Text style={styles.sectionLabel}>One-time on</Text>
          {Platform.OS !== 'ios' && (
            <Pressable style={styles.rowButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.rowButtonText}>
                {DateTime.fromISO(oneTimeDate).toFormat('ccc, LLL d, yyyy')}
              </Text>
            </Pressable>
          )}
          {showDatePicker && (
            <DateTimePicker
              value={dateValue}
              mode="date"
              minimumDate={new Date()}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
            />
          )}
        </>
      )}

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </Pressable>

      {existing && (
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete alarm</Text>
        </Pressable>
      )}
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
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: '#0f172a',
  },
  rowButton: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
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
  saveButton: {
    marginTop: 32,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  deleteButton: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#dc2626',
    fontWeight: '600',
  },
});
