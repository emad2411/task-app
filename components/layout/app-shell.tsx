"use client";

import * as React from "react";
import { Sheet } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { MobileNav } from "./mobile-nav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <Sheet>
        <div className="flex-1 flex flex-col lg:ml-[260px]">
          <TopBar />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
        <MobileNav />
      </Sheet>
    </div>
  );
}
