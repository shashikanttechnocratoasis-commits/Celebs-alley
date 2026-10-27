"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  Calendar,
  Filter,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ImageWithFallback } from "@/components/public/ImageWithFallback";
import initialServicesData from "@/data/services.json";
import { useAppStore } from "@/store";

export default function ServicesPage() {
  const storeServices = useAppStore((state) => state.services);
  const servicesData = useMemo(() => {
    return storeServices && storeServices.length > 0 ? storeServices : initialServicesData;
  }, [storeServices]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    const unique = Array.from(new Set(servicesData.map((s) => s.category)));
    return ["All", ...unique];
  }, []);

  const filteredServices = useMemo(() => {
    return servicesData.filter((service) => {
      const matchesCategory =
        selectedCategory === "All" || service.category === selectedCategory;
      const matchesSearch =
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="w-full flex flex-col pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <SectionHeading
            label="Clinical Menu & Rituals"
            title="Dermatologist-Engineered Treatments for Every Concern"
            accentWord="Transformative"
          />
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            From virtual AI spectral diagnostics to in-clinic 24K gold marma therapies and medical laser peels, discover bespoke care calibrated to your unique skin profile.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-bg-surface border border-gold-500/20">
          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-gold-600 to-gold-400 text-bg-base font-semibold shadow-gold-sm"
                      : "bg-bg-elevated text-text-secondary hover:text-gold-300 hover:bg-gold-500/10"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gold-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search treatments..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-bg-elevated border border-gold-500/25 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400"
            />
          </div>
        </div>

        {/* Services Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredServices.map((service) => (
              <motion.div
                key={service.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="group rounded-2xl bg-bg-surface border border-gold-500/25 overflow-hidden hover:border-gold-400/60 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(212,175,55,0.15)] flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-bg-elevated">
                    <ImageWithFallback
                      src={(service as any).image || "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80"}
                      alt={service.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-bg-base/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-gold-500/30 text-[10px] font-semibold text-gold-300">
                      {service.category}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-bg-base/85 backdrop-blur-md px-3 py-1 rounded-full border border-gold-500/30 text-xs font-bold text-gold-400">
                      ₹{((service as any).price ?? ((service as any).pricePaise ? (service as any).pricePaise / 100 : 0)).toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <Clock className="w-3.5 h-3.5 text-gold-400" />
                      <span>{(service as any).durationMinutes || (service as any).duration || 60} Minutes Session</span>
                    </div>
                    <h3 className="text-base font-heading font-bold text-text-primary group-hover:text-gold-300 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-gold-500/15 flex items-center justify-between">
                    <Link
                      href={`/services/${(service as any).slug || service.id}`}
                      className="text-xs text-gold-400 hover:text-gold-200 font-semibold flex items-center gap-1"
                    >
                      View Details <ArrowRight className="w-3 h-3" />
                    </Link>
                    <Link href={`/book?service=${service.id}`}>
                      <Button variant="gold" size="sm" className="text-xs py-1.5 px-3">
                        Book Treatment
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredServices.length === 0 && (
          <div className="text-center py-16 bg-bg-surface rounded-2xl border border-gold-500/20 space-y-3">
            <p className="text-base text-text-secondary">No treatments found matching your criteria.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="border-gold-500/30 text-gold-300"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
