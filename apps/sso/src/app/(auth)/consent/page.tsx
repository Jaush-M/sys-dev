"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth/client"
import { Button } from "@workspace/ui/primitives/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@workspace/ui/primitives/card"
import { Badge } from "@workspace/ui/primitives/badge"
import { ShieldCheckIcon, AlertTriangleIcon } from "lucide-react"
import { toast } from "@workspace/ui/primitives/sonner"

export default function ConsentPage() {
  const searchParams = useSearchParams()
  const callbackURL = searchParams.get("callback_url") || "/"
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const acceptConsent = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error: consentError } = await authClient.oauth2.consent({
        accept: true,
      })

      if (consentError) {
        setError(consentError.message || "Failed to authorize")
        toast.error(consentError.message || "Failed to authorize")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const denyConsent = async () => {
    try {
      await authClient.oauth2.consent({
        accept: false,
      })
    } catch (err) {
      toast.error("Failed to deny authorization")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ShieldCheckIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Approve Access</CardTitle>
              <CardDescription>OAuth Authorization Request</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm">
              This application would like to access your profile data.
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
            <AlertTriangleIcon className="mt-0.5 h-4 w-4 text-amber-600" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Requested permissions:</p>
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge variant="outline">profile</Badge>
                <Badge variant="outline">email</Badge>
                <Badge variant="outline">openid</Badge>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
          <Button
            variant="outline"
            onClick={denyConsent}
            disabled={loading}
            className="flex-1"
          >
            Deny
          </Button>
          <Button onClick={acceptConsent} disabled={loading} className="flex-1">
            {loading ? "Authorizing..." : "Authorize"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
