"use client";

import React from "react";
import { PanelShell } from "@/components/layout/PanelShell";
import { adminNav } from "@/config/nav";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PanelShell config={adminNav}>{children}</PanelShell>;
}
