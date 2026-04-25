"use client";

import { useState, useTransition } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Sun, Moon, Monitor, Loader2, Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { updatePreferencesAction } from "@/lib/actions/settings";

/**
 * Available theme options with their display labels and icons.
 */
const themes = [
  {
    value: "light" as const,
    label: "Light",
    icon: Sun,
    description: "Clean and bright",
  },
  {
    value: "dark" as const,
    label: "Dark",
    icon: Moon,
    description: "Easy on the eyes",
  },
  {
    value: "system" as const,
    label: "System",
    icon: Monitor,
    description: "Follows your OS",
  },
];

interface AppearanceFormProps {
  /** The user's current theme preference from the database */
  defaultTheme?: string;
}

/**
 * AppearanceForm — Theme selector for the settings page.
 *
 * Allows users to select Light, Dark, or System theme.
 * Applies the theme immediately via next-themes and persists
 * the choice to the database via `updatePreferencesAction`.
 *
 * @param props - Component props
 * @returns The appearance form card component
 */
export function AppearanceForm({ defaultTheme }: AppearanceFormProps) {
  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const [selectedTheme, setSelectedTheme] = useState(
    theme || defaultTheme || "system"
  );

  /**
   * Handles theme selection.
   * Applies the theme immediately and persists to the database.
   *
   * @param value - The selected theme value
   */
  function handleSelect(value: string) {
    setSelectedTheme(value);
    setTheme(value);

    startTransition(async () => {
      const result = await updatePreferencesAction({ theme: value as "light" | "dark" | "system" });

      if (result.success) {
        const message =
          typeof result.data === "object" &&
          result.data !== null &&
          "message" in result.data
            ? String((result.data as Record<string, unknown>).message)
            : "Theme preference saved";
        toast.success(message);
      } else {
        toast.error(result.error || "Failed to save theme preference");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg font-semibold">Appearance</CardTitle>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          Choose your preferred theme
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themes.map((t) => {
            const Icon = t.icon;
            const isSelected = selectedTheme === t.value;

            return (
              <button
                key={t.value}
                type="button"
                onClick={() => handleSelect(t.value)}
                disabled={isPending}
                className={cn(
                  "relative flex flex-col items-center gap-3 rounded-lg border p-4 text-center transition-colors cursor-pointer",
                  isSelected
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-muted-foreground/50"
                )}
                aria-pressed={isSelected}
              >
                <Icon className="h-6 w-6" />
                <div>
                  <div className="text-sm font-medium">{t.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.description}
                  </div>
                </div>
                {isPending && isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-lg">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
