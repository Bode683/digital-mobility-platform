import MapboxGL from '@rnmapbox/maps';
import { useCallback, useRef, useState } from 'react';
import { MapLocation, useMap } from '../contexts/MapContext';
import { useReverseGeocode } from './useReverseGeocode';

// MapboxEvent type is not exported from @rnmapbox/maps
type MapboxEvent = any;

interface MapInteractionOptions {
  onLocationSelect?: (location: MapLocation) => void;
  onCameraMove?: (camera: MapboxGL.Camera) => void;
  onMapIdle?: () => void;
  onError?: (error: string) => void;
  enableLongPress?: boolean;
  enableMarkerDrag?: boolean;
}

export function useMapInteractions({
  onLocationSelect,
  onCameraMove,
  onMapIdle,
  onError,
  enableLongPress = true,
  enableMarkerDrag = true,
}: MapInteractionOptions = {}) {
  const { dispatch } = useMap();
  const { reverseGeocode, loading, error } = useReverseGeocode();
  const [isInteracting, setIsInteracting] = useState(false);
  
  // Refs to track interaction state
  const longPressTimeoutRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  
  // Handle map press
  const handleMapPress = useCallback(async (event: MapboxEvent) => {
    if (isDraggingRef.current) return;
    
    try {
      const { geometry } = event;
      if (geometry.type !== 'Point') return;
      
      const coordinate = geometry.coordinates as [number, number];
      
      // Reverse geocode the coordinate
      const location = await reverseGeocode(coordinate);
      
      if (location) {
        // Update selected location in context
        dispatch({ type: 'SET_SELECTED_LOCATION', payload: location });
        
        // Call the callback if provided
        if (onLocationSelect) {
          onLocationSelect(location);
        }
      } else if (error && onError) {
        onError(error);
      }
    } catch (err) {
      console.error('Error handling map press:', err);
      if (onError) {
        onError('Failed to process location selection');
      }
    }
  }, [dispatch, reverseGeocode, error, onLocationSelect, onError]);
  
  // Handle long press
  const handleLongPress = useCallback((event: MapboxEvent) => {
    if (!enableLongPress) return;
    
    longPressTimeoutRef.current = setTimeout(async () => {
      try {
        const { geometry } = event;
        if (geometry.type !== 'Point') return;
        
        const coordinate = geometry.coordinates as [number, number];
        
        // Reverse geocode the coordinate
        const location = await reverseGeocode(coordinate);
        
        if (location) {
          // Update selected location in context
          dispatch({ type: 'SET_SELECTED_LOCATION', payload: location });
          
          // Call the callback if provided
          if (onLocationSelect) {
            onLocationSelect(location);
          }
        } else if (error && onError) {
          onError(error);
        }
      } catch (err) {
        console.error('Error handling long press:', err);
        if (onError) {
          onError('Failed to process location selection');
        }
      }
    }, 500); // 500ms for long press
  }, [enableLongPress, reverseGeocode, dispatch, error, onLocationSelect, onError]);
  
  // Handle map touch cancel
  const handleTouchCancel = useCallback(() => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  }, []);
  
  // Handle marker drag start
  const handleMarkerDragStart = useCallback(() => {
    if (!enableMarkerDrag) return;
    
    isDraggingRef.current = true;
    setIsInteracting(true);
  }, [enableMarkerDrag]);
  
  // Handle marker drag end
  const handleMarkerDragEnd = useCallback(async (event: MapboxEvent) => {
    if (!enableMarkerDrag) return;
    
    try {
      const { geometry } = event;
      if (geometry.type !== 'Point') return;
      
      const coordinate = geometry.coordinates as [number, number];
      
      // Reverse geocode the coordinate
      const location = await reverseGeocode(coordinate);
      
      if (location) {
        // Update selected location in context
        dispatch({ type: 'SET_SELECTED_LOCATION', payload: location });
        
        // Call the callback if provided
        if (onLocationSelect) {
          onLocationSelect(location);
        }
      } else if (error && onError) {
        onError(error);
      }
    } catch (err) {
      console.error('Error handling marker drag end:', err);
      if (onError) {
        onError('Failed to process location update');
      }
    } finally {
      isDraggingRef.current = false;
      setIsInteracting(false);
    }
  }, [enableMarkerDrag, reverseGeocode, dispatch, error, onLocationSelect, onError]);
  
  // Handle camera move
  const handleCameraMove = useCallback((camera: MapboxGL.Camera) => {
    setIsInteracting(true);
    
    if (onCameraMove) {
      onCameraMove(camera);
    }
  }, [onCameraMove]);
  
  // Handle map idle
  const handleMapIdle = useCallback(() => {
    setIsInteracting(false);
    
    if (onMapIdle) {
      onMapIdle();
    }
  }, [onMapIdle]);
  
  return {
    // State
    isInteracting,
    isLoading: loading,
    error,
    
    // Event handlers
    handleMapPress,
    handleLongPress,
    handleTouchCancel,
    handleMarkerDragStart,
    handleMarkerDragEnd,
    handleCameraMove,
    handleMapIdle,
  };
}
