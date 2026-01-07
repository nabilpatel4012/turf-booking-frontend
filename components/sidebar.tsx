"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  MapPin,
  Megaphone,
  Trophy,
  Settings,
  LogOut,
  Loader2,
  Shield,
  DollarSign,
  QrCode,
  LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Bookings", href: "/bookings", icon: Calendar },
  { name: "Venues", href: "/venues", icon: MapPin },
  { name: "Announcements", href: "/announcements", icon: Megaphone },
  { name: "Pricing", href: "/pricing", icon: DollarSign },
  { name: "Tournaments", href: "/tournaments", icon: Trophy, disabled: true },
  { name: "Analytics", href: "/analytics", icon: LineChart },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Sessions", href: "/sessions", icon: Shield },
  { name: "Scanner", href: "/scanner", icon: QrCode },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  const handleNavigation = (href: string, disabled?: boolean) => {
    if (disabled) return;
    setNavigatingTo(href);
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <h1 className="text-xl font-bold text-primary">Venue Admin</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation
          .filter((item) => item.name !== "Sessions")
          .map((item) => {
            const isActive = pathname === item.href;
            const isNavigating = isPending && navigatingTo === item.href;
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href, item.disabled)}
                disabled={item.disabled || isPending}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : item.disabled
                    ? "text-muted-foreground cursor-not-allowed opacity-50"
                    : isPending && !isNavigating
                    ? "text-muted-foreground cursor-not-allowed opacity-50"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {isNavigating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
                {item.name}
                {item.disabled && <span className="ml-auto text-xs">Soon</span>}
              </button>
            );
          })}
      </nav>

      {/* Footer Section */}
      <div className="border-t border-border p-4">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        {(() => {
          const href = "/sessions";
          const isActive = pathname === href;
          const isNavigating = isPending && navigatingTo === href;

          return (
            <button
              onClick={() => handleNavigation(href)}
              disabled={isPending}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : isPending && !isNavigating
                  ? "text-muted-foreground cursor-not-allowed opacity-50"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {isNavigating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Shield className="h-5 w-5" />
              )}
              Sessions
            </button>
          );
        })()}

        {/* Logout */}
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground mt-1"
          onClick={logout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
