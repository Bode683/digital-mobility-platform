import { ThemedText } from "@/components/themed-text";
import { usePayment } from "@/features/payments";
import { AddPaymentMethod } from "@/features/payments/components/AddPaymentMethod";
import { PaymentMethodCard } from "@/features/payments/components/PaymentMethodCard";
import { useTheme } from "@/hooks/use-theme";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, FAB, Surface } from "react-native-paper";

/**
 * Payment Methods Screen
 *
 * Allows users to view, add, edit, and delete payment methods
 */
export default function PaymentMethodsScreen() {
  const theme = useTheme();
  const { state, removePaymentMethod } = usePayment();
  const { paymentMethods, isLoading } = state;
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <Surface style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.content}
            contentContainerStyle={{ padding: theme.spacing.lg }}
          >
            <View style={styles.headerContainer}>
              <ThemedText style={styles.title}>Payment Methods</ThemedText>
            </View>

            {showAddForm && (
              <AddPaymentMethod
                visible={showAddForm}
                onClose={() => setShowAddForm(false)}
                onSuccess={() => setShowAddForm(false)}
              />
            )}
            {!showAddForm && (
              <>
                {paymentMethods.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <ThemedText style={styles.emptyText}>
                      You don&apos;t have any payment methods yet.
                    </ThemedText>
                    <Button
                      mode="contained"
                      onPress={() => setShowAddForm(true)}
                      style={styles.addButton}
                    >
                      Add Payment Method
                    </Button>
                  </View>
                ) : (
                  <View style={styles.paymentMethodsContainer}>
                    {paymentMethods.map((method) => (
                      <PaymentMethodCard
                        key={method.id}
                        paymentMethod={method}
                        onDelete={() => removePaymentMethod(method.id)}
                        style={styles.paymentMethodCard}
                      />
                    ))}
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {!showAddForm && paymentMethods.length > 0 && (
            <FAB
              icon="plus"
              style={[styles.fab, { backgroundColor: theme.colors.primary }]}
              onPress={() => setShowAddForm(true)}
              color="#fff"
            />
          )}
        </>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginBottom: 16,
    textAlign: "center",
  },
  addButton: {
    marginTop: 8,
  },
  paymentMethodsContainer: {
    marginTop: 16,
  },
  paymentMethodCard: {
    marginBottom: 16,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
