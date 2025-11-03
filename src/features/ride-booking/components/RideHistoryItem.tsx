import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import { Ride } from "../types";

interface RideHistoryItemProps {
  ride: Ride;
  onPress?: (ride: Ride) => void;
}

export function RideHistoryItem({ ride, onPress }: RideHistoryItemProps) {
  const theme = useTheme();

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get status icon and color
  const getStatusInfo = () => {
    switch (ride.status) {
      case "completed":
        return {
          icon: "check-circle",
          color: theme.colors.primary,
          text: "Completed",
        };
      case "cancelled":
        return {
          icon: "cancel",
          color: theme.colors.error,
          text: "Cancelled",
        };
      default:
        return {
          icon: "history",
          color: theme.colors.onSurfaceVariant,
          text: ride.status.charAt(0).toUpperCase() + ride.status.slice(1),
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={() => onPress?.(ride)}
    >
      <View style={styles.dateTimeContainer}>
        <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
          {formatDate(ride.createdAt)}
        </Text>
        <Text style={[styles.time, { color: theme.colors.onSurfaceVariant }]}>
          {formatTime(ride.createdAt)}
        </Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.locationContainer}>
          <View style={styles.locationRow}>
            <MaterialIcons
              name="my-location"
              size={16}
              color={theme.colors.primary}
              style={styles.locationIcon}
            />
            <Text
              style={[styles.locationText, { color: theme.colors.onSurface }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {ride.pickup.address || "Pickup location"}
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
              size={16}
              color={theme.colors.error}
              style={styles.locationIcon}
            />
            <Text
              style={[styles.locationText, { color: theme.colors.onSurface }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {ride.destination.address || "Destination location"}
            </Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.rideTypeContainer}>
            <MaterialIcons
              name={
                ride.rideType.icon === "car"
                  ? "directions-car"
                  : ride.rideType.icon === "car-comfort"
                  ? "airline-seat-recline-extra"
                  : ride.rideType.icon === "car-premium"
                  ? "stars"
                  : "people"
              }
              size={16}
              color={theme.colors.onSurfaceVariant}
              style={styles.rideTypeIcon}
            />
            <Text
              style={[
                styles.rideTypeName,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {ride.rideType.name}
            </Text>
          </View>

          <View style={styles.statusContainer}>
            <MaterialIcons
              name={statusInfo.icon as any}
              size={16}
              color={statusInfo.color}
              style={styles.statusIcon}
            />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.priceContainer}>
        <Text style={[styles.price, { color: theme.colors.onSurface }]}>
          ${ride.fare.toFixed(2)}
        </Text>
        <MaterialIcons
          name="chevron-right"
          size={20}
          color={theme.colors.onSurfaceVariant}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  dateTimeContainer: {
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    width: 60,
  },
  date: {
    fontSize: 12,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
  },
  contentContainer: {
    flex: 1,
  },
  locationContainer: {
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    flex: 1,
  },
  locationConnector: {
    width: 2,
    height: 12,
    marginLeft: 7,
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rideTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rideTypeIcon: {
    marginRight: 4,
  },
  rideTypeName: {
    fontSize: 12,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
  },
  priceContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
});
