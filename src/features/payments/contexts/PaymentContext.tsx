import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";
import {
  addPaymentMethod,
  deletePaymentMethod,
  getDefaultPaymentMethod,
  getPaymentMethods,
  getTransactionHistory,
  processPayment,
  setDefaultPaymentMethod,
} from "../api";
import {
  NewPaymentMethodRequest,
  PaymentMethod,
  PaymentResult,
  PaymentState,
  Transaction,
} from "../types";

// Define action types
type PaymentAction =
  | { type: "SET_PAYMENT_METHODS"; payload: PaymentMethod[] }
  | { type: "SET_DEFAULT_PAYMENT_METHOD_ID"; payload: string | null }
  | { type: "ADD_PAYMENT_METHOD"; payload: PaymentMethod }
  | { type: "REMOVE_PAYMENT_METHOD"; payload: string }
  | { type: "SET_TRANSACTIONS"; payload: Transaction[] }
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

// Initial state
const initialState: PaymentState = {
  paymentMethods: [],
  defaultPaymentMethodId: null,
  transactions: [],
  isLoading: false,
  error: null,
};

// Reducer function
function paymentReducer(
  state: PaymentState,
  action: PaymentAction
): PaymentState {
  switch (action.type) {
    case "SET_PAYMENT_METHODS":
      return { ...state, paymentMethods: action.payload };
    case "SET_DEFAULT_PAYMENT_METHOD_ID":
      return { ...state, defaultPaymentMethodId: action.payload };
    case "ADD_PAYMENT_METHOD":
      return {
        ...state,
        paymentMethods: [...state.paymentMethods, action.payload],
        defaultPaymentMethodId: action.payload.isDefault
          ? action.payload.id
          : state.defaultPaymentMethodId,
      };
    case "REMOVE_PAYMENT_METHOD":
      return {
        ...state,
        paymentMethods: state.paymentMethods.filter(
          (pm) => pm.id !== action.payload
        ),
        defaultPaymentMethodId:
          state.defaultPaymentMethodId === action.payload
            ? state.paymentMethods.find(
                (pm) => pm.id !== action.payload && pm.isDefault
              )?.id || null
            : state.defaultPaymentMethodId,
      };
    case "SET_TRANSACTIONS":
      return { ...state, transactions: action.payload };
    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// Create context
interface PaymentContextType {
  state: PaymentState;
  dispatch: React.Dispatch<PaymentAction>;
  loadPaymentMethods: () => Promise<void>;
  addNewPaymentMethod: (
    paymentMethodData: NewPaymentMethodRequest
  ) => Promise<PaymentMethod>;
  setAsDefaultPaymentMethod: (paymentMethodId: string) => Promise<boolean>;
  removePaymentMethod: (paymentMethodId: string) => Promise<boolean>;
  loadTransactionHistory: (
    limit?: number,
    offset?: number
  ) => Promise<Transaction[]>;
  makePayment: (
    amount: number,
    paymentMethodId: string,
    description: string,
    rideId?: string
  ) => Promise<PaymentResult>;
  getSelectedPaymentMethod: () => PaymentMethod | null;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

// Provider component
interface PaymentProviderProps {
  children: ReactNode;
}

export function PaymentProvider({ children }: PaymentProviderProps) {
  const [state, dispatch] = useReducer(paymentReducer, initialState);

  // Load initial data
  useEffect(() => {
    loadPaymentMethods();
  }, []);

  // Load payment methods
  const loadPaymentMethods = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // Get all payment methods
      const methods = await getPaymentMethods();
      dispatch({ type: "SET_PAYMENT_METHODS", payload: methods });

      // Get default payment method
      const defaultMethod = await getDefaultPaymentMethod();
      dispatch({
        type: "SET_DEFAULT_PAYMENT_METHOD_ID",
        payload: defaultMethod?.id || null,
      });
    } catch (error) {
      console.error("Error loading payment methods:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to load payment methods",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Add a new payment method
  const addNewPaymentMethod = async (
    paymentMethodData: NewPaymentMethodRequest
  ): Promise<PaymentMethod> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const newMethod = await addPaymentMethod(paymentMethodData);

      // Update state with new method
      dispatch({ type: "ADD_PAYMENT_METHOD", payload: newMethod });

      // If this is the new default, update other methods
      if (newMethod.isDefault) {
        dispatch({
          type: "SET_DEFAULT_PAYMENT_METHOD_ID",
          payload: newMethod.id,
        });
      }

      return newMethod;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add payment method";
      console.error("Error adding payment method:", error);
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Set a payment method as default
  const setAsDefaultPaymentMethod = async (
    paymentMethodId: string
  ): Promise<boolean> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const success = await setDefaultPaymentMethod(paymentMethodId);

      if (success) {
        // Update local state
        const updatedMethods = state.paymentMethods.map((pm) => ({
          ...pm,
          isDefault: pm.id === paymentMethodId,
        }));

        dispatch({ type: "SET_PAYMENT_METHODS", payload: updatedMethods });
        dispatch({
          type: "SET_DEFAULT_PAYMENT_METHOD_ID",
          payload: paymentMethodId,
        });
      }

      return success;
    } catch (error) {
      console.error("Error setting default payment method:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to set default payment method",
      });
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Remove a payment method
  const removePaymentMethod = async (
    paymentMethodId: string
  ): Promise<boolean> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const success = await deletePaymentMethod(paymentMethodId);

      if (success) {
        // Update local state
        dispatch({ type: "REMOVE_PAYMENT_METHOD", payload: paymentMethodId });

        // If this was the default method, we need to reload payment methods
        // to get the new default
        if (state.defaultPaymentMethodId === paymentMethodId) {
          await loadPaymentMethods();
        }
      }

      return success;
    } catch (error) {
      console.error("Error removing payment method:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to remove payment method",
      });
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Load transaction history
  const loadTransactionHistory = async (
    limit: number = 10,
    offset: number = 0
  ): Promise<Transaction[]> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const transactions = await getTransactionHistory(limit, offset);

      // If this is the first load (offset = 0), replace transactions
      // Otherwise append to existing list
      if (offset === 0) {
        dispatch({ type: "SET_TRANSACTIONS", payload: transactions });
      } else {
        // Append new transactions (avoiding duplicates)
        const existingIds = new Set(state.transactions.map((t) => t.id));
        const newTransactions = transactions.filter(
          (t) => !existingIds.has(t.id)
        );

        dispatch({
          type: "SET_TRANSACTIONS",
          payload: [...state.transactions, ...newTransactions],
        });
      }

      return transactions;
    } catch (error) {
      console.error("Error loading transactions:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to load transaction history",
      });
      return [];
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Process a payment
  const makePayment = async (
    amount: number,
    paymentMethodId: string,
    description: string,
    rideId?: string
  ): Promise<PaymentResult> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const result = await processPayment(
        amount,
        paymentMethodId,
        description,
        rideId
      );

      // If successful, add transaction to state
      if (result.success && result.transactionId) {
        // In a real app, we would fetch the transaction details
        // For the mock, we'll create a transaction object
        const transaction: Transaction = {
          id: result.transactionId,
          amount,
          currency: "USD",
          status: "completed",
          paymentMethodId,
          rideId,
          description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        dispatch({ type: "ADD_TRANSACTION", payload: transaction });
      } else if (result.error) {
        dispatch({ type: "SET_ERROR", payload: result.error });
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Payment processing failed";
      console.error("Error processing payment:", error);
      dispatch({ type: "SET_ERROR", payload: errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Get the currently selected payment method
  const getSelectedPaymentMethod = (): PaymentMethod | null => {
    if (!state.defaultPaymentMethodId) {
      return state.paymentMethods.length > 0 ? state.paymentMethods[0] : null;
    }

    return (
      state.paymentMethods.find(
        (pm) => pm.id === state.defaultPaymentMethodId
      ) || null
    );
  };

  const contextValue: PaymentContextType = {
    state,
    dispatch,
    loadPaymentMethods,
    addNewPaymentMethod,
    setAsDefaultPaymentMethod,
    removePaymentMethod,
    loadTransactionHistory,
    makePayment,
    getSelectedPaymentMethod,
  };

  return (
    <PaymentContext.Provider value={contextValue}>
      {children}
    </PaymentContext.Provider>
  );
}

// Custom hook to use the payment context
export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
}
