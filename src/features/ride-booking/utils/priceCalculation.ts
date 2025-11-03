import { PriceFactors, RideType } from '../types';

/**
 * Calculates the price of a ride based on distance, duration, ride type, and other factors
 * 
 * @param distance Distance in kilometers
 * @param duration Duration in minutes
 * @param rideType The selected ride type
 * @param factors Price calculation factors
 * @returns The calculated price
 */
export function calculatePrice(
  distance: number,
  duration: number,
  rideType: RideType,
  factors: PriceFactors
): number {
  // Calculate base components
  const distancePrice = distance * factors.perKmRate;
  const durationPrice = duration * factors.perMinuteRate;
  const subtotal = factors.basePrice + distancePrice + durationPrice;
  
  // Apply ride type multiplier
  const withMultiplier = subtotal * rideType.priceMultiplier;
  
  // Apply surge pricing if applicable
  const withSurge = withMultiplier * factors.surgePricing;
  
  // Ensure minimum fare is met
  const finalPrice = Math.max(withSurge, factors.minimumFare);
  
  // Round to 2 decimal places
  return Math.round(finalPrice * 100) / 100;
}
