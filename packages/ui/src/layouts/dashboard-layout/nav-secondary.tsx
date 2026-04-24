"use client"

import * as React from "react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/primitives/sidebar"
import { LucideIcon, LucideProps } from "lucide-react"
import { DashboardNavItemType } from "@workspace/ui/layouts/dashboard-layout/types"
import { Link } from "@workspace/ui/primitives/link"

export type NavSecondaryItem = {
  title: string
  href: string
  icon?: LucideIcon
  iconProps?: LucideProps
}

export interface DashboardNavSecondaryProps extends React.ComponentPropsWithoutRef<
  typeof SidebarGroup
> {
  items?: DashboardNavItemType[]
}

export function DashboardNavSecondary({
  items,
  ...props
}: DashboardNavSecondaryProps) {
  if (!items || items.length === 0) {
    return null
  }

  return (
    <SidebarGroup className="mt-auto" {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                render={item.href ? <Link href={item.href} /> : undefined}
                onClick={item.onClick}
                tooltip={item.title}
              >
                {item.icon && <item.icon {...item.iconProps} />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
