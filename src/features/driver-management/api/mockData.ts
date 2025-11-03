import { Driver, DriverRating, DriverStatus } from '../types';

/**
 * Mock driver data
 */
export const mockDrivers: Driver[] = [
  {
    id: 'driver-1',
    name: 'John Smith',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    phoneNumber: '+1 (555) 123-4567',
    email: 'john.smith@example.com',
    rating: 4.8,
    totalRides: 1245,
    status: 'available',
    vehicle: {
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Camry',
      color: 'Silver',
      licensePlate: 'ABC 123',
      year: 2020,
      type: 'sedan'
    }
  },
  {
    id: 'driver-2',
    name: 'Sarah Johnson',
    photo: 'https://randomuser.me/api/portraits/women/44.jpg',
    phoneNumber: '+1 (555) 234-5678',
    email: 'sarah.johnson@example.com',
    rating: 4.9,
    totalRides: 2187,
    status: 'available',
    vehicle: {
      id: 'vehicle-2',
      make: 'Honda',
      model: 'Accord',
      color: 'Black',
      licensePlate: 'XYZ 789',
      year: 2021,
      type: 'sedan'
    }
  },
  {
    id: 'driver-3',
    name: 'Michael Chen',
    photo: 'https://randomuser.me/api/portraits/men/59.jpg',
    phoneNumber: '+1 (555) 345-6789',
    email: 'michael.chen@example.com',
    rating: 4.7,
    totalRides: 876,
    status: 'available',
    vehicle: {
      id: 'vehicle-3',
      make: 'Tesla',
      model: 'Model Y',
      color: 'White',
      licensePlate: 'EV 456',
      year: 2022,
      type: 'eco'
    }
  },
  {
    id: 'driver-4',
    name: 'Emily Davis',
    photo: 'https://randomuser.me/api/portraits/women/22.jpg',
    phoneNumber: '+1 (555) 456-7890',
    email: 'emily.davis@example.com',
    rating: 4.6,
    totalRides: 543,
    status: 'available',
    vehicle: {
      id: 'vehicle-4',
      make: 'Chevrolet',
      model: 'Suburban',
      color: 'Blue',
      licensePlate: 'SUV 789',
      year: 2019,
      type: 'xl'
    }
  },
  {
    id: 'driver-5',
    name: 'James Wilson',
    photo: 'https://randomuser.me/api/portraits/men/78.jpg',
    phoneNumber: '+1 (555) 567-8901',
    email: 'james.wilson@example.com',
    rating: 5.0,
    totalRides: 1876,
    status: 'available',
    vehicle: {
      id: 'vehicle-5',
      make: 'Mercedes-Benz',
      model: 'S-Class',
      color: 'Black',
      licensePlate: 'LUX 123',
      year: 2022,
      type: 'luxury'
    }
  }
];

/**
 * Mock driver ratings
 */
export const mockDriverRatings: DriverRating[] = [
  {
    driverId: 'driver-1',
    rideId: 'ride-123',
    rating: 5,
    comment: 'Excellent service, very professional!',
    timestamp: '2025-10-28T14:23:45Z'
  },
  {
    driverId: 'driver-2',
    rideId: 'ride-124',
    rating: 4,
    comment: 'Good ride, but arrived a bit late.',
    timestamp: '2025-10-29T09:15:22Z'
  },
  {
    driverId: 'driver-3',
    rideId: 'ride-125',
    rating: 5,
    comment: 'Very clean car and friendly driver.',
    timestamp: '2025-10-30T18:42:11Z'
  }
];

/**
 * Simulates finding a driver near a location
 * 
 * @param latitude Pickup latitude
 * @param longitude Pickup longitude
 * @param vehicleType Optional vehicle type preference
 * @returns Promise with a driver or null
 */
export async function findNearbyDriver(
  latitude: number,
  longitude: number,
  vehicleType?: string
): Promise<Driver | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Filter by vehicle type if provided
  let availableDrivers = mockDrivers.filter(driver => driver.status === 'available');
  
  if (vehicleType) {
    availableDrivers = availableDrivers.filter(driver => driver.vehicle.type === vehicleType);
  }
  
  // If no drivers match the criteria, return null
  if (availableDrivers.length === 0) {
    return null;
  }
  
  // Select a random driver from available drivers
  const randomIndex = Math.floor(Math.random() * availableDrivers.length);
  const selectedDriver = { ...availableDrivers[randomIndex] };
  
  // Add a location near the pickup point (slightly offset)
  selectedDriver.location = {
    latitude: latitude + (Math.random() * 0.01 - 0.005),
    longitude: longitude + (Math.random() * 0.01 - 0.005)
  };
  
  // Update status
  selectedDriver.status = 'en_route';
  
  return selectedDriver;
}

/**
 * Simulates updating a driver's location
 * 
 * @param driverId Driver ID
 * @param targetLatitude Target latitude (pickup or destination)
 * @param targetLongitude Target longitude (pickup or destination)
 * @param status Optional status update
 * @returns Updated driver or null if not found
 */
export async function updateDriverLocation(
  driverId: string,
  targetLatitude: number,
  targetLongitude: number,
  status?: DriverStatus
): Promise<Driver | null> {
  // Find the driver
  const driverIndex = mockDrivers.findIndex(d => d.id === driverId);
  if (driverIndex === -1) return null;
  
  const driver = { ...mockDrivers[driverIndex] };
  
  // If driver has no location yet, create one
  if (!driver.location) {
    driver.location = {
      latitude: targetLatitude + (Math.random() * 0.02 - 0.01),
      longitude: targetLongitude + (Math.random() * 0.02 - 0.01)
    };
  } else {
    // Move driver closer to target
    const movePercent = 0.2; // Move 20% closer to target
    driver.location = {
      latitude: driver.location.latitude + (targetLatitude - driver.location.latitude) * movePercent,
      longitude: driver.location.longitude + (targetLongitude - driver.location.longitude) * movePercent
    };
  }
  
  // Update status if provided
  if (status) {
    driver.status = status;
  }
  
  // Update the driver in the mock data
  mockDrivers[driverIndex] = driver;
  
  return driver;
}

/**
 * Simulates submitting a driver rating
 * 
 * @param rating Driver rating data
 * @returns Success status
 */
export async function submitDriverRating(rating: DriverRating): Promise<boolean> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Add to mock ratings
  mockDriverRatings.push(rating);
  
  // Update driver's rating
  const driverIndex = mockDrivers.findIndex(d => d.id === rating.driverId);
  if (driverIndex !== -1) {
    const driver = mockDrivers[driverIndex];
    
    // Calculate new average rating
    const totalRatingPoints = driver.rating * driver.totalRides + rating.rating;
    const newTotalRides = driver.totalRides + 1;
    const newRating = totalRatingPoints / newTotalRides;
    
    // Update driver
    mockDrivers[driverIndex] = {
      ...driver,
      rating: parseFloat(newRating.toFixed(1)),
      totalRides: newTotalRides
    };
  }
  
  return true;
}
