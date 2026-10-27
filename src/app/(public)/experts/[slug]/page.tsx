import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import {
  Star,
  Sparkles,
  Calendar,
  Clock,
  Award,
  Globe,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ImageWithFallback } from "@/components/public/ImageWithFallback";
import consultantsData from "@/data/consultants.json";

export async function generateStaticParams() {
  return consultantsData.map((expert) => ({
    slug: expert.slug || expert.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const expert = consultantsData.find((c) => c.slug === slug || c.id === slug);
  if (!expert) return { title: "Expert Not Found | Celebs Alley" };

  return {
    title: `${expert.name} | Celebs Alley Aesthetic Dermatology`,
    description: expert.bio,
  };
}

export default async function ExpertProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const expert = consultantsData.find((c) => c.slug === slug || c.id === slug);

  if (!expert) {
    notFound();
  }

  return (
    <div className="w-full flex flex-col pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:text-gold-300">Home</Link>
          <ChevronRight className="w-3 h-3 text-gold-500/50" />
          <Link href="/experts" className="hover:text-gold-300">Experts</Link>
          <ChevronRight className="w-3 h-3 text-gold-500/50" />
          <span className="text-gold-300 font-medium">{expert.name}</span>
        </div>

        {/* Profile Card Hero */}
        <div className="p-8 sm:p-12 rounded-3xl bg-bg-surface border border-gold-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.6)] grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Avatar (4 cols) */}
          <div className="lg:col-span-4 relative">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-bg-elevated border border-gold-500/30 shadow-gold-sm">
              <ImageWithFallback
                src={expert.avatar}
                alt={expert.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 400px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Info Details (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-semibold uppercase tracking-wider">
                  {expert.experienceYears}+ Years Clinical Experience
                </span>
                <div className="flex items-center gap-1 text-gold-400 text-xs font-bold">
                  <Star className="w-4 h-4 fill-gold-400" />
                  <span>{expert.rating.toFixed(2)}</span>
                  <span className="text-text-muted">({expert.reviewsCount} reviews)</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary">
                {expert.name}
              </h1>
              <p className="text-sm font-semibold text-gold-400">
                {expert.title}
              </p>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed">
              {expert.bio}
            </p>

            {/* Qualifications & Languages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gold-500/15 text-xs">
              <div>
                <span className="font-semibold text-gold-300 block mb-1">Qualifications:</span>
                <p className="text-text-muted">{expert.qualifications}</p>
              </div>

              <div>
                <span className="font-semibold text-gold-300 block mb-1">Languages Spoken:</span>
                <p className="text-text-muted">{expert.languages?.join(", ") || "English, Hindi"}</p>
              </div>
            </div>

            {/* Specialties */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gold-300 block">Core Clinical Specializations:</span>
              <div className="flex flex-wrap gap-2">
                {expert.specialties.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-lg bg-gold-500/15 border border-gold-500/30 text-xs text-gold-300 font-medium"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Book */}
            <div className="pt-4 border-t border-gold-500/15 flex flex-col sm:flex-row items-center gap-4">
              <div>
                <span className="text-xs text-text-muted block">Session Fee</span>
                <span className="text-2xl font-heading font-bold text-gold-300">
                  ₹{expert.consultationFee.toLocaleString("en-IN")}
                </span>
              </div>
              <Link href={`/book?expert=${expert.id}`} className="w-full sm:w-auto sm:ml-auto">
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-4 uppercase tracking-widest text-xs font-semibold shadow-gold-sm"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book with {expert.name.split(" ")[0]}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Availability & Patient Testimonials */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Availability Schedule (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-bg-surface border border-gold-500/25 space-y-4">
            <h3 className="text-lg font-heading font-bold text-text-primary flex items-center gap-2">
              <Clock className="w-5 h-5 text-gold-400" />
              Regular Clinic Hours
            </h3>
            <div className="space-y-2.5">
              {expert.availability.map((slot, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-bg-elevated border border-gold-500/15 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-text-primary">{slot.split(" ")[0]}</span>
                  <span className="text-gold-300 font-mono">{slot.split(" ")[1]}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-text-muted">
              Emergency consultations can be scheduled on request via our concierge line.
            </p>
          </div>

          {/* Testimonials (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-bg-surface border border-gold-500/25 space-y-4">
            <h3 className="text-lg font-heading font-bold text-text-primary flex items-center gap-2">
              <Star className="w-5 h-5 text-gold-400" />
              Verified Patient Reviews
            </h3>
            <div className="space-y-3">
              {expert.testimonials?.map((t, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-bg-elevated border border-gold-500/15 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gold-300">{t.author}</span>
                    <div className="flex items-center gap-0.5 text-gold-400">
                      {[...Array(t.rating)].map((_, idx) => (
                        <Star key={idx} className="w-3 h-3 fill-gold-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed italic">
                    &ldquo;{t.comment}&rdquo;
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
