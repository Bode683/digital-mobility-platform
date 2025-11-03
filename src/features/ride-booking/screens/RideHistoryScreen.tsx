import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchRideHistory } from "../api";
import { RideHistoryItem } from "../components/RideHistoryItem";
import { useRideBooking } from "../contexts/RideBookingContext";
import { Ride } from "../types";

export default function RideHistoryScreen() {
  const theme = useTheme();
  const { state } = useRideBooking();

  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load ride history
  useEffect(() => {
    const loadRideHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First, include rides from the context state
        const historyRides = [...state.rideHistory];

        // Then fetch additional rides from the API
        const apiRides = await fetchRideHistory();

        // Combine and sort by date (newest first)
        const allRides = [...historyRides, ...apiRides].sort((a, b) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });

        setRides(allRides);
      } catch (error) {
        console.error("Error loading ride history:", error);
        setError("Failed to load ride history. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadRideHistory();
  }, [state.rideHistory]);

  // Handle ride item press
  const handleRidePress = (ride: Ride) => {
    // In a real app, this would navigate to a ride details screen
    console.log("Ride pressed:", ride);
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
        No rides yet
      </Text>
      <Text
        style={[styles.emptyMessage, { color: theme.colors.onSurfaceVariant }]}
      >
        Your ride history will appear here once you complete your first ride.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          Ride History
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={[
              styles.loadingText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Loading ride history...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
        </View>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RideHistoryItem ride={item} onPress={handleRidePress} />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: "center",
  },
});
