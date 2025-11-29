import { useCallback, useEffect, useRef, useState } from 'react';
import type { Ride } from '../types';
import { calculateDistance, isNearTarget, moveTowardTarget, type Coordinate } from '../utils/distanceCalculator';
import { getNextStatus, validateTransition, type RideStatus } from '../utils/rideStateMachine';
import { TIMING, LOCATION } from '../constants';

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
    speedKmh = LOCATION.DEFAULT_DRIVER_SPEED_KMH,
    updateIntervalMs = TIMING.DRIVER_LOCATION_UPDATE_INTERVAL_MS,
    arrivalThresholdKm = LOCATION.ARRIVAL_THRESHOLD_KM,
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
  const tripStartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentRideRef = useRef<Ride | null>(null);

  // Keep ref updated with current ride
  useEffect(() => {
    currentRideRef.current = ride;
  }, [ride]);

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

      // Clear any pending timeouts
      if (tripStartTimeoutRef.current) {
        clearTimeout(tripStartTimeoutRef.current);
        tripStartTimeoutRef.current = null;
      }
      return;
    }

    // Only reinitialize if ride ID changed
    if (ride.id !== previousRideIdRef.current) {
      previousRideIdRef.current = ride.id;
      hasArrivedAtPickupRef.current = false;
      hasArrivedAtDestinationRef.current = false;

      // Clear any pending timeouts from previous ride
      if (tripStartTimeoutRef.current) {
        clearTimeout(tripStartTimeoutRef.current);
        tripStartTimeoutRef.current = null;
      }

      // Initialize driver location near pickup (slightly offset)
      const initialLocation: Coordinate = {
        latitude: ride.pickup.latitude - LOCATION.INITIAL_DRIVER_OFFSET_DEGREES,
        longitude: ride.pickup.longitude - LOCATION.INITIAL_DRIVER_OFFSET_DEGREES,
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
    if (!ride) return;

    const target = getTargetLocation(ride);
    if (!target) {
      setState(prev => ({ ...prev, isMoving: false, targetLocation: null }));
      return;
    }

    // Update target if it changed
    setState(prev => {
      if (
        !prev.targetLocation ||
        prev.targetLocation.latitude !== target.latitude ||
        prev.targetLocation.longitude !== target.longitude
      ) {
        return { ...prev, targetLocation: target };
      }
      return prev;
    });

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
  }, [ride, ride?.status, getTargetLocation, speedKmh, updateIntervalMs, arrivalThresholdKm]);

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
      console.log('[useDriverLocation] Driver arrived at pickup, transitioning to arriving');

      // Transition to 'arriving'
      const newStatus = getNextStatus(ride.status, 'driver_arrived');
      if (validateTransition(ride.status, newStatus) && onStatusChange) {
        onStatusChange(newStatus);

        // After delay, transition to 'in_progress' (trip started)
        // Store timeout ref so it can be cleared if ride is cancelled
        tripStartTimeoutRef.current = setTimeout(() => {
          // Use ref to get current ride status (avoid stale closure)
          const currentRide = currentRideRef.current;
          console.log('[useDriverLocation] Trip start timeout fired, current status:', currentRide?.status);
          if (currentRide && currentRide.status === 'arriving') {
            const nextStatus = getNextStatus('arriving', 'trip_started');
            if (validateTransition('arriving', nextStatus) && onStatusChange) {
              console.log('[useDriverLocation] Transitioning to in_progress');
              onStatusChange(nextStatus);
            }
          }
          tripStartTimeoutRef.current = null;
        }, TIMING.TRIP_START_DELAY_MS);
      }
    }

    // Check arrival at destination
    if (
      !hasArrivedAtDestinationRef.current &&
      ride.status === 'in_progress' &&
      isNearTarget(state.location, ride.destination, arrivalThresholdKm)
    ) {
      hasArrivedAtDestinationRef.current = true;
      console.log('[useDriverLocation] Driver arrived at destination, transitioning to completed');

      // Transition to 'completed'
      const newStatus = getNextStatus(ride.status, 'trip_ended');
      if (validateTransition(ride.status, newStatus) && onStatusChange) {
        onStatusChange(newStatus);
      }
    }
  }, [ride, state.location, arrivalThresholdKm, onStatusChange]);

  return state;
}
