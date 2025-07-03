import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Package, MapPin, Clock, CheckCircle, AlertCircle, Truck, Ship, Calendar, User, Phone, Mail, Copy, RefreshCw } from "lucide-react";
import { apiService, type ShipmentData } from "../../services/api";
import { usePreferences } from "../../context/PreferencesProvider";
import { useTranslation } from "../../lib/translations";

// Interface for tracking events
interface TrackingEvent {
  id: string;
  timestamp: string;
  location: string;
  status: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Interface for shipment details
interface ShipmentDetails {
  id: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'exception';
  origin: string;
  destination: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  packageType: string;
  weight: string;
  service: string;
  recipient: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  warehouse: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  events: TrackingEvent[];
  created: string;
}

const TrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { formatWeight } = usePreferences();
  const { t } = useTranslation();
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [shipmentData, setShipmentData] = useState<ShipmentDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchInProgressRef = useRef<boolean>(false);

  // Load search history from localStorage on component mount
  useEffect(() => {
    const history = localStorage.getItem('trackingHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Generate tracking events based on shipment status and data
  // This reflects the warehouse-to-warehouse business model: Foreign warehouse → Local warehouse → Customer pickup
  const generateTrackingEvents = useCallback((shipment: ShipmentData): TrackingEvent[] => {
    const events: TrackingEvent[] = [];
    const createdDate = new Date(shipment.created);

    // Always start with shipment request created
    events.push({
      id: "1",
      timestamp: `${shipment.created} 08:00`,
      location: "Online Platform",
      status: "Request Created",
      description: "Customer created shipment request on Ttarius Logistics platform",
      icon: Package
    });

    // Add events based on status progression
    switch (shipment.status) {
      case "pending":
        // Only request created - waiting for package to be dropped off at foreign warehouse
        break;
      
      case "transit":
        // Package received at foreign warehouse and verified
        events.push({
          id: "2",
          timestamp: `${new Date(createdDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} 10:30`,
          location: `Ttarius Warehouse - ${shipment.origin}`,
          status: "Package Received at Origin",
          description: "Package received and verified at origin warehouse, preparing for international shipment",
          icon: CheckCircle
        });
        // Package processed and shipped
        events.push({
          id: "3",
          timestamp: `${new Date(createdDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} 14:30`,
          location: "International Transit",
          status: "In International Transit",
          description: "Package departed origin warehouse and is being shipped internationally",
          icon: Ship
        });
        break;
      
      case "arrived":
        // Complete journey to local warehouse
        events.push({
          id: "2",
          timestamp: `${new Date(createdDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} 10:30`,
          location: `Ttarius Warehouse - ${shipment.origin}`,
          status: "Package Received at Origin",
          description: "Package received and verified at origin warehouse, preparing for international shipment",
          icon: CheckCircle
        });
        events.push({
          id: "3",
          timestamp: `${new Date(createdDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} 14:30`,
          location: "International Transit",
          status: "In International Transit",
          description: "Package departed origin warehouse and is being shipped internationally",
          icon: Ship
        });
        events.push({
          id: "4",
          timestamp: `${new Date(createdDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} 09:15`,
          location: "Port of Tema, Ghana",
          status: "Customs Cleared",
          description: "Package cleared customs and immigration, proceeding to local warehouse",
          icon: CheckCircle
        });
        // Most recent event - arrived at local warehouse, ready for pickup
        events.push({
          id: "5",
          timestamp: `${new Date(createdDate.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} 16:45`,
          location: "Ttarius Warehouse - Accra, Ghana",
          status: "Ready for Pickup",
          description: "Package arrived at local warehouse and is ready for customer pickup. Please bring valid ID.",
          icon: MapPin
        });
        break;
      
      case "received":
        // Customer has picked up the package from local warehouse
        events.push({
          id: "2",
          timestamp: `${new Date(createdDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} 10:30`,
          location: `Ttarius Warehouse - ${shipment.origin}`,
          status: "Package Received at Origin",
          description: "Package received and verified at origin warehouse, preparing for international shipment",
          icon: CheckCircle
        });
        events.push({
          id: "3",
          timestamp: `${new Date(createdDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} 14:30`,
          location: "International Transit",
          status: "In International Transit",
          description: "Package departed origin warehouse and is being shipped internationally",
          icon: Ship
        });
        events.push({
          id: "4",
          timestamp: `${new Date(createdDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} 09:15`,
          location: "Port of Tema, Ghana",
          status: "Customs Cleared",
          description: "Package cleared customs and immigration, proceeding to local warehouse",
          icon: CheckCircle
        });
        events.push({
          id: "5",
          timestamp: `${new Date(createdDate.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} 16:45`,
          location: "Ttarius Warehouse - Accra, Ghana",
          status: "Ready for Pickup",
          description: "Package arrived at local warehouse and is ready for customer pickup. Please bring valid ID.",
          icon: MapPin
        });
        // Final event - customer picked up from warehouse
        events.push({
          id: "6",
          timestamp: `${new Date(createdDate.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} 11:20`,
          location: "Ttarius Warehouse - Accra, Ghana",
          status: "Package Collected",
          description: `Package successfully collected from warehouse by ${shipment.recipient}`,
          icon: CheckCircle
        });
        break;

      case "delivered":
        // Same as received - package collected from warehouse (no home delivery)
        events.push({
          id: "2",
          timestamp: `${new Date(createdDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} 10:30`,
          location: `Ttarius Warehouse - ${shipment.origin}`,
          status: "Package Received at Origin",
          description: "Package received and verified at origin warehouse, preparing for international shipment",
          icon: CheckCircle
        });
        events.push({
          id: "3",
          timestamp: `${new Date(createdDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} 14:30`,
          location: "International Transit",
          status: "In International Transit", 
          description: "Package departed origin warehouse and is being shipped internationally",
          icon: Ship
        });
        events.push({
          id: "4",
          timestamp: `${new Date(createdDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} 09:15`,
          location: "Port of Tema, Ghana",
          status: "Customs Cleared",
          description: "Package cleared customs and immigration, proceeding to local warehouse",
          icon: CheckCircle
        });
        events.push({
          id: "5",
          timestamp: `${new Date(createdDate.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} 16:45`,
          location: "Ttarius Warehouse - Accra, Ghana",
          status: "Ready for Pickup",
          description: "Package arrived at local warehouse and is ready for customer pickup. Please bring valid ID.",
          icon: MapPin
        });
        // Final event - customer picked up from warehouse
        events.push({
          id: "6",
          timestamp: `${new Date(createdDate.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} 11:20`,
          location: "Ttarius Warehouse - Accra, Ghana",
          status: "Package Collected",
          description: `Package successfully collected from warehouse by ${shipment.recipient}`,
          icon: CheckCircle
        });
        break;
    }

    // Return events in reverse chronological order (most recent first) for UI display
    return events.reverse();
  }, []);

  // Shared search logic using the simplified API service
  const performSearch = useCallback(async (searchId: string) => {
    if (!searchId.trim()) {
      setError("Please enter a tracking number");
      return;
    }

    // Prevent multiple simultaneous searches
    if (searchInProgressRef.current) {
      return;
    }

    searchInProgressRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // Use the simplified API service (handles mock data toggle automatically)
      const response = await apiService.trackShipment(searchId.trim());
      
      if (response.success) {
        // Map API response to tracking data
        const mapStatus = (status: string): 'pending' | 'in-transit' | 'delivered' | 'exception' => {
          switch (status) {
            case 'pending': return 'pending';
            case 'transit': return 'in-transit';
            case 'arrived': return 'in-transit';
            case 'received': return 'delivered';
            case 'delivered': return 'delivered';
            default: return 'pending';
          }
        };

        const trackingData: ShipmentDetails = {
          id: response.data.id,
          status: mapStatus(response.data.status),
          origin: response.data.origin,
          destination: response.data.destination,
          estimatedDelivery: response.data.estimatedDelivery,
          packageType: response.data.type,
          weight: response.data.weight,
          service: response.data.service,
          recipient: response.data.recipientDetails,
          warehouse: response.data.warehouseDetails,
          created: response.data.created,
          events: generateTrackingEvents(response.data)
        };

        setShipmentData(trackingData);
      } else {
        throw new Error(response.error || "Tracking number not found. Please check and try again.");
      }

      // Update search history
      setSearchHistory(prevHistory => {
        const updatedHistory = [searchId.toUpperCase(), ...prevHistory.filter(item => item !== searchId.toUpperCase())].slice(0, 5);
        localStorage.setItem('trackingHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to track shipment. Please try again.");
      setShipmentData(null);
    } finally {
      setLoading(false);
      searchInProgressRef.current = false;
    }
  }, [generateTrackingEvents]);

  // Handle search triggered from URL parameters
  const handleSearchWithId = useCallback(async (trackingId: string) => {
    await performSearch(trackingId);
  }, [performSearch]);

  const handleSearch = async () => {
    await performSearch(trackingNumber);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-50';
      case 'in-transit':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'exception':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return CheckCircle;
      case 'in-transit':
        return Truck;
      case 'pending':
        return Clock;
      case 'exception':
        return AlertCircle;
      default:
        return Package;
    }
  };

  // Handle URL parameters - auto-fill tracking number and search if provided
  useEffect(() => {
    const trackingId = searchParams.get('id');
    if (trackingId && trackingId !== trackingNumber) {
      setTrackingNumber(trackingId);
      // Auto-trigger search for the tracking ID only if not already searching
      if (!searchInProgressRef.current) {
        handleSearchWithId(trackingId);
      }
    }
  }, [searchParams, handleSearchWithId, trackingNumber]);

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('trackYourPackage')}</h1>
          <p className="text-gray-600">{t('enterTrackingNumber')}</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="tracking-input" className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Number
              </label>
              <input
                id="tracking-input"
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`${t('trackingNumber')} (e.g. SHIP2132)`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                disabled={loading}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                {loading ? t('loading') : t('trackPackage')}
              </button>
            </div>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Recent Searches</label>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setTrackingNumber(item)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Shipment Details */}
        {shipmentData && (
          <div className="space-y-6">
            {/* Status Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${getStatusColor(shipmentData.status)}`}>
                    {React.createElement(getStatusIcon(shipmentData.status), { className: "w-6 h-6" })}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Tracking #{shipmentData.id}
                    </h2>
                    <p className={`text-sm font-medium px-3 py-1 rounded-full inline-block ${getStatusColor(shipmentData.status)}`}>
                      {shipmentData.status.replace('-', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(shipmentData.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy tracking number"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">From</p>
                    <p className="font-medium text-gray-900">{shipmentData.origin}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">To</p>
                    <p className="font-medium text-gray-900">{shipmentData.destination}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Est. Pickup Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(shipmentData.estimatedDelivery).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Tracking History</h3>
              <div className="space-y-4">
                {shipmentData.events.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`p-2 rounded-full ${index === 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                        {React.createElement(event.icon, { className: "w-4 h-4" })}
                      </div>
                      {index < shipmentData.events.length - 1 && (
                        <div className="w-px h-8 bg-gray-200 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900">{event.status}</h4>
                        <span className="text-sm text-gray-500">{event.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{event.location}</p>
                      <p className="text-sm text-gray-500">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipment Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Package Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium text-gray-900">{shipmentData.packageType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('weight')}:</span>
                    <span className="font-medium text-gray-900">
                      {typeof shipmentData.weight === 'string' 
                        ? shipmentData.weight 
                        : formatWeight(parseFloat(shipmentData.weight) || 0)
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium text-gray-900">{shipmentData.service}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(shipmentData.created).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recipient</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{shipmentData.recipient.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{shipmentData.recipient.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{shipmentData.recipient.email}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-gray-900">{shipmentData.recipient.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Warehouse/Origin</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{shipmentData.warehouse.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{shipmentData.warehouse.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{shipmentData.warehouse.email}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-gray-900">{shipmentData.warehouse.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingPage;
