"use client";

import React from "react";
import { Star, Truck, ShieldCheck, CheckCircle2 } from "lucide-react";
import { formatINR } from "@/lib/pricing";
import type { Offer } from "@/types";

interface SellerComparisonTableProps {
  offers: Offer[];
  selectedSellerId: string;
  onSelectSeller: (sellerId: string) => void;
}

export function SellerComparisonTable({
  offers,
  selectedSellerId,
  onSelectSeller,
}: SellerComparisonTableProps) {
  if (!offers || offers.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-base/50 border border-gold-400/20 text-xs text-cream-400">
        No active authorized distributor offers available currently.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-serif text-sm sm:text-base text-cream-100 font-normal">
          Compare Authorized Sellers ({offers.length})
        </h4>
        <span className="text-[11px] font-mono text-gold-400">
          All sellers verified & cold-chain compliant
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gold-400/20 bg-base/40">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gold-400/15 bg-surface/60 text-cream-400 font-mono uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">Select</th>
              <th className="py-2.5 px-3">Seller / Distributor</th>
              <th className="py-2.5 px-3">Rating</th>
              <th className="py-2.5 px-3">Delivery</th>
              <th className="py-2.5 px-3">Stock</th>
              <th className="py-2.5 px-3 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold-400/10">
            {offers.map((offer) => {
              const isSelected = offer.sellerId === selectedSellerId;
              const isAvailable = offer.availableStock > 0;

              return (
                <tr
                  key={offer.id}
                  onClick={() => isAvailable && onSelectSeller(offer.sellerId)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-gold-400/10 font-medium text-cream-100"
                      : "hover:bg-surface/50 text-cream-200"
                  } ${!isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <td className="py-3 px-3">
                    <input
                      type="radio"
                      name="sellerSelect"
                      checked={isSelected}
                      disabled={!isAvailable}
                      onChange={() => onSelectSeller(offer.sellerId)}
                      className="accent-gold-400 w-3.5 h-3.5 cursor-pointer"
                    />
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-cream-100 font-medium flex items-center gap-1.5">
                          {offer.company}
                          {offer.isBestOffer && (
                            <span className="px-1.5 py-0.2 rounded bg-gold-400/20 border border-gold-400/40 text-[9px] font-mono text-gold-300 font-semibold uppercase">
                              Best Offer
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-cream-400 font-mono">
                          {offer.city}, {offer.state}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1 text-gold-400">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{offer.rating.toFixed(1)}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1 text-cream-300">
                      <Truck className="w-3.5 h-3.5 text-gold-400" />
                      <span>{offer.deliveryDays} Days</span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    {offer.availableStock > 5 ? (
                      <span className="text-emerald-400 text-[11px] font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> In Stock
                      </span>
                    ) : offer.availableStock > 0 ? (
                      <span className="text-amber-400 text-[11px] font-mono">
                        {offer.availableStock} Left
                      </span>
                    ) : (
                      <span className="text-red-400 text-[11px] font-mono">
                        Out of stock
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="font-mono text-sm font-semibold text-gold-400">
                      {formatINR(offer.price)}
                    </div>
                    {offer.mrp > offer.price && (
                      <div className="text-[10px] text-cream-500 line-through">
                        {formatINR(offer.mrp)}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
