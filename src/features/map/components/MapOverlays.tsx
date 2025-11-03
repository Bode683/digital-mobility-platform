import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type OverlayPosition = 'top' | 'bottom' | 'left' | 'right' | 'center' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

interface OverlayProps {
  position: OverlayPosition;
  children: ReactNode;
  style?: ViewStyle;
  useSafeArea?: boolean;
}

interface MapOverlaysProps {
  children: ReactNode | ReactNode[];
  style?: ViewStyle;
}

// Individual overlay component
export function Overlay({ position, children, style, useSafeArea = true }: OverlayProps) {
  const getPositionStyle = (): ViewStyle => {
    switch (position) {
      case 'top':
        return { top: 0, left: 0, right: 0, alignItems: 'center' };
      case 'bottom':
        return { bottom: 0, left: 0, right: 0, alignItems: 'center' };
      case 'left':
        return { left: 0, top: 0, bottom: 0, justifyContent: 'center' };
      case 'right':
        return { right: 0, top: 0, bottom: 0, justifyContent: 'center' };
      case 'center':
        return { alignItems: 'center', justifyContent: 'center' };
      case 'topLeft':
        return { top: 0, left: 0 };
      case 'topRight':
        return { top: 0, right: 0 };
      case 'bottomLeft':
        return { bottom: 0, left: 0 };
      case 'bottomRight':
        return { bottom: 0, right: 0 };
      default:
        return {};
    }
  };

  const Container = useSafeArea ? SafeAreaView : View;

  return (
    <Container
      style={[
        styles.overlay,
        getPositionStyle(),
        style,
      ]}
      edges={['top', 'bottom', 'left', 'right']}
    >
      {children}
    </Container>
  );
}

// Main component that wraps all overlays
export function MapOverlays({ children, style }: MapOverlaysProps) {
  return (
    <View style={[styles.container, style]} pointerEvents="box-none">
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },
  overlay: {
    position: 'absolute',
    padding: 16,
    pointerEvents: 'box-none',
  },
});
