import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
// import { useTheme } from "../context/ThemeProvider";
import { useAuth } from "../context/AuthProvider";

export default function Navbar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const location = useLocation();
	const pathname = location.pathname;
	const { user, logout } = useAuth();
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

	// Navigation links
	const navLinks = [
		...(user ? [{ href: "/dashboard", label: "Dashboard" }] : []),
		{ href: "/", label: "Home" },
		{ href: "/about", label: "About Us" },
		{ href: "/services", label: "Services" },
		{ href: "/contact", label: "Contact" },
	];

	const hideLogin = pathname === "/login";
	const hideRegister = pathname === "/register";

	return (
		<header className={cn(
			"bg-white w-full fixed top-0 left-0 right-0 z-50 transition-all duration-300",
			scrolled ? "shadow-md border-b border-gray-200" : "shadow-sm border-b border-gray-100"
		)}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<Link to="/" className="flex-shrink-0">
						<span className="text-2xl font-bold text-red-600 tracking-tight">
							Ttarius Logistics
						</span>
					</Link>					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center space-x-8">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								to={link.href}
								className={cn(
									"px-3 py-2 text-sm font-medium transition-colors duration-200 relative group",
									pathname === link.href
										? "text-red-600"
										: "text-gray-700 hover:text-red-600"
								)}
							>
								{link.label}
								<span className={cn(
									"absolute bottom-0 left-0 h-0.5 bg-red-600 transition-all duration-200",
									pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
								)}></span>
							</Link>
						))}
					</div>

					{/* Desktop Auth Buttons */}
					<div className="hidden md:flex items-center space-x-3">
						{user ? (
							<div className="flex items-center gap-3">
								{user.email && (
									<span className="text-sm text-gray-600 mr-2">{user.email}</span>
								)}
								<Button onClick={logout} variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">Logout</Button>
							</div>
						) : (
							<>
								{!hideLogin && (
									<Link
										to="/login"
										className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors duration-200 rounded-md hover:bg-red-50 border border-red-600"
									>
										Log In
									</Link>
								)}
								{!hideRegister && (
									<Link
										to="/register"
										className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
									>
										Register
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
							className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-red-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500 transition-colors duration-200"
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
						className="fixed inset-0 z-40 flex flex-col bg-white/95 backdrop-blur-sm md:hidden overflow-y-auto pt-16"
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2 }}
						ref={navRef}
					>
						<nav className="flex flex-col gap-2 p-6">
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
											"text-base font-medium p-3 hover:bg-red-50 rounded-md block transition-colors",
											pathname === link.href ? "text-red-600 bg-red-50" : "text-gray-800"
										)}
										onClick={() => setIsMenuOpen(false)}
									>
										{link.label}
									</Link>
								</motion.div>
							))}

							{/* Mobile Auth buttons */}
							<motion.div
								className="flex flex-col gap-3 mt-6 border-t border-gray-100 pt-6"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.2, delay: 0.3 }}
							>
								{user ? (
									<>
										{user.email && (
											<span className="text-sm text-gray-600 mb-2 text-center">{user.email}</span>
										)}
										<Button
											onClick={logout}
											variant="outline"
											className="w-full border-red-600 text-red-600 hover:bg-red-50"
										>
											Logout
										</Button>
									</>
								) : (
									<>
										{!hideLogin && (
											<Link
												to="/login"
												onClick={() => setIsMenuOpen(false)}
												className="w-full px-4 py-2 text-center text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors duration-200"
											>
												Login
											</Link>
										)}
										{!hideRegister && (
											<Link
												to="/register"
												onClick={() => setIsMenuOpen(false)}
												className="w-full px-4 py-2 text-center bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 mt-2"
											>
												Register
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