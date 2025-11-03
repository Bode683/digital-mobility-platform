/**
 * Payment method types
 */
export type PaymentMethodType = 
  | 'credit_card' 
  | 'debit_card' 
  | 'paypal' 
  | 'apple_pay' 
  | 'google_pay' 
  | 'cash';

/**
 * Card brand types
 */
export type CardBrand = 
  | 'visa' 
  | 'mastercard' 
  | 'amex' 
  | 'discover' 
  | 'diners' 
  | 'jcb' 
  | 'unionpay' 
  | 'other';

/**
 * Payment method information
 */
export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Card specific fields
  cardBrand?: CardBrand;
  lastFour?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cardholderName?: string;
  
  // PayPal specific fields
  email?: string;
  
  // Digital wallet specific fields
  walletName?: string;
  deviceName?: string;
}

/**
 * Payment transaction status
 */
export type TransactionStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'refunded' 
  | 'cancelled';

/**
 * Payment transaction
 */
export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethodId: string;
  paymentMethod?: PaymentMethod;
  rideId?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  receiptUrl?: string;
  failureReason?: string;
}

/**
 * New payment method request
 */
export interface NewPaymentMethodRequest {
  type: PaymentMethodType;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvc?: string;
  cardholderName?: string;
  setAsDefault?: boolean;
}

/**
 * Payment processing result
 */
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

/**
 * Payment state
 */
export interface PaymentState {
  paymentMethods: PaymentMethod[];
  defaultPaymentMethodId: string | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}
