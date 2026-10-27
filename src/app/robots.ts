import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/seller/", "/app/", "/consultant/", "/api/"],
      },
    ],
    sitemap: "https://celebsalley.com/sitemap.xml",
  };
}
