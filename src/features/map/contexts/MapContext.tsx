import MapboxGL from "@rnmapbox/maps";
import * as Location from "expo-location";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useCallback,
} from "react";
import { Alert } from "react-native";

// Define the state shape
export interface MapLocation {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

export type MapStyle = "light" | "dark" | "satellite" | "street";

export interface MapState {
  // Initialization
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Permissions
  hasLocationPermission: boolean;

  // Map state
  currentLocation: MapLocation | null;
  currentZoom: number;
  currentPitch: number;
  currentHeading: number;
  visibleBounds: {
    ne: [number, number];
    sw: [number, number];
  } | null;

  // User selections
  selectedLocation: MapLocation | null;
  pickupLocation: MapLocation | null;
  dropoffLocation: MapLocation | null;

  // Route data
  routes: any[] | null;
  selectedRouteId: string | null;

  // UI state
  mapStyle: MapStyle;
  showsUserLocation: boolean;
  followsUserLocation: boolean;
  showsTraffic: boolean;
  showsBuildings: boolean;
  showsPointsOfInterest: boolean;
}

// Define action types
type MapAction =
  | { type: "INITIALIZE_START" }
  | { type: "INITIALIZE_SUCCESS" }
  | { type: "INITIALIZE_FAILURE"; payload: string }
  | { type: "SET_LOCATION_PERMISSION"; payload: boolean }
  | { type: "SET_CURRENT_LOCATION"; payload: MapLocation | null }
  | {
      type: "SET_CAMERA";
      payload: { zoom?: number; pitch?: number; heading?: number };
    }
  | {
      type: "SET_VISIBLE_BOUNDS";
      payload: { ne: [number, number]; sw: [number, number] };
    }
  | { type: "SET_SELECTED_LOCATION"; payload: MapLocation | null }
  | { type: "SET_PICKUP_LOCATION"; payload: MapLocation | null }
  | { type: "SET_DROPOFF_LOCATION"; payload: MapLocation | null }
  | { type: "SET_ROUTES"; payload: any[] }
  | { type: "SELECT_ROUTE"; payload: string }
  | { type: "SET_MAP_STYLE"; payload: MapStyle }
  | { type: "TOGGLE_USER_LOCATION"; payload: boolean }
  | { type: "TOGGLE_FOLLOW_USER_LOCATION"; payload: boolean }
  | { type: "TOGGLE_TRAFFIC"; payload: boolean }
  | { type: "TOGGLE_BUILDINGS"; payload: boolean }
  | { type: "TOGGLE_POINTS_OF_INTEREST"; payload: boolean }
  | { type: "RESET_MAP" };

// Initial state
const initialState: MapState = {
  isInitialized: false,
  isLoading: false,
  error: null,
  hasLocationPermission: false,
  currentLocation: null,
  currentZoom: 15,
  currentPitch: 0,
  currentHeading: 0,
  visibleBounds: null,
  selectedLocation: null,
  pickupLocation: null,
  dropoffLocation: null,
  routes: null,
  selectedRouteId: null,
  mapStyle: "light",
  showsUserLocation: true,
  followsUserLocation: false,
  showsTraffic: false,
  showsBuildings: true,
  showsPointsOfInterest: true,
};

// Reducer function
function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case "INITIALIZE_START":
      return { ...state, isLoading: true, error: null };
    case "INITIALIZE_SUCCESS":
      return { ...state, isInitialized: true, isLoading: false };
    case "INITIALIZE_FAILURE":
      return { ...state, isLoading: false, error: action.payload };
    case "SET_LOCATION_PERMISSION":
      return { ...state, hasLocationPermission: action.payload };
    case "SET_CURRENT_LOCATION":
      return { ...state, currentLocation: action.payload };
    case "SET_CAMERA":
      return {
        ...state,
        currentZoom: action.payload.zoom ?? state.currentZoom,
        currentPitch: action.payload.pitch ?? state.currentPitch,
        currentHeading: action.payload.heading ?? state.currentHeading,
      };
    case "SET_VISIBLE_BOUNDS":
      return { ...state, visibleBounds: action.payload };
    case "SET_SELECTED_LOCATION":
      return { ...state, selectedLocation: action.payload };
    case "SET_PICKUP_LOCATION":
      return { ...state, pickupLocation: action.payload };
    case "SET_DROPOFF_LOCATION":
      return { ...state, dropoffLocation: action.payload };
    case "SET_ROUTES":
      return { ...state, routes: action.payload };
    case "SELECT_ROUTE":
      return { ...state, selectedRouteId: action.payload };
    case "SET_MAP_STYLE":
      return { ...state, mapStyle: action.payload };
    case "TOGGLE_USER_LOCATION":
      return { ...state, showsUserLocation: action.payload };
    case "TOGGLE_FOLLOW_USER_LOCATION":
      return { ...state, followsUserLocation: action.payload };
    case "TOGGLE_TRAFFIC":
      return { ...state, showsTraffic: action.payload };
    case "TOGGLE_BUILDINGS":
      return { ...state, showsBuildings: action.payload };
    case "TOGGLE_POINTS_OF_INTEREST":
      return { ...state, showsPointsOfInterest: action.payload };
    case "RESET_MAP":
      return {
        ...initialState,
        isInitialized: state.isInitialized,
        hasLocationPermission: state.hasLocationPermission,
        currentLocation: state.currentLocation,
      };
    default:
      return state;
  }
}

// Create context
interface MapContextType {
  state: MapState;
  dispatch: React.Dispatch<MapAction>;
  initializeMap: () => Promise<boolean>;
  requestLocationPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<MapLocation | null>;
  setPickupLocation: (location: MapLocation | null) => void;
  setDropoffLocation: (location: MapLocation | null) => void;
  selectLocation: (location: MapLocation | null) => void;
  setMapStyle: (style: MapStyle) => void;
  resetMap: () => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

// Provider component
interface MapProviderProps {
  children: ReactNode;
}

export function MapProvider({ children }: MapProviderProps) {
  const [state, dispatch] = useReducer(mapReducer, initialState);

  // Initialize Mapbox
  const initializeMap = useCallback(async () => {
    dispatch({ type: "INITIALIZE_START" });
    try {
      const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

      if (!token) {
        throw new Error(
          "Mapbox token not configured. Please set EXPO_PUBLIC_MAPBOX_TOKEN in your environment."
        );
      }

      // Set the access token
      MapboxGL.setAccessToken(token);

      // Configure Mapbox (telemetry disabled by default in newer versions)

      dispatch({ type: "INITIALIZE_SUCCESS" });
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to initialize Mapbox";
      console.error("Mapbox initialization error:", errorMessage);

      dispatch({ type: "INITIALIZE_FAILURE", payload: errorMessage });

      Alert.alert("Map Initialization Error", errorMessage, [{ text: "OK" }]);
      return false;
    }
  }, []);

  // Request location permissions
  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const hasPermission = status === "granted";

      dispatch({ type: "SET_LOCATION_PERMISSION", payload: hasPermission });

      if (!hasPermission) {
        Alert.alert(
          "Location Permission Required",
          "Please enable location services to use the map features.",
          [{ text: "OK" }]
        );
      }

      return hasPermission;
    } catch (error) {
      console.error("Error requesting location permission:", error);
      dispatch({ type: "SET_LOCATION_PERMISSION", payload: false });
      return false;
    }
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    if (!state.hasLocationPermission) {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return null;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const currentLocation: MapLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Try to get address information
      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        });

        if (addresses && addresses.length > 0) {
          const address = addresses[0];
          currentLocation.address = `${address.name || ""} ${
            address.street || ""
          }, ${address.city || ""}`.trim();
          currentLocation.name = address.name || "Current Location";
        }
      } catch (error) {
        console.warn("Error reverse geocoding current location:", error);
        // Continue with just coordinates
        currentLocation.name = "Current Location";
      }

      dispatch({ type: "SET_CURRENT_LOCATION", payload: currentLocation });
      return currentLocation;
    } catch (error) {
      console.error("Error getting current location:", error);
      return null;
    }
  }, [state.hasLocationPermission, requestLocationPermission]);

  // Helper functions for common actions
  const setPickupLocation = (location: MapLocation | null) => {
    dispatch({ type: "SET_PICKUP_LOCATION", payload: location });
  };

  const setDropoffLocation = (location: MapLocation | null) => {
    dispatch({ type: "SET_DROPOFF_LOCATION", payload: location });
  };

  const selectLocation = (location: MapLocation | null) => {
    dispatch({ type: "SET_SELECTED_LOCATION", payload: location });
  };

  const setMapStyle = (style: MapStyle) => {
    dispatch({ type: "SET_MAP_STYLE", payload: style });
  };

  const resetMap = () => {
    dispatch({ type: "RESET_MAP" });
  };

  // Initialize map on mount
  useEffect(() => {
    const initialize = async () => {
      const mapInitialized = await initializeMap();
      if (mapInitialized) {
        await requestLocationPermission();
        await getCurrentLocation();
      }
    };

    initialize();
  }, [initializeMap, requestLocationPermission, getCurrentLocation]);

  const contextValue: MapContextType = {
    state,
    dispatch,
    initializeMap,
    requestLocationPermission,
    getCurrentLocation,
    setPickupLocation,
    setDropoffLocation,
    selectLocation,
    setMapStyle,
    resetMap,
  };

  return (
    <MapContext.Provider value={contextValue}>{children}</MapContext.Provider>
  );
}

// Custom hook to use the map context
export function useMap() {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error("useMap must be used within a MapProvider");
  }
  return context;
}