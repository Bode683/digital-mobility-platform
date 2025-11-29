import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { MapLocation, useMap } from '../contexts/MapContext';
import { useForwardGeocode } from './useForwardGeocode';
import { usePrevious } from './usePrevious';

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
  
  // Debounced query values (300ms delay)
  const [debouncedPickupQuery] = useDebounce(pickupQuery.trim(), 300);
  const [debouncedDropoffQuery] = useDebounce(dropoffQuery.trim(), 300);
  
  // Suggestions state
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [activeInput, setActiveInput] = useState<'pickup' | 'dropoff' | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Get map context and geocoding hook
  const { getCurrentLocation, state: mapState } = useMap();
  const { forwardGeocodeMultiple, loading: geocodingLoading } = useForwardGeocode();
  
  // Memoize arrays to prevent unnecessary recreations
  const stableFavorites = useMemo(() => favoriteLocations, [JSON.stringify(favoriteLocations)]);
  const stableRecents = useMemo(() => recentLocations, [JSON.stringify(recentLocations)]);
  
  // Update search status
  useEffect(() => {
    setIsSearching(geocodingLoading);
  }, [geocodingLoading]);

  // Helper function to get combined recent/favorites suggestions
  const getRecentFavoritesSuggestions = useCallback((): SearchSuggestion[] => {
    return [
      ...stableFavorites.map((loc) => ({
        ...loc,
        type: "favorite" as const,
      })),
      ...stableRecents.map((loc) => ({
        ...loc,
        type: "recent" as const,
      })),
    ];
  }, [stableFavorites, stableRecents]);

  // Search for locations based on query
  const searchLocations = useCallback(
    async (query: string) => {
      console.log('[useLocationSearch] searchLocations called with query:', query);
      
      if (!query) {
        // Show recent and favorite locations when no query
        console.log('[useLocationSearch] Empty query, showing recent/favorites');
        const combinedSuggestions = getRecentFavoritesSuggestions();
        console.log('[useLocationSearch] Combined suggestions count:', combinedSuggestions.length);
        setSuggestions(combinedSuggestions);
        return;
      }

      try {
        console.log('[useLocationSearch] Starting geocode for:', query);
        setIsSearching(true);
        
        // Use proximity if we have current location
        const proximity = mapState.currentLocation 
          ? [mapState.currentLocation.longitude, mapState.currentLocation.latitude] as [number, number]
          : undefined;
        
        const locations = await forwardGeocodeMultiple(query, {
          limit: 5,
          autocomplete: true,
          types: ['address', 'poi'],
          proximity,
        });
        
        console.log('[useLocationSearch] Geocode results count:', locations.length);

        if (locations.length === 0) {
          console.log('[useLocationSearch] No locations returned, clearing suggestions');
          setSuggestions([]);
          return;
        }

        // Convert all locations to suggestions
        const newSuggestions: SearchSuggestion[] = locations.map((location, index) => ({
          id: location.placeId || `search-${Date.now()}-${index}`,
          title: location.name || query,
          subtitle: location.address || "",
          icon: "location-on",
          type: "search" as const,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address,
            name: location.name,
          },
        }));

        console.log('[useLocationSearch] Created suggestions:', newSuggestions.length);
        setSuggestions(newSuggestions);
      } catch (error) {
        console.error("[useLocationSearch] Error searching locations:", error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    },
    [forwardGeocodeMultiple, mapState.currentLocation, getRecentFavoritesSuggestions]
  );

  // Track previous values to detect changes
  const prevActiveInput = usePrevious(activeInput);
  
  // Update suggestions when query or active input changes
  useEffect(() => {
    console.log('[useLocationSearch] Search effect triggered:', {
      activeInput,
      debouncedPickupQuery,
      debouncedDropoffQuery,
    });
    
    // Handle input focus/blur changes
    if (activeInput !== prevActiveInput) {
      if (!activeInput) {
        // Clear suggestions when input is blurred
        console.log('[useLocationSearch] No active input, clearing suggestions');
        setSuggestions([]);
        return;
      }
    }
    
    // Handle pickup search
    if (activeInput === 'pickup') {
      if (debouncedPickupQuery) {
        console.log('[useLocationSearch] Searching pickup query:', debouncedPickupQuery);
        searchLocations(debouncedPickupQuery);
      } else {
        // Show recent/favorites for empty query
        console.log('[useLocationSearch] Empty pickup query, showing recent/favorites');
        setSuggestions(getRecentFavoritesSuggestions());
      }
    } 
    // Handle dropoff search
    else if (activeInput === 'dropoff') {
      if (debouncedDropoffQuery) {
        console.log('[useLocationSearch] Searching dropoff query:', debouncedDropoffQuery);
        searchLocations(debouncedDropoffQuery);
      } else {
        // Show recent/favorites for empty query
        console.log('[useLocationSearch] Empty dropoff query, showing recent/favorites');
        setSuggestions(getRecentFavoritesSuggestions());
      }
    }
  }, [
    activeInput,
    prevActiveInput,
    debouncedPickupQuery,
    debouncedDropoffQuery,
    searchLocations,
    getRecentFavoritesSuggestions
  ]);

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
