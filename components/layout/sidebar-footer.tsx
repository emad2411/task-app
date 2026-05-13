"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { User } from "@/lib/auth/types";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface SidebarFooterProps {
  user: User;
  isCollapsed: boolean;
}

export function SidebarFooter({ user, isCollapsed }: SidebarFooterProps) {
  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <div className="p-3 border-t border-border mt-auto flex justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                className="rounded-lg hover:bg-muted transition-colors p-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image || undefined} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              {user.name}
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className="p-3 border-t border-border mt-auto">
      <Link
        href="/settings"
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
          "hover:bg-muted"
        )}
      >
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={user.image || undefined} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate">
            {user.name}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {user.email}
          </span>
        </div>
      </Link>
    </div>
  );
}