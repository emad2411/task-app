import type { Metadata } from "next";
import { LegalLayout } from "@/components/marketing/legal-layout";

export const metadata: Metadata = {
  title: "About TaskFlow",
  description:
    "TaskFlow is a personal task management tool built for people who prefer tools that get out of the way.",
};

export default function AboutPage() {
  return (
    <LegalLayout title="About TaskFlow">
      <h2 id="why">Why TaskFlow exists</h2>
      <p>
        Productivity tools have a problem. Enterprise tools feel like filling out requisition
        forms. Consumer tools feel like toys with pastel gradients and motivational platitudes.
        There is a gap: tools for people who just need to capture what matters, organize it
        quickly, and get back to work.
      </p>
      <p>
        TaskFlow fills that gap. It is a task manager built with the belief that the best
        productivity tool is the one you don&rsquo;t notice. No onboarding tours. No feature
        request voting boards. No &ldquo;what&rsquo;s on your mind?&rdquo; prompts. Just tasks,
        priorities, due dates, and a clean interface that stays out of your way.
      </p>
      <p>
        We built TaskFlow because we wanted a task manager that felt like a proper tool: sharp,
        fast, keyboard-friendly, and confident enough to do one thing well. If that resonates,
        you&rsquo;re the person we&rsquo;re building for.
      </p>

      <h2 id="building">What we&rsquo;re building</h2>
      <p>
        Right now, TaskFlow is a focused individual task manager. You can create tasks, set
        priorities and due dates, organize with categories, filter and sort your list, and see
        a dashboard of what needs attention. It is free to use.
      </p>
      <p>
        The current release is built around a single core loop: capture something that needs
        doing, organize it so you can find it later, and complete it so it stops taking up mental
        space. Everything in the interface serves that loop and nothing else.
      </p>
      <p>
        On the roadmap: team collaboration, recurring tasks, notifications, and calendar
        integration. These will arrive when they can be built to the same standard as the core
        product. We ship features when they are ready, not when a roadmap slide says they should.
      </p>

      <h2 id="intention">Built with intention</h2>
      <p>
        TaskFlow runs on Next.js, TypeScript, PostgreSQL, and Tailwind CSS. The stack is modern
        but not trendy: every dependency earns its place. The codebase is structured so any
        developer can understand it in an afternoon.
      </p>
      <p>
        We believe tools should be transparent. No dark patterns. No feature gates that unlock
        at a higher price point. No &ldquo;growth hacking.&rdquo; If TaskFlow isn&rsquo;t the right
        tool for you, we want you to figure that out quickly and not waste your time.
      </p>

      <h2 id="contact">Get in touch</h2>
      <p>
        Questions, ideas, or feedback? We read every message. Reach us at{" "}
        <a href="mailto:hello@taskflow.app">hello@taskflow.app</a> or visit the{" "}
        <a href="/contact">contact page</a>.
      </p>
    </LegalLayout>
  );
}
