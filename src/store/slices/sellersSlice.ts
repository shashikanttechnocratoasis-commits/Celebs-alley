import type { StateCreator } from "zustand";
import type { AppState } from "../index";
import type { Seller, Category, Brand, Ingredient } from "@/types";
import initialCategories from "@/data/categories.json";
import initialBrands from "@/data/brands.json";
import initialIngredients from "@/data/ingredients.json";

export interface SellersSlice {
  approveSellerKyc: (sellerId: string, checklist?: any) => void;
  rejectSellerKyc: (sellerId: string, reason: string) => void;
  requestSellerKycInfo: (sellerId: string, note: string) => void;
  setSellerStoreStatus: (sellerId: string, status: "active" | "paused" | "suspended", reason?: string) => void;
  setSellerCommissionOverride: (sellerId: string, ratePercent: number) => void;
  updateSellerPlanOverride: (sellerId: string, plan: Seller["plan"], reason?: string) => void;

  categories: Category[];
  addCategory: (cat: Omit<Category, "id">) => Category;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => { success: boolean; message: string };

  brands: Brand[];
  addBrand: (brand: Omit<Brand, "id">) => Brand;
  updateBrand: (id: string, patch: Partial<Brand>) => void;
  deleteBrand: (id: string) => { success: boolean; message: string };

  ingredients: Ingredient[];
  addIngredient: (ing: Omit<Ingredient, "id">) => Ingredient;
  updateIngredient: (id: string, patch: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => { success: boolean; message: string };
}

export const createSellersSlice: StateCreator<AppState, [], [], SellersSlice> = (set, get) => ({
  approveSellerKyc: (sellerId, checklist) => {
    const state = get();
    const updatedSellers = state.sellers.map((s) => {
      if (s.id !== sellerId) return s;
      return {
        ...s,
        kycStatus: "approved" as const,
        storeStatus: "active" as const,
        status: "approved" as const,
        isPaused: false,
      };
    });
    set({
      sellers: updatedSellers,
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Super Admin",
          action: "approve_seller_kyc",
          resource: "distributors",
          details: `Approved KYC documents & activated distributor ${sellerId}`,
        },
        ...state.auditLogs,
      ],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: "Distributor KYC Approved",
          message: `Your business verification has been approved. Your store catalog is now live on Celebs Alley!`,
          timestamp: new Date().toISOString(),
          read: false,
          type: "system",
        },
        ...state.notifications,
      ],
    });
  },

  rejectSellerKyc: (sellerId, reason) => {
    const state = get();
    set({
      sellers: state.sellers.map((s) =>
        s.id === sellerId ? { ...s, kycStatus: "rejected", kycRejectionReason: reason } : s
      ),
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Super Admin",
          action: "reject_seller_kyc",
          resource: "distributors",
          details: `Rejected KYC for distributor ${sellerId}. Reason: ${reason}`,
        },
        ...state.auditLogs,
      ],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: "KYC Verification Rejected",
          message: `Compliance audit rejected: ${reason}. Please update documents in Seller Settings.`,
          timestamp: new Date().toISOString(),
          read: false,
          type: "system",
        },
        ...state.notifications,
      ],
    });
  },

  requestSellerKycInfo: (sellerId, note) => {
    const state = get();
    set({
      sellers: state.sellers.map((s) =>
        s.id === sellerId ? { ...s, kycStatus: "under_review" } : s
      ),
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Super Admin",
          action: "request_kyc_info",
          resource: "distributors",
          details: `Requested additional information for distributor ${sellerId}: ${note}`,
        },
        ...state.auditLogs,
      ],
    });
  },

  setSellerStoreStatus: (sellerId, status, reason) => {
    const state = get();
    set({
      sellers: state.sellers.map((s) => {
        if (s.id !== sellerId) return s;
        return {
          ...s,
          storeStatus: status,
          isPaused: status === "paused" || status === "suspended",
          statusReason: reason,
        };
      }),
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Super Admin",
          action: "set_seller_store_status",
          resource: "distributors",
          details: `Changed distributor ${sellerId} store status to ${status}. Reason: ${reason || "Admin update"}`,
        },
        ...state.auditLogs,
      ],
    });
  },

  setSellerCommissionOverride: (sellerId, ratePercent) => {
    const state = get();
    set({
      platformSettings: {
        ...state.platformSettings,
        sellerCommissionOverrides: {
          ...state.platformSettings.sellerCommissionOverrides,
          [sellerId]: ratePercent,
        },
      },
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Super Admin",
          action: "override_commission_rate",
          resource: "commissions",
          details: `Set custom commission override for ${sellerId} to ${ratePercent}%`,
        },
        ...state.auditLogs,
      ],
    });
  },

  updateSellerPlanOverride: (sellerId, plan, reason) => {
    const state = get();
    set({
      sellers: state.sellers.map((s) => (s.id === sellerId ? { ...s, plan } : s)),
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Super Admin",
          action: "override_seller_plan",
          resource: "distributors",
          details: `Overrode plan for distributor ${sellerId} to ${plan}. Reason: ${reason || "Administrative assignment"}`,
        },
        ...state.auditLogs,
      ],
    });
  },

  categories: initialCategories as unknown as Category[],
  addCategory: (cat) => {
    const newCat: Category = { id: `cat-${Date.now()}`, ...cat };
    set((state) => ({ categories: [...state.categories, newCat] }));
    return newCat;
  },
  updateCategory: (id, patch) => {
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  },
  deleteCategory: (id) => {
    const state = get();
    const hasProducts = state.products.some((p) => p.categoryId === id);
    if (hasProducts) return { success: false, message: "Category contains active formulations." };
    set({ categories: state.categories.filter((c) => c.id !== id) });
    return { success: true, message: "Category deleted." };
  },

  brands: initialBrands as unknown as Brand[],
  addBrand: (brand) => {
    const newBrand: Brand = { id: `brand-${Date.now()}`, ...brand };
    set((state) => ({ brands: [...state.brands, newBrand] }));
    return newBrand;
  },
  updateBrand: (id, patch) => {
    set((state) => ({
      brands: state.brands.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  },
  deleteBrand: (id) => {
    const state = get();
    const hasProducts = state.products.some((p) => p.brandId === id);
    if (hasProducts) return { success: false, message: "Brand contains registered formulations." };
    set({ brands: state.brands.filter((b) => b.id !== id) });
    return { success: true, message: "Brand deleted." };
  },

  ingredients: initialIngredients as unknown as Ingredient[],
  addIngredient: (ing) => {
    const newIng: Ingredient = { id: `ing-${Date.now()}`, ...ing };
    set((state) => ({ ingredients: [...state.ingredients, newIng] }));
    return newIng;
  },
  updateIngredient: (id, patch) => {
    set((state) => ({
      ingredients: state.ingredients.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }));
  },
  deleteIngredient: (id) => {
    const state = get();
    const hasProducts = state.products.some((p) => (p.ingredients || []).includes(id));
    if (hasProducts) return { success: false, message: "Ingredient referenced in active formulations." };
    set({ ingredients: state.ingredients.filter((i) => i.id !== id) });
    return { success: true, message: "Ingredient deleted." };
  },
});
