import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { useMap } from '../contexts/MapContext';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface MapControlsProps {
  style?: ViewStyle;
  showZoomControls?: boolean;
  showCurrentLocationButton?: boolean;
  showLayerSelector?: boolean;
  showCompass?: boolean;
  onCurrentLocationPress?: () => void;
  onLayerPress?: () => void;
  position?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';
  vertical?: boolean;
}

export function MapControls({
  style,
  showZoomControls = true,
  showCurrentLocationButton = true,
  showLayerSelector = false,
  showCompass = false,
  onCurrentLocationPress,
  onLayerPress,
  position = 'topRight',
  vertical = true,
}: MapControlsProps) {
  const theme = useTheme();
  const { state, getCurrentLocation } = useMap();
  const [expanded, setExpanded] = React.useState(false);

  // Get position styles based on the position prop
  const getPositionStyles = () => {
    switch (position) {
      case 'topLeft':
        return { top: 16, left: 16 };
      case 'bottomRight':
        return { bottom: 16, right: 16 };
      case 'bottomLeft':
        return { bottom: 16, left: 16 };
      case 'topRight':
      default:
        return { top: 16, right: 16 };
    }
  };

  // Animation for expansion/collapse
  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(expanded ? 1 : 0.8, { duration: 200 }),
      transform: [
        { scale: withTiming(expanded ? 1 : 0.95, { duration: 200 }) },
      ],
    };
  });

  // Handle current location button press
  const handleCurrentLocationPress = async () => {
    const location = await getCurrentLocation();
    if (location && onCurrentLocationPress) {
      onCurrentLocationPress();
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getPositionStyles(),
        vertical ? styles.vertical : styles.horizontal,
        containerStyle,
        style,
      ]}
    >
      {/* Expand/Collapse Button */}
      <TouchableOpacity
        style={[styles.controlButton, { backgroundColor: theme.colors.surface }]}
        onPress={() => setExpanded(!expanded)}
        accessibilityLabel={expanded ? 'Collapse map controls' : 'Expand map controls'}
        accessibilityRole="button"
      >
        <MaterialIcons
          name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color={theme.colors.primary}
        />
      </TouchableOpacity>

      {/* Control Buttons (only shown when expanded) */}
      {expanded && (
        <View style={vertical ? styles.verticalControls : styles.horizontalControls}>
          {/* Zoom Controls */}
          {showZoomControls && (
            <>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: theme.colors.surface }]}
                accessibilityLabel="Zoom in"
                accessibilityRole="button"
              >
                <MaterialIcons name="add" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: theme.colors.surface }]}
                accessibilityLabel="Zoom out"
                accessibilityRole="button"
              >
                <MaterialIcons name="remove" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </>
          )}

          {/* Current Location Button */}
          {showCurrentLocationButton && (
            <TouchableOpacity
              style={[
                styles.controlButton,
                { backgroundColor: theme.colors.surface },
                state.followsUserLocation && { borderColor: theme.colors.primary, borderWidth: 2 },
              ]}
              onPress={handleCurrentLocationPress}
              accessibilityLabel="Go to current location"
              accessibilityRole="button"
            >
              <MaterialIcons
                name="my-location"
                size={24}
                color={state.followsUserLocation ? theme.colors.primary : theme.colors.text}
              />
            </TouchableOpacity>
          )}

          {/* Layer Selector Button */}
          {showLayerSelector && (
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: theme.colors.surface }]}
              onPress={onLayerPress}
              accessibilityLabel="Change map style"
              accessibilityRole="button"
            >
              <MaterialIcons name="layers" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          )}

          {/* Compass Button */}
          {showCompass && (
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: theme.colors.surface }]}
              accessibilityLabel="Reset map orientation"
              accessibilityRole="button"
            >
              <MaterialIcons name="compass-calibration" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 10,
  },
  vertical: {
    flexDirection: 'column',
  },
  horizontal: {
    flexDirection: 'row',
  },
  verticalControls: {
    marginTop: 8,
  },
  horizontalControls: {
    marginLeft: 8,
    flexDirection: 'row',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
