import type { Metadata, Viewport } from "next";
import { Playfair_Display, Montserrat, Allura } from "next/font/google";
import "@/app/globals.css";
import { StoreProvider } from "@/store/StoreProvider";
import { ToastProvider } from "@/components/ui/Toast";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const allura = Allura({
  subsets: ["latin"],
  variable: "--font-allura",
  display: "swap",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Celebs Alley | AI-Powered Luxury Beauty Commerce",
  description: "B2B2C AI-Powered Beauty Commerce SaaS Marketplace — BEAUTY | WELLNESS | TREATMENT",
  keywords: ["luxury beauty", "AI skin analysis", "dermatology SaaS", "wellness", "Celebs Alley"],
  authors: [{ name: "Celebs Alley" }],
  icons: {
    icon: "/brand/logo.png",
    apple: "/brand/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0907",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${montserrat.variable} ${allura.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[#0B0907] text-[#F5EDE0] font-sans antialiased selection:bg-[#C99A45]/30 selection:text-[#F5EDE0]">
        <StoreProvider>
          {children}
          <ToastProvider />
        </StoreProvider>
      </body>
    </html>
  );
}
