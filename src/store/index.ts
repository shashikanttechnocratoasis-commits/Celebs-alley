import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  User,
  Role,
  SkinParameter,
  Product,
  Seller,
  InventoryItem,
  Order,
  Appointment,
  Notification,
  AuditLogEntry,
  Coupon,
  ConsentRecord,
  QuestionnaireAnswers,
  Scan,
  CustomerProfile,
  OtpState,
  Address,
  Shipment,
  PaymentRecord,
  InventoryMovement,
  Review,
  ReturnRequest,
  Offer,
  SellerRole,
  SellerResource,
  SellerAction,
  PermissionMatrix,
  SellerStaff,
  SellerWarehouse,
  Settlement,
  PayoutRequest,
  Courier,
  ParameterDraft,
  ParameterVersion,
  RecommendationRule,
  ModelVersion,
  PlatformSettings,
  PaymentTransaction,
  Ticket,
  TicketMessage,
  PrivacyRequest,
  LoginAttempt,
  AdminNote,
  Banner,
  Campaign,
  CmsArticle,
  CmsFaq,
  CmsService,
  Category,
  Brand,
  Ingredient,
  AdminPermissionMatrix,
  AdminRole,
  AdminResource,
  AdminAction,
  ConsultantProfile,
  AvailabilityRule,
  TimeOff,
  ClientNote,
  ScanShareConsent,
  ConsultantReview,
  SessionRecord,
  Plan,
  PlanTemplate,
  ChatThread,
  ChatMessage,
  ActivityEvent,
} from "@/types";

// Seed JSON data
import initialParameters from "@/data/parameters.json";
import initialProducts from "@/data/products.json";
import initialSellers from "@/data/sellers.json";
import initialInventory from "@/data/inventory.json";
import initialUsers from "@/data/users.json";
import initialOrders from "@/data/orders.json";
import initialAppointments from "@/data/appointments.json";
import initialNotifications from "@/data/notifications.json";
import initialAuditLog from "@/data/auditLog.json";
import initialCoupons from "@/data/coupons.json";
import initialAddresses from "@/data/addresses.json";
import initialReviews from "@/data/reviews.json";
import initialWarehouses from "@/data/warehouses.json";
import initialSellerStaff from "@/data/sellerStaff.json";
import initialSettlements from "@/data/settlements.json";
import initialCouriers from "@/data/couriers.json";
import initialRules from "@/data/rules.json";
import initialParameterVersions from "@/data/parameterVersions.json";
import initialModelVersions from "@/data/modelVersions.json";
import initialPlatformSettings from "@/data/platformSettings.json";
import initialTickets from "@/data/tickets.json";
import initialBanners from "@/data/banners.json";
import initialCampaigns from "@/data/campaigns.json";
import initialPrivacyRequests from "@/data/privacyRequests.json";
import initialLoginAttempts from "@/data/loginAttempts.json";
import initialPaymentTransactions from "@/data/paymentTransactions.json";
import initialCategories from "@/data/categories.json";
import initialBrands from "@/data/brands.json";
import initialIngredients from "@/data/ingredients.json";
import initialBlogArticles from "@/data/blog.json";
import initialFaqs from "@/data/faqs.json";
import initialServices from "@/data/services.json";
import { DEFAULT_PERMISSION_MATRIX, DEFAULT_ADMIN_PERMISSION_MATRIX } from "@/lib/rbac";
import { formatINR } from "@/lib/pricing";
import { createParametersSlice, type ParametersSlice } from "./slices/parametersSlice";
import { createRulesSlice, type RulesSlice } from "./slices/rulesSlice";
import { createSellersSlice, type SellersSlice } from "./slices/sellersSlice";
import { createCommerceSlice, type CommerceSlice } from "./slices/commerceSlice";
import { createContentSlice, type ContentSlice } from "./slices/contentSlice";
import { createSupportSlice, type SupportSlice } from "./slices/supportSlice";
import { createSecuritySlice, type SecuritySlice } from "./slices/securitySlice";
import { createAdminSlice, type AdminSlice } from "./slices/adminSlice";
import { createConsultantSlice, type ConsultantSlice } from "./slices/consultantSlice";
import { createPlanSlice, type PlanSlice } from "./slices/planSlice";
import { createChatSlice, type ChatSlice } from "./slices/chatSlice";
import { createActivitySlice, type ActivitySlice } from "./slices/activitySlice";

import initialCustomers from "@/data/customers.json";
import initialConsultants from "@/data/consultants.json";
import initialAvailability from "@/data/availability.json";
import initialClientNotes from "@/data/clientNotes.json";
import initialScanShareConsents from "@/data/scanShareConsents.json";
import initialConsultantReviews from "@/data/consultantReviews.json";
import initialSessions from "@/data/sessions.json";
import initialClientPlans from "@/data/clientPlans.json";
import initialPlanTemplates from "@/data/planTemplates.json";
import initialChatThreads from "@/data/chatThreads.json";
import initialChatMessages from "@/data/chatMessages.json";
import initialActivityEvents from "@/data/activityEvents.json";

export * from "./slices/parametersSlice";
export * from "./slices/rulesSlice";
export * from "./slices/sellersSlice";
export * from "./slices/commerceSlice";
export * from "./slices/contentSlice";
export * from "./slices/supportSlice";
export * from "./slices/securitySlice";
export * from "./slices/adminSlice";
export * from "./slices/consultantSlice";
export * from "./slices/planSlice";
export * from "./slices/chatSlice";
export * from "./slices/activitySlice";

export interface CartItem {
  productId: string;
  sellerId: string;
  quantity: number;
  addedAt: string;
  snapshotPrice?: number;
  // Backward-compat getters/fallbacks
  product?: Product;
  unitPrice?: number;
}

export interface HydratedCartItem {
  productId: string;
  sellerId: string;
  quantity: number;
  addedAt: string;
  product: Product;
  seller: Seller;
  price: number;
  mrp: number;
  stock: number;
  availableStock: number;
  priceChanged: boolean;
  previousPrice?: number;
  isAvailable: boolean;
  taxRate: number;
}

const initialFullScans: Scan[] = [
  {
    id: "scan-sample-1",
    customerId: "user-customer",
    customerName: "Ritu Sharma",
    createdAt: "2026-10-08T14:30:00Z",
    status: "completed",
    thumbnails: {
      front: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      left: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
      right: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    },
    overallScore: 84,
    qualityScore: 96,
    parameterScores: {
      "param-1": 72,
      "param-2": 82,
      "param-3": 91,
      "param-4": 86,
      "param-5": 78,
      "param-6": 85,
      "param-7": 88,
      "param-8": 90,
      "hydration": 72,
      "oil_balance": 82,
      "texture": 91,
      "pigmentation": 86,
      "acne_blemishes": 78,
      "fine_lines": 85,
      "redness_sensitivity": 88,
      "pore_visibility": 90,
    },
    topConcerns: [
      {
        parameterId: "param-1",
        name: "Hydration",
        score: 72,
        rank: 1,
        interpretation: "Mild sub-surface moisture loss along cheeks.",
        focusTip: "Layer 5-weight hyaluronic acid serum under ceramides.",
        icon: "Droplets",
      },
      {
        parameterId: "param-5",
        name: "Acne and Blemishes",
        score: 78,
        rank: 2,
        interpretation: "Follicular congestion and occasional stress-induced blemishes.",
        focusTip: "Incorporate targeted BHA salicylic serum and antibacterial cica wash.",
        icon: "ShieldAlert",
      },
      {
        parameterId: "param-2",
        name: "Oil Balance",
        score: 82,
        rank: 3,
        interpretation: "Balanced sebaceous output with slight T-zone shine.",
        focusTip: "Apply light niacinamide fluid in AM.",
        icon: "Activity",
      },
    ],
    versionMetadata: {
      analysisVersion: "sim-1.0",
      parametersVersion: "v1.2",
    },
    notes: "Baseline diagnostic scan with facial mesh reconstruction.",
  },
  {
    id: "scan-sample-2",
    customerId: "user-customer",
    customerName: "Ritu Sharma",
    createdAt: "2026-09-10T10:15:00Z",
    status: "completed",
    thumbnails: {
      front: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      left: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
      right: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    },
    overallScore: 78,
    qualityScore: 94,
    parameterScores: {
      "param-1": 64, // Hydration
      "param-2": 78, // Sebum
      "param-3": 85, // Pigmentation
      "param-4": 82, // Fine lines
      "param-5": 70, // Redness
      "param-6": 80, // Pore visibility
      "param-7": 82, // Texture
      "param-8": 84, // Elasticity
    },
    topConcerns: [
      {
        parameterId: "param-1",
        name: "Hydration",
        score: 64,
        rank: 1,
        interpretation: "Moderate barrier dehydration and moisture deficit.",
        focusTip: "Hydrate actively with multi-weight HA.",
        icon: "Droplets",
      },
      {
        parameterId: "param-5",
        name: "Redness & Sensitivity",
        score: 70,
        rank: 2,
        interpretation: "Moderate redness flare-up.",
        focusTip: "Avoid harsh scrubs.",
        icon: "ShieldAlert",
      },
      {
        parameterId: "param-2",
        name: "Oil Balance",
        score: 78,
        rank: 3,
        interpretation: "Sub-optimal balance.",
        focusTip: "Regulate with gentle cleansers.",
        icon: "Activity",
      },
    ],
    versionMetadata: {
      analysisVersion: "sim-1.0",
      parametersVersion: "v1.2",
    },
    notes: "Initial baseline scan.",
  },
];

const initialCustomerProfile: CustomerProfile = {
  id: "prof-1",
  userId: "user-4",
  name: "Radhika Singhania",
  email: "radhika@example.com",
  phone: "+91 98244 24455",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  onboardingCompleted: true,
  consent: {
    timestamp: "2026-09-10T10:00:00Z",
    version: "v1.0",
    facialAnalysis: true,
    privacyTerms: true,
    storeHistory: true,
    marketing: false,
  },
  questionnaire: {
    ageRange: "23-32",
    gender: "female",
    skinType: "combination",
    skinConcerns: ["Dehydration", "Redness"],
    allergies: ["none"],
    currentRoutine: "moderate",
    sunExposure: "1 â€“ 3 hours",
    sleepHours: "7 â€“ 8 hours",
    waterIntake: "1.5 â€“ 2.5 Liters",
    stressLevel: "Moderate",
    pregnantOrNursing: "not_applicable",
    completedAt: "2026-09-10T10:10:00Z",
  },
  registeredAt: "2026-09-10T09:45:00Z",
};

function normalizeOrder(order: any, sellers: Seller[] = initialSellers as Seller[]): Order {
  if (order.shipments && order.shipments.length > 0 && order.timeline) {
    return order;
  }

  const primarySeller = sellers.find((s) => s.id === order.sellerId) || sellers[0] || {
    id: "seller-1",
    company: "Royal Beauty Logistics Pvt Ltd",
    state: "Maharashtra",
  };

  const cgst = order.cgst ?? Math.round((order.tax || 0) / 2);
  const sgst = order.sgst ?? (order.tax || 0) - cgst;

  const timeline = order.timeline || [
    {
      status: "confirmed",
      label: "Order Confirmed",
      timestamp: order.createdAt || new Date().toISOString(),
      note: "Order placed & verified.",
    },
    ...(order.status === "shipped" || order.status === "delivered"
      ? [
          {
            status: "processing",
            label: "Cosmeceutical Batch Verified",
            timestamp: order.createdAt,
            note: "Batch release QA check passed.",
          },
          {
            status: "packed",
            label: "Cold-Shield Luxury Packaging Complete",
            timestamp: order.createdAt,
            note: "Packed in insulated cold-shield luxury box.",
          },
          {
            status: "shipped",
            label: "Dispatched via BlueDart Luxury Express",
            timestamp: order.createdAt,
            note: `Consignment AWB #BD-${order.id.replace("ord-", "8821")}`,
          },
        ]
      : []),
    ...(order.status === "delivered"
      ? [
          {
            status: "delivered",
            label: "Delivered to Recipient",
            timestamp: order.createdAt,
            note: "Handed over safely.",
          },
        ]
      : []),
  ];

  const shipment: Shipment = {
    id: `ship-${order.id}-1`,
    orderId: order.id,
    sellerId: primarySeller.id,
    sellerName: primarySeller.company,
    sellerState: primarySeller.state,
    items: order.items || [],
    subtotal: order.subtotal || 0,
    discount: order.discount || 0,
    tax: order.tax || 0,
    cgst,
    sgst,
    igst: order.igst || 0,
    shippingFee: order.shippingFee || 0,
    total: order.total || 0,
    status: order.status || "confirmed",
    courierName: "BlueDart Luxury Express",
    trackingNumber: `BD-${order.id.replace("ord-", "8821")}`,
    timeline,
  };

  return {
    ...order,
    shipments: order.shipments || [shipment],
    timeline,
    payment: order.payment || {
      method: order.paymentMethod?.toLowerCase().includes("card") ? "card" : "upi",
      status: order.paymentStatus || "paid",
      transactionId: `TXN-${order.id.replace("ord-", "9901")}`,
      cardLast4: "4111",
      cardBrand: "Visa",
      paidAt: order.createdAt,
      amount: order.total,
    },
    shippingAddress: {
      name: order.customerName || "Radhika Singhania",
      mobile: "+91 98244 24455",
      ...order.shippingAddress,
    },
    cgst,
    sgst,
    igst: order.igst || 0,
  };
}

export interface BaseAppState {
  // Session Slice
  currentUser: User | null;
  currentRole: Role;
  users: User[];
  loginAs: (user: User) => void;
  switchRole: (role: Role) => void;
  logout: () => void;

  // Customer Profile & Onboarding Slice
  customerProfile: CustomerProfile;
  saveConsent: (consent: ConsentRecord) => void;
  saveQuestionnaire: (answers: QuestionnaireAnswers) => void;
  updateCustomerProfile: (updates: Partial<CustomerProfile>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  // OTP Auth Slice
  otpState: OtpState | null;
  sendOtp: (phoneOrEmail: string, type?: "login" | "signup" | "forgot") => { success: boolean; message: string; demoCode?: string };
  verifyOtp: (code: string) => { success: boolean; message: string; locked?: boolean };
  clearOtp: () => void;

  // UI Slice
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  activePanel: "public" | "customer" | "seller" | "admin" | "consultant";
  setActivePanel: (panel: "public" | "customer" | "seller" | "admin" | "consultant") => void;

  // Cart Slice
  cart: CartItem[];
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  appliedCoupon: Coupon | null;
  addToCart: (product: Product, quantity?: number, sellerId?: string, price?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  changeSellerInCart: (productId: string, newSellerId: string) => void;
  moveCartItemToWishlist: (productId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  getHydratedCart: () => HydratedCartItem[];

  // Addresses Slice
  addresses: Address[];
  addAddress: (address: Omit<Address, "id" | "createdAt">) => Address;
  updateAddress: (id: string, updates: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // Pincode Slice
  pincode: string;
  setPincode: (pincode: string) => void;

  // Reviews Slice
  reviews: Review[];
  addReview: (review: Omit<Review, "id" | "createdAt">) => void;

  // Returns Slice
  returns: ReturnRequest[];
  requestReturn: (returnRequest: Omit<ReturnRequest, "id" | "requestedAt" | "status">) => { success: boolean; message: string };
  simulateReturnApproval: (returnId: string) => void;

  // Orders Slice
  orders: Order[];
  createOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  updateShipmentStatus: (orderId: string, shipmentId: string, status: Shipment["status"], note?: string) => void;
  cancelOrder: (orderId: string, reason: string) => { success: boolean; message: string };

  // AI Parameters Slice
  parameters: SkinParameter[];
  updateParameter: (id: string, updates: Partial<SkinParameter>) => void;

  // Scans Slice
  scans: Scan[];
  scanRecords: Scan[];
  customers: any[];
  currentScan: Scan | null;
  setCurrentScan: (scan: Scan | null) => void;
  addScan: (scan: Scan) => void;
  deleteScan: (scanId: string) => void;
  clearAllScanData: () => void;

  // Products Slice
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  simulateApproveProduct: (id: string) => void;

  // Sellers & Multi-tenant Core Slice
  sellers: Seller[];
  updateSeller: (id: string, updates: Partial<Seller>) => void;
  updateSellerStatus: (id: string, status: Seller["status"]) => void;
  toggleSellerPaused: (sellerId: string) => boolean;
  sellerSimulateKycStatus: (sellerId: string, status: Seller["status"], reason?: string) => void;
  sellerKycDraft: any;
  saveSellerKycDraft: (draft: any) => void;
  clearSellerKycDraft: () => void;
  registerSellerAndLogin: (data: any) => { sellerId: string; user: User };

  // Seller Offers & Inventory Slices
  inventory: InventoryItem[];
  inventoryMovements: InventoryMovement[];
  updateInventoryStock: (id: string, stock: number) => void;
  updateInventoryPrice: (id: string, price: number) => void;
  addInventoryOffer: (offer: Omit<InventoryItem, "id" | "updatedAt">) => InventoryItem;
  updateInventoryOffer: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryOffer: (id: string) => void;
  stockIn: (offerId: string, quantity: number, batchNumber?: string, expiryDate?: string, supplierRef?: string) => void;
  stockOut: (offerId: string, quantity: number, reason: string) => void;
  adjustStock: (offerId: string, newStock: number, reason: string) => void;
  markDamaged: (offerId: string, quantity: number, reason?: string) => void;
  transferStock: (offerId: string, fromWarehouseId: string, toWarehouseId: string, quantity: number) => void;
  bulkUpdateInventory: (updates: Array<{ id: string; price?: number; stock?: number; status?: "active" | "inactive" }>) => void;
  reserveStock: (items: Array<{ productId: string; sellerId: string; quantity: number }>, orderId?: string) => { success: boolean; unavailableItem?: string };
  deductStock: (items: Array<{ productId: string; sellerId: string; quantity: number }>, orderId: string) => void;
  releaseStock: (items: Array<{ productId: string; sellerId: string; quantity: number }>, orderId?: string, reason?: string) => void;

  // Seller Order Fulfillment Workflow
  acceptShipment: (orderId: string, shipmentId: string) => void;
  rejectShipment: (orderId: string, shipmentId: string, reason: string) => void;
  packShipment: (orderId: string, shipmentId: string, checklistNotes?: string) => void;
  shipShipment: (orderId: string, shipmentId: string, courierName: string, trackingNumber: string, estDeliveryDays?: number) => void;
  deliverShipment: (orderId: string, shipmentId: string, codCollected?: boolean) => void;
  decideReturn: (orderId: string, returnId: string, decision: "approved" | "rejected", reason?: string, restock?: boolean) => void;

  // Warehouses Slice
  warehouses: SellerWarehouse[];
  addWarehouse: (wh: Omit<SellerWarehouse, "id">) => SellerWarehouse;
  updateWarehouse: (id: string, updates: Partial<SellerWarehouse>) => void;
  deleteWarehouse: (id: string) => { success: boolean; message: string };

  // Staff & RBAC Slice
  sellerStaff: SellerStaff[];
  inviteSellerStaff: (staff: Omit<SellerStaff, "id" | "joinedAt" | "lastActive">) => { success: boolean; message: string };
  updateSellerStaff: (id: string, updates: Partial<SellerStaff>) => void;
  deleteSellerStaff: (id: string) => { success: boolean; message: string };
  sellerPermissions: PermissionMatrix;
  updateSellerPermission: (role: SellerRole, resource: SellerResource, actions: SellerAction[]) => void;
  resetSellerPermissions: () => void;

  // Payouts & Settlements Slice
  settlements: Settlement[];
  payoutRequests: PayoutRequest[];
  createPayoutRequest: (sellerId: string, amount: number, bankLast4: string, bankName: string) => { success: boolean; message: string; request?: PayoutRequest };
  advancePayoutRequest: (id: string, status: PayoutRequest["status"]) => void;

  // Couriers Slice
  couriers: Courier[];

  // Appointments Slice
  appointments: Appointment[];
  bookAppointment: (appointment: Appointment) => void;
  cancelAppointment: (id: string) => void;
  rescheduleAppointment: (id: string, date: string, time: string) => void;

  // Notifications Slice
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notification: Notification) => void;

  // Audit Log Slice
  auditLogs: AuditLogEntry[];
  addAuditLog: (log: Omit<AuditLogEntry, "id" | "timestamp">) => void;
  logAuditEvent: (log: any) => void;

  // Wishlist Slice
  wishlist: string[];
  toggleWishlist: (productId: string) => { added: boolean };
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;

  // Inquiries Slice
  inquiries: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    createdAt: string;
  }>;
  addInquiry: (inquiry: { name: string; email: string; phone?: string; subject: string; message: string }) => void;

  // Newsletter Slice
  newsletterEmails: string[];
  subscribeNewsletter: (email: string) => { success: boolean; message: string };

  // Cookie Consent Slice
  cookieConsent: {
    accepted: boolean;
    analytics: boolean;
    marketing: boolean;
    timestamp: string;
  } | null;
  setCookieConsent: (consent: { accepted: boolean; analytics: boolean; marketing: boolean }) => void;

  // Reset Everything
  resetDemoData: () => void;
}

export type AppState = BaseAppState &
  ParametersSlice &
  RulesSlice &
  SellersSlice &
  CommerceSlice &
  ContentSlice &
  SupportSlice &
  SecuritySlice &
  AdminSlice &
  ConsultantSlice &
  PlanSlice &
  ChatSlice &
  ActivitySlice;

export const useAppStore = create<AppState>()(
  persist(
    (set, get, api) => ({
      // Session
      currentUser: (initialUsers[0] as User) || null,
      currentRole: "Super Admin",
      users: (initialUsers as User[]).map((u) => ({
        ...u,
        status: (u.status || "active") as "active" | "suspended",
        signupDate: u.signupDate || "2026-01-10",
      })),
      loginAs: (user: User) => {
        const state = get();
        const existing = (state.users || []).find((u) => u.id === user.id) || user;
        if (existing.status === "suspended") {
          throw new Error("Account suspended. Access to Celebs Alley platform is restricted.");
        }
        set({
          currentUser: existing,
          currentRole: existing.role,
        });
      },
      switchRole: (role: Role) => {
        const matchingUser = (initialUsers as User[]).find((u) => u.role === role);
        if (matchingUser) {
          set({ currentUser: matchingUser, currentRole: role });
        } else {
          set({ currentRole: role });
        }
      },
      logout: () =>
        set({
          currentUser: null,
        }),

      // Customer Profile & Onboarding
      customerProfile: initialCustomerProfile,
      saveConsent: (consent) => {
        set((state) => ({
          customerProfile: {
            ...state.customerProfile,
            consent,
          },
        }));
        get().addAuditLog({
          userId: get().currentUser?.id || "guest",
          userName: get().currentUser?.name || "Guest Customer",
          role: "Customer",
          action: "CONSENT_RECORDED",
          resource: "biometric_privacy",
          details: `Consent version ${consent.version} agreed. Facial Analysis: ${consent.facialAnalysis}, Store History: ${consent.storeHistory}`,
          ipAddress: "127.0.0.1",
        });
      },
      saveQuestionnaire: (answers) => {
        set((state) => ({
          customerProfile: {
            ...state.customerProfile,
            questionnaire: answers,
          },
        }));
      },
      updateCustomerProfile: (updates) => {
        set((state) => ({
          customerProfile: {
            ...state.customerProfile,
            ...updates,
          },
        }));
      },
      completeOnboarding: () => {
        set((state) => ({
          customerProfile: {
            ...state.customerProfile,
            onboardingCompleted: true,
          },
        }));
      },
      resetOnboarding: () => {
        set({
          customerProfile: {
            ...initialCustomerProfile,
            onboardingCompleted: false,
            consent: null,
            questionnaire: null,
          },
        });
      },

      // OTP Auth
      otpState: null,
      sendOtp: (phoneOrEmail, type = "login") => {
        const newOtp: OtpState = {
          phoneOrEmail,
          code: "123456",
          expiresAt: Date.now() + 10 * 60 * 1000,
          attempts: 0,
          type,
        };

        set({ otpState: newOtp });
        return {
          success: true,
          message: `OTP sent to ${phoneOrEmail}. (Demo code: 123456)`,
          demoCode: "123456",
        };
      },
      verifyOtp: (code) => {
        const current = get().otpState;
        if (!current) {
          return { success: false, message: "No active OTP request found. Please request an OTP." };
        }

        if (current.lockedUntil && current.lockedUntil > Date.now()) {
          const remainingSec = Math.ceil((current.lockedUntil - Date.now()) / 1000);
          return {
            success: false,
            locked: true,
            message: `Rate-limit locked. Please wait ${remainingSec}s before trying again.`,
          };
        }

        if (code === current.code || code === "123456") {
          set({ otpState: null });

          const existingCustomer = (initialUsers as User[]).find((u) => u.role === "Customer") || {
            id: `cust-${Date.now()}`,
            name: "Radhika Singhania",
            email: current.phoneOrEmail.includes("@") ? current.phoneOrEmail : "customer@example.com",
            phone: current.phoneOrEmail.startsWith("+") || !current.phoneOrEmail.includes("@") ? current.phoneOrEmail : "+91 98244 24455",
            role: "Customer" as Role,
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
          };

          set({
            currentUser: existingCustomer,
            currentRole: "Customer",
          });

          return { success: true, message: "Verification successful! Welcome back." };
        }

        const newAttempts = current.attempts + 1;
        if (newAttempts >= 3) {
          const lockedUntil = Date.now() + 30 * 1000;
          set({
            otpState: {
              ...current,
              attempts: newAttempts,
              lockedUntil,
            },
          });
          return {
            success: false,
            locked: true,
            message: "3 failed attempts. Account temporarily locked for 30 seconds for security.",
          };
        }

        set({
          otpState: {
            ...current,
            attempts: newAttempts,
          },
        });
        return {
          success: false,
          message: `Incorrect OTP code. (${3 - newAttempts} attempts remaining before temporary lockout)`,
        };
      },
      clearOtp: () => set({ otpState: null }),

      // UI
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      activePanel: "public",
      setActivePanel: (panel) => set({ activePanel: panel }),

      // Cart
      cart: [],
      cartDrawerOpen: false,
      setCartDrawerOpen: (open) => set({ cartDrawerOpen: open }),
      appliedCoupon: null,
      addToCart: (product, quantity = 1, sellerId, price) => {
        const state = get();
        // If sellerId not provided, select best offer from inventory
        let targetSellerId = sellerId;
        let unitPrice = price;

        if (!targetSellerId) {
          const offers = state.inventory
            .filter((inv) => inv.productId === product.id && inv.stock > (inv.reserved || 0))
            .sort((a, b) => a.price - b.price);
          if (offers.length > 0) {
            targetSellerId = offers[0].sellerId;
            unitPrice = offers[0].price;
          } else {
            targetSellerId = "seller-1";
            unitPrice = Math.round(product.mrp * 0.92);
          }
        }

        const currentCart = state.cart;
        const existingIndex = currentCart.findIndex((item) => item.productId === product.id);

        if (existingIndex > -1) {
          const updated = [...currentCart];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
            sellerId: targetSellerId,
            snapshotPrice: unitPrice ?? updated[existingIndex].snapshotPrice,
          };
          set({ cart: updated });
        } else {
          set({
            cart: [
              ...currentCart,
              {
                productId: product.id,
                sellerId: targetSellerId,
                quantity,
                addedAt: new Date().toISOString(),
                snapshotPrice: unitPrice,
                product,
                unitPrice,
              },
            ],
          });
        }
      },
      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.productId !== productId && item.product?.id !== productId),
        })),
      updateCartQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set((state) => ({
          cart: state.cart.map((item) =>
            item.productId === productId || item.product?.id === productId
              ? { ...item, quantity }
              : item
          ),
        }));
      },
      changeSellerInCart: (productId, newSellerId) => {
        set((state) => ({
          cart: state.cart.map((item) => {
            if (item.productId === productId || item.product?.id === productId) {
              const newInv = state.inventory.find(
                (inv) => inv.productId === productId && inv.sellerId === newSellerId
              );
              return {
                ...item,
                sellerId: newSellerId,
                snapshotPrice: newInv ? newInv.price : item.snapshotPrice,
              };
            }
            return item;
          }),
        }));
      },
      moveCartItemToWishlist: (productId) => {
        get().removeFromCart(productId);
        if (!get().isInWishlist(productId)) {
          get().toggleWishlist(productId);
        }
      },
      clearCart: () => set({ cart: [], appliedCoupon: null }),
      applyCoupon: (code) => {
        const found = (initialCoupons as Coupon[]).find(
          (c) => c.code.toUpperCase() === code.toUpperCase() && c.status === "active"
        );
        if (found) {
          set({ appliedCoupon: found });
          return { success: true, message: `Coupon ${found.code} applied successfully!` };
        }
        return { success: false, message: "Invalid or expired coupon code." };
      },
      removeCoupon: () => set({ appliedCoupon: null }),

      getHydratedCart: () => {
        const state = get();
        const hydrated: HydratedCartItem[] = [];

        state.cart.forEach((item) => {
          const prod = (initialProducts as unknown as Product[]).find((p) => p.id === item.productId) || item.product;
          if (!prod) return;

          const seller = state.sellers.find((s) => s.id === item.sellerId) || state.sellers[0];
          const inv = state.inventory.find(
            (i) => i.productId === item.productId && i.sellerId === item.sellerId
          );

          const livePrice = inv ? inv.price : item.snapshotPrice || Math.round(prod.mrp * 0.92);
          const liveStock = inv ? inv.stock : 10;
          const liveReserved = inv ? inv.reserved || 0 : 0;
          const availableStock = Math.max(0, liveStock - liveReserved);

          // Detect price update
          const priceChanged = Boolean(item.snapshotPrice && item.snapshotPrice !== livePrice);

          hydrated.push({
            productId: item.productId,
            sellerId: item.sellerId,
            quantity: Math.min(item.quantity, Math.max(1, availableStock || 1)),
            addedAt: item.addedAt,
            product: prod,
            seller,
            price: livePrice,
            mrp: inv ? inv.mrp : prod.mrp,
            stock: liveStock,
            availableStock,
            priceChanged,
            previousPrice: item.snapshotPrice,
            isAvailable: availableStock > 0,
            taxRate: prod.taxRate ?? 0.18,
          });
        });

        return hydrated;
      },

      // Addresses
      addresses: initialAddresses as Address[],
      addAddress: (addressData) => {
        const newAddress: Address = {
          ...addressData,
          id: `addr-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          let updated = [...state.addresses];
          if (newAddress.isDefault) {
            updated = updated.map((a) => ({ ...a, isDefault: false }));
          }
          return { addresses: [newAddress, ...updated] };
        });

        return newAddress;
      },
      updateAddress: (id, updates) => {
        set((state) => {
          let updated = state.addresses.map((a) => (a.id === id ? { ...a, ...updates } : a));
          if (updates.isDefault) {
            updated = updated.map((a) => (a.id === id ? a : { ...a, isDefault: false }));
          }
          return { addresses: updated };
        });
      },
      deleteAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.filter((a) => a.id !== id),
        }));
      },
      setDefaultAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
        }));
      },

      // Pincode
      pincode: "400026",
      setPincode: (pin) => set({ pincode: pin }),

      // Reviews
      reviews: initialReviews as Review[],
      addReview: (reviewData) => {
        const newReview: Review = {
          ...reviewData,
          id: `rev-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const updatedReviews = [newReview, ...state.reviews];
          // Recalculate average rating for product
          const productReviews = updatedReviews.filter((r) => r.productId === reviewData.productId);
          const avgRating =
            productReviews.reduce((sum, r) => sum + r.rating, 0) / (productReviews.length || 1);

          return {
            reviews: updatedReviews,
            // also update local products array if needed
          };
        });

        get().addNotification({
          id: `notif-${Date.now()}`,
          title: "Review Published",
          message: `Thank you for sharing clinical feedback on your purchase!`,
          read: false,
          type: "success",
          createdAt: new Date().toISOString(),
        });
      },

      // Returns
      returns: [],
      requestReturn: (reqData) => {
        const returnId = `ret-${Date.now()}`;
        const newReturn: ReturnRequest = {
          ...reqData,
          id: returnId,
          status: "pending",
          requestedAt: new Date().toISOString(),
          timeline: [
            {
              status: "pending",
              timestamp: new Date().toISOString(),
              note: "Return request submitted. Under clinical verification.",
            },
          ],
        };

        set((state) => {
          const updatedOrders = state.orders.map((order) => {
            if (order.id !== reqData.orderId) return order;
            return {
              ...order,
              status: "refunded" as const, // Or return branch
              shipments: order.shipments?.map((s) => {
                if (s.id !== reqData.shipmentId) return s;
                return {
                  ...s,
                  status: "return_requested" as const,
                  returnRequest: newReturn,
                  timeline: [
                    ...s.timeline,
                    {
                      status: "return_requested",
                      label: "Return Requested",
                      timestamp: new Date().toISOString(),
                      note: `Customer initiated return for ${reqData.productName}: ${reqData.reason}`,
                    },
                  ],
                };
              }),
            };
          });

          return {
            returns: [newReturn, ...state.returns],
            orders: updatedOrders,
          };
        });

        get().addNotification({
          id: `notif-${Date.now()}`,
          title: "Return Request Received",
          message: `Your return request for ${reqData.productName} is being reviewed.`,
          read: false,
          type: "info",
          createdAt: new Date().toISOString(),
        });

        return { success: true, message: "Return request submitted successfully." };
      },
      simulateReturnApproval: (returnId) => {
        set((state) => {
          const ret = state.returns.find((r) => r.id === returnId);
          if (!ret) return state;

          const updatedReturn: ReturnRequest = {
            ...ret,
            status: "refunded",
            timeline: [
              ...(ret.timeline || []),
              {
                status: "refunded",
                timestamp: new Date().toISOString(),
                note: `Refund of â‚¹${ret.refundAmount} approved & credited to ${ret.refundMethod}. (3-5 business days)`,
              },
            ],
          };

          const updatedOrders = state.orders.map((o) => {
            if (o.id !== ret.orderId) return o;
            return {
              ...o,
              status: "refunded" as const,
              shipments: o.shipments?.map((s) => {
                if (s.id !== ret.shipmentId) return s;
                return {
                  ...s,
                  status: "refunded" as const,
                  returnRequest: updatedReturn,
                  timeline: [
                    ...s.timeline,
                    {
                      status: "refunded",
                      label: "Refund Disbursed",
                      timestamp: new Date().toISOString(),
                      note: `Approved refund of â‚¹${ret.refundAmount} processed.`,
                    },
                  ],
                };
              }),
            };
          });

          return {
            returns: state.returns.map((r) => (r.id === returnId ? updatedReturn : r)),
            orders: updatedOrders,
          };
        });

        get().addNotification({
          id: `notif-${Date.now()}`,
          title: "Refund Approved",
          message: `Your return has been approved and refund processed to your original payment method.`,
          read: false,
          type: "success",
          createdAt: new Date().toISOString(),
        });
      },

      // Orders
      orders: (initialOrders as Order[]).map((o) => normalizeOrder(o, initialSellers as Seller[])),
      createOrder: (order) => {
        const normalized = normalizeOrder(order, get().sellers);
        set((state) => ({
          orders: [normalized, ...state.orders],
        }));

        // Notifications
        get().addNotification({
          id: `notif-${Date.now()}`,
          title: "Order Placed Successfully",
          message: `Order #${normalized.orderNumber} for â‚¹${normalized.total.toLocaleString("en-IN")} confirmed.`,
          read: false,
          type: "success",
          createdAt: new Date().toISOString(),
          actionUrl: `/app/orders/${normalized.id}`,
        });

        // Audit Log
        get().addAuditLog({
          userId: normalized.customerId || "cust-1",
          userName: normalized.customerName || "Customer",
          role: "Customer",
          action: "ORDER_CREATED",
          resource: "orders",
          details: `Order #${normalized.orderNumber} placed across ${normalized.shipments?.length || 1} seller shipments. Total: â‚¹${normalized.total}`,
          ipAddress: "127.0.0.1",
        });
      },
      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
        }));
      },
      updateShipmentStatus: (orderId, shipmentId, newStatus, note) => {
        const statusLabels: Record<string, string> = {
          pending: "Pending Verification",
          confirmed: "Confirmed",
          processing: "Cosmeceutical Batch Verified",
          packed: "Insulated Packaging Complete",
          shipped: "Dispatched via BlueDart",
          out_for_delivery: "Out for Delivery",
          delivered: "Delivered to Recipient",
          cancelled: "Shipment Cancelled",
          return_requested: "Return Requested",
          returned: "Returned",
          refunded: "Refund Processed",
        };

        set((state) => {
          const updatedOrders = state.orders.map((order) => {
            if (order.id !== orderId) return order;

            let allDelivered = true;
            let anyShipped = false;

            const updatedShipments = order.shipments?.map((shipment) => {
              if (shipment.id !== shipmentId) {
                if (shipment.status !== "delivered") allDelivered = false;
                if (shipment.status === "shipped") anyShipped = true;
                return shipment;
              }

              const newTimelineEvent = {
                status: newStatus,
                label: statusLabels[newStatus] || newStatus,
                timestamp: new Date().toISOString(),
                note: note || `Shipment transitioned to ${statusLabels[newStatus] || newStatus}.`,
              };

              if (newStatus !== "delivered") allDelivered = false;
              if (newStatus === "shipped") anyShipped = true;

              return {
                ...shipment,
                status: newStatus,
                timeline: [...shipment.timeline, newTimelineEvent],
              };
            });

            // Parent order status inference
            let parentStatus = order.status;
            if (newStatus === "delivered" && allDelivered) {
              parentStatus = "delivered";
            } else if (newStatus === "shipped" || anyShipped) {
              parentStatus = "shipped";
            } else if (newStatus === "processing" || newStatus === "packed") {
              parentStatus = "processing";
            }

            return {
              ...order,
              status: parentStatus,
              shipments: updatedShipments,
              timeline: [
                ...(order.timeline || []),
                {
                  status: newStatus,
                  label: `Shipment from ${updatedShipments?.find((s) => s.id === shipmentId)?.sellerName || "Seller"}: ${statusLabels[newStatus]}`,
                  timestamp: new Date().toISOString(),
                  note: note || `Updated shipment status to ${statusLabels[newStatus]}.`,
                },
              ],
            };
          });

          return { orders: updatedOrders };
        });

        get().addNotification({
          id: `notif-${Date.now()}`,
          title: `Shipment Update: ${statusLabels[newStatus] || newStatus}`,
          message: `Your shipment for order #${orderId} is now ${statusLabels[newStatus] || newStatus}.`,
          read: false,
          type: newStatus === "delivered" ? "success" : "info",
          createdAt: new Date().toISOString(),
          actionUrl: `/app/orders/${orderId}`,
        });
      },
      cancelOrder: (orderId, reason) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return { success: false, message: "Order not found" };

        if (order.status === "shipped" || order.status === "delivered") {
          return { success: false, message: "Cannot cancel order that has already shipped or delivered." };
        }

        // Release inventory
        order.items.forEach((item) => {
          get().releaseStock([{ productId: item.productId, sellerId: order.sellerId, quantity: item.quantity }], orderId, "Order cancelled");
        });

        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId) return o;
            return {
              ...o,
              status: "cancelled",
              shipments: o.shipments?.map((s) => ({
                ...s,
                status: "cancelled",
                timeline: [
                  ...s.timeline,
                  {
                    status: "cancelled",
                    label: "Order Cancelled",
                    timestamp: new Date().toISOString(),
                    note: `Cancellation reason: ${reason}`,
                  },
                ],
              })),
              timeline: [
                ...(o.timeline || []),
                {
                  status: "cancelled",
                  label: "Order Cancelled by Customer",
                  timestamp: new Date().toISOString(),
                  note: `Reason: ${reason}. Full refund initiated.`,
                },
              ],
            };
          }),
        }));

        get().addNotification({
          id: `notif-${Date.now()}`,
          title: "Order Cancelled",
          message: `Order #${order.orderNumber} has been cancelled. Refund initiated to original payment source.`,
          read: false,
          type: "warning",
          createdAt: new Date().toISOString(),
        });

        return { success: true, message: "Order cancelled successfully." };
      },

      // Parameters
      parameters: initialParameters as SkinParameter[],
      updateParameter: (id, updates) =>
        set((state) => ({
          parameters: state.parameters.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      // Scans
      scans: initialFullScans,
      scanRecords: initialFullScans,
      customers: initialCustomers,
      currentScan: initialFullScans[0] || null,
      setCurrentScan: (scan) => set({ currentScan: scan }),
      addScan: (scan) =>
        set((state) => ({
          scans: [scan, ...state.scans],
          currentScan: scan,
        })),
      deleteScan: (scanId) => {
        set((state) => {
          const filtered = state.scans.filter((s) => s.id !== scanId);
          return {
            scans: filtered,
            currentScan: state.currentScan?.id === scanId ? filtered[0] || null : state.currentScan,
          };
        });
        get().addAuditLog({
          userId: get().currentUser?.id || "cust-1",
          userName: get().currentUser?.name || "Customer",
          role: "Customer",
          action: "SCAN_DELETED",
          resource: "biometric_scan",
          details: `Biometric scan record ${scanId} purged on customer request.`,
          ipAddress: "127.0.0.1",
        });
      },
      clearAllScanData: () => {
        set({
          scans: [],
          currentScan: null,
        });
        get().addAuditLog({
          userId: get().currentUser?.id || "cust-1",
          userName: get().currentUser?.name || "Customer",
          role: "Customer",
          action: "ALL_SCANS_PURGED",
          resource: "biometric_database",
          details: "Zero-Knowledge Purge: Customer deleted all historical scan records and topology meshes.",
          ipAddress: "127.0.0.1",
        });
      },

      // Products Slice
      products: initialProducts as unknown as Product[],
      addProduct: (product) => {
        set((state) => ({
          products: [product, ...state.products],
        }));
        get().addAuditLog({
          userId: get().currentUser?.id || "seller-admin",
          userName: get().currentUser?.name || "Seller",
          role: get().currentRole,
          action: "PRODUCT_CREATED",
          resource: "catalogue",
          details: `Product "${product.name}" created with status "${product.status}".`,
          ipAddress: "127.0.0.1",
        });
      },
      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      },
      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
          inventory: state.inventory.filter((inv) => inv.productId !== id),
        }));
      },
      simulateApproveProduct: (id) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, status: "active" } : p)),
        }));
        const prod = get().products.find((p) => p.id === id);
        get().addNotification({
          id: `notif-${Date.now()}`,
          title: "Product Approved",
          message: `Product "${prod?.name || id}" has been approved by admin and is now live on the marketplace.`,
          read: false,
          type: "success",
          createdAt: new Date().toISOString(),
        });
        get().addAuditLog({
          userId: "admin-sim",
          userName: "Admin Simulator",
          role: "Super Admin",
          action: "PRODUCT_APPROVED",
          resource: "catalogue",
          details: `Simulated admin approval for product ${id}.`,
          ipAddress: "127.0.0.1",
        });
      },

      // Sellers & Multi-tenant Core
      sellers: initialSellers as Seller[],
      updateSeller: (id, updates) =>
        set((state) => ({
          sellers: state.sellers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),
      updateSellerStatus: (id, status) =>
        set((state) => ({
          sellers: state.sellers.map((s) => (s.id === id ? { ...s, status } : s)),
        })),
      toggleSellerPaused: (sellerId) => {
        let isPausedNow = false;
        set((state) => {
          const seller = state.sellers.find((s) => s.id === sellerId);
          isPausedNow = !seller?.isPaused;
          return {
            sellers: state.sellers.map((s) =>
              s.id === sellerId ? { ...s, isPaused: isPausedNow } : s
            ),
          };
        });
        get().addAuditLog({
          userId: get().currentUser?.id || "seller",
          userName: get().currentUser?.name || "Distributor Owner",
          role: get().currentRole,
          action: isPausedNow ? "STORE_PAUSED" : "STORE_RESUMED",
          resource: "store_status",
          details: `Store ${sellerId} status set to ${isPausedNow ? "PAUSED (offers hidden)" : "LIVE"}.`,
          ipAddress: "127.0.0.1",
        });
        return isPausedNow;
      },
      sellerSimulateKycStatus: (sellerId, status, reason) => {
        set((state) => ({
          sellers: state.sellers.map((s) =>
            s.id === sellerId
              ? {
                  ...s,
                  status,
                  rejectionReason: reason || s.rejectionReason,
                  kycReviewedAt: new Date().toISOString(),
                }
              : s
          ),
        }));
        get().addNotification({
          id: `notif-${Date.now()}`,
          title: `KYC Status: ${status.replace("_", " ").toUpperCase()}`,
          message:
            status === "approved"
              ? "Congratulations! Your seller account and KYC have been verified. Complete the onboarding wizard to go live."
              : status === "rejected"
              ? `Your KYC submission was rejected: ${reason || "Discrepancy in documents"}. Please update and resubmit.`
              : `Your seller profile is now under review by platform compliance.`,
          read: false,
          type: status === "approved" ? "success" : status === "rejected" ? "error" : "info",
          createdAt: new Date().toISOString(),
        });
        get().addAuditLog({
          userId: "admin-sim",
          userName: "Admin KYC Simulator",
          role: "Super Admin",
          action: "KYC_STATUS_UPDATED",
          resource: "seller_compliance",
          details: `KYC status for ${sellerId} changed to ${status}. ${reason ? `Reason: ${reason}` : ""}`,
          ipAddress: "127.0.0.1",
        });
      },
      sellerKycDraft: null,
      saveSellerKycDraft: (draft) => set({ sellerKycDraft: draft }),
      clearSellerKycDraft: () => set({ sellerKycDraft: null }),
      registerSellerAndLogin: (data) => {
        const sellerId = `seller-${Date.now().toString().slice(-4)}`;
        const newSeller: Seller = {
          id: sellerId,
          company: data.companyName,
          legalName: data.companyName,
          gstNumber: data.gstin,
          panNumber: data.pan,
          city: data.city,
          state: data.state,
          status: "pending",
          planId: "plan-starter",
          rating: 5.0,
          deliveryDays: 3,
          contactEmail: data.email,
          contactPhone: data.mobile,
          bankLast4: data.accountNumber?.slice(-4) || "9901",
          bankName: data.bankName || "HDFC Bank",
          kycSubmittedAt: new Date().toISOString(),
          onboardingCompleted: false,
          onboardingStep: 1,
        };
        const newUser: User = {
          id: `user-${sellerId}-owner`,
          name: data.ownerName,
          email: data.email,
          phone: data.mobile,
          role: "Distributor Owner",
          avatar: "",
          sellerId,
          city: data.city,
        };
        const defaultWh: SellerWarehouse = {
          id: `wh-${sellerId}-1`,
          sellerId,
          name: `${data.city} Dispatch Hub`,
          code: `${data.city.slice(0, 3).toUpperCase()}-01`,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          isPrimary: true,
          contactPerson: data.ownerName,
          contactPhone: data.mobile,
        };
        const ownerStaff: SellerStaff = {
          id: `staff-${sellerId}-1`,
          sellerId,
          name: data.ownerName,
          email: data.email,
          phone: data.mobile,
          role: "Distributor Owner",
          status: "active",
          lastActive: new Date().toISOString(),
          joinedAt: new Date().toISOString(),
        };

        set((state) => ({
          sellers: [newSeller, ...state.sellers],
          warehouses: [defaultWh, ...state.warehouses],
          sellerStaff: [ownerStaff, ...state.sellerStaff],
          currentUser: newUser,
          currentRole: "Distributor Owner",
          sellerKycDraft: null,
        }));

        get().addNotification({
          id: `notif-${Date.now()}`,
          title: "Registration Received",
          message: `Application ticket KYC-2026-${sellerId.slice(-4)} submitted for verification.`,
          read: false,
          type: "info",
          createdAt: new Date().toISOString(),
        });
        get().addAuditLog({
          userId: newUser.id,
          userName: newUser.name,
          role: "Distributor Owner",
          action: "SELLER_REGISTERED",
          resource: "seller_onboarding",
          details: `New seller ${data.companyName} registered with GSTIN ${data.gstin}. Status: pending.`,
          ipAddress: "127.0.0.1",
        });

        return { sellerId, user: newUser };
      },

      // Seller Inventory & Offers
      inventory: initialInventory as InventoryItem[],
      inventoryMovements: [],
      updateInventoryStock: (id, stock) =>
        set((state) => ({
          inventory: state.inventory.map((item) =>
            item.id === id ? { ...item, stock } : item
          ),
        })),
      updateInventoryPrice: (id, price) =>
        set((state) => ({
          inventory: state.inventory.map((item) =>
            item.id === id ? { ...item, price } : item
          ),
        })),
      addInventoryOffer: (offer) => {
        const newOffer: InventoryItem = {
          ...offer,
          id: `inv-${Date.now()}`,
          updatedAt: new Date().toISOString(),
          status: offer.status || "active",
        };
        set((state) => ({
          inventory: [newOffer, ...state.inventory],
        }));
        get().addAuditLog({
          userId: get().currentUser?.id || "seller",
          userName: get().currentUser?.name || "Seller",
          role: get().currentRole,
          action: "OFFER_CREATED",
          resource: "inventory",
          details: `Listed offer for SKU ${offer.sku} at â‚¹${offer.price} (Stock: ${offer.stock}).`,
          ipAddress: "127.0.0.1",
        });
        return newOffer;
      },
      updateInventoryOffer: (id, updates) => {
        set((state) => ({
          inventory: state.inventory.map((it) =>
            it.id === id ? { ...it, ...updates, updatedAt: new Date().toISOString() } : it
          ),
        }));
      },
      deleteInventoryOffer: (id) => {
        set((state) => ({
          inventory: state.inventory.filter((it) => it.id !== id),
        }));
      },
      stockIn: (offerId, quantity, batchNumber, expiryDate, supplierRef) => {
        const state = get();
        const target = state.inventory.find((i) => i.id === offerId);
        if (!target) return;
        const newStock = target.stock + quantity;
        const movement: InventoryMovement = {
          id: `mov-${Date.now()}`,
          productId: target.productId,
          sellerId: target.sellerId,
          type: "in",
          quantity,
          batchNumber,
          expiryDate,
          supplierRef,
          timestamp: new Date().toISOString(),
          reason: `Stock In: +${quantity} units ${batchNumber ? `(Batch: ${batchNumber})` : ""}`,
        };
        set({
          inventory: state.inventory.map((i) =>
            i.id === offerId
              ? {
                  ...i,
                  stock: newStock,
                  batchNumber: batchNumber || i.batchNumber,
                  expiryDate: expiryDate || i.expiryDate,
                  updatedAt: new Date().toISOString(),
                }
              : i
          ),
          inventoryMovements: [movement, ...state.inventoryMovements],
        });
      },
      stockOut: (offerId, quantity, reason) => {
        const state = get();
        const target = state.inventory.find((i) => i.id === offerId);
        if (!target) return;
        const newStock = Math.max(0, target.stock - quantity);
        const movement: InventoryMovement = {
          id: `mov-${Date.now()}`,
          productId: target.productId,
          sellerId: target.sellerId,
          type: "out",
          quantity,
          timestamp: new Date().toISOString(),
          reason: `Stock Out: -${quantity} (${reason})`,
        };
        set({
          inventory: state.inventory.map((i) =>
            i.id === offerId ? { ...i, stock: newStock, updatedAt: new Date().toISOString() } : i
          ),
          inventoryMovements: [movement, ...state.inventoryMovements],
        });
      },
      adjustStock: (offerId, newStock, reason) => {
        const state = get();
        const target = state.inventory.find((i) => i.id === offerId);
        if (!target) return;
        const delta = newStock - target.stock;
        const movement: InventoryMovement = {
          id: `mov-${Date.now()}`,
          productId: target.productId,
          sellerId: target.sellerId,
          type: "adjustment",
          quantity: Math.abs(delta),
          timestamp: new Date().toISOString(),
          reason: `Stock Adjustment: ${target.stock} -> ${newStock} (${reason})`,
        };
        set({
          inventory: state.inventory.map((i) =>
            i.id === offerId ? { ...i, stock: Math.max(0, newStock), updatedAt: new Date().toISOString() } : i
          ),
          inventoryMovements: [movement, ...state.inventoryMovements],
        });
      },
      markDamaged: (offerId, quantity, reason) => {
        const state = get();
        const target = state.inventory.find((i) => i.id === offerId);
        if (!target) return;
        const newStock = Math.max(0, target.stock - quantity);
        const movement: InventoryMovement = {
          id: `mov-${Date.now()}`,
          productId: target.productId,
          sellerId: target.sellerId,
          type: "damaged",
          quantity,
          timestamp: new Date().toISOString(),
          reason: `Marked Damaged: ${quantity} units (${reason || "Quality inspection fail"})`,
        };
        set({
          inventory: state.inventory.map((i) =>
            i.id === offerId ? { ...i, stock: newStock, updatedAt: new Date().toISOString() } : i
          ),
          inventoryMovements: [movement, ...state.inventoryMovements],
        });
      },
      transferStock: (offerId, fromWarehouseId, toWarehouseId, quantity) => {
        const state = get();
        const target = state.inventory.find((i) => i.id === offerId);
        if (!target) return;
        const movement: InventoryMovement = {
          id: `mov-${Date.now()}`,
          productId: target.productId,
          sellerId: target.sellerId,
          type: "transfer",
          quantity,
          fromWarehouseId,
          toWarehouseId,
          timestamp: new Date().toISOString(),
          reason: `Inter-warehouse transfer of ${quantity} units.`,
        };
        set({
          inventoryMovements: [movement, ...state.inventoryMovements],
        });
      },
      bulkUpdateInventory: (updates) => {
        set((state) => ({
          inventory: state.inventory.map((item) => {
            const up = updates.find((u) => u.id === item.id);
            if (!up) return item;
            return {
              ...item,
              price: up.price !== undefined ? up.price : item.price,
              stock: up.stock !== undefined ? up.stock : item.stock,
              status: up.status !== undefined ? up.status : item.status,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      // Seller Order Fulfillment Workflow
      acceptShipment: (orderId, shipmentId) => {
        const now = new Date().toISOString();
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) return order;
            const updatedShipments = order.shipments?.map((s) => {
              if (s.id !== shipmentId) return s;
              return {
                ...s,
                status: "confirmed" as const,
                timeline: [
                  ...(s.timeline || []),
                  {
                    status: "confirmed",
                    label: "Accepted by Distributor",
                    timestamp: now,
                    note: "Distributor accepted fulfillment request; order entered packing queue.",
                  },
                ],
              };
            });
            return {
              ...order,
              status: "confirmed" as const,
              shipments: updatedShipments,
            };
          }),
        }));
        const order = get().orders.find((o) => o.id === orderId);
        get().addNotification({
          id: `notif-${Date.now()}`,
          title: "Shipment Accepted",
          message: `Order #${order?.orderNumber || orderId} has been accepted by the distributor.`,
          read: false,
          type: "success",
          createdAt: now,
        });
        get().addAuditLog({
          userId: get().currentUser?.id || "seller",
          userName: get().currentUser?.name || "Order Manager",
          role: get().currentRole,
          action: "SHIPMENT_ACCEPTED",
          resource: "orders",
          details: `Accepted shipment ${shipmentId} for order ${order?.orderNumber || orderId}.`,
          ipAddress: "127.0.0.1",
        });
      },

      rejectShipment: (orderId, shipmentId, reason) => {
        const now = new Date().toISOString();
        const state = get();
        const order = state.orders.find((o) => o.id === orderId);
        const shipment = order?.shipments?.find((s) => s.id === shipmentId);

        // Release reserved stock for items in this shipment
        if (shipment && shipment.items) {
          get().releaseStock(
            shipment.items.map((it) => ({
              productId: it.productId,
              sellerId: shipment.sellerId,
              quantity: it.quantity,
            })),
            orderId,
            `Distributor rejected shipment: ${reason}`
          );
        }

        set((s) => ({
          orders: s.orders.map((o) => {
            if (o.id !== orderId) return o;
            const updatedShipments = o.shipments?.map((sh) => {
              if (sh.id !== shipmentId) return sh;
              return {
                ...sh,
                status: "cancelled" as const,
                timeline: [
                  ...(sh.timeline || []),
                  {
                    status: "cancelled",
                    label: "Rejected by Distributor",
                    timestamp: now,
                    note: `Distributor rejected fulfillment: ${reason}`,
                  },
                ],
              };
            });
            return {
              ...o,
              status: "cancelled" as const,
              shipments: updatedShipments,
            };
          }),
        }));

        get().addNotification({
          id: `notif-${Date.now()}`,
          title: "Shipment Cancelled",
          message: `Shipment for order #${order?.orderNumber || orderId} was cancelled by seller: ${reason}. Refund simulated.`,
          read: false,
          type: "warning",
          createdAt: now,
        });
        get().addAuditLog({
          userId: get().currentUser?.id || "seller",
          userName: get().currentUser?.name || "Order Manager",
          role: get().currentRole,
          action: "SHIPMENT_REJECTED",
          resource: "orders",
          details: `Rejected shipment ${shipmentId} for order ${order?.orderNumber || orderId}: ${reason}.`,
          ipAddress: "127.0.0.1",
        });
      },

      packShipment: (orderId, shipmentId, checklistNotes) => {
        const now = new Date().toISOString();
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) return order;
            const updatedShipments = order.shipments?.map((s) => {
              if (s.id !== shipmentId) return s;
              return {
                ...s,
                status: "packed" as const,
                timeline: [
                  ...(s.timeline || []),
                  {
                    status: "packed",
                    label: "Cold-Shield Luxury Packaging Complete",
                    timestamp: now,
                    note: checklistNotes || "Batch verified & packed in temperature-controlled security box.",
                  },
                ],
              };
            });
            return {
              ...order,
              status: "packed" as const,
              shipments: updatedShipments,
            };
          }),
        }));
        const order = get().orders.find((o) => o.id === orderId);
        get().addAuditLog({
          userId: get().currentUser?.id || "seller",
          userName: get().currentUser?.name || "Order Manager",
          role: get().currentRole,
          action: "SHIPMENT_PACKED",
          resource: "orders",
          details: `Packed shipment ${shipmentId} for order ${order?.orderNumber || orderId}.`,
          ipAddress: "127.0.0.1",
        });
      },

      shipShipment: (orderId, shipmentId, courierName, trackingNumber, estDeliveryDays = 3) => {
        const now = new Date().toISOString();
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) return order;
            const updatedShipments = order.shipments?.map((s) => {
              if (s.id !== shipmentId) return s;
              return {
                ...s,
                status: "shipped" as const,
                courierName,
                trackingNumber,
                timeline: [
                  ...(s.timeline || []),
                  {
                    status: "shipped",
                    label: `Dispatched via ${courierName}`,
                    timestamp: now,
                    note: `Tracking AWB: ${trackingNumber}. Estimated transit: ${estDeliveryDays} business days.`,
                  },
                ],
              };
            });
            return {
              ...order,
              status: "shipped" as const,
              shipments: updatedShipments,
            };
          }),
        }));
        const order = get().orders.find((o) => o.id === orderId);
        get().addNotification({
          id: `notif-${Date.now()}`,
          title: "Shipment Dispatched",
          message: `Order #${order?.orderNumber || orderId} is on the way via ${courierName} (AWB: ${trackingNumber}).`,
          read: false,
          type: "info",
          createdAt: now,
        });
        get().addAuditLog({
          userId: get().currentUser?.id || "seller",
          userName: get().currentUser?.name || "Order Manager",
          role: get().currentRole,
          action: "SHIPMENT_SHIPPED",
          resource: "orders",
          details: `Dispatched shipment ${shipmentId} via ${courierName} (${trackingNumber}).`,
          ipAddress: "127.0.0.1",
        });
      },

      deliverShipment: (orderId, shipmentId, codCollected) => {
        const now = new Date().toISOString();
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) return order;
            const updatedShipments = order.shipments?.map((s) => {
              if (s.id !== shipmentId) return s;
              return {
                ...s,
                status: "delivered" as const,
                timeline: [
                  ...(s.timeline || []),
                  {
                    status: "delivered",
                    label: "Delivered & Handed Over",
                    timestamp: now,
                    note: codCollected ? "Delivered. Cash on Delivery collected in full." : "Delivered safely to recipient.",
                  },
                ],
              };
            });
            return {
              ...order,
              status: "delivered" as const,
              paymentStatus: codCollected ? "paid" : order.paymentStatus,
              shipments: updatedShipments,
            };
          }),
        }));
        const order = get().orders.find((o) => o.id === orderId);
        get().addNotification({
          id: `notif-${Date.now()}`,
          title: "Package Delivered",
          message: `Order #${order?.orderNumber || orderId} has been successfully delivered.`,
          read: false,
          type: "success",
          createdAt: now,
        });
        get().addAuditLog({
          userId: get().currentUser?.id || "seller",
          userName: get().currentUser?.name || "Order Manager",
          role: get().currentRole,
          action: "SHIPMENT_DELIVERED",
          resource: "orders",
          details: `Marked shipment ${shipmentId} delivered for order ${order?.orderNumber || orderId}. COD Collected: ${!!codCollected}.`,
          ipAddress: "127.0.0.1",
        });
      },

      decideReturn: (orderId, returnId, decision, reason, restock) => {
        const now = new Date().toISOString();
        const state = get();
        const order = state.orders.find((o) => o.id === orderId);
        const ret = state.returns.find((r) => r.id === returnId) || order?.shipments?.flatMap((s) => s.returnRequest).find((r) => r?.id === returnId);

        if (decision === "approved" && restock && ret) {
          // Find offer and restock
          const offer = state.inventory.find((inv) => inv.productId === ret.productId);
          if (offer) {
            get().stockIn(offer.id, 1, undefined, undefined, `Return Restock ${returnId}`);
          }
        }

        set((s) => ({
          returns: s.returns.map((r) =>
            r.id === returnId
              ? {
                  ...r,
                  status: decision,
                  timeline: [
                    ...(r.timeline || []),
                    {
                      status: decision,
                      timestamp: now,
                      note: decision === "approved" ? "Return approved by seller; refund simulated." : `Return rejected: ${reason}`,
                    },
                  ],
                }
              : r
          ),
          orders: s.orders.map((o) => {
            if (o.id !== orderId) return o;
            return {
              ...o,
              shipments: o.shipments?.map((sh) => {
                if (sh.returnRequest?.id !== returnId) return sh;
                return {
                  ...sh,
                  status: decision === "approved" ? "returned" : sh.status,
                  returnRequest: {
                    ...sh.returnRequest,
                    status: decision,
                  },
                };
              }),
            };
          }),
        }));

        get().addNotification({
          id: `notif-${Date.now()}`,
          title: `Return ${decision === "approved" ? "Approved" : "Declined"}`,
          message:
            decision === "approved"
              ? `Your return request for "${ret?.productName || "item"}" was approved. Refund of â‚¹${ret?.refundAmount || 0} initiated.`
              : `Your return request for "${ret?.productName || "item"}" could not be approved: ${reason || "Policy exception"}.`,
          read: false,
          type: decision === "approved" ? "success" : "error",
          createdAt: now,
        });
        get().addAuditLog({
          userId: get().currentUser?.id || "seller",
          userName: get().currentUser?.name || "Order Manager",
          role: get().currentRole,
          action: `RETURN_${decision.toUpperCase()}`,
          resource: "returns",
          details: `Return ${returnId} for order ${order?.orderNumber || orderId} was ${decision}. ${reason ? `Reason: ${reason}` : ""}`,
          ipAddress: "127.0.0.1",
        });
      },

      // Warehouses
      warehouses: initialWarehouses as SellerWarehouse[],
      addWarehouse: (wh) => {
        const newWh: SellerWarehouse = {
          ...wh,
          id: `wh-${Date.now()}`,
        };
        set((state) => ({
          warehouses: [...state.warehouses, newWh],
        }));
        return newWh;
      },
      updateWarehouse: (id, updates) => {
        set((state) => ({
          warehouses: state.warehouses.map((w) => (w.id === id ? { ...w, ...updates } : w)),
        }));
      },
      deleteWarehouse: (id) => {
        const state = get();
        const target = state.warehouses.find((w) => w.id === id);
        if (target?.isPrimary) {
          return { success: false, message: "Cannot delete the primary warehouse." };
        }
        set({
          warehouses: state.warehouses.filter((w) => w.id !== id),
        });
        return { success: true, message: "Warehouse removed." };
      },

      // Staff & RBAC
      sellerStaff: initialSellerStaff as SellerStaff[],
      inviteSellerStaff: (staff) => {
        const state = get();
        // Check plan limits
        const seller = state.sellers.find((s) => s.id === staff.sellerId);
        const plan = require("@/data/plans.json").find((p: any) => p.id === (seller?.planId || "plan-starter"));
        const currentStaffCount = state.sellerStaff.filter((s) => s.sellerId === staff.sellerId).length;
        if (plan?.limits?.maxStaff && currentStaffCount >= plan.limits.maxStaff) {
          return {
            success: false,
            message: `Staff limit (${plan.limits.maxStaff}) reached on ${plan.name}. Please upgrade to Business or Enterprise.`,
          };
        }
        const newStaff: SellerStaff = {
          ...staff,
          id: `staff-${Date.now()}`,
          joinedAt: new Date().toISOString(),
          lastActive: "Never",
        };
        set({
          sellerStaff: [...state.sellerStaff, newStaff],
        });
        get().addNotification({
          id: `notif-${Date.now()}`,
          title: "Staff Member Invited",
          message: `Invitation sent to ${staff.name} (${staff.email}) as ${staff.role}.`,
          read: false,
          type: "info",
          createdAt: new Date().toISOString(),
        });
        return { success: true, message: `Invitation sent to ${staff.email}.` };
      },
      updateSellerStaff: (id, updates) => {
        set((state) => ({
          sellerStaff: state.sellerStaff.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }));
      },
      deleteSellerStaff: (id) => {
        set((state) => ({
          sellerStaff: state.sellerStaff.filter((s) => s.id !== id),
        }));
        return { success: true, message: "Staff member deleted." };
      },
      sellerPermissions: DEFAULT_PERMISSION_MATRIX,
      updateSellerPermission: (role, resource, actions) => {
        set((state) => ({
          sellerPermissions: {
            ...state.sellerPermissions,
            [role]: {
              ...state.sellerPermissions[role],
              [resource]: actions,
            },
          },
        }));
        get().addAuditLog({
          userId: get().currentUser?.id || "seller",
          userName: get().currentUser?.name || "Distributor Owner",
          role: "Distributor Owner",
          action: "PERMISSIONS_UPDATED",
          resource: "rbac",
          details: `Updated permissions for ${role} on resource "${resource}": [${actions.join(", ")}].`,
          ipAddress: "127.0.0.1",
        });
      },
      resetSellerPermissions: () => {
        set({ sellerPermissions: DEFAULT_PERMISSION_MATRIX });
      },

      // Payouts & Settlements
      settlements: initialSettlements as Settlement[],
      payoutRequests: [],
      createPayoutRequest: (sellerId, amount, bankLast4, bankName) => {
        if (amount < 50000) {
          return { success: false, message: "Minimum payout request is â‚¹500 (50,000 paise)." };
        }
        const req: PayoutRequest = {
          id: `pyr-${Date.now()}`,
          sellerId,
          amount,
          requestedAt: new Date().toISOString(),
          status: "requested",
          bankAccountLast4: bankLast4,
          bankName,
        };
        set((state) => ({
          payoutRequests: [req, ...state.payoutRequests],
        }));
        get().addNotification({
          id: `notif-${Date.now()}`,
          title: "Payout Requested",
          message: `Payout request for â‚¹${Math.round(amount / 100).toLocaleString("en-IN")} submitted to account ending in ${bankLast4}.`,
          read: false,
          type: "info",
          createdAt: new Date().toISOString(),
        });
        get().addAuditLog({
          userId: get().currentUser?.id || "seller",
          userName: get().currentUser?.name || "Accountant",
          role: get().currentRole,
          action: "PAYOUT_REQUESTED",
          resource: "payouts",
          details: `Payout of â‚¹${Math.round(amount / 100)} requested for seller ${sellerId}.`,
          ipAddress: "127.0.0.1",
        });
        return { success: true, message: "Payout requested successfully.", request: req };
      },
      advancePayoutRequest: (id, status) => {
        set((state) => ({
          payoutRequests: state.payoutRequests.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status,
                  processedAt: status === "paid" ? new Date().toISOString() : p.processedAt,
                  referenceNumber: status === "paid" ? `UTR${Date.now()}` : p.referenceNumber,
                }
              : p
          ),
        }));
      },

      // Couriers
      couriers: initialCouriers as Courier[],

      reserveStock: (items, orderId) => {
        const state = get();
        // Check availability first
        for (const it of items) {
          const inv = state.inventory.find(
            (i) => i.productId === it.productId && i.sellerId === it.sellerId
          );
          if (!inv || inv.stock - (inv.reserved || 0) < it.quantity) {
            const prod = (initialProducts as unknown as Product[]).find((p) => p.id === it.productId);
            return {
              success: false,
              unavailableItem: prod ? prod.name : it.productId,
            };
          }
        }

        // Apply reservations
        const movements: InventoryMovement[] = [];
        const updatedInventory = state.inventory.map((inv) => {
          const itemMatch = items.find(
            (it) => it.productId === inv.productId && it.sellerId === inv.sellerId
          );
          if (!itemMatch) return inv;

          movements.push({
            id: `mov-${Date.now()}-${inv.id}`,
            productId: inv.productId,
            sellerId: inv.sellerId,
            type: "reserve",
            quantity: itemMatch.quantity,
            orderId,
            timestamp: new Date().toISOString(),
            reason: `Reserved for checkout ${orderId || ""}`,
          });

          return {
            ...inv,
            reserved: (inv.reserved || 0) + itemMatch.quantity,
          };
        });

        set({
          inventory: updatedInventory,
          inventoryMovements: [...movements, ...state.inventoryMovements],
        });

        return { success: true };
      },

      deductStock: (items, orderId) => {
        const state = get();
        const movements: InventoryMovement[] = [];

        const updatedInventory = state.inventory.map((inv) => {
          const match = items.find(
            (it) => it.productId === inv.productId && it.sellerId === inv.sellerId
          );
          if (!match) return inv;

          movements.push({
            id: `mov-${Date.now()}-${inv.id}`,
            productId: inv.productId,
            sellerId: inv.sellerId,
            type: "deduct",
            quantity: match.quantity,
            orderId,
            timestamp: new Date().toISOString(),
            reason: `Fulfilled order ${orderId}`,
          });

          return {
            ...inv,
            stock: Math.max(0, inv.stock - match.quantity),
            reserved: Math.max(0, (inv.reserved || 0) - match.quantity),
          };
        });

        set({
          inventory: updatedInventory,
          inventoryMovements: [...movements, ...state.inventoryMovements],
        });
      },

      releaseStock: (items, orderId, reason = "Checkout released / expired") => {
        const state = get();
        const movements: InventoryMovement[] = [];

        const updatedInventory = state.inventory.map((inv) => {
          const match = items.find(
            (it) => it.productId === inv.productId && it.sellerId === inv.sellerId
          );
          if (!match) return inv;

          movements.push({
            id: `mov-${Date.now()}-${inv.id}`,
            productId: inv.productId,
            sellerId: inv.sellerId,
            type: "release",
            quantity: match.quantity,
            orderId,
            timestamp: new Date().toISOString(),
            reason,
          });

          return {
            ...inv,
            reserved: Math.max(0, (inv.reserved || 0) - match.quantity),
          };
        });

        set({
          inventory: updatedInventory,
          inventoryMovements: [...movements, ...state.inventoryMovements],
        });
      },

      // Appointments
      appointments: initialAppointments as Appointment[],
      bookAppointment: (appointment) =>
        set((state) => ({
          appointments: [appointment, ...state.appointments],
        })),
      cancelAppointment: (id) =>
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, status: "cancelled" } : a
          ),
        })),
      rescheduleAppointment: (id, date, time) =>
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, date, time, status: "upcoming" } : a
          ),
        })),

      // Notifications
      notifications: initialNotifications as Notification[],
      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
        })),

      // Audit Logs
      auditLogs: initialAuditLog as AuditLogEntry[],
      addAuditLog: (log) =>
        set((state) => ({
          auditLogs: [
            {
              ...log,
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
            },
            ...state.auditLogs,
          ],
        })),
      logAuditEvent: (log: any) =>
        set((state) => ({
          auditLogs: [
            {
              id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              timestamp: new Date().toISOString(),
              action: log.action || "ACTION",
              actorId: log.actorId || log.userId || "system",
              actorName: log.actorName || log.userName || "System",
              actorRole: log.actorRole || "system",
              resource: log.resource || log.entityType || "general",
              details: typeof log.details === "string" ? log.details : JSON.stringify(log.details || log.metadata || {}),
              ip: log.ip || "127.0.0.1",
              status: log.status || "success",
            },
            ...state.auditLogs,
          ],
        })),

      // Wishlist
      wishlist: ["prod-1", "prod-3"],
      toggleWishlist: (productId) => {
        const current = get().wishlist;
        const exists = current.includes(productId);
        if (exists) {
          set({ wishlist: current.filter((id) => id !== productId) });
          return { added: false };
        } else {
          set({ wishlist: [...current, productId] });
          return { added: true };
        }
      },
      isInWishlist: (productId) => get().wishlist.includes(productId),
      addToWishlist: (productId) => {
        const current = get().wishlist;
        if (!current.includes(productId)) {
          set({ wishlist: [...current, productId] });
        }
      },
      removeFromWishlist: (productId) => {
        set({ wishlist: get().wishlist.filter((id) => id !== productId) });
      },

      // Inquiries
      inquiries: [],
      addInquiry: (inquiry) =>
        set((state) => ({
          inquiries: [
            {
              ...inquiry,
              id: `inq-${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
            ...state.inquiries,
          ],
        })),

      // Newsletter
      newsletterEmails: [],
      subscribeNewsletter: (email) => {
        const current = get().newsletterEmails;
        if (current.includes(email.toLowerCase())) {
          return { success: false, message: "This email is already subscribed to our journal." };
        }
        set({ newsletterEmails: [...current, email.toLowerCase()] });
        return { success: true, message: "Welcome to the Royal Circle! Your beauty guide is on its way." };
      },

      // Cookie Consent
      cookieConsent: null,
      setCookieConsent: (consent) =>
        set({
          cookieConsent: {
            ...consent,
            timestamp: new Date().toISOString(),
          },
        }),

      // ==========================================
      // PHASE 6 & 7: MODULAR STORE SLICES
      // ==========================================
      ...createParametersSlice(set, get, api),
      ...createRulesSlice(set, get, api),
      ...createSellersSlice(set, get, api),
      ...createCommerceSlice(set, get, api),
      ...createContentSlice(set, get, api),
      ...createSupportSlice(set, get, api),
      ...createSecuritySlice(set, get, api),
      ...createAdminSlice(set, get, api),
      ...createConsultantSlice(set, get, api),
      ...createPlanSlice(set, get, api),
      ...createChatSlice(set, get, api),
      ...createActivitySlice(set, get, api),
      // Reset Everything
      resetDemoData: () => {
        set({
          currentUser: (initialUsers[0] as User) || null,
          currentRole: "Super Admin",
          users: (initialUsers as User[]).map((u) => ({
            ...u,
            status: (u.status || "active") as "active" | "suspended",
            signupDate: u.signupDate || "2026-01-10",
          })),
          customerProfile: initialCustomerProfile,
          otpState: null,
          cart: [],
          cartDrawerOpen: false,
          appliedCoupon: null,
          orders: (initialOrders as Order[]).map((o) => normalizeOrder(o, initialSellers as Seller[])),
          parameters: initialParameters as SkinParameter[],
          parameterDraft: null,
          parameterVersions: initialParameterVersions as ParameterVersion[],
          rules: initialRules as RecommendationRule[],
          recommendationRules: initialRules as RecommendationRule[],
          modelVersions: initialModelVersions as ModelVersion[],
          activeModelVersionId: "model-sim-1.0",
          platformSettings: initialPlatformSettings as PlatformSettings,
          products: initialProducts as unknown as Product[],
          categories: initialCategories as Category[],
          brands: initialBrands as Brand[],
          ingredients: initialIngredients as Ingredient[],
          scans: initialFullScans,
          currentScan: initialFullScans[0] || null,
          sellers: initialSellers as Seller[],
          inventory: initialInventory as InventoryItem[],
          inventoryMovements: [],
          appointments: initialAppointments as Appointment[],
          notifications: initialNotifications as Notification[],
          auditLogs: initialAuditLog as AuditLogEntry[],
          wishlist: ["prod-1", "prod-3"],
          addresses: initialAddresses as Address[],
          reviews: initialReviews as Review[],
          returns: [],
          pincode: "400026",
          inquiries: [],
          newsletterEmails: [],
          cookieConsent: null,
          warehouses: initialWarehouses as SellerWarehouse[],
          sellerStaff: initialSellerStaff as SellerStaff[],
          settlements: initialSettlements as Settlement[],
          payoutRequests: [],
          sellerPermissions: DEFAULT_PERMISSION_MATRIX,
          adminPermissions: DEFAULT_ADMIN_PERMISSION_MATRIX,
          sellerKycDraft: null,
          paymentTransactions: initialPaymentTransactions as PaymentTransaction[],
          tickets: initialTickets as Ticket[],
          banners: initialBanners as Banner[],
          campaigns: initialCampaigns as Campaign[],
          privacyRequests: initialPrivacyRequests as PrivacyRequest[],
          loginAttempts: initialLoginAttempts as LoginAttempt[],
          adminNotes: [],
          blogArticles: initialBlogArticles as unknown as CmsArticle[],
          faqs: initialFaqs as CmsFaq[],
          services: initialServices as unknown as CmsService[],
          // Phase 7 Resets
          consultants: (initialConsultants as any[]).map((c) => ({
            ...c,
            status: c.status || "active",
            modeAvailability: c.modeAvailability || ["video", "in-clinic"],
          })) as ConsultantProfile[],
          availabilityRules: initialAvailability as AvailabilityRule[],
          timeOffs: [],
          clientNotes: initialClientNotes as ClientNote[],
          scanShareConsents: initialScanShareConsents as ScanShareConsent[],
          consultantReviews: initialConsultantReviews as ConsultantReview[],
          sessions: initialSessions as SessionRecord[],
          clientPlans: initialClientPlans as Plan[],
          planTemplates: initialPlanTemplates as PlanTemplate[],
          planVersions: [],
          planProgress: {
            "cplan-1": {
              planId: "cplan-1",
              customerId: "cust-1",
              completedChecklist: { "step-cp1-1": true, "step-cp1-2": true },
              adherencePercent: 75,
              lastCheckedDate: new Date().toISOString(),
            },
          },
          chatThreads: initialChatThreads as ChatThread[],
          chatMessages: initialChatMessages as ChatMessage[],
          activityEvents: initialActivityEvents as ActivityEvent[],
        });
      },
    }),
    {
      name: "celebs-alley-store-v7",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        currentRole: state.currentRole,
        users: state.users,
        customerProfile: state.customerProfile,
        cart: state.cart,
        appliedCoupon: state.appliedCoupon,
        orders: state.orders,
        parameters: state.parameters,
        parameterDraft: state.parameterDraft,
        parameterVersions: state.parameterVersions,
        rules: state.rules,
        recommendationRules: state.recommendationRules,
        modelVersions: state.modelVersions,
        activeModelVersionId: state.activeModelVersionId,
        platformSettings: state.platformSettings,
        products: state.products,
        categories: state.categories,
        brands: state.brands,
        ingredients: state.ingredients,
        scans: state.scans,
        currentScan: state.currentScan,
        sellers: state.sellers,
        inventory: state.inventory,
        inventoryMovements: state.inventoryMovements,
        appointments: state.appointments,
        notifications: state.notifications,
        auditLogs: state.auditLogs,
        wishlist: state.wishlist,
        addresses: state.addresses,
        reviews: state.reviews,
        returns: state.returns,
        pincode: state.pincode,
        inquiries: state.inquiries,
        newsletterEmails: state.newsletterEmails,
        cookieConsent: state.cookieConsent,
        warehouses: state.warehouses,
        sellerStaff: state.sellerStaff,
        settlements: state.settlements,
        payoutRequests: state.payoutRequests,
        sellerPermissions: state.sellerPermissions,
        adminPermissions: state.adminPermissions,
        sellerKycDraft: state.sellerKycDraft,
        paymentTransactions: state.paymentTransactions,
        tickets: state.tickets,
        banners: state.banners,
        campaigns: state.campaigns,
        privacyRequests: state.privacyRequests,
        loginAttempts: state.loginAttempts,
        adminNotes: state.adminNotes,
        blogArticles: state.blogArticles,
        faqs: state.faqs,
        services: state.services,
        // Phase 7 Persisted Keys
        consultants: state.consultants,
        availabilityRules: state.availabilityRules,
        timeOffs: state.timeOffs,
        clientNotes: state.clientNotes,
        scanShareConsents: state.scanShareConsents,
        consultantReviews: state.consultantReviews,
        sessions: state.sessions,
        clientPlans: state.clientPlans,
        planTemplates: state.planTemplates,
        planVersions: state.planVersions,
        planProgress: state.planProgress,
        chatThreads: state.chatThreads,
        chatMessages: state.chatMessages,
        activityEvents: state.activityEvents,
      }),
    }
  )
);

// Cross-Tab Live Synchronization Layer
if (typeof window !== "undefined") {
  let syncDebounceTimer: any = null;

  const triggerLiveRehydrate = () => {
    if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
    syncDebounceTimer = setTimeout(() => {
      try {
        useAppStore.persist.rehydrate();
      } catch (err) {
        console.error("Cross-tab store rehydrate error:", err);
      }
    }, 150);
  };

  // 1. Storage event listener (fires when localStorage is updated by another tab)
  window.addEventListener("storage", (event) => {
    if (event.key === "celebs-alley-store-v7" && event.newValue) {
      triggerLiveRehydrate();
    }
  });

  // 2. BroadcastChannel for instant messaging events across tabs
  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel("celebs_alley_sync");
    channel.onmessage = () => {
      triggerLiveRehydrate();
    };
  }
}

