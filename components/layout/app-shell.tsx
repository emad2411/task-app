"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sheet } from "@/components/ui/sheet";
import { CategoriesProvider } from "@/lib/context/categories-context";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { MobileNav } from "./mobile-nav";
import type { Category } from "@/lib/db/schema";
import type { User, Session } from "@/lib/auth/types";

interface AppShellProps {
  children: React.ReactNode;
  categories: Category[];
  user: User;
  session: Session;
}

export function AppShell({ children, categories, user, session: _session }: AppShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <CategoriesProvider categories={categories}>
      <div className="flex min-h-screen">
        <Sidebar isCollapsed={isSidebarCollapsed} user={user} />
        <div
          className={cn(
            "flex-1 flex flex-col transition-[margin-left] duration-200 ease-out will-change-[margin-left]",
            isSidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
          )}
        >
          <Sheet>
            <TopBar
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
              user={user}
            />
            <MobileNav user={user} />
          </Sheet>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </CategoriesProvider>
  );
}
