"use client";

import { CATEGORY_COLORS } from "@/lib/validation/category";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string | null | undefined;
  onChange: (color: string) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label = "Color" }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {CATEGORY_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={cn(
              "h-8 w-8 rounded-full border-2 transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              value === color || (!value && color === "#6B7280")
                ? "border-ring ring-2 ring-ring ring-offset-2"
                : "border-transparent"
            )}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
            aria-pressed={value === color}
          />
        ))}
      </div>
    </div>
  );
}