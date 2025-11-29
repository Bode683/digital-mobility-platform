import { MapLocation } from '../../map';
import {
  CancellationReason,
  PaymentMethod,
  Ride,
  RideRequest,
  RideType,
  RouteData
} from '../types';
import { mockPaymentMethods, mockRideTypes } from './mockData';
import { TIMING, PRICING, MAP_CONFIG, LOCATION } from '../constants';

/**
 * Fetches available ride types based on location
 * 
 * @param pickup Pickup location
 * @param destination Destination location
 * @returns Promise with available ride types
 */
export async function fetchRideTypes(
  pickup: MapLocation,
  destination: MapLocation
): Promise<RideType[]> {
  // In a real app, this would make an API call
  // For now, we'll simulate a network request with a timeout
  await new Promise(resolve => setTimeout(resolve, TIMING.ROUTE_CALCULATION_DELAY_MS));

  // Return mock data
  return mockRideTypes;
}

/**
 * Fetches route information between two points using Mapbox Directions API
 * 
 * @param pickup Pickup location
 * @param destination Destination location
 * @returns Promise with route data
 */
export async function fetchRoute(
  pickup: MapLocation,
  destination: MapLocation
): Promise<RouteData> {
  // Check for Mapbox token
  const accessToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
  if (!accessToken) {
    throw new Error('Mapbox token not configured. Please set EXPO_PUBLIC_MAPBOX_TOKEN in your environment.');
  }

  // Format coordinates as longitude,latitude;longitude,latitude
  const coordinates = `${pickup.longitude},${pickup.latitude};${destination.longitude},${destination.latitude}`;
  
  // Use driving-traffic profile for real-time traffic-aware routing
  const profile = MAP_CONFIG.ROUTING_PROFILE;
  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinates}?geometries=geojson&steps=true&access_token=${accessToken}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch route from Mapbox: ${response.status} ${response.statusText}. ${errorText}`);
    }
    
    const data = await response.json();
    
    // Check if routes are available
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No routes found between the specified locations.');
    }
    
    // Get the first route (best route)
    const route = data.routes[0];
    
    // Transform steps from Mapbox format to RouteData format
    const steps: RouteData['steps'] = [];
    
    if (route.legs && route.legs.length > 0) {
      // Combine all steps from all legs
      route.legs.forEach((leg: any) => {
        if (leg.steps && leg.steps.length > 0) {
          leg.steps.forEach((step: any) => {
            // Extract instruction from maneuver
            let instruction = 'Continue';
            if (step.maneuver) {
              if (step.maneuver.instruction) {
                instruction = step.maneuver.instruction;
              } else {
                // Generate instruction from maneuver type and modifier if instruction is not available
                const type = step.maneuver.type || '';
                const modifier = step.maneuver.modifier || '';
                
                if (type === 'depart') {
                  instruction = 'Start at pickup location';
                } else if (type === 'arrive') {
                  instruction = 'Arrive at destination';
                } else if (type === 'turn') {
                  instruction = `Turn ${modifier}`;
                } else if (type === 'merge') {
                  instruction = `Merge ${modifier}`;
                } else if (type === 'ramp') {
                  instruction = `Take ramp ${modifier}`;
                } else if (type === 'continue') {
                  instruction = 'Continue straight';
                } else {
                  instruction = `${type} ${modifier}`.trim();
                }
              }
            }
            
            steps.push({
              instruction,
              distance: step.distance || 0, // Already in meters
              duration: step.duration || 0, // Already in seconds
            });
          });
        }
      });
    }
    
    // If no steps were extracted, create a simple step
    if (steps.length === 0) {
      steps.push({
        instruction: 'Drive to destination',
        distance: route.distance || 0,
        duration: route.duration || 0,
      });
    }
    
    // Return transformed route data
    return {
      geometry: route.geometry, // Already in GeoJSON format
      distance: route.distance, // Already in meters
      duration: route.duration, // Already in seconds
      steps,
    };
  } catch (error) {
    // Re-throw with more context if it's not already an Error
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch route: ${String(error)}`);
  }
}

/**
 * Fetches user's payment methods
 * 
 * @returns Promise with payment methods
 */
export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  // In a real app, this would make an API call
  // For now, we'll simulate a network request with a timeout
  await new Promise(resolve => setTimeout(resolve, TIMING.PAYMENT_METHODS_FETCH_DELAY_MS));

  // Return mock data
  return mockPaymentMethods;
}

/**
 * Creates a ride request
 *
 * @param request Ride request data
 * @returns Promise with created ride
 */
export async function createRideRequest(request: RideRequest): Promise<Ride> {
  // In a real app, this would make an API call
  // For now, we'll simulate a network request with a timeout
  await new Promise(resolve => setTimeout(resolve, TIMING.RIDE_REQUEST_DELAY_MS));

  // Get the selected ride type and payment method
  const rideType = mockRideTypes.find(rt => rt.id === request.rideTypeId);
  const paymentMethod = mockPaymentMethods.find(pm => pm.id === request.paymentMethodId);

  if (!rideType || !paymentMethod) {
    throw new Error('Invalid ride type or payment method');
  }

  // Use provided route data or fetch if not available
  const routeData = request.route || await fetchRoute(request.pickup, request.destination);

  // Calculate fare based on distance and duration
  const distanceKm = routeData.distance / 1000;
  const durationMin = routeData.duration / 60;
  const baseFare = PRICING.BASE_FARE;
  const distanceFare = distanceKm * PRICING.PER_KM_RATE;
  const timeFare = durationMin * PRICING.PER_MINUTE_RATE;
  const subtotal = baseFare + distanceFare + timeFare;
  const fare = Math.max(subtotal * rideType.priceMultiplier, PRICING.MINIMUM_FARE);

  // Create a mock ride
  const now = new Date();
  const estimatedArrival = new Date(now.getTime() + TIMING.ESTIMATED_ARRIVAL_TIME_MS);

  return {
    id: `ride-${Date.now()}`,
    status: 'requested',
    pickup: request.pickup,
    destination: request.destination,
    fare: Math.round(fare * 100) / 100,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    estimatedArrival: estimatedArrival.toISOString(),
    rideType,
    paymentMethod,
    route: routeData
  };
}

/**
 * Cancels a ride
 * 
 * @param rideId Ride ID to cancel
 * @param reason Optional cancellation reason
 * @returns Promise with success status
 */
export async function cancelRide(rideId: string, reason?: string): Promise<boolean> {
  // In a real app, this would make an API call
  // For now, we'll simulate a network request with a timeout
  await new Promise(resolve => setTimeout(resolve, TIMING.RIDE_CANCELLATION_DELAY_MS));

  // Always succeed in mock implementation
  return true;
}

/**
 * Fetches ride history
 *
 * @param limit Maximum number of rides to fetch
 * @param offset Offset for pagination
 * @returns Promise with ride history
 */
export async function fetchRideHistory(limit = 10, offset = 0): Promise<Ride[]> {
  // In a real app, this would make an API call
  // For now, we'll simulate a network request with a timeout
  await new Promise(resolve => setTimeout(resolve, TIMING.RIDE_HISTORY_FETCH_DELAY_MS));

  // Return empty array for now
  // In a real app, this would return actual ride history from the API
  return [];
}

/**
 * Fetches cancellation reasons
 *
 * @returns Promise with cancellation reasons
 */
export async function fetchCancellationReasons(): Promise<CancellationReason[]> {
  // In a real app, this would make an API call
  // For now, we'll simulate a network request with a timeout
  await new Promise(resolve => setTimeout(resolve, TIMING.CANCELLATION_REASONS_FETCH_DELAY_MS));
  
  // Return mock data
  return [
    { id: 'wait-too-long', reason: 'Wait time too long' },
    { id: 'changed-mind', reason: 'Changed my mind' },
    { id: 'wrong-address', reason: 'Entered wrong address' },
    { id: 'driver-asked', reason: 'Driver asked me to cancel' },
    { id: 'other', reason: 'Other reason' }
  ];
}

/**
 * Helper function to calculate distance between two points
 */
function calculateDistance(loc1: MapLocation, loc2: MapLocation): number {
  const R = LOCATION.EARTH_RADIUS_KM;
  const dLat = toRad(loc2.latitude - loc1.latitude);
  const dLon = toRad(loc2.longitude - loc1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(loc1.latitude)) *
      Math.cos(toRad(loc2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
