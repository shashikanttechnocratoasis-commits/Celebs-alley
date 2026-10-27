"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Cpu,
  Calendar,
  Phone,
  ArrowRight,
  ShieldCheck,
  Flame,
  Award,
  ShoppingBag,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { GoldDust } from "@/components/ui/GoldDust";
import { useAppStore } from "@/store";
import { CartDrawer } from "@/components/cart/CartDrawer";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Services",
    href: "/services",
    hasMegaMenu: true,
  },
  { label: "AI Analysis", href: "/technology" },
  { label: "Shop", href: "/shop" },
  { label: "Experts", href: "/experts" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const FEATURED_SERVICES = [
  {
    title: "AI Cellular Skin Analysis",
    href: "/services/ai-skin-analysis",
    category: "Virtual Diagnostic",
    icon: Cpu,
    price: "₹1,500",
    desc: "Multi-spectral 8-parameter scan decoded by MD Dermatologists.",
  },
  {
    title: "Royal Gold Kanza Glow",
    href: "/services/gold-kanza-facial",
    category: "In-Clinic Ritual",
    icon: Sparkles,
    price: "₹4,500",
    desc: "24K gold nano-particles & bronze marma massage.",
  },
  {
    title: "Clinical Salicylic Peel",
    href: "/services/clinical-pore-peel",
    category: "Clinical Treatment",
    icon: Flame,
    price: "₹2,800",
    desc: "Resurfacing pore unclogging without harsh downtime.",
  },
  {
    title: "Cryo-Peptide Sculpting",
    href: "/services/cryo-peptide-firming",
    category: "In-Clinic Ritual",
    icon: ShieldCheck,
    price: "₹5,200",
    desc: "Sub-zero cryo-tightening with pure copper tri-peptides.",
  },
  {
    title: "Melasma Laser Balancing",
    href: "/services/melasma-laser-toning",
    category: "Laser Aesthetics",
    icon: Award,
    price: "₹6,500",
    desc: "Q-switched Nd:YAG targeting deep dermal pigment.",
  },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const { currentUser, currentRole, cart, setCartDrawerOpen } = useAppStore();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const megaMenuTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Blurred glass styling after 40px
      setScrolled(currentScrollY > 40);

      // Hide on scroll down, show on scroll up (after 100px)
      if (currentScrollY > 100 && currentScrollY > lastScrollY.current + 8) {
        setHidden(true);
      } else if (currentScrollY < lastScrollY.current - 8 || currentScrollY <= 40) {
        setHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setServicesMenuOpen(false);
  }, [pathname]);

  const handleMouseEnterServices = () => {
    if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current);
    setServicesMenuOpen(true);
  };

  const handleMouseLeaveServices = () => {
    megaMenuTimeout.current = setTimeout(() => {
      setServicesMenuOpen(false);
    }, 200);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          hidden ? "-translate-y-full" : "translate-y-0"
        } ${
          scrolled
            ? "bg-bg-base/85 backdrop-blur-xl border-b border-gold-500/20 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            : "bg-transparent py-5 border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group focus:outline-none">
            <Logo variant="full" surface="dark" className="h-10 w-auto transition-transform duration-300 group-hover:scale-105" />
          </Link>

          {/* Desktop & Tablet Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);

              if (link.hasMegaMenu) {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={handleMouseEnterServices}
                    onMouseLeave={handleMouseLeaveServices}
                  >
                    <Link
                      href={link.href}
                      className={`relative px-3 py-1.5 text-xs lg:text-sm font-medium tracking-wide transition-colors duration-200 flex items-center gap-1 rounded-md ${
                        isActive
                          ? "text-gold-300 font-semibold"
                          : "text-text-muted hover:text-gold-200"
                      }`}
                    >
                      {link.label}
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          servicesMenuOpen ? "rotate-180 text-gold-400" : ""
                        }`}
                      />
                      {isActive && (
                        <motion.div
                          layoutId="nav-underline"
                          className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>

                    {/* Desktop Mega Menu */}
                    <AnimatePresence>
                      {servicesMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 12, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[580px] z-50"
                        >
                          <div className="bg-bg-surface/95 backdrop-blur-2xl border border-gold-500/30 rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                            <div className="flex items-center justify-between pb-3 border-b border-gold-500/20 mb-3 px-2">
                              <span className="text-xs font-semibold tracking-wider text-gold-400 uppercase">
                                Featured Clinical Treatments
                              </span>
                              <Link
                                href="/services"
                                className="text-xs text-text-muted hover:text-gold-300 flex items-center gap-1 transition-colors"
                              >
                                View All (10) <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                              {FEATURED_SERVICES.map((srv) => {
                                const Icon = srv.icon;
                                return (
                                  <Link
                                    key={srv.href}
                                    href={srv.href}
                                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gold-500/10 border border-transparent hover:border-gold-500/20 transition-all duration-200 group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400 group-hover:bg-gold-500 group-hover:text-bg-base transition-colors">
                                        <Icon className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-text-primary group-hover:text-gold-300 transition-colors">
                                          {srv.title}
                                        </p>
                                        <p className="text-xs text-text-muted line-clamp-1">
                                          {srv.desc}
                                        </p>
                                      </div>
                                    </div>
                                    <span className="text-xs font-semibold text-gold-400 ml-2 whitespace-nowrap">
                                      {srv.price}
                                    </span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-1.5 text-xs lg:text-sm font-medium tracking-wide transition-colors duration-200 rounded-md ${
                    isActive
                      ? "text-gold-300 font-semibold"
                      : "text-text-muted hover:text-gold-200"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Cart Icon if customer logged in */}
            {currentUser && (
              <button
                type="button"
                onClick={() => setCartDrawerOpen(true)}
                className="relative p-2 rounded-full bg-surface/80 border border-gold-400/30 text-cream-200 hover:text-gold-300 transition-colors"
                aria-label="Open Cart"
              >
                <ShoppingBag className="w-4 h-4 text-gold-400" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-gold-400 text-base text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {cart.reduce((sum, it) => sum + it.quantity, 0)}
                  </span>
                )}
              </button>
            )}

            {currentUser ? (
              <Link
                href="/app"
                className="text-xs lg:text-sm font-medium text-gold-300 hover:text-gold-200 transition-colors px-2 py-1"
              >
                My Account
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="text-xs lg:text-sm font-medium text-text-muted hover:text-gold-300 transition-colors px-2 py-1"
              >
                Sign In
              </Link>
            )}

            <Link href="/book" className="shrink-0">
              <Button
                variant="gold"
                size="sm"
                leftIcon={<Calendar className="w-3.5 h-3.5" />}
                className="shadow-gold-sm hover:shadow-gold-md font-medium text-xs lg:text-sm uppercase tracking-wider whitespace-nowrap"
              >
                Book Consultation
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Hamburger (<768px) */}
          <div className="flex md:hidden items-center gap-2">
            {currentUser && (
              <button
                type="button"
                onClick={() => setCartDrawerOpen(true)}
                className="relative p-2 rounded-full bg-surface/80 border border-gold-400/30 text-cream-200"
                aria-label="Open Cart"
              >
                <ShoppingBag className="w-4 h-4 text-gold-400" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-gold-400 text-base text-[10px] font-bold flex items-center justify-center">
                    {cart.reduce((sum, it) => sum + it.quantity, 0)}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="p-2 rounded-lg text-gold-400 hover:text-gold-200 hover:bg-gold-500/10 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Cart Drawer Mount */}
      <CartDrawer />

      {/* Full-Screen Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 md:hidden bg-bg-base/98 backdrop-blur-2xl flex flex-col justify-between p-6 overflow-y-auto"
          >
            {/* Background Gold Dust Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <GoldDust count={30} speed={0.4} />
            </div>

            {/* Top Bar inside Drawer */}
            <div className="relative z-10 flex items-center justify-between pb-6 border-b border-gold-500/20">
              <Logo variant="full" surface="dark" className="h-9 w-auto" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 rounded-full border border-gold-500/30 text-gold-400 hover:text-gold-200 hover:bg-gold-500/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Staggered Navigation Links */}
            <div className="relative z-10 my-auto py-8 flex flex-col gap-4">
              {NAV_LINKS.map((link, idx) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname === link.href || pathname.startsWith(`${link.href}/`);

                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * idx, duration: 0.3 }}
                  >
                    <Link
                      href={link.href}
                      className={`text-2xl font-heading tracking-wide flex items-center justify-between py-1.5 transition-colors ${
                        isActive
                          ? "text-gold-300 font-semibold"
                          : "text-text-secondary hover:text-gold-200"
                      }`}
                    >
                      <span>{link.label}</span>
                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-gold-400 shadow-gold-sm" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom Actions & Socials */}
            <div className="relative z-10 pt-6 border-t border-gold-500/20 space-y-4">
              <Link href="/book" className="block w-full">
                <Button
                  variant="gold"
                  size="lg"
                  leftIcon={<Calendar className="w-4 h-4" />}
                  className="w-full justify-center"
                >
                  Book Consultation
                </Button>
              </Link>

              <div className="flex items-center justify-between text-xs text-text-muted pt-2">
                <Link href="/seller/register" className="text-gold-400 font-semibold hover:text-gold-300 transition-colors flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Become a Seller
                </Link>
                <Link href="/demo" className="hover:text-gold-300 transition-colors">
                  Demo Hub
                </Link>
                <a
                  href="tel:+919824424455"
                  className="flex items-center gap-1.5 text-gold-400 hover:text-gold-300"
                >
                  <Phone className="w-3.5 h-3.5" /> +91 98244 24455
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
