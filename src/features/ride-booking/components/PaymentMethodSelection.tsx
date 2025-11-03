import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, useTheme } from "react-native-paper";
import { useRideBooking } from "../contexts/RideBookingContext";
import { PaymentMethod } from "../types";

interface PaymentMethodSelectionProps {
  onSelect?: (paymentMethod: PaymentMethod) => void;
}

export function PaymentMethodSelection({
  onSelect,
}: PaymentMethodSelectionProps) {
  const theme = useTheme();
  const { state, selectPaymentMethod } = useRideBooking();
  const { paymentMethods, selectedPaymentMethod } = state;

  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (paymentMethod: PaymentMethod) => {
    selectPaymentMethod(paymentMethod);
    setModalVisible(false);
    if (onSelect) {
      onSelect(paymentMethod);
    }
  };

  // Helper function to get payment method icon
  const getPaymentIcon = (type: PaymentMethod["type"]) => {
    switch (type) {
      case "card":
        return "credit-card";
      case "paypal":
        return "payment";
      case "cash":
        return "attach-money";
      case "apple_pay":
        return "phone-iphone";
      case "google_pay":
        return "android";
      default:
        return "credit-card";
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
        Payment Method
      </Text>

      <TouchableOpacity
        style={[styles.selectedMethod, { borderColor: theme.colors.outline }]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.paymentInfo}>
          <MaterialIcons
            name={
              selectedPaymentMethod
                ? getPaymentIcon(selectedPaymentMethod.type)
                : "credit-card"
            }
            size={24}
            color={theme.colors.primary}
            style={styles.paymentIcon}
          />

          <Text
            style={[styles.paymentLabel, { color: theme.colors.onSurface }]}
          >
            {selectedPaymentMethod
              ? selectedPaymentMethod.label
              : "Select payment method"}
          </Text>
        </View>

        <MaterialIcons
          name="chevron-right"
          size={24}
          color={theme.colors.onSurfaceVariant}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
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
                Select Payment Method
              </Text>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={theme.colors.onSurface}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={paymentMethods}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.paymentItem,
                    selectedPaymentMethod?.id === item.id && {
                      backgroundColor: theme.colors.primaryContainer,
                    },
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <MaterialIcons
                    name={getPaymentIcon(item.type)}
                    size={24}
                    color={
                      selectedPaymentMethod?.id === item.id
                        ? theme.colors.primary
                        : theme.colors.onSurface
                    }
                    style={styles.paymentIcon}
                  />

                  <View style={styles.paymentDetails}>
                    <Text
                      style={[
                        styles.paymentLabel,
                        {
                          color:
                            selectedPaymentMethod?.id === item.id
                              ? theme.colors.primary
                              : theme.colors.onSurface,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>

                    {item.isDefault && (
                      <Text
                        style={[
                          styles.defaultLabel,
                          { color: theme.colors.primary },
                        ]}
                      >
                        Default
                      </Text>
                    )}
                  </View>

                  {selectedPaymentMethod?.id === item.id && (
                    <MaterialIcons
                      name="check"
                      size={24}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
            />

            <Button
              mode="contained"
              style={styles.addButton}
              onPress={() => {
                // In a real app, this would navigate to add payment method screen
                setModalVisible(false);
              }}
            >
              Add Payment Method
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  selectedMethod: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentIcon: {
    marginRight: 12,
  },
  paymentLabel: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
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
  paymentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  paymentDetails: {
    flex: 1,
  },
  defaultLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  addButton: {
    margin: 16,
  },
});
