"use client"

import { authClient } from "@/lib/auth/client"
import { DashboardLayout } from "@/layouts/dashboard-layout"
import { Avatar, AvatarFallback } from "@workspace/ui/primitives/avatar"
import { Button } from "@workspace/ui/primitives/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card"
import { Separator } from "@workspace/ui/primitives/separator"
import { useSetBreadcrumbs } from "@workspace/ui/components/breadcrumb-provider"
import {
  BookOpenIcon,
  CalendarIcon,
  ExternalLinkIcon,
  FileTextIcon,
  GraduationCapIcon,
  HeadphonesIcon,
  LayoutGridIcon,
  LibraryIcon,
  MonitorIcon,
  UserIcon,
} from "lucide-react"
import { Link } from "@workspace/ui/primitives/link"
import { env } from "@/env"

const RECENT_FORMS = [
  {
    ref: "CO01/2027/0005",
    serviceType: "Credit Overload Request Form",
    applicationDate: "Feb 9, 2027 11:30:50",
    status: "Completed",
  },
  {
    ref: "MR01/2026/0004",
    serviceType: "Medical Report Form",
    applicationDate: "Jan 1, 2026 11:47:38",
    status: "New",
  },
  {
    ref: "R20/2026/0018",
    serviceType: "Registration Form",
    applicationDate: "Feb 25, 2026 13:04:33",
    status: "Processing",
  },
]

const STATUS_STYLES: Record<string, string> = {
  Completed:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  New: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Processing:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500",
}

const UPCOMING_EVENTS = [
  { title: "Graduation Ceremony 1 & 2", date: "Apr 29, 2026" },
  { title: "Graduation Ceremony 3 & 4", date: "Apr 30, 2025" },
  { title: "Labour Day", date: "May 01, 2026" },
]

const QUICK_LINKS = [
  { icon: MonitorIcon, label: "Website" },
  { icon: BookOpenIcon, label: "LMS Portal", href: env.NEXT_PUBLIC_LMS_URL },
  { icon: FileTextIcon, label: "Exam Portal" },
  { icon: LayoutGridIcon, label: "Courses" },
  { icon: GraduationCapIcon, label: "Admission Portal" },
  { icon: LibraryIcon, label: "Library" },
  { icon: HeadphonesIcon, label: "Helpdesk" },
]

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function SmsDashboard() {
  const { data: session } = authClient.useSession()
  const user = session?.user

  useSetBreadcrumbs([{ title: "Dashboard", href: "/" }])

  return (
    <div className="space-y-6 py-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button size="sm">New Application</Button>
      </div>

      {/* Student profile card */}
      <Card>
        <CardContent className="flex items-start gap-6 py-6">
          <Avatar className="size-20 shrink-0 text-xl">
            <AvatarFallback className="bg-blue-600 text-white">
              {user?.name ? getInitials(user.name) : "S"}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
            <span className="font-medium text-muted-foreground">Name</span>
            <span>{user?.name ?? "—"}</span>
            <span className="font-medium text-muted-foreground">
              Student ID
            </span>
            <span>000011011</span>
            <span className="font-medium text-muted-foreground">Course</span>
            <span>Advanced Certificate in IT</span>
            <span className="font-medium text-muted-foreground">Faculty</span>
            <span>
              Villa College <span className="text-muted-foreground">→</span>{" "}
              Malé QI Campus
            </span>
            <span className="font-medium text-muted-foreground">Balance</span>
            <span>MVR 101,575.00</span>
          </div>
          <Button variant="ghost" size="sm" className="shrink-0 gap-1 text-xs">
            View profile <ExternalLinkIcon className="size-3" />
          </Button>
        </CardContent>
      </Card>

      {/* Two-column layout */}
      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        {/* Recent Forms */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <FileTextIcon className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Recent Forms</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-x-4 border-b px-6 py-2 text-xs font-medium text-muted-foreground">
              <span>Reference No</span>
              <span>Service Type</span>
              <span>Application Date</span>
              <span>Status</span>
            </div>
            {RECENT_FORMS.map((form) => (
              <div
                key={form.ref}
                className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-x-4 border-b px-6 py-3 text-sm last:border-0"
              >
                <span className="text-blue-600 dark:text-blue-400">
                  {form.ref}
                </span>
                <span>{form.serviceType}</span>
                <span className="text-muted-foreground">
                  {form.applicationDate}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[form.status]}`}
                >
                  {form.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <CalendarIcon className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pt-0">
            {UPCOMING_EVENTS.map((event, i) => (
              <div key={i}>
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs text-muted-foreground">{event.date}</p>
                {i < UPCOMING_EVENTS.length - 1 && (
                  <Separator className="mt-3" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <LayoutGridIcon className="size-4 text-muted-foreground" />
          <CardTitle className="text-base">Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-4 gap-3 pt-0 sm:grid-cols-8">
          {QUICK_LINKS.map(({ icon: Icon, label, href }) => (
            <Button
              key={label}
              variant="outline"
              className="h-16 flex-col gap-1.5 text-[11px]"
              render={<Link href={href ?? "#"} />}
              nativeButton={false}
            >
              <Icon className="size-5" />
              {label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
