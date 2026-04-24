"use server"

import { cookies } from "next/headers"
import { DashboardLayout } from "@/layouts/dashboard-layout"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <DashboardLayout defaultSidebarOpen={sidebarOpen}>
      {children}
    </DashboardLayout>
  )
}
