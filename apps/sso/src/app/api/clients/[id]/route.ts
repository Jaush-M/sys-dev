import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { oauthClients } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"

const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  clientSecret: z.string().optional().nullable(),
  redirectUris: z.array(z.string().url()).optional(),
  scopes: z.array(z.string()).optional(),
  disabled: z.boolean().optional(),
  skipConsent: z.boolean().optional(),
  requirePKCE: z.boolean().optional(),
  public: z.boolean().optional(),
  uri: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  tos: z.string().optional().nullable(),
  policy: z.string().optional().nullable(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = await db
      .select()
      .from(oauthClients)
      .where(eq(oauthClients.id, id))
      .limit(1)

    if (!client.length) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json(client[0])
  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateClientSchema.parse(body)

    const updatedClient = await db
      .update(oauthClients)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(oauthClients.id, id))
      .returning()

    if (!updatedClient.length) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json(updatedClient[0])
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Error updating client:", error)
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deletedClient = await db
      .delete(oauthClients)
      .where(eq(oauthClients.id, id))
      .returning()

    if (!deletedClient.length) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting client:", error)
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    )
  }
}
