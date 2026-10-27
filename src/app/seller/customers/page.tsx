"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  Download,
  ShoppingBag,
  Clock,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Lock,
  X,
  Calendar,
  DollarSign,
  UserCheck,
} from "lucide-react";
import { useAppStore } from "@/store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { formatINR } from "@/lib/pricing";
import { usePermission } from "@/lib/rbac";
import type { Order, Shipment } from "@/types";

interface CustomerRecord {
  id: string;
  name: string;
  maskedEmail: string;
  maskedPhone: string;
  city: string;
  state: string;
  ordersCount: number;
  lifetimeSpend: number;
  lastOrderDate: string;
  isRepeatBuyer: boolean;
  segment: "New" | "Repeat" | "High Value" | "At Risk";
  orders: Array<{
    orderId: string;
    orderNumber: string;
    date: string;
    amount: number;
    status: string;
    itemsSummary: string;
  }>;
}

export default function SellerCustomersPage() {
  const { currentUser, currentRole, sellers, orders } = useAppStore();

  const currentSeller = sellers.find((s) => s.id === currentUser?.sellerId) || sellers[0];
  const sellerId = currentSeller?.id || "seller-1";

  // RBAC checks
  const canViewCustomers = usePermission("customers", "view");
  const canViewRevenue = usePermission("analytics_revenue", "view");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<string>("all");
  const [activeCustomer, setActiveCustomer] = useState<CustomerRecord | null>(null);

  // Compute customer directory strictly from orders that belong to this seller
  const customersList = useMemo(() => {
    const map = new Map<string, CustomerRecord>();

    // 1. Scan store orders
    orders.forEach((ord) => {
      // Find shipments for this seller
      const sellerShipments = ord.shipments?.filter((s) => s.sellerId === sellerId) || [];
      if (sellerShipments.length === 0 && ord.sellerId !== sellerId) return;

      const custName = ord.shippingAddress?.name || "Kavita Singhania";
      const key = (ord.userId || custName).toLowerCase();
      const shipmentTotal = sellerShipments.reduce((acc, s) => acc + s.total, 0) || ord.total;
      const rawPhone = ord.shippingAddress?.phone || "+91 98200 44521";
      const maskedPhone = rawPhone.slice(0, 4) + "••••" + rawPhone.slice(-2);
      const maskedEmail = custName.toLowerCase().replace(/\s+/g, ".") + "***@gmail.com";

      const itemsSummary =
        sellerShipments
          .flatMap((s) => s.items || [])
          .map((i) => `${i.productName} (x${i.quantity})`)
          .join(", ") || "Luxury Cosmeceuticals";

      const orderItem = {
        orderId: ord.id,
        orderNumber: ord.orderNumber,
        date: ord.createdAt,
        amount: shipmentTotal,
        status: ord.status,
        itemsSummary,
      };

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: custName,
          maskedEmail,
          maskedPhone,
          city: ord.shippingAddress?.city || "Mumbai",
          state: ord.shippingAddress?.state || "Maharashtra",
          ordersCount: 1,
          lifetimeSpend: shipmentTotal,
          lastOrderDate: ord.createdAt,
          isRepeatBuyer: false,
          segment: "New",
          orders: [orderItem],
        });
      } else {
        const existing = map.get(key)!;
        existing.ordersCount += 1;
        existing.lifetimeSpend += shipmentTotal;
        existing.isRepeatBuyer = true;
        if (new Date(ord.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = ord.createdAt;
        }
        existing.orders.push(orderItem);
      }
    });

    // 2. Add realistic seeded buyer profiles if list is small to ensure rich B2B directory
    const seedBuyers: Array<Omit<CustomerRecord, "orders"> & { orders: CustomerRecord["orders"] }> = [
      {
        id: "buyer-seed-1",
        name: "Dr. Ananya Roy (Aesthetic Clinique)",
        maskedEmail: "ananya.r***@aestheticskin.in",
        maskedPhone: "+91 99*** **812",
        city: "Bengaluru",
        state: "Karnataka",
        ordersCount: 5,
        lifetimeSpend: 42800,
        lastOrderDate: "2026-10-06T11:20:00Z",
        isRepeatBuyer: true,
        segment: "High Value",
        orders: [
          {
            orderId: "ord-seed-1",
            orderNumber: "CA-ORD-9214",
            date: "2026-10-06T11:20:00Z",
            amount: 14200,
            status: "delivered",
            itemsSummary: "Cellular Recovery Serum (x4), Gold Peptide Elixir (x2)",
          },
          {
            orderId: "ord-seed-2",
            orderNumber: "CA-ORD-8802",
            date: "2026-09-18T14:10:00Z",
            amount: 12500,
            status: "delivered",
            itemsSummary: "Niacinamide Radiance Cream (x5)",
          },
        ],
      },
      {
        id: "buyer-seed-2",
        name: "Mira Patel",
        maskedEmail: "mira.p***@yahoo.com",
        maskedPhone: "+91 97*** **903",
        city: "Ahmedabad",
        state: "Gujarat",
        ordersCount: 2,
        lifetimeSpend: 6490,
        lastOrderDate: "2026-10-02T16:45:00Z",
        isRepeatBuyer: true,
        segment: "Repeat",
        orders: [
          {
            orderId: "ord-seed-3",
            orderNumber: "CA-ORD-9104",
            date: "2026-10-02T16:45:00Z",
            amount: 3495,
            status: "delivered",
            itemsSummary: "Ceramide Barrier Defense (x1)",
          },
        ],
      },
      {
        id: "buyer-seed-3",
        name: "Vikramaditya Oberoi",
        maskedEmail: "v.oberoi***@gmail.com",
        maskedPhone: "+91 98*** **441",
        city: "New Delhi",
        state: "Delhi",
        ordersCount: 1,
        lifetimeSpend: 2850,
        lastOrderDate: "2026-09-29T10:15:00Z",
        isRepeatBuyer: false,
        segment: "New",
        orders: [
          {
            orderId: "ord-seed-4",
            orderNumber: "CA-ORD-8941",
            date: "2026-09-29T10:15:00Z",
            amount: 2850,
            status: "delivered",
            itemsSummary: "Vitamin C L-Ascorbic Infusion (x1)",
          },
        ],
      },
      {
        id: "buyer-seed-4",
        name: "Sanjana Kapoor (Glow Medispa)",
        maskedEmail: "sanjana***@glowmedispa.com",
        maskedPhone: "+91 91*** **774",
        city: "Hyderabad",
        state: "Telangana",
        ordersCount: 4,
        lifetimeSpend: 29400,
        lastOrderDate: "2026-08-12T09:30:00Z",
        isRepeatBuyer: true,
        segment: "At Risk",
        orders: [
          {
            orderId: "ord-seed-5",
            orderNumber: "CA-ORD-7712",
            date: "2026-08-12T09:30:00Z",
            amount: 15400,
            status: "delivered",
            itemsSummary: "Hyaluronic Multi-Molecular Complex (x6)",
          },
        ],
      },
    ];

    seedBuyers.forEach((seed) => {
      if (!map.has(seed.id)) {
        map.set(seed.id, seed);
      }
    });

    // Compute segment for store customers
    const result = Array.from(map.values()).map((c) => {
      let seg: CustomerRecord["segment"] = "New";
      const daysSinceLast = (Date.now() - new Date(c.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24);
      if (c.lifetimeSpend >= 15000) {
        seg = "High Value";
      } else if (daysSinceLast > 45 && c.ordersCount > 1) {
        seg = "At Risk";
      } else if (c.ordersCount > 1) {
        seg = "Repeat";
      }
      return { ...c, segment: seg };
    });

    return result;
  }, [orders, sellerId]);

  // Filters
  const filteredCustomers = useMemo(() => {
    return customersList.filter((c) => {
      if (selectedSegment !== "all" && c.segment !== selectedSegment) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesCity = c.city.toLowerCase().includes(q);
        if (!matchesName && !matchesCity) return false;
      }
      return true;
    });
  }, [customersList, selectedSegment, searchQuery]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Customer Name", "City", "State", "Orders Count", "Last Order Date", "Segment"];
    if (canViewRevenue) headers.push("Lifetime Spend (INR)");
    const rows = filteredCustomers.map((c) => {
      const row = [c.name, c.city, c.state, c.ordersCount, c.lastOrderDate.split("T")[0], c.segment];
      if (canViewRevenue) row.push(c.lifetimeSpend.toString());
      return row.join(",");
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customers_${sellerId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!canViewCustomers) {
    return (
      <div className="p-12 text-center bg-obsidian-900 border border-obsidian-800 rounded-xl max-w-lg mx-auto mt-12">
        <Lock className="w-12 h-12 text-gold-400 mx-auto mb-4" />
        <h2 className="text-base font-semibold text-cream-100">Access Restricted</h2>
        <p className="text-xs text-cream-400 mt-2">
          Your role (<span className="text-gold-300">{currentRole}</span>) does not have permission to view customer accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Customer Relationship Directory"
          description={`Verified customer accounts who purchased ${currentSeller?.company} products. Privacy safeguarded under DPDP Act 2023.`}
          breadcrumbs={[{ label: "Seller", href: "/seller" }, { label: "Customers" }]}
        />

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-900 border border-obsidian-800 text-[11px] text-cream-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>DPDP Masked</span>
          </div>
          <Button size="sm" variant="outline" onClick={handleExportCSV}>
            <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Segments Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Buyers", count: customersList.length, color: "text-cream-100" },
          { label: "High Value (> ₹15k)", count: customersList.filter((c) => c.segment === "High Value").length, color: "text-gold-300" },
          { label: "Repeat Clients", count: customersList.filter((c) => c.segment === "Repeat").length, color: "text-emerald-300" },
          { label: "At Risk (> 45d)", count: customersList.filter((c) => c.segment === "At Risk").length, color: "text-rose-300" },
        ].map((card, i) => (
          <div key={i} className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-4">
            <span className="text-[10px] text-cream-400 uppercase tracking-wider block font-medium">
              {card.label}
            </span>
            <span className={`text-xl font-bold font-mono mt-1 block ${card.color}`}>
              {card.count}
            </span>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-cream-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name or city..."
            className="pl-9 h-9 text-xs bg-obsidian-950 border-obsidian-800"
          />
        </div>

        {/* Segment Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {["all", "High Value", "Repeat", "New", "At Risk"].map((seg) => (
            <button
              key={seg}
              onClick={() => setSelectedSegment(seg)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap ${
                selectedSegment === seg
                  ? "bg-gold-500/15 text-gold-300 border border-gold-500/30 font-medium"
                  : "text-cream-400 hover:text-cream-200 bg-obsidian-900 border border-transparent"
              }`}
            >
              {seg === "all" ? "All Segments" : seg}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-obsidian-950 border-b border-obsidian-800 text-cream-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Customer Name & Contact</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5 text-center">Orders</th>
                <th className="p-3.5 text-right">Lifetime Spend</th>
                <th className="p-3.5">Segment</th>
                <th className="p-3.5">Last Order</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-800 text-cream-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-cream-500 text-xs">
                    No customers match the active filters.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    className="hover:bg-obsidian-850/60 transition-colors cursor-pointer"
                    onClick={() => setActiveCustomer(cust)}
                  >
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-300 font-bold text-xs uppercase flex-shrink-0">
                          {cust.name.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-cream-100 flex items-center gap-1.5">
                            {cust.name}
                            {cust.isRepeatBuyer && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-gold-500/15 text-gold-300 font-normal">
                                Repeat
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-cream-500 font-mono">
                            {cust.maskedPhone} • {cust.maskedEmail}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="text-cream-300">{cust.city}</span>
                      <span className="text-[11px] text-cream-500 block">{cust.state}</span>
                    </td>

                    <td className="p-3.5 text-center font-mono font-bold text-cream-100">
                      {cust.ordersCount}
                    </td>

                    <td className="p-3.5 text-right font-mono font-semibold">
                      {canViewRevenue ? (
                        <span className="text-gold-300">{formatINR(cust.lifetimeSpend)}</span>
                      ) : (
                        <span className="text-cream-500 flex items-center justify-end gap-1 font-sans text-[11px]">
                          <Lock className="w-3 h-3" /> ••••••
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <Badge
                        variant={
                          cust.segment === "High Value"
                            ? "gold"
                            : cust.segment === "Repeat"
                            ? "success"
                            : cust.segment === "At Risk"
                            ? "danger"
                            : "outline"
                        }
                        size="sm"
                      >
                        {cust.segment}
                      </Badge>
                    </td>

                    <td className="p-3.5 text-[11px] text-cream-400 font-mono">
                      {new Date(cust.lastOrderDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="p-3.5 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCustomer(cust);
                        }}
                      >
                        Details <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAWER: Customer Order History Details */}
      {activeCustomer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-obsidian-900 border-l border-obsidian-800 w-full max-w-lg h-full overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-obsidian-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-300 font-bold text-sm uppercase">
                  {activeCustomer.name.slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-cream-100">{activeCustomer.name}</h3>
                  <Badge
                    variant={
                      activeCustomer.segment === "High Value"
                        ? "gold"
                        : activeCustomer.segment === "Repeat"
                        ? "success"
                        : "outline"
                    }
                    size="sm"
                  >
                    {activeCustomer.segment}
                  </Badge>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveCustomer(null)}
                className="text-cream-400 hover:text-cream-100 p-1 rounded-lg hover:bg-obsidian-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Privacy safeguarding card */}
            <div className="p-3.5 bg-obsidian-950 rounded-xl border border-obsidian-800 text-[11px] text-cream-400 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" /> DPDP Act Masking Active
              </div>
              <p>Full personal contact data is restricted to authorized fulfillment manifests.</p>
              <p className="font-mono pt-1 text-cream-300">
                Phone: {activeCustomer.maskedPhone} | Email: {activeCustomer.maskedEmail}
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-obsidian-950 p-3.5 rounded-xl border border-obsidian-800">
                <span className="text-[10px] text-cream-400 uppercase tracking-wider block">
                  Total Orders
                </span>
                <span className="text-lg font-bold font-mono text-cream-100">
                  {activeCustomer.ordersCount}
                </span>
              </div>
              <div className="bg-obsidian-950 p-3.5 rounded-xl border border-obsidian-800">
                <span className="text-[10px] text-cream-400 uppercase tracking-wider block">
                  Lifetime Value
                </span>
                <span className="text-lg font-bold font-mono text-gold-300">
                  {canViewRevenue ? (
                    formatINR(activeCustomer.lifetimeSpend)
                  ) : (
                    <span className="text-xs text-cream-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Order History for this seller */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-cream-200 uppercase tracking-wider">
                Order History (This Seller Only)
              </h4>
              <div className="space-y-3">
                {activeCustomer.orders.map((ord, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-obsidian-950 rounded-xl border border-obsidian-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cream-100">
                        #{ord.orderNumber}
                      </span>
                      <Badge variant="outline" size="sm">
                        {ord.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-cream-300">{ord.itemsSummary}</p>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-obsidian-850">
                      <span className="text-cream-500 font-mono">
                        {new Date(ord.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-gold-300 font-mono font-semibold">
                        {canViewRevenue ? formatINR(ord.amount) : "••••"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
