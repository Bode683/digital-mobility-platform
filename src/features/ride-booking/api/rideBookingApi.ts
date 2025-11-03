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
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock data
  return mockRideTypes;
}

/**
 * Fetches route information between two points
 * 
 * @param pickup Pickup location
 * @param destination Destination location
 * @returns Promise with route data
 */
export async function fetchRoute(
  pickup: MapLocation,
  destination: MapLocation
): Promise<RouteData> {
  // In a real app, this would call a routing API like Mapbox Directions
  // For now, we'll simulate it with a timeout and mock data
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Calculate straight-line distance for demo
  const distance = calculateDistance(pickup, destination);
  const duration = distance * 2 * 60; // Rough estimate: 30 km/h average speed
  
  // Mock route data
  return {
    geometry: {
      type: 'LineString',
      coordinates: [
        [pickup.longitude, pickup.latitude],
        [destination.longitude, destination.latitude]
      ]
    },
    distance: distance * 1000, // Convert to meters
    duration: duration, // In seconds
    steps: [
      {
        instruction: 'Start at pickup location',
        distance: 0,
        duration: 0
      },
      {
        instruction: 'Drive to destination',
        distance: distance * 1000,
        duration: duration
      }
    ]
  };
}

/**
 * Fetches user's payment methods
 * 
 * @returns Promise with payment methods
 */
export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  // In a real app, this would make an API call
  // For now, we'll simulate a network request with a timeout
  await new Promise(resolve => setTimeout(resolve, 800));
  
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
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Get the selected ride type and payment method
  const rideType = mockRideTypes.find(rt => rt.id === request.rideTypeId);
  const paymentMethod = mockPaymentMethods.find(pm => pm.id === request.paymentMethodId);
  
  if (!rideType || !paymentMethod) {
    throw new Error('Invalid ride type or payment method');
  }
  
  // Mock route data
  const routeData = await fetchRoute(request.pickup, request.destination);
  
  // Calculate fare based on distance and duration
  const distanceKm = routeData.distance / 1000;
  const durationMin = routeData.duration / 60;
  const baseFare = 2.5;
  const distanceFare = distanceKm * 1.25;
  const timeFare = durationMin * 0.35;
  const subtotal = baseFare + distanceFare + timeFare;
  const fare = Math.max(subtotal * rideType.priceMultiplier, 5.0);
  
  // Create a mock ride
  const now = new Date();
  const estimatedArrival = new Date(now.getTime() + 5 * 60000); // 5 minutes from now
  
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
  await new Promise(resolve => setTimeout(resolve, 1000));
  
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
  await new Promise(resolve => setTimeout(resolve, 1200));
  
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
  await new Promise(resolve => setTimeout(resolve, 500));
  
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
  const R = 6371; // Earth's radius in km
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
