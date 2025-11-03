import { useState, useCallback } from 'react';

export interface MapMarkerState {
  id: string;
  coordinate: [number, number];
  title?: string;
  draggable?: boolean;
}

export function useMapMarkers(initialMarkers: MapMarkerState[] = []) {
  const [markers, setMarkers] = useState<MapMarkerState[]>(initialMarkers);

  const addMarker = useCallback((marker: MapMarkerState) => {
    setMarkers((prevMarkers) => [...prevMarkers, marker]);
  }, []);

  const updateMarker = useCallback((id: string, newCoordinate: [number, number]) => {
    setMarkers((prevMarkers) =>
      prevMarkers.map((marker) =>
        marker.id === id ? { ...marker, coordinate: newCoordinate } : marker
      )
    );
  }, []);

  const removeMarker = useCallback((id: string) => {
    setMarkers((prevMarkers) => prevMarkers.filter((marker) => marker.id !== id));
  }, []);

  return { markers, addMarker, updateMarker, removeMarker, setMarkers };
}
