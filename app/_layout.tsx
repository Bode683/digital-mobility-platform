import { ToastProvider } from "@/components/ToastProvider";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ApiProvider, useAuthState } from "@/context/ApiContext";
import { DriverProvider } from "@/features/driver-management";
import { PaymentProvider } from "@/features/payments";
import { MapProvider } from "@/features/map";
import { RideBookingProvider } from "@/features/ride-booking";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import "react-native-reanimated";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ErrorBoundary>
      <ApiProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <PaperProvider
            theme={colorScheme === "dark" ? MD3DarkTheme : MD3LightTheme}
          >
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <ToastProvider>
                <MapProvider>
                  <RideBookingProvider>
                    <DriverProvider>
                      <PaymentProvider>
                        <RootNavigator />
                        <StatusBar style="auto" />
                      </PaymentProvider>
                    </DriverProvider>
                  </RideBookingProvider>
                </MapProvider>
              </ToastProvider>
            </ThemeProvider>
          </PaperProvider>
        </GestureHandlerRootView>
      </ApiProvider>
    </ErrorBoundary>
  );
}

/**
 * Root Navigator Component
 * Handles auth-based routing and splash screen
 * Separated from RootLayout to access ApiContext
 */
function RootNavigator() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  // Get auth state from ApiContext (managed by Supabase listener)
  const { session, isAuthLoading } = useAuthState();

  useEffect(() => {
    async function prepare() {
      try {
        // Add any async initialization here if needed
        // For example: preload fonts, images, etc.

        // Wait a bit for auth state to initialize
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (e) {
        console.warn("Error during app initialization:", e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    // Hide splash screen once ready and auth is loaded
    if (isReady && !isAuthLoading) {
      SplashScreen.hideAsync();
    }
  }, [isReady, isAuthLoading]);

  useEffect(() => {
    // Don't navigate until ready and auth is loaded
    if (!isReady || isAuthLoading) return;

    const inDrawerGroup = segments[0] === "(drawer)";
    const inAuthScreen = segments[0] === "auth";

    // Redirect authenticated users from auth screen to home
    if (session && inAuthScreen) {
      router.replace("/(drawer)/home");
    }

    // Protect drawer routes - redirect to auth if not authenticated
    if (!session && inDrawerGroup) {
      router.replace("/auth");
    }
  }, [session, segments, isReady, isAuthLoading, router]);

  // Show nothing while initializing
  if (!isReady || isAuthLoading) {
    return null;
  }

  return <Slot />;
}
