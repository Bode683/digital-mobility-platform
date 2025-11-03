import React, { useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { Button, TextInput, HelperText } from 'react-native-paper'
import { useAuth } from '@/hooks/useAuth'
import { getUserFriendlyMessage } from '@/api/errors'

/**
 * Auth Component - Refactored to use API Layer
 * 
 * Changes:
 * - Uses useAuth hook instead of direct Supabase calls
 * - TanStack Query mutations handle loading states
 * - Proper error handling with user-friendly messages
 * - Zod validation happens in API layer
 * - Auth state managed by ApiContext
 */
export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signIn, signUp, isSigningIn, isSigningUp, signInError, signUpError } = useAuth()

  async function handleSignIn() {
    try {
      await signIn({ email, password })
      // Navigation is handled automatically by auth state listener in app/_layout.tsx
    } catch (error) {
      const message = getUserFriendlyMessage(error)
      Alert.alert('Sign In Failed', message)
    }
  }

  async function handleSignUp() {
    try {
      await signUp({ email, password })
      Alert.alert(
        'Success',
        'Account created! Please check your email to verify your account.'
      )
    } catch (error) {
      const message = getUserFriendlyMessage(error)
      Alert.alert('Sign Up Failed', message)
    }
  }

  const isLoading = isSigningIn || isSigningUp
  const hasError = signInError || signUpError

  return (
    <View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TextInput
          label="Email"
          mode="outlined"
          left={<TextInput.Icon icon="email" />}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          disabled={isLoading}
          error={!!hasError}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          label="Password"
          mode="outlined"
          left={<TextInput.Icon icon="lock" />}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize="none"
          autoComplete="password"
          disabled={isLoading}
          error={!!hasError}
        />
        <HelperText type="info" visible={true}>
          Password must be at least 6 characters
        </HelperText>
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button 
          mode="contained" 
          disabled={isLoading || !email || !password} 
          onPress={handleSignIn}
          loading={isSigningIn}
        >
          Sign in
        </Button>
      </View>
      <View style={styles.verticallySpaced}>
        <Button 
          mode="outlined" 
          disabled={isLoading || !email || !password} 
          onPress={handleSignUp}
          loading={isSigningUp}
        >
          Sign up
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
})
