"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bot, Gauge, Info, Monitor, RefreshCw, Search, Server, ShieldAlert, Siren } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useRefreshCrowdSec } from "@/hooks/use-crowdsec-query";
import { cn } from "@/lib/utils";

const commands = [
  { id: "dashboard", label: "Go to Dashboard", href: "/dashboard", icon: Gauge, group: "Navigation" },
  { id: "alerts", label: "Go to Alerts", href: "/alerts", icon: ShieldAlert, group: "Navigation" },
  { id: "decisions", label: "Go to Decisions", href: "/decisions", icon: Siren, group: "Navigation" },
  { id: "machines", label: "Go to Machines", href: "/machines", icon: Server, group: "Navigation" },
  { id: "bouncers", label: "Go to Bouncers", href: "/bouncers", icon: Bot, group: "Navigation" },
  { id: "system", label: "System Information", href: "/system", icon: Monitor, group: "Navigation" },
  { id: "about", label: "About", href: "/about", icon: Info, group: "Navigation" },
  { id: "refresh", label: "Refresh all data", action: "refresh", icon: RefreshCw, group: "Actions" },
];

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const refresh = useRefreshCrowdSec();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const filtered = commands.filter((cmd) => cmd.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    setSelected(0);
  }, [query]);

  const execute = (cmd: (typeof commands)[number]) => {
    onOpenChange(false);
    setQuery("");
    if (cmd.action === "refresh") {
      refresh();
    } else if (cmd.href) {
      router.push(cmd.href);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && filtered[selected]) {
      execute(filtered[selected]);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="left-1/2 top-[12%] h-auto max-h-[70vh] w-full max-w-lg -translate-x-1/2 rounded-lg border p-0 sm:max-w-lg">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
            <Search className="h-4 w-4" />
            Command Palette
            <kbd className="ml-auto rounded border bg-muted px-1.5 py-0.5 text-xs">Esc</kbd>
          </SheetTitle>
        </SheetHeader>
        <div className="p-3">
          <Input
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="mb-2"
          />
          <div className="max-h-64 overflow-y-auto">
            {filtered.map((cmd, index) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                    index === selected ? "bg-accent text-foreground" : "hover:bg-accent/50",
                  )}
                  onClick={() => execute(cmd)}
                  onMouseEnter={() => setSelected(index)}
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span>{cmd.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{cmd.group}</span>
                </button>
              );
            })}
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No commands found</p>
            ) : null}
          </div>
        </div>
        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          <span className="mr-3">↑↓ navigate</span>
          <span className="mr-3">↵ select</span>
          <span>esc close</span>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function CommandPaletteTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" className="hidden gap-2 sm:flex" onClick={onClick}>
      <Search className="h-4 w-4" />
      <span className="text-muted-foreground">Search...</span>
      <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">⌘K</kbd>
    </Button>
  );
}
