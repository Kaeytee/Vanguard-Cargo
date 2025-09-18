import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop'; // Import ScrollToTop for UX improvement
import { ThemeProvider } from './context/ThemeProvider';
import { PreferencesProvider } from './context/PreferencesProvider';
import { AuthProvider } from './context/AuthContext';
import { clearMockData } from './utils/clearMockData';
import './index.css';
import App from './App.tsx';

// Clear mock data on app startup for production experience
clearMockData();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {/* ScrollToTop ensures every route change starts at the top of the page */}
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <PreferencesProvider>
            <App />
          </PreferencesProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
