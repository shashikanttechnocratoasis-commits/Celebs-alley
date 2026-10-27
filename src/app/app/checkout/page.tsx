"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Truck,
  Tag,
  CreditCard,
  QrCode,
  Building,
  Wallet,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  ArrowLeft,
  Edit2,
  Trash2,
  Lock,
  Sparkles,
  Store,
  Clock,
  RotateCcw
} from "lucide-react";
import confetti from "canvas-confetti";
import { useAppStore, HydratedCartItem } from "@/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { ImageWithFallback } from "@/components/public/ImageWithFallback";
import {
  formatINR,
  calculateShippingFee,
  calculateCouponDiscount,
  calculateItemTax,
} from "@/lib/pricing";
import { COMMERCE_CONFIG, INDIAN_STATES } from "@/config/commerce";
import {
  AddressFormSchema,
  CardPaymentFormSchema,
  UpiPaymentFormSchema,
  validateLuhn,
  AddressFormData,
} from "@/lib/schemas";
import { toast } from "sonner";
import couponsData from "@/data/coupons.json";
import type { Address, Order, Shipment, PaymentRecord, Coupon } from "@/types";

type CheckoutStep = "address" | "delivery" | "review" | "payment";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    getHydratedCart,
    clearCart,
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    reserveStock,
    deductStock,
    releaseStock,
    createOrder,
    currentUser,
    customerProfile,
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");

  // Address State
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressFormErrors, setAddressFormErrors] = useState<Record<string, string>>({});
  const [addressForm, setAddressForm] = useState<AddressFormData>({
    name: "Radhika Singhania",
    mobile: "9824424455",
    addressLine1: "",
    addressLine2: "",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400026",
    type: "home",
    isDefault: false,
  });

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "wallet" | "cod">("upi");
  const [upiVpa, setUpiVpa] = useState("success@celebs");
  const [upiError, setUpiError] = useState<string | null>(null);
  const [cardData, setCardData] = useState({
    cardNumber: "4111 1111 1111 1111",
    cardHolder: "Radhika Singhania",
    expiry: "12/28",
    cvv: "882",
  });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [selectedWallet, setSelectedWallet] = useState("Paytm");

  // Payment Processing & Outcome State
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [failureReason, setFailureReason] = useState("");
  const [pendingCountdownSec, setPendingCountdownSec] = useState<number>(COMMERCE_CONFIG.paymentExpiryMinutes * 60);

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  // Stock reservation error state
  const [stockError, setStockError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hydratedItems = useMemo(() => {
    return mounted ? getHydratedCart() : [];
  }, [mounted, cart, getHydratedCart]);

  // Set default selected address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  // Group items by Seller (Shipments)
  const itemsBySeller = useMemo(() => {
    const map = new Map<string, { seller: any; items: HydratedCartItem[] }>();
    hydratedItems.forEach((item) => {
      const existing = map.get(item.sellerId) || { seller: item.seller, items: [] };
      existing.items.push(item);
      map.set(item.sellerId, existing);
    });
    return Array.from(map.values());
  }, [hydratedItems]);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  // Pricing & Tax Math
  const rawSubtotal = hydratedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const couponResult = calculateCouponDiscount(appliedCoupon, rawSubtotal);
  const discountAmount = couponResult.discount;
  const subtotalAfterDiscount = Math.max(0, rawSubtotal - discountAmount);
  const shippingFee = calculateShippingFee(subtotalAfterDiscount);
  const codFee = paymentMethod === "cod" ? COMMERCE_CONFIG.codFee : 0;

  // Inter-state vs Intra-state GST computation based on seller state vs delivery address state
  const deliveryState = selectedAddress?.state || "Maharashtra";

  let totalTax = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  hydratedItems.forEach((it) => {
    const itemTotal = it.price * it.quantity;
    const isInterState = (it.seller.state || "").toLowerCase() !== deliveryState.toLowerCase();
    const tax = calculateItemTax(itemTotal, it.taxRate, isInterState);
    totalTax += tax.totalTax;
    totalCgst += tax.cgst;
    totalSgst += tax.sgst;
    totalIgst += tax.igst;
  });

  const finalTotal = subtotalAfterDiscount + shippingFee + codFee;

  // Stock Reservation on entering Checkout
  useEffect(() => {
    if (hydratedItems.length > 0) {
      const reservationItems = hydratedItems.map((it) => ({
        productId: it.productId,
        sellerId: it.sellerId,
        quantity: it.quantity,
      }));
      const res = reserveStock(reservationItems);
      if (!res.success) {
        setStockError(`Insufficient stock for ${res.unavailableItem}. Please adjust your bag.`);
      } else {
        setStockError(null);
      }
    }
  }, [hydratedItems, reserveStock]);

  // Countdown timer for pending payment failures
  useEffect(() => {
    if (!paymentFailed) return;
    const interval = setInterval(() => {
      setPendingCountdownSec((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Release stock on expiry
          const releaseItems = hydratedItems.map((it) => ({
            productId: it.productId,
            sellerId: it.sellerId,
            quantity: it.quantity,
          }));
          releaseStock(releaseItems, undefined, "15-minute pending payment expired");
          toast.error("Pending payment window expired. Reserved items released.");
          router.push("/app/cart");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentFailed, hydratedItems, releaseStock, router]);

  // Handle Address Submit
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setAddressFormErrors({});

    const result = AddressFormSchema.safeParse(addressForm);
    if (!result.success) {
      const errMap: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        errMap[field] = issue.message;
      });
      setAddressFormErrors(errMap);
      return;
    }

    if (editingAddress) {
      updateAddress(editingAddress.id, result.data);
      toast.success("Address updated successfully");
    } else {
      const newAddr = addAddress({
        customerId: customerProfile?.id || "cust-1",
        ...result.data,
      });
      setSelectedAddressId(newAddr.id);
      toast.success("New delivery address saved");
    }

    setAddressModalOpen(false);
    setEditingAddress(null);
  };

  const openAddAddressModal = () => {
    setEditingAddress(null);
    setAddressForm({
      name: customerProfile?.name || currentUser?.name || "Radhika Singhania",
      mobile: customerProfile?.phone?.replace(/\D/g, "").slice(-10) || "9824424455",
      addressLine1: "",
      addressLine2: "",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400026",
      type: "home",
      isDefault: false,
    });
    setAddressFormErrors({});
    setAddressModalOpen(true);
  };

  const openEditAddressModal = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      name: addr.name,
      mobile: addr.mobile,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      type: addr.type,
      isDefault: addr.isDefault,
    });
    setAddressFormErrors({});
    setAddressModalOpen(true);
  };

  // Coupon handling in review step
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponCodeInput.trim().toUpperCase();
    if (!code) return;

    const match = (couponsData as Coupon[]).find((c) => c.code === code);
    if (!match) {
      setCouponError("Invalid coupon code.");
      return;
    }
    if (match.status !== "active") {
      setCouponError("Coupon has expired.");
      return;
    }
    if (rawSubtotal < match.minOrderValue) {
      setCouponError(`Requires minimum order of ${formatINR(match.minOrderValue)}`);
      return;
    }

    const res = applyCoupon(code);
    if (res.success) {
      toast.success(res.message);
      setCouponCodeInput("");
    } else {
      setCouponError(res.message);
    }
  };

  // Simulated Payment Execution
  const handleExecutePayment = () => {
    setPaymentFailed(false);
    setFailureReason("");

    // Validate selected method input
    if (paymentMethod === "upi") {
      const upiParsed = UpiPaymentFormSchema.safeParse({ vpa: upiVpa });
      if (!upiParsed.success) {
        setUpiError(upiParsed.error.issues[0]?.message || "Invalid UPI ID");
        return;
      }
      setUpiError(null);
    } else if (paymentMethod === "card") {
      const cardParsed = CardPaymentFormSchema.safeParse(cardData);
      if (!cardParsed.success) {
        const errMap: Record<string, string> = {};
        cardParsed.error.issues.forEach((iss) => {
          errMap[iss.path[0] as string] = iss.message;
        });
        setCardErrors(errMap);
        return;
      }
      setCardErrors({});
    } else if (paymentMethod === "cod") {
      if (finalTotal >= COMMERCE_CONFIG.codMaxOrderValue) {
        toast.error(`Cash on Delivery is only available for orders strictly below ${formatINR(COMMERCE_CONFIG.codMaxOrderValue)}.`);
        return;
      }
    }

    // Start cinematic gold processing simulation
    setIsProcessingPayment(true);

    setTimeout(() => {
      // Determine simulation outcome
      let willSucceed = true;
      let reason = "";

      if (paymentMethod === "upi") {
        if (upiVpa.toLowerCase() === "fail@celebs") {
          willSucceed = false;
          reason = "Simulated bank gateway timeout. UPI payment declined.";
        }
      } else if (paymentMethod === "card") {
        const rawDigits = cardData.cardNumber.replace(/\D/g, "");
        if (rawDigits === "4000000000000002") {
          willSucceed = false;
          reason = "Simulated card authorization decline (Insufficent limits / Gateway error).";
        }
      }

      setIsProcessingPayment(false);

      if (!willSucceed) {
        setPaymentFailed(true);
        setFailureReason(reason);
        toast.error("Payment Failed", { description: reason });
        return;
      }

      // Success branch
      executeOrderSuccess();
    }, 2400);
  };

  const executeOrderSuccess = () => {
    // 1. Confetti blast
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#E8C77A", "#C99A45", "#F5EDE0", "#B8812F"],
    });

    const orderNumber = `CA-ORD-${new Date().getFullYear().toString().slice(-2)}${(
      new Date().getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderId = `ord-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // 2. Build shipments per seller
    const shipments: Shipment[] = itemsBySeller.map(({ seller, items }, idx) => {
      const sellerSubtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
      const isInterState = (seller.state || "").toLowerCase() !== deliveryState.toLowerCase();

      let sTax = 0;
      let sCgst = 0;
      let sSgst = 0;
      let sIgst = 0;
      items.forEach((it) => {
        const t = calculateItemTax(it.price * it.quantity, it.taxRate, isInterState);
        sTax += t.totalTax;
        sCgst += t.cgst;
        sSgst += t.sgst;
        sIgst += t.igst;
      });

      return {
        id: `ship-${orderId}-${idx + 1}`,
        orderId,
        sellerId: seller.id,
        sellerName: seller.company,
        sellerState: seller.state,
        items: items.map((it) => ({
          productId: it.productId,
          name: it.product.name,
          quantity: it.quantity,
          unitPrice: it.price,
          total: it.price * it.quantity,
          taxRate: it.taxRate,
          hsn: "330499",
          image: it.product.images[0],
          brandName: it.product.sku,
        })),
        subtotal: sellerSubtotal,
        discount: 0,
        tax: sTax,
        cgst: sCgst,
        sgst: sSgst,
        igst: sIgst,
        shippingFee: 0,
        total: sellerSubtotal,
        status: "confirmed",
        courierName: "BlueDart Luxury Express",
        trackingNumber: `BD-${Math.floor(700000000 + Math.random() * 200000000)}`,
        timeline: [
          {
            status: "confirmed",
            label: "Order Confirmed & Inventory Allocated",
            timestamp,
            note: "Authorized cosmeceutical seller notified for cold-chain packing.",
          },
        ],
      };
    });

    // 3. Payment Record (never store full card number or CVV)
    const paymentRecord: PaymentRecord = {
      method: paymentMethod,
      status: paymentMethod === "cod" ? "pending" : "paid",
      transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      cardLast4: paymentMethod === "card" ? cardData.cardNumber.replace(/\D/g, "").slice(-4) : undefined,
      cardBrand: paymentMethod === "card" ? "Visa" : undefined,
      upiVpa: paymentMethod === "upi" ? upiVpa : undefined,
      paidAt: paymentMethod === "cod" ? undefined : timestamp,
      amount: finalTotal,
    };

    // 4. Create Parent Order exactly in orders.json shape
    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: customerProfile?.id || "cust-1",
      customerName: selectedAddress?.name || "Radhika Singhania",
      sellerId: itemsBySeller[0]?.seller.id || "seller-1",
      items: hydratedItems.map((it) => ({
        productId: it.productId,
        name: it.product.name,
        quantity: it.quantity,
        unitPrice: it.price,
        total: it.price * it.quantity,
        taxRate: it.taxRate,
        hsn: "330499",
        image: it.product.images[0],
      })),
      subtotal: rawSubtotal,
      discount: discountAmount,
      tax: totalTax,
      cgst: totalCgst,
      sgst: totalSgst,
      igst: totalIgst,
      shippingFee,
      codFee,
      total: finalTotal,
      status: "confirmed",
      paymentMethod:
        paymentMethod === "upi"
          ? `UPI (${upiVpa})`
          : paymentMethod === "card"
          ? `Card (ending in ${cardData.cardNumber.replace(/\D/g, "").slice(-4)})`
          : paymentMethod === "cod"
          ? "Cash on Delivery"
          : paymentMethod === "netbanking"
          ? `Net Banking (${selectedBank})`
          : `Wallet (${selectedWallet})`,
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      shippingAddress: {
        street: selectedAddress
          ? `${selectedAddress.addressLine1}${selectedAddress.addressLine2 ? `, ${selectedAddress.addressLine2}` : ""}`
          : "Penthouse 42, Altamount Signature Tower",
        city: selectedAddress?.city || "Mumbai",
        state: selectedAddress?.state || "Maharashtra",
        pincode: selectedAddress?.pincode || "400026",
        name: selectedAddress?.name || "Radhika Singhania",
        mobile: selectedAddress?.mobile || "9824424455",
      },
      createdAt: timestamp,
      shipments,
      payment: paymentRecord,
      couponCode: appliedCoupon?.code,
      couponDiscount: discountAmount,
      timeline: [
        {
          status: "confirmed",
          label: "Order Placed & Payment Verified",
          timestamp,
          note: `Transaction ID: ${paymentRecord.transactionId}. Allocated across ${shipments.length} distributor shipments.`,
        },
      ],
    };

    // 5. Deduct reserved stock from inventory
    const deductionItems = hydratedItems.map((it) => ({
      productId: it.productId,
      sellerId: it.sellerId,
      quantity: it.quantity,
    }));
    deductStock(deductionItems, orderId);

    // 6. Save order into store
    createOrder(newOrder);

    // 7. Clear cart & redirect to order tracking page
    clearCart();
    toast.success("Order Placed Successfully!");
    router.push(`/app/orders/${newOrder.id}`);
  };

  if (!mounted) return null;

  if (hydratedItems.length === 0 && !isProcessingPayment) {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto">
        <h2 className="font-serif text-2xl text-cream-100">Your Bag is Empty</h2>
        <p className="text-xs text-cream-400">Please select formulations before proceeding to checkout.</p>
        <Button asChild className="shadow-gold-glow text-xs">
          <Link href="/app/shop">Browse Boutique</Link>
        </Button>
      </div>
    );
  }

  const stepsList: Array<{ id: CheckoutStep; title: string; num: number }> = [
    { id: "address", title: "Delivery Address", num: 1 },
    { id: "delivery", title: "Shipment Breakdown", num: 2 },
    { id: "review", title: "Review & Taxes", num: 3 },
    { id: "payment", title: "Payment", num: 4 },
  ];

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      <PageHeader
        title="Secure Luxury Checkout"
        breadcrumbs={[{ label: "App", href: "/app" }, { label: "Cart", href: "/app/cart" }, { label: "Checkout" }]}
      />

      {/* Stock warning if insufficient */}
      {stockError && (
        <Card className="p-4 bg-red-950/20 border-red-500/40 text-xs text-red-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{stockError}</span>
          </div>
          <Button asChild size="sm" variant="outline" className="border-red-500/30 text-xs">
            <Link href="/app/cart">Fix Cart</Link>
          </Button>
        </Card>
      )}

      {/* Stepper Header */}
      <div className="flex items-center justify-between max-w-2xl mx-auto px-4 py-2">
        {stepsList.map((st, idx) => {
          const isCompleted =
            (st.id === "address" && currentStep !== "address") ||
            (st.id === "delivery" && (currentStep === "review" || currentStep === "payment")) ||
            (st.id === "review" && currentStep === "payment");
          const isCurrent = currentStep === st.id;

          return (
            <React.Fragment key={st.id}>
              <button
                type="button"
                onClick={() => {
                  if (st.id === "address") setCurrentStep("address");
                  if (st.id === "delivery" && selectedAddressId) setCurrentStep("delivery");
                  if (st.id === "review" && selectedAddressId) setCurrentStep("review");
                }}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                    isCompleted
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : isCurrent
                      ? "bg-gold-400 text-base font-bold shadow-gold-glow"
                      : "bg-surface border border-gold-400/20 text-cream-500"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : st.num}
                </div>
                <span
                  className={`hidden sm:inline text-xs font-medium ${
                    isCurrent ? "text-gold-300" : isCompleted ? "text-cream-200" : "text-cream-500"
                  }`}
                >
                  {st.title}
                </span>
              </button>
              {idx < stepsList.length - 1 && (
                <div className="flex-1 h-[1px] bg-gold-400/20 mx-2 sm:mx-4" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Checkout Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Step Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: ADDRESS */}
          {currentStep === "address" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg sm:text-xl text-cream-100 font-normal">
                    Select Delivery Destination
                  </h3>
                  <p className="text-xs text-cream-400">
                    Insulated cold-chain couriers require a verified contact and 6-digit PIN code.
                  </p>
                </div>
                <Button size="sm" onClick={openAddAddressModal} className="shadow-gold-glow text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Address
                </Button>
              </div>

              {/* Address Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const isSelected = addr.id === selectedAddressId;

                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? "bg-gold-400/10 border-gold-400 shadow-gold-glow/20"
                          : "bg-surface/70 border-gold-400/20 hover:border-gold-400/40"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-cream-100 text-xs sm:text-sm flex items-center gap-2">
                            {addr.name}
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-base/80 text-gold-400 border border-gold-400/20">
                              {addr.type}
                            </span>
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-mono text-emerald-400">Default</span>
                          )}
                        </div>

                        <p className="text-xs text-cream-300 leading-relaxed pt-1">
                          {addr.addressLine1}
                          {addr.addressLine2 && `, ${addr.addressLine2}`}
                        </p>
                        <p className="text-xs font-mono text-cream-400">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-[11px] text-cream-400 font-mono">
                          Mobile: +91 {addr.mobile}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gold-400/10 text-xs">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDefaultAddress(addr.id);
                          }}
                          className="text-[11px] text-gold-400 hover:underline"
                        >
                          Set as Default
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditAddressModal(addr);
                            }}
                            className="p-1 text-cream-400 hover:text-cream-100"
                            aria-label="Edit address"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {addresses.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAddress(addr.id);
                              }}
                              className="p-1 text-cream-400 hover:text-red-400"
                              aria-label="Delete address"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => {
                    if (!selectedAddressId) {
                      toast.error("Please select a delivery address.");
                      return;
                    }
                    setCurrentStep("delivery");
                  }}
                  className="shadow-gold-glow text-xs"
                >
                  Continue to Delivery <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: DELIVERY SHIPMENTS */}
          {currentStep === "delivery" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg sm:text-xl text-cream-100 font-normal">
                    Shipment Allocation ({itemsBySeller.length} Distributorships)
                  </h3>
                  <p className="text-xs text-cream-400">
                    Each seller packages their cosmeceutical batches in certified cold-chain insulated parcels.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {itemsBySeller.map(({ seller, items }, idx) => {
                  const now = new Date();
                  const edd = new Date();
                  edd.setDate(now.getDate() + (seller.deliveryDays || 3));
                  const formattedEDD = edd.toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  });

                  return (
                    <Card
                      key={seller.id}
                      className="p-5 bg-surface/80 border-gold-400/20 shadow-md space-y-4"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-gold-400/15">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-gold-400">
                            <Truck className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-medium text-xs sm:text-sm text-cream-100">
                              Package {idx + 1}: Dispatched by {seller.company}
                            </span>
                            <div className="text-[11px] font-mono text-gold-300">
                              Est. Arrival: <strong>{formattedEDD}</strong> ({seller.deliveryDays} business days)
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-base text-cream-400 border border-gold-400/15">
                          BlueDart Luxury Courier
                        </span>
                      </div>

                      <div className="space-y-2">
                        {items.map((it) => (
                          <div
                            key={it.productId}
                            className="flex items-center justify-between text-xs text-cream-200"
                          >
                            <span className="truncate max-w-xs">{it.product.name}</span>
                            <span className="font-mono text-cream-400">
                              {it.quantity} × {formatINR(it.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep("address")}
                  className="border-gold-400/30 text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Address
                </Button>
                <Button
                  onClick={() => setCurrentStep("review")}
                  className="shadow-gold-glow text-xs"
                >
                  Review Order & Taxes <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & TAXES */}
          {currentStep === "review" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-lg sm:text-xl text-cream-100 font-normal">
                  Review Formulations & Tax Classification
                </h3>
                <p className="text-xs text-cream-400">
                  Verify your luxury formulations and statutory GST billing before payment.
                </p>
              </div>

              {/* Destination Summary */}
              <div className="p-4 rounded-xl bg-surface/60 border border-gold-400/15 flex items-center justify-between text-xs">
                <div>
                  <span className="text-cream-400 font-mono text-[11px]">Delivering To:</span>
                  <p className="font-medium text-cream-100">
                    {selectedAddress?.name} ({selectedAddress?.addressLine1}, {selectedAddress?.city} - {selectedAddress?.pincode})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep("address")}
                  className="text-gold-400 hover:underline text-xs"
                >
                  Change
                </button>
              </div>

              {/* Items Table Snapshot */}
              <div className="rounded-xl border border-gold-400/20 overflow-hidden bg-base/50">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface/80 text-[10px] font-mono text-cream-400 uppercase border-b border-gold-400/15">
                    <tr>
                      <th className="py-2.5 px-3">Formulation</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-400/10">
                    {hydratedItems.map((it) => (
                      <tr key={it.productId} className="text-cream-200">
                        <td className="py-3 px-3">
                          <div className="font-medium text-cream-100 truncate max-w-sm">
                            {it.product.name}
                          </div>
                          <div className="text-[10px] font-mono text-cream-400">
                            Seller: {it.seller.company} • GST Rate: {(it.taxRate * 100).toFixed(0)}%
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono">{it.quantity}</td>
                        <td className="py-3 px-3 text-right font-mono text-cream-300">
                          {formatINR(it.price)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-gold-400">
                          {formatINR(it.price * it.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Coupon Box in Step 3 */}
              <div className="p-4 rounded-xl bg-surface/70 border border-gold-400/20 space-y-2">
                <div className="text-xs font-mono uppercase text-cream-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-gold-400" /> Apply Coupon Privilege
                </div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between text-xs p-2 rounded bg-gold-400/15 border border-gold-400/30 text-gold-300">
                    <span>Applied: <strong>{appliedCoupon.code}</strong> (-{formatINR(discountAmount)})</span>
                    <button onClick={removeCoupon} className="text-cream-400 hover:text-red-400 underline">
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => {
                        setCouponCodeInput(e.target.value.toUpperCase());
                        setCouponError(null);
                      }}
                      placeholder="Enter promo code"
                      className="flex-1 h-9 px-3 text-xs uppercase bg-base border border-gold-400/25 rounded-lg text-cream-100"
                    />
                    <Button type="submit" size="sm" className="h-9 px-4 text-xs">Apply</Button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-red-400">{couponError}</p>}
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep("delivery")}
                  className="border-gold-400/30 text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Delivery
                </Button>
                <Button
                  onClick={() => setCurrentStep("payment")}
                  className="shadow-gold-glow text-xs"
                >
                  Continue to Payment <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: SIMULATED PAYMENT */}
          {currentStep === "payment" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-lg sm:text-xl text-cream-100 font-normal">
                  Select Simulated Payment Method
                </h3>
                <p className="text-xs text-cream-400">
                  All transactions are 100% simulated sandbox credentials. No actual money is debited.
                </p>
              </div>

              {/* Demo Sandbox Credentials Banner */}
              <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 space-y-1.5 text-xs text-amber-200">
                <div className="flex items-center gap-2 font-mono font-bold uppercase text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" /> Demo Simulation Test Rules
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-cream-200">
                  <li><strong>UPI:</strong> Use <code>success@celebs</code> to succeed, <code>fail@celebs</code> to trigger gateway decline.</li>
                  <li><strong>Card:</strong> Use <code>4111 1111 1111 1111</code> to succeed, <code>4000 0000 0000 0002</code> to fail.</li>
                  <li><strong>Cash on Delivery (COD):</strong> Always succeeds (orders under ₹5,000, ₹40 convenience fee).</li>
                </ul>
              </div>

              {/* Payment Failure Alert Screen with 15-min countdown */}
              {paymentFailed && (
                <Card className="p-5 bg-red-950/30 border-red-500/40 text-xs space-y-3 animate-in fade-in">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-red-200">
                        Payment Declined
                      </h4>
                      <p className="text-xs text-red-300/90 leading-relaxed mt-0.5">
                        {failureReason || "The payment authorization was rejected by the issuing bank."}
                      </p>
                      <p className="text-[11px] font-mono text-cream-400 pt-1">
                        Stock reservation held for <strong>{Math.floor(pendingCountdownSec / 60)}m {pendingCountdownSec % 60}s</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-red-500/20">
                    <Button
                      size="sm"
                      onClick={handleExecutePayment}
                      className="shadow-gold-glow text-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" /> Retry Payment
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setPaymentFailed(false);
                        setPaymentMethod("cod");
                      }}
                      className="border-gold-400/30 text-xs"
                    >
                      Switch to Cash on Delivery
                    </Button>
                  </div>
                </Card>
              )}

              {/* Payment Methods Selection Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { id: "upi", label: "UPI (VPA / QR)", icon: QrCode },
                  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
                  { id: "netbanking", label: "Net Banking", icon: Building },
                  { id: "wallet", label: "Digital Wallet", icon: Wallet },
                  { id: "cod", label: "Cash on Delivery", icon: Banknote },
                ].map(({ id, label, icon: Icon }) => {
                  const isSelected = paymentMethod === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(id as any);
                        setPaymentFailed(false);
                      }}
                      className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-gold-400/15 border-gold-400 text-gold-300 shadow-md font-semibold"
                          : "bg-surface/80 border-gold-400/20 hover:border-gold-400/40 text-cream-300"
                      }`}
                    >
                      <Icon className="w-5 h-5 text-gold-400" />
                      <span className="text-xs leading-tight">{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Method Specific Input Form */}
              <Card className="p-5 bg-surface/90 border-gold-400/25 space-y-4">
                {paymentMethod === "upi" && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-cream-300 font-mono">
                        Virtual Payment Address (UPI ID)
                      </label>
                      <input
                        type="text"
                        value={upiVpa}
                        onChange={(e) => {
                          setUpiVpa(e.target.value);
                          setUpiError(null);
                        }}
                        placeholder="e.g. success@celebs or username@okhdfcbank"
                        className="w-full h-10 px-3 text-xs bg-base border border-gold-400/30 rounded-xl text-cream-100 font-mono focus:outline-none focus:border-gold-400"
                      />
                      {upiError && <p className="text-[11px] text-red-400">{upiError}</p>}
                    </div>

                    {/* Simulated QR block */}
                    <div className="p-4 rounded-xl bg-base border border-gold-400/20 flex flex-col items-center justify-center space-y-2 text-center">
                      <div className="w-28 h-28 bg-white p-2 rounded-lg flex items-center justify-center">
                        <QrCode className="w-24 h-24 text-black" />
                      </div>
                      <p className="text-[11px] text-cream-400 font-mono">
                        Scan with Google Pay, PhonePe, or Paytm UPI app
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === "card" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-cream-300 font-mono">Card Number</label>
                      <input
                        type="text"
                        maxLength={19}
                        value={cardData.cardNumber}
                        onChange={(e) => {
                          setCardData({ ...cardData, cardNumber: e.target.value });
                          setCardErrors({});
                        }}
                        placeholder="4111 1111 1111 1111"
                        className="w-full h-10 px-3 text-xs bg-base border border-gold-400/30 rounded-xl text-cream-100 font-mono focus:outline-none focus:border-gold-400"
                      />
                      {cardErrors.cardNumber && <p className="text-[11px] text-red-400">{cardErrors.cardNumber}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-cream-300 font-mono">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardData.cardHolder}
                        onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value })}
                        placeholder="Name on card"
                        className="w-full h-10 px-3 text-xs bg-base border border-gold-400/30 rounded-xl text-cream-100"
                      />
                      {cardErrors.cardHolder && <p className="text-[11px] text-red-400">{cardErrors.cardHolder}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-cream-300 font-mono">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          maxLength={5}
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          placeholder="12/28"
                          className="w-full h-10 px-3 text-xs bg-base border border-gold-400/30 rounded-xl text-cream-100 font-mono text-center"
                        />
                        {cardErrors.expiry && <p className="text-[11px] text-red-400">{cardErrors.expiry}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-cream-300 font-mono">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                          placeholder="•••"
                          className="w-full h-10 px-3 text-xs bg-base border border-gold-400/30 rounded-xl text-cream-100 font-mono text-center"
                        />
                        {cardErrors.cvv && <p className="text-[11px] text-red-400">{cardErrors.cvv}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "netbanking" && (
                  <div className="space-y-2">
                    <label className="text-xs text-cream-300 font-mono">Select Partner Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-base border border-gold-400/30 rounded-xl text-cream-100"
                    >
                      <option value="HDFC Bank">HDFC Bank (Instant Transfer)</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="State Bank of India">State Bank of India</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {paymentMethod === "wallet" && (
                  <div className="space-y-2">
                    <label className="text-xs text-cream-300 font-mono">Choose Wallet</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Paytm", "PhonePe", "Amazon Pay"].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setSelectedWallet(w)}
                          className={`p-3 rounded-xl border text-xs font-mono ${
                            selectedWallet === w
                              ? "bg-gold-400/20 border-gold-400 text-gold-300 font-bold"
                              : "bg-base border-gold-400/20 text-cream-300"
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {paymentMethod === "cod" && (
                  <div className="space-y-2 text-xs">
                    <p className="text-cream-300 leading-relaxed">
                      Pay using cash or courier UPI QR upon parcel arrival. A nominal convenience fee of ₹40 applies.
                    </p>
                    {finalTotal >= COMMERCE_CONFIG.codMaxOrderValue ? (
                      <p className="text-red-400 font-semibold">
                        Order total is at or above the ₹5,000 threshold for Cash on Delivery. Please choose UPI or Card.
                      </p>
                    ) : (
                      <p className="text-emerald-400 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Eligible for COD payment
                      </p>
                    )}
                  </div>
                )}
              </Card>

              {/* Pay Now Button */}
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep("review")}
                  className="border-gold-400/30 text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Review
                </Button>
                <Button
                  onClick={handleExecutePayment}
                  disabled={isProcessingPayment || (paymentMethod === "cod" && finalTotal >= COMMERCE_CONFIG.codMaxOrderValue)}
                  className="shadow-gold-glow text-xs uppercase tracking-wider px-6 py-3"
                >
                  <Lock className="w-3.5 h-3.5 mr-1.5" />
                  Pay {formatINR(finalTotal)}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Summary Sidebar (4 cols) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <Card className="p-5 sm:p-6 bg-surface border-gold-400/30 shadow-2xl space-y-4">
            <h3 className="font-serif text-base text-cream-100 font-normal pb-3 border-b border-gold-400/15">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs text-cream-300">
              <div className="flex items-center justify-between">
                <span>Items Subtotal</span>
                <span className="font-mono text-cream-100">{formatINR(rawSubtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-400">
                  <span>Coupon Discount</span>
                  <span className="font-mono">-{formatINR(discountAmount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span>Insulated Shipping</span>
                <span className="font-mono">
                  {shippingFee === 0 ? <strong className="text-emerald-400">FREE</strong> : formatINR(shippingFee)}
                </span>
              </div>

              {codFee > 0 && (
                <div className="flex items-center justify-between">
                  <span>COD Handling Fee</span>
                  <span className="font-mono">{formatINR(codFee)}</span>
                </div>
              )}

              {/* Tax detail */}
              <div className="pt-2 border-t border-gold-400/10 space-y-1 text-[11px] text-cream-400">
                {totalIgst > 0 ? (
                  <div className="flex items-center justify-between">
                    <span>IGST (Integrated Tax)</span>
                    <span className="font-mono">{formatINR(totalIgst)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span>CGST (Central Tax)</span>
                      <span className="font-mono">{formatINR(totalCgst)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>SGST (State Tax)</span>
                      <span className="font-mono">{formatINR(totalSgst)}</span>
                    </div>
                  </>
                )}
                <p className="text-[10px] text-cream-500 italic pt-0.5">
                  Demo tax computation, not tax advice.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-gold-400/20 flex items-baseline justify-between">
              <div>
                <span className="font-serif text-base text-cream-100 font-medium">To Pay</span>
                <div className="text-[10px] text-cream-400 font-mono">All Taxes Included</div>
              </div>
              <div className="font-mono text-xl sm:text-2xl font-bold text-gold-400">
                {formatINR(finalTotal)}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Cinematic Gold Payment Processing Overlay */}
      {isProcessingPayment && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-6 animate-in fade-in">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-2 border-gold-400/30 animate-ping" />
            <div className="w-24 h-24 rounded-full border-3 border-t-gold-400 border-r-gold-300 border-b-transparent border-l-transparent animate-spin flex items-center justify-center shadow-gold-glow">
              <Lock className="w-8 h-8 text-gold-400" />
            </div>
          </div>

          <div className="space-y-2 max-w-sm">
            <h3 className="font-serif text-xl sm:text-2xl text-cream-100 font-normal">
              Authenticating Luxury Transaction
            </h3>
            <p className="text-xs text-gold-300/90 font-mono">
              Securing biometric escrow allocation for {formatINR(finalTotal)}...
            </p>
            <p className="text-[11px] text-cream-400 pt-2">
              Please do not refresh or close this window while the encryption handshake completes.
            </p>
          </div>
        </div>
      )}

      {/* Address Add / Edit Modal */}
      <ResponsiveDialog
        open={addressModalOpen}
        onOpenChange={setAddressModalOpen}
        title={editingAddress ? "Edit Delivery Address" : "Add New Delivery Address"}
        description="Enter full Indian shipping address for courier fulfillment"
      >
        <form onSubmit={handleSaveAddress} className="space-y-4 py-2 text-xs">
          <div className="space-y-1">
            <label className="text-cream-300 font-mono">Full Name</label>
            <input
              type="text"
              value={addressForm.name}
              onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
              className="w-full h-9 px-3 bg-base border border-gold-400/25 rounded-lg text-cream-100"
            />
            {addressFormErrors.name && <p className="text-[11px] text-red-400">{addressFormErrors.name}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-cream-300 font-mono">10-Digit Mobile Number</label>
            <input
              type="tel"
              maxLength={10}
              value={addressForm.mobile}
              onChange={(e) => setAddressForm({ ...addressForm, mobile: e.target.value.replace(/\D/g, "") })}
              className="w-full h-9 px-3 bg-base border border-gold-400/25 rounded-lg text-cream-100 font-mono"
            />
            {addressFormErrors.mobile && <p className="text-[11px] text-red-400">{addressFormErrors.mobile}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-cream-300 font-mono">Address Line 1 (Flat, Building, Street)</label>
            <input
              type="text"
              value={addressForm.addressLine1}
              onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
              className="w-full h-9 px-3 bg-base border border-gold-400/25 rounded-lg text-cream-100"
            />
            {addressFormErrors.addressLine1 && <p className="text-[11px] text-red-400">{addressFormErrors.addressLine1}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-cream-300 font-mono">Address Line 2 (Landmark, Area)</label>
            <input
              type="text"
              value={addressForm.addressLine2 || ""}
              onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
              className="w-full h-9 px-3 bg-base border border-gold-400/25 rounded-lg text-cream-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-cream-300 font-mono">City</label>
              <input
                type="text"
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                className="w-full h-9 px-3 bg-base border border-gold-400/25 rounded-lg text-cream-100"
              />
              {addressFormErrors.city && <p className="text-[11px] text-red-400">{addressFormErrors.city}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-cream-300 font-mono">State</label>
              <select
                value={addressForm.state}
                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                className="w-full h-9 px-3 bg-base border border-gold-400/25 rounded-lg text-cream-100"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st.code} value={st.name}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-cream-300 font-mono">6-Digit PIN Code</label>
              <input
                type="text"
                maxLength={6}
                value={addressForm.pincode}
                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, "") })}
                className="w-full h-9 px-3 bg-base border border-gold-400/25 rounded-lg text-cream-100 font-mono"
              />
              {addressFormErrors.pincode && <p className="text-[11px] text-red-400">{addressFormErrors.pincode}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-cream-300 font-mono">Address Type</label>
              <select
                value={addressForm.type}
                onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value as any })}
                className="w-full h-9 px-3 bg-base border border-gold-400/25 rounded-lg text-cream-100"
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddressModalOpen(false)}
              className="border-gold-400/30 text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="shadow-gold-glow text-xs">
              Save Address
            </Button>
          </div>
        </form>
      </ResponsiveDialog>
    </div>
  );
}
