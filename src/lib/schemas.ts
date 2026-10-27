import { z } from "zod";

export const RoleSchema = z.enum([
  "Super Admin",
  "Admin",
  "Product Manager",
  "AI/Rule Manager",
  "Distributor Owner",
  "Distributor Manager",
  "Inventory Manager",
  "Order Manager",
  "Sales Executive",
  "Accountant",
  "Consultant",
  "Customer",
  "Support Agent",
  "Finance Manager",
]);

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  role: RoleSchema,
  avatar: z.string(),
  sellerId: z.string().optional(),
  city: z.string().optional(),
});

export const SkinParameterSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  unit: z.string(),
  minScore: z.number(),
  maxScore: z.number(),
  weight: z.number(),
  status: z.enum(["active", "inactive"]),
  aiKey: z.string(),
  displayOrder: z.number(),
  icon: z.string(),
  interpretation: z.object({
    low: z.string(),
    medium: z.string(),
    high: z.string(),
  }),
});

export const BrandSchema = z.object({
  id: z.string(),
  name: z.string(),
  logo: z.string(),
  origin: z.string(),
  description: z.string(),
  status: z.enum(["active", "inactive"]),
});

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  image: z.string(),
});

export const IngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  inciName: z.string(),
  benefits: z.array(z.string()),
  contraindications: z.array(z.string()),
  concernTags: z.array(z.string()),
  safetyRating: z.number(),
});

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string(),
  brandId: z.string(),
  categoryId: z.string(),
  description: z.string(),
  images: z.array(z.string()),
  mrp: z.number(),
  ingredients: z.array(z.string()),
  targetParameters: z.record(z.string(), z.number()),
  suitableSkinTypes: z.array(z.string()),
  concernTags: z.array(z.string()),
  contraindications: z.array(z.string()),
  usage: z.string(),
  rating: z.number(),
  reviewCount: z.number().default(0),
  status: z.enum(["active", "draft", "archived", "pending_approval"]),
});

export const SellerSchema = z.object({
  id: z.string(),
  company: z.string(),
  legalName: z.string(),
  gstNumber: z.string(),
  panNumber: z.string(),
  city: z.string(),
  state: z.string(),
  status: z.enum(["approved", "pending", "under_review", "rejected", "suspended"]),
  planId: z.string(),
  rating: z.number(),
  deliveryDays: z.number(),
  contactEmail: z.string(),
  contactPhone: z.string(),
  rejectionReason: z.string().optional(),
  kycSubmittedAt: z.string().optional(),
  kycReviewedAt: z.string().optional(),
  isPaused: z.boolean().optional(),
});

export const InventoryItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  sellerId: z.string(),
  price: z.number(),
  mrp: z.number(),
  stock: z.number(),
  reserved: z.number(),
  lowStockThreshold: z.number(),
  sku: z.string(),
  updatedAt: z.string(),
});

export const OrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  sellerId: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      total: z.number(),
    })
  ),
  subtotal: z.number(),
  discount: z.number(),
  tax: z.number(),
  shippingFee: z.number(),
  total: z.number(),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]),
  paymentMethod: z.string(),
  paymentStatus: z.enum(["paid", "pending", "failed"]),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    name: z.string().optional(),
    mobile: z.string().optional(),
  }),
  createdAt: z.string(),
});

export const PincodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit Indian PIN code");

export const AddressFormSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").max(60),
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  addressLine1: z.string().min(5, "Flat / House no. / Street is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: PincodeSchema,
  type: z.enum(["home", "work", "other"]),
  isDefault: z.boolean().default(false),
});

export type AddressFormData = z.infer<typeof AddressFormSchema>;

// Luhn algorithm validator for simulated card checkout
export function validateLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export const CardPaymentFormSchema = z.object({
  cardNumber: z
    .string()
    .trim()
    .refine((val) => validateLuhn(val), {
      message: "Please enter a valid card number (failed checksum)",
    }),
  cardHolder: z.string().min(3, "Cardholder name is required"),
  expiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/?([2-9][0-9])$/, "Expiry must be MM/YY"),
  cvv: z
    .string()
    .trim()
    .regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
});

export const UpiPaymentFormSchema = z.object({
  vpa: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9.\-_]{2,64}@[a-zA-Z]{2,64}$/, "Enter a valid UPI ID (e.g., yourname@okhdfcbank or success@celebs)"),
});

export const ReturnRequestFormSchema = z.object({
  reason: z.string().min(3, "Please select or state a return reason"),
  comments: z.string().min(10, "Please describe the reason in at least 10 characters"),
  productId: z.string().min(1, "Select product to return"),
});

export const ReviewFormSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5),
  title: z.string().min(3, "Review headline is required"),
  comment: z.string().min(10, "Review must be at least 10 characters long"),
});

// ==========================================
// SELLER REGISTRATION & ONBOARDING SCHEMAS
// ==========================================

export const SellerAccountSchema = z.object({
  ownerName: z.string().min(3, "Owner name must be at least 3 characters"),
  email: z.string().email("Please enter a valid business email"),
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Mobile must be a valid 10-digit Indian number starting with 6-9"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[a-z]/, "Must include at least one lowercase letter")
    .regex(/[0-9]/, "Must include at least one number")
    .regex(/[^A-Za-z0-9]/, "Must include at least one special character"),
});

export const SellerBusinessSchema = z.object({
  companyName: z.string().min(3, "Company legal name is required"),
  brandName: z.string().min(2, "Brand / trade name is required"),
  businessType: z.enum([
    "Distributor",
    "Brand owner",
    "Retailer",
    "Salon/Clinic supplier",
  ]),
  address: z.string().min(10, "Registered address must be at least 10 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  yearsInBusiness: z.number().min(0, "Years in business must be 0 or more"),
  categories: z.array(z.string()).min(1, "Select at least 1 product category"),
});

export const SellerComplianceSchema = z.object({
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Enter a valid 15-character GSTIN (e.g., 27AABCR8812M1Z4 with 2-digit state code)"
    ),
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Enter a valid 10-character PAN (e.g. AABCR8812M)"),
  cosmeticsLicence: z.string().min(3, "Cosmetics manufacturing / distribution licence number is required"),
  fssaiLicence: z.string().optional(),
});

export const SellerBankSchema = z
  .object({
    accountHolder: z.string().min(3, "Account holder name is required"),
    accountNumber: z
      .string()
      .trim()
      .regex(/^\d{9,18}$/, "Account number must be 9 to 18 digits"),
    confirmAccountNumber: z.string().trim(),
    ifsc: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid 11-character IFSC (e.g., HDFC0001234)"),
  })
  .refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: "Bank account numbers do not match",
    path: ["confirmAccountNumber"],
  });

export const SellerDocumentItemSchema = z.object({
  name: z.string(),
  size: z.number().max(5 * 1024 * 1024, "File size must be under 5MB"),
  type: z.string().refine((t) => ["application/pdf", "image/jpeg", "image/png"].includes(t), {
    message: "File must be PDF, JPG, or PNG",
  }),
});

export const SellerDocumentsSchema = z.object({
  gstCertificate: SellerDocumentItemSchema,
  panCard: SellerDocumentItemSchema,
  cancelledCheque: SellerDocumentItemSchema,
  businessLicence: SellerDocumentItemSchema,
});

export const SellerProductFormSchema = z.object({
  name: z.string().min(3, "Product title is required"),
  sku: z.string().min(3, "SKU code is required"),
  brandId: z.string().min(1, "Select brand"),
  categoryId: z.string().min(1, "Select category"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  mrp: z.number().min(1, "MRP must be greater than 0"),
  price: z.number().min(1, "Selling price must be greater than 0"),
  stock: z.number().min(0, "Stock cannot be negative"),
  lowStockThreshold: z.number().min(1, "Low stock alert threshold must be at least 1"),
  warehouseId: z.string().optional(),
  hsn: z.string().min(4, "HSN code is required"),
  gstRate: z.number().min(0).max(0.28),
  targetParameters: z.record(z.string(), z.number()),
  ingredients: z.array(z.string()).min(1, "Select at least 1 active ingredient"),
  suitableSkinTypes: z.array(z.string()).min(1, "Select at least 1 suitable skin type"),
  concernTags: z.array(z.string()).min(1, "Select at least 1 targeted concern"),
  usage: z.string().min(10, "Usage directions are required"),
  warnings: z.string().optional(),
}).refine((data) => data.price <= data.mrp, {
  message: "Selling price cannot exceed Maximum Retail Price (MRP)",
  path: ["price"],
});


