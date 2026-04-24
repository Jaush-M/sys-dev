"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/primitives/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card"
import { Button } from "@workspace/ui/primitives/button"
import { Input } from "@workspace/ui/primitives/input"
import { Badge } from "@workspace/ui/primitives/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/primitives/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/primitives/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select"
import { toast } from "@workspace/ui/primitives/sonner"
import { Skeleton } from "@workspace/ui/primitives/skeleton"
import { useSetBreadcrumbs } from "@workspace/ui/components/breadcrumb-provider"
import { authClient } from "@/lib/auth/client"
import {
  MoreHorizontalIcon,
  SearchIcon,
  ShieldIcon,
  BanIcon,
  CheckCircleIcon,
  UserXIcon,
  TrashIcon,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Role } from "@/lib/auth/access-control"

interface User {
  id: string
  email: string
  name: string
  image?: string | null
  emailVerified: boolean
  role?: string | null
  banned: boolean
  banReason?: string | null
  banExpires?: number | null
  createdAt: Date
  updatedAt: Date
}

function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function UsersPage() {
  useSetBreadcrumbs([
    { title: "Dashboard", href: "/" },
    { title: "Users", href: "/users" },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [banReason, setBanReason] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])

  // Fetch users using Better Auth admin client API
  const fetchUsers = async () => {
    setIsLoading(true)
    const { data, error } = await authClient.admin.listUsers({
      query: {
        limit: 100,
        searchField: "email",
        searchValue: searchQuery || undefined,
      },
    })

    if (error) {
      toast.error(error.message || "Failed to fetch users")
      setUsers([])
    } else {
      setUsers((data?.users as any) || [])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [debouncedSearchQuery])

  // Filter users client-side for role and status
  const filteredUsers = users.filter((user) => {
    if (roleFilter !== "all" && user.role !== roleFilter) return false
    if (statusFilter === "banned" && !user.banned) return false
    if (statusFilter === "active" && user.banned) return false
    return true
  })

  // Edit user role using Better Auth admin API
  const handleEditRole = async () => {
    if (!selectedUser) return

    const { error } = await authClient.admin.setRole({
      userId: selectedUser.id,
      role: selectedUser.role as Role,
    })

    if (error) {
      toast.error(error.message || "Failed to update role")
    } else {
      toast.success("User role updated successfully")
      setIsEditDialogOpen(false)
      setSelectedUser(null)
      fetchUsers()
    }
  }

  // Ban user using Better Auth admin API
  const handleBanUser = async () => {
    if (!selectedUser) return

    const { error } = await authClient.admin.banUser({
      userId: selectedUser.id,
      banReason: banReason || "No reason provided",
    })

    if (error) {
      toast.error(error.message || "Failed to ban user")
    } else {
      toast.success("User banned successfully")
      setIsBanDialogOpen(false)
      setSelectedUser(null)
      setBanReason("")
      fetchUsers()
    }
  }

  // Unban user using Better Auth admin API
  const handleUnbanUser = async (userId: string) => {
    const { error } = await authClient.admin.unbanUser({ userId })

    if (error) {
      toast.error(error.message || "Failed to unban user")
    } else {
      toast.success("User unbanned successfully")
      fetchUsers()
    }
  }

  // Delete user using Better Auth admin API
  const handleDeleteUser = async () => {
    if (!selectedUser) return

    const { error } = await authClient.admin.removeUser({
      userId: selectedUser.id,
    })

    if (error) {
      toast.error(error.message || "Failed to delete user")
    } else {
      toast.success("User deleted successfully")
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
      fetchUsers()
    }
  }

  const getStatusBadge = (user: User) => {
    if (user.banned) {
      return (
        <Badge variant="destructive" className="gap-1">
          <BanIcon className="h-3 w-3" />
          Banned
        </Badge>
      )
    }
    if (user.emailVerified) {
      return (
        <Badge variant="outline" className="text-green-600">
          <CheckCircleIcon className="mr-1 h-3 w-3" />
          Verified
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="text-amber-600">
        Unverified
      </Badge>
    )
  }

  const getRoleBadge = (role?: string | null) => {
    const roleStyles: Record<string, string> = {
      "super-admin": "bg-purple-500/10 text-purple-600 border-purple-500/20",
      teacher: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      student: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    }

    const style = roleStyles[role || "student"] || roleStyles.student

    return (
      <Badge variant="outline" className={`gap-1 ${style}`}>
        <ShieldIcon className="h-3 w-3" />
        {role || "student"}
      </Badge>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage users, roles, and permissions
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(value) => setRoleFilter(value ?? "")}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super-admin">Super Admin</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value ?? "")}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}{" "}
            found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserXIcon className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                No users found matching your filters
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {user.name || "N/A"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              size="icon"
                            />
                          }
                        >
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <ShieldIcon className="mr-2 h-4 w-4" />
                              Edit Role
                            </DropdownMenuItem>
                            {user.banned ? (
                              <DropdownMenuItem
                                onClick={() => handleUnbanUser(user.id)}
                              >
                                <CheckCircleIcon className="mr-2 h-4 w-4" />
                                Unban User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user)
                                  setIsBanDialogOpen(true)
                                }}
                              >
                                <BanIcon className="mr-2 h-4 w-4" />
                                Ban User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedUser(user)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <TrashIcon className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={selectedUser?.role || "student"}
              onValueChange={(value) =>
                setSelectedUser((prev) =>
                  prev ? { ...prev, role: value } : null
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="super-admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditRole}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              This will prevent {selectedUser?.email} from accessing the system.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <label htmlFor="ban-reason" className="text-sm font-medium">
                Reason (optional)
              </label>
              <Input
                id="ban-reason"
                placeholder="Enter ban reason..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsBanDialogOpen(false)
                setBanReason("")
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBanUser}>
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              user account for {selectedUser?.email}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
