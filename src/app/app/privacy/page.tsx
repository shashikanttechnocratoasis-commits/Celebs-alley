"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Download, 
  Trash2, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  Database
} from "lucide-react";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { toast } from "@/components/ui/Toast";

export default function PrivacySettingsPage() {
  const { 
    customerProfile, 
    scans, 
    saveConsent, 
    clearAllScanData 
  } = useAppStore();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const consent = customerProfile?.consent;

  // Toggle scan history storage
  const handleToggleHistory = (checked: boolean) => {
    saveConsent({
      timestamp: new Date().toISOString(),
      version: consent?.version || "v1.0",
      facialAnalysis: consent?.facialAnalysis ?? true,
      privacyTerms: consent?.privacyTerms ?? true,
      storeHistory: checked,
      marketing: consent?.marketing ?? false,
    });
    toast.success(
      checked
        ? "Scan history storage enabled."
        : "Scan history storage disabled. New scans will be transient."
    );
  };

  // Toggle marketing consent
  const handleToggleMarketing = (checked: boolean) => {
    saveConsent({
      timestamp: new Date().toISOString(),
      version: consent?.version || "v1.0",
      facialAnalysis: consent?.facialAnalysis ?? true,
      privacyTerms: consent?.privacyTerms ?? true,
      storeHistory: consent?.storeHistory ?? true,
      marketing: checked,
    });
    toast.success("Marketing preference updated.");
  };

  // Download all user data as JSON
  const handleDownloadData = () => {
    try {
      const exportData = {
        exportTimestamp: new Date().toISOString(),
        customerProfile: {
          name: customerProfile?.name,
          email: customerProfile?.email,
          phone: customerProfile?.phone,
          onboardingCompleted: customerProfile?.onboardingCompleted,
        },
        consentRecord: customerProfile?.consent,
        questionnaire: customerProfile?.questionnaire,
        scanHistory: scans.map((s) => ({
          id: s.id,
          createdAt: s.createdAt,
          overallScore: s.overallScore,
          qualityScore: s.qualityScore,
          parameterScores: s.parameterScores,
          topConcerns: s.topConcerns,
          versionMetadata: s.versionMetadata,
        })),
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `celebs-alley-my-data-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast.success("Your diagnostic & profile data has been downloaded.");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export data.");
    }
  };

  // Wipe all scan data
  const handleWipeAllScans = () => {
    clearAllScanData();
    setDeleteConfirmOpen(false);
    toast.success("All facial biometric scans have been deleted permanently.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-gold-400">
          <ShieldCheck className="w-3.5 h-3.5" /> PRIVACY & DATA TRANSPARENCY
        </div>
        <h1 className="font-serif text-3xl text-cream-100 font-normal">
          Biometric & Account Privacy Center
        </h1>
        <p className="text-xs sm:text-sm text-cream-300/80">
          Celebs Alley is committed to zero server facial storage. You retain complete control over your diagnostic telemetry and consent records.
        </p>
      </div>

      {/* Consent Status Card */}
      <Card className="p-6 space-y-5 bg-surface/80 border-gold-400/20 shadow-xl">
        <div className="flex items-center justify-between border-b border-gold-400/10 pb-3">
          <h2 className="text-sm font-semibold text-cream-100 uppercase tracking-wider text-xs font-mono text-gold-400 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Active Consent Record
          </h2>
          <span className="text-[11px] font-mono text-cream-400">
            Version: {consent?.version || "v1.0"}
          </span>
        </div>

        {consent ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-base/60 border border-gold-400/10 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Facial Biometric Analysis
              </div>
              <p className="text-cream-300/80">
                Authorized for on-device computer vision diagnostic scoring.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-base/60 border border-gold-400/10 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Terms & Privacy Acceptance
              </div>
              <p className="text-cream-300/80">
                Granted on {new Date(consent.timestamp).toLocaleDateString("en-IN")}.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-amber-400">
            No formal consent record registered yet. Please complete Onboarding.
          </p>
        )}

        {/* Preference Toggles */}
        <div className="space-y-3 pt-2">
          <label className="flex items-center justify-between p-3 rounded-xl bg-base/40 border border-gold-400/10 cursor-pointer">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-cream-100">Store Scan History on Device</div>
              <div className="text-[11px] text-cream-400">
                Allows radar comparison and historical progression tracking across sessions.
              </div>
            </div>
            <input
              type="checkbox"
              checked={consent?.storeHistory ?? true}
              onChange={(e) => handleToggleHistory(e.target.checked)}
              className="rounded border-gold-400/30 text-gold-400 focus:ring-gold-400 h-4 w-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-base/40 border border-gold-400/10 cursor-pointer">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-cream-100 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                Share my diagnostic scans with my consultant
              </div>
              <div className="text-[11px] text-cream-400">
                Authorizes your assigned dermatologist (Dr. Meera Nambiar) to inspect AI facial scores, radar charts, and progress. Revocable at any time.
              </div>
            </div>
            <input
              type="checkbox"
              checked={
                useAppStore
                  .getState()
                  .scanShareConsents.some(
                    (c) => c.customerId === (customerProfile?.id || "cust-1") && c.granted
                  )
              }
              onChange={(e) => {
                const custId = customerProfile?.id || "cust-1";
                if (e.target.checked) {
                  useAppStore.getState().grantScanShareConsent(custId, "cons-1");
                  toast.success("Scan sharing authorized for your consultant.");
                } else {
                  useAppStore.getState().revokeScanShareConsent(custId, "cons-1");
                  toast.info("Scan sharing revoked. Your scans are now private.");
                }
              }}
              className="rounded border-gold-400/30 text-gold-400 focus:ring-gold-400 h-4 w-4 accent-gold-400"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-base/40 border border-gold-400/10 cursor-pointer">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-cream-100">Personalized Formulation Updates</div>
              <div className="text-[11px] text-cream-400">
                Receive curated ingredient dispatches matching your top biomarkers.
              </div>
            </div>
            <input
              type="checkbox"
              checked={consent?.marketing ?? false}
              onChange={(e) => handleToggleMarketing(e.target.checked)}
              className="rounded border-gold-400/30 text-gold-400 focus:ring-gold-400 h-4 w-4"
            />
          </label>
        </div>
      </Card>

      {/* Data Sovereignty & Portability */}
      <Card className="p-6 space-y-5 bg-surface/80 border-gold-400/20 shadow-xl">
        <div className="flex items-center justify-between border-b border-gold-400/10 pb-3">
          <h2 className="text-sm font-semibold text-cream-100 uppercase tracking-wider text-xs font-mono text-gold-400 flex items-center gap-2">
            <Database className="w-4 h-4" /> Data Portability & Rights
          </h2>
          <span className="text-[11px] font-mono text-cream-400">Scans stored: {scans.length}</span>
        </div>

        <p className="text-xs text-cream-300/80 leading-relaxed">
          In compliance with clinical data privacy and GDPR/DPDP principles, you can export your entire telemetry profile or request immediate purge of all diagnostic scans.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Button
            variant="outline"
            onClick={handleDownloadData}
            className="flex-1 text-xs border-gold-400/30 py-3"
          >
            <Download className="w-4 h-4 mr-2 text-gold-400" /> Download My Data (JSON)
          </Button>

          <Button
            variant="ghost"
            onClick={() => setDeleteConfirmOpen(true)}
            disabled={scans.length === 0}
            className="flex-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 py-3"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete All My Scan Data ({scans.length})
          </Button>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <ResponsiveDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete All Scan Data?"
        description="Permanently erase all diagnostic sessions from this device"
      >
        <div className="space-y-4 text-xs text-cream-200">
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>This will delete all {scans.length} historical scans, radar plots, and pose thumbnails. Your questionnaire responses and profile will remain intact.</span>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleWipeAllScans}
              className="bg-rose-600 hover:bg-rose-500 text-white"
            >
              Confirm Wipe All Scans
            </Button>
          </div>
        </div>
      </ResponsiveDialog>
    </div>
  );
}
