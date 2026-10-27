import { SmoothScroll } from "@/components/public/SmoothScroll";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { FloatingBookButton } from "@/components/public/FloatingBookButton";
import { CookieConsent } from "@/components/public/CookieConsent";
import { ScrollProgressBar } from "@/components/public/ScrollProgressBar";
import { BackToTopButton } from "@/components/public/BackToTopButton";
import { PageTransition } from "@/components/public/PageTransition";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScroll>
      <div className="min-h-screen flex flex-col bg-bg-base text-text-primary selection:bg-gold-500/30 selection:text-gold-200 relative overflow-x-hidden">
        <ScrollProgressBar />
        <PublicNavbar />
        <main className="flex-1 flex flex-col w-full">
          <PageTransition>{children}</PageTransition>
        </main>
        <PublicFooter />
        <FloatingBookButton />
        <BackToTopButton />
        <CookieConsent />
      </div>
    </SmoothScroll>
  );
}
