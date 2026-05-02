"use client";

import { useRouter } from "next/navigation";
import {
  Menu,
  PanelLeft,
  Search,
  Bell,
  Plus,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/lib/auth/auth-client";
import { signOutAction } from "@/lib/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface TopBarProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function TopBar({ isSidebarCollapsed, onToggleSidebar }: TopBarProps) {
  const router = useRouter();
  const { data: session } = useSession();

  async function handleSignOut() {
    const result = await signOutAction();
    if (result.success) {
      router.push("/sign-in");
      router.refresh();
    }
  }

  return (
    <header className="flex items-center h-14 border-b px-4 shrink-0 gap-3">
      {/* Mobile: Hamburger menu */}
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 -ml-2 lg:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>

      {/* Desktop: Sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden lg:flex h-9 w-9"
        onClick={onToggleSidebar}
      >
        <PanelLeft className="h-5 w-5" />
        <span className="sr-only">
          {isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        </span>
      </Button>

      {/* Logo */}
      <span className="font-semibold text-lg shrink-0">TaskFlow</span>

      {/* Search - hidden on small screens */}
      <div className="hidden md:flex items-center flex-1 max-w-md ml-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full pl-9 h-9"
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="ml-auto flex items-center gap-1">
        {/* Search icon on small screens */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-11 w-11"
        >
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>

        {/* Create Task */}
        <CreateTaskDialog>
          <Button
            size="sm"
            className="hidden sm:inline-flex h-9"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Create Task
          </Button>
        </CreateTaskDialog>
        <CreateTaskDialog>
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden h-11 w-11"
          >
            <Plus className="h-5 w-5" />
            <span className="sr-only">Create Task</span>
          </Button>
        </CreateTaskDialog>

        {/* Notification bell */}
        <Button variant="ghost" size="icon" className="h-11 w-11 md:h-9 md:w-9">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Theme toggle */}
        <div className="hidden md:flex">
          <ThemeToggle />
        </div>

        {/* User avatar dropdown */}
        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-11 w-11 md:h-9 md:w-9 rounded-full p-0">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={session.user.image || undefined}
                    alt={session.user.name}
                  />
                  <AvatarFallback>
                    {getInitials(session.user.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{session.user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {session.user.email}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Avatar className="h-9 w-9">
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
        )}
      </div>
    </header>
  );
}
