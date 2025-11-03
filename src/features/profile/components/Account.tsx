import { showToast } from "@/components/ToastProvider";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentProfile } from "@/hooks/useProfile";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Divider, TextInput, List, Switch, SegmentedButtons } from "react-native-paper";
import Avatar from "./Avatar";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";

export default function Account() {
  const theme = useTheme()
  const { user } = useAuth()
  const { profile, isLoading, updateProfile, isUpdating } = useCurrentProfile()
  const { signOut } = useAuth()
  
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>('system')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  // Sync profile data to local state when loaded
  useEffect(() => {
    if (profile && typeof profile === 'object' && 'username' in profile) {
      setUsername((profile as any).username || '')
      setFullName((profile as any).full_name || '')
      setPhone((profile as any).phone || '')
      setAvatarUrl((profile as any).avatar_url || '')
    }
  }, [profile, isLoading])

  async function handleUpdateProfile() {
    try {
      await updateProfile({
        username,
        full_name: fullName,
        phone,
        avatar_url: avatarUrl,
      })
      showToast('success', 'Profile updated successfully!')
    } catch (error) {
      if (error instanceof Error) {
        showToast('error', 'Profile Update Failed', error.message)
      }
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
    } catch (error) {
      if (error instanceof Error) {
        showToast('error', 'Sign Out Failed', error.message)
      }
    }
  }

  return (
    <Card mode="elevated" style={{ borderRadius: theme.radii.lg }}>
      <Card.Content>
        <View style={{ alignItems: 'center', marginTop: theme.spacing.md }}>
          <Avatar
            size={160}
            url={avatarUrl}
            onUpload={(url: string) => {
              // Preview only; actual DB update happens when Save is clicked
              setAvatarUrl(url)
            }}
          />
        </View>

        <View style={{ height: theme.spacing.lg }} />

        <View style={styles.field}>
          <TextInput
            label="Email"
            value={user?.email}
            disabled
            mode="outlined"
            left={<TextInput.Icon icon="email" />}
          />
        </View>
        <View style={styles.field}>
          <TextInput
            label="Username"
            value={username}
            onChangeText={(text) => setUsername(text)}
            mode="outlined"
            left={<TextInput.Icon icon="account" />}
          />
        </View>
        <View style={styles.field}>
          <TextInput
            label="Full name"
            value={fullName}
            onChangeText={(text) => setFullName(text)}
            mode="outlined"
            left={<TextInput.Icon icon="account" />}
          />
        </View>
        <View style={styles.field}>
          <TextInput
            label="Phone"
            value={phone}
            onChangeText={(text) => setPhone(text)}
            keyboardType="phone-pad"
            mode="outlined"
            left={<TextInput.Icon icon="phone" />}
          />
        </View>

        <Divider style={{ marginVertical: theme.spacing.lg, backgroundColor: theme.colors.border }} />
        
        {/* User Preferences */}
        <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>
        
        <List.Item
          title="Theme"
          description="Choose your preferred app theme"
          left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
        />
        <SegmentedButtons
          value={themePreference}
          onValueChange={(value) => setThemePreference(value as 'light' | 'dark' | 'system')}
          buttons={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' },
          ]}
          style={styles.segmentedButtons}
        />
        
        <List.Item
          title="Notifications"
          description="Enable push notifications"
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          )}
        />
        
        <List.Item
          title="Saved Addresses"
          description="Manage your saved locations"
          left={(props) => <List.Icon {...props} icon="map-marker" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('/(drawer)/addresses')}
          style={styles.listItem}
        />
        
        <Divider style={{ marginVertical: theme.spacing.lg, backgroundColor: theme.colors.border }} />

        <View style={{ gap: theme.spacing.sm }}>
          <Button
            mode="contained"
            icon="content-save"
            onPress={handleUpdateProfile}
            loading={isUpdating}
            disabled={isUpdating || isLoading}
          >
            Save changes
          </Button>
          <Button mode="outlined" icon="logout" onPress={handleSignOut}>
            Sign out
          </Button>
        </View>
      </Card.Content>
    </Card>
  )
}
const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  field: {
    paddingVertical: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  listItem: {
    paddingVertical: 8,
  },
})
