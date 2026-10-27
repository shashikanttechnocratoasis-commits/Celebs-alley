"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Clock,
  ArrowRight,
  BookOpen,
  Sparkles,
  Calendar,
  User,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ImageWithFallback } from "@/components/public/ImageWithFallback";
import initialBlogData from "@/data/blog.json";
import { useAppStore } from "@/store";

export default function BlogPage() {
  const storeArticles = useAppStore((state) => state.blogArticles);
  const blogData = useMemo(() => {
    return storeArticles && storeArticles.length > 0 ? storeArticles : initialBlogData;
  }, [storeArticles]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    const unique = Array.from(new Set(blogData.map((b) => b.category)));
    return ["All", ...unique];
  }, []);

  const filteredPosts = useMemo(() => {
    return blogData.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.excerpt || (post as any).summary || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredPost = blogData[0];

  return (
    <div className="w-full flex flex-col pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <SectionHeading
            label="Scientific Journal & Gazette"
            title="Evidence-Based Dermatology & Ayurvedic Botany"
            accentWord="Chronicles"
          />
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            Peer-reviewed articles, ingredient deep-dives, and clinical breakdowns written by our board of aesthetic dermatologists and formulation chemists.
          </p>
        </div>

        {/* Featured Post Card */}
        {featuredPost && (
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="block rounded-3xl bg-bg-surface border border-gold-500/30 overflow-hidden hover:border-gold-400/60 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(212,175,55,0.15)] group"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 relative aspect-[16/10] overflow-hidden bg-bg-elevated">
                <ImageWithFallback
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 700px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-bg-base/85 backdrop-blur-md px-3 py-1 rounded-full border border-gold-500/30 text-xs font-semibold text-gold-300">
                  Featured Dossier
                </div>
              </div>

              <div className="lg:col-span-5 p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span className="text-gold-400 font-semibold">{featuredPost.category}</span>
                  <span>•</span>
                  <span>{featuredPost.readTimeMinutes} min read</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary group-hover:text-gold-300 transition-colors leading-snug">
                  {featuredPost.title}
                </h2>

                <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
                  {featuredPost.excerpt || (featuredPost as any).summary}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs text-text-muted">
                  <span>By {featuredPost.author}</span>
                  <span className="text-gold-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read Full Article <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-bg-surface border border-gold-500/20">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-gold-600 to-gold-400 text-bg-base font-semibold shadow-gold-sm"
                      : "bg-bg-elevated text-text-secondary hover:text-gold-300"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gold-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-bg-elevated border border-gold-500/25 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-400"
            />
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-3xl bg-bg-surface border border-gold-500/25 overflow-hidden hover:border-gold-400/60 transition-all duration-300 hover:shadow-[0_15px_40px_rgba(212,175,55,0.15)] flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-bg-elevated">
                  <ImageWithFallback
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-bg-base/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-gold-500/30 text-[10px] font-semibold text-gold-300">
                    {post.category}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Clock className="w-3.5 h-3.5 text-gold-400" />
                    <span>{post.readTimeMinutes} min read • {post.publishedAt}</span>
                  </div>

                  <h3 className="text-base font-heading font-bold text-text-primary group-hover:text-gold-300 transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                    {post.excerpt || (post as any).summary}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="pt-3 border-t border-gold-500/15 flex items-center justify-between text-xs">
                  <span className="text-text-muted">By {post.author}</span>
                  <span className="text-gold-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read Article <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
