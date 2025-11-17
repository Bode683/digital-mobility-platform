import { useCallback, useEffect, useRef, useState } from 'react';
import type { Ride } from '../types';
import { calculateDistance, isNearTarget, moveTowardTarget, type Coordinate } from '../utils/distanceCalculator';
import { getNextStatus, validateTransition, type RideStatus } from '../utils/rideStateMachine';

interface DriverLocationState {
  location: Coordinate | null;
  isMoving: boolean;
  distanceToTarget: number;
  targetLocation: Coordinate | null;
}

interface UseDriverLocationOptions {
  speedKmh?: number;
  updateIntervalMs?: number;
  arrivalThresholdKm?: number;
  onStatusChange?: (newStatus: RideStatus) => void;
}

/**
 * Custom hook for managing driver location simulation
 * 
 * Handles all driver movement logic, including:
 * - Moving toward pickup location
 * - Detecting arrival at pickup
 * - Moving toward destination
 * - Detecting arrival at destination
 * - Triggering status transitions
 * 
 * @param ride Current ride object
 * @param options Configuration options
 * @returns Driver location state
 */
export function useDriverLocation(
  ride: Ride | null,
  options: UseDriverLocationOptions = {}
) {
  const {
    speedKmh = 30, // Default: 30 km/h
    updateIntervalMs = 2000, // Default: update every 2 seconds
    arrivalThresholdKm = 0.05, // Default: 50 meters
    onStatusChange,
  } = options;

  const [state, setState] = useState<DriverLocationState>({
    location: null,
    isMoving: false,
    distanceToTarget: 0,
    targetLocation: null,
  });

  // Track arrival states to prevent multiple triggers
  const hasArrivedAtPickupRef = useRef(false);
  const hasArrivedAtDestinationRef = useRef(false);
  const previousRideIdRef = useRef<string | null>(null);

  // Determine target location based on ride status
  const getTargetLocation = useCallback(
    (currentRide: Ride): Coordinate | null => {
      if (!currentRide) return null;

      const status = currentRide.status;

      if (status === 'requested' || status === 'accepted' || status === 'arriving') {
        return currentRide.pickup;
      } else if (status === 'in_progress') {
        return currentRide.destination;
      }

      return null;
    },
    []
  );

  // Initialize driver location when ride changes
  useEffect(() => {
    if (!ride) {
      setState({
        location: null,
        isMoving: false,
        distanceToTarget: 0,
        targetLocation: null,
      });
      hasArrivedAtPickupRef.current = false;
      hasArrivedAtDestinationRef.current = false;
      previousRideIdRef.current = null;
      return;
    }

    // Only reinitialize if ride ID changed
    if (ride.id !== previousRideIdRef.current) {
      previousRideIdRef.current = ride.id;
      hasArrivedAtPickupRef.current = false;
      hasArrivedAtDestinationRef.current = false;

      // Initialize driver location near pickup (slightly offset)
      const initialLocation: Coordinate = {
        latitude: ride.pickup.latitude - 0.01,
        longitude: ride.pickup.longitude - 0.01,
      };

      const target = getTargetLocation(ride);
      const distance = target ? calculateDistance(initialLocation, target) : 0;

      setState({
        location: initialLocation,
        isMoving: true,
        distanceToTarget: distance,
        targetLocation: target,
      });
    }
  }, [ride?.id, getTargetLocation]);

  // Update driver location at regular intervals
  useEffect(() => {
    if (!ride || !state.location) return;

    const target = getTargetLocation(ride);
    if (!target) {
      setState(prev => ({ ...prev, isMoving: false, targetLocation: null }));
      return;
    }

    // Update target if it changed
    if (
      !state.targetLocation ||
      state.targetLocation.latitude !== target.latitude ||
      state.targetLocation.longitude !== target.longitude
    ) {
      setState(prev => ({ ...prev, targetLocation: target }));
    }

    const interval = setInterval(() => {
      setState(prevState => {
        if (!prevState.location || !target) return prevState;

        // Check if driver should be held at pickup (waiting for trip to start)
        if (
          hasArrivedAtPickupRef.current &&
          ride.status === 'arriving' &&
          isNearTarget(prevState.location, ride.pickup, arrivalThresholdKm)
        ) {
          // Keep driver at pickup location
          return {
            ...prevState,
            location: ride.pickup,
            isMoving: false,
            distanceToTarget: 0,
          };
        }

        // Move toward target
        const result = moveTowardTarget(
          prevState.location,
          target,
          speedKmh,
          updateIntervalMs / 1000
        );

        return {
          ...prevState,
          location: result.coordinate,
          distanceToTarget: result.remainingDistance,
          isMoving: result.remainingDistance > 0,
        };
      });
    }, updateIntervalMs);

    return () => clearInterval(interval);
  }, [ride, state.location, state.targetLocation, getTargetLocation, speedKmh, updateIntervalMs, arrivalThresholdKm]);

  // Check for arrivals and trigger status transitions
  useEffect(() => {
    if (!ride || !state.location) return;

    // Check arrival at pickup
    if (
      !hasArrivedAtPickupRef.current &&
      (ride.status === 'requested' || ride.status === 'accepted') &&
      isNearTarget(state.location, ride.pickup, arrivalThresholdKm)
    ) {
      hasArrivedAtPickupRef.current = true;

      // Transition to 'arriving'
      const newStatus = getNextStatus(ride.status, 'driver_arrived');
      if (validateTransition(ride.status, newStatus) && onStatusChange) {
        onStatusChange(newStatus);

        // After 3 seconds, transition to 'in_progress' (trip started)
        setTimeout(() => {
          const nextStatus = getNextStatus('arriving', 'trip_started');
          if (onStatusChange) {
            onStatusChange(nextStatus);
          }
        }, 3000);
      }
    }

    // Check arrival at destination
    if (
      !hasArrivedAtDestinationRef.current &&
      ride.status === 'in_progress' &&
      isNearTarget(state.location, ride.destination, arrivalThresholdKm)
    ) {
      hasArrivedAtDestinationRef.current = true;

      // Transition to 'completed'
      const newStatus = getNextStatus(ride.status, 'trip_ended');
      if (validateTransition(ride.status, newStatus) && onStatusChange) {
        onStatusChange(newStatus);
      }
    }
  }, [ride, state.location, arrivalThresholdKm, onStatusChange]);

  return state;
}
