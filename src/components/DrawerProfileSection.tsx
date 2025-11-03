import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import Avatar from "@/features/profile/components/Avatar";
import { useTheme } from "@/hooks/use-theme";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface DrawerProfileSectionProps {
  userPhone?: string;
  userEmail?: string;
  userAvatarUrl?: string;
  onClose?: () => void;
}

export function DrawerProfileSection({
  userPhone,
  userEmail,
  userAvatarUrl,
  onClose,
}: DrawerProfileSectionProps) {
  const theme = useTheme();
  const router = useRouter();

  // Log props for debugging
  React.useEffect(() => {
    console.log("[DrawerProfileSection] Props received:", {
      userPhone,
      userEmail,
      userAvatarUrl,
    });
  }, [userPhone, userEmail, userAvatarUrl]);

  const handleProfilePress = () => {
    onClose?.();
    setTimeout(() => {
      router.push("/(drawer)/profile");
    }, 300);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.xl,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
      ]}
      onPress={handleProfilePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <Avatar
            size={80}
            url={userAvatarUrl}
            onUpload={() => {}}
            editable={false}
          />
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.phoneContainer}>
            <ThemedText
              style={[
                styles.phoneText,
                {
                  color: theme.colors.text,
                },
              ]}
            >
              {userPhone || userEmail || "Guest User"}
            </ThemedText>
            {(userPhone || userEmail) && (
              <IconSymbol
                name="checkmark.circle.fill"
                size={18}
                color={theme.colors.success}
                style={styles.verifiedIcon}
              />
            )}
          </View>
          {userPhone && userEmail && (
            <ThemedText
              style={[
                styles.emailText,
                {
                  color: theme.colors.textMuted,
                },
              ]}
            >
              {userEmail}
            </ThemedText>
          )}
          {!userPhone && !userEmail && (
            <ThemedText
              style={[
                styles.emailText,
                {
                  color: theme.colors.textMuted,
                },
              ]}
            >
              Tap to view profile
            </ThemedText>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    // Border will be added via theme colors
  },
  content: {
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  infoContainer: {
    alignItems: "center",
    width: "100%",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  phoneText: {
    fontSize: 18,
    fontWeight: "600",
  },
  verifiedIcon: {
    marginLeft: 6,
  },
  emailText: {
    fontSize: 14,
  },
});
