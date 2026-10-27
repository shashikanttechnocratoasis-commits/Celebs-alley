"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import { canAccessRoute, getHomeRouteForRole } from "@/config/permissions";
import type { PanelNavConfig, NavItem } from "@/config/nav";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { CommandPalette } from "./CommandPalette";
import { AccessRestricted } from "./AccessRestricted";
import { showToast } from "@/components/ui/Toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

// Dynamic Lucide Icon Mapper
import * as LucideIcons from "lucide-react";
import {
  Bell,
  Search,
  Command as CommandIcon,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  LogOut,
  Sparkles,
  Sliders,
  ShoppingBag,
} from "lucide-react";
import { CartDrawer } from "@/components/cart/CartDrawer";

function DynamicIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Sparkles;
  return <IconComponent className={className} />;
}

export interface PanelShellProps {
  config: PanelNavConfig;
  children: React.ReactNode;
}

export function PanelShell({ config, children }: PanelShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const {
    currentUser,
    currentRole,
    logout,
    sidebarCollapsed,
    toggleSidebar,
    setCommandPaletteOpen,
    notifications,
    markNotificationAsRead,
    cart,
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [tabletRailHovered, setTabletRailHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Session route guard
  useEffect(() => {
    if (mounted && !currentUser) {
      if (pathname.startsWith("/app")) {
        router.push("/auth/login");
      } else if (pathname.startsWith("/seller")) {
        router.push("/seller/login");
      } else {
        router.push("/demo");
      }
    }
  }, [mounted, currentUser, router, pathname]);

  if (!mounted || !currentUser) {
    return (
      <div className="min-h-screen bg-[#0B0907] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#C99A45] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Permission Guard Check
  const hasAccess = canAccessRoute(currentRole, pathname);
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#0B0907] text-[#F5EDE0]">
        <AccessRestricted pathname={pathname} />
      </div>
    );
  }

  // Filter accessible nav groups & items based on current role
  const visibleGroups = config.groups.map((group) => ({
    ...group,
    items: group.items.filter((item) => canAccessRoute(currentRole, item.href)),
  })).filter((group) => group.items.length > 0);

  // Collect all visible items flat
  const allVisibleItems: NavItem[] = visibleGroups.flatMap((g) => g.items);

  // Bottom tab items for mobile
  const primaryBottomTabs = allVisibleItems
    .filter((item) => config.mobileBottomTabs.includes(item.id))
    .slice(0, 4);

  const overflowTabs = allVisibleItems.filter(
    (item) => !primaryBottomTabs.some((p) => p.id === item.id)
  );

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <div className="min-h-screen bg-[#0B0907] text-[#F5EDE0] flex flex-col font-sans selection:bg-[#C99A45]/30">
      <CommandPalette />

      <div className="flex flex-1 relative">
        {/* ============================================================ */}
        {/* DESKTOP SIDEBAR (1280px+) & TABLET ICON-RAIL (768px - 1279px) */}
        {/* ============================================================ */}
        <aside
          onMouseEnter={() => setTabletRailHovered(true)}
          onMouseLeave={() => setTabletRailHovered(false)}
          className={cn(
            "hidden md:flex flex-col border-r border-[#C99A45]/20 bg-[#1A130B]/95 backdrop-blur-xl transition-all duration-300 z-40 sticky top-0 h-screen",
            // Desktop width logic
            "xl:w-64",
            sidebarCollapsed && "xl:w-20",
            // Tablet rail logic
            "md:w-20 xl:w-64",
            tabletRailHovered && "md:w-64 xl:w-64",
            sidebarCollapsed && !tabletRailHovered && "xl:w-20"
          )}
        >
          {/* Sidebar Top: Brand Logo (20px internal padding) */}
          <div className="h-20 flex items-center justify-between px-5 border-b border-[#C99A45]/15 flex-shrink-0">
            <div className="overflow-hidden">
              <Logo
                variant={sidebarCollapsed && !tabletRailHovered ? "icon" : "with-tagline"}
                size={sidebarCollapsed && !tabletRailHovered ? "sm" : "md"}
                href={getHomeRouteForRole(currentRole)}
              />
            </div>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={toggleSidebar}
              className="hidden xl:flex p-2 rounded-xl text-[#A89A85] hover:text-[#E8C77A] hover:bg-[#241A0F] transition-colors"
              aria-label="Toggle Sidebar"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Nav Items List (16px horizontal padding, 8-12px gaps) */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
            {visibleGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-2">
                {group.groupTitle && (
                  <div
                    className={cn(
                      "px-3 text-[10px] font-semibold font-sans uppercase tracking-[0.25em] text-[#A89A85] transition-opacity mb-2",
                      sidebarCollapsed && !tabletRailHovered ? "opacity-0 h-0 hidden" : "opacity-100"
                    )}
                  >
                    {group.groupTitle}
                  </div>
                )}

                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== config.baseHref && pathname.startsWith(item.href));

                  const isCollapsedView = sidebarCollapsed && !tabletRailHovered;

                  const navLink = (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={cn(
                        "relative flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-medium font-sans transition-all duration-200 group select-none",
                        isActive
                          ? "text-[#0B0907] font-semibold bg-gradient-to-r from-[#B8812F] via-[#E8C77A] to-[#B8812F] shadow-[0_2px_14px_rgba(201,154,69,0.35)]"
                          : "text-[#A89A85] hover:text-[#F5EDE0] hover:bg-[#241A0F]/70",
                        isCollapsedView && "justify-center px-0 py-3"
                      )}
                    >
                      <DynamicIcon
                        name={item.iconName}
                        className={cn(
                          "w-4.5 h-4.5 flex-shrink-0 transition-colors",
                          isActive ? "text-[#0B0907]" : "text-[#A89A85] group-hover:text-[#E8C77A]"
                        )}
                      />

                      {!isCollapsedView && (
                        <span className="truncate flex-1 tracking-wide">
                          {item.title}
                        </span>
                      )}

                      {!isCollapsedView && item.badge && (
                        <Badge
                          variant={isActive ? "dark" : "gold"}
                          size="sm"
                          className="ml-auto"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );

                  if (isCollapsedView) {
                    return (
                      <Tooltip
                        key={item.id}
                        content={item.title}
                        side="right"
                      >
                        {navLink}
                      </Tooltip>
                    );
                  }

                  return navLink;
                })}
              </div>
            ))}
          </div>

          {/* Sidebar Footer: Portal Label & Switch Role */}
          <div className="p-4 border-t border-[#C99A45]/15 space-y-2 flex-shrink-0">
            <Link
              href="/demo"
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-2xl bg-[#241A0F] border border-[#C99A45]/20 hover:border-[#E8C77A] transition-all group",
                sidebarCollapsed && !tabletRailHovered && "justify-center"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-[#C99A45]/20 flex items-center justify-center text-[#E8C77A] group-hover:scale-110 transition-transform">
                <Sliders className="w-4 h-4" />
              </div>
              {(!sidebarCollapsed || tabletRailHovered) && (
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase tracking-wider text-[#A89A85]">
                    Demo Switcher
                  </span>
                  <span className="text-xs font-semibold text-[#E8C77A] group-hover:underline">
                    Switch Role
                  </span>
                </div>
              )}
            </Link>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* MAIN CONTENT AREA & TOPBAR */}
        {/* ============================================================ */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
          {/* TOPBAR (16 to 24px horizontal padding) */}
          <header className="h-16 md:h-20 px-4 sm:px-6 md:px-8 border-b border-[#C99A45]/15 bg-[#0B0907]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4">
            {/* Left: Mobile Brand & Search Trigger */}
            <div className="flex items-center gap-3">
              <div className="md:hidden">
                <Logo variant="compact" size="sm" href={getHomeRouteForRole(currentRole)} />
              </div>

              {/* Command Palette Trigger Button (Desktop & Tablet: 12px padding) */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#1A130B] border border-[#C99A45]/25 text-xs text-[#A89A85] hover:border-[#E8C77A] hover:text-[#F5EDE0] transition-all w-60 lg:w-72"
              >
                <Search className="w-3.5 h-3.5 text-[#E8C77A]" />
                <span className="truncate">Quick search & commands...</span>
                <kbd className="ml-auto inline-flex items-center gap-0.5 text-[10px] font-mono bg-[#241A0F] px-1.5 py-0.5 rounded border border-[#C99A45]/20 text-[#A89A85]">
                  <CommandIcon className="w-2.5 h-2.5" />K
                </kbd>
              </button>
            </div>

            {/* Right: Actions, Notifications, User Menu */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              {/* Mobile search icon */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="sm:hidden p-2.5 rounded-full bg-[#1A130B] text-[#A89A85] border border-[#C99A45]/20"
                aria-label="Search"
              >
                <Search className="w-4 h-4 text-[#E8C77A]" />
              </button>

              {/* Live Cross-Tab Sync Indicator */}
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A130B] border border-emerald-500/30 text-[10px] text-emerald-400 font-medium select-none" title="BroadcastChannel active across open tabs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live sync on
              </div>

              {/* Cart Drawer Trigger for Customer */}
              {currentRole === "Customer" && (
                <button
                  type="button"
                  onClick={() => useAppStore.getState().setCartDrawerOpen(true)}
                  className="relative p-2.5 rounded-full bg-[#1A130B] text-[#A89A85] border border-[#C99A45]/25 hover:border-[#E8C77A] hover:text-[#F5EDE0] transition-all focus:outline-none"
                  aria-label="Open Cart"
                >
                  <ShoppingBag className="w-4 h-4 text-[#E8C77A]" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#E8C77A] text-[#0B0907] text-[10px] font-bold flex items-center justify-center shadow-md animate-pulse">
                      {cart.reduce((sum, it) => sum + it.quantity, 0)}
                    </span>
                  )}
                </button>
              )}

              {/* Notifications Dropdown with Deep-Linking & Mark All Read */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="relative p-2.5 rounded-full bg-[#1A130B] text-[#A89A85] border border-[#C99A45]/25 hover:border-[#E8C77A] hover:text-[#F5EDE0] transition-all focus:outline-none"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotifications.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#E8C77A] text-[#0B0907] text-[9px] font-bold flex items-center justify-center shadow-md">
                        {unreadNotifications.length}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-2">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#F5EDE0]">Platform Notifications</span>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="gold" size="sm">
                        {unreadNotifications.length} New
                      </Badge>
                      {unreadNotifications.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            useAppStore.getState().markAllNotificationsAsRead();
                            showToast.info("All notifications marked as read");
                          }}
                          className="text-[10px] text-[#E8C77A] hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-72 overflow-y-auto space-y-1.5 p-1">
                    {notifications.length === 0 ? (
                      <div className="py-4 text-center text-xs text-[#A89A85]">
                        No notifications
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            if (n.link) router.push(n.link);
                          }}
                          className={cn(
                            "p-2.5 rounded-xl text-xs cursor-pointer transition-colors flex flex-col space-y-1 border",
                            n.read
                              ? "bg-[#1A130B] border-transparent text-[#A89A85]"
                              : "bg-[#241A0F] border-[#C99A45]/30 text-[#F5EDE0]"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#E8C77A]">
                              {n.title}
                            </span>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-[#5FAF7A]" />
                            )}
                          </div>
                          <p className="text-[11px] text-[#A89A85] leading-relaxed">
                            {n.message}
                          </p>
                          {n.link && (
                            <span className="text-[9px] text-[#E8C77A] font-semibold flex items-center gap-0.5 pt-0.5">
                              View details →
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu Dropdown with proper padding */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 p-1.5 sm:px-3.5 sm:py-2 rounded-full bg-[#1A130B] border border-[#C99A45]/30 hover:border-[#E8C77A] transition-all focus:outline-none group">
                    <Avatar
                      src={currentUser.avatar}
                      name={currentUser.name}
                      size="sm"
                    />
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-xs font-semibold text-[#F5EDE0] group-hover:text-[#E8C77A] transition-colors leading-tight">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] text-[#C99A45] tracking-wider uppercase font-medium">
                        {currentRole}
                      </span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-[#F5EDE0]">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] text-[#A89A85]">
                        {currentUser.email}
                      </span>
                      <Badge variant="gold" size="sm" className="w-fit mt-1.5">
                        {currentRole}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/demo")}>
                    <Sliders className="w-4 h-4 mr-2 text-[#E8C77A]" />
                    Switch Role (/demo)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/styleguide")}>
                    <Sparkles className="w-4 h-4 mr-2 text-[#E8C77A]" />
                    Design Styleguide
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      useAppStore.getState().resetDemoData();
                      showToast.success("Demo dataset reset to initial state!");
                    }}
                  >
                    <Sliders className="w-4 h-4 mr-2 text-[#C99A45]" />
                    Reset Demo Data
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="danger"
                    onClick={() => {
                      logout();
                      router.push("/demo");
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* PAGE CONTENT WITH RESPONSIVE CONTAINER PADDING (16px mobile, 24px tablet, 32px desktop) */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE BOTTOM TAB BAR (<768px) */}
      {/* ============================================================ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A130B]/95 backdrop-blur-xl border-t border-[#C99A45]/25 flex items-center justify-around h-16 px-2 safe-bottom">
        {primaryBottomTabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== config.baseHref && pathname.startsWith(tab.href));

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1 transition-colors select-none",
                isActive ? "text-[#E8C77A]" : "text-[#A89A85]"
              )}
            >
              <DynamicIcon
                name={tab.iconName}
                className={cn("w-5 h-5", isActive && "scale-110 text-[#E8C77A]")}
              />
              <span className="text-[10px] font-medium tracking-tight mt-1">
                {tab.title}
              </span>
            </Link>
          );
        })}

        {/* More tab button opening bottom sheet */}
        {overflowTabs.length > 0 && (
          <button
            onClick={() => setMobileMoreOpen(true)}
            className="flex flex-col items-center justify-center flex-1 py-1 text-[#A89A85] hover:text-[#E8C77A] transition-colors select-none"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-1">
              More
            </span>
          </button>
        )}
      </nav>

      {/* Mobile "More" Bottom Sheet */}
      <ResponsiveDialog
        open={mobileMoreOpen}
        onOpenChange={setMobileMoreOpen}
        title="More Navigation"
        description={`${config.panelName} full section index`}
      >
        <div className="grid grid-cols-2 gap-3 py-2">
          {overflowTabs.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setMobileMoreOpen(false)}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#241A0F] border border-[#C99A45]/20 hover:border-[#E8C77A] text-xs font-medium text-[#F5EDE0] transition-all"
            >
              <DynamicIcon
                name={item.iconName}
                className="w-4.5 h-4.5 text-[#E8C77A]"
              />
              <span className="truncate">{item.title}</span>
            </Link>
          ))}
        </div>
      </ResponsiveDialog>

      {/* Cart Drawer Mount */}
      <CartDrawer />
    </div>
  );
}
