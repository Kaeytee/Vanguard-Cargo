import React from 'react';
import { motion } from 'framer-motion';
import AnimateInView from '../../components/ui/animate-in-view';
import loginbg from '../../images/register-bg.jpg';
import Image from '../../images/forgot.jpg';

interface ForgotPasswordLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export const ForgotPasswordLayout: React.FC<ForgotPasswordLayoutProps> = ({ 
  children, 
  title, 
  description 
}) => {
  return (
    <div className="forgot-password-container">
      {/* Main Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage: `url(${loginbg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <AnimateInView variant="fadeInUp" delay={0.2}>
          <motion.div 
            className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.3 }}
          >
            {/* Left Side - Image */}
            <AnimateInView variant="fadeInLeft" delay={0.4} className="md:w-1/2">
              <motion.div 
                className="relative h-64 md:h-full min-h-[500px] flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img 
                  src={Image}
                  alt="Delivery person with logistics background"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimateInView>

            {/* Right Side - Form Content */}
            <AnimateInView variant="fadeInRight" delay={0.6} className="md:w-1/2">
              <div className="p-8 md:p-12 h-full flex flex-col justify-center">
                {/* Step Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                  <p className="text-gray-600">{description}</p>
                </div>

                {children}
              </div>
            </AnimateInView>
          </motion.div>
        </AnimateInView>
      </section>
    </div>
  );
};
