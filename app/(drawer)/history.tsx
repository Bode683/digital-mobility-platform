import { ThemedText } from "@/components/themed-text";
import { fetchRideHistory } from "@/features/ride-booking/api/rideBookingApi";
import { RideHistoryItem } from "@/features/ride-booking/components/RideHistoryItem";
import { Ride } from "@/features/ride-booking/types";

import React, { useState } from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Chip,
  Searchbar,
  Surface,
} from "react-native-paper";

/**
 * History Screen
 *
 * Displays user's ride history with filtering options
 */
export default function HistoryScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [rides, setRides] = useState<Ride[]>([]);
  const [filteredRides, setFilteredRides] = useState<Ride[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Fetch ride history on component mount
  React.useEffect(() => {
    const loadRides = async () => {
      try {
        setIsLoading(true);
        const history = await fetchRideHistory();
        setRides(history);
        setFilteredRides(history);
      } catch (error) {
        console.error("Failed to load ride history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRides();
  }, []);

  // Filter rides based on search query and active filter
  React.useEffect(() => {
    let filtered = rides;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (ride) =>
          ride.pickup.address
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          ride.dropoff.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (activeFilter) {
      filtered = filtered.filter((ride) => {
        if (activeFilter === "completed") return ride.status === "completed";
        if (activeFilter === "cancelled") return ride.status === "cancelled";
        return true;
      });
    }

    setFilteredRides(filtered);
  }, [searchQuery, activeFilter, rides]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterPress = (filter: string) => {
    setActiveFilter(activeFilter === filter ? null : filter);
  };

  return (
    <Surface style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <ThemedText style={styles.title}>Ride History</ThemedText>
          </View>

          <Searchbar
            placeholder="Search rides"
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            <Chip
              selected={activeFilter === "completed"}
              onPress={() => handleFilterPress("completed")}
              style={styles.filterChip}
            >
              Completed
            </Chip>
            <Chip
              selected={activeFilter === "cancelled"}
              onPress={() => handleFilterPress("cancelled")}
              style={styles.filterChip}
            >
              Cancelled
            </Chip>
          </ScrollView>

          {filteredRides.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                No rides found matching your criteria.
              </ThemedText>
            </View>
          ) : (
            <FlatList
              data={filteredRides}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <RideHistoryItem ride={item} style={styles.historyItem} />
              )}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingRight: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 16,
  },
  historyItem: {
    marginBottom: 12,
  },
});
