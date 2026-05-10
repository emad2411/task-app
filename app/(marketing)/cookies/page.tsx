import type { Metadata } from "next";
import { LegalLayout } from "@/components/marketing/legal-layout";

export const metadata: Metadata = {
  title: "Cookie Policy — TaskFlow",
  description: "How TaskFlow uses cookies and similar technologies.",
};

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      lastUpdated="Last updated: May 2025"
    >
      <h2 id="what-are-cookies">What Are Cookies?</h2>
      <p>
        Cookies are small text files placed on your device by websites you visit. They are widely
        used to make websites work efficiently and to provide information to the site owners.
      </p>
      <p>
        TaskFlow uses only essential cookies. We do not use advertising, analytics, or tracking
        cookies of any kind.
      </p>

      <h2 id="how-we-use">How We Use Cookies</h2>
      <p>
        Cookies are required for core authentication functionality: keeping you signed in,
        maintaining your session, and remembering your preferences. Without these cookies, the
        Service cannot function.
      </p>

      <h2 id="types">Types of Cookies We Use</h2>
      <table>
        <thead>
          <tr>
            <th>Cookie name</th>
            <th>Type</th>
            <th>Purpose</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>session_token</code>
            </td>
            <td>Essential</td>
            <td>Authentication session</td>
            <td>Session</td>
          </tr>
          <tr>
            <td>
              <code>better_auth.*</code>
            </td>
            <td>Essential</td>
            <td>Auth state management (Better Auth)</td>
            <td>Session</td>
          </tr>
          <tr>
            <td>
              <code>theme</code>
            </td>
            <td>Preference</td>
            <td>Stores light/dark theme preference</td>
            <td>1 year</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>No advertising or analytics cookies are used.</strong> TaskFlow does not track
        you across websites, build profiles, or serve targeted advertisements.
      </p>

      <h2 id="managing">Managing Cookies</h2>
      <p>
        Most browsers allow you to control cookies through their settings. You can typically
        block or delete cookies, but doing so may prevent TaskFlow from working correctly. Session
        cookies are required for authentication; disabling them will prevent you from signing in.
      </p>
      <p>
        To learn more about managing cookies in your browser, visit your browser&rsquo;s help
        documentation:
      </p>
      <ul>
        <li>Chrome: Settings &rarr; Privacy and security &rarr; Cookies</li>
        <li>Firefox: Preferences &rarr; Privacy &amp; Security &rarr; Cookies</li>
        <li>Safari: Preferences &rarr; Privacy &rarr; Cookies</li>
      </ul>

      <h2 id="contact">Contact</h2>
      <p>
        Questions about cookies? Email us at{" "}
        <a href="mailto:privacy@taskflow.app">privacy@taskflow.app</a>.
      </p>
    </LegalLayout>
  );
}
