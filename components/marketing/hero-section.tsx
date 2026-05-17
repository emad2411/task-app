import Link from "next/link";
import { DashboardPreview } from "./dashboard-preview";
import type { Session } from "@/lib/auth/session";

interface HeroSectionProps {
  session?: Session | null;
}

export function HeroSection({ session }: HeroSectionProps) {
  return (
    <section className="relative bg-background pt-20 pb-16 md:pt-24 md:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow */}
          <p className="animate-fade-up mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Personal Task Management
          </p>

          {/* H1 */}
          <h1 className="animate-fade-up max-w-4xl text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.1] tracking-[-0.02em] text-foreground">
            Task management<br />that gets out<br />of your way.
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-up mt-4 max-w-[52ch] text-[clamp(1rem,2vw,1.25rem)] text-muted-foreground">
            Create tasks, set priorities, track what matters — from any device,
            without the noise.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up mt-8 flex flex-col gap-4 sm:flex-row">
            {session ? (
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-6 text-sm font-semibold text-background transition-colors hover:bg-brand-deep landing-focus"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-6 text-sm font-semibold text-background transition-colors hover:bg-brand-deep landing-focus"
                >
                  Get Started
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-white/20 px-6 text-sm font-semibold text-foreground transition-colors hover:bg-white/5 landing-focus"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="animate-fade-up-scale mt-12 md:mt-16">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
