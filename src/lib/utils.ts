import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Indian Rupee format (e.g. ₹1,24,500)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount)) return "₹0";
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(absAmount);
  return `${isNegative ? "-" : ""}₹${formatted}`;
}

/**
 * Format paise in Indian Rupee format (e.g. 150000 paise -> ₹1,500)
 */
export function formatPaise(paise: number): string {
  if (isNaN(paise)) return "₹0";
  return formatINR(paise / 100);
}

/**
 * Format date in Indian luxury format: "09 Oct 2026"
 */
export function formatDate(dateInput: string | number | Date): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-IN", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Format Indian number grouping (e.g. 1,24,500)
 */
export function formatNumberIN(num: number): string {
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("en-IN").format(num);
}

/**
 * Utility to simulate network latency
 */
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
