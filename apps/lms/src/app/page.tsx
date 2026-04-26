"use client"

import { authClient } from "@/lib/auth/client"
import { DashboardLayout } from "@/layouts/dashboard-layout"
import { Badge } from "@workspace/ui/primitives/badge"
import { Button } from "@workspace/ui/primitives/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card"
import { Checkbox } from "@workspace/ui/primitives/checkbox"
import { Progress } from "@workspace/ui/primitives/progress"
import {
  ArrowRightIcon,
  BookOpenIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  FileTextIcon,
  HelpCircleIcon,
  LayoutGridIcon,
  LinkIcon,
  PlayCircleIcon,
  VideoIcon,
} from "lucide-react"
import { useSetBreadcrumbs } from "@workspace/ui/components/breadcrumb-provider"

const STATS = [
  {
    icon: LayoutGridIcon,
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600",
    value: "8",
    label: "Enrolled Courses",
    sub: null as string | null,
    subColor: "",
  },
  {
    icon: FileTextIcon,
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-500",
    value: "3",
    label: "Assignments Due",
    sub: "4 this week",
    subColor: "text-orange-500",
  },
  {
    icon: ClockIcon,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-500",
    value: "14h 30m",
    label: "Study Time",
    sub: null,
    subColor: "",
  },
  {
    icon: BookOpenIcon,
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600",
    value: "5",
    label: "All Assessments",
    sub: null,
    subColor: "",
  },
]

const COURSES = [
  {
    id: 1,
    name: "Web Development with React",
    instructor: "John Smith",
    progress: 46,
    bannerStyle: { background: "linear-gradient(135deg, #a855f7, #2563eb)" },
    emoji: "💻",
  },
  {
    id: 2,
    name: "Data Science Fundamentals",
    instructor: "Sarah Chen",
    progress: 72,
    bannerStyle: { background: "linear-gradient(135deg, #fb923c, #ef4444)" },
    emoji: "📊",
  },
  {
    id: 3,
    name: "UI/UX Design Fundamentals",
    instructor: "Emma Wilson",
    progress: 31,
    bannerStyle: { background: "linear-gradient(135deg, #60a5fa, #22d3ee)" },
    emoji: "🎨",
  },
  {
    id: 4,
    name: "Art & Anatomy",
    instructor: "Michael Brown",
    progress: 58,
    bannerStyle: { background: "linear-gradient(135deg, #4ade80, #10b981)" },
    emoji: "🖌️",
  },
]

const UPCOMING = [
  {
    type: "Live Session",
    title: "React Components Deep Dive",
    date: "Mar 31",
    time: "10:00 AM",
    course: "Web Development with React",
  },
  {
    type: "Assignment",
    title: "Data Visualization Project",
    date: "Apr 2",
    time: "11:59 PM",
    course: "Data Science Fundamentals",
  },
  {
    type: "Quiz",
    title: "UI/UX Principles",
    date: "Apr 5",
    time: "2:00 PM",
    course: "UI/UX Design Fundamentals",
  },
]

const TODO = [
  { id: 1, label: "Finish reading Chapter 4", done: false },
  { id: 2, label: "Complete React Assignment", done: false },
  { id: 3, label: "Review Data Structures notes", done: true },
  { id: 4, label: "Submit Intro Business Essay", done: false },
  { id: 5, label: "Office Hours", done: false },
]

const ANNOUNCEMENTS = [
  {
    title: "System Maintenance",
    body: "Scheduled maintenance on May 26, 2025 from 12:00–2:00 AM. Save your work.",
    ago: "2h ago",
  },
  {
    title: "New Course Available!",
    body: "Machine Learning Basics is now available in your enrolled programs.",
    ago: "1d ago",
  },
]

const CAL_DAYS = [
  null,
  null,
  null,
  null,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
]
const CAL_EVENTS = new Set([8, 14, 22, 28])

const QUICK_LINKS = [
  { icon: LinkIcon, label: "Library" },
  { icon: VideoIcon, label: "Live Class" },
  { icon: CalendarIcon, label: "Calendar" },
  { icon: FileTextIcon, label: "Assignments" },
  { icon: HelpCircleIcon, label: "Support" },
  { icon: BookOpenIcon, label: "Resources" },
]

export default function StudentDashboard() {
  const { data: session } = authClient.useSession()
  const firstName = session?.user?.name?.split(" ")[0] ?? "Student"

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  useSetBreadcrumbs([{ title: "Dashboard", href: "/" }])

  return (
    <div className="space-y-6 py-5">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold">
          {greeting}, {firstName}! 👋
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{date}</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map(
          ({ icon: Icon, iconBg, iconColor, value, label, sub, subColor }) => (
            <Card key={label} size="sm">
              <CardContent className="flex items-center gap-3">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full ${iconBg}`}
                >
                  <Icon className={`size-5 ${iconColor}`} />
                </div>
                <div>
                  <p className="text-xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  {sub && <p className={`text-xs ${subColor}`}>{sub}</p>}
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* Main content + right panel */}
      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Continue Learning */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Continue Learning</h2>
              <Button variant="ghost" size="sm" className="text-xs">
                View all <ArrowRightIcon className="ml-1 size-3" />
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {COURSES.map((c) => (
                <Card
                  key={c.id}
                  className="cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
                >
                  <div
                    className="flex h-24 items-center justify-center"
                    style={c.bannerStyle}
                  >
                    <span className="text-4xl">{c.emoji}</span>
                  </div>
                  <CardContent className="pt-3 pb-4">
                    <p className="line-clamp-2 text-sm leading-tight font-medium">
                      {c.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.instructor}
                    </p>
                    <Progress value={c.progress} className="mt-3" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.progress}% complete
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Upcoming */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Upcoming</h2>
              <Button variant="ghost" size="sm" className="text-xs">
                Show schedule <ArrowRightIcon className="ml-1 size-3" />
              </Button>
            </div>
            <Card>
              <CardContent className="divide-y p-0">
                {UPCOMING.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-muted text-center leading-none">
                      <span className="text-[10px] text-muted-foreground uppercase">
                        {item.date.split(" ")[0]}
                      </span>
                      <span className="text-sm font-bold">
                        {item.date.split(" ")[1]}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <Badge variant="secondary" className="text-[10px]">
                        {item.type}
                      </Badge>
                      <p className="mt-0.5 truncate text-sm font-medium">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.course} · {item.time}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 text-xs"
                    >
                      {item.type === "Live Session" && (
                        <PlayCircleIcon className="mr-1 size-3" />
                      )}
                      {item.type === "Live Session" ? "Join" : "Start"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* My Courses */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">My Courses</h2>
              <Button variant="ghost" size="sm" className="text-xs">
                View all <ArrowRightIcon className="ml-1 size-3" />
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b px-6 py-2 text-xs font-medium text-muted-foreground">
                  <span>Course</span>
                  <span className="w-24 text-center">Progress</span>
                  <span className="w-16 text-right">Status</span>
                </div>
                {COURSES.map((c) => (
                  <div
                    key={c.id}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-b px-6 py-3 last:border-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-sm"
                        style={c.bannerStyle}
                      >
                        {c.emoji}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.instructor}
                        </p>
                      </div>
                    </div>
                    <div className="w-24 space-y-0.5">
                      <Progress value={c.progress} />
                      <p className="text-center text-xs text-muted-foreground">
                        {c.progress}%
                      </p>
                    </div>
                    <div className="w-16 text-right">
                      <Badge
                        variant={c.progress > 50 ? "default" : "outline"}
                        className="text-[10px]"
                      >
                        {c.progress > 50 ? "On Track" : "In Progress"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Mini calendar */}
          <Card size="sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">May 2025</CardTitle>
                <div className="flex gap-0.5">
                  <Button variant="ghost" size="sm" className="size-7 p-0">
                    <ChevronLeftIcon className="size-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="size-7 p-0">
                    <ChevronRightIcon className="size-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-7 text-center">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div
                    key={d}
                    className="py-1 text-[10px] font-medium text-muted-foreground"
                  >
                    {d}
                  </div>
                ))}
                {CAL_DAYS.map((day, i) => (
                  <div
                    key={i}
                    className={`rounded-full py-1 text-xs leading-none ${
                      !day
                        ? ""
                        : day === 14
                          ? "bg-primary font-medium text-primary-foreground"
                          : CAL_EVENTS.has(day)
                            ? "font-medium text-primary"
                            : "cursor-pointer hover:bg-muted"
                    }`}
                  >
                    {day ?? ""}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* To Do */}
          <Card size="sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">To Do</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {TODO.map((item) => (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-center gap-2.5"
                >
                  <Checkbox defaultChecked={item.done} />
                  <span
                    className={`text-xs ${item.done ? "text-muted-foreground line-through" : ""}`}
                  >
                    {item.label}
                  </span>
                </label>
              ))}
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card size="sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Announcements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {ANNOUNCEMENTS.map((a, i) => (
                <div key={i}>
                  <p className="text-xs font-medium">{a.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {a.body}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {a.ago}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card size="sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2 pt-0">
              {QUICK_LINKS.map(({ icon: Icon, label }) => (
                <Button
                  key={label}
                  variant="outline"
                  className="h-14 flex-col gap-1 text-[10px]"
                >
                  <Icon className="size-4" />
                  {label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
