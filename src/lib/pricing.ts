import { COMMERCE_CONFIG } from "@/config/commerce";
import type { Coupon } from "@/types";

/**
 * Format an integer or float number to Indian Rupee currency string.
 * Example: 124500 -> "₹1,24,500"
 * Example: 4462 -> "₹4,462"
 */
export function formatINR(amount: number): string {
  const rounded = Math.round(amount);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rounded);
}

/**
 * Calculate shipping fee based on order subtotal after discount.
 * Rule: Free if subtotal >= freeShippingThreshold (₹999), otherwise standardShippingFee (₹79).
 * 
 * Example:
 * calculateShippingFee(1200) => 0
 * calculateShippingFee(850) => 79
 */
export function calculateShippingFee(subtotalAfterDiscount: number): number {
  if (subtotalAfterDiscount <= 0) return 0;
  return subtotalAfterDiscount >= COMMERCE_CONFIG.freeShippingThreshold
    ? 0
    : COMMERCE_CONFIG.standardShippingFee;
}

/**
 * Calculate coupon discount with minimum order and max discount limits.
 * 
 * Example:
 * calculateCouponDiscount({ discountType: "percentage", discountValue: 20, minOrderValue: 5000, maxDiscount: 2000 }, 6000) => 1200
 * calculateCouponDiscount({ discountType: "fixed", discountValue: 500, minOrderValue: 2500 }, 3000) => 500
 * calculateCouponDiscount({ discountType: "percentage", discountValue: 10, minOrderValue: 2000 }, 1500) => 0
 */
export function calculateCouponDiscount(
  coupon: Coupon | null | undefined,
  subtotal: number
): { discount: number; valid: boolean; reason?: string } {
  if (!coupon) return { discount: 0, valid: false };

  if (coupon.status !== "active") {
    return { discount: 0, valid: false, reason: "Coupon is no longer active" };
  }

  const now = new Date();
  if (coupon.validUntil && new Date(coupon.validUntil) < now) {
    return { discount: 0, valid: false, reason: "Coupon has expired" };
  }

  if (coupon.validFrom && new Date(coupon.validFrom) > now) {
    return { discount: 0, valid: false, reason: "Coupon is not yet active" };
  }

  if (subtotal < coupon.minOrderValue) {
    return {
      discount: 0,
      valid: false,
      reason: `Minimum order value of ${formatINR(coupon.minOrderValue)} required (current: ${formatINR(subtotal)})`,
    };
  }

  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = Math.round((subtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = Math.min(coupon.discountValue, subtotal);
  }

  return { discount, valid: true };
}

export interface TaxBreakdown {
  taxRate: number;
  totalTax: number;
  cgst: number;
  sgst: number;
  igst: number;
  taxableAmount: number;
  isInterState: boolean;
}

/**
 * GST is inclusive in consumer product prices in India.
 * Taxable amount = Price / (1 + taxRate)
 * Total Tax = Price - Taxable amount
 * If Intra-state (seller state == buyer state): Split 50-50 into CGST and SGST
 * If Inter-state (seller state != buyer state): Full amount is IGST
 * 
 * Example:
 * calculateItemTax(4850, 0.18, false) =>
 *   taxableAmount: 4110.17 -> 4110
 *   totalTax: 740
 *   cgst: 370, sgst: 370, igst: 0
 */
export function calculateItemTax(
  inclusivePrice: number,
  taxRate: number = COMMERCE_CONFIG.defaultGstRate,
  isInterState: boolean = false
): TaxBreakdown {
  const taxableAmount = Math.round(inclusivePrice / (1 + taxRate));
  const totalTax = inclusivePrice - taxableAmount;

  if (isInterState) {
    return {
      taxRate,
      totalTax,
      cgst: 0,
      sgst: 0,
      igst: totalTax,
      taxableAmount,
      isInterState: true,
    };
  } else {
    const cgst = Math.round(totalTax / 2);
    const sgst = totalTax - cgst; // Prevent 1 rupee rounding imbalance
    return {
      taxRate,
      totalTax,
      cgst,
      sgst,
      igst: 0,
      taxableAmount,
      isInterState: false,
    };
  }
}

/**
 * Convert number to words in Indian currency numbering format (Lakhs, Thousands, Hundreds).
 * Useful for official GST Tax Invoices.
 * 
 * Example: 4462 -> "Rupees Four Thousand Four Hundred Sixty-Two Only"
 */
export function numberToWordsINR(amount: number): string {
  const num = Math.round(amount);
  if (num === 0) return "Rupees Zero Only";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertSection(n: number): string {
    if (n < 20) return a[n];
    const tens = b[Math.floor(n / 10)];
    const units = a[n % 10];
    return units ? `${tens}-${units}` : tens;
  }

  function convertHundreds(n: number): string {
    let str = "";
    if (Math.floor(n / 100) > 0) {
      str += `${a[Math.floor(n / 100)]} Hundred `;
      n %= 100;
    }
    if (n > 0) {
      str += convertSection(n);
    }
    return str.trim();
  }

  let words = "";
  const crore = Math.floor(num / 10000000);
  let remainder = num % 10000000;

  const lakh = Math.floor(remainder / 100000);
  remainder %= 100000;

  const thousand = Math.floor(remainder / 1000);
  remainder %= 1000;

  if (crore > 0) {
    words += `${convertHundreds(crore)} Crore `;
  }
  if (lakh > 0) {
    words += `${convertHundreds(lakh)} Lakh `;
  }
  if (thousand > 0) {
    words += `${convertHundreds(thousand)} Thousand `;
  }
  if (remainder > 0) {
    words += convertHundreds(remainder);
  }

  return `Rupees ${words.trim()} Only`;
}
