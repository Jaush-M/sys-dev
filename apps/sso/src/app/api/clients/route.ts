import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { oauthClients } from "@/lib/db/schema"
import { desc, sql, or } from "drizzle-orm"
import { z } from "zod"

const createClientSchema = z.object({
  name: z.string().min(1),
  clientId: z.string().min(1),
  clientSecret: z.string().optional(),
  redirectUris: z.array(z.string().url()),
  scopes: z.array(z.string()).default(["openid", "profile", "email"]),
  disabled: z.boolean().default(false),
  skipConsent: z.boolean().default(false),
  requirePKCE: z.boolean().default(true),
  public: z.boolean().default(false),
})

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
        .select()
        .from(oauthClients)
        .where(
          or(
            sql`${oauthClients.name} ILIKE ${`%${search}%`}`,
            sql`${oauthClients.clientId} ILIKE ${`%${search}%`}`
          )
        )
        .orderBy(desc(oauthClients.createdAt))
    } else {
      queryBuilder = db
        .select()
        .from(oauthClients)
        .orderBy(desc(oauthClients.createdAt))
    }

    const allClients = await queryBuilder
    const total = allClients.length
    const paginatedClients = allClients.slice(offset, offset + limit)

    return NextResponse.json({
      clients: paginatedClients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createClientSchema.parse(body)

    const newClient = await db
      .insert(oauthClients)
      .values({
        id: crypto.randomUUID(),
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return NextResponse.json(newClient[0], { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Error creating client:", error)
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    )
  }
}
