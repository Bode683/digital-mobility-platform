import type { Profile } from "@/api/types";
import { showToast } from "@/components/ToastProvider";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { useCurrentProfile } from "@/hooks/useProfile";
import { buildAvatarUrl } from "@/lib/storage";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Dialog,
  IconButton,
  Menu,
  Avatar as PaperAvatar,
  Portal,
} from "react-native-paper";

// Lazy load ImageManipulator to handle cases where native module isn't available
let ImageManipulator: typeof import("expo-image-manipulator") | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ImageManipulator = require("expo-image-manipulator");
} catch (error) {
  console.warn("expo-image-manipulator not available:", error);
}

interface Props {
  size: number;
  url: string | null | undefined;
  onUpload: (filePath: string) => void;
  editable?: boolean;
}

/**
 * Enhanced Avatar Component
 *
 * Features:
 * - Image compression before upload
 * - Camera or gallery selection
 * - Avatar removal option
 * - Improved UI with overlay actions
 * - Better error handling
 */
export default function Avatar({
  url,
  size = 150,
  onUpload,
  editable = true,
}: Props) {
  const theme = useTheme();
  const {
    profile,
    uploadAvatar,
    deleteAvatar,
    isUploadingAvatar,
    isDeletingAvatar,
  } = useCurrentProfile();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isProcessing = isUploadingAvatar || isDeletingAvatar || isLoading;

  useEffect(() => {
    if (url) {
      downloadImage(url);
    }
  }, [url]);

  async function downloadImage(path: string) {
    try {
      const isAbsolute = /^https?:\/\//i.test(path);
      const publicUrl = isAbsolute ? path : buildAvatarUrl(path, Date.now());
      setAvatarUrl(publicUrl || null);
    } catch (error) {
      console.error("Error downloading avatar:", error);
    }
  }

  async function compressImage(uri: string): Promise<string> {
    try {
      // Get file info to check size
      const fileInfo = await FileSystem.getInfoAsync(uri);

      // If file is already small enough, return original
      if (fileInfo.exists && "size" in fileInfo && fileInfo.size < 500 * 1024) {
        return uri;
      }

      // If ImageManipulator is not available, return original
      if (!ImageManipulator) {
        console.warn("ImageManipulator not available, using original image");
        return uri;
      }

      // Compress the image
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      return manipResult.uri;
    } catch (error) {
      console.error("Error compressing image:", error);
      return uri; // Return original if compression fails
    }
  }

  async function handleImageSelection(useCamera: boolean) {
    try {
      setIsLoading(true);
      setMenuVisible(false);

      // Request permissions
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          showToast("error", "Camera permission is required");
          return;
        }
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          showToast("error", "Media library permission is required");
          return;
        }
      }

      // Launch camera or image picker
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      const uri: string = asset.uri;

      // Compress image before upload
      const compressedUri = await compressImage(uri);

      // Generate filename
      const name: string =
        compressedUri.split("/").pop() || `${Date.now()}.jpg`;
      const fileExt = name.includes(".") ? name.split(".").pop() : "jpg";
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${fileExt}`;

      // Convert to binary
      const response = await fetch(compressedUri);
      const arrayBuffer = await response.arrayBuffer();
      const mimeType: string = (asset as any).mimeType || "image/jpeg";

      // Upload avatar
      const filePath = await uploadAvatar({
        file: arrayBuffer,
        fileName,
        contentType: mimeType,
      });

      // Notify parent component
      onUpload(filePath);
      showToast("success", "Avatar updated successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      if (error instanceof Error) {
        showToast("error", "Upload failed", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRemoveAvatar() {
    try {
      setConfirmDialogVisible(false);

      // Extract filename from profile avatar_url if available
      // The profile's avatar_url should contain the storage path (e.g., "user-id/filename.jpg")
      const typedProfile = profile as Profile | undefined;
      if (typedProfile?.avatar_url) {
        // Handle both full URLs and paths
        const avatarPath = typedProfile.avatar_url;
        // Extract filename - could be a full URL or just a path
        let fileName = avatarPath;

        // If it's a full URL, extract the path portion after "/avatars/"
        if (avatarPath.includes("/avatars/")) {
          const pathMatch = avatarPath.match(/\/avatars\/(.+)$/);
          if (pathMatch && pathMatch[1]) {
            // Extract just the filename from the path (user-id/filename.jpg -> filename.jpg)
            fileName = pathMatch[1].split("/").pop() || pathMatch[1];
          }
        } else {
          // If it's already a path, extract just the filename
          fileName = avatarPath.split("/").pop() || avatarPath;
        }

        await deleteAvatar(fileName);
      }

      onUpload("");
      setAvatarUrl(null);
      showToast("success", "Avatar removed successfully");
    } catch (error) {
      console.error("Error removing avatar:", error);
      if (error instanceof Error) {
        showToast("error", "Failed to remove avatar", error.message);
      }
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => editable && setMenuVisible(true)}
        disabled={isProcessing || !editable}
        style={[styles.avatarWrapper, { opacity: isProcessing ? 0.7 : 1 }]}
      >
        {avatarUrl ? (
          <PaperAvatar.Image
            size={size}
            source={{ uri: avatarUrl }}
            style={styles.paperAvatar}
          />
        ) : (
          <PaperAvatar.Icon
            size={size}
            icon="account-circle"
            style={{
              backgroundColor: theme.colors.muted,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
            color={theme.colors.textMuted}
          />
        )}

        {editable && (
          <View style={styles.editOverlay}>
            <IconButton
              icon="camera"
              size={24}
              iconColor="#ffffff"
              style={styles.editIcon}
            />
          </View>
        )}

        {isProcessing && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size={size / 3} color={theme.colors.primary} />
          </View>
        )}
      </TouchableOpacity>

      {/* Avatar Actions Menu */}
      {editable && (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={{ x: 0, y: 0 }} // Position will be adjusted by style
          style={styles.menu}
          contentStyle={styles.menuContent}
        >
          <Menu.Item
            leadingIcon="camera"
            onPress={() => handleImageSelection(true)}
            title="Take Photo"
            disabled={isProcessing}
          />
          <Menu.Item
            leadingIcon="image"
            onPress={() => handleImageSelection(false)}
            title="Choose from Gallery"
            disabled={isProcessing}
          />
          {avatarUrl && (
            <Menu.Item
              leadingIcon="delete"
              onPress={() => {
                setMenuVisible(false);
                setConfirmDialogVisible(true);
              }}
              title="Remove Avatar"
              disabled={isProcessing}
            />
          )}
        </Menu>
      )}

      {/* Confirmation Dialog for Avatar Removal */}
      <Portal>
        <Dialog
          visible={confirmDialogVisible}
          onDismiss={() => setConfirmDialogVisible(false)}
        >
          <Dialog.Title>Remove Avatar?</Dialog.Title>
          <Dialog.Content>
            <ThemedText>
              Are you sure you want to remove your profile picture?
            </ThemedText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDialogVisible(false)}>
              Cancel
            </Button>
            <Button onPress={handleRemoveAvatar}>Remove</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    position: "relative",
  },
  avatarWrapper: {
    marginBottom: 12,
    position: "relative",
    borderRadius: 999,
    overflow: "hidden",
  },
  paperAvatar: {
    overflow: "hidden",
  },
  editOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    height: "30%",
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    margin: 0,
    padding: 0,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  menu: {
    position: "absolute",
    top: 20, // Adjust as needed
    left: 20, // Adjust as needed
  },
  menuContent: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});
