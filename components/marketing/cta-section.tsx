"use client";

import Link from "next/link";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

export function CTASection() {
  const { ref, isRevealed } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="border-y border-white/[0.08] bg-card">
      <div
        ref={ref}
        className={cn(
          "scroll-reveal mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8",
          isRevealed && "revealed"
        )}
      >
        <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-tight tracking-[-0.02em] text-foreground">
          Start organizing today.
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Free for everyone. No credit card required.
        </p>
        <div className="mt-10">
          <Link
            href="/sign-up"
            className="inline-flex h-12 items-center justify-center rounded-md bg-brand px-8 text-sm font-semibold text-background transition-colors hover:bg-brand-deep landing-focus"
          >
            Create free account
          </Link>
        </div>
      </div>
    </section>
  );
}
