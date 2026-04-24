"use client"

import { useEffect, useState } from "react"
import { Button } from "@workspace/ui/primitives/button"
import { Input } from "@workspace/ui/primitives/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/primitives/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/primitives/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/primitives/dropdown-menu"
import { Badge } from "@workspace/ui/primitives/badge"
import {
  SearchIcon,
  MoreVerticalIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LoaderIcon,
  ActivityIcon,
  ClockIcon,
  UserIcon,
  MonitorIcon,
} from "lucide-react"
import { toast } from "@workspace/ui/primitives/sonner"

interface Session {
  id: string
  token: string
  expiresAt: string
  createdAt: string
  updatedAt: string
  ipAddress: string | null
  userAgent: string | null
  userId: string
  impersonatedBy: string | null
  userName: string | null
  userEmail: string | null
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  useEffect(() => {
    fetchSessions()
  }, [pagination.page, search])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const query = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
      })
      const response = await fetch(`/api/sessions?${query}`)
      const data = await response.json()
      setSessions(data.sessions)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching sessions:", error)
      toast.error("Failed to fetch sessions")
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async (sessionId: string) => {
    if (!confirm("Are you sure you want to revoke this session?")) return

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Session revoked successfully")
        fetchSessions()
      } else {
        toast.error("Failed to revoke session")
      }
    } catch (error) {
      toast.error("Failed to revoke session")
    }
  }

  const openViewDialog = (session: Session) => {
    setSelectedSession(session)
    setIsViewOpen(true)
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  const formatDuration = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffMs = now.getTime() - created.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    return `${diffMins}m ago`
  }

  const truncateToken = (token: string) => {
    return `${token.slice(0, 8)}...${token.slice(-8)}`
  }

  const parseUserAgent = (userAgent: string | null) => {
    if (!userAgent) return { browser: "Unknown", os: "Unknown" }

    const browserMatch = userAgent.match(
      /(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/
    )
    const osMatch = userAgent.match(
      /(Windows|Mac|Linux|Android|iOS)[/\s]?[\d._]*/
    )

    return {
      browser: browserMatch ? browserMatch[1] : "Unknown",
      os: osMatch ? osMatch[1] : "Unknown",
    }
  }

  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Search */}
            <div className="flex items-center gap-4 px-4 lg:px-6">
              <div className="relative max-w-sm flex-1">
                <SearchIcon className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sessions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {pagination.total} sessions total
              </div>
            </div>

            {/* Table */}
            <div className="px-4 lg:px-6">
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Session</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <LoaderIcon className="mx-auto h-5 w-5 animate-spin" />
                        </TableCell>
                      </TableRow>
                    ) : sessions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No sessions found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sessions.map((session) => {
                        const expired = isExpired(session.expiresAt)
                        const { browser, os } = parseUserAgent(
                          session.userAgent
                        )

                        return (
                          <TableRow key={session.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                  <UserIcon className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {session.userName || "Unknown User"}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {session.userEmail || session.userId}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <code className="w-fit rounded bg-muted px-2 py-1 text-xs">
                                  {truncateToken(session.token)}
                                </code>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <MonitorIcon className="h-3 w-3" />
                                  {browser} on {os}
                                  {session.ipAddress && (
                                    <span>• {session.ipAddress}</span>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {expired ? (
                                <Badge variant="secondary">
                                  <ClockIcon className="mr-1 h-3 w-3" />
                                  Expired
                                </Badge>
                              ) : (
                                <Badge variant="default">
                                  <ActivityIcon className="mr-1 h-3 w-3" />
                                  Active
                                </Badge>
                              )}
                              {session.impersonatedBy && (
                                <Badge variant="outline" className="ml-2">
                                  Impersonated
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{formatDuration(session.createdAt)}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(
                                    session.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={
                                    <Button variant="ghost" size="icon" />
                                  }
                                >
                                  <MoreVerticalIcon className="h-4 w-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => openViewDialog(session)}
                                  >
                                    <ActivityIcon className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  {!expired && (
                                    <DropdownMenuItem
                                      variant="destructive"
                                      onClick={() => handleRevoke(session.id)}
                                    >
                                      <TrashIcon className="mr-2 h-4 w-4" />
                                      Revoke Session
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((p) => ({ ...p, page: p.page - 1 }))
                    }
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((p) => ({ ...p, page: p.page + 1 }))
                    }
                    disabled={pagination.page === pagination.totalPages}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription>
              Detailed information about the user session.
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    User
                  </label>
                  <p className="font-medium">
                    {selectedSession.userName || "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSession.userEmail}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    User ID
                  </label>
                  <p className="font-mono text-sm">{selectedSession.userId}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Session Token
                </label>
                <code className="mt-1 block rounded bg-muted px-3 py-2 text-sm break-all">
                  {selectedSession.token}
                </code>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    IP Address
                  </label>
                  <p>{selectedSession.ipAddress || "Unknown"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <p>
                    {isExpired(selectedSession.expiresAt) ? (
                      <Badge variant="secondary">Expired</Badge>
                    ) : (
                      <Badge variant="default">Active</Badge>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  User Agent
                </label>
                <p className="text-sm break-words text-muted-foreground">
                  {selectedSession.userAgent || "Unknown"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Created
                  </label>
                  <p>{new Date(selectedSession.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Expires
                  </label>
                  <p>{new Date(selectedSession.expiresAt).toLocaleString()}</p>
                </div>
              </div>

              {selectedSession.impersonatedBy && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Impersonated By
                  </label>
                  <Badge variant="outline" className="mt-1">
                    {selectedSession.impersonatedBy}
                  </Badge>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {!selectedSession || isExpired(selectedSession.expiresAt) ? (
              <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedSession) {
                    handleRevoke(selectedSession.id)
                    setIsViewOpen(false)
                  }
                }}
              >
                <TrashIcon className="mr-2 h-4 w-4" />
                Revoke Session
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
