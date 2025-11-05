import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { BaseMap, MapMarker, RouteVisualization } from "../../map";
import { RideTracker } from "../components/RideTracker";
import { useRideBooking } from "../contexts/RideBookingContext";
import type { Ride } from "../types";

export default function RideTrackingScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { state: rideState, dispatch } = useRideBooking();

  const [driverLocation, setDriverLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const rideStatusRef = useRef<string | null>(null);
  const arrivalAtPickupRef = useRef(false);
  const arrivalAtDestinationRef = useRef(false);
  const inProgressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDriverLocationRef = useRef<{ latitude: number; longitude: number } | null>(null);

  // Helper function to calculate distance between two points in kilometers
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Helper function to calculate bearing between two points
  const calculateBearing = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x =
      Math.cos(lat1Rad) * Math.sin(lat2Rad) -
      Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    return Math.atan2(y, x);
  };

  // Helper function to move point toward target at constant speed
  const moveTowardTarget = (
    currentLat: number,
    currentLon: number,
    targetLat: number,
    targetLon: number,
    speedKmh: number,
    intervalSeconds: number
  ): { latitude: number; longitude: number; distance: number } => {
    const distance = calculateDistance(currentLat, currentLon, targetLat, targetLon);
    
    // If already very close (within 50 meters), snap to exact location
    if (distance < 0.05) {
      return {
        latitude: targetLat,
        longitude: targetLon,
        distance: 0,
      };
    }

    // Calculate distance to move (speed in km/h * interval in hours)
    const distanceToMove = (speedKmh * intervalSeconds) / 3600; // Convert to km
    
    // If we would overshoot, just move to target
    if (distanceToMove >= distance) {
      return {
        latitude: targetLat,
        longitude: targetLon,
        distance: 0,
      };
    }

    // Calculate bearing
    const bearing = calculateBearing(currentLat, currentLon, targetLat, targetLon);
    
    // Calculate new position (approximately, good for short distances)
    const lat1Rad = (currentLat * Math.PI) / 180;
    const lon1Rad = (currentLon * Math.PI) / 180;
    const angularDistance = distanceToMove / 6371; // Earth's radius in km
    
    const newLat = Math.asin(
      Math.sin(lat1Rad) * Math.cos(angularDistance) +
        Math.cos(lat1Rad) * Math.sin(angularDistance) * Math.cos(bearing)
    );
    const newLon =
      lon1Rad +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1Rad),
        Math.cos(angularDistance) - Math.sin(lat1Rad) * Math.sin(newLat)
      );
    
    return {
      latitude: (newLat * 180) / Math.PI,
      longitude: (newLon * 180) / Math.PI,
      distance: distance - distanceToMove,
    };
  };

  // Initialize driver location when ride starts
  useEffect(() => {
    if (!rideState.currentRide || !rideState.currentRide.pickup) {
      setDriverLocation(null);
      return;
    }

    // Only initialize if we don't have a driver location yet
    if (!driverLocation) {
      const initialDriverLocation = {
        latitude: rideState.currentRide.pickup.latitude - 0.01,
        longitude: rideState.currentRide.pickup.longitude - 0.01,
      };
      setDriverLocation(initialDriverLocation);
    }
  }, [rideState.currentRide?.id]); // Only reinitialize if ride ID changes

  // Simulate driver location updates with constant speed
  useEffect(() => {
    if (!rideState.currentRide || !rideState.currentRide.pickup || !driverLocation) return;

    // Track current ride status
    rideStatusRef.current = rideState.currentRide.status;

    // Determine target location based on ride status
    const getTargetLocation = () => {
      if (rideState.currentRide!.status === "requested" || rideState.currentRide!.status === "accepted" || rideState.currentRide!.status === "arriving") {
        return rideState.currentRide!.pickup;
      } else if (rideState.currentRide!.status === "in_progress") {
        return rideState.currentRide!.destination;
      }
      return null;
    };

    const targetLocation = getTargetLocation();
    if (!targetLocation) return;

    // Driver speed: 30 km/h (adjustable)
    const driverSpeedKmh = 30;
    const updateIntervalSeconds = 2; // Update every 2 seconds for smoother movement

    // Simulate driver moving toward target location at constant speed
    const interval = setInterval(() => {
      setDriverLocation((prev) => {
        if (!prev || !rideState.currentRide || !targetLocation) return prev;

        // If driver has already arrived at pickup and status is "arriving", keep them at pickup
        // When status is "in_progress", allow movement toward destination
        if (
          arrivalAtPickupRef.current &&
          rideState.currentRide.status === "arriving"
        ) {
          // Keep driver at pickup location while status is "arriving"
          return {
            latitude: rideState.currentRide.pickup.latitude,
            longitude: rideState.currentRide.pickup.longitude,
          };
        }

        const currentTarget = getTargetLocation();
        if (!currentTarget) return prev;

        // Log when moving toward destination
        if (rideState.currentRide.status === "in_progress") {
          const currentDistance = calculateDistance(
            prev.latitude,
            prev.longitude,
            currentTarget.latitude,
            currentTarget.longitude
          );
          // Only log occasionally to avoid spam
          if (Math.random() < 0.1) { // 10% chance to log
            console.log('[RideTrackingScreen] Interval: Moving toward destination. Distance remaining:', currentDistance.toFixed(4), 'km');
          }
        }

        const result = moveTowardTarget(
          prev.latitude,
          prev.longitude,
          currentTarget.latitude,
          currentTarget.longitude,
          driverSpeedKmh,
          updateIntervalSeconds
        );

        // Check if driver has arrived at pickup (only if status is accepted or requested)
        // Don't set ref here - let the useEffect handle it to avoid race conditions
        const distanceToPickup = calculateDistance(
          result.latitude,
          result.longitude,
          rideState.currentRide.pickup.latitude,
          rideState.currentRide.pickup.longitude
        );

        if (
          (rideState.currentRide.status === "requested" || rideState.currentRide.status === "accepted") &&
          !arrivalAtPickupRef.current &&
          distanceToPickup < 0.05 // Within 50 meters
        ) {
          console.log('[RideTrackingScreen] Interval: Driver within pickup range. Distance:', distanceToPickup, 'km, Snapping to pickup location');
          // Snap driver to exact pickup location
          // The useEffect will detect this and update the status
          return {
            latitude: rideState.currentRide.pickup.latitude,
            longitude: rideState.currentRide.pickup.longitude,
          };
        }

        // Check if driver has arrived at destination
        // Don't set ref here - let the useEffect handle it to avoid race conditions
        if (
          rideState.currentRide.status === "in_progress" &&
          !arrivalAtDestinationRef.current &&
          calculateDistance(
            result.latitude,
            result.longitude,
            rideState.currentRide.destination.latitude,
            rideState.currentRide.destination.longitude
          ) < 0.05 // Within 50 meters
        ) {
          // Snap driver to exact destination location
          // The useEffect will detect this and update the status
          return {
            latitude: rideState.currentRide.destination.latitude,
            longitude: rideState.currentRide.destination.longitude,
          };
        }

        return {
          latitude: result.latitude,
          longitude: result.longitude,
        };
      });
    }, updateIntervalSeconds * 1000);

    return () => {
      clearInterval(interval);
      if (inProgressTimeoutRef.current) {
        clearTimeout(inProgressTimeoutRef.current);
        inProgressTimeoutRef.current = null;
      }
    };
  }, [rideState.currentRide, driverLocation, dispatch]);

  // Handle arrival at pickup - update status outside of setState callback
  // Watch driverLocation changes to detect arrival
  useEffect(() => {
    if (!driverLocation || !rideState.currentRide) return;

    const distanceToPickup = calculateDistance(
      driverLocation.latitude,
      driverLocation.longitude,
      rideState.currentRide.pickup.latitude,
      rideState.currentRide.pickup.longitude
    );

    // Check if driver is at pickup location and hasn't been marked as arrived
    if (
      !arrivalAtPickupRef.current &&
      (rideState.currentRide.status === "requested" || rideState.currentRide.status === "accepted") &&
      distanceToPickup < 0.05 // Within 50 meters
    ) {
      console.log('[RideTrackingScreen] Driver arrived at pickup! Distance:', distanceToPickup, 'km');
      arrivalAtPickupRef.current = true;
      
      // Update ride status to "arriving"
      const updatedRide: Ride = {
        ...rideState.currentRide,
        status: "arriving",
        updatedAt: new Date().toISOString(),
      };
      console.log('[RideTrackingScreen] Updating ride status to "arriving"');
      dispatch({ type: "SET_CURRENT_RIDE", payload: updatedRide });
      rideStatusRef.current = "arriving";

      // After 3 seconds, update to "in_progress" (driver picked up passenger)
      inProgressTimeoutRef.current = setTimeout(() => {
        console.log('[RideTrackingScreen] Updating ride status to "in_progress" - driver should start moving toward destination');
        const inProgressRide: Ride = {
          ...updatedRide,
          status: "in_progress",
          updatedAt: new Date().toISOString(),
        };
        dispatch({ type: "SET_CURRENT_RIDE", payload: inProgressRide });
        rideStatusRef.current = "in_progress";
        inProgressTimeoutRef.current = null;
        
        // Verify the driver location is set correctly
        console.log('[RideTrackingScreen] Driver should now move from pickup to destination');
      }, 3000);
    }

    // Check if driver is at destination location and hasn't been marked as arrived
    const distanceToDestination = calculateDistance(
      driverLocation.latitude,
      driverLocation.longitude,
      rideState.currentRide.destination.latitude,
      rideState.currentRide.destination.longitude
    );

    if (
      !arrivalAtDestinationRef.current &&
      rideState.currentRide.status === "in_progress" &&
      distanceToDestination < 0.05 // Within 50 meters
    ) {
      console.log('[RideTrackingScreen] Driver arrived at destination! Distance:', distanceToDestination, 'km');
      arrivalAtDestinationRef.current = true;
      
      // Update ride status to "completed"
      const completedRide: Ride = {
        ...rideState.currentRide,
        status: "completed",
        updatedAt: new Date().toISOString(),
      };
      console.log('[RideTrackingScreen] Updating ride status to "completed"');
      dispatch({ type: "SET_CURRENT_RIDE", payload: completedRide });
      rideStatusRef.current = "completed";
    }

    lastDriverLocationRef.current = driverLocation;
  }, [driverLocation, rideState.currentRide, dispatch]);

  // Reset arrival flags when ride changes
  useEffect(() => {
    arrivalAtPickupRef.current = false;
    arrivalAtDestinationRef.current = false;
    if (inProgressTimeoutRef.current) {
      clearTimeout(inProgressTimeoutRef.current);
      inProgressTimeoutRef.current = null;
    }
  }, [rideState.currentRide?.id]);

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
