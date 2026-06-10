"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bot,
  Gauge,
  Info,
  Menu,
  Monitor,
  RefreshCw,
  Server,
  ShieldAlert,
  Siren,
} from "lucide-react";
import { useState } from "react";

import { AppFooter } from "@/components/layout/app-footer";
import { CommandPalette, CommandPaletteTrigger } from "@/components/layout/command-palette";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useRefreshInterval } from "@/hooks/use-refresh-interval";
import { useCrowdSecQuery, useRefreshCrowdSec } from "@/hooks/use-crowdsec-query";
import { cn, formatRelative } from "@/lib/utils";
import { CrowdSecHealth } from "@/types/crowdsec";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/alerts", label: "Alerts", icon: ShieldAlert },
  { href: "/decisions", label: "Decisions", icon: Siren },
  { href: "/machines", label: "Machines", icon: Server },
  { href: "/bouncers", label: "Bouncers", icon: Bot },
  { href: "/system", label: "System", icon: Monitor },
  { href: "/about", label: "About", icon: Info },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold">CrowdSec SOC</div>
          <div className="text-xs text-muted-foreground">Security Operations</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-foreground",
                active && "bg-accent text-foreground shadow-sm",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4 text-xs text-muted-foreground">
        <kbd className="rounded border bg-muted px-1 py-0.5">⌘K</kbd> command palette · <kbd className="rounded border bg-muted px-1 py-0.5">r</kbd> refresh
      </div>
    </div>
  );
}

function ConnectionStatus() {
  const { data, isError } = useCrowdSecQuery<CrowdSecHealth>(["crowdsec", "health"], "/api/crowdsec/health");
  const health = data?.data;
  const connected = health?.status === "connected";
  const degraded = health?.status === "degraded";
  return (
    <Badge variant={connected ? "success" : degraded ? "warning" : "destructive"} className="gap-2">
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          connected ? "bg-success animate-pulse" : degraded ? "bg-warning" : "bg-destructive",
        )}
      />
      <span className="hidden sm:inline">{connected ? "Connected" : degraded ? "Degraded" : isError ? "Offline" : "Checking"}</span>
    </Badge>
  );
}

function RefreshIntervalSelector() {
  const { interval, setInterval, options } = useRefreshInterval();
  return (
    <select
      value={interval}
      onChange={(e) => setInterval(Number(e.target.value) as typeof interval)}
      className="hidden h-8 rounded-md border bg-background px-2 text-xs text-muted-foreground md:block"
      aria-label="Auto-refresh interval"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const refresh = useRefreshCrowdSec();
  const { data } = useCrowdSecQuery<CrowdSecHealth>(["crowdsec", "health"], "/api/crowdsec/health");

  useKeyboardShortcuts({ onCommandPalette: () => setPaletteOpen(true) });

  return (
    <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r bg-background/75 backdrop-blur-xl lg:block">
        <SidebarContent />
      </aside>

      <div className="flex min-h-screen flex-col lg:col-start-2">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-xl sm:h-16 sm:gap-3 sm:px-6">
          <Sheet open={navOpen} onOpenChange={setNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="left-0 right-auto w-[280px] border-l-0 border-r p-0">
              <SidebarContent onNavigate={() => setNavOpen(false)} />
            </SheetContent>
          </Sheet>

          <CommandPaletteTrigger onClick={() => setPaletteOpen(true)} />

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right text-xs text-muted-foreground lg:block">
              <div>Last sync</div>
              <div>{data?.lastUpdated ? formatRelative(data.lastUpdated) : "Waiting"}</div>
            </div>
            <RefreshIntervalSelector />
            <ConnectionStatus />
            <Button variant="outline" size="icon" onClick={refresh} aria-label="Refresh CrowdSec data">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] flex-1 px-3 py-5 sm:px-6 sm:py-6 lg:px-8">{children}</main>
        <AppFooter />
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
