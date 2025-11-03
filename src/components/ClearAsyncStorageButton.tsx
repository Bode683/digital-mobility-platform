import React from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Developer helper component to clear ALL AsyncStorage keys.
 * Add this to any screen during development.
 * Remove before production!
 */
export function ClearAsyncStorageButton() {
  const handleClear = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Success', 'All AsyncStorage keys have been cleared.');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear AsyncStorage');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title="🧹 Clear AsyncStorage (Dev Only)"
        onPress={handleClear}
        color="#ef4444"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fee',
    borderRadius: 8,
    margin: 16,
  },
});
