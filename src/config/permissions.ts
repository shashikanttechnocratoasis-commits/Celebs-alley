import { Role } from "@/types";

export interface PermissionRule {
  allowedPanels: ("app" | "seller" | "admin" | "consultant")[];
  allowedGroups: string[];
  deniedRoutes?: string[];
  homeRoute: string;
}

export const ROLE_PERMISSIONS: Record<Role, PermissionRule> = {
  "Super Admin": {
    allowedPanels: ["admin", "app", "seller", "consultant"],
    allowedGroups: ["all"],
    homeRoute: "/admin",
  },
  Admin: {
    allowedPanels: ["admin"],
    allowedGroups: ["dashboard", "users", "distributors", "marketplace", "commerce", "cms", "support"],
    deniedRoutes: ["/admin/roles"],
    homeRoute: "/admin",
  },
  "Product Manager": {
    allowedPanels: ["admin"],
    allowedGroups: ["dashboard", "marketplace", "cms"],
    deniedRoutes: [
      "/admin/users",
      "/admin/distributors",
      "/admin/ai-engine",
      "/admin/commerce/commissions",
      "/admin/commerce/payments",
      "/admin/commerce/refunds",
      "/admin/security",
      "/admin/roles",
      "/admin/support",
    ],
    homeRoute: "/admin/marketplace/products",
  },
  "AI/Rule Manager": {
    allowedPanels: ["admin"],
    allowedGroups: ["dashboard", "ai_engine"],
    deniedRoutes: [
      "/admin/users",
      "/admin/distributors",
      "/admin/marketplace",
      "/admin/commerce",
      "/admin/marketing",
      "/admin/support",
      "/admin/security",
      "/admin/roles",
    ],
    homeRoute: "/admin/ai-engine/parameters",
  },
  "Distributor Owner": {
    allowedPanels: ["seller"],
    allowedGroups: [
      "seller_dashboard",
      "seller_products",
      "seller_inventory",
      "seller_orders",
      "seller_customers",
      "seller_analytics",
      "seller_staff",
      "seller_subscription",
      "seller_payouts",
      "seller_settings",
    ],
    homeRoute: "/seller",
  },
  "Distributor Manager": {
    allowedPanels: ["seller"],
    allowedGroups: [
      "seller_dashboard",
      "seller_products",
      "seller_inventory",
      "seller_orders",
      "seller_customers",
      "seller_settings",
    ],
    deniedRoutes: ["/seller/payouts", "/seller/subscription", "/seller/analytics"],
    homeRoute: "/seller",
  },
  "Inventory Manager": {
    allowedPanels: ["seller"],
    allowedGroups: ["seller_dashboard", "seller_inventory", "seller_products"],
    deniedRoutes: [
      "/seller/payouts",
      "/seller/subscription",
      "/seller/analytics",
      "/seller/staff",
      "/seller/customers",
    ],
    homeRoute: "/seller/inventory",
  },
  "Order Manager": {
    allowedPanels: ["seller"],
    allowedGroups: ["seller_dashboard", "seller_orders", "seller_products", "seller_inventory"],
    deniedRoutes: [
      "/seller/payouts",
      "/seller/subscription",
      "/seller/analytics",
      "/seller/staff",
      "/seller/settings",
    ],
    homeRoute: "/seller/orders",
  },
  "Sales Executive": {
    allowedPanels: ["seller"],
    allowedGroups: ["seller_dashboard", "seller_orders", "seller_customers"],
    deniedRoutes: [
      "/seller/payouts",
      "/seller/subscription",
      "/seller/analytics",
      "/seller/staff",
      "/seller/inventory",
    ],
    homeRoute: "/seller/orders",
  },
  Accountant: {
    allowedPanels: ["seller"],
    allowedGroups: ["seller_dashboard", "seller_payouts", "seller_subscription", "seller_analytics"],
    deniedRoutes: [
      "/seller/products",
      "/seller/inventory",
      "/seller/orders",
      "/seller/customers",
      "/seller/staff",
      "/seller/settings",
    ],
    homeRoute: "/seller/payouts",
  },
  Consultant: {
    allowedPanels: ["consultant"],
    allowedGroups: [
      "consultant_dashboard",
      "consultant_appointments",
      "consultant_clients",
      "consultant_plans",
      "consultant_availability",
      "consultant_messages",
      "consultant_profile",
    ],
    homeRoute: "/consultant",
  },
  Customer: {
    allowedPanels: ["app"],
    allowedGroups: [
      "customer_home",
      "customer_scan",
      "customer_results",
      "customer_shop",
      "customer_cart",
      "customer_orders",
      "customer_wishlist",
      "customer_consultations",
      "customer_profile",
      "customer_privacy",
    ],
    homeRoute: "/app",
  },
  "Support Agent": {
    allowedPanels: ["admin"],
    allowedGroups: ["dashboard", "support", "commerce"],
    deniedRoutes: [
      "/admin/ai-engine",
      "/admin/distributors",
      "/admin/marketing",
      "/admin/security",
      "/admin/finance",
      "/admin/commerce/commissions",
      "/admin/commerce/payouts",
      "/admin/payouts",
      "/admin/roles",
    ],
    homeRoute: "/admin/support",
  },
  "Finance Manager": {
    allowedPanels: ["admin"],
    allowedGroups: ["dashboard", "finance", "commerce"],
    deniedRoutes: [
      "/admin/ai-engine",
      "/admin/users",
      "/admin/marketplace",
      "/admin/marketing",
      "/admin/support",
      "/admin/security",
      "/admin/roles",
    ],
    homeRoute: "/admin/finance",
  },
};

/**
 * Check if a role can access a particular pathname
 */
export function canAccessRoute(role: Role, pathname: string): boolean {
  const perm = ROLE_PERMISSIONS[role];
  if (!perm) return false;

  // Super Admin can access everything
  if (role === "Super Admin") return true;

  // Check panel access
  const panel = pathname.split("/")[1] as "app" | "seller" | "admin" | "consultant";
  if (!perm.allowedPanels.includes(panel)) {
    return false;
  }

  // Check specific denied routes
  if (perm.deniedRoutes && perm.deniedRoutes.some((denied) => pathname.startsWith(denied))) {
    return false;
  }

  return true;
}

/**
 * Get the default landing route for a given role
 */
export function getHomeRouteForRole(role: Role): string {
  return ROLE_PERMISSIONS[role]?.homeRoute || "/app";
}
