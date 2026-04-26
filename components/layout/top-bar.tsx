"use client";

import { Menu } from "lucide-react";
import { SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth/auth-client";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TopBar() {
  const { data: session } = useSession();

  return (
    <header className="lg:hidden flex items-center h-14 border-b px-4 shrink-0">
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-11 w-11 -ml-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <span className="ml-3 font-semibold text-lg">TaskFlow</span>
      <div className="ml-auto">
        {session?.user ? (
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={session.user.image || undefined}
              alt={session.user.name}
            />
            <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="h-9 w-9">
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
        )}
      </div>
    </header>
  );
}
