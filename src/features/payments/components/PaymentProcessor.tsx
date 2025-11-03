import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, useTheme } from "react-native-paper";
import { usePayment } from "../contexts/PaymentContext";
import { PaymentMethod } from "../types";
import { PaymentMethodSelector } from "./PaymentMethodSelector";

interface PaymentProcessorProps {
  amount: number;
  description: string;
  rideId?: string;
  onSuccess?: () => void;
  onFailure?: (error: string) => void;
  onCancel?: () => void;
  visible: boolean;
}

export function PaymentProcessor({
  amount,
  description,
  rideId,
  onSuccess,
  onFailure,
  onCancel,
  visible,
}: PaymentProcessorProps) {
  const theme = useTheme();
  const { makePayment, getSelectedPaymentMethod } = usePayment();

  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<
    string | undefined
  >(getSelectedPaymentMethod()?.id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<
    "idle" | "processing" | "success" | "failure"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle payment method selection
  const handleSelectPaymentMethod = (paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethodId(paymentMethod.id);
  };

  // Handle payment processing
  const handleProcessPayment = async () => {
    if (!selectedPaymentMethodId) {
      setErrorMessage("Please select a payment method");
      return;
    }

    setIsProcessing(true);
    setProcessingStatus("processing");
    setErrorMessage(null);

    try {
      const result = await makePayment(
        amount,
        selectedPaymentMethodId,
        description,
        rideId
      );

      if (result.success) {
        setProcessingStatus("success");

        // Wait a bit to show success message before closing
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
        }, 1500);
      } else {
        setProcessingStatus("failure");
        setErrorMessage(result.error || "Payment processing failed");

        if (onFailure) {
          onFailure(result.error || "Payment processing failed");
        }
      }
    } catch (error) {
      setProcessingStatus("failure");
      const errorMessage =
        error instanceof Error ? error.message : "Payment processing failed";
      setErrorMessage(errorMessage);

      if (onFailure) {
        onFailure(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (processingStatus === "processing") return; // Don't allow cancel during processing

    setProcessingStatus("idle");
    setErrorMessage(null);

    if (onCancel) {
      onCancel();
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Render processing content
  const renderProcessingContent = () => {
    switch (processingStatus) {
      case "idle":
        return (
          <View style={styles.contentContainer}>
            <Text
              style={[styles.amountText, { color: theme.colors.onSurface }]}
            >
              {formatCurrency(amount)}
            </Text>

            <Text
              style={[
                styles.descriptionText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {description}
            </Text>

            <View style={styles.paymentMethodContainer}>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
              >
                Payment Method
              </Text>

              <PaymentMethodSelector
                onSelectPaymentMethod={handleSelectPaymentMethod}
                selectedPaymentMethodId={selectedPaymentMethodId}
                compact={true}
              />
            </View>

            {errorMessage && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errorMessage}
              </Text>
            )}

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={handleCancel}
                style={styles.cancelButton}
              >
                Cancel
              </Button>

              <Button
                mode="contained"
                onPress={handleProcessPayment}
                loading={isProcessing}
                disabled={isProcessing || !selectedPaymentMethodId}
                style={styles.payButton}
              >
                Pay {formatCurrency(amount)}
              </Button>
            </View>
          </View>
        );

      case "processing":
        return (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text
              style={[styles.processingText, { color: theme.colors.onSurface }]}
            >
              Processing Payment...
            </Text>
            <Text
              style={[
                styles.processingSubtext,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Please do not close this screen
            </Text>
          </View>
        );

      case "success":
        return (
          <View style={styles.resultContainer}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.colors.primaryContainer },
              ]}
            >
              <MaterialIcons
                name="check"
                size={48}
                color={theme.colors.primary}
              />
            </View>

            <Text
              style={[styles.resultTitle, { color: theme.colors.onSurface }]}
            >
              Payment Successful
            </Text>

            <Text
              style={[styles.resultAmount, { color: theme.colors.onSurface }]}
            >
              {formatCurrency(amount)}
            </Text>

            <Text
              style={[
                styles.resultDescription,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {description}
            </Text>
          </View>
        );

      case "failure":
        return (
          <View style={styles.resultContainer}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.colors.errorContainer },
              ]}
            >
              <MaterialIcons
                name="error"
                size={48}
                color={theme.colors.error}
              />
            </View>

            <Text
              style={[styles.resultTitle, { color: theme.colors.onSurface }]}
            >
              Payment Failed
            </Text>

            {errorMessage && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errorMessage}
              </Text>
            )}

            <Button
              mode="contained"
              onPress={() => setProcessingStatus("idle")}
              style={styles.tryAgainButton}
            >
              Try Again
            </Button>

            <Button
              mode="text"
              onPress={handleCancel}
              style={styles.cancelTextButton}
            >
              Cancel
            </Button>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalContainer}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text
              style={[styles.modalTitle, { color: theme.colors.onSurface }]}
            >
              {processingStatus === "idle"
                ? "Payment"
                : processingStatus === "processing"
                ? "Processing"
                : processingStatus === "success"
                ? "Payment Complete"
                : "Payment Failed"}
            </Text>

            {processingStatus !== "processing" && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCancel}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={theme.colors.onSurface}
                />
              </TouchableOpacity>
            )}
          </View>

          {renderProcessingContent()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  contentContainer: {
    padding: 16,
  },
  amountText: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  paymentMethodContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  payButton: {
    flex: 2,
    marginLeft: 8,
  },
  processingContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  processingText: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 16,
    marginBottom: 8,
  },
  processingSubtext: {
    fontSize: 14,
  },
  resultContainer: {
    padding: 24,
    alignItems: "center",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  resultAmount: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  resultDescription: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  tryAgainButton: {
    width: "100%",
    marginBottom: 8,
  },
  cancelTextButton: {
    width: "100%",
  },
});
