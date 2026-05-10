import type { Metadata } from "next";
import { LegalLayout } from "@/components/marketing/legal-layout";

export const metadata: Metadata = {
  title: "Terms of Service — TaskFlow",
  description: "The terms and conditions governing your use of TaskFlow.",
};

const toc = [
  { id: "acceptance", label: "Acceptance of Terms" },
  { id: "description", label: "Description of Service" },
  { id: "account", label: "Account Registration" },
  { id: "acceptable-use", label: "Acceptable Use" },
  { id: "intellectual-property", label: "Intellectual Property" },
  { id: "privacy", label: "Privacy" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "liability", label: "Limitation of Liability" },
  { id: "termination", label: "Termination" },
  { id: "changes", label: "Changes to Terms" },
  { id: "contact", label: "Contact" },
];

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      lastUpdated="Last updated: May 2025"
      description="Please read these terms carefully before using TaskFlow."
      toc={toc}
    >
      <h2 id="acceptance">1. Acceptance of Terms</h2>
      <p>
        By creating an account or using TaskFlow (&ldquo;the Service&rdquo;), you agree to be
        bound by these Terms of Service. If you do not agree to these terms, do not use the
        Service.
      </p>
      <p>
        You must be at least 13 years old to use TaskFlow. By using the Service, you represent
        that you meet this age requirement.
      </p>

      <h2 id="description">2. Description of Service</h2>
      <p>
        TaskFlow is a personal task management application that allows you to create, organize,
        prioritize, and track tasks. The Service is currently free to use. We reserve the right
        to introduce paid tiers in the future, with reasonable notice provided to existing users.
      </p>
      <p>
        TaskFlow is designed for individual use. While we may introduce collaboration features in
        the future, the current Service is built and supported as an individual productivity tool.
      </p>

      <h2 id="account">3. Account Registration</h2>
      <p>
        You must provide accurate and complete information when creating your account. You are
        responsible for maintaining the confidentiality of your login credentials and for all
        activity that occurs under your account.
      </p>
      <p>
        You must notify us immediately if you believe your account has been compromised. TaskFlow
        is not liable for any loss or damage arising from unauthorized use of your account.
      </p>

      <h2 id="acceptable-use">4. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for any unlawful purpose or in violation of any applicable laws.</li>
        <li>
          Upload, store, or transmit content that is infringing, defamatory, obscene, or
          otherwise harmful.
        </li>
        <li>
          Attempt to gain unauthorized access to the Service, other accounts, or the systems
          and networks connected to the Service.
        </li>
        <li>
          Interfere with or disrupt the Service, its servers, or its underlying infrastructure.
        </li>
        <li>
          Use automated means (bots, scrapers, crawlers) to access or collect data from the
          Service without our explicit written permission.
        </li>
        <li>
          Resell, sublicense, or commercially exploit the Service without authorization.
        </li>
      </ul>

      <h2 id="intellectual-property">5. Intellectual Property</h2>
      <p>
        TaskFlow and its original content, features, and functionality are owned by the TaskFlow
        team and are protected by international copyright, trademark, and other intellectual
        property laws.
      </p>
      <p>
        <strong>Your content:</strong> You retain ownership of the tasks, categories, and other
        data you create within the Service. By using TaskFlow, you grant us a limited license to
        store and process this data solely for the purpose of providing the Service to you.
      </p>

      <h2 id="privacy">6. Privacy</h2>
      <p>
        Your privacy matters. Our collection and use of your personal information is governed by
        our{" "}
        <a href="/privacy">Privacy Policy</a>, which is incorporated into these Terms by
        reference. Please read it to understand what data we collect and how we use it.
      </p>

      <h2 id="disclaimers">7. Disclaimers</h2>
      <p>
        <strong>The Service is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo;</strong>{" "}
        We make no warranties, express or implied, regarding the Service&rsquo;s availability,
        reliability, or fitness for a particular purpose.
      </p>
      <p>
        We do not guarantee that the Service will be uninterrupted, secure, or error-free. You
        use the Service at your own risk.
      </p>
      <p>
        TaskFlow does not provide legal, financial, or professional advice. Any reliance on
        information provided by the Service is at your own risk.
      </p>

      <h2 id="liability">8. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, TaskFlow and its operators shall not be liable
        for any indirect, incidental, special, consequential, or punitive damages arising from
        your use of the Service, including but not limited to loss of data, loss of profits, or
        business interruption.
      </p>
      <p>
        Our total liability for any claim arising from these Terms or your use of the Service
        shall not exceed the amount you have paid us for the Service in the twelve months
        preceding the claim, or one hundred US dollars ($100) if you have not made any payments.
      </p>

      <h2 id="termination">9. Termination</h2>
      <p>
        We may suspend or terminate your account at any time, with or without cause, and with or
        without notice. If your account is terminated, you lose access to your data. We recommend
        that you maintain your own backups of important information.
      </p>
      <p>
        You may delete your account at any time by contacting us. Upon deletion, your personal
        data will be removed in accordance with our Privacy Policy.
      </p>

      <h2 id="changes">10. Changes to Terms</h2>
      <p>
        We reserve the right to modify these Terms at any time. If we make material changes, we
        will notify you by email or through the Service. Your continued use of the Service after
        changes take effect constitutes acceptance of the revised Terms.
      </p>

      <h2 id="contact">11. Contact</h2>
      <p>
        Questions about these Terms? Contact us at{" "}
        <a href="mailto:hello@taskflow.app">hello@taskflow.app</a>.
      </p>
    </LegalLayout>
  );
}
