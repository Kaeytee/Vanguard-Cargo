import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import Home from "./landing/home/home";
import About from "./landing/about/about";
import Services from "./landing/services/services";
import Contact from "./landing/contact/contact";
import Login from "./landing/login/login";
import Register from "./landing/register/register";
import ForgotPassword from "./landing/forgot-password/forgot-password";
import EmailVerification from "./landing/email-verification/email-verification";
import Dashboard from "./app/dashboard/dashboard";
import Settings from "./app/settings/settings";
import Profile from "./app/profile/profile";
import ShipmentHistory from "./app/shipmentHistory/shipmentHistory";
import TrackingPage from "./app/tracking/tracking";
import AppAbout from "./app/about/Appabout";
import AppSupport from "./app/support/Appsupport";
import NotificationsPage from "./app/notification/notification";
import ProtectedRoutes from "./components/protectedRoutes";
import AppLayout from "./components/AppLayout";
import SmartNotFound from "./components/SmartNotFound";
import AppNotFoundWithLayout from "./app/layouts/AppNotFoundWithLayout";
import { featureFlags } from "./config/featureFlags";
import MockDataDebug from "./components/MockDataDebug";

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
      <Route
        path="/about"
        element={
          <>
            <Navbar />
            <About />
            <Footer />
          </>
        }
      />
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
      {/* Authentication Routes */}
      <Route path="/auth" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={
          featureFlags.authEnabled ? (
            <>
              <Navbar />
              <Login />
              <Footer />
            </>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/register"
        element={
          featureFlags.authEnabled ? (
            <>
              <Navbar />
              <Register />
              <Footer />
            </>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />


      
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-email" element={<EmailVerification />} />

      {/* Protected Routes - Client App with AppLayout */}
      <Route
        path="/app/*"
        element={
          <ProtectedRoutes>
            <AppLayout>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
                <Route path="shipment-history" element={<ShipmentHistory />} />
                <Route path="tracking" element={<TrackingPage />} />
                <Route path="about" element={<AppAbout />} />
                <Route path="support" element={<AppSupport />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="debug" element={<MockDataDebug />} />
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
  );
}
