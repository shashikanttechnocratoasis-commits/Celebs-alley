/**
 * Settlement calculations in integer paise.
 * 
 * Example breakdown for 1 Delivered Order:
 * Items total excluding GST: ₹10,000 (1,000,000 paise)
 * Plan Commission (e.g. 10% on Business plan): ₹1,000 (100,000 paise)
 * Payment Gateway Fee (2% for online prepaid, 0% for COD): ₹200 (20,000 paise)
 * TCS (1% of net value): ₹100 (10,000 paise)
 * TDS (1% of net value): ₹100 (10,000 paise)
 * Seller Net Earning: 1,000,000 - 100,000 - 20,000 - 10,000 - 10,000 = 860,000 paise (₹8,600)
 */

import type { Order, Shipment, Plan } from "@/types";

export interface ShipmentEarningBreakdown {
  shipmentId: string;
  orderNumber: string;
  deliveredAt: string;
  isEligibleForPayout: boolean; // Delivered >= 7 days ago and not returned
  daysRemainingInReturnWindow: number;
  itemTotalPaise: number; // excluding GST
  taxPaise: number;
  commissionRatePct: number;
  commissionPaise: number;
  isPrepaid: boolean;
  gatewayFeePaise: number;
  tcsPaise: number;
  tdsPaise: number;
  netEarningPaise: number;
}

export interface SellerBalanceSummary {
  availablePaise: number;       // Delivered > 7 days ago, eligible for immediate payout
  pendingHoldPaise: number;     // Delivered < 7 days ago (under return window escrow)
  paidOutPaise: number;         // Already disbursed via settlements / payouts
  commissionPaidPaise: number;  // Platform commission deducted to date
  gatewayFeesPaise: number;     // Payment gateway fees deducted to date
}

/**
 * Calculates earnings for a single shipment.
 */
export function calculateShipmentEarning(
  shipment: Shipment,
  order: Order,
  commissionRatePct: number = 10,
  now: Date = new Date("2026-10-10T12:00:00Z")
): ShipmentEarningBreakdown {
  // Find delivered timeline timestamp
  const deliveredEvent = shipment.timeline?.find((t) => t.status === "delivered");
  const deliveredDate = deliveredEvent ? new Date(deliveredEvent.timestamp) : new Date(order.createdAt);
  
  // Return window is 7 days
  const returnWindowMs = 7 * 24 * 60 * 60 * 1000;
  const timeSinceDeliveredMs = now.getTime() - deliveredDate.getTime();
  const isEligibleForPayout = shipment.status === "delivered" && timeSinceDeliveredMs >= returnWindowMs;
  const daysRemaining = Math.max(0, Math.ceil((returnWindowMs - timeSinceDeliveredMs) / (24 * 60 * 60 * 1000)));

  // Convert to paise
  const itemTotalPaise = Math.round(shipment.subtotal * 100);
  const taxPaise = Math.round(shipment.tax * 100);

  // Commission
  const commissionPaise = Math.round((itemTotalPaise * commissionRatePct) / 100);

  // Gateway fee: 2% for prepaid (upi/card/netbanking/wallet), 0% for COD
  const isPrepaid = order.paymentMethod !== "cod";
  const gatewayFeePaise = isPrepaid ? Math.round((itemTotalPaise * 2) / 100) : 0;

  // TCS: 1%, TDS: 1%
  const tcsPaise = Math.round((itemTotalPaise * 1) / 100);
  const tdsPaise = Math.round((itemTotalPaise * 1) / 100);

  // Net earning
  const netEarningPaise = Math.max(
    0,
    itemTotalPaise - commissionPaise - gatewayFeePaise - tcsPaise - tdsPaise
  );

  return {
    shipmentId: shipment.id,
    orderNumber: order.orderNumber,
    deliveredAt: deliveredDate.toISOString(),
    isEligibleForPayout,
    daysRemainingInReturnWindow: daysRemaining,
    itemTotalPaise,
    taxPaise,
    commissionRatePct,
    commissionPaise,
    isPrepaid,
    gatewayFeePaise,
    tcsPaise,
    tdsPaise,
    netEarningPaise,
  };
}

/**
 * Calculates aggregate balances across all orders/shipments for a seller.
 */
export function calculateSellerBalances(
  sellerId: string,
  orders: Order[],
  commissionRatePct: number = 10,
  paidOutPaise: number = 0,
  now: Date = new Date("2026-10-10T12:00:00Z")
): SellerBalanceSummary {
  let availablePaise = 0;
  let pendingHoldPaise = 0;
  let commissionPaidPaise = 0;
  let gatewayFeesPaise = 0;

  for (const order of orders) {
    if (!order.shipments) continue;
    for (const shipment of order.shipments) {
      if (shipment.sellerId !== sellerId) continue;
      // If order was cancelled or returned, no earnings
      if (shipment.status === "cancelled" || shipment.status === "returned") continue;

      if (shipment.status === "delivered") {
        const breakdown = calculateShipmentEarning(shipment, order, commissionRatePct, now);
        commissionPaidPaise += breakdown.commissionPaise;
        gatewayFeesPaise += breakdown.gatewayFeePaise;

        if (breakdown.isEligibleForPayout) {
          availablePaise += breakdown.netEarningPaise;
        } else {
          pendingHoldPaise += breakdown.netEarningPaise;
        }
      }
    }
  }

  // Deduct already paid out amount from available
  const currentAvailablePaise = Math.max(0, availablePaise - paidOutPaise);

  return {
    availablePaise: currentAvailablePaise,
    pendingHoldPaise,
    paidOutPaise,
    commissionPaidPaise,
    gatewayFeesPaise,
  };
}

/**
 * Format paise to Indian Rupee string
 */
export function formatPaiseToRupees(paise: number): string {
  const rupees = Math.round(paise / 100);
  return `₹${rupees.toLocaleString("en-IN")}`;
}
