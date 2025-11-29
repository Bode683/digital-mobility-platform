/**
 * Ride Status State Machine
 * 
 * Manages valid state transitions for the ride workflow to prevent race conditions
 * and ensure business logic consistency.
 */

export type RideStatus = 
  | 'requested'
  | 'accepted'
  | 'arriving'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type RideTrigger = 
  | 'driver_assigned'
  | 'driver_arrived'
  | 'trip_started'
  | 'trip_ended'
  | 'user_cancelled'
  | 'driver_cancelled';

/**
 * Valid status transitions map
 * Each status maps to an array of statuses it can transition to
 */
export const VALID_TRANSITIONS: Record<RideStatus, RideStatus[]> = {
  requested: ['accepted', 'cancelled'],
  accepted: ['arriving', 'cancelled'],
  arriving: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
};

/**
 * Validates if a transition from one status to another is allowed
 * 
 * @param from Current ride status
 * @param to Target ride status
 * @returns true if transition is valid, false otherwise
 */
export function validateTransition(from: RideStatus, to: RideStatus): boolean {
  // Same status is always valid (idempotent updates)
  if (from === to) {
    return true;
  }
  
  // Check if transition is in the valid transitions map
  const validNextStates = VALID_TRANSITIONS[from];
  return validNextStates.includes(to);
}

/**
 * Gets the next status based on current status and trigger event
 * 
 * @param current Current ride status
 * @param trigger Event that triggers the transition
 * @returns Next status, or current status if no valid transition
 */
export function getNextStatus(current: RideStatus, trigger: RideTrigger): RideStatus {
  switch (trigger) {
    case 'driver_assigned':
      if (current === 'requested') return 'accepted';
      break;
      
    case 'driver_arrived':
      if (current === 'accepted') return 'arriving';
      break;
      
    case 'trip_started':
      if (current === 'arriving') return 'in_progress';
      break;
      
    case 'trip_ended':
      if (current === 'in_progress') return 'completed';
      break;
      
    case 'user_cancelled':
    case 'driver_cancelled':
      // Can cancel from any active status
      if (['requested', 'accepted', 'arriving', 'in_progress'].includes(current)) {
        return 'cancelled';
      }
      break;
  }
  
  // If no valid transition found, return current status
  return current;
}

/**
 * Gets a human-readable description of a status
 * 
 * @param status Ride status
 * @returns Human-readable description
 */
export function getStatusDescription(status: RideStatus): string {
  switch (status) {
    case 'requested':
      return 'Finding your driver...';
    case 'accepted':
      return 'Driver is on the way';
    case 'arriving':
      return 'Driver is arriving now';
    case 'in_progress':
      return 'On the way to destination';
    case 'completed':
      return 'Ride completed';
    case 'cancelled':
      return 'Ride cancelled';
    default:
      return 'Processing...';
  }
}

/**
 * Checks if a ride status is terminal (no further transitions possible)
 * 
 * @param status Ride status
 * @returns true if status is terminal
 */
export function isTerminalStatus(status: RideStatus): boolean {
  return status === 'completed' || status === 'cancelled';
}

/**
 * Checks if a ride can be cancelled from the given status
 * 
 * @param status Ride status
 * @returns true if ride can be cancelled
 */
export function canBeCancelled(status: RideStatus): boolean {
  return VALID_TRANSITIONS[status].includes('cancelled');
}
