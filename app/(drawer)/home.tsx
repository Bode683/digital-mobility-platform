import React from "react";
import { StyleSheet } from "react-native";
import { Surface, Text } from "react-native-paper";

/**
 * Home Screen
 *
 * Main entry point for the app after authentication
 * Integrates ride booking functionality
 */
export default function HomeScreen() {
  return (
    <Surface style={styles.container}>
      <Text>Home Screen</Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
  },
});
