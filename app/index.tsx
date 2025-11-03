import { Redirect } from "expo-router";

/**
 * Root index redirect
 *
 * This file redirects from / to /(drawer)/home if authenticated
 * or to /auth if not authenticated
 */
export default function IndexRedirect() {
  // The authentication check is handled in _layout.tsx
  // This just redirects to the drawer navigation
  return <Redirect href="/(drawer)" />;
}
