import { useTheme } from "@/hooks/use-theme";
import { MaterialIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { SearchSuggestion } from "../hooks/useLocationSearch";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  isVisible: boolean;
  onSelect: (suggestion: SearchSuggestion) => void;
  onOutsideClick?: () => void;
}

export function SearchSuggestions({
  suggestions,
  isLoading,
  isVisible,
  onSelect,
  onOutsideClick,
}: SearchSuggestionsProps) {
  console.log("[SearchSuggestions] Rendering with props:", {
    suggestionsCount: suggestions?.length || 0,
    isLoading,
    isVisible,
  });

  const theme = useTheme();
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Animation for showing/hiding suggestions
  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: isVisible ? 0 : 20,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: isVisible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isVisible, translateY, opacity]);

  // Get the correct icon component based on the suggestion type
  const getIconForSuggestion = (suggestion: SearchSuggestion) => {
    // Map the icon name to the correct MaterialIcons name
    let iconName: MaterialIconName = "location-on";

    switch (suggestion.icon) {
      case "place":
        iconName = "restaurant";
        break;
      case "home":
        iconName = "home";
        break;
      case "location-city":
        iconName = "location-city";
        break;
      case "business":
        iconName = "business";
        break;
      case "terrain":
        iconName = "terrain";
        break;
      case "flag":
        iconName = "flag";
        break;
      case "markunread-mailbox":
        iconName = "markunread-mailbox";
        break;
      case "star":
        iconName = "star";
        break;
      case "history":
        iconName = "location-history";
        break;
      default:
        iconName = "location-on";
    }

    return (
      <MaterialIcons
        name={iconName}
        size={24}
        color={
          suggestion.type === "favorite"
            ? theme.colors.primary
            : theme.colors.text
        }
      />
    );
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      accessibilityRole="menu"
      accessibilityLabel="Search suggestions"
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.colors.primary} size="small" />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>
            Loading suggestions...
          </Text>
        </View>
      ) : suggestions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            No suggestions found
          </Text>
        </View>
      ) : (
        suggestions.map((suggestion) => (
          <TouchableOpacity
            key={suggestion.id}
            style={styles.suggestionItem}
            onPress={() => onSelect(suggestion)}
            accessibilityRole="menuitem"
            accessibilityLabel={`Suggestion: ${suggestion.title}`}
            accessibilityHint="Double tap to select this location"
          >
            <View style={styles.iconContainer}>
              {getIconForSuggestion(suggestion)}
            </View>
            <View style={styles.textContainer}>
              <Text
                style={[styles.title, { color: theme.colors.text }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {suggestion.title}
              </Text>
              <Text
                style={[styles.subtitle, { color: theme.colors.textMuted }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {suggestion.subtitle}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    maxHeight: 300,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    overflow: "hidden",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  loadingContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
  },
});
