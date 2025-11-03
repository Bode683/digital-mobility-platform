import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, useTheme } from "react-native-paper";
import { usePayment } from "../contexts/PaymentContext";
import { NewPaymentMethodRequest, PaymentMethodType } from "../types";

interface AddPaymentMethodProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddPaymentMethod({
  visible,
  onClose,
  onSuccess,
}: AddPaymentMethodProps) {
  const theme = useTheme();
  const { addNewPaymentMethod } = usePayment();

  // Form state
  const [paymentType, setPaymentType] =
    useState<PaymentMethodType>("credit_card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form
  const resetForm = () => {
    setPaymentType("credit_card");
    setCardNumber("");
    setExpiryMonth("");
    setExpiryYear("");
    setCvc("");
    setCardholderName("");
    setSetAsDefault(false);
    setError(null);
  };

  // Handle close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Format card number with spaces
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s+/g, "");
    const groups = [];

    for (let i = 0; i < cleaned.length; i += 4) {
      groups.push(cleaned.substr(i, 4));
    }

    return groups.join(" ").substr(0, 19); // 16 digits + 3 spaces
  };

  // Validate form
  const validateForm = () => {
    if (paymentType === "credit_card" || paymentType === "debit_card") {
      if (!cardNumber || cardNumber.replace(/\s+/g, "").length < 13) {
        setError("Please enter a valid card number");
        return false;
      }

      if (!expiryMonth || !expiryYear) {
        setError("Please enter a valid expiration date");
        return false;
      }

      const month = parseInt(expiryMonth, 10);
      if (isNaN(month) || month < 1 || month > 12) {
        setError("Please enter a valid month (1-12)");
        return false;
      }

      const year = parseInt(expiryYear, 10);
      const currentYear = new Date().getFullYear() % 100; // Get last 2 digits of year
      if (isNaN(year) || year < currentYear) {
        setError("Please enter a valid year");
        return false;
      }

      if (!cvc || cvc.length < 3) {
        setError("Please enter a valid CVC");
        return false;
      }

      if (!cardholderName) {
        setError("Please enter the cardholder name");
        return false;
      }
    }

    setError(null);
    return true;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const paymentMethodRequest: NewPaymentMethodRequest = {
        type: paymentType,
        setAsDefault,
      };

      if (paymentType === "credit_card" || paymentType === "debit_card") {
        paymentMethodRequest.cardNumber = cardNumber.replace(/\s+/g, "");
        paymentMethodRequest.expiryMonth = expiryMonth;
        paymentMethodRequest.expiryYear = expiryYear;
        paymentMethodRequest.cvc = cvc;
        paymentMethodRequest.cardholderName = cardholderName;
      }

      await addNewPaymentMethod(paymentMethodRequest);

      // Reset form and close modal
      resetForm();
      onClose();

      if (onSuccess) {
        onSuccess();
      }

      Alert.alert("Success", "Payment method added successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add payment method";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Payment type options
  const paymentTypeOptions: {
    value: PaymentMethodType;
    label: string;
    icon: string;
  }[] = [
    { value: "credit_card", label: "Credit Card", icon: "credit-card" },
    { value: "debit_card", label: "Debit Card", icon: "credit-card" },
    { value: "paypal", label: "PayPal", icon: "payment" },
    { value: "google_pay", label: "Google Pay", icon: "android" },
    { value: "apple_pay", label: "Apple Pay", icon: "phone-iphone" },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
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
              Add Payment Method
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              disabled={isSubmitting}
            >
              <MaterialIcons
                name="close"
                size={24}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            {/* Payment Type Selection */}
            <Text
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Payment Type
            </Text>

            <View style={styles.paymentTypeContainer}>
              {paymentTypeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.paymentTypeOption,
                    {
                      backgroundColor:
                        paymentType === option.value
                          ? theme.colors.primaryContainer
                          : theme.colors.surfaceVariant,
                      borderColor:
                        paymentType === option.value
                          ? theme.colors.primary
                          : theme.colors.surfaceVariant,
                    },
                  ]}
                  onPress={() => setPaymentType(option.value)}
                  disabled={isSubmitting}
                >
                  <MaterialIcons
                    name={option.icon as any}
                    size={24}
                    color={
                      paymentType === option.value
                        ? theme.colors.primary
                        : theme.colors.onSurfaceVariant
                    }
                    style={styles.paymentTypeIcon}
                  />
                  <Text
                    style={[
                      styles.paymentTypeLabel,
                      {
                        color:
                          paymentType === option.value
                            ? theme.colors.primary
                            : theme.colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Credit/Debit Card Form */}
            {(paymentType === "credit_card" ||
              paymentType === "debit_card") && (
              <View style={styles.cardForm}>
                <Text
                  style={[
                    styles.inputLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Card Number
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      color: theme.colors.onSurface,
                      borderColor: theme.colors.outline,
                    },
                  ]}
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  keyboardType="numeric"
                  maxLength={19} // 16 digits + 3 spaces
                  editable={!isSubmitting}
                />

                <View style={styles.expiryRow}>
                  <View style={styles.expiryContainer}>
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      Expiry Month
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.colors.surfaceVariant,
                          color: theme.colors.onSurface,
                          borderColor: theme.colors.outline,
                        },
                      ]}
                      value={expiryMonth}
                      onChangeText={setExpiryMonth}
                      placeholder="MM"
                      placeholderTextColor={theme.colors.onSurfaceVariant}
                      keyboardType="numeric"
                      maxLength={2}
                      editable={!isSubmitting}
                    />
                  </View>

                  <View style={styles.expiryContainer}>
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      Expiry Year
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.colors.surfaceVariant,
                          color: theme.colors.onSurface,
                          borderColor: theme.colors.outline,
                        },
                      ]}
                      value={expiryYear}
                      onChangeText={setExpiryYear}
                      placeholder="YY"
                      placeholderTextColor={theme.colors.onSurfaceVariant}
                      keyboardType="numeric"
                      maxLength={2}
                      editable={!isSubmitting}
                    />
                  </View>

                  <View style={styles.cvcContainer}>
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      CVC
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.colors.surfaceVariant,
                          color: theme.colors.onSurface,
                          borderColor: theme.colors.outline,
                        },
                      ]}
                      value={cvc}
                      onChangeText={setCvc}
                      placeholder="123"
                      placeholderTextColor={theme.colors.onSurfaceVariant}
                      keyboardType="numeric"
                      maxLength={4}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>

                <Text
                  style={[
                    styles.inputLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Cardholder Name
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      color: theme.colors.onSurface,
                      borderColor: theme.colors.outline,
                    },
                  ]}
                  value={cardholderName}
                  onChangeText={setCardholderName}
                  placeholder="John Doe"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  editable={!isSubmitting}
                />
              </View>
            )}

            {/* Digital Wallet Message */}
            {(paymentType === "paypal" ||
              paymentType === "google_pay" ||
              paymentType === "apple_pay") && (
              <View style={styles.walletMessage}>
                <MaterialIcons
                  name={
                    paymentType === "paypal"
                      ? "payment"
                      : paymentType === "google_pay"
                      ? "android"
                      : "phone-iphone"
                  }
                  size={48}
                  color={theme.colors.primary}
                  style={styles.walletIcon}
                />
                <Text
                  style={[styles.walletText, { color: theme.colors.onSurface }]}
                >
                  {paymentType === "paypal"
                    ? "You will be redirected to PayPal to complete setup."
                    : paymentType === "google_pay"
                    ? "You will be redirected to Google Pay to complete setup."
                    : "You will be redirected to Apple Pay to complete setup."}
                </Text>
                <Text
                  style={[
                    styles.walletSubtext,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  (This is a mock implementation, no actual redirection will
                  occur)
                </Text>
              </View>
            )}

            {/* Set as Default Option */}
            <TouchableOpacity
              style={styles.defaultOption}
              onPress={() => setSetAsDefault(!setAsDefault)}
              disabled={isSubmitting}
            >
              <MaterialIcons
                name={setAsDefault ? "check-box" : "check-box-outline-blank"}
                size={24}
                color={theme.colors.primary}
                style={styles.checkboxIcon}
              />
              <Text
                style={[styles.defaultText, { color: theme.colors.onSurface }]}
              >
                Set as default payment method
              </Text>
            </TouchableOpacity>

            {/* Error Message */}
            {error && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
            )}
          </ScrollView>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.submitButton}
            >
              Add Payment Method
            </Button>
          </View>
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
    maxHeight: "90%",
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
  scrollView: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  paymentTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  paymentTypeOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  paymentTypeIcon: {
    marginRight: 8,
  },
  paymentTypeLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  cardForm: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  expiryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  expiryContainer: {
    flex: 1,
    marginRight: 8,
  },
  cvcContainer: {
    flex: 1,
  },
  walletMessage: {
    alignItems: "center",
    padding: 24,
    marginBottom: 16,
  },
  walletIcon: {
    marginBottom: 16,
  },
  walletText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  walletSubtext: {
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
  defaultOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkboxIcon: {
    marginRight: 8,
  },
  defaultText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  submitButton: {
    width: "100%",
  },
});
