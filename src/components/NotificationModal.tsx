import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Surface } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type?: "info" | "success" | "warning" | "error";
}

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  notifications?: Notification[];
}

/**
 * Placeholder Notification Modal Component
 *
 * Displays a list of notifications with a clean UI
 */
export function NotificationModal({
  visible,
  onClose,
  notifications = [],
}: NotificationModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = Dimensions.get("window");
  const modalMaxHeight = useMemo(() => screenHeight * 0.85, [screenHeight]);
  const [contentHeight, setContentHeight] = useState<number>(0);

  // Mock notifications if none provided
  const mockNotifications: Notification[] = notifications.length
    ? notifications
    : [
        {
          id: "1",
          title: "Welcome!",
          message: "Thanks for using Mobility. Book your first ride today!",
          timestamp: new Date(),
          read: false,
          type: "info",
        },
        {
          id: "2",
          title: "Ride Completed",
          message: "Your ride has been completed successfully.",
          timestamp: new Date(Date.now() - 3600000),
          read: false,
          type: "success",
        },
      ];

  // Reset content height when modal opens or notifications change
  useEffect(() => {
    if (visible) {
      setContentHeight(0);
    }
  }, [visible, mockNotifications.length]);

  // Calculate min height (for empty state)
  const minHeight = useMemo(() => {
    const headerHeight = 73; // Header padding (32) + border (1) + approximate content (40)
    const safeAreaBottom = insets.bottom;
    const emptyStateHeight = 150;
    return headerHeight + emptyStateHeight + safeAreaBottom;
  }, [insets.bottom]);

  // Calculate modal height based on measured content
  const modalHeight = useMemo(() => {
    const headerHeight = 73;
    const safeAreaBottom = insets.bottom;

    // Use measured content height, fallback to minHeight if not measured yet
    const actualContentHeight =
      contentHeight > 0
        ? contentHeight
        : minHeight - headerHeight - safeAreaBottom;
    const totalHeight = headerHeight + actualContentHeight + safeAreaBottom;

    // Clamp between minHeight and modalMaxHeight
    return Math.max(minHeight, Math.min(totalHeight, modalMaxHeight));
  }, [contentHeight, minHeight, modalMaxHeight, insets.bottom]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case "success":
        return "check-circle";
      case "warning":
        return "warning";
      case "error":
        return "error";
      default:
        return "info";
    }
  };

  const getNotificationColor = (type?: string) => {
    switch (type) {
      case "success":
        return theme.colors.success || "#4CAF50";
      case "warning":
        return theme.colors.warning || "#FF9800";
      case "error":
        return theme.colors.error || "#F44336";
      default:
        return theme.colors.primary;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Surface
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.background,
              maxHeight: modalMaxHeight,
              minHeight: minHeight,
              height: modalHeight,
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: theme.colors.card,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <ThemedText style={styles.headerTitle}>Notifications</ThemedText>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel="Close notifications"
            >
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Notifications List */}
          <View style={styles.scrollContainer}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              onContentSizeChange={(width, height) => {
                setContentHeight(height);
              }}
            >
              {mockNotifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <MaterialIcons
                    name="notifications-none"
                    size={48}
                    color={theme.colors.textMuted}
                  />
                  <ThemedText
                    style={[
                      styles.emptyText,
                      { color: theme.colors.textMuted },
                    ]}
                  >
                    No notifications
                  </ThemedText>
                </View>
              ) : (
                mockNotifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationItem,
                      {
                        backgroundColor: notification.read
                          ? theme.colors.surface
                          : theme.colors.card,
                        borderBottomColor: theme.colors.border,
                      },
                    ]}
                  >
                    <View style={styles.notificationContent}>
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor:
                              getNotificationColor(notification.type) + "20",
                          },
                        ]}
                      >
                        <MaterialIcons
                          name={getNotificationIcon(notification.type) as any}
                          size={24}
                          color={getNotificationColor(notification.type)}
                        />
                      </View>
                      <View style={styles.textContainer}>
                        <ThemedText style={styles.notificationTitle}>
                          {notification.title}
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.notificationMessage,
                            { color: theme.colors.textMuted },
                          ]}
                        >
                          {notification.message}
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.timestamp,
                            { color: theme.colors.textMuted },
                          ]}
                        >
                          {formatTime(notification.timestamp)}
                        </ThemedText>
                      </View>
                      {!notification.read && (
                        <View
                          style={[
                            styles.unreadDot,
                            { backgroundColor: theme.colors.primary },
                          ]}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
          <View style={{ height: insets.bottom }} />
        </Surface>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: "100%",
    zIndex: 1000,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
    minHeight: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    padding: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 4,
  },
});
