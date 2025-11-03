import { ThemedText } from "@/components/themed-text";
import { showToast } from "@/components/ToastProvider";

import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Divider, List, Surface } from "react-native-paper";

/**
 * Safety Screen
 *
 * Provides safety information, features, and emergency contacts
 */
export default function SafetyScreen() {

  const handleEmergencyContact = () => {
    showToast(
      "info",
      "In a real app, this would connect to emergency services"
    );
  };

  const handleShareLocation = () => {
    showToast(
      "info",
      "In a real app, this would share your location with trusted contacts"
    );
  };

  return (
    <Surface style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.headerContainer}>
          <ThemedText style={styles.title}>Safety Center</ThemedText>
        </View>

        {/* Emergency Card */}
        <Card style={styles.emergencyCard}>
          <Card.Content>
            <ThemedText style={styles.emergencyTitle}>
              Emergency Assistance
            </ThemedText>
            <ThemedText style={styles.emergencyText}>
              If you&apos;re in an emergency situation, tap the button below to
              contact emergency services.
            </ThemedText>
          </Card.Content>
          <Card.Actions>
            <Button
              mode="contained"
              buttonColor="#E53E3E"
              textColor="#FFFFFF"
              onPress={handleEmergencyContact}
            >
              Emergency Contact
            </Button>
          </Card.Actions>
        </Card>

        {/* Safety Features */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Safety Features</ThemedText>

          <List.Item
            title="Share My Trip"
            description="Share your trip details with trusted contacts"
            left={(props) => <List.Icon {...props} icon="share" />}
            onPress={handleShareLocation}
            style={styles.listItem}
          />

          <List.Item
            title="Verify Your Ride"
            description="Check the license plate and driver details before entering the vehicle"
            left={(props) => <List.Icon {...props} icon="check-circle" />}
            onPress={() => showToast("info", "Always verify your ride details")}
            style={styles.listItem}
          />

          <List.Item
            title="Trusted Contacts"
            description="Set up trusted contacts for quick access during rides"
            left={(props) => <List.Icon {...props} icon="account-multiple" />}
            onPress={() =>
              showToast("info", "Trusted contacts feature coming soon")
            }
            style={styles.listItem}
          />
        </View>

        <Divider style={styles.divider} />

        {/* Safety Tips */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Safety Tips</ThemedText>

          <Card style={styles.tipCard}>
            <Card.Content>
              <ThemedText style={styles.tipTitle}>Wait Indoors</ThemedText>
              <ThemedText style={styles.tipText}>
                Wait indoors until your driver arrives to minimize time on the
                street.
              </ThemedText>
            </Card.Content>
          </Card>

          <Card style={styles.tipCard}>
            <Card.Content>
              <ThemedText style={styles.tipTitle}>
                Verify Vehicle Details
              </ThemedText>
              <ThemedText style={styles.tipText}>
                Always check the license plate, car model, and driver photo
                before entering the vehicle.
              </ThemedText>
            </Card.Content>
          </Card>

          <Card style={styles.tipCard}>
            <Card.Content>
              <ThemedText style={styles.tipTitle}>Share Your Trip</ThemedText>
              <ThemedText style={styles.tipText}>
                Share your trip details with a friend or family member so they
                can track your journey.
              </ThemedText>
            </Card.Content>
          </Card>

          <Card style={styles.tipCard}>
            <Card.Content>
              <ThemedText style={styles.tipTitle}>
                Ride in the Back Seat
              </ThemedText>
              <ThemedText style={styles.tipText}>
                When possible, ride in the back seat to give yourself and the
                driver personal space.
              </ThemedText>
            </Card.Content>
          </Card>
        </View>

        {/* Community Guidelines */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Community Guidelines
          </ThemedText>
          <ThemedText style={styles.guidelinesText}>
            We&apos;re committed to providing a safe environment for all users. Our
            community guidelines ensure respect, safety, and comfort for
            everyone.
          </ThemedText>
          <Button
            mode="outlined"
            onPress={() =>
              showToast(
                "info",
                "Community guidelines would open in a full view"
              )
            }
            style={styles.guidelinesButton}
          >
            View Full Guidelines
          </Button>
        </View>
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  emergencyCard: {
    marginBottom: 24,
    backgroundColor: "#FFF5F5",
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E53E3E",
    marginBottom: 8,
  },
  emergencyText: {
    color: "#4A5568",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  listItem: {
    backgroundColor: "#F7FAFC",
    marginBottom: 8,
    borderRadius: 8,
  },
  divider: {
    marginVertical: 16,
  },
  tipCard: {
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  tipText: {
    color: "#4A5568",
  },
  guidelinesText: {
    marginBottom: 16,
  },
  guidelinesButton: {
    alignSelf: "flex-start",
  },
});
