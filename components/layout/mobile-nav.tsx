"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  CheckSquare,
  Tags,
  Settings,
  LogOut,
} from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { useSession } from "@/lib/auth/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/lib/auth/types";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/settings", label: "Settings", icon: Settings },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface MobileNavProps {
  user: User;
}

export function MobileNav({ user: initialUser }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const user = (session?.user as User | undefined) ?? initialUser;

  async function handleSignOut() {
    const result = await signOutAction();
    if (result.success) {
      router.push("/sign-in");
      router.refresh();
    }
  }

  return (
    <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
      <SheetHeader className="p-4 border-b">
        <SheetTitle className="text-lg font-semibold">TaskFlow</SheetTitle>
        <SheetDescription className="sr-only">
          Navigation menu for TaskFlow
        </SheetDescription>
      </SheetHeader>

      {user && (
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={user.image || undefined}
              alt={user.name}
            />
            <AvatarFallback>
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">
              {user.name}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {user.email}
            </span>
          </div>
        </div>
      )}

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <SheetClose asChild key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[48px]",
                  isActive
                    ? "dark:bg-brand/10 bg-brand/15 dark:text-brand text-brand-deep"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            </SheetClose>
          );
        })}
      </nav>

      <SheetFooter className="border-t p-2">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full min-h-[48px]"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </SheetFooter>
    </SheetContent>
  );
}
