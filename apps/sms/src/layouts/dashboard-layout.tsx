"use client"

import { authClient } from "@/lib/auth/client"
import { DashboardLayout as PrimitiveDashboardLayout } from "@workspace/ui/layouts/dashboard-layout"
import {
  ClipboardListIcon,
  ConciergeBellIcon,
  GraduationCapIcon,
  Layers2Icon,
  LayoutDashboardIcon,
  LoaderPinwheel,
  LogOutIcon,
  MailIcon,
  SirenIcon,
} from "lucide-react"
import Link from "next/link"

export function DashboardLayout({
  children,
  defaultSidebarOpen,
}: {
  children?: React.ReactNode
  defaultSidebarOpen?: boolean
}) {
  const { data: session } = authClient.useSession()

  return (
    <PrimitiveDashboardLayout
      appShellProps={{
        linkComponent: Link,
        defaultSidebarOpen,
      }}
      sidebarProps={{
        branding: {
          logo: LoaderPinwheel,
          logoProps: {
            strokeWidth: 1.4,
          },
          name: "SMS Portal",
          href: "/",
        },
        navMain: {
          items: [
            {
              title: "Dashboard",
              href: "/",
              icon: LayoutDashboardIcon,
            },
            {
              title: "My Applications",
              href: "/",
              icon: ClipboardListIcon,
            },
            {
              title: "Requests",
              href: "/",
              icon: Layers2Icon,
            },
            {
              title: "Policies & Procedures",
              href: "/",
              icon: SirenIcon,
            },
          ],
        },
        navUser: session?.user
          ? {
              user: {
                name: session.user.name,
                email: session.user.email,
              },
              menuItems: [
                [
                  {
                    title: "Logout",
                    icon: LogOutIcon,
                    onClick: () => {
                      authClient.signOut()
                    },
                  },
                ],
              ],
            }
          : undefined,
      }}
    >
      {children}
    </PrimitiveDashboardLayout>
  )
}
