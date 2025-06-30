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
import Dashboard from "./app/dashboard/dashboard";
import Settings from "./app/settings/settings";
import Profile from "./app/profile/profile";
import ShipmentHistory from "./app/shipmentHistory/shipmentHistory";
import SubmitRequest from "./app/submitRequest/submitRequest";
import TrackingPage from "./app/tracking/tracking";
import AppAbout from "./app/about/Appabout";
import AppSupport from "./app/support/Appsupport";
import ProtectedRoutes from "./components/protectedRoutes";
import AppLayout from "./components/AppLayout";

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
      <Route
        path="/login"
        element={
          <>
            <Navbar />
            <Login />
            <Footer />
          </>
        }
      />
      <Route
        path="/register"
        element={
          <>
            <Navbar />
            <Register />
            <Footer />
          </>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <>
            <Navbar />
            <ForgotPassword />
            <Footer />
          </>
        }
      />

      {/* Protected Routes - Client App with AppLayout */}
      <Route
        path="/app"
        element={
          <ProtectedRoutes>
            <AppLayout />
          </ProtectedRoutes>
        }
      >
        {/* Child routes for the app section */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="shipment-history" element={<ShipmentHistory />} />
        <Route path="submit-request" element={<SubmitRequest />} />
        <Route path="tracking" element={<TrackingPage />} />
        <Route path="about" element={<AppAbout />} />
        <Route path="support" element={<AppSupport />} />
        
        {/* Default route for /app path */}
        <Route index element={<Dashboard />} />
      </Route>

      {/* Legacy routes - redirect to new structure for backward compatibility */}
      <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
      <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
      <Route path="/shipmentHistory" element={<Navigate to="/app/shipment-history" replace />} />
      <Route path="/submitRequest" element={<Navigate to="/app/submit-request" replace />} />
      <Route path="/submitShipment" element={<Navigate to="/app/submit-request" replace />} />
      <Route path="/submit-shipment" element={<Navigate to="/app/submit-request" replace />} />
      <Route path="/tracking" element={<Navigate to="/app/tracking" replace />} />

      {/* 404 Route */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}
