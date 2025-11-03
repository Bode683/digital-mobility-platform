import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useTheme } from '@/hooks/use-theme';

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Loading map...' }: LoadingOverlayProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ActivityIndicator
        size="large"
        color={theme.colors.primary}
        animating
      />
      <Text style={[styles.message, { color: theme.colors.text }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});