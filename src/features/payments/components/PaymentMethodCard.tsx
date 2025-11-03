import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import { PaymentMethod } from "../types";

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  isSelected?: boolean;
  onSelect?: () => void;
  onSetDefault?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export function PaymentMethodCard({
  paymentMethod,
  isSelected = false,
  onSelect,
  onSetDefault,
  onDelete,
  showActions = true,
}: PaymentMethodCardProps) {
  const theme = useTheme();

  // Get icon based on payment method type and card brand
  const getPaymentIcon = () => {
    switch (paymentMethod.type) {
      case "credit_card":
      case "debit_card":
        switch (paymentMethod.cardBrand) {
          case "visa":
            return "credit-card";
          case "mastercard":
            return "credit-card";
          case "amex":
            return "credit-card";
          default:
            return "credit-card";
        }
      case "paypal":
        return "payment";
      case "apple_pay":
        return "phone-iphone";
      case "google_pay":
        return "android";
      case "cash":
        return "attach-money";
      default:
        return "credit-card";
    }
  };

  // Get payment method display name
  const getPaymentDisplayName = () => {
    switch (paymentMethod.type) {
      case "credit_card":
      case "debit_card":
        const cardType =
          paymentMethod.type === "credit_card" ? "Credit" : "Debit";
        const brand = paymentMethod.cardBrand
          ? paymentMethod.cardBrand.charAt(0).toUpperCase() +
            paymentMethod.cardBrand.slice(1)
          : "";
        return `${brand} ${cardType} •••• ${paymentMethod.lastFour}`;
      case "paypal":
        return `PayPal${
          paymentMethod.email ? ` (${paymentMethod.email})` : ""
        }`;
      case "apple_pay":
        return "Apple Pay";
      case "google_pay":
        return "Google Pay";
      case "cash":
        return "Cash";
      default:
        return "Payment Method";
    }
  };

  // Get expiry date display
  const getExpiryDisplay = () => {
    if (
      paymentMethod.type === "credit_card" ||
      paymentMethod.type === "debit_card"
    ) {
      if (paymentMethod.expiryMonth && paymentMethod.expiryYear) {
        return `Expires ${paymentMethod.expiryMonth}/${paymentMethod.expiryYear}`;
      }
    }
    return null;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isSelected
            ? theme.colors.primaryContainer
            : theme.colors.surface,
          borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
        },
      ]}
      onPress={onSelect}
      disabled={!onSelect}
    >
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <MaterialIcons
            name={getPaymentIcon()}
            size={24}
            color={isSelected ? theme.colors.primary : theme.colors.onSurface}
          />
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.nameRow}>
            <Text
              style={[
                styles.methodName,
                {
                  color: isSelected
                    ? theme.colors.primary
                    : theme.colors.onSurface,
                },
              ]}
            >
              {getPaymentDisplayName()}
            </Text>
            {paymentMethod.isDefault && (
              <View
                style={[
                  styles.defaultBadge,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.defaultText,
                    { color: theme.colors.onPrimary },
                  ]}
                >
                  Default
                </Text>
              </View>
            )}
          </View>

          {getExpiryDisplay() && (
            <Text
              style={[
                styles.expiryText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {getExpiryDisplay()}
            </Text>
          )}
        </View>
      </View>

      {showActions && (isSelected || onDelete || onSetDefault) && (
        <View style={styles.actionsContainer}>
          {!paymentMethod.isDefault && onSetDefault && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onSetDefault}
            >
              <MaterialIcons
                name="star-outline"
                size={20}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
              <MaterialIcons
                name="delete-outline"
                size={20}
                color={theme.colors.error}
              />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    marginRight: 16,
  },
  detailsContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  methodName: {
    fontSize: 16,
    fontWeight: "500",
    marginRight: 8,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: "500",
  },
  expiryText: {
    fontSize: 14,
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
});
