"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store";
import { getHomeRouteForRole } from "@/config/permissions";
import type { Role, User } from "@/types";
import initialUsers from "@/data/users.json";

import { Logo } from "@/components/ui/Logo";
import { GoldDust } from "@/components/ui/GoldDust";
import { TiltCard } from "@/components/ui/TiltCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { showToast } from "@/components/ui/Toast";

import {
  Sparkles,
  Shield,
  Store,
  Stethoscope,
  User as UserIcon,
  RotateCcw,
  ArrowRight,
  ExternalLink,
  LogOut,
  CheckCircle2,
  Lock,
  Eye,
  Sliders,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface RoleGroup {
  groupTitle: string;
  groupDescription: string;
  icon: React.ReactNode;
  roles: {
    role: Role;
    title: string;
    description: string;
    badge: string;
    landingRoute: string;
    userId: string;
  }[];
}

export default function DemoHubPage() {
  const router = useRouter();
  const {
    currentUser,
    currentRole,
    loginAs,
    switchRole,
    logout,
    resetDemoData,
  } = useAppStore();

  const [transitioningUser, setTransitioningUser] = useState<User | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const roleGroups: RoleGroup[] = [
    {
      groupTitle: "Consumer & AI Experience",
      groupDescription: "B2C Simulated 8-parameter facial diagnosis and multi-seller boutique shopping.",
      icon: <UserIcon className="w-5 h-5 text-[#E8C77A]" />,
      roles: [
        {
          role: "Customer",
          title: "End Consumer (Customer)",
          description: "Performs AI facial scan, reviews 8-parameter breakdown scores, and buys luxury products.",
          badge: "B2C Shopper",
          landingRoute: "/app",
          userId: "user-customer",
        },
      ],
    },
    {
      groupTitle: "Distributor & Brand SaaS (B2B)",
      groupDescription: "Multi-tenant inventory, batch tracking, staff RBAC, and settlement ledgers.",
      icon: <Store className="w-5 h-5 text-[#E8C77A]" />,
      roles: [
        {
          role: "Distributor Owner",
          title: "Distributor Owner (Royal Beauty Logistics)",
          description: "Full owner access: SaaS subscription, revenue analytics, staff RBAC, and payouts.",
          badge: "Full SaaS Admin",
          landingRoute: "/seller",
          userId: "user-seller-owner",
        },
        {
          role: "Distributor Manager",
          title: "Distributor Manager (Operations)",
          description: "Operational management of product listings, orders, and customer queries.",
          badge: "Operations",
          landingRoute: "/seller",
          userId: "user-seller-manager",
        },
        {
          role: "Inventory Manager",
          title: "Inventory Manager (Warehouse)",
          description: "Manages stock counts and SKU thresholds. Restricted from revenue and payouts.",
          badge: "Stock Only",
          landingRoute: "/seller/inventory",
          userId: "user-inventory-manager",
        },
        {
          role: "Order Manager",
          title: "Order Manager (Fulfillment Queue)",
          description: "Full control over shipment queue, packing slips, courier dispatch, and return decisions.",
          badge: "Orders & Returns",
          landingRoute: "/seller/orders",
          userId: "user-order-manager",
        },
        {
          role: "Sales Executive",
          title: "Sales Executive (Account Management)",
          description: "Handles distributor customer orders, shipping labels, and customer communication.",
          badge: "Fulfillment",
          landingRoute: "/seller/orders",
          userId: "user-sales-exec",
        },
        {
          role: "Accountant",
          title: "Accountant (Finance & Tax)",
          description: "Governs platform payouts, settlement cycles, GST invoices, and subscription expenses.",
          badge: "Finance Only",
          landingRoute: "/seller/payouts",
          userId: "user-accountant",
        },
        {
          role: "Distributor Owner",
          title: "Seller (KYC Pending)",
          description: "Demonstrates the locked KYC pending state with verification timeline and demo approval tools.",
          badge: "KYC Pending",
          landingRoute: "/seller",
          userId: "user-seller-pending",
        },
        {
          role: "Distributor Owner",
          title: "Seller (KYC Rejected)",
          description: "Demonstrates the KYC rejected state with auditor reason and fix-and-resubmit workflow.",
          badge: "KYC Rejected",
          landingRoute: "/seller",
          userId: "user-seller-rejected",
        },
      ],
    },
    {
      groupTitle: "Super Admin & Governance",
      groupDescription: "Master control over the 8 AI parameters, rules, transactions, and audit logs.",
      icon: <Shield className="w-5 h-5 text-[#E8C77A]" />,
      roles: [
        {
          role: "Super Admin",
          title: "Super Admin (Global Master)",
          description: "Complete platform governance: AI Engine weights, distributor approval, finance & security audit.",
          badge: "Master Access",
          landingRoute: "/admin",
          userId: "user-super-admin",
        },
        {
          role: "Admin",
          title: "Platform Admin (Operations)",
          description: "User moderation, distributor onboarding, product review, and marketing CMS.",
          badge: "Platform Ops",
          landingRoute: "/admin",
          userId: "user-admin",
        },
        {
          role: "Product Manager",
          title: "Product Manager (Catalog & Brands)",
          description: "Oversees beauty brands, categories, 25 ingredients, and safety compliance.",
          badge: "Catalog Lead",
          landingRoute: "/admin/marketplace/products",
          userId: "user-product-manager",
        },
        {
          role: "AI/Rule Manager",
          title: "AI/Rule Manager (Parameter Engine)",
          description: "Calibrates the 8 skin parameters, weight formulas, and algorithmic versions.",
          badge: "AI Engine",
          landingRoute: "/admin/ai-engine/parameters",
          userId: "user-ai-manager",
        },
        {
          role: "Support Agent",
          title: "Support Agent (Concierge)",
          description: "Resolves customer support tickets, order inquiries, and consultation reschedules.",
          badge: "Help Desk",
          landingRoute: "/admin/support",
          userId: "user-support",
        },
        {
          role: "Finance Manager",
          title: "Finance Manager (Settlements)",
          description: "Governs platform rake commissions, distributor payouts, refunds, and ledgers.",
          badge: "Financial Ops",
          landingRoute: "/admin/finance",
          userId: "user-finance",
        },
      ],
    },
    {
      groupTitle: "Clinical & Telemedicine",
      groupDescription: "Dermatological video consultations, custom prescriptions, and client histories. Test multi-tenant isolation.",
      icon: <Stethoscope className="w-5 h-5 text-[#E8C77A]" />,
      roles: [
        {
          role: "Consultant",
          title: "Dr. Meera Nambiar (Chief Dermatologist)",
          description: "Specialty in Barrier Repair & Acne. 8 appointments, custom clinical regimens, SOAP notes.",
          badge: "MD Derm (cons-1)",
          landingRoute: "/consultant",
          userId: "user-consultant",
        },
        {
          role: "Consultant",
          title: "Dr. Aditya Singhal (Aesthetic Physician)",
          description: "Specialty in Pigmentation & Melasma. Distinct patient caseload and availability schedule.",
          badge: "MD Derm (cons-2)",
          landingRoute: "/consultant",
          userId: "user-consultant-2",
        },
        {
          role: "Consultant",
          title: "Dr. Shalini Deshmukh (Cosmetologist)",
          description: "Specialty in Anti-Aging & Peels. Distinct appointment waitlist and clinical protocols.",
          badge: "Aesthetic MD (cons-3)",
          landingRoute: "/consultant",
          userId: "user-consultant-3",
        },
      ],
    },
  ];

  const handleSelectRole = (userId: string, targetRoute: string) => {
    const user = (initialUsers as User[]).find((u) => u.id === userId) || {
      id: userId,
      name: "Demo User",
      email: "demo@celebsalley.com",
      phone: "+91 98200 00000",
      role: "Customer",
      avatar: "/avatars/default.jpg",
    };

    setTransitioningUser(user as User);
    loginAs(user as User);

    setTimeout(() => {
      router.push(targetRoute);
    }, 1100);
  };

  return (
    <div className="min-h-screen bg-[#0B0907] text-[#F5EDE0] flex flex-col justify-between relative overflow-hidden font-sans pb-16">
      {/* Background Gold Ambient Dust */}
      <GoldDust particleCount={60} speedMultiplier={0.9} />

      {/* Cinematic Transition Screen Overlay */}
      <AnimatePresence>
        {transitioningUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0B0907]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 max-w-md"
            >
              <Avatar
                src={transitioningUser.avatar}
                name={transitioningUser.name}
                size="xl"
                className="mx-auto ring-4 ring-[#E8C77A]/40 shadow-[0_0_30px_rgba(201,154,69,0.5)]"
              />

              <div className="space-y-2">
                <span className="text-xs uppercase tracking-[0.3em] text-[#A89A85] font-semibold">
                  Authenticating Demo Session
                </span>
                <h2 className="text-3xl font-heading font-semibold text-[#E8C77A]">
                  Entering as {transitioningUser.name}
                </h2>
                <Badge variant="gold" size="lg">
                  {transitioningUser.role}
                </Badge>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-[#A89A85]">
                <div className="w-4 h-4 border-2 border-[#E8C77A] border-t-transparent rounded-full animate-spin" />
                <span>Loading role privileges & workspace...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between border-b border-[#C99A45]/20 bg-[#0B0907]/80 backdrop-blur-md">
        <Logo size="md" href="/" />

        <div className="flex items-center gap-3">
          {/* Active Session Indicator */}
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#1A130B] border border-[#C99A45]/30 text-xs">
              <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
              <div className="flex flex-col text-left leading-tight">
                <span className="font-semibold text-[#F5EDE0]">{currentUser.name}</span>
                <span className="text-[10px] text-[#C99A45] uppercase">{currentRole}</span>
              </div>
            </div>
          )}

          {/* Reset Demo Data Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setResetModalOpen(true)}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            <span className="hidden sm:inline">Reset Demo Data</span>
            <span className="sm:hidden">Reset</span>
          </Button>

          {/* Public Website Link */}
          <Link href="/">
            <Button variant="ghost" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              <span className="hidden md:inline">Public Site</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12 flex-1 w-full">
        {/* Page Title */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <Badge variant="gold" size="lg">
            Interactive Multi-Role Switcher
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-heading font-semibold text-[#F5EDE0]">
            Experience Celebs Alley from{" "}
            <span className="font-script text-4xl sm:text-6xl gold-gradient-text">
              Every Perspective
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#A89A85] font-sans leading-relaxed">
            Select any of the 12 pre-seeded persona accounts below to enter their dedicated SaaS panel
            with real-time cross-panel synchronization and role-based permissions.
          </p>
        </div>

        {/* Guided Walkthrough Banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[#1A130B] via-[#2D1D0E] to-[#140F0A] border-2 border-[#C99A45]/40 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[#E8C77A] font-semibold">
              <Sparkles className="w-4 h-4" /> GUIDED END-TO-END DEMO SCRIPT
            </div>
            <h3 className="font-serif text-lg text-[#F5EDE0] font-bold">
              Cross-Panel 10-Scenario Walkthrough
            </h3>
            <p className="text-xs text-[#A89A85]">
              Step-by-step interactive script with 1-click role switching and live verification across all 5 panels.
            </p>
          </div>
          <Button asChild variant="gold" size="sm" className="shrink-0 text-xs py-2 px-5">
            <Link href="/demo/walkthrough">
              Launch Walkthrough <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
        </div>

        {/* Role Cards Grouped */}
        <div className="space-y-12">
          {roleGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-4">
              {/* Group Header */}
              <div className="flex items-center gap-3 pb-2 border-b border-[#C99A45]/20">
                <div className="p-2 rounded-xl bg-[#241A0F] border border-[#C99A45]/30">
                  {group.icon}
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-heading font-semibold text-[#E8C77A]">
                    {group.groupTitle}
                  </h2>
                  <p className="text-xs text-[#A89A85] font-sans">
                    {group.groupDescription}
                  </p>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {group.roles.map((r) => {
                  const matchingUser = (initialUsers as User[]).find((u) => u.id === r.userId);
                  const isCurrentActive = currentUser?.role === r.role;

                  return (
                    <TiltCard key={r.userId} className="h-full">
                      <div
                        onClick={() => handleSelectRole(r.userId, r.landingRoute)}
                        className={`h-full p-6 rounded-3xl bg-[#1A130B] border transition-all duration-300 flex flex-col justify-between cursor-pointer group shadow-[0_8px_30px_rgba(0,0,0,0.6)] ${
                          isCurrentActive
                            ? "border-[#E8C77A] bg-[#241A0F] ring-2 ring-[#E8C77A]/40 shadow-[0_0_25px_rgba(201,154,69,0.3)]"
                            : "border-[#C99A45]/20 hover:border-[#E8C77A]/70 hover:bg-[#241A0F]/80"
                        }`}
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <Avatar
                              src={matchingUser?.avatar}
                              name={matchingUser?.name || r.role}
                              size="md"
                              className="group-hover:scale-105 transition-transform"
                            />
                            <Badge variant={isCurrentActive ? "gold" : "outline"} size="sm">
                              {r.badge}
                            </Badge>
                          </div>

                          <div>
                            <h3
                              className="text-base font-heading font-semibold text-[#F5EDE0] group-hover:text-[#E8C77A] transition-colors"
                              style={{ color: "#F5EDE0" }}
                            >
                              {matchingUser?.name}
                            </h3>
                            <span
                              className="text-[11px] font-semibold text-[#C99A45] tracking-wider uppercase block mt-0.5"
                              style={{ color: "#C99A45" }}
                            >
                              {r.role}
                            </span>
                            <p
                              className="text-xs text-[#A89A85] font-sans leading-relaxed mt-2.5"
                              style={{ color: "#A89A85" }}
                            >
                              {r.description}
                            </p>
                          </div>
                        </div>

                        <div className="pt-5 mt-4 border-t border-[#C99A45]/15 flex items-center justify-between text-xs font-semibold">
                          <span className={isCurrentActive ? "text-[#5FAF7A]" : "text-[#A89A85]"}>
                            {isCurrentActive ? "✓ Active Session" : "Click to Enter"}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-[#0B0907] border border-[#C99A45]/30 flex items-center justify-center text-[#E8C77A] group-hover:bg-[#C99A45] group-hover:text-[#0B0907] transition-all">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </TiltCard>
                  );
                })}
              </div>
            </div>
          ))}

          {/* View Public Website Card */}
          <div className="pt-4">
            <div
              onClick={() => router.push("/")}
              className="p-8 rounded-3xl bg-gradient-to-r from-[#1A130B] via-[#241A0F] to-[#1A130B] border border-[#C99A45]/40 hover:border-[#E8C77A] transition-all cursor-pointer flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_10px_35px_rgba(0,0,0,0.7)] group"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="w-14 h-14 rounded-2xl bg-[#C99A45]/20 border border-[#C99A45]/40 flex items-center justify-center text-[#E8C77A] group-hover:scale-110 transition-transform">
                  <Eye className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-heading font-semibold text-[#F5EDE0] group-hover:text-[#E8C77A] transition-colors">
                    View Public Marketing Website
                  </h3>
                  <p className="text-xs text-[#A89A85] font-sans mt-0.5">
                    Explore multi-page marketing placeholders: /about, /services, /technology, /experts, /blog, and /faq.
                  </p>
                </div>
              </div>

              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Visit Landing Page
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Reset Demo Data Confirm Dialog */}
      <ResponsiveDialog
        open={resetModalOpen}
        onOpenChange={setResetModalOpen}
        title="Reset All Demo Data?"
        description="This will restore all 24 datasets (AI parameters, catalog, orders, scans) to their initial seed state."
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-[#A89A85] leading-relaxed font-sans">
            Any customer orders placed, parameters edited in the Super Admin engine, or inventory changes
            made during your current session will be refreshed.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#C99A45]/20">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setResetModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                resetDemoData();
                setResetModalOpen(false);
                showToast.success("All demo data reset to seed state!");
              }}
            >
              Confirm Reset
            </Button>
          </div>
        </div>
      </ResponsiveDialog>
    </div>
  );
}