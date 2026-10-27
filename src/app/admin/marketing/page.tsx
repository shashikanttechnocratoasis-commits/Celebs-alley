"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAppStore } from "@/store";
import { useAdminPermission } from "@/lib/rbac";
import {
  Megaphone,
  Image as ImageIcon,
  Send,
  FileText,
  HelpCircle,
  Stethoscope,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  Eye,
  X,
  ExternalLink,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type { Banner, Campaign, CmsArticle, CmsFaq, CmsService } from "@/types";

type MarketingTab = "banners" | "campaigns" | "blog" | "faqs" | "services";

export default function MarketingCMSContentPage() {
  const {
    banners,
    campaigns,
    blogArticles,
    faqs,
    services,
    addBanner,
    updateBanner,
    deleteBanner,
    addCampaign,
    sendCampaign,
    addBlogArticle,
    updateBlogArticle,
    deleteBlogArticle,
    addFaq,
    updateFaq,
    deleteFaq,
    updateService,
  } = useAppStore();

  const { canEdit, canDelete } = useAdminPermission("marketing");

  const [activeTab, setActiveTab] = useState<MarketingTab>("banners");

  // Banner Modal
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [bannerLink, setBannerLink] = useState("/app/shop");
  const [bannerPlacement, setBannerPlacement] = useState<Banner["placement"]>("home_hero");
  const [bannerStatus, setBannerStatus] = useState<Banner["status"]>("active");

  // Campaign Modal
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignSegment, setCampaignSegment] = useState<Campaign["targetSegment"]>("low_hydration");
  const [campaignChannel, setCampaignChannel] = useState<Campaign["channel"]>("push");
  const [campaignMessage, setCampaignMessage] = useState("");

  // Blog Article Modal
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<CmsArticle | null>(null);
  const [articleTitle, setArticleTitle] = useState("");
  const [articleSlug, setArticleSlug] = useState("");
  const [articleCategory, setArticleCategory] = useState("Clinical Cosmeceuticals");
  const [articleSummary, setArticleSummary] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [articleCover, setArticleCover] = useState("");
  const [articleStatus, setArticleStatus] = useState<"published" | "draft">("published");

  // FAQ Modal
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<CmsFaq | null>(null);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqCategory, setFaqCategory] = useState("Diagnostic Technology");

  // Service Edit Modal
  const [editingService, setEditingService] = useState<CmsService | null>(null);
  const [servicePrice, setServicePrice] = useState(1499);
  const [serviceDuration, setServiceDuration] = useState("30 mins");
  const [serviceTagline, setServiceTagline] = useState("");

  // Notification flash
  const [statusMessage, setStatusMessage] = useState("");

  const showFlash = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 4000);
  };

  // Banner Handlers
  const handleOpenAddBanner = () => {
    setEditingBanner(null);
    setBannerTitle("");
    setBannerSubtitle("");
    setBannerImage("https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80");
    setBannerLink("/app/shop");
    setBannerPlacement("home_hero");
    setBannerStatus("active");
    setIsBannerModalOpen(true);
  };

  const handleOpenEditBanner = (b: Banner) => {
    setEditingBanner(b);
    setBannerTitle(b.title);
    setBannerSubtitle(b.subtitle || "");
    setBannerImage(b.imageUrl);
    setBannerLink(b.linkUrl || b.link || "");
    setBannerPlacement(b.placement);
    setBannerStatus(b.status);
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim()) return;

    if (editingBanner) {
      updateBanner(editingBanner.id, {
        title: bannerTitle,
        subtitle: bannerSubtitle,
        imageUrl: bannerImage,
        linkUrl: bannerLink,
        placement: bannerPlacement,
        status: bannerStatus,
      });
      showFlash("Promotional banner updated successfully.");
    } else {
      addBanner({
        title: bannerTitle,
        subtitle: bannerSubtitle,
        imageUrl: bannerImage,
        linkUrl: bannerLink,
        placement: bannerPlacement,
        status: bannerStatus,
        order: banners.length + 1,
      });
      showFlash("New promotional hero banner published.");
    }
    setIsBannerModalOpen(false);
  };

  // Campaign Handlers
  const handleCreateAndSendCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim() || !campaignMessage.trim()) return;

    const newCamp = addCampaign({
      name: campaignName,
      targetSegment: campaignSegment,
      channel: campaignChannel,
      message: campaignMessage,
      status: "scheduled",
      scheduledFor: new Date().toISOString(),
    });

    const res = sendCampaign(newCamp.id);
    showFlash(`Dispatched campaign '${campaignName}' to ${res.sentCount} targeted customers.`);
    setIsCampaignModalOpen(false);
    setCampaignName("");
    setCampaignMessage("");
  };

  // Blog Article Handlers
  const handleOpenAddArticle = () => {
    setEditingArticle(null);
    setArticleTitle("");
    setArticleSlug("");
    setArticleCategory("Clinical Cosmeceuticals");
    setArticleSummary("");
    setArticleContent("");
    setArticleCover("https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80");
    setArticleStatus("published");
    setIsBlogModalOpen(true);
  };

  const handleOpenEditArticle = (art: CmsArticle) => {
    setEditingArticle(art);
    setArticleTitle(art.title);
    setArticleSlug(art.slug);
    setArticleCategory(art.category);
    setArticleSummary(art.summary);
    setArticleContent(art.content);
    setArticleCover(art.coverImage);
    setArticleStatus(art.status);
    setIsBlogModalOpen(true);
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleTitle.trim()) return;

    const payload = {
      title: articleTitle,
      slug: articleSlug || articleTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category: articleCategory,
      summary: articleSummary,
      content: articleContent,
      coverImage: articleCover,
      status: articleStatus,
      readTimeMinutes: Math.max(3, Math.ceil(articleContent.length / 500)),
      publishedAt: new Date().toISOString().split("T")[0],
      seoTitle: articleTitle,
      seoDescription: articleSummary,
      author: "Dr. Meera Nambiar, MD",
    };

    if (editingArticle) {
      updateBlogArticle(editingArticle.id, payload);
      showFlash("Editorial article updated in master CMS.");
    } else {
      addBlogArticle(payload);
      showFlash("New clinical publication launched to public portal.");
    }

    setIsBlogModalOpen(false);
  };

  // FAQ Handlers
  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;

    if (editingFaq) {
      updateFaq(editingFaq.id, {
        category: faqCategory,
        question: faqQuestion,
        answer: faqAnswer,
      });
      showFlash("FAQ article updated.");
    } else {
      addFaq({
        category: faqCategory,
        question: faqQuestion,
        answer: faqAnswer,
        order: faqs.length + 1,
        status: "published",
      });
      showFlash("New FAQ added to knowledge base.");
    }

    setIsFaqModalOpen(false);
  };

  // Service Save
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    updateService(editingService.id, {
      pricePaise: servicePrice * 100,
      duration: serviceDuration,
      tagline: serviceTagline,
    });

    showFlash(`Updated treatment offering '${editingService.title}'.`);
    setEditingService(null);
  };

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Marketing Campaigns & Master CMS"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Marketing & CMS" }]}
      />

      {statusMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-sm text-emerald-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Tabs Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 backdrop-blur-md">
        {[
          { id: "banners", label: "Hero Banners", icon: <ImageIcon className="h-4 w-4" />, count: banners.length },
          { id: "campaigns", label: "Audience Campaigns", icon: <Megaphone className="h-4 w-4" />, count: campaigns.length },
          { id: "blog", label: "Blog Publications", icon: <FileText className="h-4 w-4" />, count: blogArticles.length },
          { id: "faqs", label: "FAQ Knowledge Base", icon: <HelpCircle className="h-4 w-4" />, count: faqs.length },
          { id: "services", label: "Consultation Treatments", icon: <Stethoscope className="h-4 w-4" />, count: services.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as MarketingTab)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === tab.id
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <span className="font-mono text-[10px] opacity-75">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* BANNERS TAB */}
      {activeTab === "banners" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Visual Banner Placements</h3>
              <p className="text-xs text-zinc-400">
                Live banners rendered across customer shopping hubs and home portals.
              </p>
            </div>
            <button
              onClick={handleOpenAddBanner}
              disabled={!canEdit}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-black hover:bg-amber-400 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Add Hero Banner
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-md flex flex-col justify-between"
              >
                <div className="relative h-36 w-full">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <span className="absolute top-3 right-3 rounded bg-zinc-950/80 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-zinc-800">
                    {banner.placement.toUpperCase()}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h4 className="text-sm font-semibold text-white">{banner.title}</h4>
                    <p className="text-[11px] text-zinc-300">{banner.subtitle}</p>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between border-t border-zinc-850 text-xs">
                  <span className="font-mono text-zinc-500 text-[11px] truncate max-w-[150px]">
                    {banner.linkUrl}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditBanner(banner)}
                      disabled={!canEdit}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteBanner(banner.id)}
                      disabled={!canDelete}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-500/20 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CAMPAIGNS TAB */}
      {activeTab === "campaigns" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Segmented Diagnostic Broadcasts</h3>
              <p className="text-xs text-zinc-400">
                Trigger multi-channel retention campaigns to customers with specific clinical score profiles.
              </p>
            </div>
            <button
              onClick={() => setIsCampaignModalOpen(true)}
              disabled={!canEdit}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-black hover:bg-amber-400 disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> Launch Broadcast
            </button>
          </div>

          <div className="space-y-3">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-zinc-700"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white">{camp.name}</h4>
                      <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                        {camp.targetSegment.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-300 max-w-xl">"{camp.message}"</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 block uppercase font-mono">
                        Channel: {camp.channel}
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {camp.sentCount || 0} Delivered
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BLOG ARTICLES TAB */}
      {activeTab === "blog" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Editorial Clinical Publications</h3>
              <p className="text-xs text-zinc-400">
                Master skincare articles rendered on the public `/blog` route.
              </p>
            </div>
            <button
              onClick={handleOpenAddArticle}
              disabled={!canEdit}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-black hover:bg-amber-400 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Write Article
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {blogArticles.map((art) => (
              <div
                key={art.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <img
                    src={art.coverImage}
                    alt={art.title}
                    className="h-36 w-full rounded-xl object-cover border border-zinc-800"
                  />
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 block uppercase">
                      {art.category}
                    </span>
                    <h4 className="text-sm font-semibold text-white line-clamp-1">{art.title}</h4>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{art.summary}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-zinc-850 pt-3 text-xs text-zinc-500">
                  <span>{art.readTimeMinutes} min read</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditArticle(art)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteBlogArticle(art.id)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-500/20 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQS TAB */}
      {activeTab === "faqs" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Public FAQ Repository</h3>
              <p className="text-xs text-zinc-400">
                Frequently asked questions rendered on the public `/faq` portal.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingFaq(null);
                setFaqQuestion("");
                setFaqAnswer("");
                setIsFaqModalOpen(true);
              }}
              disabled={!canEdit}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-black hover:bg-amber-400 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Add FAQ Item
            </button>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-zinc-700"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 uppercase">
                      {faq.category}
                    </span>
                    <h4 className="text-sm font-semibold text-white">{faq.question}</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed mt-1">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-4 shrink-0">
                    <button
                      onClick={() => {
                        setEditingFaq(faq);
                        setFaqQuestion(faq.question);
                        setFaqAnswer(faq.answer);
                        setFaqCategory(faq.category);
                        setIsFaqModalOpen(true);
                      }}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteFaq(faq.id)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-500/20 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SERVICES TAB */}
      {activeTab === "services" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Telemedicine Consultations & Regimens</h3>
              <p className="text-xs text-zinc-400">
                Service pricing, treatment duration, and clinical descriptions for bookings.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-md flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-400 uppercase">
                      {srv.category}
                    </span>
                    <span className="font-mono text-xs text-zinc-400">{srv.duration}</span>
                  </div>
                  <h4 className="text-base font-semibold text-white">{srv.title}</h4>
                  <p className="text-xs text-zinc-400">{srv.tagline}</p>
                  <div className="pt-2 font-mono text-lg font-bold text-amber-400">
                    ₹{(srv.pricePaise / 100).toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="mt-5 flex justify-end border-t border-zinc-850 pt-3">
                  <button
                    onClick={() => {
                      setEditingService(srv);
                      setServicePrice(srv.pricePaise / 100);
                      setServiceDuration(srv.duration);
                      setServiceTagline(srv.tagline);
                    }}
                    disabled={!canEdit}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-amber-500/50 hover:text-white"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-amber-400" /> Edit Pricing & Duration
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white">
              {editingBanner ? "Edit Hero Banner" : "Publish Hero Banner"}
            </h3>
            <form onSubmit={handleSaveBanner} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-300">Banner Heading</label>
                <input
                  type="text"
                  required
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="e.g., Cellular Barrier Reset Protocol"
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">Subtitle / Offer</label>
                <input
                  type="text"
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  placeholder="e.g., Clinical Prescriptions Curated for Barrier Integrity"
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">Image Asset URL</label>
                <input
                  type="text"
                  required
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300">Placement Slot</label>
                  <select
                    value={bannerPlacement}
                    onChange={(e) => setBannerPlacement(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="home_hero">Home Portal Hero</option>
                    <option value="shop_top">Customer Shop Header</option>
                    <option value="app_promo">Diagnostic Regimen Banner</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Link Destination</label>
                  <input
                    type="text"
                    value={bannerLink}
                    onChange={(e) => setBannerLink(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-semibold text-black hover:bg-amber-400"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaign Broadcast Modal */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Create Targeted Retention Broadcast</h3>
            <form onSubmit={handleCreateAndSendCampaign} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-300">Campaign Name</label>
                <input
                  type="text"
                  required
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g., Hydration Emergency Replenishment"
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300">Audience Segment</label>
                  <select
                    value={campaignSegment}
                    onChange={(e) => setCampaignSegment(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="low_hydration_score">Low Hydration (&lt;50)</option>
                    <option value="repeat_buyers">Repeat Regimen Buyers</option>
                    <option value="dormant_users">Dormant &gt;30 Days</option>
                    <option value="high_barrier_damage">Barrier Damage Profiles</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Channel</label>
                  <select
                    value={campaignChannel}
                    onChange={(e) => setCampaignChannel(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="push">In-App Push</option>
                    <option value="email">Verified Email</option>
                    <option value="sms">SMS Gateway</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">Broadcast Copy</label>
                <textarea
                  rows={3}
                  required
                  value={campaignMessage}
                  onChange={(e) => setCampaignMessage(e.target.value)}
                  placeholder="Your recent skin scan detected a 14% drop in epidermal hydration. Tap to claim your personalized ceramide formulation."
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-semibold text-black hover:bg-amber-400"
                >
                  Dispatch Live Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Edit Treatment Pricing</h3>
            <p className="text-xs text-zinc-400">{editingService.title}</p>

            <form onSubmit={handleSaveService} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-300">Consultation Fee (₹)</label>
                <input
                  type="number"
                  required
                  value={servicePrice}
                  onChange={(e) => setServicePrice(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-mono font-bold text-amber-400 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">Duration SLA</label>
                <input
                  type="text"
                  required
                  value={serviceDuration}
                  onChange={(e) => setServiceDuration(e.target.value)}
                  placeholder="e.g., 30 mins"
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">Tagline</label>
                <input
                  type="text"
                  value={serviceTagline}
                  onChange={(e) => setServiceTagline(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-semibold text-black hover:bg-amber-400"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white">
              {editingFaq ? "Edit FAQ" : "Add FAQ Item"}
            </h3>
            <form onSubmit={handleSaveFaq} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-300">Category</label>
                <input
                  type="text"
                  required
                  value={faqCategory}
                  onChange={(e) => setFaqCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">Question</label>
                <input
                  type="text"
                  required
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">Answer</label>
                <textarea
                  rows={3}
                  required
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-semibold text-black hover:bg-amber-400"
                >
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blog Article Modal */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-semibold text-white">
              {editingArticle ? "Edit Skincare Article" : "Write Skincare Publication"}
            </h3>
            <form onSubmit={handleSaveArticle} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-300">Article Title</label>
                <input
                  type="text"
                  required
                  value={articleTitle}
                  onChange={(e) => setArticleTitle(e.target.value)}
                  placeholder="e.g., Understanding Retinoid Concentration Limits in Cosmeceuticals"
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300">Category</label>
                  <input
                    type="text"
                    required
                    value={articleCategory}
                    onChange={(e) => setArticleCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Status</label>
                  <select
                    value={articleStatus}
                    onChange={(e) => setArticleStatus(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">Executive Summary</label>
                <textarea
                  rows={2}
                  required
                  value={articleSummary}
                  onChange={(e) => setArticleSummary(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">Full Article Content (Markdown)</label>
                <textarea
                  rows={6}
                  required
                  value={articleContent}
                  onChange={(e) => setArticleContent(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs font-mono text-zinc-300 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">Cover Image URL</label>
                <input
                  type="text"
                  required
                  value={articleCover}
                  onChange={(e) => setArticleCover(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsBlogModalOpen(false)}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-semibold text-black hover:bg-amber-400"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
