"use client";

import { AppHeader } from "@workspace/ui/components/app-header";
import {
  AppShell,
  type AppShellProps,
} from "@workspace/ui/components/app-shell";
import {
  DashboardSidebar,
  DashboardSidebarProps,
} from "@workspace/ui/layouts/dashboard-layout/sidebar";
import { SidebarInset } from "@workspace/ui/primitives/sidebar";

interface DashboardProps {
  children: React.ReactNode;
  appShellProps: Omit<AppShellProps, "children">;
  sidebarProps: DashboardSidebarProps;
}

export function DashboardLayout({
  children,
  appShellProps,
  sidebarProps,
}: DashboardProps) {
  return (
    <AppShell {...appShellProps}>
      <DashboardSidebar {...sidebarProps} />

      <SidebarInset>
        <AppHeader />
        <main className="px-5">{children}</main>
      </SidebarInset>
    </AppShell>
  );
}
