"use client"

import { authClient } from "@/lib/auth/client"
import { DashboardLayout as PrimitiveDashboardLayout } from "@workspace/ui/layouts/dashboard-layout"
import {
  BookmarkIcon,
  BookOpenIcon,
  CalendarIcon,
  ClipboardListIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  LibraryIcon,
  LoaderPinwheel,
  LogOutIcon,
  MessageCircleIcon,
  MessageSquareIcon,
  PencilIcon,
  SettingsIcon,
  UsersIcon,
  VideoIcon,
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
          name: "Learning Management System",
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
            Learning: [
              { title: "Courses", icon: BookOpenIcon, href: "/courses" },
              {
                title: "Assignments",
                icon: ClipboardListIcon,
                href: "/assignments",
              },
              { title: "Calendar", icon: CalendarIcon, href: "/calendar" },
            ],
            Community: [
              { title: "Messages", icon: MessageSquareIcon, href: "/messages" },
              {
                title: "Discussions",
                icon: MessageCircleIcon,
                href: "/discussions",
              },
              { title: "Study Groups", icon: UsersIcon, href: "/study-groups" },
            ],
            Resources: [
              { title: "Library", icon: LibraryIcon, href: "/library" },
              { title: "Notes", icon: PencilIcon, href: "/notes" },
              { title: "Bookmarks", icon: BookmarkIcon, href: "/bookmarks" },
            ],
          },
        },
        navSecondary: {
          items: [
            {
              title: "Conferences",
              icon: VideoIcon,
              onClick: () => {},
            },
            {
              title: "Settings",
              icon: SettingsIcon,
              onClick: () => {},
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
