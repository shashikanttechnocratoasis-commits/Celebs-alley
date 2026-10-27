import type {
  SellerRole,
  SellerResource,
  SellerAction,
  PermissionMatrix,
  AdminRole,
  AdminResource,
  AdminAction,
  AdminPermissionMatrix,
  Role,
} from "@/types";
import { useAppStore } from "@/store";

export const DEFAULT_PERMISSION_MATRIX: PermissionMatrix = {
  "Distributor Owner": {
    dashboard: ["view", "create", "edit", "delete", "approve"],
    products: ["view", "create", "edit", "delete", "approve"],
    inventory: ["view", "create", "edit", "delete", "approve"],
    orders: ["view", "create", "edit", "delete", "approve"],
    returns: ["view", "create", "edit", "delete", "approve"],
    customers: ["view", "create", "edit", "delete", "approve"],
    analytics_revenue: ["view", "create", "edit", "delete", "approve"],
    staff: ["view", "create", "edit", "delete", "approve"],
    subscription: ["view", "create", "edit", "delete", "approve"],
    payouts: ["view", "create", "edit", "delete", "approve"],
    settings: ["view", "create", "edit", "delete", "approve"],
  },
  "Distributor Manager": {
    dashboard: ["view"],
    products: ["view", "create", "edit", "approve"],
    inventory: ["view", "create", "edit", "approve"],
    orders: ["view", "create", "edit", "approve"],
    returns: ["view", "edit", "approve"],
    customers: ["view", "edit"],
    analytics_revenue: ["view"],
    staff: ["view", "create", "edit"], // NO delete
    subscription: [], // NO subscription
    payouts: [], // NO payouts
    settings: ["view", "edit"],
  },
  "Inventory Manager": {
    dashboard: ["view"],
    products: ["view", "edit"],
    inventory: ["view", "create", "edit", "delete", "approve"],
    orders: [],
    returns: [],
    customers: [],
    analytics_revenue: [], // NO revenue
    staff: [],
    subscription: [], // NO subscription
    payouts: [], // NO payouts
    settings: ["view"],
  },
  "Order Manager": {
    dashboard: ["view"],
    products: ["view"],
    inventory: ["view"],
    orders: ["view", "create", "edit", "delete", "approve"],
    returns: ["view", "create", "edit", "delete", "approve"],
    customers: ["view"],
    analytics_revenue: [],
    staff: [],
    subscription: [],
    payouts: [],
    settings: [],
  },
  "Sales Executive": {
    dashboard: ["view"],
    products: ["view"],
    inventory: [],
    orders: ["view", "create", "edit"],
    returns: ["view"],
    customers: ["view"],
    analytics_revenue: [], // NO revenue numbers
    staff: [],
    subscription: [],
    payouts: [],
    settings: [],
  },
  "Accountant": {
    dashboard: ["view"],
    products: [],
    inventory: [], // NO stock editing
    orders: ["view"],
    returns: ["view"],
    customers: [],
    analytics_revenue: ["view", "edit"],
    staff: [],
    subscription: ["view"],
    payouts: ["view", "create", "edit", "approve"],
    settings: [],
  },
};

export const DEFAULT_ADMIN_PERMISSION_MATRIX: AdminPermissionMatrix = {
  "Super Admin": {
    dashboard: ["view", "create", "edit", "delete", "approve", "export"],
    users: ["view", "create", "edit", "delete", "approve", "export"],
    distributors: ["view", "create", "edit", "delete", "approve", "export"],
    parameters: ["view", "create", "edit", "delete", "approve", "export"],
    rules: ["view", "create", "edit", "delete", "approve", "export"],
    versions: ["view", "create", "edit", "delete", "approve", "export"],
    products: ["view", "create", "edit", "delete", "approve", "export"],
    categories: ["view", "create", "edit", "delete", "approve", "export"],
    brands: ["view", "create", "edit", "delete", "approve", "export"],
    ingredients: ["view", "create", "edit", "delete", "approve", "export"],
    orders: ["view", "create", "edit", "delete", "approve", "export"],
    payments: ["view", "create", "edit", "delete", "approve", "export"],
    refunds: ["view", "create", "edit", "delete", "approve", "export"],
    coupons: ["view", "create", "edit", "delete", "approve", "export"],
    commissions: ["view", "create", "edit", "delete", "approve", "export"],
    marketing: ["view", "create", "edit", "delete", "approve", "export"],
    cms: ["view", "create", "edit", "delete", "approve", "export"],
    support: ["view", "create", "edit", "delete", "approve", "export"],
    finance: ["view", "create", "edit", "delete", "approve", "export"],
    security: ["view", "create", "edit", "delete", "approve", "export"],
    audit: ["view", "create", "edit", "delete", "approve", "export"],
    roles: ["view", "create", "edit", "delete", "approve", "export"],
  },
  Admin: {
    dashboard: ["view", "export"],
    users: ["view", "create", "edit", "export"],
    distributors: ["view", "create", "edit", "approve", "export"],
    parameters: ["view", "create", "edit", "approve", "export"], // NO delete
    rules: ["view", "create", "edit", "approve", "export"],
    versions: ["view"],
    products: ["view", "create", "edit", "delete", "approve", "export"],
    categories: ["view", "create", "edit", "delete", "approve", "export"],
    brands: ["view", "create", "edit", "delete", "approve", "export"],
    ingredients: ["view", "create", "edit", "delete", "approve", "export"],
    orders: ["view", "edit", "approve", "export"],
    payments: ["view", "export"],
    refunds: ["view", "edit", "approve", "export"],
    coupons: ["view", "create", "edit", "delete", "export"],
    commissions: ["view"],
    marketing: ["view", "create", "edit", "delete", "export"],
    cms: ["view", "create", "edit", "delete", "export"],
    support: ["view", "create", "edit", "approve", "export"],
    finance: ["view"],
    security: ["view", "export"],
    audit: ["view", "export"],
    roles: ["view"], // NO edit roles
  },
  "Product Manager": {
    dashboard: ["view"],
    users: [],
    distributors: ["view"],
    parameters: ["view"],
    rules: ["view"],
    versions: ["view"],
    products: ["view", "create", "edit", "delete", "approve", "export"],
    categories: ["view", "create", "edit", "delete", "export"],
    brands: ["view", "create", "edit", "delete", "export"],
    ingredients: ["view", "create", "edit", "delete", "export"],
    orders: ["view"],
    payments: [],
    refunds: [],
    coupons: ["view"],
    commissions: [],
    marketing: ["view"],
    cms: ["view", "create", "edit"],
    support: [],
    finance: [],
    security: [],
    audit: [],
    roles: [],
  },
  "AI/Rule Manager": {
    dashboard: ["view"],
    users: [],
    distributors: [],
    parameters: ["view", "create", "edit", "delete", "approve", "export"],
    rules: ["view", "create", "edit", "delete", "approve", "export"],
    versions: ["view", "create", "edit", "approve", "export"],
    products: ["view"],
    categories: ["view"],
    brands: ["view"],
    ingredients: ["view", "create", "edit"],
    orders: [],
    payments: [],
    refunds: [],
    coupons: [],
    commissions: [],
    marketing: [],
    cms: [],
    support: [],
    finance: [],
    security: [],
    audit: ["view"],
    roles: [],
  },
  "Support Agent": {
    dashboard: ["view"],
    users: ["view"],
    distributors: ["view"],
    parameters: [],
    rules: [],
    versions: [],
    products: ["view"],
    categories: ["view"],
    brands: ["view"],
    ingredients: ["view"],
    orders: ["view", "edit"],
    payments: ["view"],
    refunds: ["view"],
    coupons: ["view"],
    commissions: [],
    marketing: [],
    cms: [],
    support: ["view", "create", "edit", "approve", "export"],
    finance: [],
    security: [],
    audit: [],
    roles: [],
  },
  "Finance Manager": {
    dashboard: ["view"],
    users: [],
    distributors: ["view"],
    parameters: [],
    rules: [],
    versions: [],
    products: [],
    categories: [],
    brands: [],
    ingredients: [],
    orders: ["view"],
    payments: ["view", "edit", "approve", "export"],
    refunds: ["view", "edit", "approve", "export"],
    coupons: ["view"],
    commissions: ["view", "create", "edit", "approve", "export"],
    marketing: [],
    cms: [],
    support: [],
    finance: ["view", "edit", "approve", "export"],
    security: [],
    audit: ["view"],
    roles: [],
  },
};

/**
 * Pure function to check if a given seller role has permission for resource & action.
 */
export function can(
  role: string | undefined,
  resource: SellerResource,
  action: SellerAction = "view",
  matrix?: PermissionMatrix
): boolean {
  if (!role) return false;
  if (role === "Super Admin") return true;

  const resolvedMatrix = matrix || DEFAULT_PERMISSION_MATRIX;
  const sellerRole = role as SellerRole;
  const roleRules = resolvedMatrix[sellerRole];
  if (!roleRules) return false;

  const actions = roleRules[resource];
  if (!actions || !Array.isArray(actions)) return false;

  return actions.includes(action);
}

/**
 * Pure function to check if a given admin role has permission for resource & action.
 */
export function canAdmin(
  role: string | undefined,
  resource: AdminResource,
  action: AdminAction = "view",
  matrix?: AdminPermissionMatrix
): boolean {
  if (!role) return false;
  if (role === "Super Admin") return true;

  const resolvedMatrix = matrix || DEFAULT_ADMIN_PERMISSION_MATRIX;
  const adminRole = role as AdminRole;
  const roleRules = resolvedMatrix[adminRole];
  if (!roleRules) return false;

  const actions = roleRules[resource];
  if (!actions || !Array.isArray(actions)) return false;

  return actions.includes(action);
}

/**
 * React hook to check permissions in seller components against the store's matrix.
 */
export function usePermission(resource?: SellerResource, action: SellerAction = "view"): any {
  const currentRole = useAppStore((state) => state.currentRole);
  const sellerPermissions = useAppStore((state) => state.sellerPermissions) || DEFAULT_PERMISSION_MATRIX;

  if (resource) {
    return can(currentRole, resource, action, sellerPermissions);
  }

  return {
    can: (res: SellerResource, act: SellerAction = "view") =>
      can(currentRole, res, act, sellerPermissions),
    canRevenue: can(currentRole, "analytics_revenue", "view", sellerPermissions),
    canPayouts: can(currentRole, "payouts", "view", sellerPermissions),
    canInventoryEdit: can(currentRole, "inventory", "edit", sellerPermissions),
    canOrdersEdit: can(currentRole, "orders", "edit", sellerPermissions),
    canProductsEdit: can(currentRole, "products", "edit", sellerPermissions),
    canStaffEdit: can(currentRole, "staff", "edit", sellerPermissions),
    role: currentRole,
  };
}

/**
 * React hook to check permissions in admin components against the store's admin matrix.
 */
export function useAdminPermission(resource?: AdminResource, action: AdminAction = "view"): any {
  const currentRole = useAppStore((state) => state.currentRole);
  const adminPermissions = useAppStore((state) => state.adminPermissions) || DEFAULT_ADMIN_PERMISSION_MATRIX;

  if (resource) {
    return canAdmin(currentRole, resource, action, adminPermissions);
  }

  return {
    can: (res: AdminResource, act: AdminAction = "view") =>
      canAdmin(currentRole, res, act, adminPermissions),
    isSuperAdmin: currentRole === "Super Admin",
    role: currentRole,
  };
}

// ============================================================
// CONSULTANT RBAC MATRIX & MULTI-TENANT ISOLATION
// ============================================================

export type ConsultantPermissionMap = Record<
  "Consultant",
  Record<
    | "appointments"
    | "clients"
    | "client_scans"
    | "plans"
    | "availability"
    | "messages"
    | "earnings"
    | "profile",
    string[]
  >
>;

export const DEFAULT_CONSULTANT_PERMISSION_MATRIX: ConsultantPermissionMap = {
  Consultant: {
    appointments: ["view", "create", "edit", "delete", "approve", "export"],
    clients: ["view", "edit", "export"],
    client_scans: ["view"],
    plans: ["view", "create", "edit", "delete", "approve", "export"],
    availability: ["view", "create", "edit", "delete"],
    messages: ["view", "create", "edit"],
    earnings: ["view", "export"],
    profile: ["view", "edit"],
  },
};

export function canConsultant(
  role: string | undefined,
  resource:
    | "appointments"
    | "clients"
    | "client_scans"
    | "plans"
    | "availability"
    | "messages"
    | "earnings"
    | "profile",
  action: string = "view",
  matrix: ConsultantPermissionMap = DEFAULT_CONSULTANT_PERMISSION_MATRIX
): boolean {
  if (role !== "Consultant" && role !== "Super Admin") return false;
  if (role === "Super Admin") return true;

  const rules = matrix.Consultant[resource];
  return Boolean(rules && rules.includes(action));
}

/**
 * Validates that an entity belongs strictly to the currently logged in consultant.
 * Ensures strict multi-tenant isolation across all consultant endpoints.
 */
export function belongsToConsultant(
  item: { consultantId?: string },
  activeConsultantId?: string
): boolean {
  if (!activeConsultantId) return false;
  return item.consultantId === activeConsultantId;
}

/**
 * React hook to check permissions in consultant components.
 * Also checks if the consultant has been suspended by Admin.
 */
export function useConsultantPermission(
  resource?:
    | "appointments"
    | "clients"
    | "client_scans"
    | "plans"
    | "availability"
    | "messages"
    | "earnings"
    | "profile",
  action: string = "view"
): any {
  const currentRole = useAppStore((state) => state.currentRole);
  const currentUser = useAppStore((state) => state.currentUser);
  const consultants = useAppStore((state) => (state as any).consultants || []);

  // Determine consultantId from user
  const consultantId =
    currentUser?.consultantId ||
    (currentUser?.id === "user-consultant" || currentUser?.id === "user-consultant-1"
      ? "cons-1"
      : currentUser?.id === "user-consultant-2"
      ? "cons-2"
      : currentUser?.id === "user-consultant-3"
      ? "cons-3"
      : undefined);

  const matchedConsultant = consultants.find((c: any) => c.id === consultantId);
  const isSuspended = matchedConsultant?.status === "suspended";

  if (isSuspended) {
    return {
      allowed: false,
      isSuspended: true,
      consultantId,
      can: () => false,
      isSuperAdmin: currentRole === "Super Admin",
    };
  }

  const allowed = canConsultant(currentRole, resource || "appointments", action);

  if (resource) {
    return allowed;
  }

  return {
    allowed,
    isSuspended: false,
    consultantId,
    consultant: matchedConsultant,
    can: (res: any, act: string = "view") => canConsultant(currentRole, res, act),
    isSuperAdmin: currentRole === "Super Admin",
  };
}
