"use client";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

interface FeatureRowProps {
  eyebrow: string;
  title: string;
  body: string;
  visual: React.ReactNode;
  reversed?: boolean;
}

function FeatureRow({ eyebrow, title, body, visual, reversed }: FeatureRowProps) {
  const { ref, isRevealed } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn(
        "scroll-reveal grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16",
        isRevealed && "revealed"
      )}
    >
      <div className={cn("flex flex-col gap-4", reversed && "lg:order-2")}>
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          {eyebrow}
        </h3>
        <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-tight tracking-[-0.02em] text-foreground">
          {title}
        </h2>
        <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>
      <div className={cn("overflow-hidden rounded-xl border border-white/[0.08] bg-card", reversed && "lg:order-1")}>
        {visual}
      </div>
    </div>
  );
}

function FakeTaskForm() {
  return (
    <div className="p-5 md:p-6">
      <div className="mb-4 h-5 w-32 rounded bg-[#1a1a1a]" />
      <div className="space-y-3">
        <div>
          <div className="mb-1.5 h-3 w-12 rounded bg-[#1a1a1a]" />
          <div className="h-9 w-full rounded-md bg-[#1a1a1a]" />
        </div>
        <div>
          <div className="mb-1.5 h-3 w-16 rounded bg-[#1a1a1a]" />
          <div className="h-9 w-full rounded-md bg-[#1a1a1a]" />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <div className="mb-1.5 h-3 w-14 rounded bg-[#1a1a1a]" />
            <div className="h-9 w-full rounded-md bg-[#1a1a1a]" />
          </div>
          <div className="flex-1">
            <div className="mb-1.5 h-3 w-12 rounded bg-[#1a1a1a]" />
            <div className="h-9 w-full rounded-md bg-[#1a1a1a]" />
          </div>
        </div>
        <div className="pt-2">
          <div className="h-9 w-28 rounded-md bg-brand/20" />
        </div>
      </div>
    </div>
  );
}

function FakeFilteredList() {
  return (
    <div className="p-5 md:p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-8 flex-1 rounded-md bg-[#1a1a1a]" />
        <div className="h-8 w-24 rounded-md bg-[#1a1a1a]" />
        <div className="h-8 w-20 rounded-md bg-brand/20" />
      </div>
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-background p-3"
          >
            <div className="h-4 w-4 rounded-sm border border-white/20" />
            <div className="flex-1">
              <div className="mb-1.5 h-3 w-3/4 max-w-[240px] rounded bg-[#1a1a1a]" />
              <div className="flex gap-2">
                <div className="h-5 w-14 rounded-full bg-brand/15" />
                <div className="h-5 w-16 rounded-full bg-[#1a1a1a]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FakeDashboardStats() {
  return (
    <div className="p-5 md:p-6">
      <div className="mb-4 h-5 w-32 rounded bg-[#1a1a1a]" />
      <div className="mb-6 grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-white/[0.06] bg-background p-3 md:p-4"
          >
            <div className="mb-2 h-3 w-16 rounded bg-[#1a1a1a]" />
            <div className="h-6 w-8 rounded bg-[#1a1a1a]" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-background p-3"
          >
            <div className="h-4 w-4 rounded-sm border border-white/20" />
            <div className="flex-1">
              <div className="mb-1.5 h-3 w-3/4 max-w-[240px] rounded bg-[#1a1a1a]" />
              <div className="flex gap-2">
                <div className="h-5 w-14 rounded-full bg-brand/15" />
                <div className="h-5 w-16 rounded-full bg-[#1a1a1a]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const features = [
    {
      eyebrow: "Capture",
      title: "Every task, instantly.",
      body: "Type a title, set a priority, pick a due date. Done. TaskFlow stays out of your way so you can stay in yours.",
      visual: <FakeTaskForm />,
      reversed: false,
    },
    {
      eyebrow: "Organize",
      title: "Categories that actually work.",
      body: "Create your own categories with custom colors. Filter, group, and sort until the view matches how you think.",
      visual: <FakeFilteredList />,
      reversed: true,
    },
    {
      eyebrow: "Focus",
      title: "Your dashboard, your signal.",
      body: "Overdue tasks, due today, high priority — surfaced the moment you log in. No noise, no setup.",
      visual: <FakeDashboardStats />,
      reversed: false,
    },
  ];

  return (
    <section id="features" className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-24 lg:gap-32">
          {features.map((feature, index) => (
            <FeatureRow key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
