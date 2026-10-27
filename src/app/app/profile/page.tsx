"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  MapPin,
  History,
  Bell,
  Shield,
  Plus,
  Edit2,
  Trash2,
  Check,
  Camera,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Download,
  AlertTriangle,
  Smartphone,
  Sparkles,
  Calendar,
  Clock,
  Save,
  CheckCircle2,
} from "lucide-react";
import { useAppStore } from "@/store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ResultsRadarChart } from "@/components/app/ResultsRadarChart";
import { INDIAN_STATES } from "@/config/commerce";
import { computeOverallScore } from "@/lib/scanEngine";
import { toast } from "sonner";
import { Address } from "@/types";

export default function CustomerProfilePage() {
  const router = useRouter();
  const {
    customerProfile,
    updateCustomerProfile,
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    scans,
    logout,
    parameters,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<
    "details" | "addresses" | "scans" | "preferences" | "privacy"
  >("details");

  // --- TAB 1: Personal Details State ---
  const [name, setName] = useState(customerProfile?.name || "Radhika Singhania");
  const [email, setEmail] = useState(customerProfile?.email || "radhika.s@luxurycell.in");
  const [phone, setPhone] = useState(customerProfile?.phone || "+91 98201 12345");
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [tempPhone, setTempPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // --- TAB 2: Address CRUD State ---
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState<{
    name: string;
    mobile: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
    type: "home" | "work" | "other";
    isDefault: boolean;
  }>({
    name: "",
    mobile: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "Maharashtra",
    pincode: "",
    type: "home",
    isDefault: false,
  });

  // --- TAB 3: Scan Comparison State ---
  const [selectedScanAId, setSelectedScanAId] = useState<string>(
    scans && scans.length > 0 ? scans[0].id : ""
  );
  const [selectedScanBId, setSelectedScanBId] = useState<string>(
    scans && scans.length > 1 ? scans[1].id : scans && scans.length > 0 ? scans[0].id : ""
  );

  // --- TAB 4: Preferences State ---
  const [preferences, setPreferences] = useState({
    orderUpdates: customerProfile?.preferences?.orderUpdates ?? true,
    scanReminders: customerProfile?.preferences?.scanReminders ?? true,
    consultationReminders: customerProfile?.preferences?.consultationReminders ?? true,
    amReminder: customerProfile?.preferences?.amReminder || "08:00",
    pmReminder: customerProfile?.preferences?.pmReminder || "21:30",
    pushEnabled: customerProfile?.preferences?.pushEnabled ?? false,
  });

  // --- TAB 5: Privacy State ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  // Handler: Save Personal Details
  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerProfile({
      name,
      email,
    });
    toast.success("Profile details updated successfully");
  };

  // Handler: Phone OTP Verification
  const handleStartPhoneChange = () => {
    setTempPhone(phone.replace(/\D/g, "").slice(-10));
    setOtpSent(false);
    setOtpCode("");
    setIsPhoneModalOpen(true);
  };

  const handleSendPhoneOtp = () => {
    if (tempPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit Indian phone number");
      return;
    }
    setOtpSent(true);
    toast.info("Demo OTP sent: 123456");
  };

  const handleVerifyPhoneOtp = () => {
    if (otpCode !== "123456") {
      toast.error("Invalid OTP. For demo use: 123456");
      return;
    }
    const formatted = `+91 ${tempPhone.slice(0, 5)} ${tempPhone.slice(5)}`;
    setPhone(formatted);
    updateCustomerProfile({ phone: formatted });
    setIsPhoneModalOpen(false);
    toast.success("Phone number verified and updated!");
  };

  // Handler: Open Add Address
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddrForm({
      name: customerProfile?.name || "",
      mobile: customerProfile?.phone?.replace(/\D/g, "").slice(-10) || "9820112345",
      addressLine1: "",
      addressLine2: "",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
      type: "home",
      isDefault: addresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  // Handler: Open Edit Address
  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddrForm({
      name: addr.name,
      mobile: addr.mobile,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      type: addr.type || "home",
      isDefault: addr.isDefault,
    });
    setIsAddressModalOpen(true);
  };

  // Handler: Save Address (Add or Edit)
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrForm.name.trim() || !addrForm.addressLine1.trim() || !addrForm.city.trim() || !addrForm.pincode.trim()) {
      toast.error("Please fill in all required address fields");
      return;
    }
    if (!/^\d{6}$/.test(addrForm.pincode)) {
      toast.error("Please enter a valid 6-digit Indian PIN code");
      return;
    }

    if (editingAddressId) {
      updateAddress(editingAddressId, {
        name: addrForm.name,
        mobile: addrForm.mobile,
        addressLine1: addrForm.addressLine1,
        addressLine2: addrForm.addressLine2,
        city: addrForm.city,
        state: addrForm.state,
        pincode: addrForm.pincode,
        type: addrForm.type,
        isDefault: addrForm.isDefault,
      });
      toast.success("Address updated successfully");
    } else {
      const newAddr: Address = {
        id: `addr-${Date.now()}`,
        customerId: customerProfile?.id || "cust-1",
        name: addrForm.name,
        mobile: addrForm.mobile,
        addressLine1: addrForm.addressLine1,
        addressLine2: addrForm.addressLine2,
        city: addrForm.city,
        state: addrForm.state,
        pincode: addrForm.pincode,
        type: addrForm.type,
        isDefault: addrForm.isDefault,
      };
      addAddress(newAddr);
      toast.success("New delivery address added");
    }
    setIsAddressModalOpen(false);
  };

  // Handler: Save Preferences
  const handleSavePreferences = () => {
    updateCustomerProfile({ preferences });
    toast.success("Notification and routine preferences saved");
  };

  // Handler: Test Browser Notification
  const handleTestNotification = () => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Celebs Alley • Regimen Reminder", {
          body: "Time for your evening Gold Saffron Nectar ritual.",
          icon: "/icon.png",
        });
        toast.success("Test notification dispatched to your system tray");
      } else {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted") {
            new Notification("Celebs Alley • Regimen Reminder", {
              body: "Time for your evening Gold Saffron Nectar ritual.",
            });
            toast.success("Test notification sent!");
            setPreferences((p) => ({ ...p, pushEnabled: true }));
          } else {
            toast.info("Notification simulation: 'Evening Regimen Reminder: Saffron Nectar application'");
          }
        });
      }
    } else {
      toast.info("Browser notification: 'Evening Regimen Reminder: Time for your Gold Saffron Nectar'");
    }
  };

  // Handler: Export Diagnostic Data (JSON)
  const handleExportData = () => {
    const exportPayload = {
      profile: customerProfile,
      addresses,
      scans,
      exportedAt: new Date().toISOString(),
      compliance: "Digital Personal Data Protection Act (DPDPA 2023) - India",
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `celebs-alley-biometric-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Your diagnostic data file has been downloaded");
  };

  // Handler: Delete Account
  const handleDeleteAccount = () => {
    if (deleteConfirmationText.trim().toUpperCase() !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }
    logout();
    toast.success("Account and biometric data successfully purged");
    router.push("/");
  };

  // Scan Comparison Calculations
  const scanA = scans.find((s) => s.id === selectedScanAId) || scans[0];
  const scanB = scans.find((s) => s.id === selectedScanBId) || (scans.length > 1 ? scans[1] : scans[0]);

  const scoreAVal = scanA ? computeOverallScore(scanA, parameters) : 80;
  const scoreBVal = scanB ? computeOverallScore(scanB, parameters) : 80;
  const scoreDelta = scanA && scanB ? scoreAVal - scoreBVal : 0;

  // Radar chart comparison data
  const comparisonRadarData = parameters.map((param) => {
    const scoreA = scanA?.parameterScores[param.id] ?? 70;
    const scoreB = scanB?.parameterScores[param.id] ?? 70;
    return {
      parameterName: param.name,
      currentScore: scoreA,
      previousScore: scoreB,
      fullMark: 100,
    };
  });

  const skinType = customerProfile?.questionnaire?.skinType || "Combination";
  const fitzpatrick = customerProfile?.questionnaire?.fitzpatrickScale || "Fitzpatrick III (Wheatish/Olive)";
  const primaryConcern = customerProfile?.questionnaire?.primaryConcerns?.[0] || "Barrier Redness & Hydration";

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      <PageHeader
        title="Customer Profile & Skin Diary"
        breadcrumbs={[{ label: "App", href: "/app" }, { label: "Profile" }]}
      />

      {/* Profile Header Card */}
      <Card className="p-6 bg-gradient-to-r from-surface via-surface/95 to-base border-gold-400/25 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400/20 to-gold-600/20 border border-gold-400/40 flex items-center justify-center text-gold-400 font-serif text-2xl font-bold shadow-gold-glow">
              {name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl text-cream-100 font-normal">
                  {name}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-gold-400/10 border border-gold-400/30 text-gold-400 text-[10px] uppercase font-mono tracking-wider">
                  Verified Biometric
                </span>
              </div>
              <p className="text-xs text-cream-300/80 mt-0.5">{email} • {phone}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full bg-base/80 border border-gold-400/15 text-[11px] text-cream-200">
                  Type: <strong>{skinType}</strong>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-base/80 border border-gold-400/15 text-[11px] text-cream-200">
                  {fitzpatrick}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-base/80 border border-gold-400/15 text-[11px] text-gold-400">
                  Focus: {primaryConcern}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild size="sm" className="shadow-gold-glow">
              <Link href="/app/scan">
                <Camera className="w-4 h-4 mr-1.5" /> Take New Scan
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-gold-400/20 overflow-x-auto scrollbar-none gap-2">
        <button
          onClick={() => setActiveTab("details")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "details"
              ? "border-gold-400 text-gold-400 bg-gold-400/5"
              : "border-transparent text-cream-400 hover:text-cream-200"
          }`}
        >
          <User className="w-4 h-4" /> Personal Details
        </button>

        <button
          onClick={() => setActiveTab("addresses")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "addresses"
              ? "border-gold-400 text-gold-400 bg-gold-400/5"
              : "border-transparent text-cream-400 hover:text-cream-200"
          }`}
        >
          <MapPin className="w-4 h-4" /> Delivery Addresses ({addresses.length})
        </button>

        <button
          onClick={() => setActiveTab("scans")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "scans"
              ? "border-gold-400 text-gold-400 bg-gold-400/5"
              : "border-transparent text-cream-400 hover:text-cream-200"
          }`}
        >
          <History className="w-4 h-4" /> Skin Diary & Comparison ({scans.length})
        </button>

        <button
          onClick={() => setActiveTab("preferences")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "preferences"
              ? "border-gold-400 text-gold-400 bg-gold-400/5"
              : "border-transparent text-cream-400 hover:text-cream-200"
          }`}
        >
          <Bell className="w-4 h-4" /> Regimen & Alerts
        </button>

        <button
          onClick={() => setActiveTab("privacy")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "privacy"
              ? "border-gold-400 text-gold-400 bg-gold-400/5"
              : "border-transparent text-cream-400 hover:text-cream-200"
          }`}
        >
          <Shield className="w-4 h-4" /> Privacy & Data
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PERSONAL DETAILS */}
      {/* ========================================================================= */}
      {activeTab === "details" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <Card className="p-6 bg-surface/80 border-gold-400/20 space-y-6">
              <div className="border-b border-gold-400/10 pb-4">
                <h3 className="font-serif text-lg text-cream-100 font-normal">
                  Personal Information
                </h3>
                <p className="text-xs text-cream-400">
                  Update your contact details and authentication profile.
                </p>
              </div>

              <form onSubmit={handleSaveDetails} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-gold-400">
                    Full Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-base/60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-gold-400">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-base/60"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-gold-400">
                      Mobile Number (OTP Protected)
                    </label>
                    <button
                      type="button"
                      onClick={handleStartPhoneChange}
                      className="text-xs text-gold-400 hover:text-gold-300 underline"
                    >
                      Change / Re-verify
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={phone}
                      disabled
                      className="bg-base/40 opacity-80 cursor-not-allowed"
                    />
                    <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-4 h-4" /> Verified
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" className="shadow-gold-glow">
                    <Save className="w-4 h-4 mr-2" /> Save Profile Changes
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6 bg-surface/70 border-gold-400/20 space-y-4">
              <h3 className="font-serif text-base text-cream-100 font-normal">
                Clinical Skin Profile
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-base/60 border border-gold-400/10 flex items-center justify-between">
                  <span className="text-cream-400">Skin Type</span>
                  <span className="font-semibold text-cream-100">{skinType}</span>
                </div>
                <div className="p-3 rounded-xl bg-base/60 border border-gold-400/10 flex items-center justify-between">
                  <span className="text-cream-400">Phototype</span>
                  <span className="font-semibold text-cream-100">{fitzpatrick}</span>
                </div>
                <div className="p-3 rounded-xl bg-base/60 border border-gold-400/10 flex items-center justify-between">
                  <span className="text-cream-400">Total Face Scans</span>
                  <span className="font-semibold text-gold-400">{scans.length} Completed</span>
                </div>
              </div>

              <div className="pt-2">
                <Button asChild variant="outline" size="sm" className="w-full border-gold-400/30">
                  <Link href="/app/onboarding">
                    Retake Dermal Questionnaire
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ADDRESSES */}
      {/* ========================================================================= */}
      {activeTab === "addresses" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl text-cream-100 font-normal">
                Saved Delivery Addresses
              </h3>
              <p className="text-xs text-cream-400">
                Manage residential and office shipping destinations across India.
              </p>
            </div>
            <Button onClick={handleOpenAddAddress} size="sm" className="shadow-gold-glow">
              <Plus className="w-4 h-4 mr-1.5" /> Add New Address
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addresses.map((addr) => (
              <Card
                key={addr.id}
                className={`p-6 bg-surface/80 border transition-all relative flex flex-col justify-between ${
                  addr.isDefault
                    ? "border-gold-400/50 shadow-gold-glow"
                    : "border-gold-400/20 hover:border-gold-400/40"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-gold-400/15 border border-gold-400/30 text-[10px] font-mono text-gold-400 uppercase">
                      {addr.type || "home"}
                    </span>
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Default Shipping
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-serif text-base text-cream-100 font-normal">
                      {addr.name}
                    </h4>
                    <p className="text-xs text-cream-400 mt-0.5">
                      +91 {addr.mobile}
                    </p>
                  </div>

                  <p className="text-xs text-cream-300/80 leading-relaxed">
                    {addr.addressLine1}
                    {addr.addressLine2 && <>, {addr.addressLine2}</>}
                    <br />
                    {addr.city}, {addr.state} - <strong className="font-mono text-gold-400">{addr.pincode}</strong>
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-gold-400/10 flex items-center justify-between gap-2">
                  {!addr.isDefault && (
                    <button
                      onClick={() => {
                        setDefaultAddress(addr.id);
                        toast.success("Default address updated");
                      }}
                      className="text-xs text-gold-400/80 hover:text-gold-300 font-medium"
                    >
                      Make Default
                    </button>
                  )}
                  {addr.isDefault && <div />}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditAddress(addr)}
                      className="p-1.5 rounded-lg text-cream-400 hover:text-cream-100 hover:bg-gold-400/10 transition-colors"
                      title="Edit address"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {addresses.length > 1 && (
                      <button
                        onClick={() => {
                          deleteAddress(addr.id);
                          toast.success("Address removed");
                        }}
                        className="p-1.5 rounded-lg text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SCAN HISTORY & DIARY */}
      {/* ========================================================================= */}
      {activeTab === "scans" && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl text-cream-100 font-normal">
                Multi-Spectral Skin Diary & Comparison
              </h3>
              <p className="text-xs text-cream-400">
                Track clinical biometric progression across scans. Select any two scans to analyze changes.
              </p>
            </div>
            <Button asChild size="sm" className="shadow-gold-glow">
              <Link href="/app/scan">
                <Camera className="w-4 h-4 mr-1.5" /> Start New Face Scan
              </Link>
            </Button>
          </div>

          {/* Selectors for comparison */}
          {scans.length >= 2 && (
            <Card className="p-6 bg-surface/80 border-gold-400/25 space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-gold-400/10">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="space-y-1 w-full sm:w-56">
                    <label className="text-[10px] font-mono uppercase text-gold-400">
                      Scan A (Gold Radar)
                    </label>
                    <select
                      value={selectedScanAId}
                      onChange={(e) => setSelectedScanAId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-base/80 border border-gold-400/30 text-xs text-cream-100 focus:outline-none"
                    >
                      {scans.map((s) => (
                        <option key={s.id} value={s.id}>
                          {new Date(s.createdAt).toLocaleDateString("en-IN")} • Score {computeOverallScore(s, parameters)}/100
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="text-cream-400 text-xs font-mono pt-4">vs</span>

                  <div className="space-y-1 w-full sm:w-56">
                    <label className="text-[10px] font-mono uppercase text-purple-400">
                      Scan B (Purple Radar)
                    </label>
                    <select
                      value={selectedScanBId}
                      onChange={(e) => setSelectedScanBId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-base/80 border border-purple-400/30 text-xs text-cream-100 focus:outline-none"
                    >
                      {scans.map((s) => (
                        <option key={s.id} value={s.id}>
                          {new Date(s.createdAt).toLocaleDateString("en-IN")} • Score {computeOverallScore(s, parameters)}/100
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] font-mono uppercase text-cream-400">
                      Overall Score Delta
                    </div>
                    <div
                      className={`font-serif text-2xl font-bold flex items-center justify-end gap-1 ${
                        scoreDelta >= 0 ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {scoreDelta >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      {scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta} pts
                    </div>
                  </div>
                </div>
              </div>

              {/* Radar Chart Overlay and Delta Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-6">
                  <ResultsRadarChart data={comparisonRadarData} showComparison={true} />
                  <div className="flex items-center justify-center gap-6 text-xs mt-2">
                    <span className="flex items-center gap-2 text-gold-400">
                      <span className="w-3 h-3 rounded-full bg-gold-400" /> Scan A ({scoreAVal}/100)
                    </span>
                    <span className="flex items-center gap-2 text-purple-400">
                      <span className="w-3 h-3 rounded-full bg-purple-500" /> Scan B ({scoreBVal}/100)
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-6 space-y-3">
                  <h4 className="text-xs font-mono uppercase text-gold-400 tracking-wider">
                    Biomarker Delta Breakdown
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {parameters.map((param) => {
                      const score1 = scanA?.parameterScores[param.id] || 0;
                      const score2 = scanB?.parameterScores[param.id] || 0;
                      const delta = score1 - score2;
                      return (
                        <div
                          key={param.id}
                          className="p-2.5 rounded-xl bg-base/60 border border-gold-400/10 flex items-center justify-between"
                        >
                          <span className="text-cream-300 truncate pr-1">{param.name}</span>
                          <span
                            className={`font-mono font-semibold px-2 py-0.5 rounded text-[11px] shrink-0 ${
                              delta > 0
                                ? "bg-emerald-500/15 text-emerald-400"
                                : delta < 0
                                ? "bg-rose-500/15 text-rose-400"
                                : "bg-cream-400/10 text-cream-400"
                            }`}
                          >
                            {delta > 0 ? `+${delta}` : delta}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Timeline of all scans */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase text-gold-400 tracking-wider">
              Diagnostic Timeline Archive
            </h4>
            <div className="space-y-3">
              {scans.map((scan) => (
                <Card
                  key={scan.id}
                  className="p-5 bg-surface/70 border-gold-400/15 hover:border-gold-400/35 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold-400/10 border border-gold-400/30 flex items-center justify-center font-serif text-lg font-bold text-gold-400">
                      {computeOverallScore(scan, parameters)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-base text-cream-100 font-normal">
                          Multi-Spectral Scan
                        </span>
                        <span className="text-xs text-cream-400 font-mono">
                          {new Date(scan.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {scan.topConcerns.slice(0, 3).map((c) => (
                          <span
                            key={c.parameterId}
                            className="px-2 py-0.5 rounded bg-base/80 border border-gold-400/10 text-[10px] text-cream-300"
                          >
                            {c.name}: {c.score}/100
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm" className="border-gold-400/30">
                      <Link href={`/app/results/${scan.id}`}>
                        View Full Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PREFERENCES & REGIMEN */}
      {/* ========================================================================= */}
      {activeTab === "preferences" && (
        <div className="max-w-3xl space-y-6">
          <Card className="p-6 bg-surface/80 border-gold-400/20 space-y-6">
            <div className="border-b border-gold-400/10 pb-4">
              <h3 className="font-serif text-lg text-cream-100 font-normal">
                Regimen & Communication Preferences
              </h3>
              <p className="text-xs text-cream-400">
                Control your notification channels and circadian skincare schedule reminders.
              </p>
            </div>

            {/* Notification Toggles */}
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-base/60 border border-gold-400/15 cursor-pointer">
                <div>
                  <div className="text-sm font-medium text-cream-100">
                    Order Dispatch & Tracking Alerts
                  </div>
                  <div className="text-xs text-cream-400">
                    Real-time SMS & WhatsApp alerts when BlueDart status changes.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.orderUpdates}
                  onChange={(e) =>
                    setPreferences({ ...preferences, orderUpdates: e.target.checked })
                  }
                  className="w-4 h-4 accent-gold-400 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-base/60 border border-gold-400/15 cursor-pointer">
                <div>
                  <div className="text-sm font-medium text-cream-100">
                    Bi-Weekly Dermal Scan Reminders
                  </div>
                  <div className="text-xs text-cream-400">
                    Gentle reminders every 14 days to track your skin barrier progress.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.scanReminders}
                  onChange={(e) =>
                    setPreferences({ ...preferences, scanReminders: e.target.checked })
                  }
                  className="w-4 h-4 accent-gold-400 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-base/60 border border-gold-400/15 cursor-pointer">
                <div>
                  <div className="text-sm font-medium text-cream-100">
                    Tele-Dermatologist Consultation Alerts
                  </div>
                  <div className="text-xs text-cream-400">
                    Calendar pings 30 minutes before your scheduled video appointment.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.consultationReminders}
                  onChange={(e) =>
                    setPreferences({ ...preferences, consultationReminders: e.target.checked })
                  }
                  className="w-4 h-4 accent-gold-400 rounded cursor-pointer"
                />
              </label>
            </div>

            {/* Circadian Timers */}
            <div className="pt-4 border-t border-gold-400/10 space-y-4">
              <h4 className="text-xs font-mono uppercase text-gold-400 tracking-wider">
                Circadian Regimen Schedule
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-base/60 border border-gold-400/15 space-y-2">
                  <span className="text-xs text-cream-300 font-medium flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gold-400" /> Morning Routine (AM)
                  </span>
                  <input
                    type="time"
                    value={preferences.amReminder}
                    onChange={(e) =>
                      setPreferences({ ...preferences, amReminder: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-gold-400/30 text-cream-100 text-sm focus:outline-none"
                  />
                  <p className="text-[11px] text-cream-400">SPF & antioxidant hydration reminder.</p>
                </div>

                <div className="p-4 rounded-xl bg-base/60 border border-gold-400/15 space-y-2">
                  <span className="text-xs text-cream-300 font-medium flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gold-400" /> Evening Routine (PM)
                  </span>
                  <input
                    type="time"
                    value={preferences.pmReminder}
                    onChange={(e) =>
                      setPreferences({ ...preferences, pmReminder: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-gold-400/30 text-cream-100 text-sm focus:outline-none"
                  />
                  <p className="text-[11px] text-cream-400">Night repair elixir & peptide seal.</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestNotification}
                  className="border-gold-400/30 text-xs"
                >
                  <Bell className="w-3.5 h-3.5 mr-1.5" /> Test Browser Notification
                </Button>

                <Button onClick={handleSavePreferences} className="shadow-gold-glow">
                  <Save className="w-4 h-4 mr-2" /> Save Preferences
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PRIVACY & DATA RIGHTS */}
      {/* ========================================================================= */}
      {activeTab === "privacy" && (
        <div className="max-w-3xl space-y-6">
          <Card className="p-6 bg-surface/80 border-gold-400/20 space-y-6">
            <div className="border-b border-gold-400/10 pb-4">
              <h3 className="font-serif text-lg text-cream-100 font-normal">
                Biometric Privacy & Digital Rights
              </h3>
              <p className="text-xs text-cream-400">
                You retain complete sovereign ownership of your facial topology and biometric scores under India&apos;s Digital Personal Data Protection Act.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gold-400/10 border border-gold-400/25 space-y-2">
              <div className="flex items-center gap-2 text-gold-400 text-xs font-semibold uppercase font-mono">
                <Shield className="w-4 h-4" /> Biometric Consent Status
              </div>
              <p className="text-xs text-cream-200">
                Consent recorded on {customerProfile?.consent?.timestamp ? new Date(customerProfile.consent.timestamp).toLocaleDateString("en-IN") : "Initial sign-up"}.
                Encrypted with AES-256 local storage partitioning.
              </p>
              <div className="pt-1">
                <Link
                  href="/app/privacy"
                  className="text-xs text-gold-400 hover:text-gold-300 underline font-medium"
                >
                  Review full biometric data policy & compliance logs &rarr;
                </Link>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-4 rounded-xl bg-base/60 border border-gold-400/15">
                <div>
                  <h4 className="text-sm font-medium text-cream-100">
                    Export My Diagnostic History
                  </h4>
                  <p className="text-xs text-cream-400">
                    Download a portable JSON archive of your questionnaires, scans, and skin scores.
                  </p>
                </div>
                <Button
                  onClick={handleExportData}
                  variant="outline"
                  size="sm"
                  className="border-gold-400/30 shrink-0"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Export Data
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <div>
                  <h4 className="text-sm font-medium text-rose-300">
                    Purge Account & Diagnostic Archive
                  </h4>
                  <p className="text-xs text-rose-300/70">
                    Permanently delete all facial vectors, order receipts, and profile history.
                  </p>
                </div>
                <Button
                  onClick={() => setIsDeleteModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="border-rose-500/40 text-rose-400 hover:bg-rose-500/20 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Account
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* --- PHONE OTP VERIFY MODAL --- */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-0">
          <div className="w-full max-w-md p-6 rounded-2xl bg-surface border border-gold-400/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gold-400/10 pb-3">
              <h3 className="font-serif text-lg text-cream-100 font-normal flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-gold-400" /> Verify New Mobile Number
              </h3>
              <button
                onClick={() => setIsPhoneModalOpen(false)}
                className="text-cream-400 hover:text-cream-100 text-sm"
              >
                ✕
              </button>
            </div>

            {!otpSent ? (
              <div className="space-y-4">
                <p className="text-xs text-cream-300">
                  Enter your 10-digit mobile number to receive a simulated one-time passcode.
                </p>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-gold-400">
                    Phone Number
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 bg-base/80 border border-r-0 border-gold-400/30 rounded-l-xl text-xs text-cream-400">
                      +91
                    </span>
                    <Input
                      maxLength={10}
                      value={tempPhone}
                      onChange={(e) => setTempPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="9820112345"
                      className="rounded-l-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setIsPhoneModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSendPhoneOtp} className="shadow-gold-glow">
                    Send OTP
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-gold-400/10 border border-gold-400/30 text-xs text-gold-300">
                  Demo OTP code is <strong className="text-cream-100 font-mono">123456</strong>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-gold-400">
                    Enter 6-Digit Code
                  </label>
                  <Input
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="font-mono text-center tracking-widest text-lg"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setOtpSent(false)}
                    className="text-xs text-cream-400 hover:text-cream-200"
                  >
                    Change Number
                  </button>
                  <Button size="sm" onClick={handleVerifyPhoneOtp} className="shadow-gold-glow">
                    Verify & Update
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- ADD / EDIT ADDRESS MODAL --- */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-0">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-surface border border-gold-400/30 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gold-400/10 pb-3">
              <h3 className="font-serif text-lg text-cream-100 font-normal">
                {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h3>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="text-cream-400 hover:text-cream-100 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-gold-400">
                    Recipient Name *
                  </label>
                  <Input
                    value={addrForm.name}
                    onChange={(e) => setAddrForm({ ...addrForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-gold-400">
                    10-Digit Mobile *
                  </label>
                  <Input
                    maxLength={10}
                    value={addrForm.mobile}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, mobile: e.target.value.replace(/\D/g, "") })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-gold-400">
                  Flat, House No., Building, Street *
                </label>
                <Input
                  value={addrForm.addressLine1}
                  onChange={(e) => setAddrForm({ ...addrForm, addressLine1: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-gold-400">
                  Landmark, Area (Optional)
                </label>
                <Input
                  value={addrForm.addressLine2}
                  onChange={(e) => setAddrForm({ ...addrForm, addressLine2: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-gold-400">
                    City *
                  </label>
                  <Input
                    value={addrForm.city}
                    onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-gold-400">
                    State *
                  </label>
                  <select
                    value={addrForm.state}
                    onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-base border border-gold-400/30 text-xs text-cream-100 focus:outline-none"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st.code} value={st.name}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-gold-400">
                    PIN Code (6 digits) *
                  </label>
                  <Input
                    maxLength={6}
                    value={addrForm.pincode}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, pincode: e.target.value.replace(/\D/g, "") })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  {(["home", "work", "other"] as const).map((t) => (
                    <label key={t} className="flex items-center gap-1.5 text-xs text-cream-300 capitalize cursor-pointer">
                      <input
                        type="radio"
                        name="addressType"
                        checked={addrForm.type === t}
                        onChange={() => setAddrForm({ ...addrForm, type: t })}
                        className="accent-gold-400"
                      />
                      {t}
                    </label>
                  ))}
                </div>

                <label className="flex items-center gap-2 text-xs text-cream-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addrForm.isDefault}
                    onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                    className="accent-gold-400"
                  />
                  Set as Default
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gold-400/10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddressModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="shadow-gold-glow">
                  {editingAddressId ? "Save Changes" : "Save Address"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE ACCOUNT MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-0">
          <div className="w-full max-w-md p-6 rounded-2xl bg-surface border border-rose-500/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif text-lg font-normal text-cream-100">
                Confirm Account Purge
              </h3>
            </div>

            <p className="text-xs text-cream-300 leading-relaxed">
              This action cannot be undone. All your saved scans, facial topology biometric parameters, delivery addresses, and cart data will be permanently cleared from this device and store.
            </p>

            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-mono uppercase text-cream-400">
                Type <strong className="text-rose-400 font-bold">DELETE</strong> to confirm
              </label>
              <Input
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="border-rose-500/40 focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-rose-500/20">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmationText("");
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmationText.trim().toUpperCase() !== "DELETE"}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Purge All Data
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
