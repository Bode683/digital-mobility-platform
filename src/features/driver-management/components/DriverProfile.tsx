import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useDriver } from "../contexts/DriverContext";
import { Driver } from "../types";

interface DriverProfileProps {
  driver?: Driver;
  compact?: boolean;
}

export function DriverProfile({ driver, compact = false }: DriverProfileProps) {
  const theme = useTheme();
  const { state } = useDriver();

  // Use provided driver or assigned driver from context
  const driverData = driver || state.assignedDriver;

  if (!driverData) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.surface }]}
      >
        <Text
          style={[
            styles.noDriverText,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          No driver assigned
        </Text>
      </View>
    );
  }

  // Format rating to display stars
  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <View style={styles.ratingContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <MaterialIcons
            key={`full-${i}`}
            name="star"
            size={16}
            color="#FFD700"
          />
        ))}
        {halfStar && (
          <MaterialIcons
            key="half"
            name="star-half"
            size={16}
            color="#FFD700"
          />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <MaterialIcons
            key={`empty-${i}`}
            name="star-outline"
            size={16}
            color="#FFD700"
          />
        ))}
        <Text
          style={[styles.ratingText, { color: theme.colors.onSurfaceVariant }]}
        >
          {rating.toFixed(1)}
        </Text>
      </View>
    );
  };

  // Handle contact driver
  const handleContactDriver = () => {
    Alert.alert("Contact Driver", "Choose how to contact your driver:", [
      {
        text: "Call",
        onPress: () =>
          Alert.alert(
            "Calling driver...",
            "This is a mock call in the MVP version."
          ),
      },
      {
        text: "Message",
        onPress: () =>
          Alert.alert(
            "Messaging driver...",
            "This is a mock message in the MVP version."
          ),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  if (compact) {
    // Compact version (for in-ride display)
    return (
      <View
        style={[
          styles.compactContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Image source={{ uri: driverData.photo }} style={styles.compactPhoto} />

        <View style={styles.compactInfo}>
          <Text style={[styles.compactName, { color: theme.colors.onSurface }]}>
            {driverData.name}
          </Text>

          <View style={styles.compactRatingRow}>
            {renderRatingStars(driverData.rating)}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.compactContactButton,
            { backgroundColor: theme.colors.primaryContainer },
          ]}
          onPress={handleContactDriver}
        >
          <MaterialIcons name="phone" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    );
  }

  // Full version
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <Image source={{ uri: driverData.photo }} style={styles.photo} />

        <View style={styles.driverInfo}>
          <Text style={[styles.name, { color: theme.colors.onSurface }]}>
            {driverData.name}
          </Text>

          {renderRatingStars(driverData.rating)}

          <Text
            style={[styles.rides, { color: theme.colors.onSurfaceVariant }]}
          >
            {driverData.totalRides} rides
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.divider,
          { backgroundColor: theme.colors.outlineVariant },
        ]}
      />

      <View style={styles.vehicleInfo}>
        <MaterialIcons
          name="directions-car"
          size={20}
          color={theme.colors.onSurfaceVariant}
        />
        <Text style={[styles.vehicleText, { color: theme.colors.onSurface }]}>
          {driverData.vehicle.color} {driverData.vehicle.make}{" "}
          {driverData.vehicle.model}
        </Text>
      </View>

      <View style={styles.licensePlate}>
        <MaterialIcons
          name="confirmation-number"
          size={20}
          color={theme.colors.onSurfaceVariant}
        />
        <Text
          style={[styles.licensePlateText, { color: theme.colors.onSurface }]}
        >
          {driverData.vehicle.licensePlate}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.contactButton,
          { backgroundColor: theme.colors.primary },
        ]}
        onPress={handleContactDriver}
      >
        <MaterialIcons name="phone" size={20} color={theme.colors.onPrimary} />
        <Text
          style={[styles.contactButtonText, { color: theme.colors.onPrimary }]}
        >
          Contact Driver
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  driverInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
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
  rides: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  vehicleInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  vehicleText: {
    fontSize: 16,
    marginLeft: 8,
  },
  licensePlate: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  licensePlateText: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "500",
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  noDriverText: {
    textAlign: "center",
    padding: 16,
    fontSize: 16,
  },
  // Compact styles
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  compactPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  compactRatingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  compactContactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});
