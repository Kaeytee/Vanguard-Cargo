/**
 * Tracking Page Component
 * 
 * This component allows users to track their shipments by entering a tracking number.
 * It displays detailed shipment information including status, timeline, and contact details.
 * 
 * @author Senior Software Engineer
 * @version 1.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation, type TranslationKey } from '../../lib/translations';
import { usePreferences } from '../../context/PreferencesProvider';
import { apiService, type ShipmentData } from '../../services/api';
import { AlertCircle, ArrowDownToLine, CheckCircle, Clock, Copy, Mail, MapPin, Phone, Plane, RefreshCw, Search, User } from 'lucide-react';

/**
 * Interface for tracking events
 * Each event represents a step in the shipment journey
 */
interface TrackingEvent {
  id: string;
  timestamp: string;
  location: string;
  status: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>; // Lucide icon component
  completed: boolean;
  imageUrl?: string | string[]; // Optional URL(s) for package image(s)
  imageAlt?: string | string[]; // Optional alt text for images
}

/**
 * Interface for shipment details
 * Contains all information about a shipment
 */
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
  completedSteps?: number; // Added to track progress for the progress bar
  totalSteps?: number; // Added to track total steps for the progress bar
}

/**
 * SearchForm Component
 * Handles the tracking number input and search functionality
 */
const SearchForm: React.FC<{
  trackingNumber: string;
  setTrackingNumber: (value: string) => void;
  handleSearch: () => void;
  loading: boolean;
  searchHistory: string[];
  t: (key: TranslationKey) => string;
}> = ({ trackingNumber, setTrackingNumber, handleSearch, loading, searchHistory, t }) => {
  // Handle Enter key press for search
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
  );
};

/**
 * ErrorMessage Component
 * Displays error messages
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
 * ShipmentDetailsCard Component
 * Displays the shipment details card with status and basic information
 */
const ShipmentDetailsCard: React.FC<{
  id: string;
  recipient: string;
  origin: string;
  destination: string;
  estimatedDelivery: string;
  status: string;
  getStatusColor: (status: string) => string;
}> = ({ id, recipient, origin, destination, estimatedDelivery, status, getStatusColor }) => {
  // Function to copy tracking number to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-4">Shipment Details</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Tracking ID</p>
          <div className="flex items-center">
            <p className="font-medium">{id}</p>
            <button 
              onClick={() => copyToClipboard(id)} 
              className="ml-2 text-gray-500 hover:text-blue-600 transition-colors"
              title="Copy tracking ID"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">Recipient</p>
          <p className="font-medium">{recipient}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">From</p>
          <p className="font-medium">{origin}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">To</p>
          <p className="font-medium">{destination}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">Estimated Delivery</p>
          <p className="font-medium">{new Date(estimatedDelivery).toLocaleDateString()}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">Current Status</p>
          <span className={`px-3 py-1 rounded-md text-sm font-medium ${getStatusColor(status)}`}>
            {status === 'in-transit' ? 'In Transit' : status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * ProgressStep Component
 * Represents a single step in the tracking progress
 */
const ProgressStep: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
  isLast?: boolean;
}> = ({ icon, label, isActive, isCompleted, isLast = false }) => {
  // Determine the appropriate styling based on step status
  const getStepStyle = () => {
    if (isActive) return "bg-blue-300 text-white border-blue-300";
    if (isCompleted) return "bg-blue-800 text-white border-blue-800";
    return "bg-gray-200 text-gray-400 border-gray-300";
  };

  // Define animation class for the icon
  const pulseAnimation = isActive ? 'animate-pulse' : '';
  
  // Create animation styles for the progress bar
  const progressCompleteAnimation = {
    animation: 'progressComplete 1.5s ease-out forwards',
    animationFillMode: 'forwards'
  };
  
  const progressPulseAnimation = {
    animation: 'progressPulse 2s infinite ease-in-out'
  };
  
  // Create animation styles for the icon
  const iconScaleAnimation = {
    animation: isActive ? 'scaleIcon 1.5s infinite alternate' : 'none'
  };
  
  // Add global animation styles to the document head once
  React.useEffect(() => {
    // Check if the style element already exists
    if (!document.getElementById('tracking-animations')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'tracking-animations';
      styleEl.innerHTML = `
        @keyframes progressComplete {
          0% { width: 0; }
          100% { width: 100%; }
        }
        
        @keyframes progressPulse {
          0% { width: 0; opacity: 0.7; }
          50% { width: 50%; opacity: 1; }
          100% { width: 0; opacity: 0.7; }
        }
        
        @keyframes scaleIcon {
          0% { transform: scale(1); }
          100% { transform: scale(1.2); }
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);
  
  return (
    <div className="flex flex-col items-center relative">
      {/* Animated icon container */}
      <div 
        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${getStepStyle()} transition-all duration-500 ease-in-out ${pulseAnimation}`}
      >
        <div style={isActive ? iconScaleAnimation : undefined}>
          {icon}
        </div>
      </div>
      <p className={`mt-2 text-xs font-medium ${isActive || isCompleted ? 'text-gray-800' : 'text-gray-500'} transition-all duration-300`}>
        {label}
      </p>
      {!isLast && (
        <div className="absolute top-5 left-16 w-full h-0.5 bg-gray-200 overflow-hidden">
          {isCompleted && (
            <div 
              className="h-full bg-red-600 transition-all duration-1000 ease-out" 
              style={{ 
                width: '100%', 
                height: '5px', 
                borderRadius: '10px',
                ...progressCompleteAnimation
              }} 
            />
          )}
          {isActive && !isCompleted && (
            <div 
              className="h-full bg-blue-300" 
              style={{ 
                width: '50%', 
                height: '5px', 
                borderRadius: '10px',
                ...progressPulseAnimation
              }} 
            />
          )}
        </div>
      )}
    </div>
  );
};

/**
 * TrackingProgress Component
 * Displays the tracking progress bar with steps
 */
const TrackingProgress: React.FC<{
  completedSteps: number;
  totalSteps: number;
  currentStatus: string;
}> = ({ completedSteps, totalSteps, currentStatus }) => {
  // Define the tracking steps
  const steps = [
    { label: "Pending", icon: <Clock className="w-5 h-5" /> },
    { label: "Received", icon: <ArrowDownToLine className="w-5 h-5" /> },
    { label: "In Transit", icon: <Plane className="w-5 h-5" /> },
    { label: "Arrived", icon: <MapPin className="w-5 h-5" /> },
    { label: "Delivered", icon: <CheckCircle className="w-5 h-5" /> }
  ];

  // Determine current active step based on status
  const getActiveStep = () => {
    switch (currentStatus.toLowerCase()) {
      case 'pending': return 0;
      case 'received': return 1;
      case 'in-transit': return 2;
      case 'arrived': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const activeStep = getActiveStep();

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Tracking Progress</h3>
        <p className="text-sm text-gray-500">{completedSteps} of {totalSteps} completed</p>
      </div>
      
      <div className="flex justify-between relative py-4">
        {steps.map((step, index) => (
          <ProgressStep
            key={index}
            icon={step.icon}
            label={step.label}
            isActive={index === activeStep}
            isCompleted={index < activeStep}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * ImageModal Component
 * Displays a full-size image or multiple images in a modal popup with animations
 * Supports gallery view for multiple images
 */
interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | string[];
  altText?: string | string[];
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageUrl, altText = 'Package Image' }) => {
  // Convert to array for consistent handling
  const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl];
  const captions = Array.isArray(altText) ? altText : Array(images.length).fill(altText);
  
  // State for current image index and loading state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Reset to first image when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);
  
  // Handle image load complete
  const handleImageLoad = () => {
    setIsLoading(false);
  };
  
  // Handle image load error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    // Fallback to a placeholder if image fails to load
    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
  };
  
  // Navigate to next image
  const goToNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };
  
  // Navigate to previous image
  const goToPrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };
  // Reference to the modal content for animation
  const modalContentRef = useRef<HTMLDivElement>(null);
  
  // State to control animation
  const [isClosing, setIsClosing] = useState(false);
  
  // Handle the close action with animation
  const handleClose = React.useCallback(() => {
    setIsClosing(true);
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Match this with the animation duration
  }, [onClose]);
  
  // Close modal when clicking outside the image
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Close modal when pressing Escape key
  useEffect(() => {
    // Add animation keyframes to document head
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes modalFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes modalFadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      
      @keyframes modalZoomIn {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      
      @keyframes modalZoomOut {
        from { transform: scale(1); opacity: 1; }
        to { transform: scale(0.95); opacity: 0; }
      }
    `;
    document.head.appendChild(styleElement);
    
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.head.removeChild(styleElement);
      // Restore body scrolling when modal is closed
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, handleClose]);

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  // Animation styles
  const backdropAnimation = isClosing ? 
    { animation: 'modalFadeOut 0.3s ease-out forwards' } : 
    { animation: 'modalFadeIn 0.3s ease-out forwards' };
    
  const contentAnimation = isClosing ? 
    { animation: 'modalZoomOut 0.3s ease-out forwards' } : 
    { animation: 'modalZoomIn 0.3s ease-out forwards' };

  // Get current image and caption
  const currentImage = images[currentIndex];
  const currentCaption = captions[currentIndex];
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" 
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      style={backdropAnimation}
    >
      <div 
        ref={modalContentRef}
        className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-lg bg-white shadow-xl"
        style={contentAnimation}
      >
        {/* Close button */}
        <button 
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white bg-opacity-75 text-gray-800 hover:bg-opacity-100 hover:text-red-600 transition-colors z-10"
          onClick={handleClose}
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        {/* Image container with loading indicator */}
        <div className="relative bg-gray-100 flex items-center justify-center" style={{ minHeight: '300px', minWidth: '300px' }}>
          {/* Loading spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Main image */}
          <img 
            src={currentImage} 
            alt={typeof currentCaption === 'string' ? currentCaption : 'Package Image'} 
            className={`max-h-[80vh] max-w-full object-contain transition-opacity duration-300 ${isLoading ? 'opacity-30' : 'opacity-100'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          {/* Navigation buttons - only show if there are multiple images */}
          {images.length > 1 && (
            <>
              {/* Previous button */}
              <button 
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white bg-opacity-75 shadow-md flex items-center justify-center hover:bg-opacity-100 transition-all z-20"
                onClick={goToPrevImage}
                aria-label="Previous image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              
              {/* Next button */}
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white bg-opacity-75 shadow-md flex items-center justify-center hover:bg-opacity-100 transition-all z-20"
                onClick={goToNextImage}
                aria-label="Next image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </>
          )}
          
          {/* Image counter - only show if there are multiple images */}
          {images.length > 1 && (
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-xs">
              {currentIndex + 1} / {images.length}
            </div>
          )}
          
          {/* Caption */}
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-center text-sm">
            {typeof currentCaption === 'string' ? currentCaption : `Package Image ${currentIndex + 1}`}
          </div>
        </div>
        
        {/* Thumbnail gallery - only show if there are multiple images */}
        {images.length > 1 && (
          <div className="bg-gray-100 p-2 flex items-center justify-center gap-2 overflow-x-auto">
            {images.map((img, idx) => (
              <div 
                key={idx}
                className={`w-16 h-16 flex-shrink-0 cursor-pointer border-2 ${idx === currentIndex ? 'border-blue-500' : 'border-transparent'}`}
                onClick={() => {
                  setIsLoading(true);
                  setCurrentIndex(idx);
                }}
              >
                <img 
                  src={img} 
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100?text=Image';
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * TimelineEvent Component
 * Displays a single event in the tracking timeline
 * Supports displaying multiple package images with gallery view
 */
const TimelineEvent: React.FC<{
  event: TrackingEvent;
  isFirst: boolean;
  isLast: boolean;
}> = ({ event, isFirst, isLast }) => {
  // State to control the image modal
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  
  // Process image URLs - convert to array if it's a single string
  const imageUrls = event.imageUrl 
    ? (Array.isArray(event.imageUrl) ? event.imageUrl : [event.imageUrl]) 
    : ['/package-image.jpg'];
  
  // Process image alt texts - convert to array if it's a single string
  const imageAlts = event.imageAlt
    ? (Array.isArray(event.imageAlt) ? event.imageAlt : [event.imageAlt])
    : imageUrls.map((_, idx) => `Package ${idx + 1} for ${event.status} at ${event.location}`);
  
  // Get the first image for the thumbnail
  const thumbnailImage = imageUrls[0];
  
  // Check if we have multiple images
  const hasMultipleImages = imageUrls.length > 1;
  
  return (
    <div className="flex mb-3 last:mb-0">
      {/* Icon and connector line */}
      <div className="mr-4 relative">
        <div className={`p-2 rounded-full ${event.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
          {React.createElement(event.icon, { className: "w-5 h-5" })}
        </div>
        {!isLast && (
          <div className="absolute top-9 left-1/2 w-1 -translate-x-1/2 bg-gray-300 h-8" />
        )}
      </div>
      
      {/* Event details */}
      <div className={`pb-4 ${isLast ? 'pb-0' : ''}`}>
        <div className="flex items-center">
          <h4 className="font-medium text-gray-900 mr-2">{event.status}</h4>
          <span className={`px-2 py-0.5 text-xs rounded-full ${isFirst ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
            {event.completed ? 'Completed' : 'Pending'}
          </span>
        </div>
        
        <p className="text-sm text-gray-500 mt-1">{event.description}</p>
        
        <div className="flex items-center mt-2">
          <p className="text-xs text-gray-500">{event.timestamp}</p>
        </div>
        
        {event.location && (
          <p className="text-sm text-gray-700 mt-1">{event.location}</p>
        )}
        
        {/* Image for package if available */}
        {event.status.toLowerCase().includes('received') && (
          <div className="mt-3">
            <div 
              className="relative group w-24 h-24 rounded-md border border-gray-200 overflow-hidden cursor-pointer"
              onClick={() => setIsImageModalOpen(true)}
            >
              {/* Package image thumbnail */}
              <img 
                src={thumbnailImage} 
                alt="Package" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                onError={(e) => {
                  // Fallback to a placeholder if image fails to load
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100?text=Package';
                }}
              />
              
              {/* Overlay with zoom icon on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-white bg-opacity-0 group-hover:bg-opacity-75 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                </div>
              </div>
              
              {/* Badge for multiple images */}
              {hasMultipleImages && (
                <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {imageUrls.length}
                </div>
              )}
            </div>
            
            {/* Click to view text */}
            <p 
              className="text-xs text-gray-500 mt-1 cursor-pointer hover:text-blue-500 transition-colors"
              onClick={() => setIsImageModalOpen(true)}
            >
              Click to view {hasMultipleImages ? 'images' : 'full image'}
            </p>
            
            {/* Image Modal with gallery support */}
            <ImageModal 
              isOpen={isImageModalOpen}
              onClose={() => setIsImageModalOpen(false)}
              imageUrl={imageUrls}
              altText={imageAlts}
            />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * TrackingTimeline Component
 * Displays the timeline of tracking events
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
 * Utility function to add days to a date
 * @param date - The base date
 * @param days - Number of days to add
 * @returns A new date with the specified days added
 */
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Main TrackingPage Component
 * Orchestrates the entire tracking page functionality
 */
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
  // This matches the tracking progress steps shown in the UI: Pending, Received, In Transit, Arrived, Delivered
  /**
   * Generate tracking events based on shipment data
   * @param shipment - The shipment data object
   * @returns Array of tracking events with appropriate icons, descriptions, and image URLs
   */
  const generateTrackingEvents = useCallback((shipment: ShipmentData): TrackingEvent[] => {
    const events: TrackingEvent[] = [];
    const createdDate = new Date(shipment.created);
    
    /**
     * Function to get image URLs based on shipment ID and event type
     * In a real application, this would fetch from an API endpoint
     * @param eventType - The type of event (received, in-transit, etc)
     * @returns Array of image URLs or single URL string
     */
    const getImageUrls = (eventType: string): string | string[] => {
      // In a real application, this would construct URLs to the API endpoint
      // that serves package images based on shipment ID and event type
      // Example: return [`${apiService.apiBaseUrl}/shipments/${shipment.id}/images/${eventType}/1`, ...]
      
      // For now, we'll use placeholder images
      if (eventType === 'received') {
        // If shipment has image URLs as an array, return them
        if (shipment.imageUrls && Array.isArray(shipment.imageUrls)) {
          return shipment.imageUrls;
        }
        
        // If shipment has a single imageUrl, return it
        if (shipment.imageUrl) {
          return shipment.imageUrl;
        }
        
        // Otherwise return multiple placeholder images for demo purposes
        return [
          '/package-image.jpg',
          'https://via.placeholder.com/800x600?text=Package+Front',
          'https://via.placeholder.com/800x600?text=Package+Side',
          'https://via.placeholder.com/800x600?text=Package+Label'
        ];
      }
      return '';
    };
    
    /**
     * Function to get image alt texts based on event type
     * @param eventType - The type of event
     * @returns Array of alt text strings or single alt text string
     */
    const getImageAlts = (eventType: string): string | string[] => {
      if (eventType === 'received') {
        const imageUrls = getImageUrls(eventType);
        if (Array.isArray(imageUrls)) {
          return imageUrls.map((_, idx) => {
            const views = ['Front view', 'Side view', 'Top view', 'Label view'];
            return `Package ${views[idx] || idx + 1} at ${shipment.origin || 'origin facility'}`;
          });
        }
        return `Package at ${shipment.origin || 'origin facility'}`;
      }
      return '';
    };
    
    // Always add the initial "Pending" event
    events.push({
      id: "1",
      timestamp: `${shipment.created} 10:30AM`,
      location: "Online Platform",
      status: "Pending",
      description: "Request has been sent successfully",
      icon: Clock,
      completed: true
    });
    
    // Add subsequent events based on the current shipment status
    switch (shipment.status.toLowerCase()) {
      case "pending":
        break;
        
      case "received":
      case "in-transit":
        // Package received at origin
        events.push({
          id: "2",
          timestamp: addDays(createdDate, 1).toLocaleDateString() + " 09:15AM",
          location: "USA facility",
          status: "Received",
          description: "Package received at origin facility",
          icon: ArrowDownToLine,
          completed: true,
          imageUrl: getImageUrls('received'), // Add image URL(s) for received event
          imageAlt: getImageAlts('received') // Add image alt text(s) for received event
        });
        
        // If status is in-transit, add the in-transit event
        if (shipment.status.toLowerCase() === "in-transit") {
          events.push({
            id: "3",
            timestamp: addDays(createdDate, 3).toLocaleDateString() + " 02:30PM",
            location: "International Transit",
            status: "In Transit",
            description: "Package in international transit",
            icon: Plane,
            completed: true
          });
        }
        break;
        
      case "arrived":
        // Package received at origin
        events.push({
          id: "2",
          timestamp: addDays(createdDate, 1).toLocaleDateString() + " 09:15AM",
          location: "USA facility",
          status: "Received",
          description: "Package received at origin facility",
          icon: ArrowDownToLine,
          completed: true,
          imageUrl: getImageUrls('received'), // Add image URL(s) for received event
          imageAlt: getImageAlts('received') // Add image alt text(s) for received event
        });
        
        // Package in transit
        events.push({
          id: "3",
          timestamp: addDays(createdDate, 3).toLocaleDateString() + " 02:30PM",
          location: "International Transit",
          status: "In Transit",
          description: "Package in international transit",
          icon: Plane,
          completed: true
        });
        
        // Package arrived at destination
        events.push({
          id: "4",
          timestamp: addDays(createdDate, 5).toLocaleDateString() + " 11:45AM",
          location: shipment.destination,
          status: "Arrived",
          description: "Package arrived at destination facility",
          icon: MapPin,
          completed: true
        });
        break;
        
      case "delivered":
        // Package received at origin
        events.push({
          id: "2",
          timestamp: addDays(createdDate, 1).toLocaleDateString() + " 09:15AM",
          location: "USA facility",
          status: "Received",
          description: "Package received at origin facility",
          icon: ArrowDownToLine,
          completed: true,
          imageUrl: getImageUrls('received'), // Add image URL(s) for received event
          imageAlt: getImageAlts('received') // Add image alt text(s) for received event
        });
        
        // Package in transit
        events.push({
          id: "3",
          timestamp: addDays(createdDate, 3).toLocaleDateString() + " 02:30PM",
          location: "International Transit",
          status: "In Transit",
          description: "Package in international transit",
          icon: Plane,
          completed: true
        });
        
        // Package arrived at destination
        events.push({
          id: "4",
          timestamp: addDays(createdDate, 5).toLocaleDateString() + " 11:45AM",
          location: shipment.destination,
          status: "Arrived",
          description: "Package arrived at destination facility",
          icon: MapPin,
          completed: true
        });
        
        // Package delivered
        events.push({
          id: "5",
          timestamp: addDays(createdDate, 6).toLocaleDateString() + " 04:20PM",
          location: shipment.destination,
          status: "Delivered",
          description: "Package successfully delivered",
          icon: CheckCircle,
          completed: true
        });
        break;
    }
    
    return events;
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
        
        // Calculate completed steps based on status
        const getCompletedSteps = (status: string): number => {
          switch (status) {
            case 'pending': return 1; // Only request created
            case 'transit': return 2; // Request created + package received
            case 'arrived': return 3; // Previous + in transit
            case 'received': 
            case 'delivered': return 5; // All steps completed
            default: return 1;
          }
        };
        
        // Generate tracking events
        const events = generateTrackingEvents(response.data);
        
        // Create tracking data with progress information
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
          events: events,
          completedSteps: getCompletedSteps(response.data.status),
          totalSteps: 5 // Total steps in tracking process
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

  /**
   * Handle search button click
   * Triggers the search for a shipment using the current tracking number
   */
  const handleSearch = async () => {
    await performSearch(trackingNumber);
  };

  /**
   * Get appropriate color classes for different shipment statuses
   * @param status - The shipment status
   * @returns Tailwind CSS classes for text and background colors
   */
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-[#1a2b6d] bg-[#e6eaf2]';
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
    <div className="min-h-screen py-6 bg-gray-100 transition-colors duration-300">
        {/* Header */}
        <div className="mb-4 px-4 sm:px-10">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('trackYourPackage')}
          </h1>
          <p className="text-gray-600">
            {t('enterTrackingNumber')}</p>
        </div>

        {/* Search Form Component */}
        <div className="relative mb-6 px-5 sm:px-10"> 
        <SearchForm
          trackingNumber={trackingNumber}
          setTrackingNumber={setTrackingNumber}
          handleSearch={handleSearch}
          loading={loading}
          searchHistory={searchHistory}
          t={t}
        />

        {/* Error Message Component */}
        {error && <ErrorMessage message={error} />}

        {/* Shipment Details */}
        {shipmentData && (
          <div className="space-y-6">
            {/* Main Shipment Details Card and Tracking Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Side - Shipment Details Card */}
              <div className="lg:col-span-1">
                <ShipmentDetailsCard
                  id={shipmentData.id}
                  recipient={shipmentData.recipient.name}
                  origin={shipmentData.origin}
                  destination={shipmentData.destination}
                  estimatedDelivery={shipmentData.estimatedDelivery}
                  status={shipmentData.status}
                  getStatusColor={getStatusColor}
                />
              </div>
              
              {/* Right Side - Tracking Progress and Timeline */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-2">Tracking Progress</h2>
                <p className="text-sm text-gray-500 mb-4">Receive Updates on your shipment</p>
                
                {/* Tracking Progress Bar */}
                <TrackingProgress
                  completedSteps={shipmentData.completedSteps || 0}
                  totalSteps={shipmentData.totalSteps || 5}
                  currentStatus={shipmentData.status}
                />
                
                {/* Tracking Timeline */}
                <TrackingTimeline events={shipmentData.events} />
              </div>
            </div>
            
            {/* Additional Shipment Details - Package and Contact Info */}
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
