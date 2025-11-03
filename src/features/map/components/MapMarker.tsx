import { MarkerView, PointAnnotation } from "@rnmapbox/maps";
import React, { useCallback, useMemo } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { MapLocation } from "../contexts/MapContext";
import { CustomMarker } from "./CustomMarker";

export type MarkerType =
  | "pickup"
  | "dropoff"
  | "driver"
  | "selected"
  | "poi"
  | "destination";

export interface MapMarkerProps {
  coordinate: [number, number] | MapLocation;
  type?: MarkerType;
  title?: string;
  subtitle?: string;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragEnd?: (coordinate: [number, number]) => void;
  onPress?: () => void;
  style?: ViewStyle;
  animate?: boolean;
  zIndex?: number;
  id?: string;
  selected?: boolean;
  children?: React.ReactNode;
}

export function MapMarker({
  coordinate,
  type = "selected",
  title,
  subtitle,
  draggable = false,
  onDragStart,
  onDragEnd,
  onPress,
  style,
  animate = false,
  zIndex = 0,
  id,
  selected = false,
  children,
}: MapMarkerProps) {
  // Convert MapLocation to coordinate array if needed
  const markerCoordinate = useMemo(() => {
    if (Array.isArray(coordinate)) {
      return coordinate;
    }
    return [coordinate.longitude, coordinate.latitude];
  }, [coordinate]);

  // Handle drag end event for PointAnnotation
  const handleDragEnd = useCallback(
    (event: any) => {
      if (onDragEnd) {
        // PointAnnotation provides coordinates directly in event.geometry.coordinates
        const coordinates = event.geometry?.coordinates as
          | [number, number]
          | undefined;
        if (coordinates) {
          onDragEnd(coordinates);
        }
      }
    },
    [onDragEnd]
  );

  // Merge styles properly
  const mergedStyle = useMemo(() => {
    return StyleSheet.flatten([{ zIndex }, style].filter(Boolean)) as ViewStyle;
  }, [zIndex, style]);

  // Prepare marker content - ensure it's always a ReactElement
  const markerContent = useMemo(() => {
    if (children) {
      return <>{children}</>;
    }
    return (
      <CustomMarker
        type={selected ? "selected" : type}
        style={mergedStyle}
        animate={animate}
        title={title}
        subtitle={subtitle}
        onPress={onPress}
      />
    );
  }, [
    children,
    selected,
    type,
    mergedStyle,
    animate,
    title,
    subtitle,
    onPress,
  ]);

  // Determine which component to use based on draggable prop
  // PointAnnotation supports dragging, MarkerView is better for static markers
  if (draggable || onDragEnd || onDragStart) {
    // Use PointAnnotation for draggable markers
    return (
      <PointAnnotation
        id={id || `marker-${type}-${markerCoordinate.join("-")}`}
        coordinate={markerCoordinate}
        anchor={{ x: 0.5, y: 1 }}
        draggable={draggable}
        onDragStart={onDragStart}
        onDragEnd={handleDragEnd}
      >
        {markerContent}
      </PointAnnotation>
    );
  }

  // Use MarkerView for non-draggable markers (better performance)
  return (
    <MarkerView
      id={id || `marker-${type}-${markerCoordinate.join("-")}`}
      coordinate={markerCoordinate}
      anchor={{ x: 0.5, y: 1 }}
    >
      {markerContent}
    </MarkerView>
  );
}
