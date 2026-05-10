"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckSquare, Menu, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "/#features" },
    { label: "Sign In", href: "/sign-in" },
  ];

  return (
    <header
      aria-label="Main navigation"
      className={cn(
        "sticky top-0 z-50 h-16 transition-all duration-200",
        scrolled
          ? "border-b border-white/[0.06] bg-background/85 backdrop-blur-xl"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 landing-focus rounded-md"
        >
          <CheckSquare className="h-5 w-5 text-brand" aria-hidden="true" />
          <span className="text-lg font-bold text-foreground">TaskFlow</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground landing-focus rounded-md px-1 py-0.5"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Link
            href="/sign-up"
            className="inline-flex h-9 items-center justify-center rounded-md bg-brand px-4 text-sm font-semibold text-background transition-colors hover:bg-brand-deep landing-focus"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-white/5 md:hidden landing-focus"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-3/4 max-w-sm border-r border-white/[0.08] bg-background"
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
          >
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <SheetDescription className="sr-only">
              Main navigation links for TaskFlow
            </SheetDescription>
            <div className="flex flex-col gap-8 px-6 pt-10 pb-10">
              <Link
                href="/"
                className="animate-sheet-logo flex items-center gap-2 pb-6 border-b border-white/[0.08]"
                onClick={() => setMobileOpen(false)}
              >
                <CheckSquare
                  className="h-5 w-5 text-brand"
                  aria-hidden="true"
                />
                <span className="text-lg font-bold text-foreground">
                  TaskFlow
                </span>
              </Link>
              <nav className="flex flex-col gap-2">
                {navLinks.map((link, index) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className="animate-sheet-item group relative overflow-hidden text-lg font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:pl-4 hover:bg-white/[0.04] landing-focus rounded-md px-2 py-3"
                      style={{ "--sheet-item-delay": `${120 + index * 60}ms` } as React.CSSProperties}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <SheetClose asChild className="mt-4">
                <Link
                  href="/sign-up"
                  className="animate-sheet-item inline-flex h-12 items-center justify-center rounded-md bg-brand px-6 text-base font-semibold text-background transition-colors hover:bg-brand-deep landing-focus"
                  style={{ "--sheet-item-delay": `${120 + navLinks.length * 60 + 40}ms` } as React.CSSProperties}
                >
                  Get Started
                </Link>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
