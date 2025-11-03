import Mapbox, { Camera } from "@rnmapbox/maps";
import React, { ReactNode, useEffect, useRef } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useMapbox } from "../hooks/useMapbox";
import { useMap } from "../contexts/MapContext";

export interface MapStyleOptions {
  styleURL?: string;
  showUserLocation?: boolean;
  showsHeadingIndicator?: boolean;
  attributionEnabled?: boolean;
  logoEnabled?: boolean;
}

export interface BaseMapProps {
  children?: ReactNode;
  style?: ViewStyle;
  initialZoom?: number;
  initialCenter?: [number, number];
  onMapPress?: (coordinate: [number, number]) => void;
  styleOptions?: MapStyleOptions;
}

export function BaseMap({
  children,
  style,
  initialZoom = 15,
  initialCenter,
  onMapPress,
  styleOptions = {},
}: BaseMapProps) {
  useMapbox(); // Initialize Mapbox
  const { state: mapState } = useMap();
  const cameraRef = useRef<Camera>(null);

  // Default style options
  const {
    styleURL = Mapbox.StyleURL.Street,
    attributionEnabled = false,
    logoEnabled = false,
  } = styleOptions;

  // Handle map press
  const handleMapPress = (event: any) => {
    if (onMapPress && event.geometry?.coordinates) {
      const coordinate = event.geometry.coordinates as [number, number];
      onMapPress(coordinate);
    }
  };

  // Center map on current location when it's available
  useEffect(() => {
    if (mapState.currentLocation && cameraRef.current) {
      const center: [number, number] = [
        mapState.currentLocation.longitude,
        mapState.currentLocation.latitude,
      ];

      cameraRef.current.setCamera({
        centerCoordinate: center,
        zoomLevel: initialZoom,
        animationDuration: 500,
      });
    }
  }, [mapState.currentLocation, initialZoom]);

  // Use initial center if provided, otherwise use current location
  const cameraCenter = initialCenter
    ? initialCenter
    : mapState.currentLocation
    ? [mapState.currentLocation.longitude, mapState.currentLocation.latitude]
    : undefined;

  return (
    <View style={[styles.container, style]}>
      <Mapbox.MapView
        style={styles.map}
        styleURL={styleURL}
        attributionEnabled={attributionEnabled}
        logoEnabled={logoEnabled}
        onPress={handleMapPress}
      >
        <Camera
          ref={cameraRef}
          zoomLevel={initialZoom}
          centerCoordinate={cameraCenter}
          animationDuration={500}
        />

        {/* Render children (markers, routes, etc.) */}
        {children}
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

