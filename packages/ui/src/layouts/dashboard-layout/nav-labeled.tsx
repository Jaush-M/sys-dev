"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/primitives/dropdown-menu"
import { DashboardNavItemType } from "@workspace/ui/layouts/dashboard-layout/types"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/primitives/sidebar"
import { MoreHorizontalIcon, LucideIcon, LucideProps } from "lucide-react"
import { Link } from "@workspace/ui/primitives/link"
import { cn } from "@workspace/lib/utils"

export interface DashboardNavLabeledProps {
  items?: {
    [title: string]: (DashboardNavItemType & {
      actions?: {
        icon?: LucideIcon
        iconProps?: LucideProps
        name: string
      }[]
    })[]
  }
  hideOnCollapse?: boolean
}

export function DashboardNavLabeled({
  items,
  hideOnCollapse,
}: DashboardNavLabeledProps) {
  const { isMobile } = useSidebar()

  if (!items || Object.keys(items ?? {}).length === 0) return null

  return Object.entries(items).map(([label, menuItems]) => {
    if (!menuItems || menuItems.length === 0) {
      return null
    }

    return (
      <SidebarGroup
        className={cn(hideOnCollapse && "group-data-[collapsible=icon]:hidden")}
        key={label}
      >
        {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                render={item.href ? <Link href={item.href} /> : undefined}
              >
                {item.icon && <item.icon {...item.iconProps} />}
                <span>{item.title}</span>
              </SidebarMenuButton>
              {item.actions && item.actions.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <SidebarMenuAction
                        showOnHover
                        className="aria-expanded:bg-muted"
                      />
                    }
                  >
                    <MoreHorizontalIcon />
                    <span className="sr-only">More</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-24"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >
                    {item.actions.map((action) => (
                      <DropdownMenuItem key={action.name}>
                        {action.icon && <action.icon {...action.iconProps} />}
                        <span>{action.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    )
  })
}
