import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, AlertTriangle, FileText, ChevronRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function generateStaticParams() {
  return [
    { slug: "privacy" },
    { slug: "terms" },
    { slug: "cookies" },
    { slug: "consent" },
  ];
}

const LEGAL_DOCS: Record<
  string,
  {
    title: string;
    subtitle: string;
    lastUpdated: string;
    sections: Array<{ id: string; heading: string; content: string }>;
  }
> = {
  privacy: {
    title: "Privacy & Data Protection Policy",
    subtitle: "Governance of patron biometric facial imagery and medical consultation records.",
    lastUpdated: "October 01, 2026",
    sections: [
      {
        id: "biometric-data",
        heading: "1. Biometric & Optical Data Governance",
        content:
          "Celebs Alley processes facial imagery exclusively for optical biomarker extraction (melanin, vascular patterns, hydration gradients). We do not perform biometric facial recognition or identity linkage. All images are encrypted with AES-256 at rest and transmitted over secure TLS 1.3 channels.",
      },
      {
        id: "retention",
        heading: "2. Data Retention & Deletion Rights",
        content:
          "You retain complete ownership over your diagnostic records. At any time, you may request permanent deletion of your scans and questionnaire history via your account dashboard or by emailing privacy@celebsalley.com.",
      },
      {
        id: "third-parties",
        heading: "3. Third-Party Sharing Prohibitions",
        content:
          "We never sell, rent, or monetize your health metrics or biometric data to third-party advertisers or insurance brokers. Data is shared exclusively with your chosen licensed dermatologist and authorized fulfillment pharmacies.",
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    subtitle: "Standard operating agreement for clinical consultation and marketplace commerce.",
    lastUpdated: "October 01, 2026",
    sections: [
      {
        id: "tele-health",
        heading: "1. Tele-Dermatology Scope",
        content:
          "Virtual consultations conducted through Celebs Alley are designed for aesthetic and non-emergency dermatological evaluation. If you experience acute allergic reactions, open wounds, or systemic emergencies, seek immediate in-person emergency hospital care.",
      },
      {
        id: "prescriptions",
        heading: "2. Active Formulations & Compounding",
        content:
          "Custom compounded active serums must be utilized strictly in accordance with your attending clinician's instructions. Do not share prescribed active regimens with other individuals.",
      },
      {
        id: "cancellations",
        heading: "3. Appointment Modifications & Cancellations",
        content:
          "Consultation slots can be rescheduled up to 4 hours prior to the appointment time without cancellation penalty.",
      },
    ],
  },
  cookies: {
    title: "Cookie & Tracking Policy",
    subtitle: "How we utilize session cookies for security and diagnostic memory.",
    lastUpdated: "October 01, 2026",
    sections: [
      {
        id: "essential-cookies",
        heading: "1. Essential Security Cookies",
        content:
          "Essential cookies are required to authenticate your consultation session, maintain cart state, and process AI scan payloads securely. These cannot be disabled.",
      },
      {
        id: "analytics-cookies",
        heading: "2. Performance & Diagnostic Analytics",
        content:
          "Optional analytics cookies help us measure neural processing latency and optimize camera capture framerates across diverse mobile devices.",
      },
      {
        id: "cookie-management",
        heading: "3. Managing Your Preferences",
        content:
          "You can update or revoke your cookie consent preferences at any time using the preferences banner in the footer of this website.",
      },
    ],
  },
  consent: {
    title: "AI Biometric & Optical Scan Consent",
    subtitle: "Explicit informed consent for multi-spectral neural facial analysis.",
    lastUpdated: "October 01, 2026",
    sections: [
      {
        id: "scan-purpose",
        heading: "1. Clinical Scope of Neural Analysis",
        content:
          "I understand that the Celebs Alley AI scanner uses multi-spectral algorithms to evaluate 8 skin health parameters and generate cosmetic formulation suggestions. It serves as an assistive diagnostic tool and does not substitute for histological biopsy or clinical pathology.",
      },
      {
        id: "voluntary",
        heading: "2. Voluntary Optical Capture",
        content:
          "I voluntarily provide facial photographs for algorithm analysis. I understand I may decline the photo scan and complete the consultation questionnaire using descriptive self-assessment inputs instead.",
      },
      {
        id: "dermatologist-oversight",
        heading: "3. Physician Review & Override",
        content:
          "All algorithmic recommendations are subject to final clinical verification and modification by my assigned board-certified dermatologist.",
      },
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = LEGAL_DOCS[slug];
  if (!doc) return { title: "Legal Policy | Celebs Alley" };

  return {
    title: `${doc.title} | Celebs Alley Legal Framework`,
    description: doc.subtitle,
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = LEGAL_DOCS[slug];

  if (!doc) {
    notFound();
  }

  const legalNav = [
    { slug: "privacy", label: "Privacy Policy" },
    { slug: "terms", label: "Terms of Service" },
    { slug: "cookies", label: "Cookie Policy" },
    { slug: "consent", label: "AI Biometric Consent" },
  ];

  return (
    <div className="w-full flex flex-col pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:text-gold-300">Home</Link>
          <ChevronRight className="w-3 h-3 text-gold-500/50" />
          <span className="text-text-muted">Legal Governance</span>
          <ChevronRight className="w-3 h-3 text-gold-500/50" />
          <span className="text-gold-300 font-medium">{doc.title}</span>
        </div>

        {/* Advisory Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            <strong>Demonstration Notice:</strong> This document represents simulated legal documentation for the Celebs Alley prototype platform.
          </span>
        </div>

        {/* Main Grid: Sidebar TOC + Legal Document Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Navigation Sidebar (4 cols) */}
          <aside className="lg:col-span-4 p-6 rounded-3xl bg-bg-surface border border-gold-500/25 space-y-4">
            <span className="text-xs font-heading font-semibold uppercase tracking-widest text-gold-400 block">
              Legal Documents
            </span>
            <div className="space-y-1.5">
              {legalNav.map((item) => {
                const isActive = item.slug === slug;
                return (
                  <Link
                    key={item.slug}
                    href={`/legal/${item.slug}`}
                    className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium block transition-all ${
                      isActive
                        ? "bg-gold-500/20 text-gold-300 font-semibold border border-gold-400"
                        : "text-text-secondary hover:text-gold-300 hover:bg-bg-elevated"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-gold-500/15 text-[11px] text-text-muted space-y-1">
              <span>Last Calibrated: {doc.lastUpdated}</span>
              <p>Governing Law: Rajasthan Cosmeceutical & Digital Health Framework 2026.</p>
            </div>
          </aside>

          {/* Right Document Content (8 cols) */}
          <div className="lg:col-span-8 p-8 sm:p-10 rounded-3xl bg-bg-surface border border-gold-500/30 space-y-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="space-y-2 pb-6 border-b border-gold-500/20">
              <span className="text-xs font-mono text-gold-400 uppercase tracking-widest">
                DOC ID: CA-LEGAL-{slug.toUpperCase()}
              </span>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
                {doc.title}
              </h1>
              <p className="text-xs text-text-muted">
                {doc.subtitle}
              </p>
            </div>

            <div className="space-y-6">
              {doc.sections.map((section) => (
                <div key={section.id} className="space-y-2">
                  <h3 className="text-base font-heading font-bold text-gold-300">
                    {section.heading}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
