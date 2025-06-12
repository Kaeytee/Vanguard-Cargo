import React from 'react';
import { motion } from 'framer-motion';

/**
 * AppAbout - Client app about page
 * 
 * This component displays information about the logistics application
 * including company history, mission, vision, and team information.
 * It's specifically designed for authenticated users within the client app.
 * 
 * @returns {JSX.Element} The AppAbout component
 */
const AppAbout: React.FC = () => {
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Company timeline data
  const timeline = [
    { year: '2010', event: 'Company founded with a focus on local deliveries' },
    { year: '2015', event: 'Expanded to national logistics operations' },
    { year: '2018', event: 'Launched international shipping services' },
    { year: '2020', event: 'Implemented advanced tracking technology' },
    { year: '2023', event: 'Achieved carbon-neutral delivery operations' },
    { year: '2025', event: 'Launched this digital platform for seamless logistics management' }
  ];

  // Team member data
  const team = [
    { name: 'John Doe', position: 'CEO & Founder', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { name: 'Jane Smith', position: 'COO', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { name: 'Michael Johnson', position: 'CTO', image: 'https://randomuser.me/api/portraits/men/22.jpg' },
    { name: 'Sarah Williams', position: 'Head of Operations', image: 'https://randomuser.me/api/portraits/women/28.jpg' }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Page header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">About Our Company</h1>
        <p className="text-gray-600 text-lg">Learn about our mission, history, and the team behind our logistics services</p>
      </motion.div>

      {/* Mission and Vision */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-16 bg-white rounded-lg shadow-md p-8"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="bg-red-500 w-8 h-8 rounded-full flex items-center justify-center text-white mr-3">🎯</span>
            Our Mission
          </h2>
          <p className="text-gray-600">
            To provide reliable, efficient, and sustainable logistics solutions that connect businesses and people worldwide. 
            We strive to optimize supply chains, reduce environmental impact, and deliver exceptional service to our clients.
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="bg-red-500 w-8 h-8 rounded-full flex items-center justify-center text-white mr-3">👁️</span>
            Our Vision
          </h2>
          <p className="text-gray-600">
            To become the global leader in innovative logistics solutions, setting industry standards for reliability, 
            sustainability, and customer satisfaction. We envision a world where logistics is seamless, transparent, and environmentally responsible.
          </p>
        </motion.div>
      </motion.section>

      {/* Company History Timeline */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-16"
      >
        <motion.h2 
          variants={itemVariants}
          className="text-2xl font-bold text-gray-800 mb-6"
        >
          Our Journey
        </motion.h2>
        
        <div className="relative border-l-2 border-red-500 ml-6">
          {timeline.map((item) => (
            <motion.div 
              key={item.year}
              variants={itemVariants}
              className="mb-10 ml-10 relative"
            >
              <div className="absolute -left-[52px] bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                {item.year.substring(2)}
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-bold text-lg text-gray-800 mb-1">{item.year}</h3>
                <p className="text-gray-600">{item.event}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Leadership Team */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 
          variants={itemVariants}
          className="text-2xl font-bold text-gray-800 mb-6"
        >
          Our Leadership Team
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <motion.div 
              key={member.name}
              variants={itemVariants}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=ef4444&color=ffffff&size=200`;
                  }}
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-bold text-lg text-gray-800">{member.name}</h3>
                <p className="text-gray-600">{member.position}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default AppAbout;
