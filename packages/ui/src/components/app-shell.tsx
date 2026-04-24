"use client";

import { SidebarProvider } from "@workspace/ui/primitives/sidebar";
import {
  LinkComponentProvider,
  type LinkComponent,
} from "@workspace/ui/components/link-component-provider";
import { BreadCrumbProvider } from "@workspace/ui/components/breadcrumb-provider";

export type AppShellProps = {
  children: React.ReactNode;
  defaultSidebarOpen?: boolean;
  variant?: "sidebar" | "header";
  linkComponent?: LinkComponent;
};

export function AppShell({
  children,
  variant = "sidebar",
  defaultSidebarOpen,
  linkComponent,
}: AppShellProps) {
  if (variant === "header") {
    return <div className="flex min-h-screen w-full flex-col">{children}</div>;
  }

  return (
    <LinkComponentProvider component={linkComponent ?? null}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 62)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
        defaultOpen={defaultSidebarOpen}
      >
        <BreadCrumbProvider>{children}</BreadCrumbProvider>
      </SidebarProvider>
    </LinkComponentProvider>
  );
}
