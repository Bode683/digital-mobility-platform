/**
 * Ride Booking Feature Constants
 *
 * Centralized configuration values for the ride booking feature
 */

// Timing constants
export const TIMING = {
  /** Delay after driver arrives before automatically starting trip (ms) */
  TRIP_START_DELAY_MS: 3000,

  /** Estimated arrival time from now when creating ride (ms) */
  ESTIMATED_ARRIVAL_TIME_MS: 1 * 60 * 3000, // 3 minute

  /** Interval for updating driver location (ms) */
  DRIVER_LOCATION_UPDATE_INTERVAL_MS: 2000, // 2 seconds

  /** Interval for updating ETA countdown timer (ms) */
  ETA_COUNTDOWN_UPDATE_INTERVAL_MS: 30 * 1000, // 30 seconds

  /** Simulated network delay for route calculation (ms) */
  ROUTE_CALCULATION_DELAY_MS: 1000,

  /** Simulated network delay for payment methods fetch (ms) */
  PAYMENT_METHODS_FETCH_DELAY_MS: 800,

  /** Simulated network delay for ride request (ms) */
  RIDE_REQUEST_DELAY_MS: 2000,

  /** Simulated network delay for ride cancellation (ms) */
  RIDE_CANCELLATION_DELAY_MS: 1000,

  /** Simulated network delay for ride history fetch (ms) */
  RIDE_HISTORY_FETCH_DELAY_MS: 1200,

  /** Simulated network delay for cancellation reasons fetch (ms) */
  CANCELLATION_REASONS_FETCH_DELAY_MS: 500,

  /** Delay before navigating away after ride completion (ms) */
  COMPLETION_NAVIGATION_DELAY_MS: 2000,
} as const;

// Distance and location constants
export const LOCATION = {
  /** Distance threshold for considering driver has arrived (km) */
  ARRIVAL_THRESHOLD_KM: 0.05, // 50 meters (matches moveTowardTarget snap threshold)

  /** Initial driver offset from pickup location (degrees) ~500 meters */
  INITIAL_DRIVER_OFFSET_DEGREES: 0.005,

  /** Default driver speed for simulations (km/h) */
  DEFAULT_DRIVER_SPEED_KMH: 30,

  /** Earth's radius for distance calculations (km) */
  EARTH_RADIUS_KM: 6371,
} as const;

// Pricing constants
export const PRICING = {
  /** Base fare for all rides ($) */
  BASE_FARE: 2.5,

  /** Rate per kilometer ($) */
  PER_KM_RATE: 1.25,

  /** Rate per minute ($) */
  PER_MINUTE_RATE: 0.35,

  /** Minimum fare for any ride ($) */
  MINIMUM_FARE: 5.0,

  /** Default surge pricing multiplier (1.0 = no surge) */
  DEFAULT_SURGE_MULTIPLIER: 1.0,

  /** Average speed for rough time estimates (km/h) */
  AVERAGE_SPEED_KMH: 30,
} as const;

// Map configuration
export const MAP_CONFIG = {
  /** Default zoom level for map initialization */
  DEFAULT_ZOOM: 15,

  /** Mapbox profile for routing (with traffic data) */
  ROUTING_PROFILE: 'driving-traffic' as const,
} as const;
