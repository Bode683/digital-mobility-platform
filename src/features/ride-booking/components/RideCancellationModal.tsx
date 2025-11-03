import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, useTheme } from "react-native-paper";
import { fetchCancellationReasons } from "../api";
import { useRideBooking } from "../contexts/RideBookingContext";
import { CancellationReason } from "../types";

interface RideCancellationModalProps {
  visible: boolean;
  onClose: () => void;
  onCancel: (reason: string) => void;
}

export function RideCancellationModal({
  visible,
  onClose,
  onCancel,
}: RideCancellationModalProps) {
  const theme = useTheme();
  const { state } = useRideBooking();

  const [reasons, setReasons] = useState<CancellationReason[]>([]);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load cancellation reasons
  useEffect(() => {
    const loadReasons = async () => {
      if (!visible) return;

      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchCancellationReasons();
        setReasons(data);
      } catch (error) {
        console.error("Error loading cancellation reasons:", error);
        setError("Failed to load cancellation reasons");
      } finally {
        setIsLoading(false);
      }
    };

    loadReasons();
  }, [visible]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setSelectedReason(null);
      setError(null);
      setIsSubmitting(false);
    }
  }, [visible]);

  // Handle cancellation
  const handleCancel = async () => {
    if (!selectedReason) return;

    try {
      setIsSubmitting(true);
      await onCancel(selectedReason);
    } catch (error) {
      console.error("Error cancelling ride:", error);
      setError("Failed to cancel ride");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
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
              Cancel Ride
            </Text>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons
                name="close"
                size={24}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.modalSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Please select a reason for cancellation:
          </Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
            </View>
          ) : (
            <FlatList
              data={reasons}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.reasonItem,
                    selectedReason === item.id && {
                      backgroundColor: theme.colors.primaryContainer,
                    },
                  ]}
                  onPress={() => setSelectedReason(item.id)}
                >
                  <Text
                    style={[
                      styles.reasonText,
                      {
                        color:
                          selectedReason === item.id
                            ? theme.colors.primary
                            : theme.colors.onSurface,
                      },
                    ]}
                  >
                    {item.reason}
                  </Text>

                  {selectedReason === item.id && (
                    <MaterialIcons
                      name="check"
                      size={24}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
              style={styles.reasonsList}
            />
          )}

          {state.currentRide && (
            <View style={styles.feeContainer}>
              <Text
                style={[
                  styles.feeText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Note: Cancellation may incur a fee depending on how long your
                driver has been waiting.
              </Text>
            </View>
          )}

          <View style={styles.actionsContainer}>
            <Button
              mode="outlined"
              style={[styles.actionButton, styles.cancelButton]}
              onPress={onClose}
            >
              Keep Ride
            </Button>

            <Button
              mode="contained"
              style={[styles.actionButton, styles.confirmButton]}
              disabled={!selectedReason || isSubmitting}
              loading={isSubmitting}
              onPress={handleCancel}
            >
              Cancel Ride
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
  modalSubtitle: {
    fontSize: 16,
    padding: 16,
    paddingBottom: 8,
  },
  loadingContainer: {
    padding: 24,
    alignItems: "center",
  },
  errorContainer: {
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
  reasonsList: {
    maxHeight: 300,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  reasonText: {
    fontSize: 16,
  },
  feeContainer: {
    padding: 16,
    paddingTop: 8,
  },
  feeText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  actionsContainer: {
    flexDirection: "row",
    padding: 16,
  },
  actionButton: {
    flex: 1,
  },
  cancelButton: {
    marginRight: 8,
  },
  confirmButton: {
    marginLeft: 8,
  },
});
