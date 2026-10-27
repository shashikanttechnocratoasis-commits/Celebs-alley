"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Boxes,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  AlertTriangle,
  History,
  Download,
  Upload,
  ArrowRightLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Check,
  X,
  FileText,
  AlertCircle,
  Plus,
  Minus,
} from "lucide-react";
import { useAppStore } from "@/store";
import { usePermission } from "@/lib/rbac";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { showToast } from "@/components/ui/Toast";
import type { InventoryItem, InventoryMovement, Product } from "@/types";

export default function SellerInventoryPage() {
  const {
    currentUser,
    inventory,
    products,
    warehouses,
    inventoryMovements,
    stockIn,
    stockOut,
    adjustStock,
    markDamaged,
    transferStock,
  } = useAppStore();

  const { canInventoryEdit } = usePermission();

  const sellerId = currentUser?.sellerId || "seller-1";

  // Active view tab: "stock" or "movements"
  const [activeTab, setActiveTab] = useState<"stock" | "movements">("stock");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [expiringSoonOnly, setExpiringSoonOnly] = useState(false);
  const [movementTypeFilter, setMovementTypeFilter] = useState("all");

  // Modals state
  const [stockInModalItem, setStockInModalItem] = useState<{ id: string; name: string; sku: string } | null>(null);
  const [stockInQty, setStockInQty] = useState(25);
  const [stockInBatch, setStockInBatch] = useState("BCH-2026-X1");
  const [stockInExpiry, setStockInExpiry] = useState("2027-10-15");
  const [stockInSupplier, setStockInSupplier] = useState("Direct Lab Inbound");

  const [stockOutModalItem, setStockOutModalItem] = useState<{ id: string; name: string; current: number } | null>(null);
  const [stockOutQty, setStockOutQty] = useState(5);
  const [stockOutReason, setStockOutReason] = useState("Sample / Tester allocation");

  const [adjustModalItem, setAdjustModalItem] = useState<{ id: string; name: string; current: number } | null>(null);
  const [adjustNewStock, setAdjustNewStock] = useState(0);
  const [adjustReason, setAdjustReason] = useState("Quarterly physical audit count correction");

  const [damagedModalItem, setDamagedModalItem] = useState<{ id: string; name: string; current: number } | null>(null);
  const [damagedQty, setDamagedQty] = useState(2);
  const [damagedReason, setDamagedReason] = useState("Transit bottle seal breakage");

  const [transferModalItem, setTransferModalItem] = useState<{ id: string; name: string; current: number } | null>(null);
  const [transferQty, setTransferQty] = useState(10);
  const [transferFromWh, setTransferFromWh] = useState(warehouses[0]?.id || "wh-1");
  const [transferToWh, setTransferToWh] = useState(warehouses[1]?.id || "wh-2");

  // Bulk CSV Paste Modal
  const [bulkImportModalOpen, setBulkImportModalOpen] = useState(false);
  const [pastedCsvText, setPastedCsvText] = useState("");
  const [parsedPreview, setParsedPreview] = useState<Array<{ sku: string; qty: number; status: "valid" | "invalid"; msg?: string; item?: InventoryItem }> | null>(null);

  // Seller warehouses
  const sellerWarehouses = useMemo(() => {
    return warehouses.filter((w) => w.sellerId === sellerId);
  }, [warehouses, sellerId]);

  // Seller inventory items
  const sellerStockList = useMemo(() => {
    return inventory
      .filter((inv) => inv.sellerId === sellerId)
      .map((inv) => {
        const prod = products.find((p) => p.id === inv.productId);
        const wh = warehouses.find((w) => w.id === inv.warehouseId) || sellerWarehouses[0];
        const available = Math.max(0, inv.stock - (inv.reserved || 0));
        const threshold = inv.lowStockThreshold || 5;

        let status: "Healthy" | "Low" | "Out" = "Healthy";
        if (available === 0) status = "Out";
        else if (available <= threshold) status = "Low";

        // Check if expiring within 60 days
        let isExpiringSoon = false;
        if (inv.expiryDate) {
          const exp = new Date(inv.expiryDate);
          const now = new Date("2026-10-10");
          const diffDays = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          isExpiringSoon = diffDays > 0 && diffDays <= 60;
        }

        return {
          ...inv,
          name: prod?.name || `SKU ${inv.sku}`,
          image: prod?.images?.[0] || "",
          available,
          threshold,
          status,
          warehouseName: wh?.name || "Main Hub",
          warehouseCode: wh?.code || "BHW-01",
          isExpiringSoon,
        };
      });
  }, [inventory, sellerId, products, warehouses, sellerWarehouses]);

  // Filtered stock list
  const filteredStock = useMemo(() => {
    return sellerStockList.filter((it) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!it.name.toLowerCase().includes(q) && !it.sku.toLowerCase().includes(q)) return false;
      }
      if (selectedWarehouse !== "all" && it.warehouseCode !== selectedWarehouse) return false;
      if (selectedStatus !== "all" && it.status !== selectedStatus) return false;
      if (expiringSoonOnly && !it.isExpiringSoon) return false;
      return true;
    });
  }, [sellerStockList, searchQuery, selectedWarehouse, selectedStatus, expiringSoonOnly]);

  // Seller Movements (syncs customer reserve/deduct/release events from Phase 4)
  const sellerMovements = useMemo(() => {
    return inventoryMovements.filter((mov) => {
      if (mov.sellerId !== sellerId) return false;
      if (movementTypeFilter !== "all" && mov.type !== movementTypeFilter) return false;
      return true;
    });
  }, [inventoryMovements, sellerId, movementTypeFilter]);

  // Handlers for Inventory Actions
  const handleConfirmStockIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockInModalItem || stockInQty <= 0) return;
    stockIn(stockInModalItem.id, stockInQty, stockInBatch, stockInExpiry, stockInSupplier);
    showToast.success(`Added ${stockInQty} units to ${stockInModalItem.name} (Batch: ${stockInBatch})`);
    setStockInModalItem(null);
  };

  const handleConfirmStockOut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockOutModalItem || stockOutQty <= 0) return;
    if (stockOutQty > stockOutModalItem.current) {
      showToast.error("Stock out cannot exceed current stock count.");
      return;
    }
    stockOut(stockOutModalItem.id, stockOutQty, stockOutReason);
    showToast.info(`Deducted ${stockOutQty} units from ${stockOutModalItem.name}`);
    setStockOutModalItem(null);
  };

  const handleConfirmAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalItem || adjustNewStock < 0) return;
    if (!adjustReason || adjustReason.trim().length < 5) {
      showToast.error("Please provide a valid adjustment explanation (minimum 5 characters).");
      return;
    }
    adjustStock(adjustModalItem.id, adjustNewStock, adjustReason);
    showToast.success(`Stock adjusted to ${adjustNewStock} units for ${adjustModalItem.name}`);
    setAdjustModalItem(null);
  };

  const handleConfirmDamaged = (e: React.FormEvent) => {
    e.preventDefault();
    if (!damagedModalItem || damagedQty <= 0) return;
    if (damagedQty > damagedModalItem.current) {
      showToast.error("Damaged quantity cannot exceed current physical stock.");
      return;
    }
    markDamaged(damagedModalItem.id, damagedQty, damagedReason);
    showToast.warning(`Marked ${damagedQty} units as damaged.`);
    setDamagedModalItem(null);
  };

  const handleConfirmTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferModalItem || transferQty <= 0) return;
    if (transferFromWh === transferToWh) {
      showToast.error("Source and destination warehouses cannot be the same.");
      return;
    }
    transferStock(transferModalItem.id, transferFromWh, transferToWh, transferQty);
    showToast.success(`Transferred ${transferQty} units between warehouses.`);
    setTransferModalItem(null);
  };

  // Bulk CSV Parse Preview
  const handleValidateCsv = () => {
    if (!pastedCsvText.trim()) return;
    const lines = pastedCsvText.trim().split("\n");
    const preview: Array<{ sku: string; qty: number; status: "valid" | "invalid"; msg?: string; item?: InventoryItem }> = [];

    lines.forEach((line) => {
      const parts = line.split(",").map((s) => s.trim().replace(/"/g, ""));
      if (parts.length < 2) return;
      const sku = parts[0];
      const qty = parseInt(parts[1], 10);

      const matchedItem = sellerStockList.find((it) => it.sku.toLowerCase() === sku.toLowerCase());

      if (!matchedItem) {
        preview.push({ sku, qty: isNaN(qty) ? 0 : qty, status: "invalid", msg: "SKU not found in catalog" });
      } else if (isNaN(qty) || qty < 0) {
        preview.push({ sku, qty: 0, status: "invalid", msg: "Invalid quantity (must be positive integer)" });
      } else {
        preview.push({ sku, qty, status: "valid", item: matchedItem as any });
      }
    });

    setParsedPreview(preview);
  };

  const handleApplyBulkImport = () => {
    if (!parsedPreview) return;
    const validRows = parsedPreview.filter((r) => r.status === "valid" && r.item);
    validRows.forEach((r) => {
      adjustStock(r.item!.id, r.qty, "Bulk CSV inventory import sync");
    });
    showToast.success(`Successfully imported stock updates for ${validRows.length} SKUs.`);
    setBulkImportModalOpen(false);
    setPastedCsvText("");
    setParsedPreview(null);
  };

  // Export Movements CSV
  const handleExportMovementsCsv = () => {
    const headers = "Timestamp,SKU,Movement Type,Quantity,Order Ref,Reason\n";
    const rows = sellerMovements
      .map((m) => `"${m.timestamp}","${m.productId}","${m.type}",${m.quantity},"${m.orderId || "N/A"}","${m.reason}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inventory_movements_${sellerId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast.success("Movements CSV downloaded.");
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-widest text-[#E8C77A] font-medium">
              Multi-Warehouse Stock Ledger
            </span>
            <Badge variant="gold" size="sm">
              {sellerStockList.length} Monitored Items
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5EDE0]">
            Inventory & Batch Tracking
          </h1>
          <p className="text-xs text-[#A89A85] mt-1">
            Physical stock counts, customer reservations, cold-chain expiry windows, and movement logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canInventoryEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkImportModalOpen(true)}
              leftIcon={<Upload className="w-4 h-4 text-[#E8C77A]" />}
            >
              Bulk CSV Import
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportMovementsCsv}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Log CSV
          </Button>
        </div>
      </div>

      {/* Tabs Switcher: Stock Table vs Movements Log */}
      <div className="flex items-center gap-2 border-b border-[#C99A45]/20 pb-1">
        <button
          onClick={() => setActiveTab("stock")}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-xs font-semibold transition-all ${
            activeTab === "stock"
              ? "bg-[#1A130B] border-t border-x border-[#C99A45]/30 text-[#E8C77A]"
              : "text-[#A89A85] hover:text-[#F5EDE0]"
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Warehouse Stock Balances</span>
        </button>

        <button
          onClick={() => setActiveTab("movements")}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-xs font-semibold transition-all ${
            activeTab === "movements"
              ? "bg-[#1A130B] border-t border-x border-[#C99A45]/30 text-[#E8C77A]"
              : "text-[#A89A85] hover:text-[#F5EDE0]"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Movement Audit Trail ({sellerMovements.length})</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: STOCK BALANCES                                        */}
      {/* ============================================================ */}
      {activeTab === "stock" && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="p-4 rounded-2xl bg-[#1A130B] border border-[#C99A45]/20 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#A89A85] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by SKU or formulation title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
              />
            </div>

            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
            >
              <option value="all">All Warehouses</option>
              {sellerWarehouses.map((w) => (
                <option key={w.id} value={w.code}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
            >
              <option value="all">All Health Statuses</option>
              <option value="Healthy">Healthy Stock</option>
              <option value="Low">Low Stock Alert</option>
              <option value="Out">Out of Stock</option>
            </select>

            <button
              onClick={() => setExpiringSoonOnly(!expiringSoonOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                expiringSoonOnly
                  ? "bg-[#D4604F]/20 border-[#D4604F] text-[#D4604F]"
                  : "bg-[#0B0907] border-[#C99A45]/30 text-[#A89A85] hover:text-[#F5EDE0]"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Expiring in 60 Days</span>
            </button>
          </div>

          {/* Stock Table */}
          <div className="rounded-3xl bg-[#1A130B] border border-[#C99A45]/20 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#C99A45]/15 bg-[#120D08] text-[#A89A85]">
                  <tr>
                    <th className="py-3 px-3.5">SKU & Item</th>
                    <th className="py-3 px-3.5">Physical Stock</th>
                    <th className="py-3 px-3.5">Reserved</th>
                    <th className="py-3 px-3.5">Available to Sell</th>
                    <th className="py-3 px-3.5">Threshold</th>
                    <th className="py-3 px-3.5">Health</th>
                    <th className="py-3 px-3.5">Warehouse</th>
                    <th className="py-3 px-3.5">Batch / Expiry</th>
                    <th className="py-3 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C99A45]/10">
                  {filteredStock.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-[#A89A85]">
                        No matching inventory items found.
                      </td>
                    </tr>
                  ) : (
                    filteredStock.map((it) => (
                      <tr key={it.id} className="hover:bg-[#241A0F]/50 transition-colors">
                        <td className="py-3 px-3.5 font-medium text-[#F5EDE0]">
                          <div className="font-semibold truncate max-w-[200px]">{it.name}</div>
                          <span className="text-[10px] text-[#A89A85] font-mono">
                            {it.sku}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 font-mono text-[#F5EDE0]">{it.stock}</td>
                        <td className="py-3 px-3.5 font-mono text-[#E0A93B]">
                          {it.reserved || 0}
                        </td>
                        <td className="py-3 px-3.5 font-mono font-bold text-[#E8C77A]">
                          {it.available}
                        </td>
                        <td className="py-3 px-3.5 font-mono text-[#A89A85]">
                          {it.threshold}
                        </td>
                        <td className="py-3 px-3.5">
                          <Badge
                            variant={
                              it.status === "Out"
                                ? "danger"
                                : it.status === "Low"
                                ? "warning"
                                : "success"
                            }
                            size="sm"
                          >
                            {it.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-3.5 font-mono text-[#A89A85]">
                          {it.warehouseCode}
                        </td>
                        <td className="py-3 px-3.5 text-[11px] font-mono">
                          {it.batchNumber ? (
                            <div>
                              <span className="text-[#F5EDE0]">{it.batchNumber}</span>
                              <span className={`block text-[10px] ${it.isExpiringSoon ? "text-[#D4604F] font-bold" : "text-[#A89A85]"}`}>
                                Exp: {it.expiryDate || "2027-10"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#6F6354]">Standard</span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          {canInventoryEdit ? (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setStockInModalItem({
                                    id: it.id,
                                    name: it.name,
                                    sku: it.sku,
                                  })
                                }
                                className="h-7 px-2 text-[11px] border-[#5FAF7A]/40 text-[#5FAF7A] hover:bg-[#5FAF7A]/20"
                                title="Stock In"
                              >
                                + In
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setStockOutModalItem({
                                    id: it.id,
                                    name: it.name,
                                    current: it.stock,
                                  })
                                }
                                className="h-7 px-2 text-[11px] border-[#E0A93B]/40 text-[#E0A93B] hover:bg-[#E0A93B]/20"
                                title="Stock Out"
                              >
                                − Out
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setAdjustModalItem({
                                    id: it.id,
                                    name: it.name,
                                    current: it.stock,
                                  });
                                  setAdjustNewStock(it.stock);
                                }}
                                className="h-7 px-2 text-[11px]"
                                title="Audit Adjustment"
                              >
                                Adjust
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setTransferModalItem({
                                    id: it.id,
                                    name: it.name,
                                    current: it.stock,
                                  })
                                }
                                className="h-7 px-2 text-[11px]"
                                title="Warehouse Transfer"
                              >
                                <ArrowRightLeft className="w-3 h-3" />
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setDamagedModalItem({
                                    id: it.id,
                                    name: it.name,
                                    current: it.stock,
                                  })
                                }
                                className="h-7 px-2 text-[11px] border-[#D4604F]/40 text-[#D4604F] hover:bg-[#D4604F]/20"
                                title="Mark Damaged"
                              >
                                Damaged
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#A89A85]">View Only</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: MOVEMENTS HISTORY LOG                                 */}
      {/* ============================================================ */}
      {activeTab === "movements" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#1A130B] border border-[#C99A45]/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#A89A85]">Filter Movement Type:</span>
              <select
                value={movementTypeFilter}
                onChange={(e) => setMovementTypeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
              >
                <option value="all">All Movements</option>
                <option value="reserve">Checkout Reserve</option>
                <option value="deduct">Order Deduct / Fulfilled</option>
                <option value="release">Expired / Cancel Release</option>
                <option value="in">Manual Stock In</option>
                <option value="out">Manual Stock Out</option>
                <option value="adjustment">Physical Audit Adjustment</option>
                <option value="damaged">Damaged Goods</option>
                <option value="transfer">Warehouse Transfer</option>
              </select>
            </div>

            <span className="text-[#A89A85]">
              Showing {sellerMovements.length} logged events
            </span>
          </div>

          <div className="rounded-3xl bg-[#1A130B] border border-[#C99A45]/20 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#C99A45]/15 bg-[#120D08] text-[#A89A85]">
                  <tr>
                    <th className="py-3 px-3.5">Timestamp</th>
                    <th className="py-3 px-3.5">Product / SKU</th>
                    <th className="py-3 px-3.5">Movement Type</th>
                    <th className="py-3 px-3.5">Quantity</th>
                    <th className="py-3 px-3.5">Order Ref</th>
                    <th className="py-3 px-3.5">Audit Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C99A45]/10">
                  {sellerMovements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#A89A85]">
                        No stock movement events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    sellerMovements.map((mov) => {
                      const prod = products.find((p) => p.id === mov.productId);
                      const isAddition = mov.type === "in" || mov.type === "release";
                      const isReduction = mov.type === "deduct" || mov.type === "out" || mov.type === "damaged";

                      return (
                        <tr key={mov.id} className="hover:bg-[#241A0F]/50 transition-colors">
                          <td className="py-3 px-3.5 font-mono text-[#A89A85] whitespace-nowrap">
                            {new Date(mov.timestamp).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3 px-3.5 font-medium text-[#F5EDE0] truncate max-w-[200px]">
                            {prod?.name || mov.productId}
                          </td>
                          <td className="py-3 px-3.5">
                            <Badge
                              variant={
                                mov.type === "reserve"
                                  ? "gold"
                                  : mov.type === "deduct"
                                  ? "outline"
                                  : mov.type === "in"
                                  ? "success"
                                  : mov.type === "damaged"
                                  ? "danger"
                                  : "outline"
                              }
                              size="sm"
                              className="capitalize"
                            >
                              {mov.type}
                            </Badge>
                          </td>
                          <td className="py-3 px-3.5 font-mono font-bold">
                            <span
                              className={
                                isAddition
                                  ? "text-[#5FAF7A]"
                                  : isReduction
                                  ? "text-[#D4604F]"
                                  : "text-[#E8C77A]"
                              }
                            >
                              {isAddition ? `+${mov.quantity}` : isReduction ? `-${mov.quantity}` : mov.quantity}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 font-mono text-[#E8C77A]">
                            {mov.orderId ? (
                              <Link href={`/seller/orders`} className="hover:underline">
                                {mov.orderId}
                              </Link>
                            ) : (
                              <span className="text-[#6F6354]">Internal</span>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-[#A89A85] max-w-sm truncate">
                            {mov.reason}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: STOCK IN                                              */}
      {/* ============================================================ */}
      <ResponsiveDialog
        open={Boolean(stockInModalItem)}
        onOpenChange={(open) => !open && setStockInModalItem(null)}
        title="Stock Inbound (Replenishment)"
        description={`Record fresh received inventory units for ${stockInModalItem?.name}`}
      >
        <form onSubmit={handleConfirmStockIn} className="space-y-4 py-2 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-[#A89A85]">Quantity to Add *</label>
            <input
              type="number"
              min={1}
              required
              value={stockInQty}
              onChange={(e) => setStockInQty(Number(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-[#A89A85]">Batch Number *</label>
              <input
                type="text"
                required
                value={stockInBatch}
                onChange={(e) => setStockInBatch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-[#A89A85]">Expiry Date *</label>
              <input
                type="date"
                required
                value={stockInExpiry}
                onChange={(e) => setStockInExpiry(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-[#A89A85]">Supplier / Delivery Ref Note</label>
            <input
              type="text"
              value={stockInSupplier}
              onChange={(e) => setStockInSupplier(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setStockInModalItem(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Apply Stock In
            </Button>
          </div>
        </form>
      </ResponsiveDialog>

      {/* ============================================================ */}
      {/* MODAL: STOCK OUT                                             */}
      {/* ============================================================ */}
      <ResponsiveDialog
        open={Boolean(stockOutModalItem)}
        onOpenChange={(open) => !open && setStockOutModalItem(null)}
        title="Stock Outbound Allocation"
        description={`Remove inventory units for ${stockOutModalItem?.name} (Current: ${stockOutModalItem?.current})`}
      >
        <form onSubmit={handleConfirmStockOut} className="space-y-4 py-2 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-[#A89A85]">Quantity to Remove *</label>
            <input
              type="number"
              min={1}
              max={stockOutModalItem?.current}
              required
              value={stockOutQty}
              onChange={(e) => setStockOutQty(Number(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-[#A89A85]">Reason for Stock Out *</label>
            <select
              value={stockOutReason}
              onChange={(e) => setStockOutReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
            >
              <option value="Sample / Tester allocation">Sample / Clinic tester allocation</option>
              <option value="Offline counter transfer">Offline luxury counter dispatch</option>
              <option value="Vendor return (RTV)">Return to brand vendor</option>
              <option value="Expired batch disposal">Expired batch quarantine</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setStockOutModalItem(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" type="submit">
              Confirm Stock Out
            </Button>
          </div>
        </form>
      </ResponsiveDialog>

      {/* ============================================================ */}
      {/* MODAL: ADJUSTMENT                                            */}
      {/* ============================================================ */}
      <ResponsiveDialog
        open={Boolean(adjustModalItem)}
        onOpenChange={(open) => !open && setAdjustModalItem(null)}
        title="Physical Inventory Count Adjustment"
        description={`Audit correction for ${adjustModalItem?.name}`}
      >
        <form onSubmit={handleConfirmAdjustment} className="space-y-4 py-2 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-[#A89A85]">
              Actual Counted Physical Units * (Current: {adjustModalItem?.current})
            </label>
            <input
              type="number"
              min={0}
              required
              value={adjustNewStock}
              onChange={(e) => setAdjustNewStock(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-[#A89A85]">Audit Justification (Required) *</label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Discrepancy discovered during bi-weekly physical cycle count."
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setAdjustModalItem(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Apply Count Correction
            </Button>
          </div>
        </form>
      </ResponsiveDialog>

      {/* ============================================================ */}
      {/* MODAL: MARK DAMAGED                                          */}
      {/* ============================================================ */}
      <ResponsiveDialog
        open={Boolean(damagedModalItem)}
        onOpenChange={(open) => !open && setDamagedModalItem(null)}
        title="Quarantine Damaged Inventory"
        description={`Move damaged/spilled units out of saleable inventory for ${damagedModalItem?.name}`}
      >
        <form onSubmit={handleConfirmDamaged} className="space-y-4 py-2 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-[#A89A85]">Damaged Units *</label>
            <input
              type="number"
              min={1}
              max={damagedModalItem?.current}
              required
              value={damagedQty}
              onChange={(e) => setDamagedQty(Number(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-[#A89A85]">Damage Description</label>
            <input
              type="text"
              value={damagedReason}
              onChange={(e) => setDamagedReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setDamagedModalItem(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" type="submit">
              Mark as Damaged
            </Button>
          </div>
        </form>
      </ResponsiveDialog>

      {/* ============================================================ */}
      {/* MODAL: WAREHOUSE TRANSFER                                    */}
      {/* ============================================================ */}
      <ResponsiveDialog
        open={Boolean(transferModalItem)}
        onOpenChange={(open) => !open && setTransferModalItem(null)}
        title="Inter-Warehouse Transfer"
        description={`Reallocate inventory between regional dispatch points for ${transferModalItem?.name}`}
      >
        <form onSubmit={handleConfirmTransfer} className="space-y-4 py-2 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-[#A89A85]">From Warehouse</label>
              <select
                value={transferFromWh}
                onChange={(e) => setTransferFromWh(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
              >
                {sellerWarehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#A89A85]">To Warehouse</label>
              <select
                value={transferToWh}
                onChange={(e) => setTransferToWh(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
              >
                {sellerWarehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-[#A89A85]">Transfer Quantity *</label>
            <input
              type="number"
              min={1}
              max={transferModalItem?.current}
              required
              value={transferQty}
              onChange={(e) => setTransferQty(Number(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none font-mono"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setTransferModalItem(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Transfer Stock
            </Button>
          </div>
        </form>
      </ResponsiveDialog>

      {/* ============================================================ */}
      {/* MODAL: BULK CSV PASTE IMPORT                                 */}
      {/* ============================================================ */}
      <ResponsiveDialog
        open={bulkImportModalOpen}
        onOpenChange={setBulkImportModalOpen}
        title="Bulk Inventory Pasted-CSV Import"
        description="Quickly paste SKU stock numbers from Excel/Google Sheets to sync warehouse balances."
      >
        <div className="space-y-4 py-2 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-[#A89A85]">
              Paste CSV Data (Format: SKU, Stock_Count per line)
            </label>
            <textarea
              rows={6}
              placeholder={`CA-LUX-001-S1, 45\nCA-AUR-002-S1, 60\nCA-VIV-003-S1, 30`}
              value={pastedCsvText}
              onChange={(e) => {
                setPastedCsvText(e.target.value);
                setParsedPreview(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none font-mono"
            />
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleValidateCsv}
              disabled={!pastedCsvText.trim()}
            >
              Validate & Preview Rows
            </Button>

            {parsedPreview && (
              <span className="text-[11px] text-[#A89A85]">
                {parsedPreview.filter((r) => r.status === "valid").length} valid rows / {parsedPreview.length} total
              </span>
            )}
          </div>

          {/* Validated preview table */}
          {parsedPreview && (
            <div className="max-h-48 overflow-y-auto rounded-xl border border-[#C99A45]/20 bg-[#0B0907] p-2 space-y-1.5 font-mono text-[11px]">
              {parsedPreview.map((row, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-1.5 rounded-lg ${
                    row.status === "valid" ? "bg-[#5FAF7A]/10 text-[#5FAF7A]" : "bg-[#D4604F]/10 text-[#D4604F]"
                  }`}
                >
                  <span>{row.sku}</span>
                  <span>{row.qty} Units</span>
                  <span>{row.status === "valid" ? "Ready" : row.msg}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-[#C99A45]/15">
            <Button variant="outline" size="sm" onClick={() => setBulkImportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!parsedPreview || parsedPreview.filter((r) => r.status === "valid").length === 0}
              onClick={handleApplyBulkImport}
            >
              Apply Valid Updates
            </Button>
          </div>
        </div>
      </ResponsiveDialog>
    </div>
  );
}
