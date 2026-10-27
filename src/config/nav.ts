import React from "react";
import {
  Home,
  Scan,
  Activity,
  ShoppingBag,
  ShoppingCart,
  Package,
  Heart,
  Calendar,
  User,
  Shield,
  LayoutDashboard,
  Layers,
  Boxes,
  Users,
  BarChart3,
  UserCheck,
  CreditCard,
  Banknote,
  Settings,
  Sparkles,
  Sliders,
  FileCode,
  Tag,
  Gift,
  HelpCircle,
  FileText,
  DollarSign,
  ShieldAlert,
  KeyRound,
  MessageSquare,
  Clock,
  ClipboardList,
} from "lucide-react";

export interface NavItem {
  id: string;
  title: string;
  href: string;
  iconName: string;
  badge?: string | number;
  permissionGroup?: string;
  phase: number;
  description: string;
}

export interface NavGroup {
  groupTitle?: string;
  items: NavItem[];
}

export interface PanelNavConfig {
  panelName: string;
  baseHref: string;
  groups: NavGroup[];
  mobileBottomTabs: string[]; // item ids that appear on bottom bar
}

// 1. Customer Navigation
export const customerNav: PanelNavConfig = {
  panelName: "Customer Portal",
  baseHref: "/app",
  groups: [
    {
      groupTitle: "Experience",
      items: [
        {
          id: "home",
          title: "Home",
          href: "/app",
          iconName: "Home",
          phase: 3,
          description: "Personalized luxury wellness dashboard and daily skin readiness.",
        },
        {
          id: "scan",
          title: "AI Face Scan",
          href: "/app/scan",
          iconName: "Scan",
          badge: "AI",
          phase: 3,
          description: "High-resolution simulated facial scanning across 8 skin parameters.",
        },
        {
          id: "results",
          title: "Diagnostic Results",
          href: "/app/results",
          iconName: "Activity",
          phase: 3,
          description: "Explainable 8-parameter score breakdowns and custom routine generation.",
        },
      ],
    },
    {
      groupTitle: "Boutique & Orders",
      items: [
        {
          id: "shop",
          title: "Luxury Boutique",
          href: "/app/shop",
          iconName: "ShoppingBag",
          phase: 4,
          description: "Curated multi-seller cosmeceutical marketplace filtered by AI match score.",
        },
        {
          id: "cart",
          title: "Cart",
          href: "/app/cart",
          iconName: "ShoppingCart",
          phase: 4,
          description: "Unified multi-distributor bag with coupon redemption.",
        },
        {
          id: "orders",
          title: "Orders",
          href: "/app/orders",
          iconName: "Package",
          phase: 4,
          description: "Real-time shipment tracking across all authorized distributors.",
        },
        {
          id: "wishlist",
          title: "Wishlist",
          href: "/app/wishlist",
          iconName: "Heart",
          phase: 4,
          description: "Saved luxury formulations and future regimen items.",
        },
      ],
    },
    {
      groupTitle: "Consultations & Account",
      items: [
        {
          id: "consultations",
          title: "Consultations",
          href: "/app/consultations",
          iconName: "Calendar",
          phase: 7,
          description: "Book and attend 1-on-1 virtual sessions with dermatologists.",
        },
        {
          id: "profile",
          title: "Profile & Regimen",
          href: "/app/profile",
          iconName: "User",
          phase: 4,
          description: "Skin type questionnaire responses, addresses, and saved payment methods.",
        },
        {
          id: "privacy",
          title: "Privacy & Data",
          href: "/app/privacy",
          iconName: "Shield",
          phase: 3,
          description: "Manage facial vector encryption, cookies, and personal preferences.",
        },
      ],
    },
  ],
  mobileBottomTabs: ["home", "scan", "shop", "orders", "profile"],
};

// 2. Seller / Distributor Navigation
export const sellerNav: PanelNavConfig = {
  panelName: "Distributor Portal",
  baseHref: "/seller",
  groups: [
    {
      groupTitle: "Overview",
      items: [
        {
          id: "dashboard",
          title: "Dashboard",
          href: "/seller",
          iconName: "LayoutDashboard",
          permissionGroup: "seller_dashboard",
          phase: 5,
          description: "Distributor SaaS overview: revenue, fulfillment velocity, and low-stock alerts.",
        },
      ],
    },
    {
      groupTitle: "Catalog & Warehousing",
      items: [
        {
          id: "products",
          title: "Products",
          href: "/seller/products",
          iconName: "Layers",
          permissionGroup: "seller_products",
          phase: 5,
          description: "Manage SKU listings, pricing, batch certifications, and packaging specs.",
        },
        {
          id: "inventory",
          title: "Inventory",
          href: "/seller/inventory",
          iconName: "Boxes",
          permissionGroup: "seller_inventory",
          phase: 5,
          description: "Multi-warehouse stock counts, reservations, and automated reorder alerts.",
        },
      ],
    },
    {
      groupTitle: "Sales & Fulfillment",
      items: [
        {
          id: "orders",
          title: "Orders",
          href: "/seller/orders",
          iconName: "Package",
          permissionGroup: "seller_orders",
          phase: 5,
          description: "Order fulfillment queue, airway bill generation, and courier tracking.",
        },
        {
          id: "customers",
          title: "Customers",
          href: "/seller/customers",
          iconName: "Users",
          permissionGroup: "seller_customers",
          phase: 5,
          description: "Regional customer purchase frequency and customer service logs.",
        },
        {
          id: "analytics",
          title: "Analytics",
          href: "/seller/analytics",
          iconName: "BarChart3",
          permissionGroup: "seller_analytics",
          phase: 5,
          description: "Revenue velocity, return rates, and high-demand ingredient forecasts.",
        },
      ],
    },
    {
      groupTitle: "Operations & SaaS",
      items: [
        {
          id: "staff",
          title: "Staff and Roles",
          href: "/seller/staff",
          iconName: "UserCheck",
          permissionGroup: "seller_staff",
          phase: 5,
          description: "Manage team member access (Managers, Inventory Clerks, Sales Execs).",
        },
        {
          id: "subscription",
          title: "Subscription",
          href: "/seller/subscription",
          iconName: "CreditCard",
          permissionGroup: "seller_subscription",
          phase: 5,
          description: "Current tier plan (Starter/Business/Empire), billing cycles, and invoices.",
        },
        {
          id: "payouts",
          title: "Payouts",
          href: "/seller/payouts",
          iconName: "Banknote",
          permissionGroup: "seller_payouts",
          phase: 5,
          description: "Bank settlements, commission deductions, and GST tax ledger.",
        },
        {
          id: "settings",
          title: "Settings",
          href: "/seller/settings",
          iconName: "Settings",
          permissionGroup: "seller_settings",
          phase: 5,
          description: "Distributor profile, warehouse dispatch addresses, and notification webhooks.",
        },
      ],
    },
  ],
  mobileBottomTabs: ["dashboard", "products", "orders", "inventory", "more"],
};

// 3. Super Admin Navigation
export const adminNav: PanelNavConfig = {
  panelName: "Super Admin Portal",
  baseHref: "/admin",
  groups: [
    {
      groupTitle: "Governance",
      items: [
        {
          id: "dashboard",
          title: "Dashboard",
          href: "/admin",
          iconName: "LayoutDashboard",
          permissionGroup: "dashboard",
          phase: 6,
          description: "Master governance cockpit: platform Gross Merchandise Value, AI scan volume, and distributor health.",
        },
        {
          id: "users",
          title: "Users",
          href: "/admin/users",
          iconName: "Users",
          permissionGroup: "users",
          phase: 6,
          description: "Global registry of platform customers, dermatologists, and distributor staff.",
        },
        {
          id: "distributors",
          title: "Distributors",
          href: "/admin/distributors",
          iconName: "Boxes",
          permissionGroup: "distributors",
          phase: 6,
          description: "Vetting, GST verification, and plan provisioning for cosmetic distributors.",
        },
      ],
    },
    {
      groupTitle: "AI Parameter Engine",
      items: [
        {
          id: "ai_parameters",
          title: "Parameters",
          href: "/admin/ai-engine/parameters",
          iconName: "Sliders",
          permissionGroup: "ai_engine",
          phase: 6,
          description: "Configure the 8 skin parameters: weights, diagnostic copy, and icons live.",
        },
        {
          id: "ai_rules",
          title: "Matching Rules",
          href: "/admin/ai-engine/rules",
          iconName: "Sparkles",
          permissionGroup: "ai_engine",
          phase: 6,
          description: "Calibrate skin concern to ingredient correlation algorithms.",
        },
        {
          id: "ai_versions",
          title: "AI Engine Versions",
          href: "/admin/ai-engine/versions",
          iconName: "FileCode",
          permissionGroup: "ai_engine",
          phase: 6,
          description: "Diagnostic model rollouts, A/B scoring tests, and audit rollback history.",
        },
      ],
    },
    {
      groupTitle: "Marketplace & Commerce",
      items: [
        {
          id: "marketplace_products",
          title: "Products & Brands",
          href: "/admin/marketplace/products",
          iconName: "Layers",
          permissionGroup: "marketplace",
          phase: 6,
          description: "Catalog moderation, ingredient safety tags, and brand approval.",
        },
        {
          id: "commerce_orders",
          title: "Orders & Payments",
          href: "/admin/commerce/orders",
          iconName: "Package",
          permissionGroup: "commerce",
          phase: 6,
          description: "Global transactions ledger, escrow releases, and refunds.",
        },
        {
          id: "commerce_commissions",
          title: "Commissions & Payouts",
          href: "/admin/commerce/commissions",
          iconName: "DollarSign",
          permissionGroup: "finance",
          phase: 6,
          description: "Platform rake calculation, distributor disbursements, and tax filing reports.",
        },
        {
          id: "marketing_cms",
          title: "Marketing & CMS",
          href: "/admin/marketing",
          iconName: "FileText",
          permissionGroup: "cms",
          phase: 6,
          description: "Hero banners, blog publications, promo codes, and testimonials manager.",
        },
      ],
    },
    {
      groupTitle: "Security & Operations",
      items: [
        {
          id: "support",
          title: "Support Desk",
          href: "/admin/support",
          iconName: "HelpCircle",
          permissionGroup: "support",
          phase: 6,
          description: "Escalated consumer inquiries, shipping disputes, and consultation reschedule tickets.",
        },
        {
          id: "audit_log",
          title: "Security & Audit",
          href: "/admin/security",
          iconName: "ShieldAlert",
          permissionGroup: "security",
          phase: 6,
          description: "Immutable trail of all parameter edits, privilege escalations, and financial payouts.",
        },
        {
          id: "roles_matrix",
          title: "Roles & RBAC Matrix",
          href: "/admin/roles",
          iconName: "Lock",
          permissionGroup: "roles",
          phase: 6,
          description: "Platform-wide 12-role permission matrix governance and resource toggles.",
        },
      ],
    },
  ],
  mobileBottomTabs: ["dashboard", "users", "ai_parameters", "commerce_orders", "more"],
};

// 4. Consultant Navigation
export const consultantNav: PanelNavConfig = {
  panelName: "Consultant Portal",
  baseHref: "/consultant",
  groups: [
    {
      groupTitle: "Practice",
      items: [
        {
          id: "dashboard",
          title: "Dashboard",
          href: "/consultant",
          iconName: "LayoutDashboard",
          phase: 7,
          description: "Daily consultation schedule, patient intake queue, and client reviews.",
        },
        {
          id: "appointments",
          title: "Appointments",
          href: "/consultant/appointments",
          iconName: "Calendar",
          phase: 7,
          description: "Upcoming telemedicine calls, patient medical records, and scan reviews.",
        },
        {
          id: "clients",
          title: "Clients",
          href: "/consultant/clients",
          iconName: "Users",
          phase: 7,
          description: "Skin progress tracking, past AI scans, and treatment response history.",
        },
      ],
    },
    {
      groupTitle: "Clinical Tools",
      items: [
        {
          id: "plans",
          title: "Plan Builder",
          href: "/consultant/plans",
          iconName: "ClipboardList",
          phase: 7,
          description: "Assemble bespoke product routines and clinical peel protocols for clients.",
        },
        {
          id: "availability",
          title: "Availability",
          href: "/consultant/availability",
          iconName: "Clock",
          phase: 7,
          description: "Set weekly telemedicine hours, consultation fees, and emergency slots.",
        },
        {
          id: "messages",
          title: "Messages",
          href: "/consultant/messages",
          iconName: "MessageSquare",
          phase: 7,
          description: "Direct client follow-up chat, routine feedback, and photo check-ins.",
        },
        {
          id: "profile",
          title: "Doctor Profile",
          href: "/consultant/profile",
          iconName: "User",
          phase: 7,
          description: "Certifications, clinical specialties, clinic affiliations, and bio.",
        },
      ],
    },
  ],
  mobileBottomTabs: ["dashboard", "appointments", "clients", "plans", "more"],
};
