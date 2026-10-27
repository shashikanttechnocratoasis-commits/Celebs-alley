"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Star,
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Award,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ImageWithFallback } from "@/components/public/ImageWithFallback";
import { useAppStore } from "@/store";

export default function ExpertsPage() {
  const { consultants } = useAppStore();
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");

  const activeConsultants = useMemo(() => {
    return consultants.filter((c) => c.status !== "suspended");
  }, [consultants]);

  const specialties = useMemo(() => {
    const set = new Set<string>();
    activeConsultants.forEach((c) => c.specialties.forEach((s) => set.add(s)));
    return ["All", ...Array.from(set)];
  }, [activeConsultants]);

  const filteredExperts = useMemo(() => {
    if (selectedSpecialty === "All") return activeConsultants;
    return activeConsultants.filter((c) => c.specialties.includes(selectedSpecialty));
  }, [selectedSpecialty, activeConsultants]);

  return (
    <div className="w-full flex flex-col pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <SectionHeading
            label="Clinical Faculty & Surgeons"
            title="Consult with India's Foremost Aesthetic Dermatologists"
            accentWord="Distinguished"
          />
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            Every Celebs Alley consultant is a board-certified MD dermatologist or Ayurvedic cosmetologist with over a decade of clinical experience.
          </p>
        </div>

        {/* Specialty Filter Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-3 rounded-2xl bg-bg-surface border border-gold-500/20 max-w-4xl mx-auto">
          {specialties.map((spec) => {
            const isSelected = selectedSpecialty === spec;
            return (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-gold-600 to-gold-400 text-bg-base font-semibold shadow-gold-sm"
                    : "bg-bg-elevated text-text-secondary hover:text-gold-300"
                }`}
              >
                {spec}
              </button>
            );
          })}
        </div>

        {/* Experts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredExperts.map((expert) => (
            <div
              key={expert.id}
              className="rounded-3xl bg-bg-surface border border-gold-500/25 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 justify-between hover:border-gold-400/60 transition-all duration-300 hover:shadow-[0_15px_40px_rgba(212,175,55,0.15)] group"
            >
              {/* Avatar Photo */}
              <div className="relative w-full sm:w-44 aspect-square rounded-2xl overflow-hidden bg-bg-elevated shrink-0 border border-gold-500/20">
                <ImageWithFallback
                  src={expert.avatar}
                  alt={expert.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 200px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 bg-bg-base/85 backdrop-blur-md px-2 py-0.5 rounded-full border border-gold-500/30 text-[10px] font-semibold text-gold-300 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
                  <span>{expert.rating.toFixed(2)}</span>
                </div>
              </div>

              {/* Info Details */}
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div>
                    <h3 className="text-xl font-heading font-bold text-text-primary group-hover:text-gold-300 transition-colors">
                      {expert.name}
                    </h3>
                    <p className="text-xs font-semibold text-gold-400 mt-0.5">
                      {expert.title}
                    </p>
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                    {expert.bio}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {expert.specialties.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-0.5 rounded-md bg-gold-500/10 border border-gold-500/20 text-[10px] text-gold-300 font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-gold-500/15 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-text-muted block">Consultation Fee</span>
                    <span className="text-base font-heading font-bold text-gold-300">
                      ₹{expert.consultationFee.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/experts/${expert.slug || expert.id}`}>
                      <Button variant="outline" size="sm" className="border-gold-500/30 text-gold-300 text-xs py-1.5 px-3">
                        View Profile
                      </Button>
                    </Link>
                    <Link href={`/book?expert=${expert.id}`}>
                      <Button variant="gold" size="sm" className="text-xs py-1.5 px-3">
                        Book Slot
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
