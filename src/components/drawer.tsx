import { DrawerMenuItem } from "@/components/DrawerMenuItem";
import { DrawerProfileSection } from "@/components/DrawerProfileSection";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DRAWER_WIDTH = Dimensions.get("window").width;

export type DrawerProps = {
  visible: boolean;
  onClose: () => void;
  userEmail?: string;
  userPhone?: string;
  userAvatarUrl?: string;
};

export function Drawer({
  visible,
  onClose,
  userEmail,
  userPhone,
  userAvatarUrl,
}: DrawerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();
  const translateX = useSharedValue(-DRAWER_WIDTH);

  useEffect(() => {
    if (visible) {
      translateX.value = withTiming(0, { duration: 300 });
    } else {
      translateX.value = withTiming(-DRAWER_WIDTH, { duration: 300 });
    }
  }, [visible, translateX]);

  // Simple swipe gesture handler for left drawer
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const newTranslateX = event.translationX;
      if (newTranslateX <= 0) {
        translateX.value = newTranslateX;
      }
    })
    .onEnd((event) => {
      const shouldClose = event.translationX < -100 || event.velocityX < -500;
      if (shouldClose) {
        translateX.value = withTiming(-DRAWER_WIDTH, { duration: 300 });
        runOnJS(onClose)();
      } else {
        translateX.value = withTiming(0, { duration: 300 });
      }
    });

  const drawerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleNavigation = (route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 300);
  };

  const handleSignOut = () => {
    onClose();
    setTimeout(async () => {
      try {
        await signOut();
      } catch (error) {
        console.error("Sign out error:", error);
      }
    }, 300);
  };

  if (!visible && Platform.OS !== "web") {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Drawer with Swipe Gesture */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.drawer,
            {
              width: DRAWER_WIDTH,
              backgroundColor: theme.colors.background,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
            drawerAnimatedStyle,
          ]}
        >
          {/* Close Button - Left Side */}
          <View
            style={[
              styles.closeButtonContainer,
              {
                paddingHorizontal: theme.spacing.lg,
                paddingTop: theme.spacing.md,
              },
            ]}
          >
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel="Close menu"
            >
              <IconSymbol
                name="arrow.left"
                size={24}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Profile Section */}
            <DrawerProfileSection
              userPhone={userPhone}
              userEmail={userEmail}
              userAvatarUrl={userAvatarUrl}
              onClose={onClose}
            />

            {/* Menu Items - Top Section */}
            <View style={[styles.menuSection, { marginTop: theme.spacing.md }]}>
              <DrawerMenuItem
                icon="creditcard"
                title="Payment methods"
                subtitle="Orange Money"
                onPress={() => handleNavigation("/(drawer)/payment-methods")}
              />
              {/* TODO: Create discounts route file before enabling this */}
              {/* <DrawerMenuItem
                icon="tag"
                title="Discounts and gifts"
                subtitle="Enter promo code"
                onPress={() => handleNavigation("/(drawer)/discounts")}
              /> */}
            </View>

            {/* Menu Items - Middle Section */}
            <View style={[styles.menuSection, { marginTop: theme.spacing.sm }]}>
              <DrawerMenuItem
                icon="clock"
                title="History"
                onPress={() => handleNavigation("/(drawer)/history")}
              />
              <DrawerMenuItem
                icon="mappin"
                title="My addresses"
                onPress={() => handleNavigation("/(drawer)/addresses")}
              />
              <DrawerMenuItem
                icon="headphones"
                title="Support"
                onPress={() => handleNavigation("/(drawer)/support")}
              />
            </View>

            {/* Highlighted Driver Section */}
            {/* TODO: Create driver route file before enabling this */}
            {/* <View style={[styles.menuSection, { marginTop: theme.spacing.sm }]}>
              <DrawerMenuItem
                icon="car"
                title="Earn as a driver"
                variant="highlighted"
                onPress={() => handleNavigation("/(drawer)/driver")}
              />
            </View> */}

            {/* Menu Items - Bottom Section */}
            <View style={[styles.menuSection, { marginTop: theme.spacing.sm }]}>
              <DrawerMenuItem
                icon="shield"
                title="Safety"
                onPress={() => handleNavigation("/(drawer)/safety")}
              />
              <DrawerMenuItem
                icon="gearshape"
                title="Settings"
                onPress={() => handleNavigation("/(drawer)/settings")}
              />
              <DrawerMenuItem
                icon="info.circle"
                title="Information"
                onPress={() => handleNavigation("/(drawer)/information")}
              />
            </View>

            {/* Sign Out */}
            <View
              style={[
                styles.signOutSection,
                {
                  marginTop: theme.spacing.xl,
                  marginBottom: theme.spacing.xl,
                  paddingHorizontal: theme.spacing.lg,
                  paddingBottom: theme.spacing.sm,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.signOutButton,
                  {
                    paddingVertical: theme.spacing.md,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border,
                  },
                ]}
                onPress={handleSignOut}
              >
                <IconSymbol
                  name="rectangle.portrait.and.arrow.right"
                  size={24}
                  color={theme.colors.error}
                />
                <View style={styles.signOutTextContainer}>
                  <ThemedText
                    style={[styles.signOutText, { color: theme.colors.error }]}
                  >
                    Sign Out
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </GestureDetector>
    </Modal>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 2000,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 12,
  },
  closeButtonContainer: {
    alignItems: "flex-start",
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  menuSection: {
    gap: 0,
  },
  signOutSection: {
    // Sign out section styling
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  signOutTextContainer: {
    marginLeft: 12,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
