import { CityTimezone } from '../data/timezoneCities';

export type RootStackParamList = {
  AlarmList: undefined;
  AlarmEdit: { alarmId?: string };
  TimezonePicker: { title: string; onSelect: (city: CityTimezone) => void };
  Settings: undefined;
};
