import { useTheme } from "@/hooks/use-theme";
import React, { useMemo, useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Appbar, useTheme as usePaperTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NotificationModal } from "./NotificationModal";

export type AppBarProps = {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  onMenuPress?: () => void;
  onLogoPress?: () => void;
  actions?: {
    icon: string;
    onPress: () => void;
    accessibilityLabel?: string;
    badge?: number;
  }[];
  showBackButton?: boolean;
  onBackPress?: () => void;
};

/**
 * Enhanced AppBar Component
 *
 * Features:
 * - Logo with theme support
 * - Optional title and subtitle
 * - Customizable actions
 * - Safe area insets for notched devices
 * - Accessibility support
 * - Back button support
 * - Performance optimized with memoization
 */
export const AppBar = React.memo(function AppBar({
  title,
  subtitle,
  showLogo = true,
  onMenuPress,
  onLogoPress,
  actions = [],
  showBackButton = false,
  onBackPress,
}: AppBarProps) {
  const theme = useTheme();
  const paperTheme = usePaperTheme();
  const insets = useSafeAreaInsets();
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  // Memoize logo selection to avoid unnecessary recalculations
  const logo = useMemo(() => {
    try {
      return theme.scheme === "dark"
        ? require("@/assets/images/logo-dark.png")
        : require("@/assets/images/logo-light.png");
    } catch {
      // Fallback if logo doesn't exist
      return null;
    }
  }, [theme.scheme]);

  // Memoize header styles
  const headerStyles = useMemo(
    () => [
      styles.appbar,
      {
        backgroundColor: theme.colors.card,
        paddingTop: Math.max(insets.top, 1),
        paddingBottom: 8,
        paddingHorizontal: 8,
        elevation: 0,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      },
    ],
    [theme.colors.card, theme.colors.border, insets.top]
  );

  return (
    <>
      <Appbar.Header
        style={headerStyles}
        accessibilityLabel="App bar"
        accessibilityRole="header"
      >
        {/* Left: Hamburger Menu */}
        <View style={styles.leftActions}>
          {onMenuPress && (
            <Appbar.Action
              icon="menu"
              onPress={onMenuPress}
              iconColor={theme.colors.text}
              size={24}
              accessibilityLabel="Open menu"
              accessibilityRole="button"
            />
          )}
          {/* Back Button (optional) - Only show if no hamburger menu */}
          {showBackButton && onBackPress && !onMenuPress && (
            <Appbar.BackAction
              onPress={onBackPress}
              color={theme.colors.text}
              accessibilityLabel="Go back"
            />
          )}
        </View>

        {/* Center: Logo or Title */}
        <View style={styles.centerSection}>
          {showLogo && logo ? (
            <TouchableOpacity
              onPress={onLogoPress}
              disabled={!onLogoPress}
              activeOpacity={onLogoPress ? 0.7 : 1}
              accessibilityRole={onLogoPress ? "button" : "image"}
              accessibilityLabel="App logo"
            >
              <Image
                source={logo}
                style={styles.logo}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
            </TouchableOpacity>
          ) : title ? (
            <View style={styles.titleContainer}>
              <Appbar.Content
                title={title}
                subtitle={subtitle}
                titleStyle={[styles.title, { color: theme.colors.text }]}
                subtitleStyle={[
                  styles.subtitle,
                  { color: theme.colors.textMuted },
                ]}
              />
            </View>
          ) : null}
        </View>

        {/* Right: Notification Icon + Custom Actions */}
        <View style={styles.rightActions}>
          {/* Custom Actions */}
          {actions.map((action, index) => (
            <View key={index} style={styles.actionContainer}>
              {action.badge && action.badge > 0 && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: paperTheme.colors.error },
                  ]}
                />
              )}
              <Appbar.Action
                icon={action.icon}
                onPress={action.onPress}
                iconColor={theme.colors.text}
                size={24}
                accessibilityLabel={
                  action.accessibilityLabel || `Action ${index + 1}`
                }
              />
            </View>
          ))}
          {/* Notification Icon */}
          <Appbar.Action
            icon="bell"
            onPress={() => setNotificationsVisible(true)}
            iconColor={theme.colors.text}
            size={24}
            accessibilityLabel="Open notifications"
            accessibilityRole="button"
          />
        </View>
      </Appbar.Header>

      {/* Notification Modal */}
      <NotificationModal
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
      />
    </>
  );
});

const styles = StyleSheet.create({
  appbar: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...Platform.select({
      web: {
        position: "sticky" as any,
        top: 0,
        zIndex: 1000,
      },
    }),
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 48,
    paddingLeft: 4,
  },
  centerSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 8,
  },
  logoContainer: {
    paddingLeft: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 150,
    height: 50,
    maxWidth: "100%",
  },
  titleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    marginTop: -4,
    textAlign: "center",
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: 48,
    paddingRight: 4,
  },
  actionContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 1,
  },
});
