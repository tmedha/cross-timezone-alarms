import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { AlarmEditScreen } from '../screens/AlarmEditScreen';
import { AlarmListScreen } from '../screens/AlarmListScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TimezonePickerScreen } from '../screens/TimezonePickerScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="AlarmList">
        <Stack.Screen name="AlarmList" component={AlarmListScreen} options={{ title: 'Alarms' }} />
        <Stack.Screen name="AlarmEdit" component={AlarmEditScreen} />
        <Stack.Screen name="TimezonePicker" component={TimezonePickerScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
