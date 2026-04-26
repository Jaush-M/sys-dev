"use client"

import { authClient } from "@/lib/auth/client"
import { DashboardLayout as PrimitiveDashboardLayout } from "@workspace/ui/layouts/dashboard-layout"
import {
  ActivityIcon,
  BookOpenIcon,
  InfoIcon,
  KeyIcon,
  LayoutDashboardIcon,
  LoaderPinwheel,
  LogOutIcon,
  ShieldIcon,
  UsersIcon,
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
          name: "LMS Portal SSO",
          href: "/",
        },
        navMain: {
          items: [
            {
              title: "Dashboard",
              href: "/",
              icon: LayoutDashboardIcon,
            },
          ],
        },
        navLabeled: {
          items: {
            "User Management": [
              {
                title: "Users",
                icon: UsersIcon,
                href: "/users",
              },
              {
                title: "Sessions",
                icon: ActivityIcon,
                href: "/sessions",
              },
            ],
            "System Settings": [
              {
                title: "OAuth Clients",
                icon: KeyIcon,
                href: "/clients",
              },
              {
                title: "Roles & Permissions",
                icon: ShieldIcon,
                href: "/roles",
              },
            ],
          },
        },
        navSecondary: {
          items: [
            {
              title: "Project Documents",
              icon: BookOpenIcon,
              onClick: () => alert("Show project documents here"),
            },
            {
              title: "About Project",
              icon: InfoIcon,
              onClick: () => alert("About Project Info Here"),
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
