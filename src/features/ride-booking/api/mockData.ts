import { PaymentMethod, RideType } from '../types';

/**
 * Mock ride types for testing
 */
export const mockRideTypes: RideType[] = [
  {
    id: 'economy',
    name: 'Economy',
    description: 'Affordable rides for everyday use',
    capacity: 4,
    icon: 'car',
    priceMultiplier: 1.0,
    estimatedPickupMinutes: 3
  },
  {
    id: 'comfort',
    name: 'Comfort',
    description: 'Newer cars with extra legroom',
    capacity: 4,
    icon: 'car-comfort',
    priceMultiplier: 1.3,
    estimatedPickupMinutes: 5
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'High-end cars with top-rated drivers',
    capacity: 4,
    icon: 'car-premium',
    priceMultiplier: 1.8,
    estimatedPickupMinutes: 7
  },
  {
    id: 'xl',
    name: 'XL',
    description: 'Spacious vehicles for groups up to 6',
    capacity: 6,
    icon: 'car-xl',
    priceMultiplier: 1.5,
    estimatedPickupMinutes: 6
  }
];

/**
 * Mock payment methods for testing
 */
export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'card-1',
    type: 'card',
    label: 'Visa •••• 4242',
    lastFour: '4242',
    expiryDate: '12/25',
    isDefault: true
  },
  {
    id: 'card-2',
    type: 'card',
    label: 'Mastercard •••• 5555',
    lastFour: '5555',
    expiryDate: '08/24',
    isDefault: false
  },
  {
    id: 'paypal-1',
    type: 'paypal',
    label: 'PayPal',
    isDefault: false
  },
  {
    id: 'apple-pay-1',
    type: 'apple_pay',
    label: 'Apple Pay',
    isDefault: false
  }
];
