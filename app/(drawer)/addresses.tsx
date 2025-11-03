import { ThemedText } from "@/components/themed-text";
import { AddAddressForm } from "@/features/profile/components/AddAddressForm";
import { SavedAddressList } from "@/features/profile/components/SavedAddressList";
import { useSavedAddresses } from "@/features/profile/hooks/useSavedAddresses";
import { useTheme } from "@/hooks/use-theme";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Surface } from "react-native-paper";

/**
 * Addresses Screen
 *
 * Allows users to view and manage their saved addresses
 */
export default function AddressesScreen() {
  const theme = useTheme();
  const { addresses, isLoading, error } = useSavedAddresses();
  const [showAddForm, setShowAddForm] = React.useState(false);

  if (isLoading) {
    return (
      <Surface style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </Surface>
    );
  }

  if (error) {
    return (
      <Surface style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            Could not load your saved addresses
          </ThemedText>
          <Button mode="contained" onPress={() => {}}>
            Retry
          </Button>
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
        <View style={styles.headerContainer}>
          <ThemedText style={styles.title}>My Addresses</ThemedText>
          <Button mode="contained" onPress={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "Add New"}
          </Button>
        </View>

        {showAddForm && (
          <AddAddressForm onComplete={() => setShowAddForm(false)} />
        )}

        <SavedAddressList addresses={addresses} />
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    marginBottom: 16,
    textAlign: "center",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
