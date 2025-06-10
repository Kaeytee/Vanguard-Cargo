import "./App.css";
import { Routes, Route } from "react-router-dom";
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
import SubmitShipment from "./app/submitShipment/submitShipment";
import ProtectedRoutes from "./components/protectedRoutes";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="*" element={<div>404 Not Found</div>} />
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* created protected routes for the application */}
        <Route path="/dashboard" element={
          <ProtectedRoutes>
            <Dashboard />
          </ProtectedRoutes>
        } />
        <Route path="/profile" element={
          <ProtectedRoutes>
            <Profile />
          </ProtectedRoutes>
        } />
        <Route path="/settings" element={
          <ProtectedRoutes>
            <Settings />
          </ProtectedRoutes>
        } />
        <Route path="/shipmentHistory" element={
          <ProtectedRoutes>
            <ShipmentHistory />
          </ProtectedRoutes>
        } />
        <Route path="/submitShipment" element={
          <ProtectedRoutes>
            <SubmitShipment />
          </ProtectedRoutes>
        } />
        {/* The protectedRoutes component will check if the user is authenticated before rendering the component */}

      </Routes>
      <Footer />
    </>
  );
}
