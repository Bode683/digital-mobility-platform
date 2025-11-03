import { useAuthState } from "@/context/ApiContext";
import Account from "@/features/profile/components/Account";
import { useTheme } from "@/hooks/use-theme";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Surface } from "react-native-paper";

/**
 * Profile Screen
 *
 * Displays and allows editing of user profile information
 */
export default function ProfileScreen() {
  const theme = useTheme();
  const { isAuthLoading, isAuthenticated } = useAuthState();

  if (isAuthLoading) {
    return (
      <Surface style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </Surface>
    );
  }

  return (
    <Surface style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ padding: theme.spacing.lg }}
      >
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
    justifyContent: "center",
    alignItems: "center",
  },
});
