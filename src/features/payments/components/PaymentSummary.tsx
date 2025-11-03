import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Divider, useTheme } from "react-native-paper";

interface PaymentSummaryProps {
  subtotal: number;
  tax?: number;
  tip?: number;
  discount?: number;
  total: number;
  currency?: string;
  showBreakdown?: boolean;
}

export function PaymentSummary({
  subtotal,
  tax = 0,
  tip = 0,
  discount = 0,
  total,
  currency = "USD",
  showBreakdown = true,
}: PaymentSummaryProps) {
  const theme = useTheme();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // If breakdown is not needed, just show the total
  if (!showBreakdown) {
    return (
      <View style={styles.container}>
        <Text style={[styles.totalLabel, { color: theme.colors.onSurface }]}>
          Total
        </Text>
        <Text style={[styles.totalAmount, { color: theme.colors.onSurface }]}>
          {formatCurrency(total)}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        Payment Summary
      </Text>

      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
          Subtotal
        </Text>
        <Text style={[styles.amount, { color: theme.colors.onSurface }]}>
          {formatCurrency(subtotal)}
        </Text>
      </View>

      {tax > 0 && (
        <View style={styles.row}>
          <Text
            style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
          >
            Tax
          </Text>
          <Text style={[styles.amount, { color: theme.colors.onSurface }]}>
            {formatCurrency(tax)}
          </Text>
        </View>
      )}

      {tip > 0 && (
        <View style={styles.row}>
          <Text
            style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
          >
            Tip
          </Text>
          <Text style={[styles.amount, { color: theme.colors.onSurface }]}>
            {formatCurrency(tip)}
          </Text>
        </View>
      )}

      {discount > 0 && (
        <View style={styles.row}>
          <Text
            style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
          >
            Discount
          </Text>
          <Text style={[styles.amount, { color: theme.colors.primary }]}>
            -{formatCurrency(discount)}
          </Text>
        </View>
      )}

      <Divider
        style={[
          styles.divider,
          { backgroundColor: theme.colors.outlineVariant },
        ]}
      />

      <View style={styles.totalRow}>
        <Text style={[styles.totalLabel, { color: theme.colors.onSurface }]}>
          Total
        </Text>
        <Text style={[styles.totalAmount, { color: theme.colors.onSurface }]}>
          {formatCurrency(total)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
  },
  amount: {
    fontSize: 16,
  },
  divider: {
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
