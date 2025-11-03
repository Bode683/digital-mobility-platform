import { authApi } from "@/api/auth.api";
import { ONBOARDING_KEY } from "@/lib/constants";
import { getSupabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

// Keep the native splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function SplashScreenComponent() {
  const router = useRouter();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const rotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const backgroundOpacity = useSharedValue(0);

  useEffect(() => {
    async function prepare() {
      try {
        // Start background fade in
        backgroundOpacity.value = withTiming(1, {
          duration: 600,
          easing: Easing.out(Easing.ease),
        });

        // Start logo animations
        opacity.value = withTiming(1, {
          duration: 1000,
          easing: Easing.out(Easing.exp),
        });

        scale.value = withSpring(1, {
          damping: 10,
          stiffness: 100,
          mass: 0.8,
        });

        // Add subtle rotation
        rotation.value = withSequence(
          withTiming(5, { duration: 400, easing: Easing.out(Easing.ease) }),
          withTiming(-5, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 400, easing: Easing.in(Easing.ease) })
        );

        // Pulse animation
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.05, {
              duration: 800,
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );

        // Check onboarding and auth status
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Minimum splash time

        const [onboardingCompleted, session] = await Promise.all([
          AsyncStorage.getItem(ONBOARDING_KEY),
          authApi.getSession(getSupabase()),
        ]);

        // Fade out animation
        opacity.value = withTiming(0, { duration: 400 });
        scale.value = withTiming(0.8, { duration: 400 });

        await new Promise((resolve) => setTimeout(resolve, 400));

        // Hide native splash
        await SplashScreen.hideAsync();

        // Navigate based on state
        if (!onboardingCompleted) {
          router.replace("/onboarding");
        } else if (session) {
          router.replace("/(drawer)/home");
        } else {
          router.replace("/auth");
        }
      } catch (error) {
        console.error("Splash screen error:", error);
        await SplashScreen.hideAsync();
        router.replace("/auth");
      }
    }

    prepare();
  }, [backgroundOpacity, opacity, pulseScale, rotation, router, scale]);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value * pulseScale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const animatedBackgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "#E6F4FE" },
          animatedBackgroundStyle,
        ]}
      />
      <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
        <Image
          source={require("@/assets/images/splash-icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  logoContainer: {
    width: width * 0.5,
    height: width * 0.5,
    maxWidth: 300,
    maxHeight: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
});
