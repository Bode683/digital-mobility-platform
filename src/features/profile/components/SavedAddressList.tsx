import { ThemedText } from "@/components/themed-text";
import React from "react";
import { StyleSheet, View } from "react-native";
import { IconButton, List, Surface } from "react-native-paper";
import { useSavedAddresses } from "../hooks/useSavedAddresses";
import { AddressType, SavedAddress } from "../types";

interface SavedAddressListProps {
  addresses: SavedAddress[];
}

/**
 * Component to display a list of saved addresses
 */
export function SavedAddressList({ addresses }: SavedAddressListProps) {
  const { deleteAddress } = useSavedAddresses();

  const getAddressIcon = (type: AddressType) => {
    switch (type) {
      case AddressType.HOME:
        return "home";
      case AddressType.WORK:
        return "briefcase";
      case AddressType.FAVORITE:
        return "star";
      default:
        return "map-marker";
    }
  };

  const handleDelete = (id: string) => {
    deleteAddress.mutate(id);
  };

  if (addresses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>
          You don&apos;t have any saved addresses yet.
        </ThemedText>
      </View>
    );
  }

  return (
    <Surface style={styles.container}>
      {addresses.map((address) => (
        <List.Item
          key={address.id}
          title={address.name}
          description={address.address}
          left={(props) => (
            <List.Icon {...props} icon={getAddressIcon(address.type)} />
          )}
          right={(props) => (
            <IconButton
              {...props}
              icon="delete"
              onPress={() => handleDelete(address.id)}
            />
          )}
          style={styles.item}
        />
      ))}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  emptyContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  emptyText: {
    textAlign: "center",
  },
});
