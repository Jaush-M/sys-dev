"use server"

import { cookies, headers } from "next/headers"
import { DashboardLayout } from "@/layouts/dashboard-layout"
import { auth } from "@/lib/auth"
import { Forbidden } from "@/components/forbidden"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false"

  const { session, user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {}

  if (!session || !user || user.role !== "super-admin") {
    return <Forbidden />
  }

  return (
    <DashboardLayout defaultSidebarOpen={sidebarOpen}>
      {children}
    </DashboardLayout>
  )
}
