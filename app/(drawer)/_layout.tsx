import { AppBar } from '@/components/app-bar';
import { Drawer } from '@/components/drawer';
import { useApi } from '@/context/ApiContext';
import { useCurrentProfile } from '@/hooks/useProfile';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * Drawer Layout
 * 
 * This component serves as the layout for all screens in the drawer navigation.
 * It provides the AppBar and Drawer components to all child screens.
 */
export default function DrawerLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, session } = useApi();
  const { profile } = useCurrentProfile();

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {/* App Bar */}
        <AppBar onMenuPress={handleOpenDrawer} />

        {/* Main Content */}
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}>
          <Stack.Screen name="index" options={{ title: 'Home' }} />
          <Stack.Screen name="home" options={{ title: 'Home' }} />
          <Stack.Screen name="profile" options={{ title: 'Profile' }} />
          <Stack.Screen name="payment-methods" options={{ title: 'Payment Methods' }} />
          <Stack.Screen name="history" options={{ title: 'History' }} />
          <Stack.Screen name="addresses" options={{ title: 'My Addresses' }} />
          <Stack.Screen name="support" options={{ title: 'Support' }} />
          <Stack.Screen name="safety" options={{ title: 'Safety' }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
          <Stack.Screen name="information" options={{ title: 'Information' }} />
        </Stack>

        {/* Drawer */}
        <Drawer
          visible={isDrawerOpen}
          onClose={handleCloseDrawer}
          userEmail={user?.email}
          userPhone={profile?.phone || session?.user?.phone || undefined}
          userAvatarUrl={profile?.avatar_url || session?.user?.user_metadata?.avatar_url}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
