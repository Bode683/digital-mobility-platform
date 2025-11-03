import { Redirect } from "expo-router";

/**
 * Index redirect
 *
 * This file redirects from /(drawer)/ to /(drawer)/home
 * to ensure we have a consistent entry point
 */
export default function IndexRedirect() {
  return <Redirect href="/(drawer)/home" />;
}
