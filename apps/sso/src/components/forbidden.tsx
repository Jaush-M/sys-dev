"use client"

import { authClient } from "@/lib/auth/client"
import { Button } from "@workspace/ui/primitives/button"
import { ArrowLeft, LogOut, ShieldX } from "lucide-react"
import { useRouter } from "next/navigation"

export function Forbidden() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12 text-center">
      <div className="max-w-md space-y-6">
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-destructive/10">
          <ShieldX className="h-16 w-16 text-destructive" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h1 className="text-7xl font-bold tracking-tighter text-foreground">
            403
          </h1>
          <p className="text-2xl font-semibold tracking-tight">
            Access Forbidden
          </p>
        </div>

        {/* Message */}
        <div className="leading-relaxed text-muted-foreground">
          <p className="text-lg">
            You don&apos;t have permission to access this page.
          </p>
          <p className="text-sm">
            Please contact your administrator if you believe this is a mistake.
          </p>
        </div>

        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>

            <Button
              variant="destructive"
              size="lg"
              onClick={async () => {
                await authClient.signOut()

                window.location.reload()
              }}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

          <p className="pt-6 text-xs text-muted-foreground">
            If you keep seeing this, try clearing your cache or logging in
            again.
          </p>
        </div>
      </div>
    </div>
  )
}
