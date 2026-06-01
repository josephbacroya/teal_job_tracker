// src/components/layout/topbar.tsx
"use client";

import { User } from "next-auth";
import { Search, Plus } from "lucide-react"; // Removed 'Bell' to fix the unused variable warning
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TopBarProps {
  user: User;
}

export function TopBar({ user }: TopBarProps) {
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="h-20 bg-background flex items-center justify-between px-8 pt-8 pb-4">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
            className="pl-12 h-12 bg-card border-border rounded-xl text-base shadow-sm"
          />
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        {/* Mock Date Range Selector */}
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2 text-sm text-muted-foreground shadow-sm">
          <span>This Month: Oct 1 - Oct 31</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-end gap-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <button className="bg-primary text-primary-foreground font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Application
        </button>
      </div>
    </header>
  );
}