import { Metadata } from "next";
import { requireAuth } from "@/lib/auth/session";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { getUserPreferences, upsertUserPreferences } from "@/lib/data/preferences";

/**
 * Metadata for the settings page.
 */
export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings",
};

/**
 * SettingsPage — Server Component for the settings route.
 *
 * Protects the route with authentication, fetches the current user
 * and their preferences (auto-creating defaults if none exist),
 * and renders the tabbed settings forms.
 *
 * @returns The settings page layout
 */
export default async function SettingsPage() {
  const { user } = await requireAuth();

  // Ensure user has a preferences record with defaults
  let preferences = await getUserPreferences(user.id);
  if (!preferences) {
    preferences = await upsertUserPreferences(user.id, {});
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <SettingsTabs
        defaultName={user.name ?? ""}
        defaultTheme={preferences.theme}
        preferences={{
          timezone: preferences.timezone ?? "UTC",
          dateFormat: preferences.dateFormat ?? "MM/dd/yyyy",
          defaultTaskSort: preferences.defaultTaskSort ?? "due_date_asc",
        }}
      />
    </div>
  );
}
