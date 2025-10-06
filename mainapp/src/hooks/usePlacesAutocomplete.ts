/**
 * Mapbox Places Autocomplete Hook
 * Handles autocomplete logic using Mapbox Geocoding API for predictions
 * 
 * @author Senior Software Engineer
 * @version 3.0.0
 */

import { useState, useCallback, useRef } from 'react';
import { mapboxGeocodingService, type AddressPrediction } from '../utils/mapboxGeocodingService';

/**
 * Custom hook for Mapbox Places Autocomplete functionality
 * Returns predictions array and fetchPredictions function with debouncing
 */
export function usePlacesAutocomplete() {
  const [predictions, setPredictions] = useState<AddressPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetches address predictions with debouncing (300ms delay)
   * @param input - User input string
   */
  const fetchPredictions = useCallback((input: string) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Clear predictions if input is too short
    if (input.length < 3) {
      setPredictions([]);
      setError(null);
      return;
    }

    // Set loading state immediately for better UX
    setIsLoading(true);
    setError(null);

    // Debounce API calls to avoid excessive requests
    debounceTimerRef.current = setTimeout(async () => {
      try {
        console.log('🔍 Fetching Mapbox predictions for:', input);
        
        // Fetch predictions from Mapbox Geocoding API
        const results = await mapboxGeocodingService.getPlacePredictions(input, {
          country: 'gh', // Restrict to Ghana
          types: ['geocode'], // Only geocoded addresses
        });
        
        setPredictions(results);
        setIsLoading(false);
        
        console.log('✅ Mapbox predictions fetched:', results.length);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch address suggestions';
        
        // Don't show error for fallback scenarios (400/422 errors)
        // These are handled gracefully by returning empty predictions
        if (!errorMessage.includes('falling back to manual entry')) {
          setError(errorMessage);
          console.error('❌ Mapbox geocoding error:', errorMessage);
        } else {
          setError(null); // Clear any previous errors
          console.log('ℹ️ Address suggestions unavailable, manual entry enabled');
        }
        
        setPredictions([]);
        setIsLoading(false);
      }
    }, 300); // 300ms debounce delay
  }, []);

  /**
   * Clears all predictions and resets state
   */
  const clearPredictions = useCallback(() => {
    setPredictions([]);
    setError(null);
    setIsLoading(false);
    
    // Clear any pending debounced requests
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  /**
   * Gets coordinates for a specific prediction
   * @param prediction - Address prediction object
   * @returns Coordinates object with lat/lng
   */
  const getCoordinates = useCallback((prediction: AddressPrediction) => {
    return prediction.geometry?.location || null;
  }, []);

  return { 
    predictions, 
    fetchPredictions,
    clearPredictions,
    getCoordinates,
    isLoading, 
    error 
  };
}

export default usePlacesAutocomplete;
