/**
 * Mapbox Geocoding Service
 * Provides address autocomplete functionality using Mapbox Geocoding API v5
 * 
 * @author Senior Software Engineer
 * @version 4.0.0
 */

// Interface for Mapbox Geocoding v5 API response
interface MapboxV5Feature {
  id: string;
  type: string;
  place_type: string[];
  relevance: number;
  properties: Record<string, any>;
  text: string;
  place_name: string;
  center: [number, number]; // [longitude, latitude]
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  context?: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
}

interface MapboxV5GeocodingResponse {
  type: string;
  query: string[];
  features: MapboxV5Feature[];
  attribution: string;
}

// Interface for standardized address prediction
export interface AddressPrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

/**
 * Mapbox Geocoding Service Class
 * Handles all geocoding operations with caching and debouncing using Geocoding API v5
 */
class MapboxGeocodingService {
  private readonly baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
  private readonly accessToken: string;
  private cache = new Map<string, AddressPrediction[]>();
  private debounceTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Get Mapbox token from environment variables
    this.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    
    if (!this.accessToken) {
      throw new Error('Mapbox access token not found. Please set VITE_MAPBOX_TOKEN in your .env file');
    }
  }

  /**
   * Fetches address predictions with debouncing and caching
   * @param query - Search query string
   * @param options - Additional search options
   * @returns Promise resolving to array of address predictions
   */
  async getPlacePredictions(
    query: string,
    options: {
      country?: string;
      types?: string[];
      proximity?: [number, number];
      bbox?: [number, number, number, number];
    } = {}
  ): Promise<AddressPrediction[]> {
    // Validate and sanitize query
    if (!query || typeof query !== 'string') {
      return [];
    }
    
    // Clean and validate query string
    const cleanQuery = query.trim();
    if (cleanQuery.length < 2) {
      return [];
    }
    
    // Remove potentially problematic characters that might cause 400 errors
    const sanitizedQuery = cleanQuery.replace(/[^\w\s\-.,]/g, '').trim();
    if (sanitizedQuery.length < 2) {
      return [];
    }

    // Check cache first
    const cacheKey = `${query}-${JSON.stringify(options)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Declare timeout variables in outer scope
    let controller: AbortController | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      // Build query parameters for Geocoding v5 API
      const params = new URLSearchParams({
        access_token: this.accessToken,
        autocomplete: 'true', // Enable autocomplete functionality
        limit: '5', // Limit results for better performance
        language: 'en',
      });

      // Add country restriction (Ghana by default)
      if (options.country) {
        params.append('country', options.country);
      } else {
        params.append('country', 'gh'); // Default to Ghana
      }

      // Add place types for Geocoding v5 API - use only valid v5 types
      // Valid types: country, region, postcode, district, place, locality, neighborhood, address, poi
      const validV5Types = ['country', 'region', 'postcode', 'district', 'place', 'locality', 'neighborhood', 'address', 'poi'];
      
      if (options.types && options.types.length > 0) {
        // Filter and map to valid v5 types
        const v5Types = options.types
          .map(type => {
            // Map common aliases to valid v5 types
            if (type === 'geocode') return 'address';
            if (type === 'establishment') return 'poi';
            return type;
          })
          .filter(type => validV5Types.includes(type));
        
        if (v5Types.length > 0) {
          params.append('types', v5Types.join(','));
        } else {
          params.append('types', 'address'); // Fallback to address if no valid types
        }
      } else {
        params.append('types', 'address,place'); // Default to addresses and places
      }

      // Add proximity if provided (bias results towards location)
      if (options.proximity) {
        params.append('proximity', `${options.proximity[0]},${options.proximity[1]}`);
      }

      // Add bounding box if provided
      if (options.bbox) {
        params.append('bbox', options.bbox.join(','));
      }

      // Encode sanitized query for URL and build complete URL
      const encodedQuery = encodeURIComponent(sanitizedQuery);
      const url = `${this.baseUrl}/${encodedQuery}.json?${params.toString()}`;

      console.log('🔍 Fetching Mapbox predictions for:', sanitizedQuery);
      
      // Make API request with timeout and enhanced error handling
      controller = new AbortController();
      timeoutId = setTimeout(() => controller?.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MapboxGeocodingService/4.0.0'
        }
      });
      
      if (timeoutId) clearTimeout(timeoutId);
      
      // Enhanced error handling for 400/422 responses with graceful fallback
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Unable to read error response';
        }
        
        let errorMessage = `Mapbox API error: ${response.status} ${response.statusText}`;
        let shouldFallback = false;
        
        if (response.status === 400) {
          errorMessage = 'Invalid search parameters - falling back to manual entry';
          shouldFallback = true;
        } else if (response.status === 422) {
          errorMessage = 'Search query could not be processed - falling back to manual entry';
          shouldFallback = true;
        } else if (response.status === 401) {
          errorMessage = 'Invalid API token - please check your Mapbox configuration';
        } else if (response.status === 403) {
          errorMessage = 'API access forbidden - please check your Mapbox account';
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded - please try again later';
          shouldFallback = true;
        }
        
        console.warn('⚠️ Mapbox API Error:', {
          status: response.status,
          statusText: response.statusText,
          query: query,
          errorMessage: errorMessage,
          requestUrl: url.replace(this.accessToken, '[REDACTED]') // Security: Don't log token
        });
        
        // For 400/422 errors, return empty array instead of throwing
        // This allows manual address entry to continue working
        if (shouldFallback) {
          console.log('🔄 Falling back to manual address entry');
          return [];
        }
        
        throw new Error(errorMessage);
      }

      const data: MapboxV5GeocodingResponse = await response.json();
      
      // Transform Mapbox features to standardized prediction format
      const predictions = this.transformMapboxV5Features(data.features);
      
      // Cache results for 5 minutes
      this.cache.set(cacheKey, predictions);
      setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);
      
      console.log('✅ Mapbox predictions fetched successfully:', predictions.length);
      return predictions;
      
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId); // Clean up timeout on error
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn('⚠️ Mapbox request timeout - falling back to manual entry');
          return []; // Return empty array for timeout, don't throw
        }
        
        // Handle network errors gracefully
        if (error.message.includes('fetch')) {
          console.warn('⚠️ Network error - falling back to manual entry');
          return []; // Return empty array for network issues
        }
      }
      
      console.error('❌ Mapbox geocoding error:', error);
      
      // For other errors, still return empty array to allow manual entry
      return [];
    }
  }

  /**
   * Transforms Mapbox Geocoding v5 features to standardized prediction format
   * @param features - Mapbox v5 features array
   * @returns Array of standardized address predictions
   */
  private transformMapboxV5Features(features: MapboxV5Feature[]): AddressPrediction[] {
    return features.map((feature) => {
      // Extract main text (feature text or first part of place_name)
      const mainText = feature.text || feature.place_name.split(',')[0];
      
      // Extract secondary text (remaining parts of place_name)
      const addressParts = feature.place_name.split(',').slice(1);
      const secondaryText = addressParts.join(',').trim();
      
      return {
        place_id: feature.id,
        description: feature.place_name,
        structured_formatting: {
          main_text: mainText,
          secondary_text: secondaryText,
        },
        geometry: {
          location: {
            lat: feature.center[1], // Mapbox uses [lng, lat]
            lng: feature.center[0],
          },
        },
      };
    });
  }

  /**
   * Debounced version of getPlacePredictions
   * @param query - Search query
   * @param callback - Callback function to handle results
   * @param options - Search options
   * @param delay - Debounce delay in milliseconds (default: 300ms)
   */
  debouncedGetPredictions(
    query: string,
    callback: (predictions: AddressPrediction[], error?: Error) => void,
    options: Parameters<typeof this.getPlacePredictions>[1] = {},
    delay: number = 300
  ): void {
    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer
    this.debounceTimer = setTimeout(async () => {
      try {
        const predictions = await this.getPlacePredictions(query, options);
        callback(predictions);
      } catch (error) {
        callback([], error as Error);
      }
    }, delay);
  }

  /**
   * Clears the prediction cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const mapboxGeocodingService = new MapboxGeocodingService();

export default mapboxGeocodingService;
