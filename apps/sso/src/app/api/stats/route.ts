import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users, sessions, oauthClients } from "@/lib/db/schema"
import { sql } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  const roles = session?.user.role?.split(",").map((r) => r.trim()) ?? []

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!roles.includes("super-admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const [userStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`count(*) filter (where ${users.banned} = false)::int`,
        banned: sql<number>`count(*) filter (where ${users.banned} = true)::int`,
        verified: sql<number>`count(*) filter (where ${users.emailVerified} = true)::int`,
      })
      .from(users)

    const [sessionStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`count(*) filter (where ${sessions.expiresAt} > now())::int`,
        expired: sql<number>`count(*) filter (where ${sessions.expiresAt} <= now())::int`,
      })
      .from(sessions)

    const [clientStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`count(*) filter (where ${oauthClients.disabled} = false)::int`,
        disabled: sql<number>`count(*) filter (where ${oauthClients.disabled} = true)::int`,
      })
      .from(oauthClients)

    return NextResponse.json({
      users: userStats,
      sessions: sessionStats,
      clients: clientStats,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
