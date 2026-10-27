import { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Award,
  Cpu,
  HeartHandshake,
  Heart,
  Lock,
  Calendar,
  ArrowRight,
  Star,
  Users,
  Compass,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ImageWithFallback } from "@/components/public/ImageWithFallback";
import pageContent from "@/data/pageContent.json";
import teamData from "@/data/team.json";
import certificationsData from "@/data/certifications.json";
import timelineData from "@/data/timeline.json";
import siteSettings from "@/data/siteSettings.json";

export const metadata: Metadata = {
  title: "Our Heritage & Vision | Celebs Alley",
  description:
    "Learn how Celebs Alley unites royal Rajasthani botanical alchemy with modern multi-spectral AI dermatology from our Kota headquarters.",
};

export default function AboutPage() {
  return (
    <div className="w-full flex flex-col pt-20">
      {/* =========================================================================
          1. STORY HERO SECTION
         ========================================================================= */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-bg-base via-bg-surface to-bg-base overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gold-500/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-heading font-semibold uppercase tracking-widest">
              <Compass className="w-3.5 h-3.5 text-gold-400" />
              <span>{pageContent.about.story.subtitle}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-text-primary leading-tight">
              {pageContent.about.story.title}
            </h1>

            <div className="space-y-4 text-sm sm:text-base text-text-secondary leading-relaxed">
              <p>{pageContent.about.story.p1}</p>
              <p>{pageContent.about.story.p2}</p>
              <p>{pageContent.about.story.p3}</p>
            </div>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link href="/book">
                <Button variant="gold" size="lg" className="uppercase tracking-wider text-xs font-semibold">
                  <Calendar className="w-4 h-4 mr-2" />
                  Consult Our Dermatologists
                </Button>
              </Link>
              <Link href="/technology">
                <Button variant="outline" size="lg" className="border-gold-500/40 text-gold-300">
                  <Cpu className="w-4 h-4 mr-2" />
                  Discover The AI Engine
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-gold-500/30 bg-bg-surface shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1608248597359-2b0c43632938?auto=format&fit=crop&w=800&q=80"
                alt="Celebs Alley Kota Botanical Laboratory"
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-bg-base/85 backdrop-blur-md border border-gold-500/30">
                <span className="text-xs font-heading font-semibold text-gold-300 uppercase tracking-widest block">
                  Kota Research Laboratory
                </span>
                <p className="text-xs text-text-muted mt-1">
                  Pioneering clinical 24K gold nano-bhasma & spectral computer vision algorithms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. STATS STRIP
         ========================================================================= */}
      <section className="bg-bg-elevated border-y border-gold-500/20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-heading font-bold text-gold-300">
              <AnimatedCounter value={siteSettings.stats.clients || 48200} />+
            </div>
            <p className="text-xs uppercase tracking-wider text-text-muted">Patrons Diagnosed</p>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-heading font-bold text-gold-300">
              99.4%
            </div>
            <p className="text-xs uppercase tracking-wider text-text-muted">Clinical Correlation</p>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-heading font-bold text-gold-300">
              100%
            </div>
            <p className="text-xs uppercase tracking-wider text-text-muted">Ayush & GMP Certified</p>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-heading font-bold text-gold-300">
              24+
            </div>
            <p className="text-xs uppercase tracking-wider text-text-muted">Metropolitan Hubs</p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. MISSION & VISION CARDS
         ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-bg-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-bg-elevated border border-gold-500/30 space-y-4 shadow-gold-sm">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-gold-300">
              {pageContent.about.mission.title}
            </h3>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              {pageContent.about.mission.description}
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-bg-elevated border border-gold-500/30 space-y-4 shadow-gold-sm">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-gold-300">
              {pageContent.about.vision.title}
            </h3>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              {pageContent.about.vision.description}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. VALUES GRID
         ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-bg-base">
        <div className="max-w-7xl mx-auto space-y-12">
          <SectionHeading
            label="Foundational Pillars"
            title="Our Uncompromising Code of Ethics"
            accentWord="Integrity"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pageContent.about.values.map((val) => (
              <div
                key={val.id}
                className="p-6 rounded-2xl bg-bg-surface border border-gold-500/20 hover:border-gold-400/50 transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-base font-heading font-bold text-text-primary">
                  {val.title}
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {val.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. MILESTONE TIMELINE
         ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-bg-surface border-y border-gold-500/20">
        <div className="max-w-5xl mx-auto space-y-12">
          <SectionHeading
            label="The Journey"
            title="Chronicles of Scientific & Botanical Breakthroughs"
            accentWord="Evolution"
          />

          <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 md:before:left-1/2 before:w-[2px] before:bg-gradient-to-b before:from-gold-600 before:via-gold-400 before:to-gold-600">
            {timelineData.map((item, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={item.year}
                  className={`relative flex flex-col md:flex-row items-start ${
                    isEven ? "md:flex-row-reverse" : ""
                  } gap-6 md:gap-12`}
                >
                  {/* Center Dot */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gold-500 border-4 border-bg-surface flex items-center justify-center text-[10px] font-bold text-bg-base z-10 shadow-gold-sm">
                    {idx + 1}
                  </div>

                  {/* Content Card */}
                  <div className="ml-12 md:ml-0 md:w-1/2 p-6 rounded-2xl bg-bg-elevated border border-gold-500/25 shadow-gold-sm space-y-2">
                    <span className="text-xs font-mono font-bold text-gold-400">
                      {item.year}
                    </span>
                    <h4 className="text-base font-heading font-bold text-text-primary">
                      {item.title}
                    </h4>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. LEADERSHIP & SCIENTIFIC TEAM
         ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-bg-base">
        <div className="max-w-7xl mx-auto space-y-12">
          <SectionHeading
            label="Pioneers Behind The Science"
            title="Meet Our Board of Researchers & Clinicians"
            accentWord="Visionaries"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamData.map((member) => (
              <div
                key={member.id}
                className="group rounded-2xl bg-bg-surface border border-gold-500/25 overflow-hidden hover:border-gold-400/60 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative aspect-[4/5] bg-bg-elevated overflow-hidden">
                  <ImageWithFallback
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-gold-400 block">
                      {member.specialty}
                    </span>
                    <h3 className="text-sm font-heading font-bold text-text-primary">
                      {member.name}
                    </h3>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <p className="text-xs font-medium text-gold-300">{member.role}</p>
                  <p className="text-xs text-text-muted line-clamp-3 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. CERTIFICATIONS & TRUST STRIP
         ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-bg-elevated border-t border-gold-500/20">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h4 className="text-xs font-heading font-semibold uppercase tracking-widest text-gold-400">
              Institutional Accreditation
            </h4>
            <p className="text-lg font-heading font-bold text-text-primary">
              Global Quality & Clinical Safety Certifications
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {certificationsData.map((cert) => (
              <div
                key={cert.id}
                className="p-4 rounded-xl bg-bg-surface border border-gold-500/20 flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-gold-400 shrink-0" />
                  <span className="text-xs font-heading font-bold text-gold-300">
                    {cert.name}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  {cert.description}
                </p>
                <span className="text-[10px] text-text-secondary font-mono">
                  {cert.issuer}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
