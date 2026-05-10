import Link from "next/link";
import { DashboardPreview } from "./dashboard-preview";

export function HeroSection() {
  return (
    <section className="relative bg-background pt-32 pb-20 md:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow */}
          <p className="animate-fade-up mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Personal Task Management
          </p>

          {/* H1 */}
          <h1 className="animate-fade-up max-w-4xl text-[clamp(3rem,8vw,7rem)] font-black leading-[1.05] tracking-[-0.03em] text-foreground">
            Task management<br />that gets out<br />of your way.
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-up mt-6 max-w-[52ch] text-[clamp(1rem,2vw,1.25rem)] text-muted-foreground">
            Create tasks, set priorities, track what matters — from any device,
            without the noise.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up mt-10 flex flex-col gap-4 sm:flex-row">
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
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="animate-fade-up-scale mt-16 md:mt-20">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
