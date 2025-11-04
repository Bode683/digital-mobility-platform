import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useRef,
} from "react";
import { MapLocation, useMap } from "../../map";
import { mockPaymentMethods, mockRideTypes } from "../api/mockData";
import {
  PaymentMethod,
  PriceFactors,
  Ride,
  RideBookingState,
  RideType,
  RouteData,
} from "../types";
import { calculatePrice } from "../utils/priceCalculation";

// Define action types
type RideBookingAction =
  | { type: "SET_PICKUP_LOCATION"; payload: MapLocation | null }
  | { type: "SET_DESTINATION_LOCATION"; payload: MapLocation | null }
  | {
      type: "SET_ROUTE_DATA";
      payload: {
        distance: number;
        duration: number;
        routeData: RouteData | null;
      };
    }
  | { type: "SET_AVAILABLE_RIDE_TYPES"; payload: RideType[] }
  | { type: "SELECT_RIDE_TYPE"; payload: RideType | null }
  | { type: "SET_PRICE_ESTIMATES"; payload: Record<string, number> }
  | { type: "SET_PAYMENT_METHODS"; payload: PaymentMethod[] }
  | { type: "SELECT_PAYMENT_METHOD"; payload: PaymentMethod | null }
  | { type: "SET_CURRENT_RIDE"; payload: Ride | null }
  | { type: "ADD_TO_RIDE_HISTORY"; payload: Ride }
  | { type: "SET_LOADING_ROUTE"; payload: boolean }
  | { type: "SET_LOADING_PRICES"; payload: boolean }
  | { type: "SET_REQUESTING_RIDE"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET_BOOKING" };

// Initial state
const initialPriceFactors: PriceFactors = {
  basePrice: 2.5,
  perKmRate: 1.25,
  perMinuteRate: 0.35,
  minimumFare: 5.0,
  surgePricing: 1.0, // No surge by default
};

const initialState: RideBookingState = {
  pickupLocation: null,
  destinationLocation: null,
  routeDistance: null,
  routeDuration: null,
  routeData: null,
  availableRideTypes: [],
  selectedRideType: null,
  priceEstimates: {},
  priceFactors: initialPriceFactors,
  paymentMethods: [],
  selectedPaymentMethod: null,
  currentRide: null,
  rideHistory: [],
  isLoadingRoute: false,
  isLoadingPrices: false,
  isRequestingRide: false,
  error: null,
};

// Reducer function
function rideBookingReducer(
  state: RideBookingState,
  action: RideBookingAction
): RideBookingState {
  switch (action.type) {
    case "SET_PICKUP_LOCATION":
      return { ...state, pickupLocation: action.payload };
    case "SET_DESTINATION_LOCATION":
      return { ...state, destinationLocation: action.payload };
    case "SET_ROUTE_DATA":
      return {
        ...state,
        routeDistance: action.payload.distance,
        routeDuration: action.payload.duration,
        routeData: action.payload.routeData,
      };
    case "SET_AVAILABLE_RIDE_TYPES":
      return { ...state, availableRideTypes: action.payload };
    case "SELECT_RIDE_TYPE":
      return { ...state, selectedRideType: action.payload };
    case "SET_PRICE_ESTIMATES":
      return { ...state, priceEstimates: action.payload };
    case "SET_PAYMENT_METHODS":
      return { ...state, paymentMethods: action.payload };
    case "SELECT_PAYMENT_METHOD":
      return { ...state, selectedPaymentMethod: action.payload };
    case "SET_CURRENT_RIDE":
      return { ...state, currentRide: action.payload };
    case "ADD_TO_RIDE_HISTORY":
      return {
        ...state,
        rideHistory: [action.payload, ...state.rideHistory],
      };
    case "SET_LOADING_ROUTE":
      return { ...state, isLoadingRoute: action.payload };
    case "SET_LOADING_PRICES":
      return { ...state, isLoadingPrices: action.payload };
    case "SET_REQUESTING_RIDE":
      return { ...state, isRequestingRide: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "RESET_BOOKING":
      return {
        ...initialState,
        paymentMethods: state.paymentMethods,
        rideHistory: state.rideHistory,
      };
    default:
      return state;
  }
}

// Create context
interface RideBookingContextType {
  state: RideBookingState;
  dispatch: React.Dispatch<RideBookingAction>;
  setPickupLocation: (location: MapLocation | null) => void;
  setDestinationLocation: (location: MapLocation | null) => void;
  calculateRoute: () => Promise<void>;
  selectRideType: (rideType: RideType | null) => void;
  selectPaymentMethod: (paymentMethod: PaymentMethod | null) => void;
  requestRide: () => Promise<Ride | null>;
  cancelRide: (rideId: string, reason?: string) => Promise<boolean>;
  resetBooking: () => void;
}

const RideBookingContext = createContext<RideBookingContextType | undefined>(
  undefined
);

// Provider component
interface RideBookingProviderProps {
  children: ReactNode;
}

export function RideBookingProvider({ children }: RideBookingProviderProps) {
  const [state, dispatch] = useReducer(rideBookingReducer, initialState);
  const { state: mapState } = useMap();

  // Load initial data
  useEffect(() => {
    // Load ride types
    dispatch({ type: "SET_AVAILABLE_RIDE_TYPES", payload: mockRideTypes });

    // Load payment methods
    dispatch({ type: "SET_PAYMENT_METHODS", payload: mockPaymentMethods });

    // Set default payment method if available
    const defaultPayment = mockPaymentMethods.find((p) => p.isDefault);
    if (defaultPayment) {
      dispatch({ type: "SELECT_PAYMENT_METHOD", payload: defaultPayment });
    }
  }, []);

  // Helper function to compare locations by value
  const locationsEqual = (loc1: MapLocation | null, loc2: MapLocation | null): boolean => {
    if (loc1 === loc2) return true;
    if (!loc1 || !loc2) return false;
    return (
      loc1.latitude === loc2.latitude &&
      loc1.longitude === loc2.longitude
    );
  };

  // Track previous values to prevent unnecessary syncs
  const prevPickupRef = useRef<MapLocation | null>(null);
  const prevDropoffRef = useRef<MapLocation | null>(null);

  // Sync with map context when locations change
  useEffect(() => {
    // Only sync if locations are actually different by value
    const pickupChanged = !locationsEqual(mapState.pickupLocation, prevPickupRef.current);
    const dropoffChanged = !locationsEqual(mapState.dropoffLocation, prevDropoffRef.current);

    // Only update if the location actually changed and is different from our state
    if (pickupChanged && !locationsEqual(mapState.pickupLocation, state.pickupLocation)) {
      prevPickupRef.current = mapState.pickupLocation;
      dispatch({
        type: "SET_PICKUP_LOCATION",
        payload: mapState.pickupLocation,
      });
    } else if (!pickupChanged) {
      prevPickupRef.current = mapState.pickupLocation;
    }

    if (dropoffChanged && !locationsEqual(mapState.dropoffLocation, state.destinationLocation)) {
      prevDropoffRef.current = mapState.dropoffLocation;
      dispatch({
        type: "SET_DESTINATION_LOCATION",
        payload: mapState.dropoffLocation,
      });
    } else if (!dropoffChanged) {
      prevDropoffRef.current = mapState.dropoffLocation;
    }
  }, [mapState.pickupLocation, mapState.dropoffLocation, state.pickupLocation, state.destinationLocation]);

  const calculatePriceEstimates = useCallback(() => {
    if (!state.routeDistance || !state.routeDuration) return;

    dispatch({ type: "SET_LOADING_PRICES", payload: true });

    try {
      const estimates: Record<string, number> = {};

      state.availableRideTypes.forEach((rideType) => {
        const price = calculatePrice(
          state.routeDistance!,
          state.routeDuration!,
          rideType,
          state.priceFactors
        );

        estimates[rideType.id] = price;
      });

      dispatch({ type: "SET_PRICE_ESTIMATES", payload: estimates });
    } catch (error) {
      console.error("Error calculating price estimates:", error);
    } finally {
      dispatch({ type: "SET_LOADING_PRICES", payload: false });
    }
  }, [state.routeDistance, state.routeDuration, state.availableRideTypes, state.priceFactors]);

  // Calculate price estimates when route or ride types change
  useEffect(() => {
    if (
      state.routeDistance &&
      state.routeDuration &&
      state.availableRideTypes.length > 0
    ) {
      calculatePriceEstimates();
    }
  }, [state.routeDistance, state.routeDuration, state.availableRideTypes, calculatePriceEstimates]);

  // Helper functions
  const setPickupLocation = (location: MapLocation | null) => {
    dispatch({ type: "SET_PICKUP_LOCATION", payload: location });
  };

  const setDestinationLocation = (location: MapLocation | null) => {
    dispatch({ type: "SET_DESTINATION_LOCATION", payload: location });
  };

  // Helper function to calculate distance between two points
  const calculateDistance = useCallback((loc1: MapLocation, loc2: MapLocation): number => {
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
  }, []);

  const calculateRoute = useCallback(async () => {
    const { pickupLocation, destinationLocation } = state;

    if (!pickupLocation || !destinationLocation) {
      dispatch({
        type: "SET_ERROR",
        payload: "Both pickup and destination locations are required",
      });
      return;
    }

    dispatch({ type: "SET_LOADING_ROUTE", payload: true });

    try {
      // In a real app, this would call an API to get route data
      // For now, we'll simulate it with a timeout and mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Calculate straight-line distance for demo
      const distance = calculateDistance(pickupLocation, destinationLocation);
      const duration = distance * 2 * 60; // Rough estimate: 30 km/h average speed

      // Mock route data
      const routeData: RouteData = {
        geometry: {
          type: "LineString",
          coordinates: [
            [pickupLocation.longitude, pickupLocation.latitude],
            [destinationLocation.longitude, destinationLocation.latitude],
          ],
        },
        distance: distance * 1000, // Convert to meters
        duration: duration, // In seconds
        steps: [
          {
            instruction: "Start at pickup location",
            distance: 0,
            duration: 0,
          },
          {
            instruction: "Drive to destination",
            distance: distance * 1000,
            duration: duration,
          },
        ],
      };

      dispatch({
        type: "SET_ROUTE_DATA",
        payload: {
          distance: distance,
          duration: duration / 60, // Convert to minutes
          routeData,
        },
      });

      // Auto-select first ride type if none selected
      // Use state from closure, but this will work since we're reading from the current state
      if (!state.selectedRideType && state.availableRideTypes.length > 0) {
        dispatch({
          type: "SELECT_RIDE_TYPE",
          payload: state.availableRideTypes[0],
        });
      }
    } catch (error) {
      console.error("Error calculating route:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to calculate route" });
    } finally {
      dispatch({ type: "SET_LOADING_ROUTE", payload: false });
    }
  }, [state.pickupLocation, state.destinationLocation, state.selectedRideType, state.availableRideTypes, calculateDistance]);

  const selectRideType = (rideType: RideType | null) => {
    dispatch({ type: "SELECT_RIDE_TYPE", payload: rideType });
  };

  const selectPaymentMethod = (paymentMethod: PaymentMethod | null) => {
    dispatch({ type: "SELECT_PAYMENT_METHOD", payload: paymentMethod });
  };

  const requestRide = async (): Promise<Ride | null> => {
    const {
      pickupLocation,
      destinationLocation,
      selectedRideType,
      selectedPaymentMethod,
    } = state;

    if (!pickupLocation || !destinationLocation) {
      dispatch({
        type: "SET_ERROR",
        payload: "Both pickup and destination locations are required",
      });
      return null;
    }

    if (!selectedRideType) {
      dispatch({ type: "SET_ERROR", payload: "Please select a ride type" });
      return null;
    }

    if (!selectedPaymentMethod) {
      dispatch({
        type: "SET_ERROR",
        payload: "Please select a payment method",
      });
      return null;
    }

    dispatch({ type: "SET_REQUESTING_RIDE", payload: true });

    try {
      // In a real app, this would call an API to request a ride
      // For now, we'll simulate it with a timeout and mock data
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock ride creation
      const now = new Date();
      const estimatedArrival = new Date(now.getTime() + 5 * 60000); // 5 minutes from now

      const ride: Ride = {
        id: `ride-${Date.now()}`,
        status: "requested",
        pickup: pickupLocation,
        destination: destinationLocation,
        fare: state.priceEstimates[selectedRideType.id] || 0,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        estimatedArrival: estimatedArrival.toISOString(),
        rideType: selectedRideType,
        paymentMethod: selectedPaymentMethod,
        route: state.routeData || undefined,
      };

      dispatch({ type: "SET_CURRENT_RIDE", payload: ride });
      return ride;
    } catch (error) {
      console.error("Error requesting ride:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to request ride" });
      return null;
    } finally {
      dispatch({ type: "SET_REQUESTING_RIDE", payload: false });
    }
  };

  const cancelRide = async (
    rideId: string,
    reason?: string
  ): Promise<boolean> => {
    if (!state.currentRide || state.currentRide.id !== rideId) {
      dispatch({ type: "SET_ERROR", payload: "Invalid ride ID" });
      return false;
    }

    try {
      // In a real app, this would call an API to cancel the ride
      // For now, we'll simulate it with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const cancelledRide: Ride = {
        ...state.currentRide,
        status: "cancelled",
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: "SET_CURRENT_RIDE", payload: null });
      dispatch({ type: "ADD_TO_RIDE_HISTORY", payload: cancelledRide });

      return true;
    } catch (error) {
      console.error("Error cancelling ride:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to cancel ride" });
      return false;
    }
  };

  const resetBooking = () => {
    dispatch({ type: "RESET_BOOKING" });
  };

  const toRad = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  const contextValue: RideBookingContextType = {
    state,
    dispatch,
    setPickupLocation,
    setDestinationLocation,
    calculateRoute,
    selectRideType,
    selectPaymentMethod,
    requestRide,
    cancelRide,
    resetBooking,
  };

  return (
    <RideBookingContext.Provider value={contextValue}>
      {children}
    </RideBookingContext.Provider>
  );
}

// Custom hook to use the ride booking context
export function useRideBooking() {
  const context = useContext(RideBookingContext);
  if (context === undefined) {
    throw new Error("useRideBooking must be used within a RideBookingProvider");
  }
  return context;
}