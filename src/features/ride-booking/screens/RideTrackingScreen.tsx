import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { BaseMap, MapMarker, RouteVisualization } from "../../map";
import { RideTracker } from "../components/RideTracker";
import { useRideBooking } from "../contexts/RideBookingContext";
import { useDriverLocation } from "../hooks/useDriverLocation";
import type { Ride, RideStatus } from "../types";

export default function RideTrackingScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { state: rideState, dispatch } = useRideBooking();
  const completedRideIdRef = useRef<string | null>(null);

  // Handle status changes from driver location hook
  const handleStatusChange = useCallback((newStatus: RideStatus) => {
    if (!rideState.currentRide) return;

    const updatedRide: Ride = {
      ...rideState.currentRide,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: "SET_CURRENT_RIDE", payload: updatedRide });
  }, [rideState.currentRide, dispatch]);

  // Use the driver location hook
  const { location: driverLocation } = useDriverLocation(
    rideState.currentRide,
    {
      speedKmh: 30,
      updateIntervalMs: 2000,
      arrivalThresholdKm: 0.05,
      onStatusChange: handleStatusChange,
    }
  );



  // Handle ride completion: move to history and navigate
  useEffect(() => {
    if (
      rideState.currentRide?.status === "completed" &&
      rideState.currentRide.id !== completedRideIdRef.current
    ) {
      // Mark this ride as processed to prevent duplicate entries
      completedRideIdRef.current = rideState.currentRide.id;

      // Add completed ride to history
      dispatch({ 
        type: "ADD_TO_RIDE_HISTORY", 
        payload: rideState.currentRide 
      });
      
      // Clear current ride after a short delay to show completion status
      const completionTimeout = setTimeout(() => {
        dispatch({ type: "SET_CURRENT_RIDE", payload: null });
        // Navigation will happen automatically via the useEffect that watches currentRide
      }, 2000); // 2 second delay to show "Ride completed" message

      return () => clearTimeout(completionTimeout);
    }
  }, [rideState.currentRide?.status, rideState.currentRide, dispatch]);

  // Reset completed ride tracking when ride changes
  useEffect(() => {
    completedRideIdRef.current = null;
  }, [rideState.currentRide?.id]);

  // Handle ride cancellation
  const handleRideCancelled = () => {
    // cancelRide in context already handles state cleanup (clears currentRide and adds to history)
    // Navigation will happen automatically via the useEffect below
  };

  // If no active ride, redirect to home
  useEffect(() => {
    if (!rideState.currentRide) {
      // Only navigate if we're not already on the home screen
      // This prevents unnecessary navigation loops
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
