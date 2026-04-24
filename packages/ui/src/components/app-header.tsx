"use client"

import {
  Breadcrumbs,
  BreadcrumbsProps,
} from "@workspace/ui/components/breadcrumbs"
import { Separator } from "@workspace/ui/primitives/separator"
import { SidebarTrigger } from "@workspace/ui/primitives/sidebar"

interface AppHeaderProps extends BreadcrumbsProps {}

export function AppHeader(props: AppHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ms-1" />
        <Separator
          orientation="vertical"
          className="me-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <Breadcrumbs {...props} />
      </div>
    </header>
  )
}
