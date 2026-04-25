"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProfileForm } from "./profile-form";
import { SecurityForm } from "./security-form";
import { AppearanceForm } from "./appearance-form";
import { PreferencesForm } from "./preferences-form";

interface PreferencesData {
  timezone: string;
  dateFormat: string;
  defaultTaskSort: string;
}

interface SettingsTabsProps {
  /** The user's current display name for the profile form */
  defaultName: string;
  /** The user's current theme preference from the database */
  defaultTheme: string;
  /** The user's current preferences for the preferences form */
  preferences: PreferencesData;
}

/**
 * Settings navigation item definition.
 */
interface NavItem {
  id: string;
  label: string;
}

const navItems: NavItem[] = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "appearance", label: "Appearance" },
  { id: "preferences", label: "Preferences" },
];

/**
 * SettingsTabs — Tabbed navigation for the settings page.
 *
 * Desktop (lg+): Sidebar tabs on the left, content on the right.
 * Mobile (< lg): Horizontal scrollable tabs at the top, content below.
 *
 * @param props - Component props
 * @returns The tabbed settings layout
 */
export function SettingsTabs({
  defaultName,
  defaultTheme,
  preferences,
}: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="flex flex-col lg:flex-row lg:gap-8">
      {/* Mobile: horizontal scrollable tabs */}
      <nav
        className="lg:hidden mb-6 -mx-4 px-4 overflow-x-auto scrollbar-hide"
        aria-label="Settings sections"
      >
        <div className="flex gap-1 min-w-max border-b pb-px">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "relative px-4 py-2 text-sm font-medium transition-colors rounded-t-md",
                activeTab === item.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
              {activeTab === item.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Desktop: sidebar tabs on the left */}
      <nav
        className="hidden lg:block w-48 shrink-0"
        aria-label="Settings sections"
      >
        <div className="sticky top-6 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors",
                activeTab === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content area */}
      <div className="flex-1 min-w-0">
        {activeTab === "profile" && <ProfileForm defaultName={defaultName} />}
        {activeTab === "security" && <SecurityForm />}
        {activeTab === "appearance" && (
          <AppearanceForm defaultTheme={defaultTheme} />
        )}
        {activeTab === "preferences" && (
          <PreferencesForm defaultValues={preferences} />
        )}
      </div>
    </div>
  );
}
