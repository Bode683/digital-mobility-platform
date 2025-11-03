import {
  CardBrand,
  NewPaymentMethodRequest,
  PaymentMethod,
  PaymentResult,
  Transaction
} from '../types';

/**
 * Mock payment methods
 */
export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_1',
    type: 'credit_card',
    cardBrand: 'visa',
    lastFour: '4242',
    expiryMonth: '12',
    expiryYear: '2025',
    cardholderName: 'John Doe',
    isDefault: true,
    createdAt: '2025-10-15T10:30:00Z',
    updatedAt: '2025-10-15T10:30:00Z'
  },
  {
    id: 'pm_2',
    type: 'credit_card',
    cardBrand: 'mastercard',
    lastFour: '5555',
    expiryMonth: '06',
    expiryYear: '2026',
    cardholderName: 'John Doe',
    isDefault: false,
    createdAt: '2025-09-22T14:15:00Z',
    updatedAt: '2025-09-22T14:15:00Z'
  },
  {
    id: 'pm_3',
    type: 'paypal',
    email: 'john.doe@example.com',
    isDefault: false,
    createdAt: '2025-08-10T09:45:00Z',
    updatedAt: '2025-08-10T09:45:00Z'
  },
  {
    id: 'pm_4',
    type: 'google_pay',
    walletName: 'Google Pay',
    deviceName: 'Pixel 7',
    isDefault: false,
    createdAt: '2025-10-01T16:20:00Z',
    updatedAt: '2025-10-01T16:20:00Z'
  }
];

/**
 * Mock transactions
 */
export const mockTransactions: Transaction[] = [
  {
    id: 'tx_1',
    amount: 15.75,
    currency: 'USD',
    status: 'completed',
    paymentMethodId: 'pm_1',
    rideId: 'ride_1',
    description: 'Ride from Downtown to Airport',
    createdAt: '2025-10-28T14:30:00Z',
    updatedAt: '2025-10-28T14:32:00Z',
    receiptUrl: 'https://receipts.example.com/tx_1'
  },
  {
    id: 'tx_2',
    amount: 8.50,
    currency: 'USD',
    status: 'completed',
    paymentMethodId: 'pm_1',
    rideId: 'ride_2',
    description: 'Ride from Home to Office',
    createdAt: '2025-10-25T08:15:00Z',
    updatedAt: '2025-10-25T08:17:00Z',
    receiptUrl: 'https://receipts.example.com/tx_2'
  },
  {
    id: 'tx_3',
    amount: 12.30,
    currency: 'USD',
    status: 'refunded',
    paymentMethodId: 'pm_2',
    rideId: 'ride_3',
    description: 'Ride from Mall to Home',
    createdAt: '2025-10-20T18:45:00Z',
    updatedAt: '2025-10-20T19:30:00Z',
    receiptUrl: 'https://receipts.example.com/tx_3'
  },
  {
    id: 'tx_4',
    amount: 22.40,
    currency: 'USD',
    status: 'failed',
    paymentMethodId: 'pm_2',
    rideId: 'ride_4',
    description: 'Ride from Airport to Hotel',
    createdAt: '2025-10-15T22:10:00Z',
    updatedAt: '2025-10-15T22:11:00Z',
    failureReason: 'Insufficient funds'
  }
];

/**
 * Get all payment methods
 * 
 * @returns Promise with payment methods
 */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [...mockPaymentMethods];
}

/**
 * Get default payment method
 * 
 * @returns Promise with default payment method or null
 */
export async function getDefaultPaymentMethod(): Promise<PaymentMethod | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const defaultMethod = mockPaymentMethods.find(pm => pm.isDefault);
  return defaultMethod || null;
}

/**
 * Add a new payment method
 * 
 * @param paymentMethodRequest New payment method data
 * @returns Promise with created payment method
 */
export async function addPaymentMethod(
  paymentMethodRequest: NewPaymentMethodRequest
): Promise<PaymentMethod> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Validate card number (simple check for demo)
  if (paymentMethodRequest.type === 'credit_card' || paymentMethodRequest.type === 'debit_card') {
    if (!paymentMethodRequest.cardNumber || paymentMethodRequest.cardNumber.length < 13) {
      throw new Error('Invalid card number');
    }
    
    if (!paymentMethodRequest.expiryMonth || !paymentMethodRequest.expiryYear || !paymentMethodRequest.cvc) {
      throw new Error('Missing required card information');
    }
  }
  
  // Create new payment method
  const newPaymentMethod: PaymentMethod = {
    id: `pm_${Date.now()}`,
    type: paymentMethodRequest.type,
    isDefault: paymentMethodRequest.setAsDefault || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Add type-specific fields
  if (paymentMethodRequest.type === 'credit_card' || paymentMethodRequest.type === 'debit_card') {
    newPaymentMethod.cardBrand = detectCardBrand(paymentMethodRequest.cardNumber!);
    newPaymentMethod.lastFour = paymentMethodRequest.cardNumber!.slice(-4);
    newPaymentMethod.expiryMonth = paymentMethodRequest.expiryMonth;
    newPaymentMethod.expiryYear = paymentMethodRequest.expiryYear;
    newPaymentMethod.cardholderName = paymentMethodRequest.cardholderName;
  }
  
  // Update default status if needed
  if (newPaymentMethod.isDefault) {
    for (const pm of mockPaymentMethods) {
      pm.isDefault = false;
    }
  }
  
  // Add to mock data
  mockPaymentMethods.push(newPaymentMethod);
  
  return newPaymentMethod;
}

/**
 * Set default payment method
 * 
 * @param paymentMethodId Payment method ID to set as default
 * @returns Promise with success status
 */
export async function setDefaultPaymentMethod(paymentMethodId: string): Promise<boolean> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const methodIndex = mockPaymentMethods.findIndex(pm => pm.id === paymentMethodId);
  if (methodIndex === -1) {
    throw new Error('Payment method not found');
  }
  
  // Update default status
  for (const pm of mockPaymentMethods) {
    pm.isDefault = pm.id === paymentMethodId;
  }
  
  return true;
}

/**
 * Delete payment method
 * 
 * @param paymentMethodId Payment method ID to delete
 * @returns Promise with success status
 */
export async function deletePaymentMethod(paymentMethodId: string): Promise<boolean> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const methodIndex = mockPaymentMethods.findIndex(pm => pm.id === paymentMethodId);
  if (methodIndex === -1) {
    throw new Error('Payment method not found');
  }
  
  // Check if it's the default payment method
  if (mockPaymentMethods[methodIndex].isDefault && mockPaymentMethods.length > 1) {
    // Find another payment method to set as default
    const newDefault = mockPaymentMethods.find(pm => pm.id !== paymentMethodId);
    if (newDefault) {
      newDefault.isDefault = true;
    }
  }
  
  // Remove from mock data
  mockPaymentMethods.splice(methodIndex, 1);
  
  return true;
}

/**
 * Get transaction history
 * 
 * @param limit Maximum number of transactions to return
 * @param offset Offset for pagination
 * @returns Promise with transactions
 */
export async function getTransactionHistory(
  limit: number = 10,
  offset: number = 0
): Promise<Transaction[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Sort by date (newest first) and apply pagination
  const sortedTransactions = [...mockTransactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  return sortedTransactions.slice(offset, offset + limit);
}

/**
 * Process payment
 * 
 * @param amount Amount to charge
 * @param paymentMethodId Payment method ID to use
 * @param description Payment description
 * @param rideId Optional ride ID
 * @returns Promise with payment result
 */
export async function processPayment(
  amount: number,
  paymentMethodId: string,
  description: string,
  rideId?: string
): Promise<PaymentResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Find payment method
  const paymentMethod = mockPaymentMethods.find(pm => pm.id === paymentMethodId);
  if (!paymentMethod) {
    return {
      success: false,
      error: 'Payment method not found'
    };
  }
  
  // Simulate random success/failure (90% success rate)
  const isSuccessful = Math.random() < 0.9;
  
  if (isSuccessful) {
    // Create transaction
    const transaction: Transaction = {
      id: `tx_${Date.now()}`,
      amount,
      currency: 'USD',
      status: 'completed',
      paymentMethodId,
      rideId,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      receiptUrl: `https://receipts.example.com/tx_${Date.now()}`
    };
    
    // Add to mock data
    mockTransactions.push(transaction);
    
    return {
      success: true,
      transactionId: transaction.id
    };
  } else {
    // Create failed transaction
    const transaction: Transaction = {
      id: `tx_${Date.now()}`,
      amount,
      currency: 'USD',
      status: 'failed',
      paymentMethodId,
      rideId,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      failureReason: 'Payment declined by issuer'
    };
    
    // Add to mock data
    mockTransactions.push(transaction);
    
    return {
      success: false,
      transactionId: transaction.id,
      error: 'Payment declined by issuer'
    };
  }
}

/**
 * Helper function to detect card brand from number
 * 
 * @param cardNumber Card number
 * @returns Card brand
 */
function detectCardBrand(cardNumber: string): CardBrand {
  // Very simplified detection for demo purposes
  if (cardNumber.startsWith('4')) {
    return 'visa';
  } else if (cardNumber.startsWith('5')) {
    return 'mastercard';
  } else if (cardNumber.startsWith('3')) {
    return 'amex';
  } else if (cardNumber.startsWith('6')) {
    return 'discover';
  } else {
    return 'other';
  }
}
