import { MetadataRoute } from "next";
import services from "@/data/services.json";
import blog from "@/data/blog.json";
import consultants from "@/data/consultants.json";
import products from "@/data/products.json";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://celebsalley.com";
  const lastModified = new Date();

  // Static routes
  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/technology",
    "/shop",
    "/experts",
    "/blog",
    "/faq",
    "/contact",
    "/book",
    "/legal/privacy",
    "/legal/terms",
    "/legal/cookies",
    "/legal/consent",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic Service routes
  const serviceRoutes = services.map((s) => ({
    url: `${baseUrl}/services/${s.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Dynamic Blog routes
  const blogRoutes = blog.map((b) => ({
    url: `${baseUrl}/blog/${b.slug}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Dynamic Expert routes
  const expertRoutes = consultants.map((c) => ({
    url: `${baseUrl}/experts/${c.slug || c.id}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Dynamic Shop routes
  const productRoutes = products.map((p) => ({
    url: `${baseUrl}/shop/${p.id}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...blogRoutes,
    ...expertRoutes,
    ...productRoutes,
  ];
}
