import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  const { getCurrentLocation, state: mapState } = useMap();
  const { forwardGeocodeMultiple, loading: geocodingLoading } = useForwardGeocode();
  
  // Memoize arrays to prevent unnecessary recreations
  const favoriteLocationsRef = useRef(favoriteLocations);
  const recentLocationsRef = useRef(recentLocations);
  
  // Update refs when props change
  useEffect(() => {
    favoriteLocationsRef.current = favoriteLocations;
    recentLocationsRef.current = recentLocations;
  }, [favoriteLocations, recentLocations]);
  
  // Memoize current location to prevent debouncedSearch recreation
  const currentLocationRef = useRef(mapState.currentLocation);
  useEffect(() => {
    currentLocationRef.current = mapState.currentLocation;
  }, [mapState.currentLocation]);
  
  // Update search status
  useEffect(() => {
    setIsSearching(geocodingLoading);
  }, [geocodingLoading]);

  // Search for locations based on query
  // Use refs in dependencies to prevent recreation on every render
  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        console.log('[useLocationSearch] debouncedSearch called with query:', query);
        
        if (!query.trim()) {
          // Show recent and favorite locations when no query
          console.log('[useLocationSearch] Empty query, showing recent/favorites');
          const combinedSuggestions = [
            ...favoriteLocationsRef.current.map((loc) => ({
              ...loc,
              type: "favorite" as const,
            })),
            ...recentLocationsRef.current.map((loc) => ({
              ...loc,
              type: "recent" as const,
            })),
          ];
          console.log('[useLocationSearch] Combined suggestions count:', combinedSuggestions.length);
          setSuggestions(combinedSuggestions);
          return;
        }

        try {
          console.log('[useLocationSearch] Starting geocode for:', query);
          setIsSearching(true);
          
          // Use proximity if we have current location (from ref to avoid dependency)
          const currentLocation = currentLocationRef.current;
          const proximity = currentLocation 
            ? [currentLocation.longitude, currentLocation.latitude] as [number, number]
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
      }, 300),
    [forwardGeocodeMultiple] // Only depend on forwardGeocodeMultiple which should be stable
  );

  const searchLocations = useCallback(
    (query: string) => {
      debouncedSearch(query);
    },
    [debouncedSearch]
  );

  // Track previous trimmed query values to prevent unnecessary updates
  const prevPickupQueryTrimmedRef = useRef(pickupQuery.trim());
  const prevDropoffQueryTrimmedRef = useRef(dropoffQuery.trim());
  const prevActiveInputRef = useRef(activeInput);
  
  // Helper function to get combined recent/favorites suggestions
  const getRecentFavoritesSuggestions = useCallback(() => {
    return [
      ...favoriteLocationsRef.current.map((loc) => ({
        ...loc,
        type: "favorite" as const,
      })),
      ...recentLocationsRef.current.map((loc) => ({
        ...loc,
        type: "recent" as const,
      })),
    ];
  }, []); // No dependencies needed since we use refs
  
  // Update suggestions when query changes
  useEffect(() => {
    const pickupQueryTrimmed = pickupQuery.trim();
    const dropoffQueryTrimmed = dropoffQuery.trim();
    
    // Skip if nothing changed (compare trimmed values)
    const pickupQueryChanged = prevPickupQueryTrimmedRef.current !== pickupQueryTrimmed;
    const dropoffQueryChanged = prevDropoffQueryTrimmedRef.current !== dropoffQueryTrimmed;
    const activeInputChanged = prevActiveInputRef.current !== activeInput;
    
    if (!pickupQueryChanged && !dropoffQueryChanged && !activeInputChanged) {
      return; // No changes, skip execution
    }
    
    // Update refs
    prevPickupQueryTrimmedRef.current = pickupQueryTrimmed;
    prevDropoffQueryTrimmedRef.current = dropoffQueryTrimmed;
    prevActiveInputRef.current = activeInput;
    
    console.log('[useLocationSearch] Search effect triggered:', {
      activeInput,
      pickupQuery,
      dropoffQuery,
      pickupQueryChanged,
      dropoffQueryChanged,
      activeInputChanged,
    });
    
    if (activeInput === 'pickup') {
      if (pickupQueryTrimmed) {
        // Only search if query is not empty and actually changed
        if (pickupQueryChanged) {
          console.log('[useLocationSearch] Searching pickup query:', pickupQueryTrimmed);
          searchLocations(pickupQueryTrimmed);
        }
      } else {
        // Show recent/favorites for empty query when input is focused
        if (activeInputChanged || pickupQueryChanged) {
          console.log('[useLocationSearch] Empty pickup query, showing recent/favorites');
          setSuggestions(getRecentFavoritesSuggestions());
        }
      }
    } else if (activeInput === 'dropoff') {
      if (dropoffQueryTrimmed) {
        // Only search if query is not empty and actually changed
        if (dropoffQueryChanged) {
          console.log('[useLocationSearch] Searching dropoff query:', dropoffQueryTrimmed);
          searchLocations(dropoffQueryTrimmed);
        }
      } else {
        // Show recent/favorites for empty query when input is focused
        if (activeInputChanged || dropoffQueryChanged) {
          console.log('[useLocationSearch] Empty dropoff query, showing recent/favorites');
          setSuggestions(getRecentFavoritesSuggestions());
        }
      }
    } else {
      // Clear suggestions when no active input
      if (activeInputChanged) {
        console.log('[useLocationSearch] No active input, clearing suggestions');
        setSuggestions([]);
      }
    }
  }, [pickupQuery, dropoffQuery, activeInput, searchLocations, getRecentFavoritesSuggestions]);

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
