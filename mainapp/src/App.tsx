import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from "@vercel/analytics/react";
import AuthProvider from "./context/AuthContext";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import Home from "./landing/home/home";
// import About from "./landing/about/about"; // About page is not routed (per user request)
import Services from "./landing/services/services";
import Contact from "./landing/contact/contact";
import Login from "./landing/login/login";
import Register from "./landing/register/register";
import ForgotPassword from "./landing/forgot-password/forgot-password";
import EmailVerification from "./landing/email-verification/email-verification";
import ResendVerification from "./landing/resend-verification/resend-verification";
import PublicRoute from "./components/PublicRoute";
import Dashboard from "./app/dashboard/dashboard";
import Settings from "./app/settings/settings";
import Profile from "./app/profile/profile";
import ShipmentHistory from "./app/shipmentHistory/shipmentHistory";
import TrackingPage from "./app/tracking/tracking";
import AppAbout from "./app/about/Appabout";
import AppSupport from "./app/support/Appsupport";
import NotificationsPage from "./app/notification/notification";
import PackageIntake from "./app/packageIntake/packageIntake";
import ProtectedRoutes from "./components/protectedRoutes";
import AppLayout from "./components/AppLayout";
import SmartNotFound from "./components/SmartNotFound";
import AppNotFoundWithLayout from "./app/layouts/AppNotFoundWithLayout";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { featureFlags } from "./config/featureFlags";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * App - Main application component
 * 
 * This component serves as the root of the application and defines the routing structure.
 * It follows clean code architecture principles by separating concerns:
 * - Public routes for landing pages
 * - Protected routes for client app area with AppLayout
 * - Legacy route handling for backward compatibility
 * 
 * @returns {JSX.Element} The App component
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Analytics />
        <Routes>
      {/* Public Routes - Landing Pages with Navbar and Footer */}
      <Route
        path="/"
        element={
          <>
            <Navbar />
            <Home />
            <Footer />
          </>
        }
      />
      {/* <Route
        path="/about"
        element={
          <>
            <Navbar />
            <About />
            <Footer />
          </>
        }
      /> */} {/* About page is not routed (per user request) */}
      <Route
        path="/services"
        element={
          <>
            <Navbar />
            <Services />
            <Footer />
          </>
        }
      />
      <Route
        path="/contact"
        element={
          <>
            <Navbar />
            <Contact />
            <Footer />
          </>
        }
      />
      <Route
        path="/terms-of-service"
        element={
          <>
            <Navbar />
            <TermsOfService />
            <Footer />
          </>
        }
      />
      <Route
        path="/privacy-policy"
        element={
          <>
            <Navbar />
            <PrivacyPolicy />
            <Footer />
          </>
        }
      />
      {/* Authentication Routes - Protected from authenticated users */}
      <Route path="/auth" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={
          featureFlags.authEnabled ? (
            <PublicRoute>
              <Navbar />
              <Login />
              <Footer />
            </PublicRoute>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/register"
        element={
          featureFlags.authEnabled ? (
            <PublicRoute>
              <Navbar />
              <Register />
              <Footer />
            </PublicRoute>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route 
        path="/forgot-password" 
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } 
      />
      <Route 
        path="/verify-email" 
        element={
          <PublicRoute>
            <EmailVerification />
          </PublicRoute>
        } 
      />
      <Route 
        path="/resend-verification" 
        element={
          <PublicRoute>
            <ResendVerification />
          </PublicRoute>
        } 
      />

      {/* Protected Routes - Client App with AppLayout */}
      <Route
        path="/app/*"
        element={
          <ProtectedRoutes>
            <AppLayout>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="package-intake" element={<PackageIntake />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
                <Route path="shipment-history" element={<ShipmentHistory />} />
                <Route path="tracking" element={<TrackingPage />} />
                <Route path="about" element={<AppAbout />} />
                <Route path="support" element={<AppSupport />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="*" element={<AppNotFoundWithLayout />} />
              </Routes>
            </AppLayout>
          </ProtectedRoutes>
        }
      />

      {/* Legacy redirects for old app routes */}
      <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
      <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
      <Route path="/shipment-history" element={<Navigate to="/app/shipment-history" replace />} />
      <Route path="/tracking" element={<Navigate to="/app/tracking" replace />} />

          {/* Catch-all route for 404 */}
          <Route path="*" element={<SmartNotFound />} />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  );
}
