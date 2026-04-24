"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
  CardFooter,
} from "@workspace/ui/primitives/card"
import { Badge } from "@workspace/ui/primitives/badge"
import {
  UsersIcon,
  KeyIcon,
  ActivityIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ShieldCheckIcon,
  BanIcon,
  ClockIcon,
  CheckCircleIcon,
} from "lucide-react"
import Link from "next/link"
import { useSetBreadcrumbs } from "@workspace/ui/components/breadcrumb-provider"
import { Skeleton } from "@workspace/ui/primitives/skeleton"
import { toast } from "@workspace/ui/primitives/sonner"
import { NextResponse } from "next/server"
import { useQuery } from "@tanstack/react-query"

interface Stats {
  users: {
    total: number
    active: number
    banned: number
    verified: number
  }
  sessions: {
    total: number
    active: number
    expired: number
  }
  clients: {
    total: number
    active: number
    disabled: number
  }
}

export default function DashboardPage() {
  useSetBreadcrumbs([
    {
      title: "Dashboard",
      href: "/",
    },
  ])

  const {
    isPending,
    error,
    data: stats,
    isFetching,
  } = useQuery<Stats>({
    queryKey: ["repoData"],
    queryFn: async () => {
      const response = await fetch("/api/stats")

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("UNAUTHORIZED")
        }
        if (response.status === 403) {
          throw new Error("FORBIDDEN")
        }
        throw new Error("SERVER_ERROR")
      }

      return await response.json()
    },
  })

  useEffect(() => {
    if (!error) return

    if (error.message === "UNAUTHORIZED") {
      toast.error("Please log in to continue.")
      window.location.href = "/login"
    } else if (error.message === "FORBIDDEN") {
      toast.error("You don't have permission to view this.")
    } else {
      toast.error("Something went wrong. Try again later.")
    }
  }, [error])

  if (isPending) {
    return (
      <div className="grid gap-12">
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-42 w-full" />
          <Skeleton className="h-42 w-full" />
          <Skeleton className="h-42 w-full" />
        </div>

        <Skeleton className="h-56 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-sm text-muted-foreground">Failed to load.</div>
    )
  }

  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-12 md:py-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
              {/* Users Card */}
              <Link href="/users">
                <Card className="cursor-pointer transition-colors hover:bg-accent/50 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <UsersIcon className="h-4 w-4 text-primary" />
                      </div>
                      <CardDescription>Total Users</CardDescription>
                    </div>
                    <CardTitle className="text-3xl font-semibold tabular-nums">
                      {stats?.users.total.toLocaleString() || 0}
                    </CardTitle>
                    <CardAction>
                      <Badge variant="outline" className="text-green-600">
                        <ShieldCheckIcon className="mr-1 h-3 w-3" />
                        {stats?.users.active.toLocaleString() || 0} Active
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <CheckCircleIcon className="h-3 w-3" />
                        {stats?.users.verified || 0} Verified
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <BanIcon className="h-3 w-3" />
                        {stats?.users.banned || 0} Banned
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </Link>

              {/* OAuth Clients Card */}
              <Link href="/clients">
                <Card className="cursor-pointer transition-colors hover:bg-accent/50 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <KeyIcon className="h-4 w-4 text-primary" />
                      </div>
                      <CardDescription>OAuth Clients</CardDescription>
                    </div>
                    <CardTitle className="text-3xl font-semibold tabular-nums">
                      {stats?.clients.total.toLocaleString() || 0}
                    </CardTitle>
                    <CardAction>
                      <Badge variant="outline" className="text-green-600">
                        <TrendingUpIcon className="mr-1 h-3 w-3" />
                        {stats?.clients.active.toLocaleString() || 0} Active
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <TrendingDownIcon className="h-3 w-3" />
                      {stats?.clients.disabled || 0} Disabled
                    </div>
                  </CardFooter>
                </Card>
              </Link>

              {/* Sessions Card */}
              <Link href="/sessions">
                <Card className="cursor-pointer transition-colors hover:bg-accent/50 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <ActivityIcon className="h-4 w-4 text-primary" />
                      </div>
                      <CardDescription>Active Sessions</CardDescription>
                    </div>
                    <CardTitle className="text-3xl font-semibold tabular-nums">
                      {stats?.sessions.active.toLocaleString() || 0}
                    </CardTitle>
                    <CardAction>
                      <Badge variant="outline">
                        <ClockIcon className="mr-1 h-3 w-3" />
                        {stats?.sessions.total.toLocaleString() || 0} Total
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <BanIcon className="h-3 w-3" />
                      {stats?.sessions.expired || 0} Expired
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="px-4 lg:px-6">
              <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
              <div className="grid grid-cols-1 items-stretch gap-4 @xl/main:grid-cols-3">
                <Link href="/users" className="block h-full">
                  <Card className="h-full cursor-pointer transition-colors hover:bg-accent/50">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                          <UsersIcon className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            Manage Users
                          </CardTitle>
                          <CardDescription>
                            View and edit user accounts
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/clients" className="block h-full">
                  <Card className="h-full cursor-pointer transition-colors hover:bg-accent/50">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                          <KeyIcon className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            Manage OAuth Clients
                          </CardTitle>
                          <CardDescription>
                            Configure OAuth applications
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/sessions" className="block h-full">
                  <Card className="h-full cursor-pointer transition-colors hover:bg-accent/50">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                          <ActivityIcon className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            View Sessions
                          </CardTitle>
                          <CardDescription>
                            Monitor active sessions
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
