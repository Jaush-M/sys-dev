import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sessions, users } from "@/lib/db/schema"
import { desc, eq, sql, or } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    let queryBuilder

    if (search) {
      queryBuilder = db
        .select({
          id: sessions.id,
          token: sessions.token,
          expiresAt: sessions.expiresAt,
          createdAt: sessions.createdAt,
          updatedAt: sessions.updatedAt,
          ipAddress: sessions.ipAddress,
          userAgent: sessions.userAgent,
          userId: sessions.userId,
          impersonatedBy: sessions.impersonatedBy,
          userName: users.name,
          userEmail: users.email,
        })
        .from(sessions)
        .leftJoin(users, eq(sessions.userId, users.id))
        .where(
          or(
            sql`${users.name} ILIKE ${`%${search}%`}`,
            sql`${users.email} ILIKE ${`%${search}%`}`,
            sql`${sessions.ipAddress} ILIKE ${`%${search}%`}`
          )
        )
        .orderBy(desc(sessions.createdAt))
    } else {
      queryBuilder = db
        .select({
          id: sessions.id,
          token: sessions.token,
          expiresAt: sessions.expiresAt,
          createdAt: sessions.createdAt,
          updatedAt: sessions.updatedAt,
          ipAddress: sessions.ipAddress,
          userAgent: sessions.userAgent,
          userId: sessions.userId,
          impersonatedBy: sessions.impersonatedBy,
          userName: users.name,
          userEmail: users.email,
        })
        .from(sessions)
        .leftJoin(users, eq(sessions.userId, users.id))
        .orderBy(desc(sessions.createdAt))
    }

    const allSessions = await queryBuilder
    const total = allSessions.length
    const paginatedSessions = allSessions.slice(offset, offset + limit)

    return NextResponse.json({
      sessions: paginatedSessions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    )
  }
}
