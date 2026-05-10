import type { Metadata } from "next";
import { LegalLayout } from "@/components/marketing/legal-layout";

export const metadata: Metadata = {
  title: "Privacy Policy — TaskFlow",
  description:
    "How TaskFlow collects, uses, and protects your personal information.",
};

const toc = [
  { id: "overview", label: "Overview" },
  { id: "information-collected", label: "Information We Collect" },
  { id: "how-we-use", label: "How We Use Your Information" },
  { id: "data-storage", label: "Data Storage and Security" },
  { id: "cookies", label: "Cookies and Tracking" },
  { id: "third-parties", label: "Third-Party Services" },
  { id: "your-rights", label: "Your Rights" },
  { id: "data-retention", label: "Data Retention" },
  { id: "children", label: "Children&rsquo;s Privacy" },
  { id: "changes", label: "Changes to This Policy" },
  { id: "contact", label: "Contact Us" },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      lastUpdated="Last updated: May 2025"
      description="Your privacy matters. Here&rsquo;s exactly what we collect and how we use it."
      toc={toc}
    >
      <h2 id="overview">1. Overview</h2>
      <p>
        TaskFlow is built by a small team that believes productivity tools should respect your
        privacy. This policy describes what information we collect, why we collect it, and what
        control you have over it.
      </p>
      <p>
        We collect the minimum data needed to provide the Service. We do not sell your data,
        show targeted advertisements, or monetize your information in any way.
      </p>

      <h2 id="information-collected">2. Information We Collect</h2>
      <p>
        <strong>Account information:</strong> When you sign up, we collect your name (or display
        name) and email address. This is required to create and authenticate your account.
      </p>
      <p>
        <strong>Task data:</strong> We store the tasks you create, including titles, descriptions,
        due dates, priorities, completion status, and category assignments. This is the core
        function of the Service.
      </p>
      <p>
        <strong>Category data:</strong> Category names and colors that you create to organize
        your tasks.
      </p>
      <p>
        <strong>Preferences:</strong> Your chosen theme (light, dark, or system), timezone, date
        format, and default sort order. These make the Service work the way you want.
      </p>
      <p>
        <strong>Session data:</strong> Authentication tokens and session identifiers, stored
        securely as HTTP-only cookies. These keep you signed in between visits.
      </p>
      <p>
        <strong>We do not collect:</strong> IP addresses (beyond transient rate-limiting
        counters), browser fingerprints, device identifiers, or analytics data. We do not use
        tracking pixels or third-party analytics services.
      </p>

      <h2 id="how-we-use">3. How We Use Your Information</h2>
      <p>We use your information for these purposes and nothing else:</p>
      <ul>
        <li>To create and maintain your account.</li>
        <li>To provide, operate, and improve the task management Service.</li>
        <li>To send essential communications (password resets, email verification, account notices).</li>
        <li>To enforce our Terms of Service and prevent abuse.</li>
        <li>To comply with legal obligations when required.</li>
      </ul>
      <p>
        We do not use your task data for advertising, profiling, or any purpose beyond
        delivering the Service to you.
      </p>

      <h2 id="data-storage">4. Data Storage and Security</h2>
      <p>
        Your data is stored in a PostgreSQL database hosted by Neon, with servers located in the
        region closest to your sign-up location. We use industry-standard encryption for data in
        transit (TLS) and at rest.
      </p>
      <p>
        Authentication is handled by Better Auth, which stores hashed passwords using bcrypt.
        We do not store or have access to your plain-text password.
      </p>
      <p>
        While we take reasonable measures to protect your data, no method of electronic storage
        or transmission is 100% secure. We cannot guarantee absolute security.
      </p>

      <h2 id="cookies">5. Cookies and Tracking</h2>
      <p>
        TaskFlow uses only essential cookies required for the Service to function. We do not use
        advertising cookies, analytics cookies, or any form of tracking technology.
      </p>
      <p>
        For full details on the cookies we use, see our{" "}
        <a href="/cookies">Cookie Policy</a>.
      </p>

      <h2 id="third-parties">6. Third-Party Services</h2>
      <p>
        TaskFlow relies on a minimal set of third-party services to operate. Your data is
        processed by these providers only as necessary:
      </p>
      <ul>
        <li>
          <strong>Neon</strong> — Database hosting. All task data, account information, and
          preferences are stored in Neon-managed PostgreSQL instances.
        </li>
        <li>
          <strong>Resend</strong> — Email delivery. Used to send password reset emails and email
          verification messages. Your email address is transmitted to Resend for delivery only.
        </li>
        <li>
          <strong>Upstash</strong> — Rate limiting. IP addresses are processed transiently to
          enforce rate limits and prevent abuse. IP data is not stored persistently.
        </li>
      </ul>
      <p>
        We do not share your data with any other third parties. If this changes, we will update
        this policy and notify you.
      </p>

      <h2 id="your-rights">7. Your Rights</h2>
      <p>
        Depending on your location, you may have the following rights regarding your personal
        data:
      </p>
      <ul>
        <li>
          <strong>Access:</strong> You can request a copy of the personal data we hold about you.
        </li>
        <li>
          <strong>Correction:</strong> You can request that we correct inaccurate or incomplete
          data.
        </li>
        <li>
          <strong>Deletion:</strong> You can request that we delete your personal data and close
          your account.
        </li>
        <li>
          <strong>Portability:</strong> You can request your data in a structured, machine-readable
          format.
        </li>
      </ul>
      <p>
        To exercise any of these rights, contact us at{" "}
        <a href="mailto:privacy@taskflow.app">privacy@taskflow.app</a>. We respond to all
        requests within 30 days.
      </p>
      <p>
        If you are in the European Economic Area (EEA), these rights are guaranteed under the
        GDPR. If you are in California, these rights are guaranteed under the CCPA.
      </p>

      <h2 id="data-retention">8. Data Retention</h2>
      <p>
        We retain your account information and task data for as long as your account is active.
        If you delete your account, we remove your personal data within 30 days. Some information
        may be retained in encrypted backups for up to 90 days before being permanently deleted.
      </p>
      <p>
        If your account is inactive for an extended period (2+ years), we may reach out before
        deleting it. We will notify you at your registered email address before taking any action.
      </p>

      <h2 id="children">9. Children&rsquo;s Privacy</h2>
      <p>
        TaskFlow is not intended for children under 13. We do not knowingly collect personal
        information from children under 13. If we become aware that a child under 13 has
        provided us with personal data, we will delete it immediately.
      </p>

      <h2 id="changes">10. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Material changes will be communicated
        by email or through the Service. The date at the top of this page reflects the most
        recent revision.
      </p>

      <h2 id="contact">11. Contact Us</h2>
      <p>
        For privacy-related inquiries or to exercise your data rights, email us at{" "}
        <a href="mailto:privacy@taskflow.app">privacy@taskflow.app</a>.
      </p>
    </LegalLayout>
  );
}
