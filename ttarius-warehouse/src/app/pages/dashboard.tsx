import React from 'react';
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
  FiChevronRight,
  FiTrendingUp,
  FiActivity
} from 'react-icons/fi';

/**
 * Dashboard Component
 * 
 * This component serves as the main dashboard for the TTarius Logistics application.
 * It displays key metrics, quick actions, analysis charts, and recent activities.
 * 
 * @returns {React.ReactElement} The Dashboard component
 */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  /**
   * Dashboard metric card component
   */
  const MetricCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle: string;
    iconColor: string;
  }> = ({ icon, title, value, subtitle, iconColor }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 font-medium text-sm">{title}</h3>
        <div className={`${iconColor}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{subtitle}</p>
        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center transition-colors">
          Details <FiChevronRight className="ml-1" size={16} />
        </button>
      </div>
    </div>
  );

  /**
   * Quick action button component
   */
  const QuickActionButton: React.FC<{
    icon: React.ReactNode;
    title: string;
    onClick: () => void;
  }> = ({ icon, title, onClick }) => (
    <button
      onClick={onClick}
      className="bg-gray-50 hover:bg-gray-100 rounded-xl p-6 text-center transition-colors duration-200 border border-gray-100 flex flex-col items-center justify-center h-24"
    >
      <div className="text-gray-600 mb-2">
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-900">{title}</span>
    </button>
  );

  /**
   * Recent request item component
   */
  const RequestItem: React.FC<{
    name: string;
    item: string;
    date: string;
    status: 'pending' | 'approved' | 'rejected';
  }> = ({ name, item, date, status }) => (
    <div className="p-4 border border-gray-200 rounded-xl mb-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{name}</h4>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
            <span className="text-gray-500">{item}</span>
          </div>
          <p className="text-xs text-gray-400">{date}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          status === 'approved' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status}
        </span>
      </div>
    </div>
  );

  // Sample chart data for the last 7 days
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
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm">TTarius logistics | Accra Ghana</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={<FiClock size={24} />}
          title="Total Requests"
          value="20"
          subtitle="+5 today"
          iconColor="text-gray-600"
        />
        <MetricCard
          icon={<FiSend size={24} />}
          title="Active Shipments"
          value="12"
          subtitle="3 in transit"
          iconColor="text-blue-600"
        />
        <MetricCard
          icon={<FiPackage size={24} />}
          title="Total Packages"
          value="156"
          subtitle="+18 this week"
          iconColor="text-green-600"
        />
        <MetricCard
          icon={<FiUsers size={24} />}
          title="Active clients"
          value="89"
          subtitle="+7 new"
          iconColor="text-blue-600"
        />
      </div>

      {/* Quick Actions and Analysis Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <FiBarChart className="text-gray-700 mr-3" size={20} />
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
            />
            <QuickActionButton
              icon={<FiFileText size={24} />}
              title="Process Request"
              onClick={() => navigate('/incoming-request')}
            />
            <QuickActionButton
              icon={<FiClock size={24} />}
              title="Shipment History"
              onClick={() => navigate('/shipment-history')}
            />
            <QuickActionButton
              icon={<FiDatabase size={24} />}
              title="Inventory"
              onClick={() => navigate('/inventory')}
            />
          </div>
        </div>

        {/* Analysis Report */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <FiTrendingUp className="text-gray-700 mr-3" size={20} />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Analysis Report</h2>
                <p className="text-sm text-gray-500">Daily shipment volume over the last 7 days</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700 transition-colors flex items-center">
              <span className="text-sm font-medium">Details</span>
              <FiChevronRight className="ml-1" size={16} />
            </button>
          </div>
          
          {/* Chart */}
          <div className="h-64 flex items-end justify-between px-2">
            {chartData.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1 mx-1">
                <div 
                  className="bg-blue-900 rounded-t-md mb-3 transition-all duration-500"
                  style={{ 
                    height: `${(data.value / maxValue) * 180}px`,
                    minHeight: '30px',
                    width: '32px'
                  }}
                ></div>
                <span className="text-xs text-gray-400 font-medium">{data.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Requests and Shipments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <FiActivity className="text-gray-700 mr-3" size={20} />
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
            />
            <RequestItem
              name="Chris Jones"
              item="Document - Legal Papers"
              date="20/05/2025"
              status="pending"
            />
            <RequestItem
              name="John Smith"
              item="Box - clothings"
              date="19/05/2025"
              status="pending"
            />
          </div>
        </div>

        {/* Recent Shipments */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <FiTruck className="text-gray-700 mr-3" size={20} />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Shipments</h2>
              <p className="text-sm text-gray-500">Latest created shipments</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="mb-6">
              <FiTruck size={64} className="text-gray-300 mx-auto" />
            </div>
            <p className="text-gray-400 mb-6 font-medium">No shipment Created yet</p>
            <button
              onClick={() => navigate('/create-shipment')}
              className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
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