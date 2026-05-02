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

interface AppShellProps {
  children: React.ReactNode;
  categories: Category[];
}

export function AppShell({ children, categories }: AppShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <CategoriesProvider categories={categories}>
      <div className="flex min-h-screen">
        <Sidebar isCollapsed={isSidebarCollapsed} />
        <Sheet>
          <div
            className={cn(
              "flex-1 flex flex-col transition-all duration-300",
              isSidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
            )}
          >
            <TopBar
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
            />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </div>
          <MobileNav />
        </Sheet>
      </div>
    </CategoriesProvider>
  );
}
