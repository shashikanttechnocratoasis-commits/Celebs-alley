import { delay } from "./utils";
import { useAppStore } from "@/store";

// Static JSON imports
import initialParameters from "@/data/parameters.json";
import initialBrands from "@/data/brands.json";
import initialCategories from "@/data/categories.json";
import initialIngredients from "@/data/ingredients.json";
import initialProducts from "@/data/products.json";
import initialSellers from "@/data/sellers.json";
import initialInventory from "@/data/inventory.json";
import initialUsers from "@/data/users.json";
import initialCustomers from "@/data/customers.json";
import initialOrders from "@/data/orders.json";
import initialCoupons from "@/data/coupons.json";
import initialPlans from "@/data/plans.json";
import initialRoles from "@/data/roles.json";
import initialServices from "@/data/services.json";
import initialConsultants from "@/data/consultants.json";
import initialAppointments from "@/data/appointments.json";
import initialTestimonials from "@/data/testimonials.json";
import initialBlog from "@/data/blog.json";
import initialFaqs from "@/data/faqs.json";
import initialNotifications from "@/data/notifications.json";
import initialQuestionnaire from "@/data/questionnaire.json";
import initialSampleScans from "@/data/sampleScans.json";
import initialSiteSettings from "@/data/siteSettings.json";
import initialAuditLog from "@/data/auditLog.json";
import initialPageContent from "@/data/pageContent.json";
import initialTeam from "@/data/team.json";
import initialCertifications from "@/data/certifications.json";
import initialTimeline from "@/data/timeline.json";
import initialTechnologyStages from "@/data/technologyStages.json";

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filter?: Record<string, any>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Configurable failure simulation (disabled by default)
let simulateApiFailure = false;
export const setSimulateApiFailure = (shouldFail: boolean) => {
  simulateApiFailure = shouldFail;
};

async function mockDelay(min = 300, max = 700) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  await delay(ms);
  if (simulateApiFailure) {
    throw new Error("Simulated network latency / server error (Celebs Alley API)");
  }
}

function paginate<T>(items: T[], params?: PaginationParams): PaginatedResult<T> {
  let result = [...items];

  // Search filter
  if (params?.search && params.search.trim()) {
    const term = params.search.toLowerCase().trim();
    result = result.filter((item: any) =>
      Object.values(item).some((val) =>
        typeof val === "string" ? val.toLowerCase().includes(term) : false
      )
    );
  }

  // Key-value filtering
  if (params?.filter) {
    Object.entries(params.filter).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "all") {
        result = result.filter((item: any) => item[key] === val);
      }
    });
  }

  // Sorting
  if (params?.sortBy) {
    const field = params.sortBy;
    const order = params.sortOrder === "desc" ? -1 : 1;
    result.sort((a: any, b: any) => {
      if (a[field] < b[field]) return -1 * order;
      if (a[field] > b[field]) return 1 * order;
      return 0;
    });
  }

  const page = params?.page || 1;
  const limit = params?.limit || result.length || 10;
  const startIndex = (page - 1) * limit;
  const paginatedData = result.slice(startIndex, startIndex + limit);

  return {
    data: paginatedData,
    total: result.length,
    page,
    limit,
    totalPages: Math.ceil(result.length / limit) || 1,
  };
}

export const api = {
  // Products
  products: {
    list: async (params?: PaginationParams) => {
      await mockDelay();
      return paginate(initialProducts, params);
    },
    getById: async (id: string) => {
      await mockDelay();
      const item = initialProducts.find((p) => p.id === id);
      if (!item) throw new Error("Product not found");
      return item;
    },
    getBySlug: async (slug: string) => {
      await mockDelay();
      return (
        initialProducts.find(
          (p) =>
            p.id === slug ||
            p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug
        ) || null
      );
    },
    getByCategory: async (categoryId: string) => {
      await mockDelay();
      return initialProducts.filter((p) => p.categoryId === categoryId);
    },
  },

  // Parameters (Reads from Zustand Store first)
  parameters: {
    list: async () => {
      await mockDelay();
      const storeParams = useAppStore.getState().parameters;
      return storeParams && storeParams.length > 0 ? storeParams : initialParameters;
    },
    update: async (id: string, updates: any) => {
      await mockDelay();
      useAppStore.getState().updateParameter(id, updates);
      return { success: true };
    },
  },

  // Brands & Categories & Ingredients
  brands: {
    list: async () => {
      await mockDelay();
      return initialBrands;
    },
  },
  categories: {
    list: async () => {
      await mockDelay();
      return initialCategories;
    },
  },
  ingredients: {
    list: async () => {
      await mockDelay();
      return initialIngredients;
    },
  },

  // Sellers & Inventory (Reads from Zustand Store first)
  sellers: {
    list: async (params?: PaginationParams) => {
      await mockDelay();
      const sellers = useAppStore.getState().sellers || initialSellers;
      return paginate(sellers, params);
    },
    getById: async (id: string) => {
      await mockDelay();
      const sellers = useAppStore.getState().sellers || initialSellers;
      const item = sellers.find((s) => s.id === id);
      if (!item) throw new Error("Seller not found");
      return item;
    },
  },
  inventory: {
    list: async (params?: PaginationParams) => {
      await mockDelay();
      const items = useAppStore.getState().inventory || initialInventory;
      return paginate(items, params);
    },
  },

  // Orders (Reads from Zustand Store first)
  orders: {
    list: async (params?: PaginationParams) => {
      await mockDelay();
      const orders = useAppStore.getState().orders || initialOrders;
      return paginate(orders, params);
    },
    create: async (order: any) => {
      await mockDelay();
      useAppStore.getState().createOrder(order);
      return order;
    },
  },

  // Consultants & Appointments
  consultants: {
    list: async () => {
      await mockDelay();
      return initialConsultants;
    },
    getBySlug: async (slug: string) => {
      await mockDelay();
      return (
        initialConsultants.find((c: any) => c.slug === slug || c.id === slug) ||
        null
      );
    },
  },
  appointments: {
    list: async () => {
      await mockDelay();
      return useAppStore.getState().appointments || initialAppointments;
    },
  },

  // Users & Customers
  users: {
    list: async () => {
      await mockDelay();
      return initialUsers;
    },
  },
  customers: {
    list: async (params?: PaginationParams) => {
      await mockDelay();
      return paginate(initialCustomers, params);
    },
  },

  // CMS & Marketing Content
  pageContent: {
    get: async () => {
      await mockDelay(50, 150);
      return initialPageContent;
    },
  },
  team: {
    list: async () => {
      await mockDelay(50, 200);
      return initialTeam;
    },
  },
  certifications: {
    list: async () => {
      await mockDelay(50, 200);
      return initialCertifications;
    },
  },
  timeline: {
    list: async () => {
      await mockDelay(50, 200);
      return initialTimeline;
    },
  },
  technologyStages: {
    list: async () => {
      await mockDelay(50, 200);
      return initialTechnologyStages;
    },
  },
  services: {
    list: async () => {
      await mockDelay();
      return initialServices;
    },
    getBySlug: async (slug: string) => {
      await mockDelay();
      return (
        initialServices.find((s: any) => s.slug === slug || s.id === slug) ||
        null
      );
    },
  },
  testimonials: {
    list: async () => {
      await mockDelay();
      return initialTestimonials;
    },
  },
  blog: {
    list: async (params?: PaginationParams) => {
      await mockDelay();
      return paginate(initialBlog, params);
    },
    getBySlug: async (slug: string) => {
      await mockDelay();
      return (
        initialBlog.find((b: any) => b.slug === slug || b.id === slug) || null
      );
    },
  },
  faqs: {
    list: async () => {
      await mockDelay();
      return initialFaqs;
    },
  },
  plans: {
    list: async () => {
      await mockDelay();
      return initialPlans;
    },
  },
  roles: {
    list: async () => {
      await mockDelay();
      return initialRoles;
    },
  },
  siteSettings: {
    get: async () => {
      await mockDelay(100, 250);
      return initialSiteSettings;
    },
  },
  sampleScans: {
    list: async () => {
      await mockDelay();
      return useAppStore.getState().scans || initialSampleScans;
    },
  },
  auditLogs: {
    list: async () => {
      await mockDelay();
      return useAppStore.getState().auditLogs || initialAuditLog;
    },
  },
};