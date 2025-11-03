/**
 * Driver information
 */
export interface Driver {
  id: string;
  name: string;
  photo: string;
  phoneNumber: string;
  email: string;
  rating: number;
  totalRides: number;
  vehicle: Vehicle;
  status: DriverStatus;
  location?: {
    latitude: number;
    longitude: number;
  };
  currentRideId?: string;
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
  type: VehicleType;
}

/**
 * Vehicle types
 */
export type VehicleType = 'sedan' | 'suv' | 'luxury' | 'xl' | 'eco';

/**
 * Driver status
 */
export type DriverStatus = 'offline' | 'available' | 'en_route' | 'arriving' | 'on_ride' | 'break';

/**
 * Driver rating submission
 */
export interface DriverRating {
  driverId: string;
  rideId: string;
  rating: number;
  comment?: string;
  timestamp: string;
}

/**
 * Driver state
 */
export interface DriverState {
  drivers: Driver[];
  assignedDriver: Driver | null;
  driverLocation: {
    latitude: number;
    longitude: number;
  } | null;
  driverEta: number | null;
  driverStatus: DriverStatus | null;
  driverRatings: DriverRating[];
  isLoading: boolean;
  error: string | null;
}
