import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import { MapLocation } from "../../map";
import { useDriver } from "../contexts/DriverContext";
import { DriverProfile } from "./DriverProfile";

interface DriverTrackerProps {
  pickupLocation?: MapLocation;
  destinationLocation?: MapLocation;
  onDriverArrived?: () => void;
  onRideCompleted?: () => void;
}

export function DriverTracker({
  pickupLocation,
  destinationLocation,
  onDriverArrived,
  onRideCompleted,
}: DriverTrackerProps) {
  const theme = useTheme();
  const { state, trackDriverLocation } = useDriver();
  const { assignedDriver, driverEta, driverStatus } = state;

  const [targetLocation, setTargetLocation] = useState<MapLocation | undefined>(
    pickupLocation
  );
  const [trackingInterval, setTrackingInterval] = useState<number | null>(null);

  // Set up driver location tracking
  useEffect(() => {
    if (!assignedDriver || !targetLocation) return;

    // Start tracking interval
    const interval = setInterval(() => {
      trackDriverLocation(targetLocation);
    }, 3000);

    setTrackingInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [assignedDriver, targetLocation, trackDriverLocation]);

  // Handle driver status changes
  useEffect(() => {
    if (!driverStatus) return;

    if (driverStatus === "arriving" && onDriverArrived) {
      // Driver has arrived at pickup
      onDriverArrived();

      // Switch target to destination if available
      if (destinationLocation) {
        setTargetLocation(destinationLocation);
      }
    } else if (driverStatus === "available" && onRideCompleted) {
      // Ride completed
      onRideCompleted();

      // Stop tracking
      if (trackingInterval) {
        clearInterval(trackingInterval);
        setTrackingInterval(null);
      }
    }
  }, [driverStatus, onDriverArrived, destinationLocation, onRideCompleted, trackingInterval]);

  // Format ETA
  const formatEta = (minutes: number | null) => {
    if (minutes === null) return "Calculating...";
    if (minutes < 1) return "Less than a minute";
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  };

  // Get status message
  const getStatusMessage = () => {
    if (!driverStatus) return "Finding your driver...";

    switch (driverStatus) {
      case "en_route":
        return `Driver is on the way - ${formatEta(driverEta)}`;
      case "arriving":
        return "Driver is arriving now";
      case "on_ride":
        return "On the way to your destination";
      default:
        return "Driver status unknown";
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    if (!driverStatus) return "search";

    switch (driverStatus) {
      case "en_route":
        return "directions-car";
      case "arriving":
        return "location-on";
      case "on_ride":
        return "navigation";
      default:
        return "help";
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[styles.statusCard, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.statusRow}>
          <MaterialIcons
            name={getStatusIcon()}
            size={24}
            color={theme.colors.primary}
            style={styles.statusIcon}
          />
          <Text style={[styles.statusText, { color: theme.colors.onSurface }]}>
            {getStatusMessage()}
          </Text>
        </View>

        {driverStatus === "on_ride" && destinationLocation && (
          <View style={styles.etaContainer}>
            <MaterialIcons
              name="access-time"
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              style={[styles.etaText, { color: theme.colors.onSurfaceVariant }]}
            >
              {formatEta(driverEta)} to destination
            </Text>
          </View>
        )}
      </View>

      {assignedDriver && (
        <View style={styles.driverProfileContainer}>
          <DriverProfile driver={assignedDriver} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  statusCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "500",
  },
  etaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginLeft: 36,
  },
  etaText: {
    fontSize: 14,
    marginLeft: 4,
  },
  driverProfileContainer: {
    marginBottom: 12,
  },
});
