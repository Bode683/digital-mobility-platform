import {
  BaseMap,
  LocationSearch,
  MapControls,
  MapLocation,
  MapMarker,
  RouteVisualization,
  useMap,
} from "@/features/map";
import { RoutePreviewCard, useRideBooking } from "@/features/ride-booking";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Home Screen
 *
 * Main entry point for the app after authentication
 * Integrates ride booking functionality from location selection to ride completion
 */
export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const {
    state: mapState,
    getCurrentLocation,
    setPickupLocation,
    setDropoffLocation,
  } = useMap();
  const { state: rideState, calculateRoute } = useRideBooking();

  // Local state
  const [isLocationSearchVisible, setIsLocationSearchVisible] = useState(true);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  // Check for active ride on mount and redirect if needed
  useEffect(() => {
    if (rideState.currentRide) {
      // Navigate to ride tracking screen if there's an active ride
      router.push("/(drawer)/in-ride" as any);
    }
  }, [rideState.currentRide, router]);

  // Initialize map and request location on mount
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        if (mapState.hasLocationPermission) {
          const location = await getCurrentLocation();
          if (location) {
            // Auto-set current location as pickup
            setPickupLocation(location);
            setIsMapInitialized(true);
          }
        } else {
          // Request permission will be handled by MapProvider
          setIsMapInitialized(true);
        }
      } catch (error) {
        console.error("Error initializing location:", error);
        setIsMapInitialized(true);
      }
    };

    initializeLocation();
  }, [mapState.hasLocationPermission, getCurrentLocation, setPickupLocation]);

  // Handle pickup location selection
  const handlePickupSelect = useCallback(
    (location: MapLocation) => {
      setPickupLocation(location);
    },
    [setPickupLocation]
  );

  // Handle destination/dropoff location selection
  const handleDropoffSelect = useCallback(
    (location: MapLocation) => {
      setDropoffLocation(location);
      // Hide location search after destination is selected
      setIsLocationSearchVisible(false);
    },
    [setDropoffLocation]
  );

  // Calculate route when both locations are set
  useEffect(() => {
    if (mapState.pickupLocation && mapState.dropoffLocation) {
      calculateRoute();
    }
  }, [mapState.pickupLocation, mapState.dropoffLocation, calculateRoute]);

  // Handle route confirmation - navigate to confirmation screen
  const handleConfirmRide = useCallback(() => {
    if (!mapState.pickupLocation || !mapState.dropoffLocation) {
      Alert.alert(
        "Error",
        "Please select both pickup and destination locations"
      );
      return;
    }

    // Navigate to ride confirmation screen
    router.push({
      pathname: "/(drawer)/ride-confirmation",
      params: {
        pickup: JSON.stringify(mapState.pickupLocation),
        destination: JSON.stringify(mapState.dropoffLocation),
      },
    } as any);
  }, [mapState.pickupLocation, mapState.dropoffLocation, router]);

  // Handle edit route - show location search again
  const handleEditRoute = useCallback(() => {
    setIsLocationSearchVisible(true);
  }, []);

  // Handle map press for location selection
  const handleMapPress = useCallback(
    (coordinate: [number, number]) => {
      // If no dropoff location, allow selecting destination on map
      if (!mapState.dropoffLocation) {
        const location: MapLocation = {
          latitude: coordinate[1],
          longitude: coordinate[0],
        };
        handleDropoffSelect(location);
      }
    },
    [mapState.dropoffLocation, handleDropoffSelect]
  );

  // Handle current location button press
  const handleCurrentLocationPress = useCallback(async () => {
    const location = await getCurrentLocation();
    if (location) {
      setPickupLocation(location);
      // Optionally center map on current location
    }
  }, [getCurrentLocation, setPickupLocation]);

  // Handle location search visibility toggle
  const handleSearchFocus = useCallback(() => {
    setIsLocationSearchVisible(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    // Keep search visible even on blur if locations aren't set
    if (!mapState.pickupLocation || !mapState.dropoffLocation) {
      setIsLocationSearchVisible(true);
    }
  }, [mapState.pickupLocation, mapState.dropoffLocation]);

  // Show loading state while map initializes
  if (!isMapInitialized) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.loadingContainer}>
          {/* Loading state - can be enhanced with ActivityIndicator */}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      {/* Base Map - Full Screen Background */}
      <BaseMap
        style={styles.map}
        initialZoom={15}
        onMapPress={handleMapPress}
        styleOptions={{
          showUserLocation: true,
          attributionEnabled: false,
          logoEnabled: false,
        }}
      >
        {/* Current Location Marker (always visible) */}
        {mapState.currentLocation && (
          <MapMarker
            coordinate={{
              latitude: mapState.currentLocation.latitude,
              longitude: mapState.currentLocation.longitude,
            }}
            type="selected"
          />
        )}

        {/* Pickup Location Marker */}
        {mapState.pickupLocation && (
          <MapMarker
            coordinate={{
              latitude: mapState.pickupLocation.latitude,
              longitude: mapState.pickupLocation.longitude,
            }}
            type="pickup"
          />
        )}

        {/* Destination/Dropoff Location Marker */}
        {mapState.dropoffLocation && (
          <MapMarker
            coordinate={{
              latitude: mapState.dropoffLocation.latitude,
              longitude: mapState.dropoffLocation.longitude,
            }}
            type="dropoff"
          />
        )}

        {/* Route Visualization */}
        {rideState.routeData &&
          mapState.pickupLocation &&
          mapState.dropoffLocation && (
            <RouteVisualization
              routes={[
                {
                  id: "primary-route",
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

      {/* Map Controls - Top Right */}
      <View style={styles.mapControlsContainer}>
        <MapControls
          position="topRight"
          showZoomControls={true}
          showCurrentLocationButton={true}
          onCurrentLocationPress={handleCurrentLocationPress}
        />
      </View>

      {/* Location Search - Top */}
      {isLocationSearchVisible && (
        <View style={styles.locationSearchContainer}>
          <LocationSearch
            onPickupSelect={handlePickupSelect}
            onDropoffSelect={handleDropoffSelect}
            initialPickup={mapState.pickupLocation?.address || ""}
            initialDropoff={mapState.dropoffLocation?.address || ""}
            showCurrentLocationButton={true}
            showMapSelectionButton={true}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            autoFocusDropoff={!mapState.dropoffLocation}
          />
        </View>
      )}

      {/* Route Preview Card - Bottom */}
      {mapState.pickupLocation &&
        mapState.dropoffLocation &&
        !isLocationSearchVisible && (
          <View style={styles.routePreviewContainer}>
            <RoutePreviewCard
              pickupLocation={mapState.pickupLocation}
              destinationLocation={mapState.dropoffLocation}
              routeDistance={rideState.routeDistance}
              routeDuration={rideState.routeDuration}
              priceEstimate={
                rideState.availableRideTypes.length > 0 &&
                Object.keys(rideState.priceEstimates).length > 0
                  ? {
                      min: Math.min(...Object.values(rideState.priceEstimates)),
                      max: Math.max(...Object.values(rideState.priceEstimates)),
                    }
                  : undefined
              }
              onConfirm={handleConfirmRide}
              onEdit={handleEditRoute}
              isLoading={rideState.isLoadingRoute}
            />
          </View>
        )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    flex: 1,
  },
  mapControlsContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,
  },
  locationSearchContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  routePreviewContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 30,
  },
});
