import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';

interface Props {
  type?: 'pickup' | 'destination';
}

export function MapPlaceholderScreen({ type }: Props) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={[styles.mapBox, { backgroundColor: theme.colors.muted }]} />
      <View style={styles.footer}>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.sans }]}>Map Placeholder</Text>
        <Text style={{ color: theme.colors.textMuted }}>
          {type ? `Mode: ${type}` : 'No type provided'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapBox: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    marginBottom: 4,
  },
});
