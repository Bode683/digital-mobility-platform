import Account from '@/features/profile/components/Account';
import { useTheme } from '@/hooks/use-theme';
import { useAuthState } from '@/context/ApiContext';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, ActivityIndicator, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthLoading, isAuthenticated } = useAuthState();


  if (isAuthLoading) {
    return (
      <Surface style={styles.container}>
        <Appbar.Header>
          {router.canGoBack() && <Appbar.BackAction onPress={() => router.back()} />}
          <Appbar.Content title="Profile" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </Surface>
    );
  }

  return (
    <Surface style={styles.container}>
      <Appbar.Header>
        {router.canGoBack() && <Appbar.BackAction onPress={() => router.back()} />}
        <Appbar.Content title="Profile" />
      </Appbar.Header>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ padding: theme.spacing.lg }}>
        {isAuthenticated && <Account />}
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
