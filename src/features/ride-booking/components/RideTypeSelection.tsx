import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useRideBooking } from "../contexts/RideBookingContext";
import { RideType } from "../types";

interface RideTypeSelectionProps {
  onSelect?: (rideType: RideType) => void;
}

export function RideTypeSelection({ onSelect }: RideTypeSelectionProps) {
  const theme = useTheme();
  const { state, selectRideType } = useRideBooking();
  const {
    availableRideTypes,
    selectedRideType,
    priceEstimates,
    isLoadingPrices,
  } = state;

  const handleSelect = (rideType: RideType) => {
    selectRideType(rideType);
    if (onSelect) {
      onSelect(rideType);
    }
  };

  // Helper function to format price
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  // Helper function to format ETA
  const formatEta = (minutes?: number) => {
    if (!minutes) return "N/A";
    return `${minutes} min`;
  };

  if (availableRideTypes.length === 0) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.surface }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.message, { color: theme.colors.onSurface }]}>
          Loading ride options...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        Select Ride Type
      </Text>

      {availableRideTypes.map((rideType) => {
        const isSelected = selectedRideType?.id === rideType.id;
        const price = priceEstimates[rideType.id];

        return (
          <TouchableOpacity
            key={rideType.id}
            style={[
              styles.rideTypeCard,
              {
                backgroundColor: isSelected
                  ? theme.colors.primaryContainer
                  : theme.colors.surface,
                borderColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.outline,
              },
            ]}
            onPress={() => handleSelect(rideType)}
          >
            <View style={styles.rideTypeIconContainer}>
              <MaterialIcons
                name={
                  rideType.icon === "car"
                    ? "directions-car"
                    : rideType.icon === "car-comfort"
                    ? "airline-seat-recline-extra"
                    : rideType.icon === "car-premium"
                    ? "stars"
                    : "people"
                }
                size={24}
                color={
                  isSelected ? theme.colors.primary : theme.colors.onSurface
                }
              />
            </View>

            <View style={styles.rideTypeInfo}>
              <Text
                style={[
                  styles.rideTypeName,
                  {
                    color: isSelected
                      ? theme.colors.primary
                      : theme.colors.onSurface,
                  },
                ]}
              >
                {rideType.name}
              </Text>

              <Text
                style={[
                  styles.rideTypeDescription,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {rideType.description}
              </Text>

              <View style={styles.rideTypeDetails}>
                <MaterialIcons
                  name="person"
                  size={14}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.detailText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {rideType.capacity}
                </Text>

                <MaterialIcons
                  name="access-time"
                  size={14}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.detailText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {formatEta(rideType.estimatedPickupMinutes)}
                </Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              {isLoadingPrices ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Text
                  style={[
                    styles.priceText,
                    {
                      color: isSelected
                        ? theme.colors.primary
                        : theme.colors.onSurface,
                    },
                  ]}
                >
                  {price ? formatPrice(price) : "N/A"}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  message: {
    marginTop: 8,
    textAlign: "center",
  },
  rideTypeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  rideTypeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rideTypeInfo: {
    flex: 1,
  },
  rideTypeName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  rideTypeDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  rideTypeDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 12,
    marginRight: 12,
    marginLeft: 4,
  },
  priceContainer: {
    minWidth: 70,
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
