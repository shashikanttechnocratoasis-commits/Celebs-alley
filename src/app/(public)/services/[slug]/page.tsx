import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import {
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  ArrowRight,
  HelpCircle,
  Award,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ImageWithFallback } from "@/components/public/ImageWithFallback";
import { BeforeAfterSlider } from "@/components/public/BeforeAfterSlider";
import servicesData from "@/data/services.json";

export async function generateStaticParams() {
  return servicesData.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = servicesData.find((s) => s.slug === slug);
  if (!service) return { title: "Service Not Found | Celebs Alley" };

  return {
    title: `${service.title} | Celebs Alley Clinical Aesthetics`,
    description: service.description,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = servicesData.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

  const relatedServices = servicesData.filter(
    (s) => s.id !== service.id && service.relatedServiceIds?.includes(s.id)
  );

  return (
    <div className="w-full flex flex-col pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:text-gold-300">Home</Link>
          <ChevronRight className="w-3 h-3 text-gold-500/50" />
          <Link href="/services" className="hover:text-gold-300">Services</Link>
          <ChevronRight className="w-3 h-3 text-gold-500/50" />
          <span className="text-gold-300 font-medium">{service.title}</span>
        </div>

        {/* Hero Banner Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Info (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-semibold uppercase tracking-wider">
                {service.category}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-text-primary leading-tight">
                {service.title}
              </h1>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                {service.description}
              </p>
            </div>

            {/* Main Featured Image */}
            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border border-gold-500/30 bg-bg-surface shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
              <ImageWithFallback
                src={service.image}
                alt={service.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover"
              />
            </div>

            {/* Clinical Benefits */}
            {service.benefits && service.benefits.length > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-bg-surface border border-gold-500/25 space-y-4">
                <h3 className="text-lg font-heading font-bold text-gold-300 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gold-400" />
                  Clinical & Physiological Benefits
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-text-secondary">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step-by-Step Procedure */}
            {service.steps && service.steps.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-heading font-bold text-text-primary">
                  The Treatment Protocol: Step-by-Step
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {service.steps.map((step) => (
                    <div
                      key={step.step}
                      className="p-5 rounded-2xl bg-bg-surface border border-gold-500/20 space-y-2"
                    >
                      <span className="text-xs font-mono font-bold text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded">
                        STEP 0{step.step}
                      </span>
                      <h4 className="text-sm font-heading font-bold text-text-primary">
                        {step.title}
                      </h4>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Before / After Comparison Slider */}
            {service.beforeAfter && (
              <div className="space-y-4 pt-4">
                <div>
                  <h3 className="text-xl font-heading font-bold text-text-primary">
                    Documented Clinical Results
                  </h3>
                  <p className="text-xs text-text-muted mt-1">
                    {service.beforeAfter.note}
                  </p>
                </div>
                <BeforeAfterSlider
                  beforeImage={service.beforeAfter.before}
                  afterImage={service.beforeAfter.after}
                  beforeLabel="Before Treatment"
                  afterLabel="After 4 Weeks"
                />
              </div>
            )}

            {/* Suitability Matrix (Ideal For vs Not Suitable For) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              {service.idealFor && (
                <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                  <h4 className="text-sm font-heading font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Ideal Candidates:
                  </h4>
                  <ul className="space-y-2 text-xs text-text-secondary">
                    {service.idealFor.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {service.notSuitableFor && (
                <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
                  <h4 className="text-sm font-heading font-bold text-rose-300 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    Contraindications:
                  </h4>
                  <ul className="space-y-2 text-xs text-text-secondary">
                    {service.notSuitableFor.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Service-Specific FAQs */}
            {service.faqs && service.faqs.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className="text-xl font-heading font-bold text-text-primary flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-gold-400" />
                  Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                  {service.faqs.map((faq, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-bg-surface border border-gold-500/20 space-y-1.5"
                    >
                      <h4 className="text-sm font-semibold text-gold-300">{faq.q}</h4>
                      <p className="text-xs text-text-secondary leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Booking Card Sidebar (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-3xl bg-bg-surface border border-gold-500/30 p-6 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              <div className="space-y-2 pb-4 border-b border-gold-500/20">
                <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold">
                  Transparent Consultation Fee
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-heading font-bold text-gold-300">
                    ₹{service.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-text-muted">/ session</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-secondary pt-1">
                  <Clock className="w-4 h-4 text-gold-400" />
                  <span>Duration: <strong>{service.durationMinutes} Minutes</strong></span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>1-on-1 MD Dermatologist consultation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Digital prescription & 30-day routine</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Free follow-up WhatsApp review</span>
                </div>
              </div>

              <Link href={`/book?service=${service.id}`} className="block">
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full justify-center text-xs font-semibold uppercase tracking-wider py-4 shadow-gold-sm hover:shadow-gold-md"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book This Treatment
                </Button>
              </Link>

              <p className="text-[11px] text-center text-text-muted">
                Available at Kota Flagship Clinic or via 4K HD Tele-Dermatology.
              </p>
            </div>
          </div>
        </div>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <div className="pt-12 border-t border-gold-500/20 space-y-6">
            <h3 className="text-xl font-heading font-bold text-text-primary">
              Complementary Treatments You May Consider
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedServices.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/services/${rel.slug}`}
                  className="p-4 rounded-2xl bg-bg-surface border border-gold-500/20 hover:border-gold-400/50 transition-all flex items-center gap-4 group"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-bg-elevated shrink-0">
                    <ImageWithFallback
                      src={rel.image}
                      alt={rel.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-heading font-bold text-text-primary group-hover:text-gold-300 transition-colors line-clamp-1">
                      {rel.title}
                    </h4>
                    <span className="text-xs font-semibold text-gold-400 mt-1 block">
                      ₹{rel.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
