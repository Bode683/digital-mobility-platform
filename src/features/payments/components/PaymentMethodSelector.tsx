import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator, Button, useTheme } from "react-native-paper";
import { usePayment } from "../contexts/PaymentContext";
import { PaymentMethod } from "../types";
import { PaymentMethodCard } from "./PaymentMethodCard";

interface PaymentMethodSelectorProps {
  onSelectPaymentMethod?: (paymentMethod: PaymentMethod) => void;
  selectedPaymentMethodId?: string;
  showAddButton?: boolean;
  compact?: boolean;
}

export function PaymentMethodSelector({
  onSelectPaymentMethod,
  selectedPaymentMethodId,
  showAddButton = true,
  compact = false,
}: PaymentMethodSelectorProps) {
  const theme = useTheme();
  const {
    state,
    loadPaymentMethods,
    setAsDefaultPaymentMethod,
    removePaymentMethod,
  } = usePayment();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(
    selectedPaymentMethodId
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize with default payment method if none selected
  useEffect(() => {
    if (!selectedId && state.paymentMethods.length > 0) {
      const defaultMethod = state.paymentMethods.find((pm) => pm.isDefault);
      setSelectedId(defaultMethod?.id || state.paymentMethods[0].id);

      if (onSelectPaymentMethod) {
        onSelectPaymentMethod(defaultMethod || state.paymentMethods[0]);
      }
    }
  }, [state.paymentMethods, selectedId, onSelectPaymentMethod]);

  // Update selected ID when prop changes
  useEffect(() => {
    if (selectedPaymentMethodId && selectedPaymentMethodId !== selectedId) {
      setSelectedId(selectedPaymentMethodId);
    }
  }, [selectedPaymentMethodId, selectedId]);

  // Get the currently selected payment method
  const getSelectedPaymentMethod = (): PaymentMethod | undefined => {
    return state.paymentMethods.find((pm) => pm.id === selectedId);
  };

  // Handle refreshing payment methods
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPaymentMethods();
    setIsRefreshing(false);
  };

  // Handle payment method selection
  const handleSelectPaymentMethod = (paymentMethod: PaymentMethod) => {
    setSelectedId(paymentMethod.id);
    setIsModalVisible(false);

    if (onSelectPaymentMethod) {
      onSelectPaymentMethod(paymentMethod);
    }
  };

  // Handle setting a payment method as default
  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      await setAsDefaultPaymentMethod(paymentMethodId);
    } catch (error) {
      console.error("Error setting default payment method:", error);
      Alert.alert("Error", "Failed to set default payment method");
    }
  };

  // Handle payment method deletion
  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    Alert.alert(
      "Delete Payment Method",
      "Are you sure you want to delete this payment method?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await removePaymentMethod(paymentMethodId);

              if (success) {
                // If the deleted method was selected, select another one
                if (selectedId === paymentMethodId) {
                  const defaultMethod = state.paymentMethods.find(
                    (pm) => pm.isDefault && pm.id !== paymentMethodId
                  );
                  const newSelectedId =
                    defaultMethod?.id ||
                    state.paymentMethods.find((pm) => pm.id !== paymentMethodId)
                      ?.id;

                  if (newSelectedId) {
                    setSelectedId(newSelectedId);

                    if (onSelectPaymentMethod) {
                      const newSelectedMethod = state.paymentMethods.find(
                        (pm) => pm.id === newSelectedId
                      );
                      if (newSelectedMethod) {
                        onSelectPaymentMethod(newSelectedMethod);
                      }
                    }
                  }
                }
              }
            } catch (error) {
              console.error("Error deleting payment method:", error);
              Alert.alert("Error", "Failed to delete payment method");
            }
          },
        },
      ]
    );
  };

  // Render the selected payment method in compact mode
  const renderCompactSelector = () => {
    const selectedMethod = getSelectedPaymentMethod();

    return (
      <TouchableOpacity
        style={[
          styles.compactSelector,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
          },
        ]}
        onPress={() => setIsModalVisible(true)}
      >
        {selectedMethod ? (
          <View style={styles.compactContent}>
            <MaterialIcons
              name={
                selectedMethod.type === "credit_card" ||
                selectedMethod.type === "debit_card"
                  ? "credit-card"
                  : selectedMethod.type === "paypal"
                  ? "payment"
                  : selectedMethod.type === "apple_pay"
                  ? "phone-iphone"
                  : selectedMethod.type === "google_pay"
                  ? "android"
                  : "credit-card"
              }
              size={20}
              color={theme.colors.primary}
              style={styles.compactIcon}
            />
            <Text
              style={[styles.compactText, { color: theme.colors.onSurface }]}
            >
              {selectedMethod.type === "credit_card" ||
              selectedMethod.type === "debit_card"
                ? `•••• ${selectedMethod.lastFour}`
                : selectedMethod.type === "paypal"
                ? "PayPal"
                : selectedMethod.type === "apple_pay"
                ? "Apple Pay"
                : selectedMethod.type === "google_pay"
                ? "Google Pay"
                : "Payment Method"}
            </Text>
          </View>
        ) : (
          <Text
            style={[
              styles.compactText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Select Payment Method
          </Text>
        )}
        <MaterialIcons
          name="chevron-right"
          size={20}
          color={theme.colors.onSurfaceVariant}
        />
      </TouchableOpacity>
    );
  };

  // Render the payment method selection modal
  const renderPaymentMethodModal = () => {
    return (
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
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
                onPress={() => setIsModalVisible(false)}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={theme.colors.onSurface}
                />
              </TouchableOpacity>
            </View>

            {state.isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text
                  style={[
                    styles.loadingText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Loading payment methods...
                </Text>
              </View>
            ) : state.paymentMethods.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons
                  name="credit-card-off"
                  size={48}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.emptyText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  No payment methods found
                </Text>
                {showAddButton && (
                  <Button
                    mode="contained"
                    onPress={() => {
                      setIsModalVisible(false);
                      // In a real app, navigate to add payment method screen
                      Alert.alert(
                        "Add Payment Method",
                        "This would navigate to the Add Payment Method screen in a real app."
                      );
                    }}
                    style={styles.addButton}
                  >
                    Add Payment Method
                  </Button>
                )}
              </View>
            ) : (
              <FlatList
                data={state.paymentMethods}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <PaymentMethodCard
                    paymentMethod={item}
                    isSelected={selectedId === item.id}
                    onSelect={() => handleSelectPaymentMethod(item)}
                    onSetDefault={() => handleSetDefault(item.id)}
                    onDelete={() => handleDeletePaymentMethod(item.id)}
                  />
                )}
                contentContainerStyle={styles.listContent}
                onRefresh={handleRefresh}
                refreshing={isRefreshing}
              />
            )}

            {showAddButton && state.paymentMethods.length > 0 && (
              <Button
                mode="outlined"
                icon="plus"
                onPress={() => {
                  setIsModalVisible(false);
                  // In a real app, navigate to add payment method screen
                  Alert.alert(
                    "Add Payment Method",
                    "This would navigate to the Add Payment Method screen in a real app."
                  );
                }}
                style={styles.addButtonInList}
              >
                Add Payment Method
              </Button>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  // If compact mode is requested, render the compact selector
  if (compact) {
    return (
      <View style={styles.container}>
        {renderCompactSelector()}
        {renderPaymentMethodModal()}
      </View>
    );
  }

  // Otherwise render the full list
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        Payment Methods
      </Text>

      {state.isLoading && state.paymentMethods.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={[
              styles.loadingText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Loading payment methods...
          </Text>
        </View>
      ) : state.paymentMethods.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons
            name="credit-card-off"
            size={48}
            color={theme.colors.onSurfaceVariant}
          />
          <Text
            style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
          >
            No payment methods found
          </Text>
        </View>
      ) : (
        <FlatList
          data={state.paymentMethods}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PaymentMethodCard
              paymentMethod={item}
              isSelected={selectedId === item.id}
              onSelect={() => handleSelectPaymentMethod(item)}
              onSetDefault={() => handleSetDefault(item.id)}
              onDelete={() => handleDeletePaymentMethod(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
        />
      )}

      {showAddButton && (
        <Button
          mode="contained"
          icon="plus"
          onPress={() => {
            // In a real app, navigate to add payment method screen
            Alert.alert(
              "Add Payment Method",
              "This would navigate to the Add Payment Method screen in a real app."
            );
          }}
          style={styles.addButton}
        >
          Add Payment Method
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  loadingContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  addButton: {
    marginTop: 16,
  },
  addButtonInList: {
    margin: 16,
  },
  // Compact selector styles
  compactSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  compactContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  compactIcon: {
    marginRight: 8,
  },
  compactText: {
    fontSize: 16,
  },
  // Modal styles
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
});
