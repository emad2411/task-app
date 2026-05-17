import { Navbar } from "@/components/marketing/navbar";
import { HeroSection } from "@/components/marketing/hero-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { CTASection } from "@/components/marketing/cta-section";
import { Footer } from "@/components/marketing/footer";
import { getSession } from "@/lib/auth/session";

export default async function LandingPage() {
  const session = await getSession();

  return (
    <div className="dark bg-background">
      {/* No-JS fallback: ensure scroll-reveal content is visible */}
      <noscript
        dangerouslySetInnerHTML={{
          __html:
            "<style>.scroll-reveal { opacity: 1 !important; transform: none !important; }</style>",
        }}
      />

      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:mt-2 focus:ml-4 focus:inline-block focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-background"
      >
        Skip to content
      </a>

      <Navbar session={session} />

      <main id="main-content">
        <HeroSection session={session} />
        <FeaturesSection />
        <CTASection session={session} />
      </main>

      <Footer />
    </div>
  );
}
