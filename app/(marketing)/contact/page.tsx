import type { Metadata } from "next";
import { LegalLayout } from "@/components/marketing/legal-layout";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "Contact — TaskFlow",
  description: "Get in touch with the TaskFlow team.",
};

export default function ContactPage() {
  return (
    <LegalLayout
      title="Contact"
      description="Questions, feedback, or issues — we&rsquo;re here."
    >
      <h2 id="form">Send a message</h2>
      <ContactForm />

      <hr className="border-white/[0.08] my-8" />

      <h2 id="general">General inquiries</h2>
      <p>
        You can also reach us directly at{" "}
        <a href="mailto:hello@taskflow.app">hello@taskflow.app</a>.
      </p>
      <p>
        We read every message. You&rsquo;ll typically hear back within one business day.
      </p>

      <h2 id="privacy">Privacy and data requests</h2>
      <p>
        To request access to your data, correct your information, delete your account, or export
        your data:{" "}
        <a href="mailto:privacy@taskflow.app">privacy@taskflow.app</a>
      </p>
      <p>
        These requests are processed under our{" "}
        <a href="/privacy">Privacy Policy</a>. We respond within 30 days as required by the
        GDPR and CCPA.
      </p>

      <h2 id="bugs">Bug reports</h2>
      <p>
        Found something that isn&rsquo;t working right? Tell us at{" "}
        <a href="mailto:hello@taskflow.app">hello@taskflow.app</a>. Include what you were doing,
        what you expected, and what happened instead. Screenshots help.
      </p>
      <p>
        We aim to acknowledge all bug reports within 2 business days.
      </p>
    </LegalLayout>
  );
}
