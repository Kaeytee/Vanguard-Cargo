import React from 'react';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import NotFound from '../pages/NotFound';

/**
 * NotFoundWithLayout - Landing page 404 with navbar and footer
 * 
 * This component wraps the NotFound component with the landing page layout
 * including navbar and footer for unauthenticated users.
 */
const NotFoundWithLayout: React.FC = () => {
  return (
    <>
      <Navbar />
      <NotFound />
      <Footer />
    </>
  );
};

export default NotFoundWithLayout;
