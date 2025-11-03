import { useState, useCallback } from 'react';

interface RouteFeature {
  type: 'Feature';
  properties: {
    distance: number;
    duration: number;
    fareEstimate: number;
    routeType: 'fastest' | 'eco' | 'shortest';
  };
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}

interface RouteOption {
  id: string;
  type: 'fastest' | 'eco' | 'shortest';
  distance: number;
  duration: number;
  fareEstimate: number;
  route: RouteFeature;
}

const BASE_FARE = 5; // Base fare in USD
const PER_KM_RATE = 1.5; // Rate per kilometer
const PER_MINUTE_RATE = 0.5; // Rate per minute
const SURGE_MULTIPLIER = 1.2; // Surge pricing multiplier for peak hours

export function useMapRouting() {
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const calculateFare = useCallback((distance: number, duration: number): number => {
    const distanceFare = distance * PER_KM_RATE;
    const timeFare = (duration / 60) * PER_MINUTE_RATE;
    const baseFare = BASE_FARE;
    
    // Check if it's peak hours (simplified example)
    const now = new Date();
    const hour = now.getHours();
    const isPeakHour = hour >= 7 && hour <= 9 || hour >= 16 && hour <= 19;
    
    let totalFare = baseFare + distanceFare + timeFare;
    if (isPeakHour) {
      totalFare *= SURGE_MULTIPLIER;
    }
    
    return Math.round(totalFare * 100) / 100; // Round to 2 decimal places
  }, []);

  const fetchRoutes = useCallback(async (origin: [number, number], destination: [number, number]) => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
      if (!accessToken) {
        throw new Error('Mapbox token not configured');
      }

      // Fetch routes with different profiles
      const profiles = ['driving', 'driving-traffic'] as const;
      const routePromises = profiles.map(async (profile) => {
        const coordinates = `${origin.join(',')};${destination.join(',')}`;
        const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinates}?geometries=geojson&alternatives=true&access_token=${accessToken}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${profile} route`);
        }
        return response.json();
      });

      const results = await Promise.all(routePromises);
      const routeOptions: RouteOption[] = [];

      results.forEach((result, index) => {
        if (result.routes && result.routes.length > 0) {
          result.routes.forEach((route: any, routeIndex: number) => {
            const distance = route.distance / 1000; // Convert to kilometers
            const duration = route.duration / 60; // Convert to minutes
            const fareEstimate = calculateFare(distance, duration);
            
            const routeType = index === 0 && routeIndex === 0 ? 'fastest' :
                            index === 0 && routeIndex === 1 ? 'eco' : 'shortest';

            const routeOption: RouteOption = {
              id: `${routeType}-${index}-${routeIndex}`,
              type: routeType,
              distance,
              duration,
              fareEstimate,
              route: {
                type: 'Feature',
                properties: {
                  distance,
                  duration,
                  fareEstimate,
                  routeType,
                },
                geometry: route.geometry,
              },
            };
            routeOptions.push(routeOption);
          });
        }
      });

      setRoutes(routeOptions);
      if (routeOptions.length > 0) {
        setSelectedRouteId(routeOptions[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setRoutes([]);
      setSelectedRouteId(null);
    } finally {
      setLoading(false);
    }
  }, [calculateFare]);

  const selectRoute = useCallback((routeId: string) => {
    setSelectedRouteId(routeId);
  }, []);

  const selectedRoute = selectedRouteId 
    ? routes.find(route => route.id === selectedRouteId)
    : null;

  return {
    routes,
    selectedRoute,
    selectedRouteId,
    loading,
    error,
    fetchRoutes,
    selectRoute,
  };
}
