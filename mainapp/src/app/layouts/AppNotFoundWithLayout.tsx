import React from 'react';
import AppNotFound from '../pages/AppNotFound';

/**
 * AppNotFoundWithLayout - App 404 page for authenticated users
 * 
 * This component simply returns the AppNotFound component.
 * The layout (sidebar and navbar) is provided by the AppLayout component
 * through React Router's nested routing structure.
 */
const AppNotFoundWithLayout: React.FC = () => {
  return <AppNotFound />;
};

export default AppNotFoundWithLayout;
