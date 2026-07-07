import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AlarmsProvider } from './src/state/AlarmsContext';
import { SettingsProvider } from './src/state/SettingsContext';
import { useNotificationSync } from './src/notifications/useNotificationSync';

function NotificationSync() {
  useNotificationSync();
  return null;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <AlarmsProvider>
          <NotificationSync />
          <RootNavigator />
          <StatusBar style="auto" />
        </AlarmsProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
