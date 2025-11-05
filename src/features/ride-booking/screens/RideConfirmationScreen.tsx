import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { BaseMap, MapMarker, RouteVisualization, useMap } from "../../map";
import { PaymentMethodSelection } from "../components/PaymentMethodSelection";
import { RideTypeSelection } from "../components/RideTypeSelection";
import { useRideBooking } from "../contexts/RideBookingContext";

export default function RideConfirmationScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{
    pickup: string;
    destination: string;
  }>();

  const { state: mapState } = useMap();
  const { state: rideState, dispatch, calculateRoute, requestRide } = useRideBooking();

  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const lastErrorRef = React.useRef<string | null>(null);

  // Parse coordinates from route params if available
  useEffect(() => {
    if (params.pickup && params.destination) {
      try {
        // In a real app, we would use these coordinates
        // For now, we'll rely on the coordinates already in the map context
      } catch (error) {
        console.error("Error parsing coordinates from route params:", error);
      }
    }
  }, [params]);

  // Calculate route only if not already calculated or if locations changed
  useEffect(() => {
    if (mapState.pickupLocation && mapState.dropoffLocation) {
      // Only calculate if route doesn't exist or locations have changed
      const locationsChanged = 
        rideState.pickupLocation?.latitude !== mapState.pickupLocation.latitude ||
        rideState.pickupLocation?.longitude !== mapState.pickupLocation.longitude ||
        rideState.destinationLocation?.latitude !== mapState.dropoffLocation.latitude ||
        rideState.destinationLocation?.longitude !== mapState.dropoffLocation.longitude;
      
      if (!rideState.routeData || locationsChanged) {
        calculateRoute();
      }
    }
  }, [mapState.pickupLocation, mapState.dropoffLocation, rideState.routeData, rideState.pickupLocation, rideState.destinationLocation, calculateRoute]);

  // Handle ride request
  const handleRequestRide = async () => {
    try {
      const ride = await requestRide();
      if (ride) {
        // Navigate to ride tracking screen
        navigation.navigate("in-ride" as never);
      } else {
        // requestRide returned null, error is already set in state
        // Error will be displayed via useEffect below
      }
    } catch (error) {
      console.error("Error requesting ride:", error);
      // Error is already set in context state, will be displayed via useEffect
    }
  };

  // Display errors to user
  useEffect(() => {
    if (rideState.error && rideState.error !== lastErrorRef.current) {
      lastErrorRef.current = rideState.error;
      Alert.alert("Error", rideState.error, [
        {
          text: "OK",
          onPress: () => {
            // Clear error after user acknowledges it
            lastErrorRef.current = null;
            dispatch({ type: "SET_ERROR", payload: null });
          },
        },
      ]);
    } else if (!rideState.error) {
      // Reset ref when error is cleared
      lastErrorRef.current = null;
    }
  }, [rideState.error, dispatch]);

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
      ? `${duration.toFixed(0)} min`
      : `${(duration / 60).toFixed(1)} hr`;
  };

  // Get selected ride price
  const getSelectedRidePrice = () => {
    if (!rideState.selectedRideType) return "N/A";
    const price = rideState.priceEstimates[rideState.selectedRideType.id];
    return price ? `$${price.toFixed(2)}` : "N/A";
  };

  // Check if ride can be requested
  const canRequestRide =
    !!mapState.pickupLocation &&
    !!mapState.dropoffLocation &&
    !!rideState.selectedRideType &&
    !!rideState.selectedPaymentMethod &&
    !rideState.isRequestingRide;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          Confirm Ride
        </Text>

        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View
          style={[styles.mapContainer, isMapExpanded && styles.expandedMap]}
        >
          <BaseMap style={styles.map}>
            {mapState.pickupLocation && (
              <MapMarker
                coordinate={{
                  latitude: mapState.pickupLocation.latitude,
                  longitude: mapState.pickupLocation.longitude,
                }}
                type="pickup"
              />
            )}

            {mapState.dropoffLocation && (
              <MapMarker
                coordinate={{
                  latitude: mapState.dropoffLocation.latitude,
                  longitude: mapState.dropoffLocation.longitude,
                }}
                type="dropoff"
              />
            )}

            {rideState.routeData && (
              <RouteVisualization
                routes={[
                  {
                    id: "route-1",
                    geometry: {
                      type: "LineString" as const,
                      coordinates:
                        rideState.routeData.geometry?.coordinates || [],
                    },
                    distance: rideState.routeData.distance,
                    duration: rideState.routeData.duration,
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

          <TouchableOpacity
            style={[
              styles.expandButton,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={() => setIsMapExpanded(!isMapExpanded)}
          >
            <MaterialIcons
              name={isMapExpanded ? "fullscreen-exit" : "fullscreen"}
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>

        <View
          style={[styles.routeCard, { backgroundColor: theme.colors.surface }]}
        >
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
              {mapState.pickupLocation?.address || "Pickup location"}
            </Text>
          </View>

          <View
            style={[
              styles.divider,
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
              {mapState.dropoffLocation?.address || "Destination location"}
            </Text>
          </View>

          {rideState.routeDistance && rideState.routeDuration && (
            <View style={styles.routeInfo}>
              <View style={styles.routeInfoItem}>
                <MaterialIcons
                  name="straighten"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.routeInfoText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {formatDistance(rideState.routeDistance)}
                </Text>
              </View>

              <View style={styles.routeInfoItem}>
                <MaterialIcons
                  name="access-time"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.routeInfoText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {formatDuration(rideState.routeDuration)}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <RideTypeSelection />
        </View>

        <View style={styles.sectionContainer}>
          <PaymentMethodSelection />
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.priceContainer}>
          <Text
            style={[
              styles.priceLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Total
          </Text>
          <Text style={[styles.priceValue, { color: theme.colors.onSurface }]}>
            {getSelectedRidePrice()}
          </Text>
        </View>

        <Button
          mode="contained"
          style={styles.requestButton}
          labelStyle={styles.requestButtonLabel}
          disabled={!canRequestRide}
          loading={rideState.isRequestingRide}
          onPress={handleRequestRide}
        >
          Request Ride
        </Button>
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
  scrollView: {
    flex: 1,
  },
  mapContainer: {
    height: 200,
    position: "relative",
  },
  expandedMap: {
    height: 300,
  },
  map: {
    flex: 1,
  },
  expandButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  routeCard: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  locationIcon: {
    marginRight: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  routeInfo: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  routeInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  routeInfoText: {
    marginLeft: 4,
    fontSize: 14,
  },
  sectionContainer: {
    margin: 16,
    marginTop: 0,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  requestButton: {
    flex: 1,
    marginLeft: 16,
  },
  requestButtonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
