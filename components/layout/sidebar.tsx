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
import { SidebarFooter } from "./sidebar-footer";
import type { User } from "@/lib/auth/types";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  isCollapsed: boolean;
  user: User;
}

export function Sidebar({ isCollapsed, user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 z-40 h-screen border-r bg-background transition-[width] duration-200 ease-out",
          isCollapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <div className="flex flex-col h-full">
          <div
            className={cn(
              "flex items-center gap-2 h-14 border-b px-4 overflow-hidden shrink-0",
              isCollapsed && "justify-center px-2"
            )}
          >
            <CheckSquare className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
            <span className={cn(
              "text-lg font-bold whitespace-nowrap",
              isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
            )}>
              TaskFlow
            </span>
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
                    "flex items-center gap-3 px-3 rounded-lg text-sm font-medium transition-colors h-10",
                    isCollapsed && "justify-center px-0",
                    isActive
                      ? "dark:bg-brand/10 bg-brand/15 dark:text-brand text-brand-deep"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  <span
                    className={cn(
                      "whitespace-nowrap",
                      isCollapsed
                        ? "opacity-0 w-0 overflow-hidden"
                        : "opacity-100"
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

          <SidebarFooter user={user} isCollapsed={isCollapsed} />
        </div>
      </aside>
    </TooltipProvider>
  );
}
