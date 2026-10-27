"use client";

import React, { useEffect } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store";
import {
  customerNav,
  sellerNav,
  adminNav,
  consultantNav,
  type NavItem,
} from "@/config/nav";
import {
  Search,
  UserCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { showToast } from "@/components/ui/Toast";

export function CommandPalette() {
  const router = useRouter();
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    currentRole,
    switchRole,
    resetDemoData,
  } = useAppStore();

  // Keyboard shortcut listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  // Flatten nav items
  const allNavItems: { item: NavItem; panel: string }[] = [];
  [
    { nav: customerNav, name: "Customer" },
    { nav: sellerNav, name: "Seller" },
    { nav: adminNav, name: "Admin" },
    { nav: consultantNav, name: "Consultant" },
  ].forEach(({ nav, name }) => {
    nav.groups.forEach((g) => {
      g.items.forEach((item) => {
        allNavItems.push({ item, panel: name });
      });
    });
  });

  const roles = [
    "Super Admin",
    "Admin",
    "Product Manager",
    "AI/Rule Manager",
    "Distributor Owner",
    "Distributor Manager",
    "Inventory Manager",
    "Sales Executive",
    "Consultant",
    "Customer",
    "Support Agent",
    "Finance Manager",
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/80 backdrop-blur-md p-4 animate-in fade-in-0">
      <div className="fixed inset-0" onClick={() => setCommandPaletteOpen(false)} />

      <Command
        className="relative z-50 w-full max-w-xl overflow-hidden rounded-3xl bg-[#1A130B] border border-[#C99A45]/40 shadow-[0_20px_70px_rgba(0,0,0,0.9)] text-[#F5EDE0] font-sans"
        loop
      >
        <div className="flex items-center px-4 border-b border-[#C99A45]/20">
          <Search className="w-5 h-5 text-[#E8C77A] mr-3" />
          <Command.Input
            placeholder="Type a command, page name, or role..."
            className="w-full h-14 bg-transparent text-sm text-[#F5EDE0] placeholder:text-[#6F6354] focus:outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#241A0F] text-[#A89A85] border border-[#C99A45]/20">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[340px] overflow-y-auto p-3 space-y-2">
          <Command.Empty className="py-8 text-center text-xs text-[#A89A85]">
            No matching actions found.
          </Command.Empty>

          {/* Navigation Pages */}
          <Command.Group
            heading="Navigation Pages"
            className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C99A45] px-2 py-1"
          >
            {allNavItems.map(({ item, panel }) => (
              <Command.Item
                key={`${panel}-${item.href}`}
                value={`${item.title} ${panel} ${item.description}`}
                onSelect={() => {
                  setCommandPaletteOpen(false);
                  router.push(item.href);
                }}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer select-none transition-colors data-[selected=true]:bg-[#241A0F] data-[selected=true]:text-[#E8C77A]"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C99A45]" />
                  <span className="font-medium text-[#F5EDE0]">{item.title}</span>
                  <span className="text-[10px] text-[#A89A85] px-1.5 py-0.5 rounded bg-[#0B0907] border border-white/5">
                    {panel}
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-50" />
              </Command.Item>
            ))}
          </Command.Group>

          {/* Quick Switch Role */}
          <Command.Group
            heading="Quick Switch Demo Role"
            className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C99A45] px-2 py-1"
          >
            {roles.map((r) => (
              <Command.Item
                key={r}
                value={`Switch Role ${r}`}
                onSelect={() => {
                  switchRole(r as any);
                  setCommandPaletteOpen(false);
                  showToast.gold(`Switched role to ${r}`);
                }}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer select-none transition-colors data-[selected=true]:bg-[#241A0F] data-[selected=true]:text-[#E8C77A]"
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#C99A45]" />
                  <span>
                    Switch to <strong className="text-[#E8C77A]">{r}</strong>
                  </span>
                </div>
                {currentRole === r && (
                  <span className="text-[10px] font-semibold text-[#5FAF7A]">
                    Active
                  </span>
                )}
              </Command.Item>
            ))}
          </Command.Group>

          {/* Global Actions */}
          <Command.Group
            heading="System Actions"
            className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C99A45] px-2 py-1"
          >
            <Command.Item
              value="Go to Demo Hub /demo"
              onSelect={() => {
                setCommandPaletteOpen(false);
                router.push("/demo");
              }}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer select-none data-[selected=true]:bg-[#241A0F] data-[selected=true]:text-[#E8C77A]"
            >
              <div className="flex items-center gap-2.5">
                <ExternalLink className="w-3.5 h-3.5 text-[#C99A45]" />
                <span>Open Full-Screen /demo Hub</span>
              </div>
            </Command.Item>

            <Command.Item
              value="Go to Style Guide /styleguide"
              onSelect={() => {
                setCommandPaletteOpen(false);
                router.push("/styleguide");
              }}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer select-none data-[selected=true]:bg-[#241A0F] data-[selected=true]:text-[#E8C77A]"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C99A45]" />
                <span>Open /styleguide Showcase</span>
              </div>
            </Command.Item>

            <Command.Item
              value="Reset Demo Data"
              onSelect={() => {
                resetDemoData();
                setCommandPaletteOpen(false);
                showToast.success("Demo dataset reset to initial state!");
              }}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-[#D4604F] cursor-pointer select-none data-[selected=true]:bg-[#D4604F]/20 data-[selected=true]:text-[#D4604F]"
            >
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Demo Data to Seed JSON</span>
              </div>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
