import type { StateCreator } from "zustand";
import type { AppState } from "../index";
import type { Banner, Campaign, CmsArticle, CmsFaq, CmsService } from "@/types";
import initialBanners from "@/data/banners.json";
import initialCampaigns from "@/data/campaigns.json";
import initialBlogArticles from "@/data/blog.json";
import initialFaqs from "@/data/faqs.json";
import initialServices from "@/data/services.json";

export interface ContentSlice {
  banners: Banner[];
  addBanner: (banner: Omit<Banner, "id">) => Banner;
  updateBanner: (id: string, patch: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;
  reorderBanners: (orderedIds: string[]) => void;

  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, "id">) => Campaign;
  updateCampaign: (id: string, patch: Partial<Campaign>) => void;
  sendCampaign: (campaignId: string) => { sentCount: number };

  blogArticles: CmsArticle[];
  addBlogArticle: (article: Omit<CmsArticle, "id">) => CmsArticle;
  updateBlogArticle: (id: string, patch: Partial<CmsArticle>) => void;
  deleteBlogArticle: (id: string) => void;

  faqs: CmsFaq[];
  addFaq: (faq: Omit<CmsFaq, "id">) => CmsFaq;
  updateFaq: (id: string, patch: Partial<CmsFaq>) => void;
  deleteFaq: (id: string) => void;

  services: CmsService[];
  updateService: (id: string, patch: Partial<CmsService>) => void;
}

export const createContentSlice: StateCreator<AppState, [], [], ContentSlice> = (set, get) => ({
  banners: initialBanners as unknown as Banner[],
  addBanner: (banner) => {
    const newBanner: Banner = { id: `banner-${Date.now()}`, ...banner };
    set((state) => ({ banners: [...state.banners, newBanner] }));
    return newBanner;
  },
  updateBanner: (id, patch) => {
    set((state) => ({
      banners: state.banners.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  },
  deleteBanner: (id) => {
    set((state) => ({ banners: state.banners.filter((b) => b.id !== id) }));
  },
  reorderBanners: (orderedIds) => {
    const state = get();
    const reordered = orderedIds
      .map((id, idx) => {
        const b = state.banners.find((item) => item.id === id);
        return b ? { ...b, order: idx + 1 } : null;
      })
      .filter(Boolean) as Banner[];
    set({ banners: reordered });
  },

  campaigns: initialCampaigns as unknown as Campaign[],
  addCampaign: (campaign) => {
    const newCamp: Campaign = { id: `camp-${Date.now()}`, ...campaign };
    set((state) => ({ campaigns: [...state.campaigns, newCamp] }));
    return newCamp;
  },
  updateCampaign: (id, patch) => {
    set((state) => ({
      campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  },
  sendCampaign: (campaignId) => {
    const state = get();
    const camp = state.campaigns.find((c) => c.id === campaignId);
    if (!camp) return { sentCount: 0 };
    const audienceCount = camp.audienceCount || 150;
    set({
      campaigns: state.campaigns.map((c) =>
        c.id === campaignId
          ? {
              ...c,
              status: "sent" as const,
              sentDate: new Date().toISOString(),
              results: {
                delivered: audienceCount,
                opened: Math.round(audienceCount * 0.65),
                converted: Math.round(audienceCount * 0.18),
              },
            }
          : c
      ),
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: camp.name,
          message: (camp.messageBody || camp.message || "").slice(0, 120) + "...",
          timestamp: new Date().toISOString(),
          read: false,
          type: "system",
        },
        ...state.notifications,
      ],
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: state.currentUser?.name || "Admin",
          action: "send_marketing_campaign",
          resource: "marketing",
          details: `Dispatched campaign '${camp.name}' to ${audienceCount} users via ${camp.channel}`,
        },
        ...state.auditLogs,
      ],
    });
    return { sentCount: audienceCount };
  },

  blogArticles: initialBlogArticles as unknown as CmsArticle[],
  addBlogArticle: (article) => {
    const newArt: CmsArticle = { id: `art-${Date.now()}`, ...article };
    set((state) => ({ blogArticles: [newArt, ...state.blogArticles] }));
    return newArt;
  },
  updateBlogArticle: (id, patch) => {
    set((state) => ({
      blogArticles: state.blogArticles.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  },
  deleteBlogArticle: (id) => {
    set((state) => ({ blogArticles: state.blogArticles.filter((a) => a.id !== id) }));
  },

  faqs: initialFaqs as unknown as CmsFaq[],
  addFaq: (faq) => {
    const newFaq: CmsFaq = { id: `faq-${Date.now()}`, ...faq };
    set((state) => ({ faqs: [...state.faqs, newFaq] }));
    return newFaq;
  },
  updateFaq: (id, patch) => {
    set((state) => ({
      faqs: state.faqs.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }));
  },
  deleteFaq: (id) => {
    set((state) => ({ faqs: state.faqs.filter((f) => f.id !== id) }));
  },

  services: initialServices as unknown as CmsService[],
  updateService: (id, patch) => {
    set((state) => ({
      services: state.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  },
});
