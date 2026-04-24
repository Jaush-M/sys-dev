"use client"

import { DashboardNavItemType } from "@workspace/ui/layouts/dashboard-layout/types"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/primitives/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/primitives/dropdown-menu"
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/primitives/sidebar"
import {
  EllipsisVerticalIcon,
  LogOutIcon,
  LucideIcon,
  LucideProps,
} from "lucide-react"
import { Fragment } from "react/jsx-runtime"

export type UserMenuItem = {
  icon?: LucideIcon
  iconProps?: LucideProps
  title: string
  onClick?: () => void
  href?: string
}

export interface DashboardNavUserProps {
  user?: {
    name?: string
    email?: string
    avatar?: string
  }
  menuItems?: DashboardNavItemType[][]
}

export function DashboardNavUser({ user, menuItems }: DashboardNavUserProps) {
  const { isMobile } = useSidebar()

  if (!user || !user.name || !user.email) return null

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  className="aria-expanded:bg-muted"
                />
              }
            >
              <Avatar className="size-8 rounded-lg grayscale">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "CN"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-foreground/70">
                  {user.email}
                </span>
              </div>
              <EllipsisVerticalIcon className="ms-auto size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-56"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                    <Avatar className="size-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="rounded-lg">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "CN"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-start text-sm leading-tight">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />

              {menuItems?.map((items, i) => (
                <Fragment key={i}>
                  <DropdownMenuGroup>
                    {items.map((item) => (
                      <DropdownMenuItem key={item.title} onClick={item.onClick}>
                        {item.icon && <item.icon {...item.iconProps} />}
                        {item.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>

                  {menuItems.length > 1 && i !== menuItems.length - 1 && (
                    <DropdownMenuSeparator />
                  )}
                </Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  )
}
