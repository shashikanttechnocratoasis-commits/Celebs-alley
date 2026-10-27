"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import initialFaqsData from "@/data/faqs.json";
import { useAppStore } from "@/store";

export default function FAQPage() {
  const storeFaqs = useAppStore((state) => state.faqs);
  const faqsData = useMemo(() => {
    return storeFaqs && storeFaqs.length > 0 ? storeFaqs : initialFaqsData;
  }, [storeFaqs]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openFaqId, setOpenFaqId] = useState<string | null>(faqsData[0]?.id || null);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(faqsData.map((f) => f.category)));
    return ["All", ...unique];
  }, []);

  const filteredFaqs = useMemo(() => {
    return faqsData.filter((faq) => {
      const matchesCat =
        selectedCategory === "All" || faq.category === selectedCategory;
      const matchesSearch =
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full flex flex-col pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <SectionHeading
            label="Inquiries & Clarity"
            title="Frequently Asked Questions"
            accentWord="Assistance"
          />
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            Everything you need to know about our AI diagnostic algorithms, tele-dermatology appointments, and clean Ayurvedic formulations.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gold-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword (e.g. AI accuracy, delivery, melasma, booking)..."
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-bg-surface border border-gold-500/30 text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 shadow-gold-sm"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-gold-600 to-gold-400 text-bg-base font-semibold shadow-gold-sm"
                      : "bg-bg-surface border border-gold-500/20 text-text-secondary hover:text-gold-300"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Accordion FAQ List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-2xl bg-bg-surface border border-gold-500/20 overflow-hidden transition-all duration-200 hover:border-gold-400/50"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <span className="text-sm sm:text-base font-heading font-semibold text-text-primary">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gold-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-gold-500/15">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-bg-surface border border-gold-500/20 space-y-3">
              <p className="text-sm text-text-secondary">No FAQs found matching &ldquo;{searchQuery}&rdquo;.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="border-gold-500/30 text-gold-300"
              >
                Reset Search
              </Button>
            </div>
          )}
        </div>

        {/* Still Need Help Banner */}
        <div className="p-8 rounded-3xl bg-bg-elevated border border-gold-500/30 text-center space-y-4 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
          <div className="w-12 h-12 rounded-full bg-gold-500/20 border border-gold-400 mx-auto flex items-center justify-center text-gold-400">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-heading font-bold text-text-primary">
            Still Have Questions? Our Concierge Is Here
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto">
            Speak directly with our clinical support desk in Kota or send an inquiry for personalized assistance.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/contact">
              <Button variant="gold" size="md" className="uppercase tracking-wider text-xs font-semibold">
                <Mail className="w-3.5 h-3.5 mr-2" />
                Contact Concierge
              </Button>
            </Link>
            <a href="tel:+919824424455">
              <Button variant="outline" size="md" className="border-gold-500/40 text-gold-300">
                <Phone className="w-3.5 h-3.5 mr-2" />
                +91 98244 24455
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
