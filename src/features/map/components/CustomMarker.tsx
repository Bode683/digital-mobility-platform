import React from 'react';
import { View, StyleSheet, ViewStyle, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

export type MarkerType = 'pickup' | 'dropoff' | 'driver' | 'selected' | 'poi' | 'destination';

interface CustomMarkerProps {
  type: MarkerType;
  style?: ViewStyle;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  onPress?: () => void;
}

export function CustomMarker({ 
  type, 
  style, 
  animate = false,
  title,
  subtitle,
  onPress
}: CustomMarkerProps) {
  const theme = useTheme();

  const getMarkerColor = () => {
    switch (type) {
      case 'pickup':
        return theme.colors.primary;
      case 'dropoff':
        return theme.colors.secondary;
      case 'driver':
        return theme.colors.primary;
      case 'selected':
        return theme.colors.accent;
      case 'poi':
        return theme.colors.warning;
      case 'destination':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const getMarkerIcon = () => {
    switch (type) {
      case 'pickup':
        return 'my-location';
      case 'dropoff':
        return 'location-on';
      case 'driver':
        return 'directions-car';
      case 'selected':
        return 'place';
      case 'poi':
        return 'local-see';
      case 'destination':
        return 'flag';
      default:
        return 'place';
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    if (!animate) return {};

    return {
      transform: [
        {
          scale: withRepeat(
            withDelay(
              300,
              withSequence(
                withSpring(1.2, { damping: 10 }),
                withSpring(1, { damping: 10 })
              )
            ),
            -1,
            true
          ),
        },
      ],
    };
  });

  const MarkerComponent = onPress ? TouchableOpacity : View;

  return (
    <View style={[styles.markerContainer, style]}>
      <MarkerComponent 
        onPress={onPress}
        style={styles.markerTouchable}
        accessibilityRole="button"
        accessibilityLabel={title || `${type} marker`}
      >
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: getMarkerColor(),
            },
            animatedStyle,
          ]}
        >
          <MaterialIcons
            name={getMarkerIcon()}
            size={20}
            color={theme.colors.background}
          />
          <View
            style={[
              styles.shadow,
              {
                backgroundColor: getMarkerColor(),
              },
            ]}
          />
        </Animated.View>
      </MarkerComponent>

      {/* Title and subtitle */}
      {(title || subtitle) && (
        <View style={[styles.labelContainer, { backgroundColor: theme.colors.surface }]}>
          {title && (
            <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]} numberOfLines={2}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  markerTouchable: {
    alignItems: 'center',
  },
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shadow: {
    position: 'absolute',
    bottom: -8,
    width: 8,
    height: 8,
    borderRadius: 4,
    transform: [{ rotateZ: '45deg' }],
  },
  labelContainer: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    maxWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
});