"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ResultsRadarChart } from "@/components/app/ResultsRadarChart";
import { ParameterGauge } from "@/components/app/ParameterGauge";
import { showToast } from "@/components/ui/Toast";
import type { Customer, ClientNote, ScanRecord, SoapNote } from "@/types";
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  Lock,
  Unlock,
  Eye,
  FileText,
  Calendar,
  Sparkles,
  AlertTriangle,
  History,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Save,
  ChevronRight,
  TrendingUp,
  Activity,
  Heart,
  Tag,
} from "lucide-react";

export default function ClientManagementPage() {
  const searchParams = useSearchParams();
  const initialClientId = searchParams?.get("clientId") || null;

  const {
    currentUser,
    appointments,
    customers,
    scanRecords,
    parameters,
    scanShareConsents,
    clientNotes,
    saveClientNote,
    requestScanShareConsent,
    grantScanShareConsent,
    revokeScanShareConsent,
    auditLogs,
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

  // Filter clients to ONLY customers who have an appointment with this consultant
  const myClients = useMemo(() => {
    const clientIds = new Set(
      appointments
        .filter((a) => a.consultantId === activeConsultantId)
        .map((a) => a.customerId)
    );
    return (customers || []).filter((c: any) => clientIds.has(c.id));
  }, [appointments, customers, activeConsultantId]);

  // Selected client
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialClientId && myClients.some((c: any) => c.id === initialClientId)
      ? initialClientId
      : myClients[0]?.id || "cust-1"
  );

  const selectedClient = useMemo(() => {
    return myClients.find((c: any) => c.id === selectedClientId) || myClients[0] || null;
  }, [myClients, selectedClientId]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<string>("all");

  const filteredClients = useMemo(() => {
    return myClients.filter((c: any) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.skinType.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [myClients, searchQuery]);

  // Subtab inside client file: "overview" | "scans" | "notes" | "history"
  const [clientTab, setClientTab] = useState<"overview" | "scans" | "notes" | "history">("overview");

  // Consent checking
  const clientConsent = useMemo(() => {
    if (!selectedClient) return null;
    return (
      scanShareConsents.find(
        (cs) =>
          cs.customerId === selectedClient.id && cs.consultantId === activeConsultantId
      ) || null
    );
  }, [scanShareConsents, selectedClient, activeConsultantId]);

  const hasScanConsent = !!clientConsent?.granted;

  // Client Scans
  const clientScans = useMemo(() => {
    if (!selectedClient) return [];
    return (scanRecords || []).filter(
      (s: any) => s.customerId === selectedClient.id || s.id?.includes(selectedClient.id)
    );
  }, [scanRecords, selectedClient]);

  // Scan Comparison selection
  const [compareScanIdA, setCompareScanIdA] = useState<string>("");
  const [compareScanIdB, setCompareScanIdB] = useState<string>("");

  useEffect(() => {
    if (clientScans.length > 0) {
      setCompareScanIdA(clientScans[0].id);
      if (clientScans.length > 1) {
        setCompareScanIdB(clientScans[1].id);
      } else {
        setCompareScanIdB("");
      }
    }
  }, [clientScans]);

  // Audit log scan view event once per client view when consent is granted
  useEffect(() => {
    if (hasScanConsent && selectedClient && clientScans.length > 0) {
      // Triggered view audit log
      useAppStore.getState().logAuditEvent?.({
        actor: currentUser?.name || "Dr. Meera Nambiar",
        action: `Consultant inspected AI clinical skin scans for ${selectedClient.name}`,
        resource: "client_scans",
        ipAddress: "127.0.0.1 (Consultant Portal)",
      });
    }
  }, [hasScanConsent, selectedClient?.id]);

  // Client clinical notes
  const currentNote = useMemo(() => {
    if (!selectedClient) return null;
    return (
      clientNotes.find(
        (n) =>
          n.clientId === selectedClient.id && n.consultantId === activeConsultantId
      ) || null
    );
  }, [clientNotes, selectedClient, activeConsultantId]);

  // SOAP State
  const [soapSubjective, setSoapSubjective] = useState("");
  const [soapObjective, setSoapObjective] = useState("");
  const [soapAssessment, setSoapAssessment] = useState("");
  const [soapPlan, setSoapPlan] = useState("");

  useEffect(() => {
    if (currentNote) {
      setSoapSubjective(currentNote.soap.subjective || "");
      setSoapObjective(currentNote.soap.objective || "");
      setSoapAssessment(currentNote.soap.assessment || "");
      setSoapPlan(currentNote.soap.plan || "");
    } else {
      setSoapSubjective("");
      setSoapObjective("");
      setSoapAssessment("");
      setSoapPlan("");
    }
  }, [currentNote, selectedClientId]);

  // Apply clinical template
  const applySoapTemplate = (type: "acne" | "antiaging" | "barrier") => {
    if (type === "barrier") {
      setSoapSubjective(
        "Client reports burning sensation upon application of chemical SPFs, mild erythema post-cleansing, tightness in cheeks."
      );
      setSoapObjective(
        "AI Diagnostic Score indicates Hydration at 72 (Mild TEWL) and Redness at 88. Mild perioral flaking observed on digital dermatoscope."
      );
      setSoapAssessment(
        "Impaired stratum corneum lipid barrier secondary to aggressive active layering. Subclinical erythema."
      );
      setSoapPlan(
        "1. Discontinue AHA/BHA/Retinoids for 14 days.\n2. Prescribe Ceramide + Centella Asiatica barrier cream twice daily.\n3. Follow up in 3 weeks with repeat cellular scan."
      );
    } else if (type === "acne") {
      setSoapSubjective(
        "Client reports recurrent comedonal breakouts in T-zone exacerbated by humidity and friction."
      );
      setSoapObjective(
        "Sebum regulation score 64. Active closed comedones across forehead and chin. No cystic nodular lesions."
      );
      setSoapAssessment(
        "Grade 1-2 acne vulgaris with elevated sebum excretion rate."
      );
      setSoapPlan(
        "1. Introduce 2% encapsulated Salicylic Acid cleanser alternate evenings.\n2. Non-comedogenic peptide moisturizer.\n3. Broad-spectrum SPF50 PA++++."
      );
    } else {
      setSoapSubjective(
        "Concerns regarding periorbital fine lines, loss of dermal firmness, and uneven dull texture."
      );
      setSoapObjective(
        "Elasticity index 70. Micro-wrinkle mapping shows superficial dehydration lines rather than deep muscular rhytids."
      );
      setSoapAssessment(
        "Early photo-induced extrinsic aging with epidermal dehydration."
      );
      setSoapPlan(
        "1. Nightly encapsulated Retinaldehyde 0.05% with sandwich hydration.\n2. Antioxidant Ascorbyl Tetraisopalmitate in morning routine."
      );
    }
    showToast.info("Clinical SOAP template loaded");
  };

  const handleSaveNotes = () => {
    if (!selectedClient) return;
    saveClientNote({
      id: currentNote?.id,
      customerId: selectedClient.id,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      consultantId: activeConsultantId,
      soap: {
        subjective: soapSubjective,
        objective: soapObjective,
        assessment: soapAssessment,
        plan: soapPlan,
      },
      disclaimer: "Cosmetic wellness guidance, not a medical diagnosis",
    });
    showToast.success("Private clinical notes saved");
  };

  // Radar Data calculation
  const radarData = useMemo(() => {
    const scanA = clientScans.find((s: any) => s.id === compareScanIdA) || clientScans[0];
    const scanB = clientScans.find((s: any) => s.id === compareScanIdB);

    return parameters
      .filter((p) => p.status === "active")
      .map((p) => {
        const scoreA =
          scanA?.parameterScores?.[p.id] ??
          scanA?.parameterScores?.[p.slug] ??
          scanA?.parameterScores?.[p.aiKey] ??
          75;
        const scoreB = scanB
          ? scanB?.parameterScores?.[p.id] ??
            scanB?.parameterScores?.[p.slug] ??
            scanB?.parameterScores?.[p.aiKey] ??
            70
          : undefined;

        return {
          parameterName: p.name.split(" ")[0],
          currentScore: scoreA,
          previousScore: scoreB,
          fullMark: 100,
        };
      });
  }, [parameters, clientScans, compareScanIdA, compareScanIdB]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Client Clinical Directory"
        breadcrumbs={[
          { label: "Consultant", href: "/consultant" },
          { label: "Clients" },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button asChild variant="gold" size="sm">
              <Link href="/consultant/plans">
                <Plus className="w-4 h-4 mr-1.5" />
                Prescribe Routine Plan
              </Link>
            </Button>
          </div>
        }
      />

      {/* Main 2-column layout (Client roster on left, full client file on right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Client Roster List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4 bg-[#140F0A] border-[#C99A45]/20 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#A89A85] absolute left-3 top-3" />
              <Input
                placeholder="Search patient roster..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
              {filteredClients.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#A89A85]">
                  No clients assigned to your practice.
                </div>
              ) : (
                filteredClients.map((client: any) => {
                  const isSelected = selectedClientId === client.id;
                  const consent = scanShareConsents.find(
                    (cs) =>
                      cs.customerId === client.id &&
                      cs.consultantId === activeConsultantId
                  );
                  const isShared = !!consent?.granted;

                  return (
                    <div
                      key={client.id}
                      onClick={() => setSelectedClientId(client.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-[#241A0F] border-[#E8C77A] shadow-md shadow-[#C99A45]/10"
                          : "bg-[#1A130B] border-[#C99A45]/15 hover:border-[#C99A45]/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={client.avatar}
                          name={client.name}
                          size="md"
                        />
                        <div className="space-y-0.5">
                          <h4 className="font-semibold text-xs text-[#F5EDE0]">
                            {client.name}
                          </h4>
                          <p className="text-[11px] text-[#A89A85]">
                            {client.skinType}
                          </p>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            {isShared ? (
                              <span className="text-[9px] text-emerald-400 font-medium inline-flex items-center gap-0.5">
                                <Unlock className="w-2.5 h-2.5" /> Scans Shared
                              </span>
                            ) : (
                              <span className="text-[9px] text-amber-400 font-medium inline-flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" /> Scans Private
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-[#A89A85]" />
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Client File (8 cols) */}
        <div className="lg:col-span-8">
          {selectedClient ? (
            <Card className="p-6 bg-[#140F0A] border-[#C99A45]/20 space-y-6">
              {/* Client Profile Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#C99A45]/15">
                <div className="flex items-center gap-4">
                  <Avatar
                    src={selectedClient.avatar}
                    name={selectedClient.name}
                    size="lg"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-xl font-bold text-[#F5EDE0]">
                        {selectedClient.name}
                      </h2>
                      <Badge variant="outline" size="sm">
                        {selectedClient.skinType}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#A89A85]">
                      {selectedClient.email} • {selectedClient.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="text-xs">
                    <Link href={`/consultant/messages?clientId=${selectedClient.id}`}>
                      Message Client
                    </Link>
                  </Button>
                  <Button asChild variant="gold" size="sm" className="text-xs">
                    <Link href={`/consultant/plans?clientId=${selectedClient.id}`}>
                      Create Plan
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Sub-tab Navigation */}
              <div className="flex items-center gap-2 border-b border-[#C99A45]/15 pb-2">
                <button
                  onClick={() => setClientTab("overview")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    clientTab === "overview"
                      ? "bg-[#C99A45] text-[#0B0907]"
                      : "text-[#A89A85] hover:text-[#F5EDE0]"
                  }`}
                >
                  Clinical Profile
                </button>
                <button
                  onClick={() => setClientTab("scans")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    clientTab === "scans"
                      ? "bg-[#C99A45] text-[#0B0907]"
                      : "text-[#A89A85] hover:text-[#F5EDE0]"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> AI Diagnostic Scans
                  {!hasScanConsent && <Lock className="w-3 h-3 text-amber-400" />}
                </button>
                <button
                  onClick={() => setClientTab("notes")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    clientTab === "notes"
                      ? "bg-[#C99A45] text-[#0B0907]"
                      : "text-[#A89A85] hover:text-[#F5EDE0]"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> SOAP Clinical Notes
                </button>
                <button
                  onClick={() => setClientTab("history")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    clientTab === "history"
                      ? "bg-[#C99A45] text-[#0B0907]"
                      : "text-[#A89A85] hover:text-[#F5EDE0]"
                  }`}
                >
                  <History className="w-3.5 h-3.5" /> Consultations & Orders
                </button>
              </div>

              {/* TAB 1: Clinical Profile Overview */}
              {clientTab === "overview" && (
                <div className="space-y-5">
                  {/* Allergy & Safety Alert Box */}
                  <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-red-400 font-semibold text-xs">
                      <AlertTriangle className="w-4 h-4" />
                      Known Medical Allergies & Contraindications
                    </div>
                    {selectedClient.allergies && selectedClient.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {selectedClient.allergies.map((allergy: string) => (
                          <span
                            key={allergy}
                            className="text-xs px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 font-bold"
                          >
                            ⚠️ {allergy}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#A89A85]">
                        No severe ingredient allergies reported on file.
                      </p>
                    )}
                    {selectedClient.pregnancyFlag && (
                      <div className="text-xs text-amber-400 font-semibold pt-1">
                        ⚠️ Patient is currently pregnant/nursing: Retinoids, Salicylic acid &gt;2%, and Hydroquinone are contraindicated.
                      </div>
                    )}
                  </div>

                  {/* Concerns & Goals */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4 bg-[#1A130B] border-[#C99A45]/15 space-y-2">
                      <span className="text-xs font-semibold text-[#E8C77A]">
                        Primary Skin Concerns
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedClient.concerns?.map((c: string) => (
                          <span
                            key={c}
                            className="text-xs px-2.5 py-0.5 rounded-full bg-[#0B0907] text-[#C99A45] border border-[#C99A45]/20"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </Card>

                    <Card className="p-4 bg-[#1A130B] border-[#C99A45]/15 space-y-2">
                      <span className="text-xs font-semibold text-[#E8C77A]">
                        Patient Metadata
                      </span>
                      <div className="text-xs text-[#A89A85] space-y-1">
                        <div>Enrolled: {selectedClient.registeredAt || "2026-01-15"}</div>
                        <div>Total Completed Sessions: {selectedClient.totalOrders || 3}</div>
                        <div>Preferred Telehealth Mode: Video Consultation</div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* TAB 2: AI Diagnostic Scans with Privacy Gate */}
              {clientTab === "scans" && (
                <div className="space-y-5">
                  {!hasScanConsent ? (
                    /* Locked Privacy Card */
                    <div className="p-8 rounded-2xl bg-[#1A130B] border border-amber-500/30 text-center space-y-4">
                      <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                        <Lock className="w-7 h-7" />
                      </div>
                      <div className="space-y-1.5 max-w-md mx-auto">
                        <h3 className="font-serif text-lg font-bold text-[#F5EDE0]">
                          Client has not shared scans
                        </h3>
                        <p className="text-xs text-[#A89A85] leading-relaxed">
                          In accordance with clinical privacy regulations, AI facial vectors and diagnostic scan histories require explicit consent from <span className="text-[#E8C77A] font-semibold">{selectedClient.name}</span>.
                        </p>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Button
                          variant="gold"
                          onClick={() => {
                            requestScanShareConsent(selectedClient.id, activeConsultantId);
                            showToast.success(
                              `Scan sharing authorization request sent to ${selectedClient.name}`
                            );
                          }}
                        >
                          Request Access from Patient
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            grantScanShareConsent(selectedClient.id, activeConsultantId);
                            showToast.success("Simulated consent granted for demo testing");
                          }}
                        >
                          Grant Demo Consent
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Unlocked Scans View */
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                        <div className="flex items-center gap-2 text-xs text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>
                            Patient consent active. Viewing authorized clinical scan history.
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-red-400 hover:bg-red-500/10 h-7"
                          onClick={() => {
                            revokeScanShareConsent(selectedClient.id, activeConsultantId);
                            showToast.info("Scan consent revoked");
                          }}
                        >
                          Revoke Access (Test Privacy Gate)
                        </Button>
                      </div>

                      {/* Scan Comparison Selector */}
                      {clientScans.length > 1 && (
                        <div className="flex items-center gap-4 p-3 rounded-xl bg-[#1A130B] border border-[#C99A45]/20 text-xs">
                          <span className="text-[#A89A85] font-semibold">Compare:</span>
                          <select
                            value={compareScanIdA}
                            onChange={(e) => setCompareScanIdA(e.target.value)}
                            className="bg-[#0B0907] border border-[#C99A45]/30 text-[#F5EDE0] rounded-lg px-2.5 py-1"
                          >
                            {clientScans.map((s: any, i: number) => (
                              <option key={s.id} value={s.id}>
                                Scan {i + 1} ({s.date || "Latest"}) - Overall {s.overallScore}
                              </option>
                            ))}
                          </select>
                          <span className="text-[#A89A85]">vs</span>
                          <select
                            value={compareScanIdB}
                            onChange={(e) => setCompareScanIdB(e.target.value)}
                            className="bg-[#0B0907] border border-[#C99A45]/30 text-[#F5EDE0] rounded-lg px-2.5 py-1"
                          >
                            <option value="">None (Single Scan)</option>
                            {clientScans.map((s: any, i: number) => (
                              <option key={s.id} value={s.id}>
                                Scan {i + 1} ({s.date || "Previous"}) - Overall {s.overallScore}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Radar Chart */}
                      <Card className="p-5 bg-[#1A130B] border-[#C99A45]/20 space-y-3">
                        <h4 className="font-serif text-sm font-semibold text-[#F5EDE0] flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#E8C77A]" />
                          8-Parameter Cellular Diagnostic Radar
                        </h4>
                        <ResultsRadarChart
                          data={radarData}
                          showComparison={!!compareScanIdB}
                        />
                      </Card>

                      {/* Parameter Gauges */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {parameters
                          .filter((p) => p.status === "active")
                          .map((param) => {
                            const activeScan =
                              clientScans.find((s: any) => s.id === compareScanIdA) ||
                              clientScans[0];
                            const score =
                              activeScan?.parameterScores?.[param.id] ??
                              activeScan?.parameterScores?.[param.slug] ??
                              activeScan?.parameterScores?.[param.aiKey];

                            return (
                              <ParameterGauge
                                key={param.id}
                                name={param.name}
                                score={score}
                                weight={param.weight}
                                category={param.category || "General"}
                                interpretation={param.description}
                                onClick={() => {}}
                              />
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SOAP Clinical Notes */}
              {clientTab === "notes" && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <h3 className="font-serif text-base font-semibold text-[#F5EDE0]">
                        Confidential Clinical SOAP Notes
                      </h3>
                      <p className="text-xs text-[#A89A85]">
                        Private notes recorded by the practitioner. Never exposed to the patient app.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#A89A85]">Load Template:</span>
                      <button
                        onClick={() => applySoapTemplate("barrier")}
                        className="px-2 py-1 rounded bg-[#1A130B] border border-[#C99A45]/30 text-[11px] text-[#E8C77A] hover:bg-[#C99A45]/10"
                      >
                        Barrier Repair
                      </button>
                      <button
                        onClick={() => applySoapTemplate("acne")}
                        className="px-2 py-1 rounded bg-[#1A130B] border border-[#C99A45]/30 text-[11px] text-[#E8C77A] hover:bg-[#C99A45]/10"
                      >
                        Acne Vulgaris
                      </button>
                      <button
                        onClick={() => applySoapTemplate("antiaging")}
                        className="px-2 py-1 rounded bg-[#1A130B] border border-[#C99A45]/30 text-[11px] text-[#E8C77A] hover:bg-[#C99A45]/10"
                      >
                        Retinal Therapy
                      </button>
                    </div>
                  </div>

                  {/* SOAP Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-[#E8C77A] mb-1 block">
                        S — Subjective (Patient symptoms & chief complaint)
                      </label>
                      <Textarea
                        value={soapSubjective}
                        onChange={(e) => setSoapSubjective(e.target.value)}
                        placeholder="Patient reports itching, erythema, burning sensations..."
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#E8C77A] mb-1 block">
                        O — Objective (Clinical observation & AI scan findings)
                      </label>
                      <Textarea
                        value={soapObjective}
                        onChange={(e) => setSoapObjective(e.target.value)}
                        placeholder="Erythema score 88, micro-flaking noted in nasolabial fold..."
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#E8C77A] mb-1 block">
                        A — Assessment (Cosmetological diagnosis & progress)
                      </label>
                      <Textarea
                        value={soapAssessment}
                        onChange={(e) => setSoapAssessment(e.target.value)}
                        placeholder="Extrinsic barrier disruption secondary to glycolic acid overuse..."
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#E8C77A] mb-1 block">
                        P — Plan (Actionable skincare regimen & follow-up schedule)
                      </label>
                      <Textarea
                        value={soapPlan}
                        onChange={(e) => setSoapPlan(e.target.value)}
                        placeholder="Cease AHAs for 2 weeks. Initiate ceramide repair routine..."
                        rows={3}
                      />
                    </div>

                    {/* Disclaimer Banner */}
                    <div className="p-3 rounded-xl bg-[#1A130B] border border-[#C99A45]/20 text-[11px] text-[#A89A85] flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#C99A45] shrink-0" />
                      <span>
                        <strong className="text-[#F5EDE0]">Mandatory Telemedicine Disclaimer:</strong>{" "}
                        Cosmetic wellness guidance, not a medical diagnosis.
                      </span>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button variant="gold" onClick={handleSaveNotes}>
                        <Save className="w-4 h-4 mr-1.5" /> Save SOAP Notes
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Consultation & Order History */}
              {clientTab === "history" && (
                <div className="space-y-4">
                  <h3 className="font-serif text-base font-semibold text-[#F5EDE0]">
                    Consultation History with Your Practice
                  </h3>
                  <div className="space-y-2">
                    {appointments
                      .filter(
                        (a) =>
                          a.customerId === selectedClient.id &&
                          a.consultantId === activeConsultantId
                      )
                      .map((apt) => (
                        <div
                          key={apt.id}
                          className="p-3.5 rounded-xl bg-[#1A130B] border border-[#C99A45]/15 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-semibold text-[#F5EDE0]">
                              {apt.serviceTitle}
                            </div>
                            <div className="text-[11px] text-[#A89A85]">
                              {apt.date} at {apt.time} • {apt.reference}
                            </div>
                          </div>
                          <Badge variant="gold">{apt.status}</Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-12 text-center bg-[#140F0A] border-[#C99A45]/20 text-xs text-[#A89A85]">
              Select a client from the roster on the left to inspect their clinical file.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
