import Mapbox, { Camera } from "@rnmapbox/maps";
import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useMapbox } from "../hooks/useMapbox";
import { CustomMarker } from "./CustomMarker";

interface LocationMapProps {
  onLocationSelect: (coordinate: [number, number]) => void;
  initialCoordinate?: [number, number];
  markerType?: "pickup" | "dropoff";
}

export function LocationMap({
  onLocationSelect,
  initialCoordinate,
  markerType = "pickup",
}: LocationMapProps) {
  useMapbox(); // Initialize Mapbox
  const [selectedLocation, setSelectedLocation] = useState<
    [number, number] | null
  >(initialCoordinate || null);

  const handleMapPress = useCallback(
    (event: any) => {
      const coordinate = event.geometry.coordinates as [number, number];
      setSelectedLocation(coordinate);
      onLocationSelect(coordinate);
    },
    [onLocationSelect]
  );

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}
        attributionEnabled={false}
        logoEnabled={false}
        onPress={handleMapPress}
      >
        <Camera
          zoomLevel={15}
          centerCoordinate={selectedLocation || initialCoordinate}
          animationDuration={500}
        />

        {selectedLocation && (
          <Mapbox.MarkerView coordinate={selectedLocation}>
            <CustomMarker
              type={markerType}
              animate={true}
              style={styles.marker}
            />
          </Mapbox.MarkerView>
        )}

        {/* Map Style Layers - Removed: Style component requires json prop when using styleURL */}
        {/* Custom layers require VectorSource or custom style JSON - see options below */}
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
  marker: {
    zIndex: 1,
  },
});
