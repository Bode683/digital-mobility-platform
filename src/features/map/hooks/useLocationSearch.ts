import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMap, MapLocation } from '../contexts/MapContext';
import { useForwardGeocode } from './useForwardGeocode';
import { debounce } from 'lodash';

export interface SearchSuggestion {
  id: string;
  title: string;
  subtitle: string;
  icon?: string;
  type?: 'recent' | 'favorite' | 'search';
  location: MapLocation;
}

interface UseLocationSearchProps {
  initialPickup?: string;
  initialDropoff?: string;
  onPickupSelect?: (location: MapLocation) => void;
  onDropoffSelect?: (location: MapLocation) => void;
  recentLocations?: SearchSuggestion[];
  favoriteLocations?: SearchSuggestion[];
}

export function useLocationSearch({
  initialPickup = '',
  initialDropoff = '',
  onPickupSelect,
  onDropoffSelect,
  recentLocations = [],
  favoriteLocations = [],
}: UseLocationSearchProps = {}) {
  // Input values
  const [pickupQuery, setPickupQuery] = useState(initialPickup);
  const [dropoffQuery, setDropoffQuery] = useState(initialDropoff);
  
  // Suggestions state
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [activeInput, setActiveInput] = useState<'pickup' | 'dropoff' | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Get map context and geocoding hook
  const { getCurrentLocation } = useMap();
  const { forwardGeocode, loading: geocodingLoading } = useForwardGeocode();
  
  // Update search status
  useEffect(() => {
    setIsSearching(geocodingLoading);
  }, [geocodingLoading]);

  // Search for locations based on query
  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        if (!query.trim()) {
          // Show recent and favorite locations when no query
          const combinedSuggestions = [
            ...favoriteLocations.map((loc) => ({
              ...loc,
              type: "favorite" as const,
            })),
            ...recentLocations.map((loc) => ({
              ...loc,
              type: "recent" as const,
            })),
          ];
          setSuggestions(combinedSuggestions);
          return;
        }

        try {
          setIsSearching(true);
          const location = await forwardGeocode(query);

          if (!location) {
            setSuggestions([]);
            return;
          }

          // Create a suggestion from the geocoded result
          const newSuggestion: SearchSuggestion = {
            id: `search-${Date.now()}`,
            title: location.name || query,
            subtitle: location.address || "",
            icon: "location-on",
            type: "search",
            location: {
              latitude: location.latitude,
              longitude: location.longitude,
              address: location.address,
              name: location.name,
            },
          };

          setSuggestions([newSuggestion]);
        } catch (error) {
          console.error("Error searching locations:", error);
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      }, 300),
    [forwardGeocode, favoriteLocations, recentLocations]
  );

  const searchLocations = useCallback(
    (query: string) => {
      debouncedSearch(query);
    },
    [debouncedSearch]
  );

  // Update suggestions when query changes
  useEffect(() => {
    if (activeInput === 'pickup') {
      searchLocations(pickupQuery);
    } else if (activeInput === 'dropoff') {
      searchLocations(dropoffQuery);
    }
  }, [pickupQuery, dropoffQuery, activeInput, searchLocations]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback(
    (suggestion: SearchSuggestion) => {
      if (activeInput === 'pickup') {
        setPickupQuery(suggestion.title);
        if (onPickupSelect) {
          onPickupSelect(suggestion.location);
        }
      } else if (activeInput === 'dropoff') {
        setDropoffQuery(suggestion.title);
        if (onDropoffSelect) {
          onDropoffSelect(suggestion.location);
        }
      }
      
      // Clear suggestions after selection
      setSuggestions([]);
    },
    [activeInput, onPickupSelect, onDropoffSelect]
  );

  // Use current location for pickup
  const useCurrentLocation = useCallback(async () => {
    try {
      setIsSearching(true);
      const location = await getCurrentLocation();
      
      if (location) {
        setPickupQuery(location.address || 'Current Location');
        if (onPickupSelect) {
          onPickupSelect(location);
        }
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setIsSearching(false);
    }
  }, [getCurrentLocation, onPickupSelect]);

  return {
    // State
    pickupQuery,
    dropoffQuery,
    suggestions,
    isSearching,
    activeInput,
    
    // Setters
    setPickupQuery,
    setDropoffQuery,
    setActiveInput,
    
    // Actions
    handleSuggestionSelect,
    useCurrentLocation,
    searchLocations,
  };
}
