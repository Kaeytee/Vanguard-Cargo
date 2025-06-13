import React from 'react'
import DashboardCard from '../../components/DashboardCard';
import type { DashboardCardProps } from '../../components/DashboardCard';


type DashboardCardConfig = Omit<DashboardCardProps, 'onClick'> & { href: string };

// Dashboard card configuration array with title, icon, and action
const dashboardCards: DashboardCardConfig[] = [
  {
    title: "Submit Shipment",
    description: "Create a new delivery",
    imageSrc: "/submit-girl.png", // Person signing for package
    href: "/app/submit-shipment",
    iconComponent: "box" // Using the box icon from the image
  },
  {
    title: "Shipment History",
    description: "Visit previous orders",
    imageSrc: "/shipment-history.jpg", // Smiling courier with boxes
    href: "/app/shipment-history",
    iconComponent: "history" // Using the history icon from the image
  },
  {
    title: "Track Shipment",
    description: "Receive Live Updates on delivery",
    imageSrc: "/track.png", // Map with pins
    href: "/app/track-shipment",
    iconComponent: "location" // Using the location icon from the image
  },
  {
    title: "Settings",
    description: "Manage your account settings",
    imageSrc: "/settings.png", // Smiling courier with boxes
    href: "/app/settings",
    iconComponent: "history" // Using the history icon from the image
  }
];



const dashboard: React.FC = () => {
  return (
		<div className=" px-4 sm:px-10 transition-colors duration-300">
      {/* Welcome Header - exactly as in the image */}
      <h1 className="text-2xl font-bold mb-12">What would you like to do?</h1>
      
      {/* 2x2 Grid of Dashboard Cards - exact layout from image */}
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

export default dashboard