/**
 * Country Validation Service
 * Implements international shipping business logic and country restrictions
 * Ensures only cross-border requests are allowed (no domestic shipping)
 */

// Supported countries with their details
export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  timezone: string;
  currency: string;
  warehouseLocations: string[];
  isActive: boolean;
  canBeOrigin: boolean;
  canBeDestination: boolean;
}

// Current supported countries
export const SUPPORTED_COUNTRIES: Record<string, CountryInfo> = {
  GH: {
    code: 'GH',
    name: 'Ghana',
    flag: '🇬🇭',
    timezone: 'GMT',
    currency: 'GHS',
    warehouseLocations: ['Accra', 'Kumasi', 'Tamale'],
    isActive: true,
    canBeOrigin: true,
    canBeDestination: true
  },
  US: {
    code: 'US', 
    name: 'United States',
    flag: '🇺🇸',
    timezone: 'EST/PST',
    currency: 'USD',
    warehouseLocations: ['New York', 'Los Angeles', 'Chicago'],
    isActive: true,
    canBeOrigin: true,
    canBeDestination: true
  },
  // Future expansion countries (not yet active)
  NG: {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    timezone: 'WAT',
    currency: 'NGN',
    warehouseLocations: ['Lagos', 'Abuja'],
    isActive: false, // Future expansion
    canBeOrigin: true,
    canBeDestination: true
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    timezone: 'GMT',
    currency: 'GBP',
    warehouseLocations: ['London', 'Manchester'],
    isActive: false, // Future expansion
    canBeOrigin: true,
    canBeDestination: true
  }
};

// Shipping routes with service availability
export interface ShippingRoute {
  origin: string;
  destination: string;
  services: {
    AIR: {
      available: boolean;
      estimatedDays: number;
      isPrimary: boolean;
    };
    SEA: {
      available: boolean;
      estimatedDays: number;
      isPrimary: boolean;
    };
    GROUND: {
      available: boolean;
      estimatedDays: number;
      isPrimary: boolean;
    };
    EXPRESS: {
      available: boolean;
      estimatedDays: number;
      isPrimary: boolean;
    };
  };
  isActive: boolean;
}

// Currently supported shipping routes
export const SHIPPING_ROUTES: ShippingRoute[] = [
  {
    origin: 'GH',
    destination: 'US',
    services: {
      AIR: { available: true, estimatedDays: 5, isPrimary: true },
      SEA: { available: false, estimatedDays: 30, isPrimary: false }, // Future
      GROUND: { available: false, estimatedDays: 0, isPrimary: false }, // Not applicable
      EXPRESS: { available: false, estimatedDays: 3, isPrimary: false } // Future
    },
    isActive: true
  },
  {
    origin: 'US',
    destination: 'GH', 
    services: {
      AIR: { available: true, estimatedDays: 5, isPrimary: true },
      SEA: { available: false, estimatedDays: 30, isPrimary: false }, // Future
      GROUND: { available: false, estimatedDays: 0, isPrimary: false }, // Not applicable
      EXPRESS: { available: false, estimatedDays: 3, isPrimary: false } // Future
    },
    isActive: true
  }
  // Additional routes will be added as service expands
];

/**
 * Country Validation Service
 */
export class CountryValidationService {
  /**
   * Get countries available as origin for a client
   * Client's own country is excluded (international only)
   */
  static getAvailableOriginCountries(clientCountry: string): CountryInfo[] {
    return Object.values(SUPPORTED_COUNTRIES).filter(
      country => 
        country.isActive && 
        country.canBeOrigin && 
        country.code !== clientCountry &&
        this.hasActiveRoute(country.code, clientCountry)
    );
  }

  /**
   * Get countries available as destination for a client
   * Client's own country is excluded (international only)
   */
  static getAvailableDestinationCountries(clientCountry: string): CountryInfo[] {
    return Object.values(SUPPORTED_COUNTRIES).filter(
      country => 
        country.isActive && 
        country.canBeDestination && 
        country.code !== clientCountry &&
        this.hasActiveRoute(clientCountry, country.code)
    );
  }

  /**
   * Validate if a shipping route exists and is active
   */
  static hasActiveRoute(origin: string, destination: string): boolean {
    return SHIPPING_ROUTES.some(
      route => 
        route.origin === origin && 
        route.destination === destination && 
        route.isActive
    );
  }

  /**
   * Get shipping route details
   */
  static getShippingRoute(origin: string, destination: string): ShippingRoute | null {
    return SHIPPING_ROUTES.find(
      route => 
        route.origin === origin && 
        route.destination === destination
    ) || null;
  }

  /**
   * Get available services for a route
   */
  static getAvailableServices(origin: string, destination: string): string[] {
    const route = this.getShippingRoute(origin, destination);
    if (!route) return [];

    return Object.entries(route.services)
      .filter(([, service]) => service.available)
      .map(([serviceName]) => serviceName);
  }

  /**
   * Get primary service for a route
   */
  static getPrimaryService(origin: string, destination: string): string | null {
    const route = this.getShippingRoute(origin, destination);
    if (!route) return null;

    const primaryService = Object.entries(route.services)
      .find(([, service]) => service.available && service.isPrimary);

    return primaryService ? primaryService[0] : null;
  }

  /**
   * Validate international shipping request
   */
  static validateInternationalRequest(
    clientCountry: string, 
    originCountry: string, 
    serviceType: string = 'AIR'
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if client country equals origin country (domestic - not allowed)
    if (clientCountry === originCountry) {
      errors.push('Domestic shipping is not available. Please select a different origin country.');
    }

    // Check if origin country is supported and active
    const originCountryInfo = SUPPORTED_COUNTRIES[originCountry];
    if (!originCountryInfo) {
      errors.push('Origin country is not supported.');
    } else if (!originCountryInfo.isActive) {
      errors.push('Origin country is not currently available for shipping.');
    } else if (!originCountryInfo.canBeOrigin) {
      errors.push('Selected country cannot be used as origin.');
    }

    // Check if client country is supported and active
    const clientCountryInfo = SUPPORTED_COUNTRIES[clientCountry];
    if (!clientCountryInfo) {
      errors.push('Your country is not currently supported.');
    } else if (!clientCountryInfo.isActive) {
      errors.push('Shipping to your country is not currently available.');
    }

    // Check if shipping route exists
    if (!this.hasActiveRoute(originCountry, clientCountry)) {
      errors.push('No shipping route available between selected countries.');
    }

    // Check if service is available for the route
    const availableServices = this.getAvailableServices(originCountry, clientCountry);
    if (!availableServices.includes(serviceType)) {
      if (availableServices.length > 0) {
        warnings.push(`${serviceType} service not available. Available services: ${availableServices.join(', ')}`);
      } else {
        errors.push('No shipping services available for this route.');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get estimated delivery time for a route and service
   */
  static getEstimatedDeliveryTime(
    origin: string, 
    destination: string, 
    serviceType: string = 'AIR'
  ): number | null {
    const route = this.getShippingRoute(origin, destination);
    if (!route) return null;

    const service = route.services[serviceType as keyof typeof route.services];
    return service?.available ? service.estimatedDays : null;
  }

  /**
   * Calculate shipping cost estimation
   */
  static calculateShippingCost(
    origin: string,
    destination: string,
    serviceType: string,
    weight: number,
    packageType: 'DOCUMENT' | 'NON_DOCUMENT'
  ): {
    baseCost: number;
    weightCost: number;
    serviceFee: number;
    documentFee: number;
    insuranceFee: number;
    totalCost: number;
    currency: string;
  } | null {
    const route = this.getShippingRoute(origin, destination);
    if (!route) return null;

    const service = route.services[serviceType as keyof typeof route.services];
    if (!service?.available) return null;

    // Base costs (mock data - would come from warehouse system)
    const baseCosts = {
      AIR: 50,
      SEA: 30,
      GROUND: 25,
      EXPRESS: 100
    };

    const baseCost = baseCosts[serviceType as keyof typeof baseCosts] || 50;
    const weightCost = Math.max(0, weight - 1) * 5; // $5 per kg over 1kg
    const serviceFee = baseCost * 0.1; // 10% service fee
    const documentFee = packageType === 'DOCUMENT' ? 10 : 0; // Document handling fee
    const insuranceFee = baseCost * 0.05; // 5% insurance fee

    const totalCost = baseCost + weightCost + serviceFee + documentFee + insuranceFee;

    return {
      baseCost,
      weightCost,
      serviceFee,
      documentFee,
      insuranceFee,
      totalCost: Math.round(totalCost * 100) / 100, // Round to 2 decimal places
      currency: 'USD' // Primary currency
    };
  }

  /**
   * Get country information by code
   */
  static getCountryInfo(countryCode: string): CountryInfo | null {
    return SUPPORTED_COUNTRIES[countryCode] || null;
  }

  /**
   * Get all active countries
   */
  static getActiveCountries(): CountryInfo[] {
    return Object.values(SUPPORTED_COUNTRIES).filter(country => country.isActive);
  }

  /**
   * Format country display name
   */
  static formatCountryDisplay(countryCode: string): string {
    const country = this.getCountryInfo(countryCode);
    return country ? `${country.flag} ${country.name}` : countryCode;
  }

  /**
   * Get warehouse locations for a country
   */
  static getWarehouseLocations(countryCode: string): string[] {
    const country = this.getCountryInfo(countryCode);
    return country?.warehouseLocations || [];
  }

  /**
   * Check if country can be used as origin
   */
  static canBeOrigin(countryCode: string): boolean {
    const country = this.getCountryInfo(countryCode);
    return country?.isActive && country?.canBeOrigin || false;
  }

  /**
   * Check if country can be used as destination
   */
  static canBeDestination(countryCode: string): boolean {
    const country = this.getCountryInfo(countryCode);
    return country?.isActive && country?.canBeDestination || false;
  }

  /**
   * Get business rules summary for client
   */
  static getBusinessRules(clientCountry: string): {
    domesticShipping: boolean;
    availableOrigins: string[];
    primaryService: string;
    estimatedDelivery: string;
    restrictions: string[];
  } {
    const availableOrigins = this.getAvailableOriginCountries(clientCountry);
    const primaryOrigin = availableOrigins[0];
    const primaryService = primaryOrigin ? this.getPrimaryService(primaryOrigin.code, clientCountry) : null;
    const estimatedDays = primaryOrigin && primaryService 
      ? this.getEstimatedDeliveryTime(primaryOrigin.code, clientCountry, primaryService)
      : null;

    return {
      domesticShipping: false, // Never allowed
      availableOrigins: availableOrigins.map(c => c.name),
      primaryService: primaryService || 'AIR',
      estimatedDelivery: estimatedDays ? `${estimatedDays} days` : 'Contact support',
      restrictions: [
        'Only international shipping is available',
        'All packages must originate from a different country',
        'Air freight is currently the primary service',
        'All deliveries are warehouse pickup only'
      ]
    };
  }
}
