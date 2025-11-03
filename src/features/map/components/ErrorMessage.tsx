import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { useMap } from '../contexts/MapContext';

interface ErrorMessageProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  const theme = useTheme();
  const { initializeMap } = useMap();

  const handleRetry = async () => {
    if (onRetry) {
      onRetry();
    } else {
      await initializeMap();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <MaterialIcons name="error-outline" size={48} color={theme.colors.error} />
      <Text style={[styles.title, { color: theme.colors.error }]}>Map Error</Text>
      <Text style={[styles.message, { color: theme.colors.text }]}>{error}</Text>
      <Button
        mode="contained"
        onPress={handleRetry}
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        labelStyle={{ color: theme.colors.onPrimary }}
      >
        Retry
      </Button>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 16,
  },
});