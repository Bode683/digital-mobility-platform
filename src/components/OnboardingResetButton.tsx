import { resetOnboarding } from '@/lib/onboarding';
import React from 'react';
import { Alert, Button, StyleSheet, View } from 'react-native';

/**
 * Developer helper component to reset onboarding
 * Add this to any screen during development
 * Remove before production!
 */
export function OnboardingResetButton() {
  const handleReset = async () => {
    try {
      await resetOnboarding();
      Alert.alert(
        'Success',
        'Onboarding has been reset. Please restart the app to see the onboarding flow again.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to reset onboarding');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title="🔄 Reset Onboarding (Dev Only)"
        onPress={handleReset}
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
