"use client";

import Image from "next/image";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

interface MacBrowserFrameProps {
  children: React.ReactNode;
}

function MacBrowserFrame({ children }: MacBrowserFrameProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#1e1e1e] shadow-lg">
      {/* macOS Browser Chrome */}
      <div className="flex h-10 items-center gap-2 border-b border-white/[0.06] bg-[#2d2d2d] px-4">
        {/* Traffic Lights */}
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-[#ff5f57] border border-[#e0443e]/30" />
          <div className="h-3 w-3 rounded-full bg-[#febc2e] border border-[#d89e1f]/30" />
          <div className="h-3 w-3 rounded-full bg-[#28c840] border border-[#1aab29]/30" />
        </div>
        
        {/* Address Bar */}
        <div className="mx-auto flex h-6 w-full max-w-xs items-center justify-center rounded-md bg-[#1e1e1e] px-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-gray-500">app.taskflow.com</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full bg-background">
        {children}
      </div>
    </div>
  );
}

interface FeatureRowProps {
  eyebrow: string;
  title: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
  reversed?: boolean;
}

function FeatureRow({ eyebrow, title, body, imageSrc, imageAlt, reversed }: FeatureRowProps) {
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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          {eyebrow}
        </p>
        <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-tight tracking-[-0.02em] text-foreground">
          {title}
        </h2>
        <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>
      <div className={cn(reversed && "lg:order-1")}>
        <MacBrowserFrame>
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={1200}
            height={800}
            className="w-full h-auto"
            loading="lazy"
          />
        </MacBrowserFrame>
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
      imageSrc: "/tasks-list.png",
      imageAlt: "TaskFlow task list showing captured tasks",
      reversed: false,
    },
    {
      eyebrow: "Organize",
      title: "Categories that actually work.",
      body: "Create your own categories with custom colors. Filter, group, and sort until the view matches how you think.",
      imageSrc: "/categories.png",
      imageAlt: "TaskFlow categories page showing custom color-coded categories",
      reversed: true,
    },
    {
      eyebrow: "Focus",
      title: "Your dashboard, your signal.",
      body: "Overdue tasks, due today, high priority — surfaced the moment you log in. No noise, no setup.",
      imageSrc: "/dashboard-screenshot.png",
      imageAlt: "TaskFlow dashboard showing metrics and priority overview",
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
