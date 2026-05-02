"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CheckSquare,
  Tags,
  Settings,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300",
          isCollapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo area - matches TopBar height and style */}
          <div
            className={cn(
              "flex items-center h-14 border-b px-4 transition-all duration-300 overflow-hidden",
              isCollapsed && "justify-center px-2"
            )}
          >
            <span className={cn(
              "font-semibold text-lg transition-all duration-300 whitespace-nowrap",
              isCollapsed ? "opacity-0 w-0" : "opacity-100"
            )}>
              TaskFlow
            </span>
            {isCollapsed && (
              <span className="font-semibold text-lg">T</span>
            )}
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              const linkContent = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                    isCollapsed && "justify-center",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span
                    className={cn(
                      "transition-all duration-300 whitespace-nowrap",
                      isCollapsed
                        ? "opacity-0 w-0 overflow-hidden"
                        : "opacity-100 w-auto"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return linkContent;
            })}
          </nav>
        </div>
      </aside>
    </TooltipProvider>
  );
}
