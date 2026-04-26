"use client"

import { authClient } from "@/lib/auth/client"

export default function Dashboard() {
  const { data: session } = authClient.useSession()

  const sessionUser =
    (session?.user as unknown as {
      roles: string[]
      permissions: Record<string, string[]>
    }) ?? {}

  const userRoles = sessionUser.roles ?? []
  const permissions = sessionUser.permissions ?? {}

  const isTeacher = userRoles.includes("teacher")
  const isSuperAdmin = userRoles.includes("super-admin")

  return (
    <div>
      <div>LMS APP</div>
      <p>Roles: {userRoles.join(", ")}</p>
      <p>Permissions: {JSON.stringify(permissions)}</p>
      <pre>Session: {JSON.stringify(session, null, 2)}</pre>

      {/* your existing checks */}
      {isTeacher && <p>You are a teacher ✅</p>}
      {isSuperAdmin && <p>You are a super admin ✅</p>}
    </div>
  )
}
