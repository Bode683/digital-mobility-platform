import { MapLocation } from '../../map';

/**
 * Ride type options available for selection
 */
export interface RideType {
  id: string;
  name: string;
  description: string;
  capacity: number;
  icon: string;
  priceMultiplier: number;
  estimatedPickupMinutes?: number;
}

/**
 * Price calculation factors
 */
export interface PriceFactors {
  basePrice: number;
  perKmRate: number;
  perMinuteRate: number;
  minimumFare: number;
  surgePricing: number; // 1.0 = normal, 1.5 = 50% surge
}

/**
 * Payment method information
 */
export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'cash' | 'apple_pay' | 'google_pay';
  label: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
}

/**
 * Driver information
 */
export interface Driver {
  id: string;
  name: string;
  rating: number;
  photo: string;
  phoneNumber: string;
  vehicle: Vehicle;
}

/**
 * Vehicle information
 */
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  color: string;
  licensePlate: string;
  year: number;
}

/**
 * Route step information
 */
export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
}

/**
 * Route data information
 */
export interface RouteData {
  geometry: any; // GeoJSON.Geometry
  distance: number; // meters
  duration: number; // seconds
  steps: RouteStep[];
}

/**
 * Ride status types
 */
export type RideStatus = 
  | 'requested'
  | 'accepted'
  | 'arriving'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

/**
 * Ride information
 */
export interface Ride {
  id: string;
  status: RideStatus;
  pickup: MapLocation;
  destination: MapLocation;
  driver?: Driver;
  vehicle?: Vehicle;
  fare: number;
  createdAt: string;
  updatedAt: string;
  estimatedArrival?: string;
  route?: RouteData;
  rideType: RideType;
  paymentMethod: PaymentMethod;
}

/**
 * Ride request information
 */
export interface RideRequest {
  pickup: MapLocation;
  destination: MapLocation;
  rideTypeId: string;
  paymentMethodId: string;
}

/**
 * Ride booking state
 */
export interface RideBookingState {
  // Location data
  pickupLocation: MapLocation | null;
  destinationLocation: MapLocation | null;
  
  // Route data
  routeDistance: number | null;
  routeDuration: number | null;
  routeData: RouteData | null;
  
  // Ride options
  availableRideTypes: RideType[];
  selectedRideType: RideType | null;
  
  // Pricing
  priceEstimates: Record<string, number>;
  priceFactors: PriceFactors;
  
  // Payment
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  
  // Active ride
  currentRide: Ride | null;
  rideHistory: Ride[];
  
  // UI state
  isLoadingRoute: boolean;
  isLoadingPrices: boolean;
  isRequestingRide: boolean;
  error: string | null;
}

/**
 * Ride cancellation reason
 */
export interface CancellationReason {
  id: string;
  reason: string;
}
