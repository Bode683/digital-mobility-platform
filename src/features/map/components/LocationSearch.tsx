import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Keyboard,
  Animated,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { useMap, MapLocation } from '../contexts/MapContext';
import { SearchSuggestions } from './SearchSuggestions';
import { useLocationSearch } from '../hooks/useLocationSearch';

interface LocationSearchProps {
  onPickupSelect?: (location: MapLocation) => void;
  onDropoffSelect?: (location: MapLocation) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: ViewStyle;
  initialPickup?: string;
  initialDropoff?: string;
  showCurrentLocationButton?: boolean;
  showMapSelectionButton?: boolean;
  onMapSelectionPress?: (type: 'pickup' | 'dropoff') => void;
  autoFocusPickup?: boolean;
  autoFocusDropoff?: boolean;
}

export function LocationSearch({
  onPickupSelect,
  onDropoffSelect,
  onFocus,
  onBlur,
  style,
  initialPickup = '',
  initialDropoff = '',
  showCurrentLocationButton = true,
  showMapSelectionButton = true,
  onMapSelectionPress,
  autoFocusPickup = false,
  autoFocusDropoff = false,
}: LocationSearchProps) {
  const theme = useTheme();
  const { getCurrentLocation } = useMap();
  
  // Refs for inputs
  const pickupInputRef = useRef<TextInput>(null);
  const dropoffInputRef = useRef<TextInput>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  
  // Local state
  const [activeInput, setActiveInput] = useState<'pickup' | 'dropoff' | null>(
    autoFocusPickup ? 'pickup' : autoFocusDropoff ? 'dropoff' : null
  );
  
  // Use the location search hook
  const {
    pickupQuery,
    dropoffQuery,
    suggestions,
    isSearching,
    setPickupQuery,
    setDropoffQuery,
    handleSuggestionSelect,
  } = useLocationSearch({
    initialPickup,
    initialDropoff,
    onPickupSelect: (location) => {
      if (onPickupSelect) onPickupSelect(location);
      setActiveInput('dropoff');
      setTimeout(() => dropoffInputRef.current?.focus(), 100);
    },
    onDropoffSelect: (location) => {
      if (onDropoffSelect) onDropoffSelect(location);
      setActiveInput(null);
      Keyboard.dismiss();
    },
  });

  // Auto-focus logic
  useEffect(() => {
    if (autoFocusPickup) {
      setTimeout(() => pickupInputRef.current?.focus(), 100);
    } else if (autoFocusDropoff) {
      setTimeout(() => dropoffInputRef.current?.focus(), 100);
    }
  }, [autoFocusPickup, autoFocusDropoff]);

  // Animation for focus/blur
  useEffect(() => {
    if (activeInput) {
      onFocus?.();
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0.98,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -10,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      onBlur?.();
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [activeInput, fadeAnim, translateY, onFocus, onBlur]);

  // Handle input focus
  const handleInputFocus = (inputType: 'pickup' | 'dropoff') => {
    setActiveInput(inputType);
  };

  // Handle input blur
  const handleInputBlur = () => {
    // Delay to allow suggestion selection
    setTimeout(() => {
      setActiveInput(null);
    }, 150);
  };

  // Handle current location button press
  const handleCurrentLocationPress = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setPickupQuery(location.address || 'Current Location');
      if (onPickupSelect) onPickupSelect(location);
      
      // Auto-focus dropoff after selecting current location
      setActiveInput('dropoff');
      setTimeout(() => dropoffInputRef.current?.focus(), 100);
    }
  };

  // Handle map selection button press
  const handleMapSelectionPress = (type: 'pickup' | 'dropoff') => {
    if (onMapSelectionPress) {
      onMapSelectionPress(type);
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
        style,
      ]}
    >
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {/* Pickup Input */}
        <View
          style={[
            styles.inputContainer,
            { borderBottomColor: theme.colors.border },
          ]}
        >
          <MaterialIcons
            name="my-location"
            size={24}
            color={activeInput === 'pickup' ? theme.colors.primary : theme.colors.textMuted}
          />
          <TextInput
            ref={pickupInputRef}
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Pickup location"
            placeholderTextColor={theme.colors.textMuted}
            value={pickupQuery}
            onChangeText={setPickupQuery}
            onFocus={() => handleInputFocus('pickup')}
            onBlur={handleInputBlur}
            accessibilityLabel="Pickup location input"
            accessibilityHint="Enter your pickup location"
          />
          {isSearching && activeInput === 'pickup' ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            pickupQuery && activeInput === 'pickup' && (
              <TouchableOpacity
                onPress={() => setPickupQuery('')}
                accessibilityLabel="Clear pickup location"
                accessibilityRole="button"
              >
                <MaterialIcons name="close" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )
          )}

          {showMapSelectionButton && (
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => handleMapSelectionPress('pickup')}
              accessibilityLabel="Select pickup location on map"
              accessibilityRole="button"
            >
              <MaterialIcons name="map" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Dropoff Input */}
        <View style={styles.inputContainer}>
          <MaterialIcons
            name="location-on"
            size={24}
            color={activeInput === 'dropoff' ? theme.colors.primary : theme.colors.textMuted}
          />
          <TextInput
            ref={dropoffInputRef}
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Where to?"
            placeholderTextColor={theme.colors.textMuted}
            value={dropoffQuery}
            onChangeText={setDropoffQuery}
            onFocus={() => handleInputFocus('dropoff')}
            onBlur={handleInputBlur}
            accessibilityLabel="Dropoff location input"
            accessibilityHint="Enter your destination"
          />
          {isSearching && activeInput === 'dropoff' ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            dropoffQuery && activeInput === 'dropoff' && (
              <TouchableOpacity
                onPress={() => setDropoffQuery('')}
                accessibilityLabel="Clear dropoff location"
                accessibilityRole="button"
              >
                <MaterialIcons name="close" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )
          )}

          {showMapSelectionButton && (
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => handleMapSelectionPress('dropoff')}
              accessibilityLabel="Select dropoff location on map"
              accessibilityRole="button"
            >
              <MaterialIcons name="map" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Suggestions */}
      {activeInput && (
        <View style={styles.suggestionsWrapper}>
          <SearchSuggestions
            suggestions={suggestions}
            isLoading={isSearching}
            isVisible={!!activeInput}
            onSelect={handleSuggestionSelect}
          />
        </View>
      )}

      {/* Current Location Button */}
      {showCurrentLocationButton && (
        <TouchableOpacity
          style={[
            styles.currentLocationButton,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={handleCurrentLocationPress}
          accessibilityLabel="Use current location"
          accessibilityRole="button"
        >
          <MaterialIcons name="gps-fixed" size={24} color={theme.colors.primary} />
          <Text style={[styles.currentLocationText, { color: theme.colors.text }]}>
            Use current location
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    position: 'relative',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  mapButton: {
    marginLeft: 8,
    padding: 4,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentLocationText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionsWrapper: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});