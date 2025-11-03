import { ThemedText } from "@/components/themed-text";
import { useApi } from "@/context/ApiContext";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  SegmentedButtons,
  Surface,
  TextInput,
} from "react-native-paper";
import { useSavedAddresses } from "../hooks/useSavedAddresses";
import { AddressType } from "../types";

interface AddAddressFormProps {
  onComplete: () => void;
}

/**
 * Form for adding a new saved address
 */
export function AddAddressForm({ onComplete }: AddAddressFormProps) {
  const { addAddress } = useSavedAddresses();
  const { user } = useApi();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState<AddressType>(AddressType.HOME);
  const [isDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name || !address) {
      setError("Please fill out all fields");
      return;
    }

    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // In a real app, we would use a geocoding service to get lat/lng
      // For now, we'll use mock coordinates
      await addAddress.mutateAsync({
        user_id: user.id,
        name,
        address,
        latitude: 37.7749, // Mock coordinates for San Francisco
        longitude: -122.4194,
        type,
        is_default: isDefault,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      onComplete();
    } catch (err) {
      setError("Failed to save address. Please try again.");
      console.error("Error saving address:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Surface style={styles.container}>
      <ThemedText style={styles.title}>Add New Address</ThemedText>

      <TextInput
        label="Name (e.g. Home, Work)"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        label="Address"
        value={address}
        onChangeText={setAddress}
        style={styles.input}
        multiline
      />

      <ThemedText style={styles.label}>Address Type</ThemedText>
      <SegmentedButtons
        value={type}
        onValueChange={(value) => setType(value as AddressType)}
        buttons={[
          { value: AddressType.HOME, label: "Home" },
          { value: AddressType.WORK, label: "Work" },
          { value: AddressType.FAVORITE, label: "Favorite" },
          { value: AddressType.OTHER, label: "Other" },
        ]}
        style={styles.segmentedButtons}
      />

      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.button}
        >
          Save Address
        </Button>
      </View>
    </Surface>
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
  input: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    minWidth: 120,
  },
  errorText: {
    color: "red",
    marginBottom: 16,
  },
});
