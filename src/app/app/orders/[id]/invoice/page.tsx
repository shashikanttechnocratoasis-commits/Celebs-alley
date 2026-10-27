"use client";

import React, { use } from "react";
import Link from "next/link";
import { Printer, ArrowLeft, ShieldCheck, Download } from "lucide-react";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/Button";
import { formatINR, numberToWordsINR } from "@/lib/pricing";

interface InvoicePageProps {
  params: Promise<{ id: string }>;
}

export default function GSTInvoicePage({ params }: InvoicePageProps) {
  const { id } = use(params);
  const { orders, sellers } = useAppStore();

  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="p-12 text-center text-xs text-cream-400">
        Order not found.
      </div>
    );
  }

  const primarySeller = sellers.find((s) => s.id === order.sellerId) || sellers[0] || {
    company: "Royal Beauty Logistics Pvt Ltd",
    legalName: "Royal Beauty Logistics Private Limited",
    gstNumber: "27AABCR8812M1Z4",
    panNumber: "AABCR8812M",
    city: "Mumbai",
    state: "Maharashtra",
  };

  const invoiceNumber = `INV-${order.orderNumber.replace("CA-ORD-", "").replace("CA-", "")}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const amountInWords = numberToWordsINR(order.total);

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Top Bar (Hidden during print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href={`/app/orders/${order.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-cream-400 hover:text-gold-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Order #{order.orderNumber}
        </Link>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handlePrint}
            className="shadow-gold-glow text-xs"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Official GST Tax Invoice Document Layout */}
      <div className="p-8 sm:p-12 bg-white text-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 print:border-none print:shadow-none print:p-0 print:rounded-none font-sans space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-zinc-900">
          <div>
            <div className="text-2xl font-serif font-bold tracking-tight text-zinc-900">
              CELEBS ALLEY
            </div>
            <p className="text-[11px] uppercase font-mono tracking-widest text-zinc-500 mt-0.5">
              BEAUTY • WELLNESS • TREATMENT
            </p>
            <p className="text-xs text-zinc-600 mt-2">
              Marketplace Facilitator: Celebs Alley Technologies India Pvt Ltd
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="inline-block px-3 py-1 bg-zinc-900 text-white font-mono text-xs font-bold uppercase tracking-wider rounded">
              TAX INVOICE
            </span>
            <div className="text-xs font-mono text-zinc-700 pt-1">
              <strong>Invoice No:</strong> {invoiceNumber}
            </div>
            <div className="text-xs font-mono text-zinc-700">
              <strong>Date:</strong> {invoiceDate}
            </div>
            <div className="text-xs font-mono text-zinc-700">
              <strong>Order Ref:</strong> #{order.orderNumber}
            </div>
          </div>
        </div>

        {/* Seller & Customer GST Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          {/* Sold By */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1.5">
            <span className="font-mono text-[10px] uppercase font-bold text-zinc-500 block">
              SUPPLIER / SOLD BY:
            </span>
            <div className="font-bold text-sm text-zinc-900">{primarySeller.legalName || primarySeller.company}</div>
            <div className="text-zinc-600 leading-relaxed">
              Authorized Cosmeceutical Distributor, {primarySeller.city}, {primarySeller.state}
            </div>
            <div className="font-mono text-zinc-800 pt-1">
              <strong>GSTIN:</strong> {primarySeller.gstNumber}
            </div>
            <div className="font-mono text-zinc-800">
              <strong>PAN:</strong> {primarySeller.panNumber}
            </div>
          </div>

          {/* Billed & Delivered To */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1.5">
            <span className="font-mono text-[10px] uppercase font-bold text-zinc-500 block">
              BILLED & DELIVERED TO:
            </span>
            <div className="font-bold text-sm text-zinc-900">{order.shippingAddress.name}</div>
            <div className="text-zinc-600 leading-relaxed">
              {order.shippingAddress.street}
            </div>
            <div className="text-zinc-600">
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </div>
            {order.shippingAddress.mobile && (
              <div className="font-mono text-zinc-800 pt-1">
                <strong>Mobile:</strong> +91 {order.shippingAddress.mobile}
              </div>
            )}
            <div className="font-mono text-zinc-800">
              <strong>Place of Supply:</strong> {order.shippingAddress.state} (State Code: 27)
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-zinc-300">
            <thead>
              <tr className="bg-zinc-100 font-mono text-[10px] uppercase text-zinc-700 border-b border-zinc-300">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Description of Goods</th>
                <th className="py-2.5 px-3 text-center">HSN Code</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
                <th className="py-2.5 px-3 text-right">Taxable Value (₹)</th>
                <th className="py-2.5 px-3 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {order.items.map((it, idx) => {
                const taxRate = it.taxRate ?? 0.18;
                const totalItemAmount = it.total;
                const taxableVal = Math.round(totalItemAmount / (1 + taxRate));

                return (
                  <tr key={it.productId} className="text-zinc-800">
                    <td className="py-3 px-3 font-mono text-zinc-500">{idx + 1}</td>
                    <td className="py-3 px-3 font-medium">
                      <div>{it.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        Cosmeceutical formulation (GST @ {(taxRate * 100).toFixed(0)}%)
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono">{it.hsn || "330499"}</td>
                    <td className="py-3 px-3 text-center font-mono">{it.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono">{formatINR(it.unitPrice)}</td>
                    <td className="py-3 px-3 text-right font-mono">{formatINR(taxableVal)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900">
                      {formatINR(totalItemAmount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* GST Tax Summary Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start text-xs">
          {/* Amount in words */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
              <span className="font-mono text-[10px] uppercase font-bold text-zinc-500">
                TOTAL INVOICE AMOUNT IN WORDS:
              </span>
              <p className="font-serif text-sm font-semibold text-zinc-900 italic">
                {amountInWords}
              </p>
            </div>

            <div className="text-[11px] text-zinc-500 space-y-1 font-mono">
              <div>• Payment Mode: {order.paymentMethod}</div>
              <div>• Payment Status: PAID IN FULL</div>
              {order.payment?.transactionId && (
                <div>• Transaction ID: {order.payment.transactionId}</div>
              )}
            </div>
          </div>

          {/* Tax Totals */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2 text-zinc-800">
            <div className="flex justify-between">
              <span>Gross Total (Tax Inclusive)</span>
              <span className="font-mono">{formatINR(order.subtotal)}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Coupon Privilege ({order.couponCode || "DISCOUNT"})</span>
                <span className="font-mono">-{formatINR(order.discount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Insulated Cold-Chain Freight</span>
              <span className="font-mono">
                {order.shippingFee === 0 ? "FREE" : formatINR(order.shippingFee)}
              </span>
            </div>

            {/* Split */}
            <div className="pt-2 border-t border-zinc-200 space-y-1 font-mono text-[11px] text-zinc-600">
              {order.igst && order.igst > 0 ? (
                <div className="flex justify-between">
                  <span>IGST (Integrated GST @ 18%)</span>
                  <span>{formatINR(order.igst)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>CGST (Central GST @ 9%)</span>
                    <span>{formatINR(order.cgst || Math.round((order.tax || 0) / 2))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST (State GST @ 9%)</span>
                    <span>{formatINR(order.sgst || (order.tax || 0) - Math.round((order.tax || 0) / 2))}</span>
                  </div>
                </>
              )}
            </div>

            <div className="pt-3 border-t-2 border-zinc-900 flex justify-between font-bold text-base text-zinc-900">
              <span>Invoice Total</span>
              <span className="font-mono">{formatINR(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Declarations and Signature Footer */}
        <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-[11px] text-zinc-500">
          <div className="space-y-1 max-w-sm">
            <p className="font-bold text-zinc-700 uppercase font-mono">Declaration:</p>
            <p>
              We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
            </p>
          </div>

          <div className="text-center sm:text-right space-y-8">
            <p className="font-mono uppercase font-bold text-zinc-700">
              For {primarySeller.legalName || primarySeller.company}
            </p>
            <p className="border-t border-zinc-400 pt-1 font-mono text-[10px]">
              Authorised Signatory
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
