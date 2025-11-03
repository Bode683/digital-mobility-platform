#!/usr/bin/env node

/**
 * Script to generate a developer-only helper component to clear AsyncStorage
 * Usage: node scripts/generate-clear-async-storage.js
 */

const fs = require('fs');
const path = require('path');

const helperComponent = `import React from 'react';
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
`;

const outputPath = path.join(__dirname, '../components/ClearAsyncStorageButton.tsx');
fs.writeFileSync(outputPath, helperComponent);

console.log('✅ Created ClearAsyncStorageButton component!');
console.log('📍 Location:', outputPath);
console.log('');
console.log('📝 Usage:');
console.log('');
console.log('  import { ClearAsyncStorageButton } from "@/components/ClearAsyncStorageButton";');
console.log('');
console.log('  // Add to any screen:');
console.log('  <ClearAsyncStorageButton />');
console.log('');
console.log('⚠️  Remember to remove this component before production!');
