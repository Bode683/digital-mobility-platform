import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { BaseMap, MapMarker, RouteVisualization } from "../../map";
import { RideTracker } from "../components/RideTracker";
import { useRideBooking } from "../contexts/RideBookingContext";

export default function RideTrackingScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { state: rideState } = useRideBooking();

  const [driverLocation, setDriverLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Simulate driver location updates
  useEffect(() => {
    if (!rideState.currentRide || !rideState.currentRide.pickup) return;

    // Start with driver location away from pickup
    const initialDriverLocation = {
      latitude: rideState.currentRide.pickup.latitude - 0.01,
      longitude: rideState.currentRide.pickup.longitude - 0.01,
    };

    setDriverLocation(initialDriverLocation);

    // Simulate driver moving toward pickup location
    const interval = setInterval(() => {
      setDriverLocation((prev) => {
        if (!prev || !rideState.currentRide) return prev;

        const moveTowardPickup = {
          latitude:
            prev.latitude +
            (rideState.currentRide.pickup.latitude - prev.latitude) * 0.1,
          longitude:
            prev.longitude +
            (rideState.currentRide.pickup.longitude - prev.longitude) * 0.1,
        };

        return moveTowardPickup;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [rideState.currentRide]);

  // Handle ride cancellation
  const handleRideCancelled = () => {
    navigation.navigate("home" as never);
  };

  // If no active ride, redirect to home
  useEffect(() => {
    if (!rideState.currentRide) {
      navigation.navigate("home" as never);
    }
  }, [rideState.currentRide, navigation]);

  if (!rideState.currentRide) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={[
            styles.messageContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text style={[styles.message, { color: theme.colors.onSurface }]}>
            No active ride
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("home" as never)}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          Your Ride
        </Text>

        <View style={styles.placeholder} />
      </View>

      <View style={styles.mapContainer}>
        <BaseMap style={styles.map}>
          {/* Pickup location marker */}
          {rideState.currentRide.pickup && (
            <MapMarker
              coordinate={{
                latitude: rideState.currentRide.pickup.latitude,
                longitude: rideState.currentRide.pickup.longitude,
              }}
              type="pickup"
            />
          )}

          {/* Destination location marker */}
          {rideState.currentRide.destination && (
            <MapMarker
              coordinate={{
                latitude: rideState.currentRide.destination.latitude,
                longitude: rideState.currentRide.destination.longitude,
              }}
              type="dropoff"
            />
          )}

          {/* Driver location marker */}
          {driverLocation && (
            <MapMarker
              coordinate={{
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
              }}
              type="driver"
            />
          )}

          {/* Route visualization */}
          {rideState.currentRide.route && (
            <RouteVisualization
              routes={[
                {
                  id: `route-${rideState.currentRide.id || "current"}`,
                  geometry: {
                    type: "LineString" as const,
                    coordinates:
                      rideState.currentRide.route.geometry?.coordinates || [],
                  },
                  distance: rideState.currentRide.route.distance,
                  duration: rideState.currentRide.route.duration,
                },
              ]}
              lineWidth={{ selected: 4, unselected: 2 }}
              lineColors={{
                selected: theme.colors.primary,
                unselected: theme.colors.outline,
              }}
            />
          )}
        </BaseMap>
      </View>

      <View style={styles.trackerContainer}>
        <RideTracker onCancel={handleRideCancelled} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  placeholder: {
    width: 40,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  trackerContainer: {
    margin: 16,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  messageContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    fontSize: 16,
  },
});
