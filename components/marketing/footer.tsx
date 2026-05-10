"use client";

import Link from "next/link";
import { CheckSquare } from "lucide-react";

export function Footer() {
  const footerLinks = [
    { label: "Features", href: "#features" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Sign Up", href: "/sign-up" },
  ];

  return (
    <footer className="border-t border-white/[0.06] bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Link
              href="/"
              className="flex items-center gap-2 landing-focus rounded-md"
            >
              <CheckSquare
                className="h-5 w-5 text-brand"
                aria-hidden="true"
              />
              <span className="text-lg font-bold text-foreground">
                TaskFlow
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Task management that gets out of your way.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground/60 transition-colors duration-150 hover:text-muted-foreground landing-focus rounded-md px-1 py-0.5"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-10 text-center">
          <p className="text-xs text-muted-foreground/40">
            &copy; {new Date().getFullYear()} TaskFlow. Built for focus.
          </p>
        </div>
      </div>
    </footer>
  );
}
