import React from 'react'
import DashboardCard from '../../components/DashboardCard';
import type { DashboardCardProps } from '../../components/DashboardCard';
import { ShoppingBag } from 'lucide-react';


type DashboardCardConfig = Omit<DashboardCardProps, 'onClick'> & { href: string };

const Dashboard: React.FC = () => {
  // Dashboard card configuration array focused on package forwarding workflow
  const dashboardCards: DashboardCardConfig[] = [
    {
      title: "Incoming Packages",
      description: "View packages arriving at your US address",
      imageSrc: "/submit-girl.png",
      href: "/app/submit-request",
      iconComponent: "box"
    },
    {
      title: "Combine & Ship",
      description: "Consolidate packages and request shipping to Ghana",
      imageSrc: "/shipment-history.jpg",
      href: "/app/shipment-history", 
      iconComponent: "history"
    },
    {
      title: "Track My Packages",
      description: "Real-time tracking from US to Ghana",
      imageSrc: "/track.png",
      href: "/app/tracking",
      iconComponent: "location"
    },
    {
      title: "My Account",
      description: "Manage address, billing, and preferences",
      imageSrc: "/settings.png",
      href: "/app/settings",
      iconComponent: "history"
    }
  ];

  return (
		<div className=" px-4 sm:px-10 transition-colors duration-300">
      {/* US Address Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              Welcome to Your Shopping Dashboard! <ShoppingBag className="w-6 h-6" />
            </h1>
            <div className="text-gray-600">
              <p className="font-medium">Your US Shipping Address:</p>
              <div className="text-sm mt-1 bg-white px-3 py-2 rounded-lg inline-block">
                <div className="font-semibold">John Doe (TTL-12345)</div>
                <div>2891 NE 2nd Ave, Miami, FL 33137</div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Total Savings This Year</div>
            <div className="text-2xl font-bold text-green-600">$1,247</div>
          </div>
        </div>
      </div>
      
      {/* Dashboard Grid */}
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
    </div>
	)
}

export default Dashboard