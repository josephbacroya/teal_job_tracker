// src/components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { LayoutDashboard, Briefcase, Calendar, ChevronLeft, LogOut, Sparkles } from "lucide-react";
import { logoutUser } from "@/lib/actions/auth";
import { useState } from "react";
import Image from "next/image";
import type { User } from "next-auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/matchmaker", label: "AI Matchmaker", icon: Sparkles },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/interviews", label: "Interviews", icon: Calendar },
];

interface SidebarProps {
  user: User;
}

export function Sidebar({ user: _user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-screen bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-[88px]" : "w-[240px]"
      )}
    >
      <div className="h-20 flex items-center px-6 pt-4 pb-2">
        <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center">
          <Image src="/TEAL.png" alt="Teal Logo" width={40} height={40} className="rounded-xl shadow-sm" />
        </div>
        {!collapsed && (
          <span className="font-bold text-foreground text-xl ml-3 tracking-tight">Teal</span>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl text-[14px] font-medium transition-colors",
                isActive
                  ? "bg-accent text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-[18px] w-[18px] flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <ThemeToggle collapsed={collapsed} />

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[14px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <ChevronLeft className={cn("h-[18px] w-[18px] flex-shrink-0 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && <span>Collapse</span>}
        </button>
        <form action={logoutUser}>
          <button
            type="submit"
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[14px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
