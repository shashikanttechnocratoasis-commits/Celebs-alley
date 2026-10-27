"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Download,
  Sliders,
  Layers,
  Edit,
  Trash2,
  Copy,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  Lock,
  Boxes,
  Check,
  RefreshCw,
  X,
  Percent,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { useAppStore } from "@/store";
import { usePermission } from "@/lib/rbac";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { ImageWithFallback } from "@/components/public/ImageWithFallback";
import { showToast } from "@/components/ui/Toast";
import type { Product, InventoryItem } from "@/types";
import brandsData from "@/data/brands.json";
import categoriesData from "@/data/categories.json";
import ingredientsData from "@/data/ingredients.json";
import sampleScansData from "@/data/sampleScans.json";
import plansData from "@/data/plans.json";

interface ProductRow {
  id: string; // inventory item id
  productId: string;
  name: string;
  sku: string;
  brandName: string;
  categoryName: string;
  mrp: number;
  price: number;
  stock: number;
  reserved: number;
  availableStock: number;
  threshold: number;
  status: "active" | "inactive" | "pending_approval";
  image: string;
  product: Product;
}

export default function SellerProductsPage() {
  const {
    currentUser,
    sellers,
    inventory,
    products,
    parameters,
    warehouses,
    addInventoryOffer,
    updateInventoryOffer,
    deleteInventoryOffer,
    addProduct,
    updateProduct,
    deleteProduct,
    simulateApproveProduct,
    bulkUpdateInventory,
  } = useAppStore();

  const { canProductsEdit } = usePermission();

  const sellerId = currentUser?.sellerId || "seller-1";
  const currentSeller = sellers.find((s) => s.id === sellerId) || sellers[0];
  const currentPlan = (plansData as any[]).find(
    (p) => p.id === (currentSeller?.planId || "plan-starter")
  ) || plansData[1];

  // TanStack table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Filter UI states
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedStockLevel, setSelectedStockLevel] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

  // Selected row for side preview (Desktop / Tablet)
  const [previewRow, setPreviewRow] = useState<ProductRow | null>(null);

  // Modals
  const [listExistingModalOpen, setListExistingModalOpen] = useState(false);
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingOffer, setEditingOffer] = useState<InventoryItem | null>(null);
  const [bulkPriceModalOpen, setBulkPriceModalOpen] = useState(false);
  const [bulkPriceType, setBulkPriceType] = useState<"percent" | "fixed">("percent");
  const [bulkPriceValue, setBulkPriceValue] = useState<number>(5);
  const [bulkStockModalOpen, setBulkStockModalOpen] = useState(false);
  const [bulkStockValue, setBulkStockValue] = useState<number>(30);
  const [upgradePlanModalOpen, setUpgradePlanModalOpen] = useState(false);

  // Catalog linking modal state
  const [catalogSearch, setCatalogSearch] = useState("");
  const [selectedCatalogProduct, setSelectedCatalogProduct] = useState<Product | null>(null);
  const [offerPrice, setOfferPrice] = useState<number>(0);
  const [offerStock, setOfferStock] = useState<number>(25);
  const [offerThreshold, setOfferThreshold] = useState<number>(5);
  const [offerSku, setOfferSku] = useState("");

  // Add/Edit product form state
  const [formSection, setFormSection] = useState<"basic" | "commerce" | "inventory" | "images" | "ai" | "suitable" | "compliance">("basic");
  const [formName, setFormName] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formBrandId, setFormBrandId] = useState(brandsData[0]?.id || "brand-1");
  const [formCategoryId, setFormCategoryId] = useState(categoriesData[0]?.id || "cat-1");
  const [formDesc, setFormDesc] = useState("");
  const [formMrp, setFormMrp] = useState(2950);
  const [formPrice, setFormPrice] = useState(2650);
  const [formGstRate, setFormGstRate] = useState(0.18);
  const [formHsn, setFormHsn] = useState("33049910");
  const [formStock, setFormStock] = useState(30);
  const [formThreshold, setFormThreshold] = useState(5);
  const [formWarehouseId, setFormWarehouseId] = useState(warehouses[0]?.id || "wh-1");
  const [formTargetParams, setFormTargetParams] = useState<Record<string, number>>({});
  const [formSuitableSkinTypes, setFormSuitableSkinTypes] = useState<string[]>(["Dry", "Combination"]);
  const [formConcernTags, setFormConcernTags] = useState<string[]>(["Dehydration", "Redness"]);
  const [formIngredients, setFormIngredients] = useState<string[]>(["Sodium Hyaluronate", "Niacinamide"]);
  const [formUsage, setFormUsage] = useState("Apply 3 to 4 drops onto cleansed skin morning and evening before creams.");
  const [formWarnings, setFormWarnings] = useState("Patch test recommended. For topical dermatological use only.");

  // Transform seller inventory + products into table rows
  const tableData: ProductRow[] = useMemo(() => {
    return inventory
      .filter((inv) => inv.sellerId === sellerId)
      .map((inv) => {
        const prod = products.find((p) => p.id === inv.productId) || {
          id: inv.productId,
          name: `Catalog SKU ${inv.sku}`,
          sku: inv.sku,
          brandId: "brand-1",
          categoryId: "cat-1",
          description: "Cosmeceutical formulation",
          images: [],
          mrp: inv.mrp,
          ingredients: [],
          targetParameters: {},
          suitableSkinTypes: [],
          concernTags: [],
          contraindications: [],
          usage: "Apply daily",
          rating: 4.8,
          reviewCount: 12,
          status: "active" as const,
        };

        const brand = brandsData.find((b: any) => b.id === prod.brandId);
        const cat = categoriesData.find((c: any) => c.id === prod.categoryId);
        const availableStock = Math.max(0, inv.stock - (inv.reserved || 0));

        let status: "active" | "inactive" | "pending_approval" = "active";
        if (prod.status === "pending_approval") status = "pending_approval";
        else if (inv.status === "inactive") status = "inactive";

        return {
          id: inv.id,
          productId: prod.id,
          name: prod.name,
          sku: inv.sku || prod.sku,
          brandName: brand?.name || "Celebs Derma",
          categoryName: cat?.name || prod.routineStep || "Treatment",
          mrp: inv.mrp || prod.mrp,
          price: inv.price,
          stock: inv.stock,
          reserved: inv.reserved || 0,
          availableStock,
          threshold: inv.lowStockThreshold || 5,
          status,
          image: prod.images?.[0] || "",
          product: prod,
        };
      });
  }, [inventory, products, sellerId]);

  // Filtered rows based on category/brand/stock/status
  const filteredData = useMemo(() => {
    return tableData.filter((row) => {
      if (selectedCategory !== "all" && row.categoryName !== selectedCategory) return false;
      if (selectedBrand !== "all" && row.brandName !== selectedBrand) return false;
      if (selectedStatusFilter !== "all" && row.status !== selectedStatusFilter) return false;
      if (selectedStockLevel === "low" && row.availableStock > row.threshold) return false;
      if (selectedStockLevel === "out" && row.availableStock > 0) return false;
      if (selectedStockLevel === "in_stock" && row.availableStock === 0) return false;
      return true;
    });
  }, [tableData, selectedCategory, selectedBrand, selectedStatusFilter, selectedStockLevel]);

  // Column Helper
  const columnHelper = createColumnHelper<ProductRow>();

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="w-4 h-4 rounded accent-[#E8C77A] cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            className="w-4 h-4 rounded accent-[#E8C77A] cursor-pointer"
          />
        ),
      }),
      columnHelper.accessor("name", {
        header: "Product Details",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#0B0907] border border-[#C99A45]/20 flex-shrink-0">
                <ImageWithFallback
                  src={row.image}
                  alt={row.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 max-w-[220px]">
                <p className="font-medium text-xs text-[#F5EDE0] truncate hover:text-[#E8C77A] transition-colors cursor-pointer" onClick={() => setPreviewRow(row)}>
                  {row.name}
                </p>
                <span className="text-[10px] text-[#A89A85] font-mono">
                  SKU: {row.sku}
                </span>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("brandName", {
        header: "Brand",
        cell: (info) => <span className="text-xs text-[#A89A85]">{info.getValue()}</span>,
      }),
      columnHelper.accessor("categoryName", {
        header: "Category",
        cell: (info) => <span className="text-xs text-[#A89A85]">{info.getValue()}</span>,
      }),
      columnHelper.accessor("price", {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:text-[#E8C77A]"
          >
            Price
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: (info) => {
          const row = info.row.original;
          const discountPct = Math.round(((row.mrp - row.price) / row.mrp) * 100);
          return (
            <div>
              <span className="text-xs font-mono font-bold text-[#E8C77A]">
                ₹{info.getValue().toLocaleString("en-IN")}
              </span>
              {discountPct > 0 && (
                <span className="text-[10px] text-[#5FAF7A] ml-1.5 font-mono">
                  (-{discountPct}%)
                </span>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("stock", {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:text-[#E8C77A]"
          >
            Available Stock
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: (info) => {
          const row = info.row.original;
          const isLow = row.availableStock <= row.threshold;
          const isOut = row.availableStock === 0;
          return (
            <div>
              <Badge
                variant={isOut ? "danger" : isLow ? "warning" : "outline"}
                size="sm"
              >
                {row.availableStock} Units
              </Badge>
              {row.reserved > 0 && (
                <span className="text-[10px] text-[#A89A85] block mt-0.5">
                  ({row.reserved} reserved)
                </span>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: "Listing Status",
        cell: (info) => {
          const status = info.getValue();
          if (status === "pending_approval") {
            return (
              <Badge variant="gold" size="sm" className="bg-[#E0A93B]/20 text-[#E0A93B]">
                Pending Approval
              </Badge>
            );
          }
          if (status === "inactive") {
            return (
              <Badge variant="outline" size="sm">
                Deactivated
              </Badge>
            );
          }
          return (
            <Badge variant="success" size="sm">
              Live & Active
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-1.5">
              {item.status === "pending_approval" && (
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => {
                    simulateApproveProduct(item.productId);
                    showToast.success(`Approved product "${item.name}" live!`);
                  }}
                  className="text-[10px] h-7 px-2"
                >
                  Simulate Approve
                </Button>
              )}

              <button
                type="button"
                onClick={() => handleOpenEdit(item)}
                className="p-1.5 rounded-lg text-[#A89A85] hover:text-[#E8C77A] hover:bg-[#241A0F] transition-colors"
                title="Edit Product Offer"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleToggleOfferActive(item)}
                className={`p-1.5 rounded-lg transition-colors ${
                  item.status === "inactive"
                    ? "text-[#5FAF7A] hover:bg-[#5FAF7A]/20"
                    : "text-[#A89A85] hover:text-[#D4604F] hover:bg-[#241A0F]"
                }`}
                title={item.status === "inactive" ? "Activate Offer" : "Deactivate Offer"}
              >
                {item.status === "inactive" ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleDuplicateOffer(item)}
                className="p-1.5 rounded-lg text-[#A89A85] hover:text-[#E8C77A] hover:bg-[#241A0F] transition-colors"
                title="Duplicate SKU"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleDeleteOffer(item)}
                className="p-1.5 rounded-lg text-[#A89A85] hover:text-[#D4604F] hover:bg-[#241A0F] transition-colors"
                title="Delete Listing"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        },
      }),
    ],
    [columnHelper]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Check Plan Limit Before Listing
  const checkPlanLimitAndOpen = (type: "catalog" | "new") => {
    if (tableData.length >= currentPlan.limits.maxProducts) {
      setUpgradePlanModalOpen(true);
      return;
    }
    if (type === "catalog") {
      setListExistingModalOpen(true);
    } else {
      handleOpenCreateNew();
    }
  };

  // Open Edit Dialog
  const handleOpenEdit = (row: ProductRow) => {
    const rawProd = row.product;
    const inv = inventory.find((i) => i.id === row.id) || null;

    setEditingProduct(rawProd);
    setEditingOffer(inv);
    setFormName(rawProd.name);
    setFormSku(row.sku);
    setFormBrandId(rawProd.brandId);
    setFormCategoryId(rawProd.categoryId);
    setFormDesc(rawProd.description);
    setFormMrp(row.mrp);
    setFormPrice(row.price);
    setFormStock(row.stock);
    setFormThreshold(row.threshold);
    setFormTargetParams(rawProd.targetParameters || {});
    setFormSuitableSkinTypes(rawProd.suitableSkinTypes || ["Dry", "Combination"]);
    setFormConcernTags(rawProd.concernTags || ["Dehydration", "Redness"]);
    setFormIngredients(rawProd.ingredients || ["Sodium Hyaluronate"]);
    setFormUsage(rawProd.usage || "Apply daily");
    setFormSection("basic");
    setAddEditModalOpen(true);
  };

  // Open Create New Dialog
  const handleOpenCreateNew = () => {
    setEditingProduct(null);
    setEditingOffer(null);
    setFormName("");
    setFormSku(`CA-SKU-${Math.floor(100 + Math.random() * 900)}`);
    setFormBrandId(brandsData[0]?.id || "brand-1");
    setFormCategoryId(categoriesData[0]?.id || "cat-1");
    setFormDesc("");
    setFormMrp(3200);
    setFormPrice(2850);
    setFormStock(25);
    setFormThreshold(5);
    setFormWarehouseId(warehouses[0]?.id || "wh-1");
    // Default active parameter values
    const initParams: Record<string, number> = {};
    parameters.filter((p) => p.status === "active").forEach((p) => {
      initParams[p.id] = 1;
    });
    setFormTargetParams(initParams);
    setFormSuitableSkinTypes(["All skin types", "Dry"]);
    setFormConcernTags(["Dehydration", "Texture"]);
    setFormIngredients(["Sodium Hyaluronate", "Niacinamide"]);
    setFormUsage("Apply evenly to cleansed face and neck morning and evening.");
    setFormWarnings("For external use only. Discontinue if persistent irritation occurs.");
    setFormSection("basic");
    setAddEditModalOpen(true);
  };

  // Save Add/Edit
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (formPrice > formMrp) {
      showToast.error("Selling price cannot exceed MRP.");
      return;
    }

    if (editingProduct && editingOffer) {
      // Update existing offer & product
      updateInventoryOffer(editingOffer.id, {
        price: formPrice,
        mrp: formMrp,
        stock: formStock,
        lowStockThreshold: formThreshold,
        sku: formSku,
      });
      updateProduct(editingProduct.id, {
        name: formName,
        brandId: formBrandId,
        categoryId: formCategoryId,
        description: formDesc,
        targetParameters: formTargetParams,
        suitableSkinTypes: formSuitableSkinTypes,
        concernTags: formConcernTags,
        ingredients: formIngredients,
        usage: formUsage,
      });
      showToast.success(`Updated listing for "${formName}".`);
    } else {
      // Create NEW Product with status "pending_approval"
      const newProdId = `prod-${Date.now().toString().slice(-4)}`;
      const newProduct: Product = {
        id: newProdId,
        name: formName,
        sku: formSku,
        brandId: formBrandId,
        categoryId: formCategoryId,
        description: formDesc,
        images: [
          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
        ],
        mrp: formMrp,
        ingredients: formIngredients,
        targetParameters: formTargetParams,
        suitableSkinTypes: formSuitableSkinTypes,
        concernTags: formConcernTags,
        contraindications: [],
        usage: formUsage,
        rating: 5.0,
        reviewCount: 0,
        status: "pending_approval",
        hsn: formHsn,
        taxRate: formGstRate,
      };

      addProduct(newProduct);

      // Create seller inventory offer
      addInventoryOffer({
        productId: newProdId,
        sellerId,
        price: formPrice,
        mrp: formMrp,
        stock: formStock,
        reserved: 0,
        lowStockThreshold: formThreshold,
        sku: formSku,
        warehouseId: formWarehouseId,
        status: "active",
      });

      showToast.success(`Submitted "${formName}" for catalog approval.`);
    }

    setAddEditModalOpen(false);
  };

  // Toggle Offer Active / Inactive
  const handleToggleOfferActive = (row: ProductRow) => {
    const newStatus = row.status === "inactive" ? "active" : "inactive";
    updateInventoryOffer(row.id, { status: newStatus });
    showToast.info(`Offer ${newStatus === "active" ? "activated" : "deactivated"}.`);
  };

  // Duplicate Offer
  const handleDuplicateOffer = (row: ProductRow) => {
    addInventoryOffer({
      productId: row.productId,
      sellerId,
      price: row.price,
      mrp: row.mrp,
      stock: row.stock,
      reserved: 0,
      lowStockThreshold: row.threshold,
      sku: `${row.sku}-COPY`,
      status: "active",
    });
    showToast.success(`Duplicated SKU ${row.sku}.`);
  };

  // Delete Offer
  const handleDeleteOffer = (row: ProductRow) => {
    if (confirm(`Are you sure you want to delete offer for "${row.name}"?`)) {
      deleteInventoryOffer(row.id);
      showToast.info("Offer deleted.");
    }
  };

  // Create offer from existing catalog product
  const handleConfirmCatalogOffer = () => {
    if (!selectedCatalogProduct) return;
    if (offerPrice > selectedCatalogProduct.mrp) {
      showToast.error("Selling price cannot exceed MRP.");
      return;
    }

    addInventoryOffer({
      productId: selectedCatalogProduct.id,
      sellerId,
      price: offerPrice,
      mrp: selectedCatalogProduct.mrp,
      stock: offerStock,
      reserved: 0,
      lowStockThreshold: offerThreshold,
      sku: offerSku || `${selectedCatalogProduct.sku}-${sellerId.slice(-2).toUpperCase()}`,
      status: "active",
    });

    showToast.success(`Created offer for "${selectedCatalogProduct.name}".`);
    setListExistingModalOpen(false);
    setSelectedCatalogProduct(null);
  };

  // Bulk Actions
  const selectedRowIds = Object.keys(rowSelection).filter((k) => rowSelection[k]);

  const handleBulkActivate = () => {
    const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
    bulkUpdateInventory(selectedRows.map((r) => ({ id: r.id, status: "active" })));
    setRowSelection({});
    showToast.success(`Activated ${selectedRows.length} offers.`);
  };

  const handleBulkDeactivate = () => {
    const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
    bulkUpdateInventory(selectedRows.map((r) => ({ id: r.id, status: "inactive" })));
    setRowSelection({});
    showToast.info(`Deactivated ${selectedRows.length} offers.`);
  };

  const handleApplyBulkPrice = () => {
    const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
    const updates = selectedRows.map((r) => {
      let newPrice = r.price;
      if (bulkPriceType === "percent") {
        newPrice = Math.round(r.price * (1 + bulkPriceValue / 100));
      } else {
        newPrice = r.price + bulkPriceValue;
      }
      newPrice = Math.min(newPrice, r.mrp); // Never exceed MRP
      return { id: r.id, price: Math.max(1, newPrice) };
    });

    bulkUpdateInventory(updates);
    setBulkPriceModalOpen(false);
    setRowSelection({});
    showToast.success(`Updated prices for ${selectedRows.length} items.`);
  };

  const handleApplyBulkStock = () => {
    const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
    bulkUpdateInventory(selectedRows.map((r) => ({ id: r.id, stock: bulkStockValue })));
    setBulkStockModalOpen(false);
    setRowSelection({});
    showToast.success(`Set stock to ${bulkStockValue} for ${selectedRows.length} items.`);
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = "SKU,Product Name,Brand,Category,MRP,Selling Price,Stock,Reserved,Available,Status\n";
    const rows = filteredData
      .map(
        (r) =>
          `"${r.sku}","${r.name.replace(/"/g, '""')}","${r.brandName}","${r.categoryName}",${r.mrp},${r.price},${r.stock},${r.reserved},${r.availableStock},${r.status}`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `seller_catalog_${sellerId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast.success("Catalog CSV downloaded.");
  };

  // Live Match Preview Calculation for Section 5 of Add/Edit
  const activeParams = useMemo(
    () => parameters.filter((p) => p.status === "active"),
    [parameters]
  );

  const matchPreviewScores = useMemo(() => {
    return sampleScansData.slice(0, 3).map((scan: any) => {
      let scoreSum = 0;
      let count = 0;
      activeParams.forEach((param) => {
        const userParamScore = scan.parameterScores[param.slug] || 70;
        const mappedLevel = formTargetParams[param.id] ?? 0; // -1 to 3
        // If mapped level is positive, rewards high or low depending on concern
        scoreSum += Math.min(98, 65 + mappedLevel * 10 - Math.round((100 - userParamScore) * 0.1));
        count++;
      });
      const avg = count > 0 ? Math.round(scoreSum / count) : 85;
      return {
        customerName: scan.customerName,
        skinType: scan.skinType,
        score: Math.min(98, Math.max(50, avg)),
      };
    });
  }, [sampleScansData, activeParams, formTargetParams]);

  // Detected Caution Ingredients for Compliance Section
  const detectedCautions = useMemo(() => {
    const flags: string[] = [];
    formIngredients.forEach((ingName) => {
      const match = (ingredientsData as any[]).find((i) => i.name.toLowerCase() === ingName.toLowerCase());
      if (match && match.contraindications && match.contraindications.length > 0) {
        flags.push(`${match.name}: Caution with ${match.contraindications.join(", ")}`);
      }
    });
    return flags;
  }, [formIngredients, ingredientsData]);

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-widest text-[#E8C77A] font-medium">
              Catalog & Listings
            </span>
            <Badge variant="gold" size="sm">
              {tableData.length} / {currentPlan.limits.maxProducts > 9000 ? "∞" : currentPlan.limits.maxProducts} SKUs
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5EDE0]">
            Products & SKU Offers
          </h1>
          <p className="text-xs text-[#A89A85] mt-1">
            Manage authorized marketplace listings, pricing below MRP, batch compliance, and AI diagnostic mapping.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>

          {canProductsEdit && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => checkPlanLimitAndOpen("catalog")}
                leftIcon={<Layers className="w-4 h-4 text-[#E8C77A]" />}
              >
                List Existing SKU
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => checkPlanLimitAndOpen("new")}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Create New Product
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-[#1A130B] border border-[#C99A45]/20 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Global search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A89A85] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by SKU, formulation name, brand..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categoriesData.map((c: any) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
          >
            <option value="all">All Brands</option>
            {brandsData.map((b: any) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Stock Level Filter */}
          <select
            value={selectedStockLevel}
            onChange={(e) => setSelectedStockLevel(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
          >
            <option value="all">All Stock Levels</option>
            <option value="in_stock">In Stock Only</option>
            <option value="low">Low Stock Warning</option>
            <option value="out">Out of Stock</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Live & Active</option>
            <option value="inactive">Deactivated</option>
            <option value="pending_approval">Pending Approval</option>
          </select>
        </div>

        {/* Bulk Action Bar (Visible when rows selected) */}
        {selectedRowIds.length > 0 && canProductsEdit && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="pt-2 border-t border-[#C99A45]/15 flex flex-wrap items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2 text-[#E8C77A] font-semibold">
              <Check className="w-4 h-4" />
              <span>{selectedRowIds.length} items selected</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleBulkActivate}>
                Bulk Activate
              </Button>
              <Button variant="outline" size="sm" onClick={handleBulkDeactivate}>
                Bulk Deactivate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkPriceModalOpen(true)}
              >
                Update Prices
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkStockModalOpen(true)}
              >
                Set Stock
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Layout Split: Table View + Side Preview Drawer */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Products Table (Desktop & Tablet) / Cards (Mobile) */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Mobile Card List (<768px) */}
          <div className="md:hidden space-y-3">
            {table.getRowModel().rows.map((row) => {
              const item = row.original;
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#1A130B] border border-[#C99A45]/20 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#0B0907] border border-[#C99A45]/20 flex-shrink-0">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-[#F5EDE0] truncate">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-[#A89A85]">
                        {item.brandName} • {item.categoryName}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-mono font-bold text-[#E8C77A]">
                          ₹{item.price.toLocaleString("en-IN")}
                        </span>
                        <Badge
                          variant={
                            item.availableStock === 0
                              ? "danger"
                              : item.availableStock <= item.threshold
                              ? "warning"
                              : "outline"
                          }
                          size="sm"
                        >
                          {item.availableStock} in stock
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#C99A45]/15 text-xs">
                    <span className="text-[10px] text-[#A89A85] font-mono">
                      SKU: {item.sku}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(item)}
                        className="text-[11px] h-7 px-2"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewRow(item)}
                        className="text-[11px] h-7 px-2"
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop & Tablet TanStack Table (768px+) */}
          <div className="hidden md:block rounded-3xl bg-[#1A130B] border border-[#C99A45]/20 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#C99A45]/15 bg-[#120D08] text-[#A89A85] select-none">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="py-3 px-3.5 font-semibold">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-[#C99A45]/10">
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="py-12 text-center text-[#A89A85]">
                        No matching product listings found. Use &quot;List Existing SKU&quot; or &quot;Create New Product&quot;.
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className={`hover:bg-[#241A0F]/60 transition-colors ${
                          previewRow?.id === row.original.id ? "bg-[#241A0F]/80" : ""
                        }`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="py-3 px-3.5">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-[#C99A45]/15 flex items-center justify-between text-xs text-[#A89A85]">
              <span>
                Showing {table.getRowModel().rows.length} of {filteredData.length} listings
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <span className="font-mono text-[#F5EDE0]">
                  {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Side Preview Panel (Desktop & Tablet) */}
        {previewRow && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-80 rounded-3xl bg-[#1A130B] border border-[#C99A45]/25 p-5 space-y-4 flex-shrink-0"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#C99A45]/15">
              <span className="text-xs uppercase tracking-wider text-[#A89A85] font-semibold">
                SKU Quick Preview
              </span>
              <button
                onClick={() => setPreviewRow(null)}
                className="p-1 rounded-lg text-[#A89A85] hover:text-[#F5EDE0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full h-44 rounded-2xl overflow-hidden bg-[#0B0907] border border-[#C99A45]/20">
              <ImageWithFallback
                src={previewRow.image}
                alt={previewRow.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <Badge variant="gold" size="sm">
                {previewRow.categoryName}
              </Badge>
              <h3 className="font-serif font-bold text-sm text-[#F5EDE0] leading-snug">
                {previewRow.name}
              </h3>
              <p className="text-[11px] text-[#A89A85] font-mono">
                SKU: {previewRow.sku} • {previewRow.brandName}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#241A0F] border border-[#C99A45]/15 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#A89A85]">Maximum Retail Price:</span>
                <span className="text-[#A89A85] line-through font-mono">₹{previewRow.mrp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F5EDE0]">Selling Offer Price:</span>
                <span className="text-[#E8C77A] font-bold font-mono">₹{previewRow.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A89A85]">Physical Inventory:</span>
                <span className="text-[#F5EDE0] font-mono">{previewRow.stock} Units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A89A85]">Available to Sell:</span>
                <span className="text-[#5FAF7A] font-bold font-mono">{previewRow.availableStock} Units</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#A89A85]">
                Targeted AI Parameters:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(previewRow.product.targetParameters || {}).map((paramId) => {
                  const param = parameters.find((p) => p.id === paramId);
                  const level = previewRow.product.targetParameters[paramId];
                  return (
                    <span
                      key={paramId}
                      className="px-2 py-0.5 rounded-md bg-[#0B0907] border border-[#C99A45]/20 text-[10px] text-[#F5EDE0]"
                    >
                      {param?.name || paramId}: +{level}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => handleOpenEdit(previewRow)}
                leftIcon={<Edit className="w-3.5 h-3.5" />}
              >
                Edit Listing
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL A: LIST EXISTING CATALOG PRODUCT */}
      {/* ============================================================ */}
      <ResponsiveDialog
        open={listExistingModalOpen}
        onOpenChange={setListExistingModalOpen}
        title="List Existing Catalogue Product"
        description="Search master approved beauty formulations to offer regional supply and pricing."
      >
        <div className="space-y-4 py-2">
          {!selectedCatalogProduct ? (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#A89A85] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search catalogue by title or SKU..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {products
                  .filter((p) =>
                    p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                    p.sku.toLowerCase().includes(catalogSearch.toLowerCase())
                  )
                  .map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        setSelectedCatalogProduct(prod);
                        setOfferPrice(Math.round(prod.mrp * 0.92));
                        setOfferSku(`${prod.sku}-${sellerId.slice(-2).toUpperCase()}`);
                      }}
                      className="p-3 rounded-xl bg-[#1A130B] border border-[#C99A45]/20 hover:border-[#E8C77A] cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#0B0907] flex-shrink-0">
                          <ImageWithFallback
                            src={prod.images?.[0] || ""}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-[#F5EDE0] truncate">
                            {prod.name}
                          </h4>
                          <span className="text-[10px] text-[#A89A85] font-mono">
                            MRP: ₹{prod.mrp.toLocaleString("en-IN")} • SKU: {prod.sku}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#A89A85]" />
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#241A0F] border border-[#C99A45]/20 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-[#F5EDE0]">
                    {selectedCatalogProduct.name}
                  </h4>
                  <span className="text-[10px] text-[#A89A85] font-mono">
                    MRP: ₹{selectedCatalogProduct.mrp}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCatalogProduct(null)}
                  className="text-xs"
                >
                  Change Product
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#A89A85]">
                    Your Offer Price (₹) *
                  </label>
                  <input
                    type="number"
                    max={selectedCatalogProduct.mrp}
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                  />
                  <p className="text-[10px] text-[#A89A85]">Must be ≤ MRP (₹{selectedCatalogProduct.mrp})</p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#A89A85]">
                    Initial Available Stock *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={offerStock}
                    onChange={(e) => setOfferStock(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#A89A85]">
                    Seller Custom SKU *
                  </label>
                  <input
                    type="text"
                    value={offerSku}
                    onChange={(e) => setOfferSku(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#A89A85]">
                    Low Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={offerThreshold}
                    onChange={(e) => setOfferThreshold(Number(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setListExistingModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleConfirmCatalogOffer}>
                  Create Offer Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </ResponsiveDialog>

      {/* ============================================================ */}
      {/* MODAL B: ADD / EDIT PRODUCT (Multi-Section with Sticky Nav)  */}
      {/* ============================================================ */}
      <ResponsiveDialog
        open={addEditModalOpen}
        onOpenChange={setAddEditModalOpen}
        title={editingProduct ? "Edit Product & Offer Listing" : "Create New Catalogue Product"}
        description="Comprehensive form covering clinical specs, AI diagnostic mapping, and regulatory compliance."
      >
        <form onSubmit={handleSaveProduct} className="space-y-5 py-2">
          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-1.5 border-b border-[#C99A45]/15 pb-2 overflow-x-auto">
            {[
              { id: "basic", label: "Basic Info" },
              { id: "commerce", label: "Commerce" },
              { id: "inventory", label: "Inventory" },
              { id: "ai", label: "AI Mapping" },
              { id: "suitable", label: "Suitability" },
              { id: "compliance", label: "Compliance" },
            ].map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setFormSection(sec.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  formSection === sec.id
                    ? "bg-[#C99A45] text-[#0B0907] font-semibold"
                    : "text-[#A89A85] hover:text-[#F5EDE0]"
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>

          {/* Section 1: Basic Info */}
          {formSection === "basic" && (
            <div className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#A89A85]">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Celestial 24K Gold Cellular Elixir"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#A89A85]">SKU Identifier *</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#A89A85]">Brand *</label>
                  <select
                    value={formBrandId}
                    onChange={(e) => setFormBrandId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                  >
                    {brandsData.map((b: any) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#A89A85]">Category *</label>
                <select
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                >
                  {categoriesData.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#A89A85]">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Clinical benefits, texture, active concentration..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Section 2: Commerce */}
          {formSection === "commerce" && (
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#A89A85]">Maximum Retail Price (MRP ₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formMrp}
                    onChange={(e) => setFormMrp(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#A89A85]">Your Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={formMrp}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-[#5FAF7A]">
                    Live discount: {Math.max(0, Math.round(((formMrp - formPrice) / formMrp) * 100))}% off MRP
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#A89A85]">HSN Code *</label>
                  <input
                    type="text"
                    required
                    value={formHsn}
                    onChange={(e) => setFormHsn(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#A89A85]">GST Slab *</label>
                  <select
                    value={formGstRate}
                    onChange={(e) => setFormGstRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                  >
                    <option value={0.05}>5% GST</option>
                    <option value={0.12}>12% GST</option>
                    <option value={0.18}>18% GST (Standard)</option>
                    <option value={0.28}>28% GST</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Inventory */}
          {formSection === "inventory" && (
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#A89A85]">Physical Stock Count *</label>
                  <input
                    type="number"
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#A89A85]">Low Stock Threshold *</label>
                  <input
                    type="number"
                    min={1}
                    value={formThreshold}
                    onChange={(e) => setFormThreshold(Number(e.target.value) || 1)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#A89A85]">Dispatched Warehouse</label>
                <select
                  value={formWarehouseId}
                  onChange={(e) => setFormWarehouseId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                >
                  {warehouses
                    .filter((w) => w.sellerId === sellerId)
                    .map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name} ({wh.code})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          {/* Section 4: AI Mapping (Reactive from parameters slice + Match Preview against 3 sample scans) */}
          {formSection === "ai" && (
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-[#F5EDE0] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#E8C77A]" />
                  8-Parameter Diagnostic Calibration
                </h4>
                <p className="text-[11px] text-[#A89A85]">
                  Map how this formulation impacts each skin parameter: − (Contraindicated), 0 (Neutral), + (Slight fit), ++ (Targeted), +++ (Clinical powerhouse).
                </p>
              </div>

              {/* Parameter selectors */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {activeParams.map((param) => {
                  const currentVal = formTargetParams[param.id] ?? 0;
                  return (
                    <div
                      key={param.id}
                      className="p-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/20 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <span className="font-medium text-[#F5EDE0] block truncate">
                          {param.name}
                        </span>
                        <span className="text-[10px] text-[#A89A85]">
                          Weight: {param.weight} • Slug: {param.slug}
                        </span>
                      </div>

                      {/* Level selector buttons: -1, 0, 1, 2, 3 */}
                      <div className="flex items-center gap-1">
                        {[-1, 0, 1, 2, 3].map((lvl) => {
                          const label = lvl === -1 ? "−" : lvl === 0 ? "0" : lvl === 1 ? "+" : lvl === 2 ? "++" : "+++";
                          const isSel = currentVal === lvl;
                          return (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() =>
                                setFormTargetParams({
                                  ...formTargetParams,
                                  [param.id]: lvl,
                                })
                              }
                              className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-colors ${
                                isSel
                                  ? lvl === -1
                                    ? "bg-[#D4604F] text-white"
                                    : "bg-[#E8C77A] text-[#0B0907]"
                                  : "bg-[#1A130B] text-[#A89A85] hover:text-[#F5EDE0]"
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live Match Preview against 3 sample scans */}
              <div className="p-3.5 rounded-xl bg-[#241A0F] border border-[#C99A45]/25 space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-[#E8C77A] font-semibold block">
                  Live Match Preview (Tested against 3 real customer diagnostic topologies):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {matchPreviewScores.map((prev, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-[#0B0907] border border-[#C99A45]/15 text-center"
                    >
                      <span className="text-[10px] text-[#A89A85] block truncate">
                        {prev.customerName}
                      </span>
                      <span className="text-sm font-serif font-bold text-[#E8C77A]">
                        {prev.score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Suitability */}
          {formSection === "suitable" && (
            <div className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#A89A85]">Recommended Skin Types</label>
                <div className="flex flex-wrap gap-2">
                  {["Dry", "Oily", "Combination", "Normal", "Sensitive"].map((st) => {
                    const isSel = formSuitableSkinTypes.includes(st);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() =>
                          setFormSuitableSkinTypes((prev) =>
                            isSel ? prev.filter((s) => s !== st) : [...prev, st]
                          )
                        }
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                          isSel
                            ? "bg-[#C99A45]/20 border-[#E8C77A] text-[#E8C77A]"
                            : "bg-[#0B0907] border-[#C99A45]/20 text-[#A89A85]"
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#A89A85]">Primary Clinical Concerns Addressed</label>
                <div className="flex flex-wrap gap-2">
                  {["Dehydration", "Redness", "Fine Lines", "Pigmentation", "Sebum / Acne", "Pores", "Texture"].map(
                    (c) => {
                      const isSel = formConcernTags.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() =>
                            setFormConcernTags((prev) =>
                              isSel ? prev.filter((t) => t !== c) : [...prev, c]
                            )
                          }
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                            isSel
                              ? "bg-[#C99A45]/20 border-[#E8C77A] text-[#E8C77A]"
                              : "bg-[#0B0907] border-[#C99A45]/20 text-[#A89A85]"
                          }`}
                        >
                          {c}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Compliance & Ingredients */}
          {formSection === "compliance" && (
            <div className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#A89A85]">Active Ingredients Picker *</label>
                <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/20">
                  {ingredientsData.slice(0, 16).map((ing: any) => {
                    const isSel = formIngredients.includes(ing.name);
                    return (
                      <label
                        key={ing.id}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#1A130B] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSel}
                          onChange={() =>
                            setFormIngredients((prev) =>
                              isSel ? prev.filter((i) => i !== ing.name) : [...prev, ing.name]
                            )
                          }
                          className="w-3.5 h-3.5 accent-[#E8C77A]"
                        />
                        <span className="text-xs text-[#F5EDE0]">{ing.name}</span>
                        <span className="text-[10px] text-[#A89A85] ml-auto font-mono">
                          Safety: {ing.safetyRating}/5
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Detected caution flags */}
              {detectedCautions.length > 0 && (
                <div className="p-3 rounded-xl bg-[#E0A93B]/10 border border-[#E0A93B]/30 space-y-1 text-xs">
                  <span className="font-semibold text-[#E0A93B] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Auto-Detected Regulatory Cautions:
                  </span>
                  <ul className="list-disc list-inside text-[11px] text-[#F5EDE0] space-y-0.5">
                    {detectedCautions.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-semibold text-[#A89A85]">Clinical Directions & Usage *</label>
                <textarea
                  rows={2}
                  required
                  value={formUsage}
                  onChange={(e) => setFormUsage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#A89A85]">Warnings & Contraindications</label>
                <input
                  type="text"
                  value={formWarnings}
                  onChange={(e) => setFormWarnings(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="flex justify-between pt-3 border-t border-[#C99A45]/15">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingProduct ? "Save Changes" : "Submit Product to Catalog"}
            </Button>
          </div>
        </form>
      </ResponsiveDialog>

      {/* ============================================================ */}
      {/* BULK PRICE MODAL */}
      {/* ============================================================ */}
      <ResponsiveDialog
        open={bulkPriceModalOpen}
        onOpenChange={setBulkPriceModalOpen}
        title="Bulk Price Update"
        description={`Adjust offer pricing across ${selectedRowIds.length} selected items.`}
      >
        <div className="space-y-4 py-2 text-xs">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-[#F5EDE0]">
              <input
                type="radio"
                checked={bulkPriceType === "percent"}
                onChange={() => setBulkPriceType("percent")}
                className="accent-[#E8C77A]"
              />
              Percentage (%)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-[#F5EDE0]">
              <input
                type="radio"
                checked={bulkPriceType === "fixed"}
                onChange={() => setBulkPriceType("fixed")}
                className="accent-[#E8C77A]"
              />
              Fixed Rupee Amount (₹)
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-[#A89A85]">
              {bulkPriceType === "percent" ? "Percentage Change (+ or -)" : "Fixed Amount Change (₹)"}
            </label>
            <input
              type="number"
              value={bulkPriceValue}
              onChange={(e) => setBulkPriceValue(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none font-mono"
            />
            <p className="text-[10px] text-[#A89A85]">
              Example: -10 reduces prices by 10%. +200 adds ₹200. Prices will never exceed MRP.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setBulkPriceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleApplyBulkPrice}>
              Apply Price Update
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      {/* ============================================================ */}
      {/* BULK STOCK MODAL */}
      {/* ============================================================ */}
      <ResponsiveDialog
        open={bulkStockModalOpen}
        onOpenChange={setBulkStockModalOpen}
        title="Bulk Stock Override"
        description={`Set stock count for ${selectedRowIds.length} selected items.`}
      >
        <div className="space-y-4 py-2 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-[#A89A85]">New Physical Stock Level</label>
            <input
              type="number"
              min={0}
              value={bulkStockValue}
              onChange={(e) => setBulkStockValue(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setBulkStockModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleApplyBulkStock}>
              Apply Stock Update
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      {/* ============================================================ */}
      {/* UPGRADE PLAN LIMIT MODAL */}
      {/* ============================================================ */}
      <ResponsiveDialog
        open={upgradePlanModalOpen}
        onOpenChange={setUpgradePlanModalOpen}
        title="Distributor Plan SKU Limit Reached"
        description={`You have reached the ${currentPlan.limits.maxProducts} SKU listing limit on the ${currentPlan.name}.`}
      >
        <div className="space-y-4 py-2 text-xs">
          <div className="p-4 rounded-xl bg-[#E0A93B]/10 border border-[#E0A93B]/30 text-[#F5EDE0] leading-relaxed">
            To list additional cosmeceutical formulations and unlock accelerated automated payouts, upgrade your SaaS tier to <strong className="text-[#E8C77A]">Brand Empire (Unlimited SKUs)</strong>.
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setUpgradePlanModalOpen(false)}>
              Dismiss
            </Button>
            <Link href="/seller/subscription">
              <Button variant="primary" size="sm">
                View Subscription Plans
              </Button>
            </Link>
          </div>
        </div>
      </ResponsiveDialog>
    </div>
  );
}
