import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { MapLocation } from "../../map";
import {
  findNearbyDriver,
  mockDrivers,
  submitDriverRating,
  updateDriverLocation,
} from "../api/mockData";
import { Driver, DriverRating, DriverState, DriverStatus } from "../types";

// Define action types
type DriverAction =
  | { type: "SET_DRIVERS"; payload: Driver[] }
  | { type: "ASSIGN_DRIVER"; payload: Driver | null }
  | {
      type: "UPDATE_DRIVER_LOCATION";
      payload: { latitude: number; longitude: number } | null;
    }
  | { type: "UPDATE_DRIVER_ETA"; payload: number | null }
  | { type: "UPDATE_DRIVER_STATUS"; payload: DriverStatus | null }
  | { type: "ADD_DRIVER_RATING"; payload: DriverRating }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET_DRIVER_STATE" };

// Initial state
const initialState: DriverState = {
  drivers: [],
  assignedDriver: null,
  driverLocation: null,
  driverEta: null,
  driverStatus: null,
  driverRatings: [],
  isLoading: false,
  error: null,
};

// Reducer function
function driverReducer(state: DriverState, action: DriverAction): DriverState {
  switch (action.type) {
    case "SET_DRIVERS":
      return { ...state, drivers: action.payload };
    case "ASSIGN_DRIVER":
      return {
        ...state,
        assignedDriver: action.payload,
        driverStatus: action.payload?.status || null,
        driverLocation: action.payload?.location || null,
      };
    case "UPDATE_DRIVER_LOCATION":
      return { ...state, driverLocation: action.payload };
    case "UPDATE_DRIVER_ETA":
      return { ...state, driverEta: action.payload };
    case "UPDATE_DRIVER_STATUS":
      return { ...state, driverStatus: action.payload };
    case "ADD_DRIVER_RATING":
      return {
        ...state,
        driverRatings: [action.payload, ...state.driverRatings],
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "RESET_DRIVER_STATE":
      return {
        ...initialState,
        drivers: state.drivers,
        driverRatings: state.driverRatings,
      };
    default:
      return state;
  }
}

// Create context
interface DriverContextType {
  state: DriverState;
  dispatch: React.Dispatch<DriverAction>;
  findDriver: (
    pickup: MapLocation,
    vehicleType?: string
  ) => Promise<Driver | null>;
  trackDriverLocation: (targetLocation: MapLocation) => Promise<void>;
  rateDriver: (rating: number, comment?: string) => Promise<boolean>;
  resetDriverState: () => void;
}

const DriverContext = createContext<DriverContextType | undefined>(undefined);

// Provider component
interface DriverProviderProps {
  children: ReactNode;
}

export function DriverProvider({ children }: DriverProviderProps) {
  const [state, dispatch] = useReducer(driverReducer, initialState);

  // Initialize with mock data
  useEffect(() => {
    dispatch({ type: "SET_DRIVERS", payload: mockDrivers });
    dispatch({ type: "SET_LOADING", payload: false });
  }, []);

  // Find a driver near the pickup location
  const findDriver = async (
    pickup: MapLocation,
    vehicleType?: string
  ): Promise<Driver | null> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const driver = await findNearbyDriver(
        pickup.latitude,
        pickup.longitude,
        vehicleType
      );

      if (driver) {
        dispatch({ type: "ASSIGN_DRIVER", payload: driver });

        // Simulate ETA calculation
        const distance = calculateDistance(
          driver.location!.latitude,
          driver.location!.longitude,
          pickup.latitude,
          pickup.longitude
        );

        // Rough estimate: 30 km/h average speed
        const etaMinutes = Math.ceil((distance / 30) * 60);
        dispatch({ type: "UPDATE_DRIVER_ETA", payload: etaMinutes });
      } else {
        dispatch({
          type: "SET_ERROR",
          payload: "No drivers available in your area",
        });
      }

      return driver;
    } catch (error) {
      console.error("Error finding driver:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to find a driver" });
      return null;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Track driver movement toward a target location
  const trackDriverLocation = async (
    targetLocation: MapLocation
  ): Promise<void> => {
    if (!state.assignedDriver) return;

    try {
      const updatedDriver = await updateDriverLocation(
        state.assignedDriver.id,
        targetLocation.latitude,
        targetLocation.longitude
      );

      if (updatedDriver && updatedDriver.location) {
        dispatch({
          type: "UPDATE_DRIVER_LOCATION",
          payload: updatedDriver.location,
        });

        // Update ETA
        const distance = calculateDistance(
          updatedDriver.location.latitude,
          updatedDriver.location.longitude,
          targetLocation.latitude,
          targetLocation.longitude
        );

        // Rough estimate: 30 km/h average speed
        const etaMinutes = Math.ceil((distance / 30) * 60);
        dispatch({ type: "UPDATE_DRIVER_ETA", payload: etaMinutes });

        // Update status if driver is very close to target
        if (distance < 0.1) {
          // Less than 100 meters
          const newStatus: DriverStatus =
            state.driverStatus === "en_route"
              ? "arriving"
              : state.driverStatus === "arriving"
              ? "on_ride"
              : state.driverStatus === "on_ride"
              ? "available"
              : "available";

          dispatch({ type: "UPDATE_DRIVER_STATUS", payload: newStatus });

          // Update driver with new status
          await updateDriverLocation(
            state.assignedDriver.id,
            targetLocation.latitude,
            targetLocation.longitude,
            newStatus
          );
        }
      }
    } catch (error) {
      console.error("Error tracking driver:", error);
    }
  };

  // Submit a rating for the driver
  const rateDriver = async (
    rating: number,
    comment?: string
  ): Promise<boolean> => {
    if (!state.assignedDriver) return false;

    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const ratingData: DriverRating = {
        driverId: state.assignedDriver.id,
        rideId: state.assignedDriver.currentRideId || `ride-${Date.now()}`,
        rating,
        comment,
        timestamp: new Date().toISOString(),
      };

      const success = await submitDriverRating(ratingData);

      if (success) {
        dispatch({ type: "ADD_DRIVER_RATING", payload: ratingData });
      }

      return success;
    } catch (error) {
      console.error("Error submitting rating:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to submit rating" });
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Reset driver state
  const resetDriverState = () => {
    dispatch({ type: "RESET_DRIVER_STATE" });
  };

  // Helper function to calculate distance between two points
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  const contextValue: DriverContextType = {
    state,
    dispatch,
    findDriver,
    trackDriverLocation,
    rateDriver,
    resetDriverState,
  };

  return (
    <DriverContext.Provider value={contextValue}>
      {children}
    </DriverContext.Provider>
  );
}

// Custom hook to use the driver context
export function useDriver() {
  const context = useContext(DriverContext);
  if (context === undefined) {
    throw new Error("useDriver must be used within a DriverProvider");
  }
  return context;
}
