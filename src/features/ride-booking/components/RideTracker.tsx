import { MaterialIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import React, { useEffect, useState } from "react";
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Divider, useTheme } from "react-native-paper";
import { useRideBooking } from "../contexts/RideBookingContext";
import { RideCancellationModal } from "./RideCancellationModal";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

interface RideTrackerProps {
  onCancel?: () => void;
}

export function RideTracker({ onCancel }: RideTrackerProps) {
  const theme = useTheme();
  const { state, cancelRide } = useRideBooking();
  const { currentRide } = state;

  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isCancellationModalVisible, setIsCancellationModalVisible] =
    useState(false);

  // Simulate countdown timer
  useEffect(() => {
    if (!currentRide || !currentRide.estimatedArrival) {
      setRemainingTime(null);
      return;
    }

    const estimatedArrival = new Date(currentRide.estimatedArrival).getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const timeLeft = Math.max(
        0,
        Math.floor((estimatedArrival - now) / 1000 / 60)
      );
      setRemainingTime(timeLeft);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [currentRide]);

  // Handle ride cancellation modal
  const handleOpenCancellationModal = () => {
    setIsCancellationModalVisible(true);
  };

  // Handle ride cancellation
  const handleCancelRide = async (reason: string) => {
    if (!currentRide) return;

    const success = await cancelRide(currentRide.id, reason);
    setIsCancellationModalVisible(false);

    if (success && onCancel) {
      onCancel();
    }
  };

  // Handle calling driver
  const handleCallDriver = () => {
    if (!currentRide?.driver?.phoneNumber) return;

    Linking.openURL(`tel:${currentRide.driver.phoneNumber}`);
  };

  if (!currentRide) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.surface }]}
      >
        <Text style={[styles.message, { color: theme.colors.onSurface }]}>
          No active ride
        </Text>
      </View>
    );
  }

  // Get status text and icon
  const getStatusInfo = () => {
    switch (currentRide.status) {
      case "requested":
        return {
          text: "Finding your driver...",
          icon: "search",
          color: theme.colors.primary,
        };
      case "accepted":
        return {
          text:
            remainingTime !== null
              ? `Your driver is on the way (${remainingTime} min)`
              : "Your driver is on the way",
          icon: "directions-car",
          color: theme.colors.primary,
        };
      case "arriving":
        return {
          text: "Your driver is arriving now",
          icon: "location-on",
          color: theme.colors.primary,
        };
      case "in_progress":
        return {
          text: "On the way to your destination",
          icon: "navigation",
          color: theme.colors.primary,
        };
      case "completed":
        return {
          text: "Ride completed",
          icon: "check-circle",
          color: theme.colors.primary,
        };
      case "cancelled":
        return {
          text: "Ride cancelled",
          icon: "cancel",
          color: theme.colors.error,
        };
      default:
        return {
          text: "Processing your ride",
          icon: "sync",
          color: theme.colors.primary,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Cancellation Modal */}
      <RideCancellationModal
        visible={isCancellationModalVisible}
        onClose={() => setIsCancellationModalVisible(false)}
        onCancel={handleCancelRide}
      />

      {/* Status Section */}
      <View style={styles.statusSection}>
        <MaterialIcons
          name={statusInfo.icon as MaterialIconName}
          size={24}
          color={statusInfo.color}
        />
        <Text style={[styles.statusText, { color: theme.colors.onSurface }]}>
          {statusInfo.text}
        </Text>
      </View>

      {/* Driver Section */}
      {currentRide.driver && (
        <>
          <Divider style={styles.divider} />
          <View style={styles.driverSection}>
            <Image
              source={{
                uri:
                  currentRide.driver.photo || "https://via.placeholder.com/50",
              }}
              style={styles.driverPhoto}
            />

            <View style={styles.driverInfo}>
              <Text
                style={[styles.driverName, { color: theme.colors.onSurface }]}
              >
                {currentRide.driver.name}
              </Text>

              <View style={styles.ratingContainer}>
                <MaterialIcons name="star" size={16} color="#FFD700" />
                <Text
                  style={[
                    styles.ratingText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {currentRide.driver.rating.toFixed(1)}
                </Text>
              </View>

              {currentRide.vehicle && (
                <Text
                  style={[
                    styles.vehicleInfo,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {currentRide.vehicle.color} {currentRide.vehicle.make}{" "}
                  {currentRide.vehicle.model} •{" "}
                  {currentRide.vehicle.licensePlate}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.callButton,
                { backgroundColor: theme.colors.primaryContainer },
              ]}
              onPress={handleCallDriver}
            >
              <MaterialIcons
                name="phone"
                size={20}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Ride Details */}
      <Divider style={styles.divider} />
      <View style={styles.rideDetailsSection}>
        <View style={styles.locationRow}>
          <MaterialIcons
            name="my-location"
            size={20}
            color={theme.colors.primary}
            style={styles.locationIcon}
          />
          <Text
            style={[styles.locationText, { color: theme.colors.onSurface }]}
          >
            {currentRide.pickup.address || "Pickup location"}
          </Text>
        </View>

        <View
          style={[
            styles.locationConnector,
            { backgroundColor: theme.colors.outlineVariant },
          ]}
        />

        <View style={styles.locationRow}>
          <MaterialIcons
            name="location-on"
            size={20}
            color={theme.colors.error}
            style={styles.locationIcon}
          />
          <Text
            style={[styles.locationText, { color: theme.colors.onSurface }]}
          >
            {currentRide.destination.address || "Destination location"}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      {["requested", "accepted", "arriving"].includes(currentRide.status) && (
        <>
          <Divider style={styles.divider} />
          <View style={styles.actionsSection}>
            <Button
              mode="outlined"
              style={styles.cancelButton}
              onPress={handleOpenCancellationModal}
            >
              Cancel Ride
            </Button>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: "hidden",
  },
  message: {
    padding: 16,
    textAlign: "center",
  },
  statusSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },
  divider: {
    height: 1,
  },
  driverSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  driverPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
  },
  vehicleInfo: {
    fontSize: 14,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  rideDetailsSection: {
    padding: 16,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  locationIcon: {
    marginRight: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
  },
  locationConnector: {
    width: 2,
    height: 20,
    marginLeft: 10,
  },
  actionsSection: {
    padding: 16,
  },
  cancelButton: {
    width: "100%",
  },
});
