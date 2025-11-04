import { useCallback, useState } from 'react';
import * as z from 'zod';
import { MapLocation } from '../contexts/MapContext';

// Define validation schema for API response
const FeatureSchema = z.object({
  id: z.string(),
  place_name: z.string(),
  text: z.string(),
  center: z.tuple([z.number(), z.number()]),
  properties: z.object({
    address: z.string().optional(),
  }).optional(),
});

const GeocodingResponseSchema = z.object({
  features: z.array(FeatureSchema),
});

interface ForwardGeocodeOptions {
  country?: string;
  limit?: number;
  types?: string[];
  autocomplete?: boolean;
  proximity?: [number, number]; // [longitude, latitude]
}

export interface GeocodedLocation extends MapLocation {
  placeId?: string;
}

export function useForwardGeocode() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const forwardGeocode = useCallback(async (
    query: string,
    options: ForwardGeocodeOptions = {}
  ): Promise<GeocodedLocation | null> => {
    if (!query.trim()) {
      setError('Search query cannot be empty');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const accessToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
      if (!accessToken) {
        throw new Error('Mapbox token not configured in environment variables');
      }

      // Build URL with query parameters
      const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`);
      
      // Add required parameters
      url.searchParams.append('access_token', accessToken);
      
      // Add optional parameters
      if (options.country) url.searchParams.append('country', options.country);
      if (options.limit) url.searchParams.append('limit', options.limit.toString());
      if (options.types && options.types.length > 0) {
        url.searchParams.append('types', options.types.join(','));
      }
      if (options.autocomplete !== undefined) {
        url.searchParams.append('autocomplete', options.autocomplete.toString());
      }
      if (options.proximity) {
        url.searchParams.append('proximity', options.proximity.join(','));
      }

      // Execute request
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate response format
      try {
        const validatedData = GeocodingResponseSchema.parse(data);
        
        if (validatedData.features.length === 0) {
          setLoading(false);
          setError('No results found');
          return null;
        }
        
        const feature = validatedData.features[0];
        const geocodedLocation: GeocodedLocation = {
          latitude: feature.center[1],
          longitude: feature.center[0],
          address: feature.place_name,
          name: feature.text,
          placeId: feature.id,
        };
        
        setLoading(false);
        return geocodedLocation;
      } catch (validationError) {
        console.error('Response validation error:', validationError);
        throw new Error('Invalid response format from geocoding service');
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Forward geocoding error:', errorMessage);
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);

  // Function to get multiple suggestions for autocomplete
  const forwardGeocodeMultiple = useCallback(async (
    query: string,
    options: ForwardGeocodeOptions = {}
  ): Promise<GeocodedLocation[]> => {
    if (!query.trim()) {
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const accessToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
      if (!accessToken) {
        throw new Error('Mapbox token not configured in environment variables');
      }

      // Build URL with query parameters
      const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`);
      
      // Add required parameters
      url.searchParams.append('access_token', accessToken);
      
      // Set defaults for autocomplete
      url.searchParams.append('autocomplete', 'true');
      url.searchParams.append('limit', (options.limit || 5).toString());
      
      // Add optional parameters
      if (options.country) url.searchParams.append('country', options.country);
      if (options.types && options.types.length > 0) {
        url.searchParams.append('types', options.types.join(','));
      }
      if (options.proximity) {
        url.searchParams.append('proximity', options.proximity.join(','));
      }

      // Execute request
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate response format
      try {
        const validatedData = GeocodingResponseSchema.parse(data);
        
        const locations: GeocodedLocation[] = validatedData.features.map((feature) => ({
          latitude: feature.center[1],
          longitude: feature.center[0],
          address: feature.place_name,
          name: feature.text,
          placeId: feature.id,
        }));
        
        setLoading(false);
        return locations;
      } catch (validationError) {
        console.error('Response validation error:', validationError);
        throw new Error('Invalid response format from geocoding service');
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Forward geocoding error:', errorMessage);
      setError(errorMessage);
      setLoading(false);
      return [];
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    forwardGeocode,
    forwardGeocodeMultiple,
    loading,
    error,
    clearError,
  };
}