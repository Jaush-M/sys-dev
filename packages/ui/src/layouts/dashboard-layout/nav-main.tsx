"use client";

import { DashboardNavItemType } from "@workspace/ui/layouts/dashboard-layout/types";
import { Link } from "@workspace/ui/primitives/link";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/primitives/sidebar";

export interface DashboardNavMainProps {
  items: DashboardNavItemType[];
}

export function DashboardNavMain({ items }: DashboardNavMainProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                className="flex items-center"
                render={<Link href={item.href} />}
              >
                {item.icon && <item.icon {...item.iconProps} />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
