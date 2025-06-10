// ScrollToTop.tsx
// This component ensures that every route change scrolls the window to the top, improving user experience.
// Clean code, OOP, and best practices applied.

import { useEffect } from 'react'; // Import useEffect for side effects
import { useLocation } from 'react-router-dom'; // Import useLocation to listen to route changes

/**
 * ScrollToTop component
 * Listens for route changes and scrolls the window to the top.
 * Should be placed inside BrowserRouter but above Routes.
 * @returns null (no UI rendered)
 */
const ScrollToTop: React.FC = () => {
  // Get current location object from React Router
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to the top of the page whenever the path changes
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]); // Dependency array ensures this runs on every path change

  return null; // No visible UI
};

export default ScrollToTop;
