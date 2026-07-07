import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useLayoutEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { TimezoneListItem } from '../components/TimezoneListItem';
import { searchCities } from '../data/timezoneCities';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TimezonePicker'>;

export function TimezonePickerScreen({ route, navigation }: Props) {
  const { title, onSelect } = route.params;
  const [query, setQuery] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  const results = useMemo(() => searchCities(query), [query]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search city, state, or country..."
        placeholderTextColor="#94a3b8"
        value={query}
        onChangeText={setQuery}
        autoFocus
        autoCorrect={false}
      />
      <FlatList
        data={results}
        keyExtractor={(item, index) => `${item.timezone}-${item.city}-${index}`}
        renderItem={({ item }) => (
          <TimezoneListItem
            city={item}
            onPress={(city) => {
              onSelect(city);
              navigation.goBack();
            }}
          />
        )}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  search: {
    margin: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    fontSize: 16,
    color: '#0f172a',
  },
});
