import { useState, useEffect, useCallback } from 'react';
import MapboxGL from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

interface MapboxState {
  isInitialized: boolean;
  hasLocationPermission: boolean;
  error: string | null;
}

export function useMapbox() {
  const [state, setState] = useState<MapboxState>({
    isInitialized: false,
    hasLocationPermission: false,
    error: null,
  });

  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState(prev => ({
          ...prev,
          hasLocationPermission: false,
          error: 'Location permission denied',
        }));
        Alert.alert(
          'Location Permission Required',
          'Please enable location services to use the map features.',
          [{ text: 'OK' }]
        );
        return false;
      }
      setState(prev => ({ ...prev, hasLocationPermission: true }));
      return true;
    } catch {
      setState(prev => ({
        ...prev,
        hasLocationPermission: false,
        error: 'Failed to request location permission',
      }));
      return false;
    }
  }, []);

  const initializeMapbox = useCallback(async () => {
    try {
      const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
      
      // Log token status (remove in production)
      if (!token) {
        console.warn('Mapbox token is not configured in environment variables');
      } else {
        console.log('Mapbox token is configured');
      }

      if (!token) {
        throw new Error('Mapbox token not configured. Please set EXPO_PUBLIC_MAPBOX_TOKEN in your environment.');
      }

      // Set the access token
      MapboxGL.setAccessToken(token);

      // Configure Mapbox (telemetry disabled by default in newer versions)

      setState(prev => ({ ...prev, isInitialized: true }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize Mapbox';
      console.error('Mapbox initialization error:', errorMessage);
      
      setState(prev => ({
        ...prev,
        isInitialized: false,
        error: errorMessage,
      }));
      
      Alert.alert(
        'Map Initialization Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      await initializeMapbox();
      await requestLocationPermission();
    };

    initialize();
  }, [initializeMapbox, requestLocationPermission]);

  const retryInitialization = useCallback(async () => {
    setState(prev => ({ ...prev, error: null }));
    await initializeMapbox();
    await requestLocationPermission();
  }, [initializeMapbox, requestLocationPermission]);

  return {
    ...state,
    retryInitialization,
  };
}
