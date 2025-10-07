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
import { motion } from 'framer-motion';
// Translation imports removed as not currently used
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
 * Apple-Style SearchForm Component
 */
const SearchForm: React.FC<{
  trackingNumber: string;
  setTrackingNumber: (value: string) => void;
  handleSearch: () => void;
  loading: boolean;
  searchHistory: string[];
}> = ({ trackingNumber, setTrackingNumber, handleSearch, loading, searchHistory }) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl border border-gray-200/50 shadow-2xl shadow-gray-200/50 p-6 sm:p-8 mb-8"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30"></div>
      <div className="relative">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="tracking-input" className="block text-sm font-medium text-gray-700 mb-3">
              Tracking Number
            </label>
            <input
              id="tracking-input"
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter tracking number (e.g. PKG250001)"
              className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base font-light shadow-sm"
              disabled={loading}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-blue-200 font-medium"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              {loading ? 'Searching...' : 'Track'}
            </button>
          </div>
        </div>

        {searchHistory.length > 0 && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-600 mb-3">Recent Searches</label>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((item, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setTrackingNumber(item)}
                  className="px-4 py-2 text-sm bg-gradient-to-br from-gray-50 to-white backdrop-blur-sm text-gray-700 rounded-full hover:from-gray-100 hover:to-gray-50 transition-all border border-gray-200/50 shadow-sm font-medium"
                >
                  {item}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Apple-Style ErrorMessage Component
 */
const ErrorMessage: React.FC<{ message: string }> = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50/80 to-rose-50/80 backdrop-blur-xl border border-red-200/50 p-5 mb-6 shadow-lg shadow-red-100/50"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-red-100/20 to-transparent"></div>
      <div className="relative flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-200">
          <AlertCircle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm sm:text-base text-red-900 font-medium leading-relaxed">{message}</p>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Apple-Style TrackingDetailsCard Component
 */
const TrackingDetailsCard: React.FC<{
  trackingData: TrackingData;
}> = ({ trackingData }) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl border border-gray-200/50 shadow-2xl shadow-gray-200/50 p-6 sm:p-8"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20"></div>
      <div className="relative">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Tracking Details</h2>
        
        <div className="space-y-5">
          <div className="p-4 bg-gradient-to-br from-gray-50/80 to-white/80 rounded-2xl border border-gray-200/50">
            <p className="text-xs font-medium text-gray-500 mb-2">Tracking Number</p>
            <div className="flex items-center justify-between">
              <p className="font-mono text-base sm:text-lg font-semibold text-gray-900">{trackingData.trackingNumber}</p>
              <button 
                onClick={() => copyToClipboard(trackingData.trackingNumber)} 
                className={`p-2 rounded-xl transition-all ${
                  copied 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
                title="Copy tracking number"
              >
                {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-gray-50/80 to-white/80 rounded-2xl border border-gray-200/50">
            <p className="text-xs font-medium text-gray-500 mb-2">Type</p>
            <p className="font-medium text-gray-900 capitalize">{trackingData.type}</p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-blue-50/60 to-indigo-50/60 rounded-2xl border border-blue-200/50">
            <p className="text-xs font-medium text-gray-500 mb-3">Current Status</p>
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-md ${trackingData.currentStatus.color}`}>
                {trackingData.currentStatus.name}
              </span>
            </div>
            <p className="text-sm text-gray-700 font-light leading-relaxed">{trackingData.currentStatus.customerMessage}</p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-gray-50/80 to-white/80 rounded-2xl border border-gray-200/50">
            <p className="text-xs font-medium text-gray-500 mb-2">Recipient</p>
            <p className="font-semibold text-gray-900">{trackingData.recipient.name}</p>
            <p className="text-sm text-gray-600 font-light mt-1">{trackingData.recipient.address}</p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-gray-50/80 to-white/80 rounded-2xl border border-gray-200/50">
            <p className="text-xs font-medium text-gray-500 mb-2">Service</p>
            <p className="font-medium text-gray-900">{trackingData.service.type}</p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-gray-50/80 to-white/80 rounded-2xl border border-gray-200/50">
            <p className="text-xs font-medium text-gray-500 mb-3">Package Details</p>
            <div className="space-y-2 text-sm">
              <p className="flex items-start">
                <span className="text-gray-500 font-medium min-w-[100px]">Description:</span>
                <span className="text-gray-900 font-light">{trackingData.package.description}</span>
              </p>
              <p className="flex items-start">
                <span className="text-gray-500 font-medium min-w-[100px]">Weight:</span>
                <span className="text-gray-900 font-light">{trackingData.package.weight}</span>
              </p>
              {trackingData.package.dimensions && (
                <p className="flex items-start">
                  <span className="text-gray-500 font-medium min-w-[100px]">Dimensions:</span>
                  <span className="text-gray-900 font-light">{trackingData.package.dimensions}</span>
                </p>
              )}
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-green-50/60 to-emerald-50/60 rounded-2xl border border-green-200/50">
            <p className="text-xs font-medium text-gray-500 mb-2">Estimated Delivery</p>
            <p className="font-semibold text-gray-900">{trackingData.service.estimatedDelivery}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Apple-Style Circular Progress Ring Component
 */
const CircularProgress: React.FC<{ percentage: number }> = ({ percentage }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="url(#gradient)"
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-semibold text-gray-900">{Math.round(percentage)}%</div>
          <div className="text-xs text-gray-500 font-medium">Complete</div>
        </div>
      </div>
    </div>
  );
};

/**
 * Apple-Style TrackingProgress Component
 */
const TrackingProgress: React.FC<{
  trackingData: TrackingData;
}> = ({ trackingData }) => {
  const { progress, currentStatus } = trackingData;

  const getIconComponent = (iconName: string) => {
    const IconComponent = ICON_MAP[iconName] || Clock;
    return <IconComponent className="w-6 h-6" />;
  };

  return (
    <div className="mb-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
        <div className="text-center sm:text-left">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Progress</h3>
          <p className="text-sm text-gray-600 font-light">{progress.currentStep} of {progress.totalSteps} milestones completed</p>
        </div>
        <CircularProgress percentage={progress.percentage} />
      </div>
      
      {/* Current Status Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 backdrop-blur-xl border border-blue-200/50 p-6 shadow-2xl shadow-blue-100/50"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-transparent"></div>
        <div className="relative flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
            {getIconComponent(currentStatus.icon)}
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">{currentStatus.name}</h4>
            <p className="text-sm text-gray-700 font-light leading-relaxed">{currentStatus.customerMessage}</p>
          </div>
        </div>
      </motion.div>
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
    return <IconComponent className="w-5 h-5 text-white" />;
  };

  const getGradient = () => {
    if (event.completed) return 'from-green-500 to-emerald-600';
    if (isFirst) return 'from-blue-500 to-indigo-600';
    return 'from-gray-300 to-gray-400';
  };

  const getBadgeColor = () => {
    if (event.completed) return 'bg-green-100 text-green-700';
    if (isFirst) return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex mb-8 last:mb-0"
    >
      {/* Icon and connector line */}
      <div className="mr-5 relative">
        <div className={`w-14 h-14 bg-gradient-to-br ${getGradient()} rounded-2xl flex items-center justify-center shadow-xl ${event.completed ? 'shadow-green-200' : isFirst ? 'shadow-blue-200' : 'shadow-gray-200'}`}>
          {getIconComponent(event.status.icon)}
        </div>
        {!isLast && (
          <div className={`absolute top-16 left-1/2 w-1 -translate-x-1/2 h-12 rounded-full ${
            event.completed ? 'bg-gradient-to-b from-green-300 to-green-200' : 'bg-gradient-to-b from-gray-200 to-gray-100'
          }`} />
        )}
      </div>
      
      {/* Event details */}
      <div className="flex-1 pb-2">
        <div className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl border border-gray-200/50 p-5 sm:p-6 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 via-transparent to-transparent"></div>
          <div className="relative">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900">{event.status.name}</h4>
              <span className={`px-3 py-1 text-xs rounded-full font-semibold ${getBadgeColor()} shadow-sm`}>
                {event.completed ? 'Completed' : isFirst ? 'Current' : 'Pending'}
              </span>
            </div>
            
            {/* Description */}
            <p className="text-sm sm:text-base text-gray-700 font-light leading-relaxed mb-4">{event.description}</p>
            
            {/* Details if available */}
            {event.details && (
              <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/60 rounded-2xl p-4 mb-4 border border-blue-200/50">
                <p className="text-sm text-gray-800 font-light leading-relaxed">{event.details}</p>
              </div>
            )}
            
            {/* Timestamp and location */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-600">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-medium">{new Date(event.timestamp).toLocaleString()}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="font-medium">{event.location}</span>
                  </div>
                )}
              </div>
              {event.estimatedDate && !event.completed && (
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1.5 rounded-full">
                  <span className="text-blue-700 font-semibold">Est: {event.estimatedDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
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
  // Translation hook removed as not currently used
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Apple-Style Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 mb-4 tracking-tight">
            Track Your Package
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
            Enter your tracking number to get real-time updates on your shipment
          </p>
        </motion.div>

        {/* Search Form */}
        <div className="relative mb-6"> 
        <SearchForm
          trackingNumber={trackingNumber}
          setTrackingNumber={setTrackingNumber}
          handleSearch={handleSearch}
          loading={loading}
          searchHistory={searchHistory}
        />

        {/* Error Message */}
        {error && <ErrorMessage message={error} />}

        {/* Apple-Style Tracking Details */}
        {trackingData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-8"
          >
            {/* Main Tracking Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Side - Tracking Details Card */}
              <div className="lg:col-span-1">
                <TrackingDetailsCard trackingData={trackingData} />
              </div>
              
              {/* Right Side - Progress and Timeline */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl border border-gray-200/50 shadow-2xl shadow-gray-200/50 p-6 sm:p-8 lg:p-10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 via-transparent to-blue-50/20"></div>
                <div className="relative">
                  <div className="mb-6">
                    <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">Tracking Progress</h2>
                    <p className="text-sm sm:text-base text-gray-600 font-light">Real-time updates on your {trackingData.type}</p>
                  </div>
                  
                  {/* Progress */}
                  <TrackingProgress trackingData={trackingData} />
                  
                  {/* Timeline */}
                  <div className="mt-10">
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">Tracking Timeline</h3>
                    <TrackingTimeline events={trackingData.events} />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
