export type Role =
  | "Super Admin"
  | "Admin"
  | "Product Manager"
  | "AI/Rule Manager"
  | "Distributor Owner"
  | "Distributor Manager"
  | "Inventory Manager"
  | "Order Manager"
  | "Sales Executive"
  | "Accountant"
  | "Consultant"
  | "Customer"
  | "Support Agent"
  | "Finance Manager";

export type SellerRole =
  | "Distributor Owner"
  | "Distributor Manager"
  | "Inventory Manager"
  | "Order Manager"
  | "Sales Executive"
  | "Accountant";

export type SellerResource =
  | "dashboard"
  | "products"
  | "inventory"
  | "orders"
  | "returns"
  | "customers"
  | "analytics_revenue"
  | "staff"
  | "subscription"
  | "payouts"
  | "settings";

export type SellerAction = "view" | "create" | "edit" | "delete" | "approve";

export type PermissionMatrix = Record<
  SellerRole,
  Partial<Record<SellerResource, SellerAction[]>>
>;

export type AdminResource =
  | "dashboard"
  | "users"
  | "distributors"
  | "parameters"
  | "rules"
  | "versions"
  | "products"
  | "categories"
  | "brands"
  | "ingredients"
  | "orders"
  | "payments"
  | "refunds"
  | "coupons"
  | "commissions"
  | "marketing"
  | "cms"
  | "support"
  | "finance"
  | "security"
  | "audit"
  | "roles";

export type AdminAction = "view" | "create" | "edit" | "delete" | "approve" | "export";

export type AdminRole =
  | "Super Admin"
  | "Admin"
  | "Product Manager"
  | "AI/Rule Manager"
  | "Support Agent"
  | "Finance Manager";

export type AdminPermissionMatrix = Record<
  AdminRole,
  Partial<Record<AdminResource, AdminAction[]>>
>;

export interface SellerStaff {
  id: string;
  sellerId: string;
  name: string;
  email: string;
  phone: string;
  role: SellerRole;
  status: "active" | "invited" | "disabled";
  lastActive: string;
  avatar?: string;
  joinedAt: string;
}

export interface SellerWarehouse {
  id: string;
  sellerId: string;
  name: string;
  code?: string;
  address?: string;
  addressLine1?: string;
  city: string;
  state: string;
  pincode: string;
  isPrimary: boolean;
  contactPerson?: string;
  contactPhone?: string;
}

export interface Settlement {
  id: string;
  sellerId: string;
  cycleStart: string;
  cycleEnd: string;
  orderIds: string[];
  grossAmount: number; // in paise
  commissionAmount: number; // in paise
  gatewayFee: number; // in paise
  tcsTdsAmount: number; // in paise
  netPayout: number; // in paise
  status: "pending" | "processing" | "paid";
  paidAt?: string;
  utrNumber?: string;
}

export interface PayoutRequest {
  id: string;
  sellerId: string;
  amount: number; // in paise
  amountPaise?: number;
  requestedAt: string;
  createdAt?: string;
  status: "requested" | "processing" | "paid" | "rejected";
  bankAccountLast4: string;
  bankLast4?: string;
  bankName: string;
  processedAt?: string;
  paidAt?: string;
  referenceNumber?: string;
  utrNumber?: string;
  rejectionReason?: string;
}

export interface SalesHistoryPoint {
  date: string;
  sellerId: string;
  revenue: number; // in rupees
  ordersCount: number;
  unitsSold: number;
}

export interface Courier {
  id: string;
  name: string;
  code: string;
  trackingPrefix: string;
  avgDeliveryDays: number;
  status: "active" | "inactive";
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatar: string;
  sellerId?: string;
  consultantId?: string;
  city?: string;
  status?: "active" | "suspended";
  signupDate?: string;
  lastLogin?: string;
}

export interface SkinParameter {
  id: string;
  slug: string;
  name: string;
  description: string;
  unit: string;
  minScore: number;
  maxScore: number;
  weight: number;
  status: "active" | "inactive";
  aiKey: string;
  displayOrder: number;
  icon: string;
  category?: string;
  interpretation: {
    low: string;
    medium: string;
    high: string;
  };
}

export interface Brand {
  id: string;
  name: string;
  slug?: string;
  logo: string;
  origin: string;
  description: string;
  status: "active" | "inactive" | "archived";
  productCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  icon?: string;
  productCount?: number;
  status?: "active" | "archived" | "inactive";
}

export interface Ingredient {
  id: string;
  name: string;
  inciName: string;
  benefits?: string[];
  benefitText?: string;
  linkedParameters?: string[];
  cautionFlags?: string[];
  contraindications: string[];
  concernTags?: string[];
  safetyRating?: number;
  status?: "active" | "archived";
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  brandId: string;
  categoryId: string;
  description: string;
  images: string[];
  mrp: number;
  ingredients: string[];
  targetParameters: Record<string, number>; // -1 to 3
  suitableSkinTypes: string[];
  concernTags: string[];
  contraindications: string[];
  usage: string;
  rating: number;
  reviewCount: number;
  status: "active" | "draft" | "archived" | "pending_approval" | "rejected";
  taxRate?: number;
  hsn?: string;
  sponsored?: boolean;
  sponsorName?: string;
  category?: string;
  routineStep?: "Cleanser" | "Serum" | "Moisturizer" | "Sunscreen" | "Treatment";
  isApproved?: boolean;
}

export interface Seller {
  id: string;
  company: string;
  legalName: string;
  gstNumber: string;
  panNumber: string;
  city: string;
  state: string;
  status: "approved" | "pending" | "under_review" | "rejected" | "suspended";
  statusReason?: string;
  planId: string;
  plan?: string;
  kycStatus?: "approved" | "pending" | "under_review" | "rejected" | "more_info_needed";
  storeStatus?: "active" | "paused" | "suspended";
  kycRejectionReason?: string;
  rating: number;
  deliveryDays: number;
  contactEmail: string;
  contactPhone: string;
  rejectionReason?: string;
  kycSubmittedAt?: string;
  kycReviewedAt?: string;
  isPaused?: boolean;
  storeSlug?: string;
  storeDescription?: string;
  storeBannerColor?: string;
  storeLogo?: string;
  bankLast4?: string;
  bankName?: string;
  handlingTimeDays?: number;
  serviceablePincodes?: string[];
  freeShippingThreshold?: number;
  shippingFee?: number;
  returnWindowDays?: number;
  returnPolicyText?: string;
  onboardingCompleted?: boolean;
  onboardingStep?: number;
  gstin?: string;
  pan?: string;
  slug?: string;
  description?: string;
  email?: string;
  phone?: string;
  handlingTimeHours?: number;
  bankDetails?: {
    bankName?: string;
    accountNumberLast4?: string;
    ifsc?: string;
  };
}

export interface InventoryItem {
  id: string;
  productId: string;
  sellerId: string;
  price: number;
  mrp: number;
  stock: number;
  reserved: number;
  lowStockThreshold: number;
  sku: string;
  updatedAt: string;
  status?: "active" | "inactive" | "Healthy" | "Low" | "Out";
  warehouseId?: string;
  batchNumber?: string;
  expiryDate?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  skinType: string;
  concerns: string[];
  registeredAt: string;
  totalOrders: number;
  totalSpent: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  price?: number;
  total: number;
  taxRate?: number;
  hsn?: string;
  image?: string;
  brandName?: string;
}

export interface Address {
  id: string;
  customerId: string;
  name: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  type: "home" | "work" | "other";
  isDefault: boolean;
  createdAt?: string;
}

export interface Offer {
  id: string;
  sellerId: string;
  company: string;
  legalName: string;
  rating: number;
  deliveryDays: number;
  price: number;
  mrp: number;
  stock: number;
  reserved: number;
  availableStock: number;
  isBestOffer?: boolean;
  state: string;
  city: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  shipmentId: string;
  productId: string;
  productName: string;
  reason: string;
  comments: string;
  photoThumbnail?: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected" | "refunded";
  refundAmount: number;
  refundMethod: string;
  timeline?: Array<{ status: string; timestamp: string; note: string }>;
}

export interface Shipment {
  id: string;
  orderId: string;
  sellerId: string;
  sellerName: string;
  sellerState?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  cgst: number;
  sgst: number;
  igst: number;
  shippingFee: number;
  shipping?: number;
  total: number;
  totalAmountPaise?: number;
  status: "pending" | "confirmed" | "processing" | "packed" | "shipped" | "in_transit" | "out_for_delivery" | "delivered" | "cancelled" | "return_requested" | "returned" | "refunded";
  courierName?: string;
  trackingNumber?: string;
  timeline: Array<{ status: string; label: string; timestamp: string; note?: string }>;
  returnRequest?: ReturnRequest;
}

export interface PaymentRecord {
  method: "upi" | "card" | "netbanking" | "wallet" | "cod";
  status: "paid" | "pending" | "failed" | "refunded";
  transactionId: string;
  cardLast4?: string;
  cardBrand?: string;
  upiVpa?: string;
  paidAt?: string;
  amount: number;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  sellerId: string;
  type: "reserve" | "deduct" | "release" | "restock" | "in" | "out" | "adjustment" | "damaged" | "transfer";
  quantity: number;
  orderId?: string;
  timestamp: string;
  reason: string;
  batchNumber?: string;
  expiryDate?: string;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  supplierRef?: string;
}

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
}

export interface CartItemRef {
  productId: string;
  sellerId: string;
  quantity: number;
  addedAt: string;
  snapshotPrice?: number;
}

export interface RecommendationMatchReason {
  code: string;
  label: string;
  type: "positive" | "caution" | "neutral";
}

export interface RecommendationParameterFit {
  parameterId: string;
  parameterSlug: string;
  parameterName: string;
  userScore: number;
  productBenefit: number;
  impactLevel: "strong_fit" | "moderate_fit" | "neutral" | "caution";
  label: string;
}

export interface ProductRecommendation {
  productId: string;
  product: Product;
  matchScore: number;
  reasons: RecommendationMatchReason[];
  parameterBreakdown: RecommendationParameterFit[];
  bestOffer: Offer | null;
  allOffers: Offer[];
  isSponsored: boolean;
  inStock: boolean;
  exclusionReason?: string;
}

export interface GroupedRecommendations {
  topPicks: ProductRecommendation[];
  routine: {
    cleanser?: ProductRecommendation;
    serum?: ProductRecommendation;
    moisturizer?: ProductRecommendation;
    sunscreen?: ProductRecommendation;
    treatment?: ProductRecommendation;
  };
  concernTargets: Array<{
    concernName: string;
    parameterId: string;
    userScore: number;
    products: ProductRecommendation[];
  }>;
  avoidForYou: ProductRecommendation[];
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  userId?: string;
  sellerId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shippingFee: number;
  shipping?: number;
  total: number;
  totalAmountPaise?: number;
  paymentLast4?: string;
  status: "pending" | "processing" | "shipped" | "in_transit" | "delivered" | "cancelled" | "refunded" | "confirmed" | "packed" | "out_for_delivery";
  paymentMethod: string;
  paymentStatus: "paid" | "pending" | "failed";
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    name?: string;
    mobile?: string;
    phone?: string;
    addressLine1?: string;
  };
  createdAt: string;
  shipments?: Shipment[];
  payment?: PaymentRecord;
  timeline?: Array<{ status: string; label: string; timestamp: string; note?: string }>;
  couponCode?: string;
  couponDiscount?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  codFee?: number;
  pendingExpiresAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageCount: number;
  usedCount?: number;
  usageLimit: number;
  status: "active" | "expired";
  applicableCategory?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: "free" | "starter" | "business" | "enterprise";
  priceMonthly: number;
  priceYearly: number;
  description: string;
  features: string[];
  limits: {
    maxProducts: number;
    maxOrdersPerMonth: number;
    commissionRate: number;
  };
  isPopular?: boolean;
}

export interface RolePermission {
  role: Role;
  description: string;
  allowedGroups: string[];
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  durationMinutes: number;
  price: number;
  category: string;
  description: string;
  image: string;
  benefits?: string[];
  idealFor?: string[];
  notSuitableFor?: string[];
  steps?: Array<{ step: number; title: string; description: string }>;
  beforeAfter?: {
    before: string;
    after: string;
    note: string;
  };
  faqs?: Array<{ q: string; a: string }>;
  relatedServiceIds?: string[];
}

export interface Consultant {
  id: string;
  name: string;
  slug?: string;
  title: string;
  qualifications?: string;
  bio?: string;
  specialties: string[];
  languages?: string[];
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  avatar: string;
  consultationFee: number;
  availability: string[];
  testimonials?: Array<{
    author: string;
    rating: number;
    comment: string;
  }>;
}

export interface Appointment {
  id: string;
  consultantId: string;
  consultantName: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  serviceTitle: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "rescheduled" | "completed" | "cancelled" | "no_show" | "upcoming";
  mode?: "video" | "in-clinic";
  reference?: string;
  concerns?: string[];
  notes?: string;
  meetLink?: string;
  proposedDate?: string;
  proposedTime?: string;
  cancelReason?: string;
  declineReason?: string;
  shareScanConsent?: boolean;
  pricePaise?: number;
  activityLog?: Array<{
    timestamp: string;
    action: string;
    actor: string;
    note?: string;
  }>;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  rating: number;
  comment: string;
  avatar: string;
  verified: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  readTimeMinutes: number;
  publishedAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Notification {
  id: string;
  type:
    | "system"
    | "order"
    | "appointment"
    | "plan"
    | "scan"
    | "ticket"
    | "payout"
    | "security"
    | "info"
    | "success"
    | "warning"
    | "error";
  userId?: string;
  recipientId?: string;
  recipientRole?: Role | "all" | string;
  roleTarget?: Role | "all" | string;
  title: string;
  body?: string;
  message?: string;
  link?: string;
  actionUrl?: string;
  priority?: "low" | "medium" | "high";
  read: boolean;
  createdAt?: string;
  timestamp?: string;
}

export interface QuestionnaireStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  type: "single" | "multiple" | "scale";
  options: Array<{
    label: string;
    value: string;
    hint?: string;
  }>;
}

export interface SampleScan {
  id: string;
  customerName: string;
  date: string;
  age: number;
  skinType: string;
  overallScore: number;
  parameterScores: Record<string, number>;
  primaryConcerns: string[];
  summary: string;
  image: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  businessHours?: string;
  socialLinks?: Record<string, string>;
  stats: {
    clients?: number;
    satisfaction?: string;
    treatments?: number;
    rating?: string;
    cities?: number;
    brands?: number;
    consultationsDone?: number;
    activeBrands?: number;
    happyCustomers?: number;
    accuracyRate?: string;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  actor?: string;
  role?: Role | string;
  action: string;
  resource: string;
  details: string;
  ipAddress?: string;
  beforeAfter?: {
    before?: any;
    after?: any;
  };
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  specialty: string;
  social?: Record<string, string>;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  description: string;
  icon: string;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

export interface TechnologyStage {
  step: number;
  key: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  metrics: string[];
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface CookieConsent {
  accepted: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

export interface ConsentRecord {
  timestamp: string;
  version: string;
  facialAnalysis: boolean;
  privacyTerms: boolean;
  storeHistory: boolean;
  marketing: boolean;
  ipAddress?: string;
  termsVersion?: string;
  cameraBiometricsConsent?: boolean;
  dataProcessingConsent?: boolean;
}

export type OrderReturn = ReturnRequest;

export interface QuestionnaireAnswers {
  ageRange?: string;
  gender?: string;
  skinType?: string;
  skinConcerns?: string[];
  allergies?: string[];
  currentRoutine?: string;
  sunExposure?: string;
  sleepHours?: string;
  waterIntake?: string;
  stressLevel?: string;
  diet?: string;
  pregnantOrNursing?: string;
  primaryGoals?: string[];
  completedAt?: string;
  [key: string]: any;
}

export interface TopConcern {
  parameterId: string;
  name: string;
  score: number;
  rank: number;
  interpretation: string;
  focusTip: string;
  icon?: string;
}

export interface Scan {
  id: string;
  customerId: string;
  customerName: string;
  createdAt: string;
  date?: string;
  status: "completed" | "processing" | "failed";
  thumbnails: {
    front: string;
    left?: string;
    right?: string;
  };
  overallScore: number;
  qualityScore: number;
  parameterScores: Record<string, number>;
  topConcerns: TopConcern[];
  versionMetadata: {
    analysisVersion: string;
    parametersVersion: string;
  };
  notes?: string;
}

export type ScanRecord = Scan;

export interface CustomerProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  onboardingCompleted: boolean;
  consent: ConsentRecord | null;
  questionnaire: QuestionnaireAnswers | null;
  registeredAt: string;
  preferences?: {
    orderUpdates?: boolean;
    scanReminders?: boolean;
    consultationReminders?: boolean;
    amReminder?: string;
    pmReminder?: string;
    pushEnabled?: boolean;
  };
}

export interface OtpState {
  phoneOrEmail: string;
  code: string;
  expiresAt: number;
  attempts: number;
  lockedUntil?: number;
  type: "login" | "signup" | "forgot";
}

export interface SkinTip {
  id: string;
  category: string;
  title: string;
  tip: string;
  icon: string;
  parameterSlug?: string;
}

// ==================================================
// PHASE 6: SUPER ADMIN GOVERNANCE & AI ENGINE TYPES
// ==================================================

export interface ParameterDraft extends SkinParameter {
  isDraftNew?: boolean;
}

export interface ParameterDiff {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface ParameterChangeItem {
  parameterId: string;
  parameterName: string;
  changeType: "added" | "removed" | "modified" | "reordered";
  diffs: ParameterDiff[];
  field?: string;
  oldValue?: any;
  newValue?: any;
}

export interface ParameterVersion {
  id: string;
  version: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  changeSummary: string;
  parametersSnapshot: SkinParameter[];
  status: "live" | "archived";
  scanCount: number;
  changes?: ParameterChangeItem[];
}

export interface RecommendationRule {
  id: string;
  name: string;
  description: string;
  conditionType:
    | "parameter_score_below"
    | "parameter_score_above"
    | "skin_type_match"
    | "concern_match"
    | "allergy_exclude"
    | "pregnancy_safe";
  targetParameterId?: string;
  threshold?: number;
  conditionValue?: string;
  actionType: "boost_mapped_products" | "exclude_category" | "exclude_ingredients" | "demote";
  boostPercent?: number;
  targetCategoryId?: string;
  targetIngredientIds?: string[];
  priority: number;
  status: "active" | "disabled";
  isLocked?: boolean;
}

export interface RuleSetVersion {
  id: string;
  version: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  rulesSnapshot: RecommendationRule[];
  changeSummary: string;
  status: "live" | "archived";
}

export interface ModelVersion {
  id: string;
  version: string;
  name: string;
  status: "live" | "archived" | "beta";
  description: string;
  noiseOffsetMultiplier: number;
  scanCount: number;
  releaseDate: string;
}

export interface DocumentCheck {
  id: string;
  docType: "gst_certificate" | "pan_card" | "drug_license" | "cancelled_cheque" | "iso_gmp";
  title: string;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  status: "verified" | "rejected" | "pending";
  comment?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface KycReview {
  sellerId: string;
  reviewerId: string;
  reviewerName: string;
  reviewedAt: string;
  decision: "approved" | "rejected" | "more_info_needed" | "under_review";
  reason?: string;
  checklist: DocumentCheck[];
}

export interface PlatformSettings {
  commissionPlans: Record<string, number>; // Free: 12, Starter: 10, Business: 8, Empire: 6
  sellerCommissionOverrides: Record<string, number>;
  defaultGSTRate: number; // 18
  paymentGatewayFeePercent: number; // 2
  returnWindowDays: number; // 7
  freeShippingThresholdPaise: number; // 99900 = ₹999
  activeModelVersionId: string; // 'sim-1.0'
  maxRecommendationScoreCap: number; // 98
  minimumStockForRecommendation: number; // 1
  sellerRankingWeights: {
    price: number;
    stock: number;
    rating: number;
    delivery: number;
    status: number;
  };
  consultantCommissionPercent?: number; // 15 (default)
  matchScoreThresholds: {
    excellent: number;
    good: number;
    fair: number;
  };
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  sellerId: string;
  sellerName: string;
  amountPaise: number;
  method: "UPI" | "Card" | "NetBanking" | "COD";
  status: "success" | "failed" | "pending" | "refunded";
  gatewayFeePaise: number;
  transactionId: string;
  utr?: string;
  isReconciled: boolean;
  createdAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  message: string;
  text?: string;
  timestamp: string;
  createdAt?: string;
  isInternal: boolean;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  customerId?: string;
  sellerId?: string;
  requesterName: string;
  requesterEmail: string;
  requesterRole: Role;
  userName?: string;
  userRole?: Role;
  subject: string;
  category: "order" | "shipping" | "skin_consult" | "kyc" | "payout" | "product" | "general";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  slaMinutes: number;
  messages: TicketMessage[];
}

export interface PrivacyRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  type: "export" | "deletion";
  requestedAt: string;
  createdAt?: string;
  status: "pending" | "processing" | "fulfilled" | "cancelled";
  fulfilledAt?: string;
  notes?: string;
  exportDataJson?: string;
}

export interface LoginAttempt {
  id: string;
  emailOrPhone: string;
  role: string;
  ipAddress: string;
  device: string;
  status: "success" | "failed_otp" | "failed" | "locked";
  timestamp: string;
}

export interface AdminNote {
  id: string;
  entityType: "user" | "seller" | "order" | "product";
  entityId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  link?: string;
  linkUrl?: string;
  placement: "home_hero" | "boutique_top" | "customer_app";
  status: "active" | "draft" | "scheduled";
  order: number;
  startDate?: string;
  endDate?: string;
}

export interface Campaign {
  id: string;
  name: string;
  targetSegment: "low_hydration" | "high_sebum" | "repeat_buyers" | "cart_abandoners" | "all_customers";
  channel: "email" | "sms" | "push";
  status: "draft" | "scheduled" | "sent";
  scheduledDate?: string;
  scheduledFor?: string;
  sentDate?: string;
  audienceCount?: number;
  subject?: string;
  messageBody?: string;
  message?: string;
  sentCount?: number;
  results?: {
    delivered: number;
    opened: number;
    converted: number;
  };
}

export interface CmsBlock {
  id: string;
  type: "heading" | "paragraph" | "list" | "quote" | "notice";
  content: string;
  level?: number;
}

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  category: "legal" | "about" | "technology" | "services";
  lastModified: string;
  versionNote: string;
  blocks: CmsBlock[];
}

export interface CmsArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  excerpt?: string;
  content: string;
  coverImage: string;
  readTimeMinutes: number;
  publishedAt: string;
  status: "published" | "draft";
  seoTitle: string;
  seoDescription: string;
  author: string;
}

export interface CmsFaq {
  id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
  status: "published" | "draft";
}

export interface CmsService {
  id: string;
  title: string;
  tagline: string;
  description: string;
  duration: string;
  pricePaise: number;
  category: string;
  benefits: string[];
  image?: string;
  price?: number;
  durationMinutes?: number;
  slug?: string;
}

// ============================================================
// PHASE 7: CONSULTANT, SUPPORT & FINANCE, CROSS-PANEL SYNC TYPES
// ============================================================

export type ConsultantResource =
  | "appointments"
  | "clients"
  | "client_scans"
  | "plans"
  | "availability"
  | "messages"
  | "earnings"
  | "profile";

export type ConsultantAction = "view" | "create" | "edit" | "delete" | "approve" | "export";

export interface ConsultantProfile {
  id: string;
  name: string;
  slug: string;
  title: string;
  qualifications: string;
  bio: string;
  specialties: string[];
  languages: string[];
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  avatar: string;
  consultationFee: number; // in Rupees
  pricePaise?: number;
  fee?: number;
  modeAvailability?: Array<"video" | "in-clinic">;
  pauseBookings?: boolean;
  status: "active" | "suspended";
}

export interface AvailabilityRule {
  id: string;
  consultantId: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday ... 6=Saturday
  dayName: string;
  enabled: boolean;
  timeRanges: Array<{ start: string; end: string }>;
  slotDurationMinutes: 15 | 30 | 45 | 60;
  bufferMinutes: number;
  maxAppointmentsPerDay: number;
  mode: Array<"video" | "in-clinic">;
}

export interface TimeOff {
  id: string;
  consultantId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
}

export interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface ClientNote {
  id: string;
  consultantId: string;
  customerId?: string;
  clientId?: string;
  clientName?: string;
  appointmentId?: string;
  soap: SoapNote;
  disclaimer: string;
  createdAt: string;
  updatedAt: string;
  history?: Array<{
    timestamp: string;
    soap: SoapNote;
  }>;
}

export interface ScanShareConsent {
  id: string;
  customerId: string;
  consultantId: string;
  granted: boolean;
  timestamp: string;
  revocable: boolean;
}

export interface PlanStep {
  id: string;
  order?: number;
  stepNumber?: number;
  step?: number;
  routineStep?: string;
  timeOfDay?: "AM" | "PM" | string;
  productId: string;
  productName: string;
  productBrand?: string;
  productImage?: string;
  title?: string;
  matchScore?: number;
  usageInstructions?: string;
  usage?: string;
  instruction?: string;
  frequency?: string;
  waitTimeMinutes?: number;
  waitTime?: string;
  allergenConflicts?: string[];
  overrideReason?: string;
}

export interface Plan {
  id: string;
  consultantId: string;
  consultantName: string;
  customerId: string;
  clientId?: string;
  customerName: string;
  clientName?: string;
  title: string;
  goals: string[] | string;
  durationWeeks: 4 | 8 | 12;
  amRoutine: PlanStep[];
  pmRoutine: PlanStep[];
  amSteps?: PlanStep[];
  pmSteps?: PlanStep[];
  lifestyleTips: string[] | string;
  dietNotes: string[] | string;
  followUpSchedule?: string;
  followupScheduleWeeks?: number | string;
  status: "draft" | "published" | "active";
  version: number;
  changeNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanTemplate {
  id: string;
  title: string;
  description: string;
  durationWeeks: 4 | 8 | 12;
  goals: string[] | string;
  amRoutine: PlanStep[];
  pmRoutine: PlanStep[];
  amSteps?: PlanStep[];
  pmSteps?: PlanStep[];
  lifestyleTips: string[] | string;
  dietNotes: string[] | string;
}

export interface PlanVersion {
  id: string;
  planId: string;
  version: number;
  changeNote: string;
  snapshot: Plan;
  publishedAt: string;
}

export interface PlanProgress {
  planId: string;
  customerId: string;
  completedChecklist: Record<string, boolean>; // e.g. "2026-10-27-am-step-1": true
  adherencePercent: number;
  lastCheckedDate: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderRole: "consultant" | "customer";
  senderName: string;
  text: string;
  timestamp: string;
  read: boolean;
  attachedScanId?: string;
  attachedProductId?: string;
}

export interface ChatThread {
  id: string;
  consultantId: string;
  consultantName: string;
  customerId: string;
  customerName: string;
  lastMessageText: string;
  lastMessagePreview?: string;
  lastMessageTimestamp: string;
  unreadCountConsultant: number;
  unreadByConsultant?: number;
  unreadCountCustomer: number;
  unreadByCustomer?: number;
}

export interface SessionRecord {
  id: string;
  appointmentId: string;
  consultantId: string;
  customerId: string;
  scheduledStart: string;
  actualStart?: string;
  actualEnd?: string;
  durationMinutes?: number;
  notesSummary?: string;
  status: "scheduled" | "in_progress" | "completed" | "abandoned";
}

export interface ConsultantReview {
  id: string;
  consultantId: string;
  customerId: string;
  customerName: string;
  rating: number; // 1-5
  review?: string;
  comment?: string;
  createdAt: string;
  verifiedConsultation?: boolean;
}

export interface ActivityEvent {
  id: string;
  entityType: "order" | "appointment" | "ticket" | "seller" | "product" | "scan" | "plan";
  entityId: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  metadata?: Record<string, any>;
}


