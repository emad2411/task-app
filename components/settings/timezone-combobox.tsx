"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { timezones } from "@/lib/utils/timezones";

interface TimezoneComboboxProps {
  /** The currently selected timezone value */
  value: string;
  /** Callback when a timezone is selected */
  onChange: (value: string) => void;
  /** Whether the combobox is disabled */
  disabled?: boolean;
}

/**
 * TimezoneCombobox — Searchable timezone selector.
 *
 * Displays a popover with a searchable list of IANA timezones
 * grouped by region. Uses the Command component for type-ahead filtering.
 *
 * @param props - Component props
 * @returns The timezone combobox component
 */
export function TimezoneCombobox({
  value,
  onChange,
  disabled = false,
}: TimezoneComboboxProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel = timezones.find((tz) => tz.value === value)?.label ?? value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between"
        >
          {selectedLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search timezone..." />
          <CommandList>
            <CommandEmpty>No timezone found.</CommandEmpty>
            {Object.entries(
              timezones.reduce<Record<string, typeof timezones>>((acc, tz) => {
                const region = tz.value.split("/")[0] ?? "Other";
                if (!acc[region]) acc[region] = [];
                acc[region].push(tz);
                return acc;
              }, {})
            ).map(([region, regionTimezones]) => (
              <CommandGroup key={region} heading={region}>
                {regionTimezones.map((tz) => (
                  <CommandItem
                    key={tz.value}
                    value={tz.value}
                    onSelect={(currentValue) => {
                      onChange(currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === tz.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {tz.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
