// Export contexts
export { MapProvider, useMap, type MapLocation, type MapStyle } from './contexts/MapContext';

// Export components
export { BaseMap, type MapStyleOptions } from './components/BaseMap';
export { MapMarker, type MarkerType as MapMarkerType } from './components/MapMarker';
export { CustomMarker } from './components/CustomMarker';
export { RouteVisualization, type RouteData } from './components/RouteVisualization';
export { MapControls } from './components/MapControls';
export { MapOverlays, Overlay } from './components/MapOverlays';
export { LocationSearch } from './components/LocationSearch';
export { LoadingOverlay } from './components/LoadingOverlay';
export { ErrorMessage } from './components/ErrorMessage';

// Export hooks
export { useForwardGeocode, type GeocodedLocation as ForwardGeocodedLocation } from './hooks/useForwardGeocode';
export { useReverseGeocode, type GeocodedLocation as ReverseGeocodedLocation } from './hooks/useReverseGeocode';
export { useLocationSearch, type SearchSuggestion } from './hooks/useLocationSearch';
export { useMapInteractions } from './hooks/useMapInteractions';

// Re-export types
export type { MapState } from './contexts/MapContext';