/**
 * Interpolates a position along a path of coordinates based on a progress value (0-1)
 */
export function interpolate(
  coordinates: [number, number][],
  progress: number
): [number, number] {
  if (progress <= 0) return coordinates[0];
  if (progress >= 1) return coordinates[coordinates.length - 1];

  // Calculate total distance of the path
  let totalDistance = 0;
  const distances: number[] = [];
  
  for (let i = 1; i < coordinates.length; i++) {
    const distance = getDistance(coordinates[i - 1], coordinates[i]);
    distances.push(distance);
    totalDistance += distance;
  }

  // Find the target distance based on progress
  const targetDistance = totalDistance * progress;

  // Find the segment that contains the target distance
  let currentDistance = 0;
  for (let i = 0; i < distances.length; i++) {
    if (currentDistance + distances[i] >= targetDistance) {
      // Calculate progress within this segment
      const segmentProgress = (targetDistance - currentDistance) / distances[i];
      return interpolatePoints(
        coordinates[i],
        coordinates[i + 1],
        segmentProgress
      );
    }
    currentDistance += distances[i];
  }

  return coordinates[coordinates.length - 1];
}

/**
 * Calculates the distance between two coordinates using the Haversine formula
 */
function getDistance(
  [lon1, lat1]: [number, number],
  [lon2, lat2]: [number, number]
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Linearly interpolates between two points based on a progress value (0-1)
 */
function interpolatePoints(
  [lon1, lat1]: [number, number],
  [lon2, lat2]: [number, number],
  progress: number
): [number, number] {
  return [
    lon1 + (lon2 - lon1) * progress,
    lat1 + (lat2 - lat1) * progress,
  ];
}