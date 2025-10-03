/**
 * Professional Tracking Page Component
 * 
 * Enhanced tracking interface with professional status descriptions
 * 
 * @author Senior Software Engineer
 * @version 2.0.0
 * @created 2025-10-03
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation, type TranslationKey } from '../../lib/translations';
import { useAuth } from '../../hooks/useAuth';
import { TrackingService, type TrackingData, type TrackingEvent } from '../../services/trackingService';
import { AlertCircle, ArrowDownToLine, CheckCircle, Clock, Copy, MapPin, Plane, RefreshCw, Search, Package, Settings, Truck, Calculator, FileText, CreditCard, Shield, AlertTriangle, RotateCcw } from 'lucide-react';

/**
 * Icon mapping for status codes
 */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'Clock': Clock,
  'Package': Package,
  'Settings': Settings,
  'Truck': Truck,
  'Calculator': Calculator,
  'FileText': FileText,
  'CreditCard': CreditCard,
  'Plane': Plane,
  'Shield': Shield,
  'CheckCircle': CheckCircle,
  'AlertCircle': AlertCircle,
  'AlertTriangle': AlertTriangle,
  'RotateCcw': RotateCcw,
  'ArrowDownToLine': ArrowDownToLine,
  'MapPin': MapPin
};

/**
 * SearchForm Component
 */
const SearchForm: React.FC<{
  trackingNumber: string;
  setTrackingNumber: (value: string) => void;
  handleSearch: () => void;
  loading: boolean;
  searchHistory: string[];
  t: (key: TranslationKey) => string;
}> = ({ trackingNumber, setTrackingNumber, handleSearch, loading, searchHistory, t }) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
    }
  };

  return (
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
            placeholder="Enter tracking number (e.g. PKG250001)"
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
            {loading ? 'Searching...' : 'Track Package'}
          </button>
        </div>
      </div>

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
  );
};

/**
 * ErrorMessage Component
 */
const ErrorMessage: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
        <span className="text-red-700">{message}</span>
      </div>
    </div>
  );
};

/**
 * TrackingDetailsCard Component
 */
const TrackingDetailsCard: React.FC<{
  trackingData: TrackingData;
}> = ({ trackingData }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Tracking Details</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
          <div className="flex items-center">
            <p className="font-medium font-mono text-lg">{trackingData.trackingNumber}</p>
            <button 
              onClick={() => copyToClipboard(trackingData.trackingNumber)} 
              className="ml-2 text-gray-500 hover:text-blue-600 transition-colors"
              title="Copy tracking number"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Type</p>
          <p className="font-medium capitalize">{trackingData.type}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">Current Status</p>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-md text-sm font-medium ${trackingData.currentStatus.color}`}>
              {trackingData.currentStatus.name}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{trackingData.currentStatus.customerMessage}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">Recipient</p>
          <p className="font-medium">{trackingData.recipient.name}</p>
          <p className="text-sm text-gray-600">{trackingData.recipient.address}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">Service</p>
          <p className="font-medium">{trackingData.service.type}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">Package Details</p>
          <div className="text-sm space-y-1">
            <p><span className="text-gray-600">Description:</span> {trackingData.package.description}</p>
            <p><span className="text-gray-600">Weight:</span> {trackingData.package.weight}</p>
            {trackingData.package.dimensions && (
              <p><span className="text-gray-600">Dimensions:</span> {trackingData.package.dimensions}</p>
            )}
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">Estimated Delivery</p>
          <p className="font-medium">{trackingData.service.estimatedDelivery}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * TrackingProgress Component
 */
const TrackingProgress: React.FC<{
  trackingData: TrackingData;
}> = ({ trackingData }) => {
  const { progress, currentStatus } = trackingData;

  const getIconComponent = (iconName: string) => {
    const IconComponent = ICON_MAP[iconName] || Clock;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Progress</h3>
        <div className="text-right">
          <p className="text-sm text-gray-500">{progress.currentStep} of {progress.totalSteps} steps</p>
          <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Current Status Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${currentStatus.color.replace('text-', 'bg-').replace('-800', '-100')}`}>
            {getIconComponent(currentStatus.icon)}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-gray-900">{currentStatus.name}</h4>
            </div>
            <p className="text-sm text-gray-600 mt-1">{currentStatus.customerMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * TimelineEvent Component
 */
const TimelineEvent: React.FC<{
  event: TrackingEvent;
  isFirst: boolean;
  isLast: boolean;
}> = ({ event, isFirst, isLast }) => {
  const getIconComponent = (iconName: string) => {
    const IconComponent = ICON_MAP[iconName] || Clock;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className="flex mb-6 last:mb-0">
      {/* Icon and connector line */}
      <div className="mr-4 relative">
        <div className={`p-3 rounded-full border-2 ${
          event.completed 
            ? 'bg-green-100 text-green-600 border-green-200' 
            : isFirst 
              ? 'bg-blue-100 text-blue-600 border-blue-200'
              : 'bg-gray-100 text-gray-400 border-gray-200'
        }`}>
          {getIconComponent(event.status.icon)}
        </div>
        {!isLast && (
          <div className={`absolute top-12 left-1/2 w-0.5 -translate-x-1/2 h-12 ${
            event.completed ? 'bg-green-300' : 'bg-gray-300'
          }`} />
        )}
      </div>
      
      {/* Event details */}
      <div className="flex-1 pb-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-gray-900">{event.status.name}</h4>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
              event.completed 
                ? 'bg-green-100 text-green-700' 
                : isFirst 
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
            }`}>
              {event.completed ? 'Completed' : isFirst ? 'Current' : 'Pending'}
            </span>
          </div>
          
          {/* Description */}
          <p className="text-sm text-gray-600 mb-3">{event.description}</p>
          
          {/* Details if available */}
          {event.details && (
            <div className="bg-gray-50 rounded-md p-3 mb-3">
              <p className="text-sm text-gray-700">{event.details}</p>
            </div>
          )}
          
          {/* Timestamp and location */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(event.timestamp).toLocaleString()}</span>
              </div>
              {event.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
            {event.estimatedDate && !event.completed && (
              <span className="text-blue-600 font-medium">
                Est: {event.estimatedDate}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * TrackingTimeline Component
 */
const TrackingTimeline: React.FC<{
  events: TrackingEvent[];
}> = ({ events }) => {
  return (
    <div className="mt-6">
      {events.map((event, index) => (
        <TimelineEvent
          key={event.id}
          event={event}
          isFirst={index === 0}
          isLast={index === events.length - 1}
        />
      ))}
    </div>
  );
};

/**
 * Main TrackingPage Component
 */
const TrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchInProgressRef = useRef<boolean>(false);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('trackingHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Professional search logic using TrackingService
  const performSearch = useCallback(async (searchId: string) => {
    if (!searchId.trim()) {
      setError("Please enter a tracking number");
      return;
    }

    if (searchInProgressRef.current) {
      return;
    }

    searchInProgressRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await TrackingService.trackByNumber(searchId.trim(), user?.id);
      
      if (!result.error && result.data) {
        setTrackingData(result.data);
        
        // Add to search history
        const newHistory = [searchId, ...searchHistory.filter(item => item !== searchId)].slice(0, 5);
        setSearchHistory(newHistory);
        localStorage.setItem('trackingHistory', JSON.stringify(newHistory));
      } else {
        setError(result.error || "Tracking number not found. Please check and try again.");
      }
    } catch (err) {
      console.error("Tracking error:", err);
      setError("Unable to retrieve tracking information. Please try again later.");
    } finally {
      setLoading(false);
      searchInProgressRef.current = false;
    }
  }, [searchHistory]);

  // Handle search functions
  const handleSearchWithId = useCallback((searchId: string) => {
    performSearch(searchId);
  }, [performSearch]);

  const handleSearch = useCallback(() => {
    performSearch(trackingNumber);
  }, [performSearch, trackingNumber]);

  // Handle URL parameters
  useEffect(() => {
    const trackingId = searchParams.get('id');
    if (trackingId && trackingId !== trackingNumber) {
      setTrackingNumber(trackingId);
      if (!searchInProgressRef.current) {
        handleSearchWithId(trackingId);
      }
    }
  }, [searchParams, handleSearchWithId, trackingNumber]);

  return (
    <div className="min-h-screen py-6 bg-transparent transition-colors duration-300">
      {/* Header */}
      <div className="mb-4 px-4 sm:px-10">
        <h1 className="text-2xl font-bold text-gray-900">
          Track Your Package
        </h1>
        <p className="text-gray-600">
          Enter your tracking number to get real-time updates
        </p>
      </div>

      {/* Search Form */}
      <div className="relative mb-6 px-5 sm:px-10"> 
        <SearchForm
          trackingNumber={trackingNumber}
          setTrackingNumber={setTrackingNumber}
          handleSearch={handleSearch}
          loading={loading}
          searchHistory={searchHistory}
          t={t}
        />

        {/* Error Message */}
        {error && <ErrorMessage message={error} />}

        {/* Tracking Details */}
        {trackingData && (
          <div className="space-y-6">
            {/* Main Tracking Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Side - Tracking Details Card */}
              <div className="lg:col-span-1">
                <TrackingDetailsCard trackingData={trackingData} />
              </div>
              
              {/* Right Side - Progress and Timeline */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-2">Tracking Progress</h2>
                <p className="text-sm text-gray-500 mb-4">Real-time updates on your {trackingData.type}</p>
                
                {/* Progress */}
                <TrackingProgress trackingData={trackingData} />
                
                {/* Timeline */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Tracking Timeline</h3>
                  <TrackingTimeline events={trackingData.events} />
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
