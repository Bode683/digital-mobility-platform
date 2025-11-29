/**
 * Distance and navigation calculation utilities
 * 
 * Uses Haversine formula for distance calculations and spherical law of cosines
 * for bearing calculations.
 */

export interface Coordinate {
  latitude: number;
  longitude: number;
}

/**
 * Converts degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Converts radians to degrees
 */
function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Calculates the distance between two coordinates using the Haversine formula
 * 
 * @param from Starting coordinate
 * @param to Ending coordinate
 * @returns Distance in kilometers
 */
export function calculateDistance(from: Coordinate, to: Coordinate): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates the bearing (direction) from one coordinate to another
 * 
 * @param from Starting coordinate
 * @param to Ending coordinate
 * @returns Bearing in radians
 */
export function calculateBearing(from: Coordinate, to: Coordinate): number {
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1Rad = toRadians(from.latitude);
  const lat2Rad = toRadians(to.latitude);
  
  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  
  return Math.atan2(y, x);
}

/**
 * Moves a point toward a target at a constant speed
 * 
 * @param current Current coordinate
 * @param target Target coordinate
 * @param speedKmh Speed in kilometers per hour
 * @param intervalSeconds Time interval in seconds
 * @returns New coordinate and remaining distance
 */
export function moveTowardTarget(
  current: Coordinate,
  target: Coordinate,
  speedKmh: number,
  intervalSeconds: number
): { coordinate: Coordinate; remainingDistance: number } {
  const distance = calculateDistance(current, target);
  
  // If already very close (within 50 meters), snap to exact location
  if (distance < 0.05) {
    return {
      coordinate: target,
      remainingDistance: 0,
    };
  }

  // Calculate distance to move (speed in km/h * interval in hours)
  const distanceToMove = (speedKmh * intervalSeconds) / 3600;
  
  // If we would overshoot, just move to target
  if (distanceToMove >= distance) {
    return {
      coordinate: target,
      remainingDistance: 0,
    };
  }

  // Calculate bearing
  const bearing = calculateBearing(current, target);
  
  // Calculate new position using spherical earth model
  const lat1Rad = toRadians(current.latitude);
  const lon1Rad = toRadians(current.longitude);
  const angularDistance = distanceToMove / 6371; // Earth's radius in km
  
  const newLatRad = Math.asin(
    Math.sin(lat1Rad) * Math.cos(angularDistance) +
      Math.cos(lat1Rad) * Math.sin(angularDistance) * Math.cos(bearing)
  );
  
  const newLonRad =
    lon1Rad +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1Rad),
      Math.cos(angularDistance) - Math.sin(lat1Rad) * Math.sin(newLatRad)
    );
  
  return {
    coordinate: {
      latitude: toDegrees(newLatRad),
      longitude: toDegrees(newLonRad),
    },
    remainingDistance: distance - distanceToMove,
  };
}

/**
 * Checks if a coordinate is within a threshold distance of a target
 * 
 * @param current Current coordinate
 * @param target Target coordinate
 * @param thresholdKm Threshold distance in kilometers (default: 0.05 = 50 meters)
 * @returns true if within threshold
 */
export function isNearTarget(
  current: Coordinate,
  target: Coordinate,
  thresholdKm: number = 0.05
): boolean {
  const distance = calculateDistance(current, target);
  return distance < thresholdKm;
}

/**
 * Formats distance for display
 * 
 * @param distanceKm Distance in kilometers
 * @returns Formatted string (e.g., "1.2 km" or "450 m")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Estimates time of arrival based on distance and speed
 * 
 * @param distanceKm Distance in kilometers
 * @param speedKmh Average speed in km/h
 * @returns Estimated time in minutes
 */
export function estimateArrivalTime(distanceKm: number, speedKmh: number): number {
  return Math.round((distanceKm / speedKmh) * 60);
}
