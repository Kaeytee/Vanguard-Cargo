import React, { useState, useEffect } from 'react'
import { Copy, MapPin, Info, Check, AlertTriangle, ShoppingCart, X, Send } from 'lucide-react';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { motion } from "framer-motion";
import PackageIntakeWidget from '../../components/PackageIntakeWidget';
import { addressService, type USShippingAddress } from '../../services/addressService';
import { supabase } from '../../lib/supabase';
// Removed unused import
import shopImage from '../../assets/shop.jpg';


const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [usAddress, setUsAddress] = useState<USShippingAddress | null>(null);
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});
  
  // Direct Purchase Modal State
  const [showDirectPurchaseModal, setShowDirectPurchaseModal] = useState(false);
  const [directPurchaseNote, setDirectPurchaseNote] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Use profile from AuthContext instead of separate state
  // Extract first name from profile or user email
  const firstName = profile?.firstName || user?.email?.split('@')[0] || 'User';

  // Debug: Log profile and user on mount
  useEffect(() => {
    console.log('👤 Dashboard - User & Profile:', {
      hasUser: !!user,
      hasProfile: !!profile,
      userId: user?.id,
      profileSuiteNumber: profile?.suite_number,
      profile
    });
  }, [user, profile]);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // Fetch user's US shipping address
        console.log('📍 Fetching US address for user:', user.id);
        const addressResult = await addressService.getUserAddress(user.id);
        
        // Handle different scenarios
        if (addressResult.error) {
          // Actual error occurred
          console.error('❌ Error fetching address:', addressResult.error);
        } else if (addressResult.data) {
          // Address found successfully
          console.log('✅ US Address fetched:', addressResult.data);
          setUsAddress(addressResult.data);
        } else {
          // No address found (not an error - user needs to be assigned one)
          console.log('ℹ️ No address assigned to user yet');
          setUsAddress(null);
        }
      } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, [user]);
// Popular brands data
const popularBrands = [
  {
    name: "Amazon",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    category: "Everything",
    url: "https://www.amazon.com"
  },
  {
    name: "Nike",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
    category: "Sportswear",
    url: "https://www.nike.com"
  },
  {
    name: "Apple",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    category: "Electronics",
    url: "https://www.apple.com"
  },
  {
    name: "Samsung",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Samsung-Logo-700x394.png",
    category: "Electronics",
    url: "https://www.samsung.com"
  },
  {
    name: "Microsoft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    category: "Technology",
    url: "https://www.microsoft.com"
  },
  {
    name: "Adidas",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
    category: "Sportswear",
    url: "https://www.adidas.com"
  },
  {
    name: "eBay",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg",
    category: "Marketplace",
    url: "https://www.ebay.com"
  },
  {
    name: "Walmart",
    logo: "data:image/png;base64,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",
    category: "Retail",
    url: "https://www.walmart.com"
  },
  {
    name: "Target",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Target_logo.svg",
    category: "Retail",
    url: "https://www.target.com"
  },
  {
    name: "Costco",
    logo: "data:image/png;base64,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",
    category: "Wholesale",
    url: "https://www.costco.com"
  },
  {
    name: "Zara",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg",
    category: "Fashion",
    url: "https://www.zara.com"
  },
  {
    name: "H&M",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg",
    category: "Fashion",
    url: "https://www2.hm.com"
  }
];

  // Copy All functionality disabled - use individual copy buttons instead
  
  const copyToClipboard = async (text: string, key: string) => {
    console.log(`📋 Attempting to copy ${key}:`, text);
    
    try {
      // Check if clipboard API is available
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not available');
      }

      await navigator.clipboard.writeText(text);
      console.log(`✅ ${key} copied successfully`);
      
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error(`❌ Failed to copy ${key}:`, err);
      
      // Fallback: try using execCommand
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        console.log(`✅ ${key} copied using fallback method`);
        setCopiedStates(prev => ({ ...prev, [key]: true }));
        setTimeout(() => {
          setCopiedStates(prev => ({ ...prev, [key]: false }));
        }, 2000);
      } catch (fallbackErr) {
        console.error(`❌ Fallback copy also failed for ${key}:`, fallbackErr);
        alert('Failed to copy. Please try again or copy manually.');
      }
    }
  };

  // Handle direct purchase request submission
  const handleDirectPurchaseRequest = async () => {
    if (!user || !profile) {
      alert('Please sign in to request a direct purchase');
      return;
    }

    if (!directPurchaseNote.trim()) {
      alert('Please provide details about what you want us to purchase');
      return;
    }

    setIsSubmittingRequest(true);

    try {
      // Call the Supabase Edge Function for direct purchase
      const { data, error } = await supabase.functions.invoke('direct-purchase', {
        body: {
          name: `${profile.firstName || 'User'} ${profile.lastName || 'Name'}`,
          email: profile.email || user.email,
          phone: profile.phone || 'Not provided',
          suite_number: profile.suite_number || 'Not assigned',
          note: directPurchaseNote.trim(),
          user_id: user.id
        }
      });

      if (error) {
        console.error('❌ Error submitting direct purchase request:', error);
        alert('Failed to submit your request. Please try again or contact support.');
        return;
      }

      console.log('✅ Direct purchase request submitted successfully:', data);
      
      // Reset form and close modal
      setDirectPurchaseNote('');
      setShowDirectPurchaseModal(false);
      
      alert('Your direct purchase request has been submitted successfully! Our team will contact you shortly.');
      
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      alert('An unexpected error occurred. Please try again or contact support.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Apple-Style Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 sm:mb-16 text-center"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 mb-4 tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 font-light max-w-2xl mx-auto">
            Manage your packages and track shipments with ease
          </p>
        </motion.div>

        {/* Apple-Style Frosted Glass Alert */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-10 sm:mb-12"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50/80 via-white/80 to-orange-50/80 backdrop-blur-xl border border-amber-200/50 shadow-xl shadow-amber-100/50">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100/20 to-transparent"></div>
            <div className="relative p-4 sm:p-8 lg:p-10">
              <div className="flex items-start gap-3 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
                    <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
                    Complete Address Required
                  </h3>
                  <p className="text-sm sm:text-lg text-gray-600 mb-4 sm:mb-6 font-light leading-relaxed">
                    To ensure successful delivery, please follow these guidelines when shopping online
                  </p>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                      </div>
                      <p className="text-xs sm:text-base text-gray-700 leading-relaxed">
                        <span className="font-semibold text-gray-900">Include your suite number</span> — Always add "Vanguard Cargo LLC" followed by your unique suite number
                      </p>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                      </div>
                      <p className="text-xs sm:text-base text-gray-700 leading-relaxed">
                        <span className="font-semibold text-gray-900">Use complete address</span> — Enter all address fields exactly as shown below
                      </p>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                      </div>
                      <p className="text-xs sm:text-base text-gray-700 leading-relaxed">
                        <span className="font-semibold text-gray-900">Don't skip any fields</span> — Missing information may delay or prevent delivery
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-amber-200/50">
                    <p className="text-xs sm:text-base text-amber-900 font-semibold text-center leading-relaxed">
                      Incomplete addresses may result in package rejection or return to sender
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      {/* Dashboard Widgets */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Package Intake Widget */}
        <div>
          <PackageIntakeWidget />
        </div>
        
        {/* WhatsApp Status Widget */}
        {/* <div>
          <WhatsAppStatusWidget />
        </div> */}
      </div>

      {/* Apple-Style How It Works Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-2xl shadow-gray-200/50 p-8 sm:p-10 lg:p-14 mb-12"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30"></div>
        <div className="relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
              Your personal US shipping address is ready. Shop from any US store and have packages delivered to your Vanguard Cargo address.
            </p>
            
            {/* Direct Purchase Button */}
            <div className="mt-8 flex justify-center">
              <motion.button
                onClick={() => setShowDirectPurchaseModal(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-2xl shadow-xl shadow-green-200 transition-all duration-300 text-sm sm:text-base"
              >
                <ShoppingCart className="w-5 h-5" />
                Can't Shop Yourself? We'll Do It For You!
              </motion.button>
            </div>
          </div>

          {/* Steps Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 max-w-6xl mx-auto px-4 sm:px-0">
            {/* Step 1 - Shop Online */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center w-full"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl flex items-center justify-center mb-4 sm:mb-6 shadow-2xl shadow-red-200">
                <span className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white">1</span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3 px-4">
                Shop Your Favorite Stores
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 font-light mb-4 sm:mb-6 max-w-sm leading-relaxed px-4">
                Browse and purchase from thousands of US online retailers
              </p>
              <div className="w-full max-w-[280px] sm:max-w-xs px-4">
                <img 
                  src={shopImage} 
                  alt="Shop online illustration" 
                  className="w-full h-auto object-contain rounded-2xl shadow-lg"
                />
              </div>
            </motion.div>

            {/* Step 2 - Use Address */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center w-full"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-4 sm:mb-6 shadow-2xl shadow-blue-200">
                <span className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white">2</span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3 px-4">
                Use Your US Address
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 font-light mb-4 sm:mb-6 max-w-sm leading-relaxed px-4">
                Enter your Vanguard Cargo address during checkout
              </p>
              <div className="w-full max-w-full sm:max-w-md mx-auto bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-6">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Info className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-blue-900 text-left font-light leading-relaxed">
                    <span className="font-medium">Quick Tip:</span> Use the copy buttons below to easily paste your address
                  </p>
                </div>
              </div>
              {/* Apple-Style Frosted Glass Address Card */}
              <div className="w-full max-w-full sm:max-w-md mx-auto relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/60 backdrop-blur-xl border border-gray-200/50 shadow-2xl shadow-gray-200/50 p-4 sm:p-5 md:p-7">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200/50">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <span className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">Your US Address</span>
                    </div>
                    <button
                      disabled
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all shadow-lg opacity-0 pointer-events-none invisible"
                      style={{ display: 'none' }}
                    >
                      <Copy className="w-4 h-4" />
                      Copy All
                    </button>
                  </div>
              
                  <div className="space-y-2 sm:space-y-3">
                    {/* Name */}
                    <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-50/80 to-white/80 hover:from-gray-100/80 hover:to-white/80 transition-all border border-gray-200/50">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-xs font-medium text-gray-500 mb-1">Name</p>
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-red-600 break-words">
                          Vanguard Cargo LLC <br />({profile?.suite_number})
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(
                          `Vanguard Cargo LLC (${profile?.suite_number || ''})`,
                          'name'
                        )}
                        className="ml-2 sm:ml-3 flex-shrink-0 p-2 sm:p-2.5 text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors"
                        title="Copy name"
                      >
                        {copiedStates['name'] ? (
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                      </button>
                    </div>
                    
                    {/* Address Line 1 */}
                    <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-50/80 to-white/80 hover:from-gray-100/80 hover:to-white/80 transition-all border border-gray-200/50">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-xs font-medium text-gray-500 mb-1">Street Address</p>
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-red-600">4700 Eisenhower Avenue</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard('4700 Eisenhower Avenue', 'address1')}
                        className="ml-2 sm:ml-3 flex-shrink-0 p-2 sm:p-2.5 text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors"
                        title="Copy address line 1"
                      >
                        {copiedStates['address1'] ? (
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                      </button>
                    </div>
                    
                    {/* Address Line 2 */}
                    <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-50/80 to-white/80 hover:from-gray-100/80 hover:to-white/80 transition-all border border-gray-200/50">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-xs font-medium text-gray-500 mb-1">Apartment/Suite</p>
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-red-600">ALX-E2</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard('ALX-E2', 'address2')}
                        className="ml-2 sm:ml-3 flex-shrink-0 p-2 sm:p-2.5 text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors"
                        title="Copy suite number"
                      >
                        {copiedStates['address2'] ? (
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                      </button>
                    </div>
                    
                    {/* City, State, ZIP */}
                    <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-50/80 to-white/80 hover:from-gray-100/80 hover:to-white/80 transition-all border border-gray-200/50">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-xs font-medium text-gray-500 mb-1">City, State ZIP</p>
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-red-600">
                          {usAddress?.city || 'Alexandria'}, {usAddress?.state_province || 'VA'} {usAddress?.postal_code || '22304'}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(`${usAddress?.city || 'Alexandria'}, ${usAddress?.state_province || 'VA'} ${usAddress?.postal_code || '22304'}`, 'city')}
                        className="ml-2 sm:ml-3 flex-shrink-0 p-2 sm:p-2.5 text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors"
                        title="Copy city, state, zip"
                      >
                        {copiedStates['city'] ? (
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                      </button>
                    </div>
                    
                    {/* Country */}
                    <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-50/80 to-white/80 hover:from-gray-100/80 hover:to-white/80 transition-all border border-gray-200/50">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-xs font-medium text-gray-500 mb-1">Country</p>
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-red-600">{usAddress?.country || 'USA'}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(usAddress?.country || 'USA', 'country')}
                        className="ml-2 sm:ml-3 flex-shrink-0 p-2 sm:p-2.5 text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors"
                        title="Copy country"
                      >
                        {copiedStates['country'] ? (
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

          {/* Apple-Style Popular Brands Section */}
          <section className="py-16 sm:py-20 bg-gradient-to-b from-white via-gray-50 to-white">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 sm:mb-16">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 mb-4 tracking-tight"
                >
                  Shop From Your <span className="bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">Favorite Brands</span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="text-lg sm:text-xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed"
                >
                  Access thousands of US stores and brands. Use your Vanguard address at checkout and we'll handle the rest.
                </motion.p>
              </div>
      
              {/* Popular Brands - Responsive: Grid on Mobile, Marquee on Desktop */}
              
              {/* Mobile Grid (hidden on lg and up) */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12 lg:hidden">
                {popularBrands.map((brand, index) => (
                  <motion.a
                    key={brand.name}
                    href={brand.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-all duration-300 group aspect-square flex items-center justify-center"
                  >
                    <img 
                      src={brand.logo} 
                      alt={`${brand.name} logo`}
                      className="w-full h-full object-contain max-w-[80%] max-h-[80%]"
                    />
                  </motion.a>
                ))}
              </div>
      
              {/* Desktop Marquee (hidden on mobile, visible on lg and up) */}
              <div className="space-y-8 mb-12 hidden lg:block">
                {/* Top Row - Left to Right */}
                <div className="overflow-hidden relative">
                  <div className="flex animate-marquee-left whitespace-nowrap">
                    {/* Create multiple copies for true infinite scroll */}
                    {[...Array(4)].map((_, setIndex) => (
                      <div key={`top-set-${setIndex}`} className="flex">
                        {popularBrands.slice(0, 6).map((brand) => (
                          <motion.a
                            key={`top-${setIndex}-${brand.name}`}
                            href={brand.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-all duration-300 group flex-shrink-0 w-32 h-32 flex items-center justify-center mx-3"
                          >
                            <img 
                              src={brand.logo} 
                              alt={`${brand.name} logo`}
                              className="w-full h-full object-contain max-w-[80%] max-h-[80%]"
                            />
                          </motion.a>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
      
                {/* Bottom Row - Right to Left */}
                <div className="overflow-hidden relative">
                  <div className="flex animate-marquee-right whitespace-nowrap">
                    {/* Create multiple copies for true infinite scroll */}
                    {[...Array(4)].map((_, setIndex) => (
                      <div key={`bottom-set-${setIndex}`} className="flex">
                        {popularBrands.slice(6).map((brand) => (
                          <motion.a
                            key={`bottom-${setIndex}-${brand.name}`}
                            href={brand.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-all duration-300 group flex-shrink-0 w-32 h-32 flex items-center justify-center mx-3"
                          >
                            <img 
                              src={brand.logo} 
                              alt={`${brand.name} logo`}
                              className="w-full h-full object-contain max-w-[80%] max-h-[80%]"
                            />
                          </motion.a>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>            
            </div>
          </section>

        {/* Commented out original dashboard cards - keep for later reference */}
        {/*
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl h-full mx-auto">
          {dashboardCards.map((card) => (
            <a key={card.title} href={card.href} style={{ textDecoration: 'none' }}>
              <DashboardCard
                title={card.title}
                description={card.description}
                imageSrc={card.imageSrc}
                iconComponent={card.iconComponent}
              />
            </a>
          ))}
        </div>
        */}
      </div>

      {/* Direct Purchase Modal */}
      {showDirectPurchaseModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          style={{ zIndex: 9999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDirectPurchaseModal(false);
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-2xl w-full max-w-lg mx-4 my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-white/50 to-emerald-50/50"></div>
            
            {/* Modal Header */}
            <div className="relative p-6 sm:p-8 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Direct Purchase Request</h3>
                    <p className="text-sm text-gray-600">We'll shop for you!</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDirectPurchaseModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="relative p-6 sm:p-8 space-y-6">
              {/* Information Card */}
              <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Info className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm text-blue-900 leading-relaxed">
                    <p className="font-semibold mb-1">How it works:</p>
                    <p>Tell us what you want to purchase and we'll handle the shopping, payment, and delivery to your US address. Our team will contact you with pricing and next steps.</p>
                  </div>
                </div>
              </div>

              {/* User Information Display */}
              <div className="bg-gradient-to-br from-gray-50/80 to-white/80 border border-gray-200/50 rounded-2xl p-4 space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm">Your Information:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900">{profile?.firstName || 'User'} {profile?.lastName || 'Name'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">{profile?.email || user?.email || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium text-gray-900">{profile?.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Suite:</span>
                    <span className="font-medium text-gray-900">{profile?.suite_number || 'Not assigned'}</span>
                  </div>
                </div>
              </div>

              {/* Purchase Details */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  What would you like us to purchase? *
                </label>
                <textarea
                  value={directPurchaseNote}
                  onChange={(e) => setDirectPurchaseNote(e.target.value)}
                  placeholder="Please provide details about the item(s) you want us to purchase. Include product links, specifications, quantity, budget range, and any special instructions..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300/50 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 resize-none text-sm"
                />
                <p className="text-xs text-gray-500">
                  Be as specific as possible to help us find exactly what you need.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="relative p-6 sm:p-8 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/50">
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => setShowDirectPurchaseModal(false)}
                  className="flex-1 px-4 py-3 text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDirectPurchaseRequest}
                  disabled={isSubmittingRequest || !directPurchaseNote.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg transition-all text-sm"
                >
                  {isSubmittingRequest ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;