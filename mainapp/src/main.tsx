import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop'; // Import ScrollToTop for UX improvement
import { ThemeProvider } from './context/ThemeProvider';
import { AuthProvider } from './context/AuthProvider';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {/* ScrollToTop ensures every route change starts at the top of the page */}
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
