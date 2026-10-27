"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Building,
  User,
  ShieldCheck,
  CreditCard,
  FileUp,
  CheckCircle2,
  AlertCircle,
  Upload,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  FileText,
  Sliders,
} from "lucide-react";
import { useAppStore } from "@/store";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { showToast } from "@/components/ui/Toast";
import { INDIAN_STATES } from "@/config/commerce";
import categoriesData from "@/data/categories.json";

interface DocUploadState {
  name: string;
  size: number;
  type: string;
  progress: number;
  uploaded: boolean;
}

function SellerRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isResubmit = searchParams.get("mode") === "resubmit";

  const {
    sellerKycDraft,
    saveSellerKycDraft,
    registerSellerAndLogin,
  } = useAppStore();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  // Form State initialized from draft if available
  const [formData, setFormData] = useState({
    // Step 1: Account
    ownerName: sellerKycDraft?.ownerName || "",
    email: sellerKycDraft?.email || "",
    mobile: sellerKycDraft?.mobile || "",
    password: sellerKycDraft?.password || "",

    // Step 2: Business
    companyName: sellerKycDraft?.companyName || "",
    brandName: sellerKycDraft?.brandName || "",
    businessType: sellerKycDraft?.businessType || "Distributor",
    address: sellerKycDraft?.address || "",
    city: sellerKycDraft?.city || "",
    state: sellerKycDraft?.state || "Maharashtra",
    pincode: sellerKycDraft?.pincode || "",
    yearsInBusiness: sellerKycDraft?.yearsInBusiness || 5,
    categories: sellerKycDraft?.categories || ["skincare"],

    // Step 3: Compliance
    gstin: sellerKycDraft?.gstin || "",
    pan: sellerKycDraft?.pan || "",
    cosmeticsLicence: sellerKycDraft?.cosmeticsLicence || "",
    fssaiLicence: sellerKycDraft?.fssaiLicence || "",

    // Step 4: Bank
    accountHolder: sellerKycDraft?.accountHolder || "",
    accountNumber: sellerKycDraft?.accountNumber || "",
    confirmAccountNumber: sellerKycDraft?.confirmAccountNumber || "",
    ifsc: sellerKycDraft?.ifsc || "",
    bankName: sellerKycDraft?.bankName || "HDFC Bank",
  });

  // Step 5: Documents (simulated metadata)
  const [documents, setDocuments] = useState<Record<string, DocUploadState | null>>({
    gstCertificate: isResubmit ? { name: "gst_certificate_2026.pdf", size: 1024 * 350, type: "application/pdf", progress: 100, uploaded: true } : null,
    panCard: isResubmit ? { name: "company_pan_card.jpg", size: 1024 * 220, type: "image/jpeg", progress: 100, uploaded: true } : null,
    cancelledCheque: isResubmit ? { name: "cancelled_cheque_hdfc.png", size: 1024 * 410, type: "image/png", progress: 100, uploaded: true } : null,
    businessLicence: isResubmit ? { name: "cosmetics_drug_licence.pdf", size: 1024 * 512, type: "application/pdf", progress: 100, uploaded: true } : null,
  });

  // Step 6: Agreement
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync to store draft
  useEffect(() => {
    saveSellerKycDraft(formData);
  }, [formData, saveSellerKycDraft]);

  // Password strength calculator
  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "Empty", color: "bg-gray-600" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score: 25, label: "Weak", color: "bg-[#D4604F]" };
    if (score === 3) return { score: 50, label: "Fair", color: "bg-[#E0A93B]" };
    if (score === 4) return { score: 75, label: "Strong", color: "bg-[#C99A45]" };
    return { score: 100, label: "Excellent", color: "bg-[#5FAF7A]" };
  };

  const pwdStrength = calculatePasswordStrength(formData.password);

  const validateStep = (currentStep: number): boolean => {
    const errs: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.ownerName || formData.ownerName.trim().length < 3) {
        errs.ownerName = "Owner name must be at least 3 characters";
      }
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errs.email = "Valid business email is required";
      }
      if (!formData.mobile || !/^[6-9]\d{9}$/.test(formData.mobile)) {
        errs.mobile = "10-digit Indian mobile number starting with 6-9 is required";
      }
      if (!formData.password || formData.password.length < 8) {
        errs.password = "Password must be at least 8 characters with upper, lower, and numbers";
      }
    } else if (currentStep === 2) {
      if (!formData.companyName || formData.companyName.trim().length < 3) {
        errs.companyName = "Company legal name is required";
      }
      if (!formData.brandName) {
        errs.brandName = "Brand / trade name is required";
      }
      if (!formData.address || formData.address.length < 10) {
        errs.address = "Registered address must be at least 10 characters";
      }
      if (!formData.city) errs.city = "City is required";
      if (!formData.pincode || !/^\d{6}$/.test(formData.pincode)) {
        errs.pincode = "Enter a valid 6-digit postal pincode";
      }
      if (!formData.categories || formData.categories.length === 0) {
        errs.categories = "Select at least 1 product category";
      }
    } else if (currentStep === 3) {
      const gstinRegex = /^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!formData.gstin || !gstinRegex.test(formData.gstin.toUpperCase())) {
        errs.gstin = "Enter a valid 15-character GSTIN (e.g. 27AABCR8812M1Z4 with 2-digit state code)";
      }
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!formData.pan || !panRegex.test(formData.pan.toUpperCase())) {
        errs.pan = "Enter a valid 10-character PAN (e.g. AABCR8812M)";
      }
      if (!formData.cosmeticsLicence) {
        errs.cosmeticsLicence = "Cosmetics licence or establishment certificate is required";
      }
    } else if (currentStep === 4) {
      if (!formData.accountHolder || formData.accountHolder.length < 3) {
        errs.accountHolder = "Account holder name is required";
      }
      if (!formData.accountNumber || !/^\d{9,18}$/.test(formData.accountNumber)) {
        errs.accountNumber = "Account number must be 9 to 18 digits";
      }
      if (formData.accountNumber !== formData.confirmAccountNumber) {
        errs.confirmAccountNumber = "Account numbers do not match";
      }
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!formData.ifsc || !ifscRegex.test(formData.ifsc.toUpperCase())) {
        errs.ifsc = "Enter a valid 11-character IFSC (e.g. HDFC0001234)";
      }
    } else if (currentStep === 5) {
      if (!documents.gstCertificate?.uploaded) errs.gstCertificate = "GST certificate upload is required";
      if (!documents.panCard?.uploaded) errs.panCard = "PAN card upload is required";
      if (!documents.cancelledCheque?.uploaded) errs.cancelledCheque = "Cancelled cheque upload is required";
      if (!documents.businessLicence?.uploaded) errs.businessLicence = "Business licence upload is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(6, prev + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      showToast.error("Please resolve the highlighted fields to proceed.");
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSimulatedFileUpload = (docKey: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast.error("File exceeds maximum allowed limit of 5MB.");
      return;
    }
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      showToast.error("Only PDF, JPG, or PNG files are accepted.");
      return;
    }

    // Start upload simulation
    setDocuments((prev) => ({
      ...prev,
      [docKey]: {
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 30,
        uploaded: false,
      },
    }));

    setTimeout(() => {
      setDocuments((prev) => ({
        ...prev,
        [docKey]: {
          ...prev[docKey]!,
          progress: 75,
        },
      }));
    }, 200);

    setTimeout(() => {
      setDocuments((prev) => ({
        ...prev,
        [docKey]: {
          ...prev[docKey]!,
          progress: 100,
          uploaded: true,
        },
      }));
      showToast.success(`Uploaded ${file.name}`);
    }, 450);
  };

  const handleSubmitRegistration = () => {
    if (!agreementChecked) {
      showToast.error("Please accept the Celebs Alley Marketplace Distributor Agreement.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      // Register seller in store
      registerSellerAndLogin({
        ...formData,
        bankName: formData.bankName,
      });

      showToast.success("Application submitted successfully! Redirecting to KYC dashboard.");
      router.push("/seller");
    }, 600);
  };

  const stepsList = [
    { num: 1, label: "Account" },
    { num: 2, label: "Business" },
    { num: 3, label: "Compliance" },
    { num: 4, label: "Bank" },
    { num: 5, label: "Documents" },
    { num: 6, label: "Review" },
  ];

  return (
    <div className="min-h-screen bg-[#0B0907] text-[#F5EDE0] flex flex-col font-sans selection:bg-[#C99A45]/30">
      {/* Top Bar */}
      <header className="h-20 px-6 sm:px-10 border-b border-[#C99A45]/20 bg-[#1A130B]/90 backdrop-blur-md flex items-center justify-between">
        <Logo variant="with-tagline" size="md" />
        <div className="flex items-center gap-3">
          <Link
            href="/seller/login"
            className="text-xs text-[#A89A85] hover:text-[#E8C77A] transition-colors"
          >
            Already registered? <span className="font-semibold text-[#E8C77A] underline">Sign In</span>
          </Link>
        </div>
      </header>

      {/* Stepper Header */}
      <div className="px-4 sm:px-10 py-4 bg-[#1A130B] border-b border-[#C99A45]/15">
        <div className="max-w-4xl mx-auto flex items-center justify-between overflow-x-auto gap-2">
          {stepsList.map((st) => (
            <div
              key={st.num}
              className={`flex items-center gap-2 py-1 px-2.5 rounded-lg text-xs font-medium transition-all ${
                step === st.num
                  ? "bg-[#C99A45]/20 text-[#E8C77A] border border-[#C99A45]/40"
                  : step > st.num
                  ? "text-[#5FAF7A]"
                  : "text-[#A89A85]"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === st.num
                    ? "bg-[#E8C77A] text-[#0B0907]"
                    : step > st.num
                    ? "bg-[#5FAF7A] text-[#0B0907]"
                    : "bg-[#241A0F] text-[#A89A85]"
                }`}
              >
                {step > st.num ? <Check className="w-3 h-3 stroke-[3]" /> : st.num}
              </span>
              <span className="hidden sm:inline">{st.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Registration Form Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-6">
        <AnimatePresence mode="wait">
          {/* STEP 1: ACCOUNT */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <Badge variant="gold" size="sm">Step 1 of 6</Badge>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5EDE0]">
                  Distributor Account & Credentials
                </h1>
                <p className="text-xs text-[#A89A85]">
                  Create your master administrator profile for the Celebs Alley B2B portal.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-[#1A130B] border border-[#C99A45]/20 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">
                      Managing Director / Owner Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kabir Singhania"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                    />
                    {errors.ownerName && (
                      <p className="text-[10px] text-[#D4604F]">{errors.ownerName}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">
                      Official Corporate Email *
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. kabir@royalbeauty.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                    />
                    {errors.email && (
                      <p className="text-[10px] text-[#D4604F]">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">
                      Mobile Number (+91) *
                    </label>
                    <div className="flex items-center rounded-xl bg-[#0B0907] border border-[#C99A45]/30 px-3">
                      <span className="text-xs text-[#A89A85] select-none font-mono">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="98200 11005"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, "") })}
                        className="flex-1 py-2.5 bg-transparent text-xs text-[#F5EDE0] focus:outline-none ml-2 font-mono"
                      />
                    </div>
                    {errors.mobile && (
                      <p className="text-[10px] text-[#D4604F]">{errors.mobile}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 8 characters"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89A85] hover:text-[#F5EDE0]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Password Strength Meter */}
                    {formData.password && (
                      <div className="space-y-1 pt-1">
                        <div className="h-1.5 w-full bg-[#241A0F] rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${pwdStrength.color}`}
                            style={{ width: `${pwdStrength.score}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-[#A89A85]">
                          Strength: <strong className="text-[#F5EDE0]">{pwdStrength.label}</strong>
                        </span>
                      </div>
                    )}
                    {errors.password && (
                      <p className="text-[10px] text-[#D4604F]">{errors.password}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Link href="/seller/login">
                  <Button variant="outline" size="md">
                    Back to Login
                  </Button>
                </Link>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNextStep}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Continue to Business Details
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: BUSINESS */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <Badge variant="gold" size="sm">Step 2 of 6</Badge>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5EDE0]">
                  Corporate & Trade Information
                </h1>
                <p className="text-xs text-[#A89A85]">
                  Registered company identity, business type, and primary cosmetic categories.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-[#1A130B] border border-[#C99A45]/20 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">
                      Company Legal Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Royal Beauty Logistics Private Limited"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                    />
                    {errors.companyName && (
                      <p className="text-[10px] text-[#D4604F]">{errors.companyName}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">
                      Brand / Trade Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Royal Beauty Logistics"
                      value={formData.brandName}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                    />
                    {errors.brandName && (
                      <p className="text-[10px] text-[#D4604F]">{errors.brandName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">
                      Business Structure *
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                    >
                      <option value="Distributor">Distributor</option>
                      <option value="Brand owner">Brand owner</option>
                      <option value="Retailer">Retailer</option>
                      <option value="Salon/Clinic supplier">Salon/Clinic supplier</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">
                      Years in Cosmeceutical Business *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.yearsInBusiness}
                      onChange={(e) => setFormData({ ...formData, yearsInBusiness: Number(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A89A85]">
                    Registered Warehouse / Corporate Address *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Unit, Building, Street, Landmark"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                  />
                  {errors.address && (
                    <p className="text-[10px] text-[#D4604F]">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">City *</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                    />
                    {errors.city && <p className="text-[10px] text-[#D4604F]">{errors.city}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">State *</label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st.code} value={st.name}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">Pincode *</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="400001"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "") })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none font-mono"
                    />
                    {errors.pincode && <p className="text-[10px] text-[#D4604F]">{errors.pincode}</p>}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-[#A89A85]">
                    Product Categories Handled (Multi-select) *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categoriesData.map((cat: any) => {
                      const isSelected = formData.categories.includes(cat.slug);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              categories: isSelected
                                ? prev.categories.filter((c: string) => c !== cat.slug)
                                : [...prev.categories, cat.slug],
                            }));
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            isSelected
                              ? "bg-[#C99A45]/20 border-[#E8C77A] text-[#E8C77A]"
                              : "bg-[#0B0907] border-[#C99A45]/25 text-[#A89A85] hover:text-[#F5EDE0]"
                          }`}
                        >
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                  {errors.categories && (
                    <p className="text-[10px] text-[#D4604F]">{errors.categories}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" size="md" onClick={handlePrevStep} leftIcon={<ChevronLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button variant="primary" size="md" onClick={handleNextStep} rightIcon={<ChevronRight className="w-4 h-4" />} >
                  Continue to Compliance
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: COMPLIANCE */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <Badge variant="gold" size="sm">Step 3 of 6</Badge>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5EDE0]">
                  Tax & Regulatory Compliance
                </h1>
                <p className="text-xs text-[#A89A85]">
                  Indian GSTIN validation, PAN verification, and cosmetic formulation licensing.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-[#1A130B] border border-[#C99A45]/20 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">
                      15-Digit GSTIN Number *
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="e.g. 27AABCR8812M1Z4"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none font-mono uppercase"
                    />
                    <p className="text-[10px] text-[#A89A85]">
                      Format: 2 state digits + 10 PAN + 1 entity + Z + 1 check digit
                    </p>
                    {errors.gstin && <p className="text-[10px] text-[#D4604F]">{errors.gstin}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">
                      10-Digit Company PAN *
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="e.g. AABCR8812M"
                      value={formData.pan}
                      onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none font-mono uppercase"
                    />
                    {errors.pan && <p className="text-[10px] text-[#D4604F]">{errors.pan}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">
                      Cosmetics Distribution / Mfg Licence *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. COS-MH-2024-9912"
                      value={formData.cosmeticsLicence}
                      onChange={(e) => setFormData({ ...formData, cosmeticsLicence: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none font-mono"
                    />
                    {errors.cosmeticsLicence && (
                      <p className="text-[10px] text-[#D4604F]">{errors.cosmeticsLicence}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">
                      FSSAI / Drug Licence Number (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 11520018000412"
                      value={formData.fssaiLicence}
                      onChange={(e) => setFormData({ ...formData, fssaiLicence: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" size="md" onClick={handlePrevStep} leftIcon={<ChevronLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button variant="primary" size="md" onClick={handleNextStep} rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Continue to Bank Setup
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: BANK */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <Badge variant="gold" size="sm">Step 4 of 6</Badge>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5EDE0]">
                  Settlement & Payout Bank Account
                </h1>
                <p className="text-xs text-[#A89A85]">
                  Escrow release destination for your weekly delivered order payouts. (Privacy guarantee: Only last 4 digits are persisted).
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-[#1A130B] border border-[#C99A45]/20 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="e.g. HDFC Bank, ICICI Bank"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Must match company legal entity"
                      value={formData.accountHolder}
                      onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none"
                    />
                    {errors.accountHolder && (
                      <p className="text-[10px] text-[#D4604F]">{errors.accountHolder}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">
                      Account Number *
                    </label>
                    <input
                      type="password"
                      placeholder="9 to 18 digit account number"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, "") })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none font-mono"
                    />
                    {errors.accountNumber && (
                      <p className="text-[10px] text-[#D4604F]">{errors.accountNumber}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A89A85]">
                      Confirm Account Number *
                    </label>
                    <input
                      type="text"
                      placeholder="Re-enter account number"
                      value={formData.confirmAccountNumber}
                      onChange={(e) => setFormData({ ...formData, confirmAccountNumber: e.target.value.replace(/\D/g, "") })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none font-mono"
                    />
                    {errors.confirmAccountNumber && (
                      <p className="text-[10px] text-[#D4604F]">{errors.confirmAccountNumber}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 sm:w-1/2">
                  <label className="text-xs font-semibold text-[#A89A85]">
                    11-Character IFSC Code *
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    placeholder="e.g. HDFC0001234"
                    value={formData.ifsc}
                    onChange={(e) => setFormData({ ...formData, ifsc: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0907] border border-[#C99A45]/30 text-xs text-[#F5EDE0] focus:border-[#E8C77A] focus:outline-none font-mono uppercase"
                  />
                  {errors.ifsc && <p className="text-[10px] text-[#D4604F]">{errors.ifsc}</p>}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" size="md" onClick={handlePrevStep} leftIcon={<ChevronLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button variant="primary" size="md" onClick={handleNextStep} rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Continue to Documents
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: DOCUMENTS */}
          {step === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <Badge variant="gold" size="sm">Step 5 of 6</Badge>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5EDE0]">
                  Document Verification Uploads
                </h1>
                <p className="text-xs text-[#A89A85]">
                  Simulated dropzones (accepts PDF, JPG, PNG up to 5MB). File metadata only is stored.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "gstCertificate", label: "GST Certificate (Form REG-06) *" },
                  { key: "panCard", label: "Company / Proprietor PAN Card *" },
                  { key: "cancelledCheque", label: "Bank Cancelled Cheque / Statement *" },
                  { key: "businessLicence", label: "Cosmetics / Drug Licence Copy *" },
                ].map((doc) => {
                  const currentDoc = documents[doc.key];
                  const hasError = errors[doc.key];

                  return (
                    <div
                      key={doc.key}
                      className={`p-5 rounded-2xl bg-[#1A130B] border transition-all ${
                        hasError
                          ? "border-[#D4604F]/60"
                          : currentDoc?.uploaded
                          ? "border-[#5FAF7A]/50 bg-[#5FAF7A]/5"
                          : "border-[#C99A45]/20 hover:border-[#C99A45]/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-[#F5EDE0]">
                          {doc.label}
                        </label>
                        {currentDoc?.uploaded && (
                          <Badge variant="success" size="sm">
                            Uploaded
                          </Badge>
                        )}
                      </div>

                      {currentDoc ? (
                        <div className="p-3 rounded-xl bg-[#0B0907] border border-[#C99A45]/20 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText className="w-4 h-4 text-[#E8C77A] flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-mono text-[#F5EDE0] truncate">
                                {currentDoc.name}
                              </p>
                              <span className="text-[10px] text-[#A89A85]">
                                {(currentDoc.size / 1024).toFixed(0)} KB
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setDocuments((prev) => ({ ...prev, [doc.key]: null }))
                            }
                            className="p-1 rounded text-[#A89A85] hover:text-[#D4604F]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-[#C99A45]/30 hover:border-[#E8C77A] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#0B0907]/50">
                          <Upload className="w-5 h-5 text-[#E8C77A] mb-1" />
                          <span className="text-xs text-[#F5EDE0] font-medium">
                            Choose File or Drag & Drop
                          </span>
                          <span className="text-[10px] text-[#A89A85]">
                            PDF, PNG, JPG (Max 5MB)
                          </span>
                          <input
                            type="file"
                            accept=".pdf,image/png,image/jpeg"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleSimulatedFileUpload(doc.key, f);
                            }}
                          />
                        </label>
                      )}

                      {hasError && (
                        <p className="text-[10px] text-[#D4604F] mt-1.5">{hasError}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" size="md" onClick={handlePrevStep} leftIcon={<ChevronLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button variant="primary" size="md" onClick={handleNextStep} rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Review & Submit
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 6: REVIEW AND SUBMIT */}
          {step === 6 && (
            <motion.div
              key="step-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <Badge variant="gold" size="sm">Step 6 of 6</Badge>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5EDE0]">
                  Review Distributor Application
                </h1>
                <p className="text-xs text-[#A89A85]">
                  Please confirm your credentials before lodging for platform compliance auditing.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-[#1A130B] border border-[#C99A45]/20 space-y-6">
                {/* Summary Table */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#241A0F] space-y-1">
                    <span className="text-[#A89A85]">Corporate Entity:</span>
                    <p className="font-semibold text-[#F5EDE0]">{formData.companyName}</p>
                    <p className="text-[11px] text-[#A89A85]">Trade: {formData.brandName} • {formData.businessType}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#241A0F] space-y-1">
                    <span className="text-[#A89A85]">Administrator:</span>
                    <p className="font-semibold text-[#F5EDE0]">{formData.ownerName}</p>
                    <p className="text-[11px] text-[#A89A85]">{formData.email} • +91 {formData.mobile}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#241A0F] space-y-1">
                    <span className="text-[#A89A85]">Tax & Licences:</span>
                    <p className="font-mono font-semibold text-[#F5EDE0]">GSTIN: {formData.gstin}</p>
                    <p className="font-mono text-[11px] text-[#A89A85]">PAN: {formData.pan} • Lic: {formData.cosmeticsLicence}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#241A0F] space-y-1">
                    <span className="text-[#A89A85]">Settlement Bank:</span>
                    <p className="font-semibold text-[#F5EDE0]">{formData.bankName} (•••• {formData.accountNumber.slice(-4)})</p>
                    <p className="font-mono text-[11px] text-[#A89A85]">IFSC: {formData.ifsc} • Name: {formData.accountHolder}</p>
                  </div>
                </div>

                {/* Agreement Checkbox */}
                <label className="flex items-start gap-3 p-4 rounded-2xl bg-[#0B0907] border border-[#C99A45]/25 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreementChecked}
                    onChange={(e) => setAgreementChecked(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded accent-[#E8C77A] cursor-pointer"
                  />
                  <span className="text-xs text-[#A89A85] leading-relaxed select-none">
                    I solemnly declare that all company documents, GSTIN declarations, and batch certificates provided are authentic and compliant with Indian Cosmeceutical & Drug Administration regulations. I agree to the <strong className="text-[#E8C77A]">Celebs Alley Marketplace Vendor Terms</strong> and platform escrow payout schedules.
                  </span>
                </label>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" size="md" onClick={handlePrevStep} leftIcon={<ChevronLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  onClick={handleSubmitRegistration}
                  rightIcon={<CheckCircle2 className="w-5 h-5 text-[#0B0907]" />}
                >
                  Submit Application for KYC Review
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function SellerRegistrationPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0907] flex items-center justify-center text-[#E8C77A] text-xs font-mono">
          Loading registration portal...
        </div>
      }
    >
      <SellerRegistrationContent />
    </React.Suspense>
  );
}
