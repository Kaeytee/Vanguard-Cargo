import React from "react";
import { motion } from "framer-motion";
import AnimatedCounter from "../../components/ui/AnimatedCounter";
import { useTranslation } from "../../lib/translations";

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
  const { t } = useTranslation();
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Team member data
  const team = [
    {
      name: "John Doe",
      position: "CEO & Founder",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Jane Smith",
      position: "COO",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "Michael Johnson",
      position: "CTO",
      image: "https://randomuser.me/api/portraits/men/22.jpg",
    },
    {
      name: "Sarah Williams",
      position: "Head of Operations",
      image: "https://randomuser.me/api/portraits/women/28.jpg",
    },
  ];

  // Benefits data
  const benefits = [
    {
      title: "Reliability",
      description:
        "We ensure timely and secure delivery of your shipments, every time.",
    },
    {
      title: "Innovation",
      description:
        "We leverage the latest technology to optimize logistics processes and enhance customer experience.",
    },
    {
      title: "Integrity",
      description:
        "We uphold the highest standards of honesty and transparency in all our operations.",
    },
    {
      title: "Excellence",
      description:
        "We are committed to delivering exceptional service and exceeding customer expectations.",
    },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 sm:mb-10"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          {t('aboutCompany')}
        </h1>
        <p className="text-gray-600 text-base sm:text-lg">
          {t('aboutUs')}
        </p>
      </motion.div>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col justify-center items-center mb-10 sm:mb-16 bg-[#1A2B6D] rounded-lg shadow-md p-4 sm:p-8 text-center min-h-[200px] sm:min-h-[300px]"
      >
        <motion.div
          variants={itemVariants}
          className="w-full sm:w-2/3 flex flex-col items-center mx-auto"
        >
          <p className="text-white text-xl sm:text-3xl font-bold mb-4">
            To provide reliable, efficient, and sustainable logistics solutions
            that connect businesses and people worldwide.
          </p>
          <p className="text-white text-sm sm:text-base">
            To provide reliable, efficient, and sustainable logistics solutions
            that connect businesses and people worldwide. We strive to optimize
            supply chains, reduce environmental impact, and deliver exceptional
            service to our clients.
          </p>
        </motion.div>
      </motion.section>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col justify-center items-center mb-10 sm:mb-16 bg-white text-[#1A2B6D] rounded-lg shadow-md p-4 sm:p-8 min-h-[200px] sm:min-h-[300px]"
      >
        <motion.div
          variants={itemVariants}
          className="w-full md:w-[80%] flex flex-col mx-auto"
        >
          <p className="text-xl sm:text-2xl font-bold mb-4">Our Story</p>
          <p className="w-full sm:w-3/4 md:w-1/2 mb-3 text-sm sm:text-base">
            To provide reliable, efficient, and sustainable logistics solutions
            that connect businesses and people worldwide. We strive to optimize
            supply chains, reduce environmental impact, and deliver exceptional
            service to our clients.
          </p>
          <p className="w-full sm:w-3/4 md:w-1/2 mb-3 text-sm sm:text-base">
            To provide reliable, efficient, and sustainable logistics solutions
            that connect businesses and people worldwide.
          </p>
          <p className="w-full sm:w-3/4 md:w-1/2 mb-3 text-sm sm:text-base">
            To provide reliable, efficient, and sustainable logistics solutions
            that connect businesses and people worldwide. We strive to optimize
            supply chains, reduce environmental impact, and deliver exceptional
            service to our clients.
          </p>
        </motion.div>
      </motion.section>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col justify-center items-center mb-10 sm:mb-16 bg-[#1A2B6D] rounded-lg shadow-md p-4 sm:p-8 py-8 sm:py-16 text-center min-h-[200px] sm:min-h-[300px]"
      >
        <motion.div
          variants={itemVariants}
          className="w-full flex flex-col items-center mx-auto"
        >
          <div className="flex flex-col items-center mb-6">
            <img
              src="/handshakeVector.png"
              alt="Company Vision"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            />
            <h1 className="text-white text-xl sm:text-2xl font-extrabold tracking-wide mb-2 drop-shadow-lg">
              Why Choose Us?
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 w-full">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  scale: 1.08,
                  boxShadow: "0 8px 32px 0 rgba(26,43,109,0.30)",
                  y: -6,
                  transition: { type: "spring", stiffness: 300, damping: 18 },
                }}
                whileTap={{ scale: 0.97 }}
                className="bg-gradient-to-br from-[#22398c] to-[#1A2B6D] border border-white/10 rounded-2xl p-4 sm:p-6 min-w-[180px] sm:min-w-[220px] max-w-xs flex-1 shadow-xl transition-all duration-300 flex flex-col items-start"
              >
                <div className="flex mx-auto items-center mb-3">
                  <strong className="text-base sm:text-lg text-white font-semibold tracking-wide">
                    {benefit.title}
                  </strong>
                </div>
                <motion.span
                  className="text-gray-200 text-xs sm:text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 * index, duration: 0.5 }}
                >
                  {benefit.description}
                </motion.span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* Leadership Team */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          variants={itemVariants}
          className="text-center text-xl sm:text-2xl font-bold text-[#1A2B6D] mb-4 sm:mb-6"
        >
          Meet Our Leadership Team
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {team.map((member) => (
            <motion.div
              key={member.name}
              variants={itemVariants}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="overflow-hidden">
                <div className="mt-6 flex items-center justify-center h-full">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        member.name
                      )}&background=ef4444&color=ffffff&size=200`;
                    }}
                  />
                </div>
              </div>
              <div className="p-4 text-center">
                <h3 className="font-bold text-base sm:text-lg text-gray-800">
                  {member.name}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">{member.position}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Location Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 mt-10 sm:mt-16 bg-white rounded-lg shadow-md p-4 sm:p-8"
      >
        {/* Address on the left */}
        <motion.div
          variants={itemVariants}
          className="md:w-1/2 w-full mb-4 md:mb-0"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-[#1A2B6D] mb-3 sm:mb-4 flex items-center">
            <img
              src="/ICONS.png"
              alt="Location Icon"
              className="inline-block w-6 h-6 sm:w-8 sm:h-8 mr-2"
            />
            Our Location
          </h2>
          <p className="text-gray-700 mb-1 sm:mb-2 font-semibold">
            Ttarius Logistics Headquarters
          </p>
          <p className="text-gray-600 text-sm sm:text-base">
            1234 Logistics Avenue
            <br />
            Suite 500
            <br />
            Accra, Ghana
            <br />
            Phone: +233 800 123 4567
            <br />
            Email: info@ttariuslogistics.com
          </p>
        </motion.div>
        {/* Map on the right */}
        <motion.div
          variants={itemVariants}
          className="md:w-1/2 w-full flex justify-center"
        >
          <div className="w-full h-48 sm:h-64 md:h-72 rounded-lg overflow-hidden border border-gray-200 shadow">
            <iframe
              title="Ttarius Logistics Location"
              src="https://www.google.com/maps?q=6.5244,3.3792&z=15&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </motion.div>
      </motion.section>
      <motion.section>
        <motion.div>
          <h2 className="text-xl sm:text-2xl text-center font-bold text-[#1A2B6D] mb-3 sm:mb-4 mt-10 sm:mt-16 flex items-center justify-center gap-2">
            <img
              src="/LEGACY.png"
              alt="Legacy Icon"
              className="inline-block w-6 h-6 sm:w-8 sm:h-8"
            />
            Our Legacy
          </h2>
          <div className="w-full max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
            <div>
              <p className="text-2xl sm:text-3xl text-red-600 font-bold">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnimatedCounter from={0} to={15} duration={1.5} />
                </motion.span>
                +
              </p>
              <p className="text-base sm:text-lg">Years in Business</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl text-red-600 font-bold">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnimatedCounter from={0} to={12000} duration={1.5} />
                </motion.span>
                +
              </p>
              <p className="text-base sm:text-lg">Complete Deliveries</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl text-red-600 font-bold">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnimatedCounter from={0} to={3000} duration={1.5} />
                </motion.span>
                +
              </p>
              <p className="text-base sm:text-lg">Users across the Globe</p>
            </div>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default AppAbout;
