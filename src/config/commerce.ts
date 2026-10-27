export const COMMERCE_CONFIG = {
  freeShippingThreshold: 999, // Free shipping above ₹999
  standardShippingFee: 79,    // ₹79 otherwise
  codFee: 40,                 // ₹40 COD fee
  codMaxOrderValue: 5000,     // COD only for orders under ₹5,000
  defaultGstRate: 0.18,       // 18% default GST
  returnWindowDays: 7,        // Return allowed within 7 days of delivery
  paymentExpiryMinutes: 15,   // 15 minutes before pending payment expires
  maxRecommendedMatchScore: 98, // Capped at 98 for honest clinical feel
};

export interface IndianState {
  code: string;
  name: string;
  isUnionTerritory?: boolean;
}

export const INDIAN_STATES: IndianState[] = [
  { code: "AN", name: "Andaman and Nicobar Islands", isUnionTerritory: true },
  { code: "AP", name: "Andhra Pradesh" },
  { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "CH", name: "Chandigarh", isUnionTerritory: true },
  { code: "CT", name: "Chhattisgarh" },
  { code: "DH", name: "Dadra and Nagar Haveli and Daman and Diu", isUnionTerritory: true },
  { code: "DL", name: "Delhi", isUnionTerritory: true },
  { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" },
  { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "JK", name: "Jammu and Kashmir", isUnionTerritory: true },
  { code: "JH", name: "Jharkhand" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "LA", name: "Ladakh", isUnionTerritory: true },
  { code: "LD", name: "Lakshadweep", isUnionTerritory: true },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "MH", name: "Maharashtra" },
  { code: "MN", name: "Manipur" },
  { code: "ML", name: "Meghalaya" },
  { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" },
  { code: "OR", name: "Odisha" },
  { code: "PY", name: "Puducherry", isUnionTerritory: true },
  { code: "PB", name: "Punjab" },
  { code: "RJ", name: "Rajasthan" },
  { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TG", name: "Telangana" },
  { code: "TR", name: "Tripura" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "UT", name: "Uttarakhand" },
  { code: "WB", name: "West Bengal" },
];
