import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import {
  Clock,
  Calendar,
  User,
  Share2,
  Bookmark,
  ChevronRight,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ImageWithFallback } from "@/components/public/ImageWithFallback";
import blogData from "@/data/blog.json";

export async function generateStaticParams() {
  return blogData.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogData.find((p) => p.slug === slug);
  if (!post) return { title: "Article Not Found | Celebs Alley" };

  return {
    title: `${post.title} | Celebs Alley Scientific Journal`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogData.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = blogData
    .filter((p) => p.id !== post.id)
    .slice(0, 3);

  return (
    <div className="w-full flex flex-col pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:text-gold-300">Home</Link>
          <ChevronRight className="w-3 h-3 text-gold-500/50" />
          <Link href="/blog" className="hover:text-gold-300">Journal</Link>
          <ChevronRight className="w-3 h-3 text-gold-500/50" />
          <span className="text-gold-300 font-medium">{post.category}</span>
        </div>

        {/* Article Header */}
        <div className="space-y-4 text-center">
          <span className="inline-block px-3.5 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-semibold uppercase tracking-wider">
            {post.category}
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-text-primary leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-center gap-4 text-xs text-text-muted pt-2">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gold-400" />
              {post.author}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gold-400" />
              {post.publishedAt}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gold-400" />
              {post.readTimeMinutes} min read
            </span>
          </div>
        </div>

        {/* Hero Featured Image */}
        <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border border-gold-500/30 bg-bg-surface shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <ImageWithFallback
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 900px"
            className="object-cover"
          />
        </div>

        {/* Excerpt Lead Box */}
        <div className="p-6 rounded-2xl bg-bg-surface border-l-4 border-gold-400 text-sm sm:text-base text-text-primary italic leading-relaxed">
          &ldquo;{post.excerpt}&rdquo;
        </div>

        {/* Article Markdown Body */}
        <div className="prose prose-invert max-w-none space-y-6 text-sm sm:text-base text-text-secondary leading-relaxed pt-2">
          {post.content.split("\n\n").map((paragraph, idx) => {
            if (paragraph.startsWith("### ")) {
              return (
                <h3
                  key={idx}
                  className="text-xl sm:text-2xl font-heading font-bold text-text-primary mt-8 mb-3"
                >
                  {paragraph.replace("### ", "")}
                </h3>
              );
            }
            if (paragraph.startsWith("> ")) {
              return (
                <blockquote
                  key={idx}
                  className="p-5 rounded-2xl bg-bg-elevated border-l-4 border-gold-500/80 text-gold-200 italic my-6 text-sm"
                >
                  {paragraph.replace("> ", "")}
                </blockquote>
              );
            }
            if (paragraph.startsWith("- ")) {
              const items = paragraph.split("\n").map((line) => line.replace("- ", ""));
              return (
                <ul key={idx} className="space-y-2 my-4 list-disc pl-5 text-sm">
                  {items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              );
            }
            return <p key={idx}>{paragraph}</p>;
          })}
        </div>

        {/* Author Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-bg-surface border border-gold-500/25 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gold-500/20 border border-gold-400 flex items-center justify-center text-xl font-heading font-bold text-gold-300 shrink-0">
            {post.author.charAt(0)}
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] uppercase tracking-widest text-gold-400 font-semibold">
              Authored By
            </span>
            <h4 className="text-base font-heading font-bold text-text-primary">
              {post.author}
            </h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Clinical Contributor to Celebs Alley Journal & Member of the AI Formulation Advisory Board.
            </p>
          </div>
        </div>

        {/* Consultation Call to Action */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-bg-surface via-bg-elevated to-bg-surface border border-gold-500/30 text-center space-y-4 shadow-gold-sm">
          <h3 className="text-xl font-heading font-bold text-text-primary">
            Curious How These Insights Apply to Your Skin?
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary max-w-lg mx-auto">
            Run a simulated 8-parameter AI face scan or consult directly with our clinical dermatologists.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/book">
              <Button variant="gold" size="md" className="uppercase tracking-wider text-xs font-semibold">
                Book Consultation
              </Button>
            </Link>
            <Link href="/technology">
              <Button variant="outline" size="md" className="border-gold-500/40 text-gold-300">
                Explore AI Technology
              </Button>
            </Link>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="pt-8 border-t border-gold-500/20 space-y-6">
            <h3 className="text-xl font-heading font-bold text-text-primary">
              More Insights from The Royal Gazette
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="group p-4 rounded-2xl bg-bg-surface border border-gold-500/20 hover:border-gold-400/50 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-bg-elevated">
                    <ImageWithFallback
                      src={rel.coverImage}
                      alt={rel.title}
                      fill
                      sizes="250px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-gold-400 font-semibold">
                      {rel.category}
                    </span>
                    <h4 className="text-xs font-heading font-bold text-text-primary group-hover:text-gold-300 transition-colors line-clamp-2 mt-1">
                      {rel.title}
                    </h4>
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
