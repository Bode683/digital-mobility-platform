import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, useTheme } from "react-native-paper";
import { MapLocation } from "@/features/map";

export interface RoutePreviewCardProps {
  pickupLocation: MapLocation;
  destinationLocation: MapLocation;
  routeDistance: number | null; // in km
  routeDuration: number | null; // in minutes
  priceEstimate?: {
    min: number;
    max: number;
  };
  onConfirm: () => void;
  onEdit?: () => void;
  isLoading?: boolean;
}

export function RoutePreviewCard({
  pickupLocation,
  destinationLocation,
  routeDistance,
  routeDuration,
  priceEstimate,
  onConfirm,
  onEdit,
  isLoading = false,
}: RoutePreviewCardProps) {
  const theme = useTheme();

  // Format distance
  const formatDistance = (distance: number | null) => {
    if (!distance) return "N/A";
    return distance < 1
      ? `${(distance * 1000).toFixed(0)} m`
      : `${distance.toFixed(1)} km`;
  };

  // Format duration
  const formatDuration = (duration: number | null) => {
    if (!duration) return "N/A";
    return duration < 60
      ? `${Math.round(duration)} min`
      : `${(duration / 60).toFixed(1)} hr`;
  };

  // Format price range
  const formatPriceRange = () => {
    if (!priceEstimate) return "Calculating...";
    if (priceEstimate.min === priceEstimate.max) {
      return `$${priceEstimate.min.toFixed(2)}`;
    }
    return `$${priceEstimate.min.toFixed(2)} - $${priceEstimate.max.toFixed(2)}`;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          shadowColor: theme.colors.shadow,
        },
      ]}
    >
      {/* Drag Handle */}
      <View style={[styles.handle, { backgroundColor: theme.colors.outlineVariant }]} />

      {/* Location Summary */}
      <View style={styles.locationSection}>
        {/* Pickup Location */}
        <View style={styles.locationRow}>
          <View style={[styles.locationDot, { backgroundColor: theme.colors.primary }]} />
          <View style={styles.locationTextContainer}>
            <Text
              style={[styles.locationLabel, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={1}
            >
              From
            </Text>
            <Text
              style={[styles.locationText, { color: theme.colors.onSurface }]}
              numberOfLines={2}
            >
              {pickupLocation.address || "Pickup location"}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View
          style={[
            styles.divider,
            { backgroundColor: theme.colors.outlineVariant },
            styles.verticalDivider,
          ]}
        />

        {/* Destination Location */}
        <View style={styles.locationRow}>
          <View style={[styles.locationDot, { backgroundColor: theme.colors.error }]} />
          <View style={styles.locationTextContainer}>
            <Text
              style={[styles.locationLabel, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={1}
            >
              To
            </Text>
            <Text
              style={[styles.locationText, { color: theme.colors.onSurface }]}
              numberOfLines={2}
            >
              {destinationLocation.address || "Destination location"}
            </Text>
          </View>
        </View>
      </View>

      {/* Route Info */}
      {(routeDistance || routeDuration) && (
        <View
          style={[
            styles.routeInfoSection,
            { borderTopColor: theme.colors.outlineVariant },
          ]}
        >
          <View style={styles.routeInfoRow}>
            {/* Distance */}
            <View style={styles.routeInfoItem}>
              <MaterialIcons
                name="straighten"
                size={18}
                color={theme.colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.routeInfoText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {formatDistance(routeDistance)}
              </Text>
            </View>

            {/* Duration */}
            <View style={styles.routeInfoItem}>
              <MaterialIcons
                name="access-time"
                size={18}
                color={theme.colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.routeInfoText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {formatDuration(routeDuration)}
              </Text>
            </View>

            {/* Price Estimate */}
            {priceEstimate && (
              <View style={styles.routeInfoItem}>
                <MaterialIcons
                  name="attach-money"
                  size={18}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.routeInfoText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {formatPriceRange()}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {onEdit && (
          <TouchableOpacity
            style={[
              styles.editButton,
              { borderColor: theme.colors.outline },
            ]}
            onPress={onEdit}
          >
            <MaterialIcons
              name="edit"
              size={20}
              color={theme.colors.onSurface}
            />
            <Text style={[styles.editButtonText, { color: theme.colors.onSurface }]}>
              Edit
            </Text>
          </TouchableOpacity>
        )}

        <Button
          mode="contained"
          onPress={onConfirm}
          loading={isLoading}
          disabled={isLoading}
          style={styles.confirmButton}
          contentStyle={styles.confirmButtonContent}
          labelStyle={styles.confirmButtonLabel}
        >
          Confirm Ride
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  locationSection: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 4,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 6,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  locationText: {
    fontSize: 15,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginVertical: 12,
    marginLeft: 24,
  },
  verticalDivider: {
    width: 2,
    height: 20,
    marginVertical: 4,
    marginLeft: 5,
    alignSelf: "center",
  },
  routeInfoSection: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginBottom: 16,
  },
  routeInfoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  routeInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  routeInfoText: {
    fontSize: 14,
    fontWeight: "500",
  },
  actionSection: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    minWidth: 80,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  confirmButton: {
    flex: 1,
  },
  confirmButtonContent: {
    paddingVertical: 8,
  },
  confirmButtonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

