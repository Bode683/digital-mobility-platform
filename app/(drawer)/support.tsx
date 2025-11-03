import { ThemedText } from "@/components/themed-text";
import { showToast } from "@/components/ToastProvider";

import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Divider,
  List,
  Surface,
  TextInput,
} from "react-native-paper";

/**
 * Support Screen
 *
 * Provides user support options including FAQ, contact form, and emergency support
 */
export default function SupportScreen() {

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!subject || !message) {
      showToast("error", "Please fill out all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showToast("success", "Your message has been sent");
      setSubject("");
      setMessage("");
    } catch {
      showToast("error", "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const faqItems = [
    {
      id: "faq1",
      question: "How do I request a ride?",
      answer:
        'Open the app, set your pickup location and destination, choose your ride type, and tap "Request Ride".',
    },
    {
      id: "faq2",
      question: "How do I add a payment method?",
      answer:
        'Go to Payment Methods in the menu, tap "Add Payment Method", and enter your card details or connect your preferred payment service.',
    },
    {
      id: "faq3",
      question: "Can I schedule a ride in advance?",
      answer:
        'Yes, you can schedule rides up to 7 days in advance. When setting up your ride, select "Schedule" instead of "Request Now".',
    },
    {
      id: "faq4",
      question: "How do I report an issue with my ride?",
      answer:
        'Go to your Ride History, select the specific ride, and tap "Report an Issue". You can also contact support directly through this screen.',
    },
    {
      id: "faq5",
      question: "How do I change my default payment method?",
      answer:
        'Go to Payment Methods, find the payment method you want to set as default, and tap "Set as Default".',
    },
  ];

  return (
    <Surface style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.headerContainer}>
          <ThemedText style={styles.title}>Support</ThemedText>
        </View>

        {/* Emergency Support Card */}
        <Card style={styles.emergencyCard}>
          <Card.Content>
            <ThemedText style={styles.emergencyTitle}>
              Need urgent help?
            </ThemedText>
            <ThemedText style={styles.emergencyText}>
              For emergencies during a ride, use the Emergency button in the
              ride screen.
            </ThemedText>
          </Card.Content>
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() =>
                showToast(
                  "info",
                  "Emergency services would be contacted in a real app"
                )
              }
            >
              Emergency Help
            </Button>
          </Card.Actions>
        </Card>

        {/* FAQ Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Frequently Asked Questions
          </ThemedText>

          {faqItems.map((item) => (
            <List.Accordion
              key={item.id}
              title={item.question}
              expanded={expandedFaq === item.id}
              onPress={() => toggleFaq(item.id)}
              style={styles.faqItem}
            >
              <List.Item
                title=""
                description={item.answer}
                descriptionNumberOfLines={0}
                descriptionStyle={styles.faqAnswer}
              />
            </List.Accordion>
          ))}
        </View>

        <Divider style={styles.divider} />

        {/* Contact Form */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Contact Support</ThemedText>

          <TextInput
            label="Subject"
            value={subject}
            onChangeText={setSubject}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Message"
            value={message}
            onChangeText={setMessage}
            mode="outlined"
            multiline
            numberOfLines={5}
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting || !subject || !message}
            style={styles.submitButton}
          >
            Send Message
          </Button>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Contact Information
          </ThemedText>

          <List.Item
            title="Email"
            description="support@mobility-app.com"
            left={(props) => <List.Icon {...props} icon="email" />}
          />

          <List.Item
            title="Phone"
            description="+1 (555) 123-4567"
            left={(props) => <List.Icon {...props} icon="phone" />}
          />

          <List.Item
            title="Hours"
            description="24/7 Support"
            left={(props) => <List.Icon {...props} icon="clock" />}
          />
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
  faqItem: {
    backgroundColor: "#F7FAFC",
    marginBottom: 8,
    borderRadius: 8,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  input: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
});
