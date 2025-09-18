import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
// import { useTheme } from "../context/ThemeProvider";
import { useAuth } from "../hooks/useAuth";
import { useLogout } from "../hooks/useLogout";
import { featureFlags } from "../config/featureFlags";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;
  const { user } = useAuth();
  const { confirmLogout } = useLogout();
  const navRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Handle scroll position with simple throttling
  const updateScroll = useCallback(() => {
    setScrolled(window.scrollY > 10);
  }, []);

  useEffect(() => {
    // Set initial scroll state
    updateScroll();

    // Simple throttling without lodash
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [updateScroll]);

  // Reset menu on pathname change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Handle body overflow for mobile menu
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Handle outside click to close menu
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        navRef.current &&
        !navRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Navigation links focused on package forwarding
  const navLinks = [
    ...(user ? [{ href: "/dashboard", label: "My Packages" }] : []),
    { href: "/", label: "Home" },
    { href: "/services", label: "How It Works" },
    { href: "/about", label: "Why Choose Us" },
    { href: "/contact", label: "Support" },
  ];

  const hideLogin = pathname === "/login";
  const hideRegister = pathname === "/register";

  return (
    <header
      className={cn(
        "bg-white w-full fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "shadow-md border-b border-gray-200"
          : "shadow-sm border-b border-gray-100"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
              Vanguard Cargo
            </span>
          </Link>
          
          {/* Desktop Navigation - Hidden on tablet and below */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors duration-200 relative group",
                  pathname === link.href
                    ? "text-primary"
                    : "text-gray-700 hover:text-primary"
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute bottom-0 left-0 h-0.5 bg-red-600 transition-all duration-200",
                    pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                  )}
                ></span>
              </Link>
            ))}
          </div>
          
          {/* Tablet Navigation - Compact nav for medium screens */}
          <div className="hidden md:flex lg:hidden items-center space-x-4">
            {navLinks.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "px-2 py-1 text-sm font-medium transition-colors duration-200 relative group",
                  pathname === link.href
                    ? "text-primary"
                    : "text-gray-700 hover:text-primary"
                )}
              >
                {link.label === "How It Works" ? "Services" : link.label === "Why Choose Us" ? "About" : link.label}
                <span
                  className={cn(
                    "absolute bottom-0 left-0 h-0.5 bg-red-600 transition-all duration-200",
                    pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                  )}
                ></span>
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons - Full size for large screens */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center gap-3">
                {user.email && (
                  <span className="text-sm text-gray-600 mr-2 hidden xl:block">
                    {user.email}
                  </span>
                )}
                <Button
                  onClick={confirmLogout}
                  variant="outline"
                  className="border-primary text-primary hover:bg-red-600/10"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                {!hideLogin && (
                  <Link
                    to={featureFlags.authEnabled ? "/login" : "/"}
                    className={cn(
                      "px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-all duration-200 rounded-md hover:bg-red-600/10 border border-primary",
                      !featureFlags.authEnabled && "opacity-0 cursor-not-allowed pointer-events-none"
                    )}
                    title={!featureFlags.authEnabled ? "Authentication temporarily disabled" : "Log in to your account"}
                  >
                    Log In
                  </Link>
                )}
                {!hideRegister && (
                  <Link
                    to={featureFlags.authEnabled ? "/register" : "/"}
                    className={cn(
                      "px-4 py-2 text-sm text-white font-medium bg-red-600 text-primary-foreground rounded-md hover:bg-red-600/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 shadow-sm flex items-center gap-2",
                      !featureFlags.authEnabled && "opacity-0 cursor-not-allowed pointer-events-none"
                    )}
                    title={!featureFlags.authEnabled ? "Authentication temporarily disabled" : "Get your free US address"}
                  >
                    <span className="hidden xl:inline">Get US Address</span>
                    <span className="xl:hidden">Sign Up</span>
                    <MapPin className="w-4 h-4" />
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Tablet Auth Buttons - Compact for medium screens */}
          <div className="hidden md:flex lg:hidden items-center space-x-2">
            {user ? (
              <Button
                onClick={confirmLogout}
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-red-600/10"
              >
                Logout
              </Button>
            ) : (
              <>
                {!hideLogin && (
                  <Link
                    to={featureFlags.authEnabled ? "/login" : "/"}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-all duration-200 rounded-md hover:bg-red-600/10 border border-primary",
                      !featureFlags.authEnabled && "opacity-0 cursor-not-allowed pointer-events-none"
                    )}
                    title={!featureFlags.authEnabled ? "Authentication temporarily disabled" : "Log in to your account"}
                  >
                    Login
                  </Link>
                )}
                {!hideRegister && (
                  <Link
                    to={featureFlags.authEnabled ? "/register" : "/"}
                    className={cn(
                      "px-3 py-1.5 text-sm text-white font-medium bg-red-600 rounded-md hover:bg-red-600/90 transition-all duration-200 shadow-sm flex items-center gap-1",
                      !featureFlags.authEnabled && "opacity-0 cursor-not-allowed pointer-events-none"
                    )}
                    title={!featureFlags.authEnabled ? "Authentication temporarily disabled" : "Get your free US address"}
                  >
                    Sign Up <MapPin className="w-3 h-3" />
                  </Link>
                )}
              </>
            )}
          </div>
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              ref={menuButtonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-red-600/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-colors duration-200"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-white/98 backdrop-blur-md md:hidden overflow-y-auto pt-16 safe-area-padding"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            ref={navRef}
          >
            <nav className="flex flex-col gap-1 p-6">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 * index }}
                >
                  <Link
                    to={link.href}
                    className={cn(
                      "text-lg font-semibold p-4 rounded-lg block transition-all duration-200 relative",
                      pathname === link.href
                        ? "text-white bg-red-600 shadow-md"
                        : "text-gray-800 hover:text-red-600 hover:bg-red-50 active:bg-red-100"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                    {pathname === link.href && (
                      <span className="absolute inset-0 bg-red-600 rounded-lg -z-10" />
                    )}
                  </Link>
                </motion.div>
              ))}

              {/* Mobile Auth buttons */}
              <motion.div
                className="flex flex-col gap-4 mt-8 border-t border-gray-200 pt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.3 }}
              >
                {user ? (
                  <>
                    {user.email && (
                      <span className="text-sm text-gray-600 mb-2 text-center font-medium">
                        {user.email}
                      </span>
                    )}
                    <Button
                      onClick={confirmLogout}
                      variant="outline"
                      className="w-full py-3 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-semibold text-lg transition-all duration-200"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    {!hideLogin && (
                      <Link
                        to={featureFlags.authEnabled ? "/login" : "/"}
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(
                          "w-full px-6 py-3 text-center text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-600 hover:text-white active:bg-red-700 transition-all duration-200 font-semibold text-lg",
                          !featureFlags.authEnabled && "opacity-50 cursor-not-allowed pointer-events-none"
                        )}
                        title={!featureFlags.authEnabled ? "Authentication temporarily disabled" : "Log in to your account"}
                      >
                        Login
                      </Link>
                    )}
                    {!hideRegister && (
                      <Link
                        to={featureFlags.authEnabled ? "/register" : "/"}
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(
                          "w-full px-6 py-3 text-center bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-all duration-200 font-semibold text-lg shadow-lg flex items-center justify-center gap-2",
                          !featureFlags.authEnabled && "opacity-50 cursor-not-allowed pointer-events-none"
                        )}
                        title={!featureFlags.authEnabled ? "Authentication temporarily disabled" : "Create a new account"}
                      >
                        Get US Address <MapPin className="w-5 h-5" />
                      </Link>
                    )}
                  </>
                )}
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
