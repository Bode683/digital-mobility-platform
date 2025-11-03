import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, useTheme } from "react-native-paper";
import { useDriver } from "../contexts/DriverContext";

interface DriverRatingProps {
  visible: boolean;
  onClose: () => void;
  onRatingComplete?: () => void;
}

export function DriverRating({
  visible,
  onClose,
  onRatingComplete,
}: DriverRatingProps) {
  const theme = useTheme();
  const { state, rateDriver } = useDriver();

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Handle star press
  const handleStarPress = (value: number) => {
    setRating(value);
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!state.assignedDriver) return;

    try {
      setIsSubmitting(true);
      const success = await rateDriver(rating, comment);

      if (success) {
        setComment("");
        onClose();
        if (onRatingComplete) {
          onRatingComplete();
        }
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render stars for rating selection
  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((value) => (
          <TouchableOpacity
            key={value}
            onPress={() => handleStarPress(value)}
            style={styles.starButton}
          >
            <MaterialIcons
              name={value <= rating ? "star" : "star-outline"}
              size={36}
              color="#FFD700"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
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
              Rate Your Driver
            </Text>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons
                name="close"
                size={24}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.driverInfoContainer}>
            {state.assignedDriver && (
              <>
                <View style={styles.driverImageContainer}>
                  <MaterialIcons
                    name="account-circle"
                    size={60}
                    color={theme.colors.primary}
                  />
                </View>
                <Text
                  style={[styles.driverName, { color: theme.colors.onSurface }]}
                >
                  {state.assignedDriver.name}
                </Text>
              </>
            )}
          </View>

          <Text
            style={[
              styles.ratingLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            How was your ride?
          </Text>

          {renderStars()}

          <Text
            style={[
              styles.commentLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Add a comment (optional)
          </Text>

          <TextInput
            style={[
              styles.commentInput,
              {
                backgroundColor: theme.colors.surfaceVariant,
                color: theme.colors.onSurface,
                borderColor: theme.colors.outline,
              },
            ]}
            value={comment}
            onChangeText={setComment}
            placeholder="Tell us about your experience..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
            multiline
            maxLength={200}
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              style={[styles.button, styles.skipButton]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              Skip
            </Button>

            <Button
              mode="contained"
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Submit
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
    padding: 16,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  driverInfoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  driverImageContainer: {
    marginBottom: 8,
  },
  driverName: {
    fontSize: 18,
    fontWeight: "500",
  },
  ratingLabel: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  starButton: {
    padding: 8,
  },
  commentLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "row",
  },
  button: {
    flex: 1,
  },
  skipButton: {
    marginRight: 8,
  },
  submitButton: {
    marginLeft: 8,
  },
});
