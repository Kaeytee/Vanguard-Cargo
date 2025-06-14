import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiClock,
  FiSend,
  FiPackage,
  FiUsers,
  FiBarChart,
  FiFileText,
  FiDatabase,
  FiTruck,
  FiArrowRightCircle,
  FiTrendingUp,
  FiActivity,
  FiZap,
} from 'react-icons/fi';
import { Ship } from "lucide-react";

/**
 * Dashboard Component
 * 
 * Enhanced with smooth animations and interactive elements for a premium feel.
 * Features staggered animations, hover effects, and dynamic content loading.
 */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [animatedValues, setAnimatedValues] = useState<{[key: string]: number}>({});
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartVisible, setChartVisible] = useState(false);

  // Animation on mount
  useEffect(() => {
    setMounted(true);
    
    // Animate numbers
    const targets = {
      'Total Requests': 20,
      'Active Shipments': 12,
      'Total Packages': 156,
      'Active clients': 89
    };

    Object.entries(targets).forEach(([key, target]) => {
      let current = 0;
      const increment = target / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setAnimatedValues(prev => ({ ...prev, [key]: Math.floor(current) }));
      }, 30);
    });

    // Chart intersection observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setChartVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => observer.disconnect();
  }, []);

  /**
   * Enhanced Dashboard metric card with animations
   */
  const MetricCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle: string;
    iconColor: string;
    index: number;
  }> = ({ icon, title, value, subtitle, iconColor, index }) => {
    const animatedValue = animatedValues[title] || 0;
    
    const handleDetailsClick = () => {
      switch (title) {
        case 'Total Requests':
          navigate('/incoming-request');
          break;
        case 'Active Shipments':
          navigate('/shipment-history');
          break;
        case 'Total Packages':
          navigate('/shipment-history?filter=active&range=this-week');
          break;
        case 'Active clients':
          navigate('/client-management');
          break;
        default:
          break;
      }
    };

    return (
      <div 
        className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 transform transition-all duration-700 ease-out hover:shadow-lg hover:scale-105 cursor-pointer group relative overflow-hidden ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
        style={{ transitionDelay: `${index * 100}ms` }}
        onMouseEnter={() => setHoveredCard(title)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Floating particles effect */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-0 group-hover:opacity-30 transform scale-0 group-hover:scale-100 transition-all duration-500" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-medium text-sm transition-colors group-hover:text-gray-800">{title}</h3>
            <div className={`${iconColor} transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`}>
              {icon}
            </div>
          </div>
          
          <p className="text-3xl font-bold text-gray-900 mb-2 transition-all duration-300 group-hover:text-blue-900">
            {animatedValue}
          </p>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 transition-colors group-hover:text-gray-600">{subtitle}</p>
            <button
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center transition-all duration-300 transform hover:translate-x-1"
              onClick={handleDetailsClick}
            >
              Details <FiArrowRightCircle className="ml-1 transition-transform duration-300 group-hover:rotate-90" size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Enhanced Quick action button with animations
   */
  const QuickActionButton: React.FC<{
    icon: React.ReactNode;
    title: string;
    onClick: () => void;
    index: number;
  }> = ({ icon, title, onClick, index }) => (
    <button
      onClick={onClick}
      className={`bg-gray-50 hover:bg-gradient-to-br hover:from-blue-50 hover:to-gray-50 rounded-xl p-6 text-center transition-all duration-500 border border-gray-100 hover:border-blue-200 flex flex-col items-center justify-center h-24 transform hover:scale-105 hover:shadow-md group ${
        mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      style={{ transitionDelay: `${(index + 4) * 100}ms` }}
    >
      <div className="text-gray-600 mb-2 transform transition-all duration-300 group-hover:scale-110 group-hover:text-blue-600">
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-900 transition-colors group-hover:text-blue-800">{title}</span>
    </button>
  );

  /**
   * Enhanced Recent request item with animations
   */
  const RequestItem: React.FC<{
    name: string;
    item: string;
    date: string;
    status: 'pending' | 'approved' | 'rejected';
    index: number;
  }> = ({ name, item, date, status, index }) => (
    <div 
      className={`p-4 border border-gray-200 rounded-xl mb-3 transform transition-all duration-500 hover:shadow-md hover:scale-102 hover:bg-gray-50 cursor-pointer group ${
        mounted ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
      }`}
      style={{ transitionDelay: `${(index + 8) * 100}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1 transition-colors group-hover:text-blue-900">{name}</h4>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-2 transition-all duration-300 group-hover:scale-125 group-hover:bg-blue-700"></div>
            <span className="text-gray-500 transition-colors group-hover:text-gray-700">{item}</span>
          </div>
          <p className="text-xs text-gray-400 transition-colors group-hover:text-gray-500">{date}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 transform group-hover:scale-105 ${
          status === 'pending' ? 'bg-yellow-100 text-yellow-700 group-hover:bg-yellow-200' :
          status === 'approved' ? 'bg-green-100 text-green-800 group-hover:bg-green-200' :
          'bg-red-100 text-red-800 group-hover:bg-red-200'
        }`}>
          {status}
        </span>
      </div>
    </div>
  );

  // Enhanced chart data with animation
  const chartData = [
    { day: 'Mon', value: 45 },
    { day: 'Tue', value: 65 },
    { day: 'Wed', value: 55 },
    { day: 'Thu', value: 85 },
    { day: 'Fri', value: 60 },
    { day: 'Sat', value: 40 },
    { day: 'Sun', value: 70 }
  ];

  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-full blur-3xl transform rotate-45 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-100/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Header with animation */}
      <div className={`mb-8 transform transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
        <div className="flex items-center space-x-3 mb-2">
          <FiZap className="text-blue-600 animate-pulse" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        </div>
        <p className="text-gray-500 text-sm">TTarius logistics | Accra Ghana</p>
      </div>

      {/* Metrics Cards with staggered animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={<FiClock size={24} />}
          title="Total Requests"
          value="20"
          subtitle="+5 today"
          iconColor="text-gray-600"
          index={0}
        />
        <MetricCard
          icon={<FiSend size={24} />}
          title="Active Shipments"
          value="12"
          subtitle="3 in transit"
          iconColor="text-blue-600"
          index={1}
        />
        <MetricCard
          icon={<FiPackage size={24} />}
          title="Total Packages"
          value="156"
          subtitle="+18 this week"
          iconColor="text-green-600"
          index={2}
        />
        <MetricCard
          icon={<FiUsers size={24} />}
          title="Active clients"
          value="89"
          subtitle="+7 new"
          iconColor="text-blue-600"
          index={3}
        />
      </div>

      {/* Quick Actions and Analysis Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quick Actions */}
        <div className={`bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-200 transform transition-all duration-700 hover:shadow-lg ${
          mounted ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
        }`} style={{ transitionDelay: '400ms' }}>
          <div className="flex items-center mb-6">
            <FiBarChart className="text-gray-700 mr-3 transform transition-all duration-300 hover:rotate-12" size={20} />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              <p className="text-sm text-gray-500">Common warehouse operation</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <QuickActionButton
              icon={<FiPackage size={24} />}
              title="Create shipment"
              onClick={() => navigate('/create-shipment')}
              index={0}
            />
            <QuickActionButton
              icon={<FiFileText size={24} />}
              title="Process Request"
              onClick={() => navigate('/incoming-request')}
              index={1}
            />
            <QuickActionButton
              icon={<FiClock size={24} />}
              title="Shipment History"
              onClick={() => navigate('/shipment-history')}
              index={2}
            />
            <QuickActionButton
              icon={<FiDatabase size={24} />}
              title="Inventory"
              onClick={() => navigate('/inventory')}
              index={3}
            />
          </div>
        </div>

        {/* Analysis Report */}
        <div 
          ref={chartRef}
          className={`bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-200 transform transition-all duration-700 hover:shadow-lg ${
            mounted ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
          }`} 
          style={{ transitionDelay: '500ms' }}
        >
          <div className="flex items-center mb-6">
            <FiTrendingUp className="text-gray-700 mr-3 transform transition-all duration-300 hover:scale-110" size={20} />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Analysis Report</h2>
              <p className="text-sm text-gray-500">Daily shipment volume over the last 7 days</p>
            </div>
          </div>

          {/* Enhanced Chart with animations */}
          <div className="h-64 flex items-end justify-between px-2 mb-4">
            {chartData.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1 mx-1 group">
                <div
                  className={`bg-gradient-to-t from-blue-900 to-blue-700 rounded-t-md mb-3 transition-all duration-1000 ease-out hover:from-blue-800 hover:to-blue-600 cursor-pointer transform hover:scale-105 ${
                    chartVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    height: chartVisible ? `${(data.value / maxValue) * 180}px` : '0px',
                    minHeight: chartVisible ? '30px' : '0px',
                    width: '32px',
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  {/* Hover tooltip */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    {data.value}
                  </div>
                </div>
                <span className={`text-xs text-gray-400 font-medium transition-all duration-500 ${
                  chartVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`} style={{ transitionDelay: `${(index + 7) * 100}ms` }}>
                  {data.day}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button className="text-blue-600 hover:text-blue-700 transition-all duration-300 flex items-center transform hover:translate-x-1 group">
              <span className="text-sm font-medium">Details</span>
              <FiArrowRightCircle className="ml-1 transition-transform duration-300 group-hover:rotate-90" size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Requests and Shipments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className={`bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-200 transform transition-all duration-700 hover:shadow-lg ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`} style={{ transitionDelay: '600ms' }}>
          <div className="flex items-center mb-6">
            <FiActivity className="text-gray-700 mr-3 animate-pulse" size={20} />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
              <p className="text-sm text-gray-500">Latest shipment requests from clients</p>
            </div>
          </div>

          <div className="space-y-3">
            <RequestItem
              name="John Smith"
              item="Box - Laptop"
              date="20/05/2025"
              status="pending"
              index={0}
            />
            <RequestItem
              name="Chris Jones"
              item="Document - Legal Papers"
              date="20/05/2025"
              status="pending"
              index={1}
            />
            <RequestItem
              name="John Smith"
              item="Box - clothings"
              date="19/05/2025"
              status="pending"
              index={2}
            />
          </div>
        </div>

        {/* Recent Shipments */}
        <div className={`bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-200 transform transition-all duration-700 hover:shadow-lg ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`} style={{ transitionDelay: '700ms' }}>
          <div className="flex items-center mb-6">
            <Ship className="text-gray-700 mr-3 transform transition-all duration-300 hover:scale-110" size={20} />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Shipments</h2>
              <p className="text-sm text-gray-500">Latest created shipments</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center h-64 text-center group">
            <div className="mb-6 transform transition-all duration-700 group-hover:scale-110 group-hover:rotate-12">
              <FiTruck size={78} className="text-blue-900 mx-auto animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
            <p className="text-gray-400 mb-6 font-medium transition-colors group-hover:text-gray-600">No shipment Created yet</p>
            <button
              onClick={() => navigate('/create-shipment')}
              className="bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              Create Shipment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;