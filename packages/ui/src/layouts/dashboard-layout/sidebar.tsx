"use client"

import { cn } from "@workspace/lib/utils"
import {
  DashboardNavLabeled,
  DashboardNavLabeledProps,
} from "@workspace/ui/layouts/dashboard-layout/nav-labeled"
import {
  DashboardNavMain,
  DashboardNavMainProps,
} from "@workspace/ui/layouts/dashboard-layout/nav-main"
import {
  DashboardNavSecondary,
  DashboardNavSecondaryProps,
} from "@workspace/ui/layouts/dashboard-layout/nav-secondary"
import {
  DashboardNavUser,
  DashboardNavUserProps,
} from "@workspace/ui/layouts/dashboard-layout/nav-user"
import { Link } from "@workspace/ui/primitives/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/primitives/sidebar"
import { LucideIcon, LucideProps } from "lucide-react"

export interface DashboardSidebarProps extends Omit<
  React.ComponentProps<typeof Sidebar>,
  "children"
> {
  /** Branding configuration */
  branding: {
    logo?: LucideIcon
    logoProps?: LucideProps
    name: React.ReactNode
    size?: "default" | "sm" | "lg"
    href?: string
  }

  /** Navigation items */
  navMain: DashboardNavMainProps
  navLabeled?: DashboardNavLabeledProps
  navSecondary?: DashboardNavSecondaryProps

  navUser?: DashboardNavUserProps
}

export function DashboardSidebar({
  branding,
  navMain,
  navLabeled,
  navSecondary,
  navUser,
  ...props
}: DashboardSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              size={branding?.size ?? "lg"}
              render={
                branding?.href ? <Link href={branding.href} /> : undefined
              }
            >
              {branding?.logo && (
                <branding.logo
                  {...branding.logoProps}
                  className={cn("size-5!", branding.logoProps?.className)}
                />
              )}
              <span className="text-sm font-semibold">
                {branding?.name && branding.name}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <DashboardNavMain {...navMain} />
        <DashboardNavLabeled {...navLabeled} />
        <DashboardNavSecondary {...navSecondary} />
      </SidebarContent>
      <DashboardNavUser {...navUser} />
      <SidebarRail />
    </Sidebar>
  )
}
