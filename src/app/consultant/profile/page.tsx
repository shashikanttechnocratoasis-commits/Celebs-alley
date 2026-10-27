"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Switch } from "@/components/ui/Switch";
import { showToast } from "@/components/ui/Toast";
import { formatPaise } from "@/lib/utils";
import {
  User,
  Star,
  IndianRupee,
  Shield,
  Award,
  BookOpen,
  MapPin,
  Save,
  Download,
  CheckCircle2,
  Bell,
  Languages,
  Calendar,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function DoctorProfileCredentialsPage() {
  const {
    currentUser,
    consultants,
    consultantReviews,
    appointments,
    updateConsultantProfile,
    platformSettings,
  } = useAppStore();

  const activeConsultantId =
    currentUser?.consultantId ||
    (currentUser?.id === "user-consultant"
      ? "cons-1"
      : currentUser?.id === "user-consultant-2"
      ? "cons-2"
      : currentUser?.id === "user-consultant-3"
      ? "cons-3"
      : "cons-1");

  const consultant = useMemo(() => {
    return consultants.find((c) => c.id === activeConsultantId) || consultants[0];
  }, [consultants, activeConsultantId]);

  // Reviews for this consultant
  const myReviews = useMemo(() => {
    return consultantReviews.filter((r) => r.consultantId === activeConsultantId);
  }, [consultantReviews, activeConsultantId]);

  // Average rating
  const avgRating = useMemo(() => {
    if (!myReviews.length) return consultant?.rating || 4.9;
    const sum = myReviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / myReviews.length).toFixed(1));
  }, [myReviews, consultant]);

  // Active Tab: "profile" | "earnings" | "reviews" | "notifications"
  const [tab, setTab] = useState<"profile" | "earnings" | "reviews" | "notifications">(
    "profile"
  );

  // Profile Form state
  const [bio, setBio] = useState(consultant?.bio || "");
  const [title, setTitle] = useState(consultant?.title || "");
  const [qualifications, setQualifications] = useState(
    Array.isArray(consultant?.qualifications)
      ? (consultant?.qualifications as string[]).join(", ")
      : (consultant?.qualifications || "MBBS, MD Dermatology (AIIMS), FAM")
  );
  const [specialties, setSpecialties] = useState(
    Array.isArray(consultant?.specialties)
      ? consultant.specialties.join(", ")
      : "Acne Vulgaris, Barrier Repair, Pigmentation"
  );
  const [languages, setLanguages] = useState(
    Array.isArray(consultant?.languages)
      ? consultant.languages.join(", ")
      : "English, Hindi, Kannada"
  );
  const [feeRupees, setFeeRupees] = useState(
    consultant?.pricePaise
      ? consultant.pricePaise / 100
      : consultant?.consultationFee || 1500
  );
  const [avatarUrl, setAvatarUrl] = useState(consultant?.avatar || "");

  // Notification Preferences state
  const [notifySms, setNotifySms] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyNewBooking, setNotifyNewBooking] = useState(true);
  const [notifyChat, setNotifyChat] = useState(true);

  // Financial calculations
  const completedAppointments = useMemo(() => {
    return appointments.filter(
      (a) => a.consultantId === activeConsultantId && a.status === "completed"
    );
  }, [appointments, activeConsultantId]);

  const consultantCommissionPercent =
    platformSettings?.consultantCommissionPercent ?? 15;
  const commissionRate = consultantCommissionPercent / 100;
  const doctorTakeHome = 1 - commissionRate;

  const totalGrossPaise = completedAppointments.reduce(
    (sum, a) => sum + (a.pricePaise || 150000),
    0
  );
  const totalNetEarningsPaise = Math.round(totalGrossPaise * doctorTakeHome);

  // Monthly Earnings Bar Data
  const monthlyEarningsData = [
    { month: "May", gross: 32000, net: 27200 },
    { month: "Jun", gross: 45000, net: 38250 },
    { month: "Jul", gross: 58000, net: 49300 },
    { month: "Aug", gross: 51000, net: 43350 },
    { month: "Sep", gross: 64000, net: 54400 },
    { month: "Oct", gross: Math.max(50000, totalGrossPaise / 100), net: Math.max(42500, totalNetEarningsPaise / 100) },
  ];

  // Save profile changes
  const handleSaveProfile = () => {
    updateConsultantProfile(activeConsultantId, {
      bio,
      title,
      avatar: avatarUrl,
      consultationFee: feeRupees,
      pricePaise: feeRupees * 100,
      qualifications,
      specialties: specialties.split(",").map((s: string) => s.trim()),
      languages: languages.split(",").map((s: string) => s.trim()),
    });
    showToast.success("Profile credentials updated and synced to public directory");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Doctor Profile & Financials"
        breadcrumbs={[
          { label: "Consultant", href: "/consultant" },
          { label: "Profile" },
        ]}
        action={
          <Button variant="gold" size="sm" onClick={handleSaveProfile}>
            <Save className="w-4 h-4 mr-1.5" />
            Save Profile
          </Button>
        }
      />

      {/* Tab Nav */}
      <div className="flex items-center gap-2 border-b border-[#C99A45]/20 pb-2">
        <button
          onClick={() => setTab("profile")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            tab === "profile"
              ? "bg-[#C99A45] text-[#0B0907]"
              : "text-[#A89A85] hover:text-[#F5EDE0]"
          }`}
        >
          Public Clinical Profile
        </button>
        <button
          onClick={() => setTab("earnings")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            tab === "earnings"
              ? "bg-[#C99A45] text-[#0B0907]"
              : "text-[#A89A85] hover:text-[#F5EDE0]"
          }`}
        >
          <IndianRupee className="w-3.5 h-3.5" /> Earnings & Payouts
        </button>
        <button
          onClick={() => setTab("reviews")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            tab === "reviews"
              ? "bg-[#C99A45] text-[#0B0907]"
              : "text-[#A89A85] hover:text-[#F5EDE0]"
          }`}
        >
          <Star className="w-3.5 h-3.5" /> Patient Reviews ({myReviews.length})
        </button>
        <button
          onClick={() => setTab("notifications")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            tab === "notifications"
              ? "bg-[#C99A45] text-[#0B0907]"
              : "text-[#A89A85] hover:text-[#F5EDE0]"
          }`}
        >
          <Bell className="w-3.5 h-3.5" /> Notification Preferences
        </button>
      </div>

      {/* 1. PUBLIC PROFILE TAB */}
      {tab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-5">
            <Card className="p-6 bg-[#140F0A] border-[#C99A45]/20 space-y-4">
              <h3 className="font-serif text-base font-semibold text-[#F5EDE0]">
                Doctor Bio & Credentials
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#A89A85] mb-1 block">
                    Professional Title
                  </label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-[#A89A85] mb-1 block">
                    Consultation Fee (₹ INR)
                  </label>
                  <Input
                    type="number"
                    value={feeRupees}
                    onChange={(e) => setFeeRupees(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#A89A85] mb-1 block">
                  Degrees & Medical Qualifications (comma separated)
                </label>
                <Input
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-[#A89A85] mb-1 block">
                  Clinical Specialties (comma separated)
                </label>
                <Input
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-[#A89A85] mb-1 block">
                  Languages Spoken
                </label>
                <Input
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-[#A89A85] mb-1 block">
                  Public Practice Biography
                </label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <label className="text-xs text-[#A89A85] mb-1 block">
                  Doctor Profile Picture (URL)
                </label>
                <Input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="gold" onClick={handleSaveProfile}>
                  Update Public Profile
                </Button>
              </div>
            </Card>
          </div>

          {/* Profile Card Preview */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-xs uppercase font-semibold text-[#A89A85]">
              Directory Card Preview (/experts)
            </span>

            <Card className="p-6 bg-[#140F0A] border-[#C99A45]/30 text-center space-y-4">
              <Avatar
                src={avatarUrl || consultant?.avatar}
                name={consultant?.name || "Doctor"}
                size="lg"
                className="mx-auto"
              />
              <div className="space-y-1">
                <h4 className="font-serif text-lg font-bold text-[#F5EDE0]">
                  {consultant?.name}
                </h4>
                <p className="text-xs text-[#E8C77A] font-medium">{title}</p>
                <p className="text-[11px] text-[#A89A85]">{qualifications}</p>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs text-yellow-400">
                <Star className="w-4 h-4 fill-yellow-400" />
                <span className="font-bold text-[#F5EDE0]">{avgRating}</span>
                <span className="text-[#A89A85]">({myReviews.length} reviews)</span>
              </div>

              <div className="p-3 rounded-xl bg-[#1A130B] border border-[#C99A45]/15 text-xs text-left space-y-1">
                <div className="text-[#A89A85]">
                  Fee:{" "}
                  <strong className="text-[#F5EDE0]">₹{feeRupees} / 30m</strong>
                </div>
                <div className="text-[#A89A85]">
                  Languages:{" "}
                  <span className="text-[#F5EDE0]">{languages}</span>
                </div>
              </div>

              <Button asChild variant="outline" className="w-full text-xs">
                <Link href={`/experts/${consultant?.slug || "dr-meera-nambiar"}`}>
                  View Live Public Page
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* 2. EARNINGS & PAYOUTS TAB */}
      {tab === "earnings" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 bg-[#140F0A] border-[#C99A45]/20 space-y-1">
              <span className="text-xs text-[#A89A85]">Lifetime Net Earnings</span>
              <div className="text-2xl font-serif font-bold text-[#E8C77A]">
                {formatPaise(totalNetEarningsPaise)}
              </div>
              <p className="text-[11px] text-[#5FAF7A]">
                Net after {consultantCommissionPercent}% platform commission
              </p>
            </Card>

            <Card className="p-5 bg-[#140F0A] border-[#C99A45]/20 space-y-1">
              <span className="text-xs text-[#A89A85]">Completed Consultations</span>
              <div className="text-2xl font-serif font-bold text-[#F5EDE0]">
                {completedAppointments.length}
              </div>
              <p className="text-[11px] text-[#A89A85]">
                Verified telemedicine & clinic
              </p>
            </Card>

            <Card className="p-5 bg-[#140F0A] border-[#C99A45]/20 space-y-1">
              <span className="text-xs text-[#A89A85]">Platform Commission Rate</span>
              <div className="text-2xl font-serif font-bold text-amber-400">
                {consultantCommissionPercent}%
              </div>
              <p className="text-[11px] text-[#A89A85]">Doctor receives {Math.round(doctorTakeHome * 100)}% net</p>
            </Card>
          </div>

          {/* Monthly Earnings Chart */}
          <Card className="p-6 bg-[#140F0A] border-[#C99A45]/20 space-y-4">
            <h3 className="font-serif text-base font-semibold text-[#F5EDE0]">
              Monthly Clinical Revenue Velocity (₹ INR)
            </h3>
            <div className="h-64 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyEarningsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#C99A45" strokeOpacity={0.1} />
                  <XAxis dataKey="month" stroke="#A89A85" fontSize={11} />
                  <YAxis stroke="#A89A85" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A130B",
                      borderColor: "#C99A45",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#F5EDE0",
                    }}
                  />
                  <Bar dataKey="gross" name="Gross Consultation GMV" fill="#C99A45" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="net" name="Net Doctor Payout" fill="#5FAF7A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Statement List */}
          <Card className="p-5 bg-[#140F0A] border-[#C99A45]/20 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-semibold text-[#F5EDE0]">
                Settlement Statements
              </h3>
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7"
                onClick={() => showToast.info("Simulated CSV statement downloaded")}
              >
                <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
              </Button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { ref: "STMT-2026-OCT", period: "01 Oct - 15 Oct 2026", amount: "₹42,500", status: "Settled" },
                { ref: "STMT-2026-SEP", period: "16 Sep - 30 Sep 2026", amount: "₹38,250", status: "Settled" },
                { ref: "STMT-2026-AUG", period: "01 Sep - 15 Sep 2026", amount: "₹49,300", status: "Settled" },
              ].map((s) => (
                <div
                  key={s.ref}
                  className="p-3 rounded-xl bg-[#1A130B] border border-[#C99A45]/15 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-[#F5EDE0]">{s.ref}</span>
                    <div className="text-[11px] text-[#A89A85]">{s.period}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#E8C77A]">{s.amount}</span>
                    <Badge variant="success" size="sm" className="ml-2">
                      {s.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* 3. PATIENT REVIEWS TAB */}
      {tab === "reviews" && (
        <Card className="p-6 bg-[#140F0A] border-[#C99A45]/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-semibold text-[#F5EDE0]">
              Verified Patient Reviews & Ratings
            </h3>
            <Badge variant="gold" size="sm">
              Average {avgRating} ★
            </Badge>
          </div>

          <div className="space-y-3 pt-2">
            {myReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-xl bg-[#1A130B] border border-[#C99A45]/15 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#F5EDE0]">
                      {rev.customerName}
                    </span>
                    <Badge variant="outline" size="sm">
                      Verified Consultation
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-[#A89A85]">&ldquo;{rev.comment}&rdquo;</p>
                <span className="text-[10px] text-[#A89A85]/70 block">
                  {rev.createdAt}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 4. NOTIFICATION PREFERENCES TAB */}
      {tab === "notifications" && (
        <Card className="p-6 bg-[#140F0A] border-[#C99A45]/20 space-y-5 max-w-xl">
          <h3 className="font-serif text-base font-semibold text-[#F5EDE0]">
            Clinical Telemedicine Alerts
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1A130B] border border-[#C99A45]/15">
              <div>
                <span className="font-semibold text-[#F5EDE0]">
                  New Booking Alert
                </span>
                <p className="text-[11px] text-[#A89A85]">
                  Instant notification when a client requests a consultation
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifyNewBooking}
                onChange={(e) => setNotifyNewBooking(e.target.checked)}
                className="accent-[#C99A45] w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1A130B] border border-[#C99A45]/15">
              <div>
                <span className="font-semibold text-[#F5EDE0]">
                  Client Chat Direct Messages
                </span>
                <p className="text-[11px] text-[#A89A85]">
                  Push notifications when a client sends a routine query
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifyChat}
                onChange={(e) => setNotifyChat(e.target.checked)}
                className="accent-[#C99A45] w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1A130B] border border-[#C99A45]/15">
              <div>
                <span className="font-semibold text-[#F5EDE0]">
                  SMS Alerts for 10m Call Reminders
                </span>
                <p className="text-[11px] text-[#A89A85]">
                  Receive an automated SMS 10 minutes prior to call start
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifySms}
                onChange={(e) => setNotifySms(e.target.checked)}
                className="accent-[#C99A45] w-4 h-4"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="gold"
                size="sm"
                onClick={() => showToast.success("Notification preferences saved")}
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
