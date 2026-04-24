"use client"

import { useEffect, useState } from "react"
import { Button } from "@workspace/ui/primitives/button"
import { Input } from "@workspace/ui/primitives/input"
import { Label } from "@workspace/ui/primitives/label"
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
  DialogTrigger,
} from "@workspace/ui/primitives/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/primitives/dropdown-menu"
import { Checkbox } from "@workspace/ui/primitives/checkbox"
import { Badge } from "@workspace/ui/primitives/badge"
import {
  PlusIcon,
  SearchIcon,
  MoreVerticalIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LoaderIcon,
  KeyIcon,
  CopyIcon,
  ExternalLinkIcon,
} from "lucide-react"
import { toast } from "@workspace/ui/primitives/sonner"

interface OAuthClient {
  id: string
  name: string
  clientId: string
  clientSecret: string | null
  redirectUris: string[]
  scopes: string[]
  disabled: boolean
  skipConsent: boolean
  requirePKCE: boolean
  public: boolean
  createdAt: string
  updatedAt: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function ClientsPage() {
  const [clients, setClients] = useState<OAuthClient[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewSecretOpen, setIsViewSecretOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<OAuthClient | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    clientId: "",
    clientSecret: "",
    redirectUris: "",
    scopes: "openid profile email",
    disabled: false,
    skipConsent: false,
    requirePKCE: true,
    public: false,
  })

  useEffect(() => {
    fetchClients()
  }, [pagination.page, search])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const query = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
      })
      const response = await fetch(`/api/clients?${query}`)
      const data = await response.json()
      setClients(data.clients)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching clients:", error)
      toast.error("Failed to fetch clients")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          redirectUris: formData.redirectUris
            .split(",")
            .map((u) => u.trim())
            .filter(Boolean),
          scopes: formData.scopes
            .split(" ")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      })

      if (response.ok) {
        toast.success("OAuth client created successfully")
        setIsCreateOpen(false)
        resetForm()
        fetchClients()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to create client")
      }
    } catch (error) {
      toast.error("Failed to create client")
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient) return

    try {
      const response = await fetch(`/api/clients/${selectedClient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          redirectUris: formData.redirectUris
            .split(",")
            .map((u) => u.trim())
            .filter(Boolean),
          scopes: formData.scopes
            .split(" ")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      })

      if (response.ok) {
        toast.success("OAuth client updated successfully")
        setIsEditOpen(false)
        setSelectedClient(null)
        resetForm()
        fetchClients()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update client")
      }
    } catch (error) {
      toast.error("Failed to update client")
    }
  }

  const handleDelete = async (clientId: string) => {
    if (!confirm("Are you sure you want to delete this OAuth client?")) return

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("OAuth client deleted successfully")
        fetchClients()
      } else {
        toast.error("Failed to delete client")
      }
    } catch (error) {
      toast.error("Failed to delete client")
    }
  }

  const openEditDialog = (client: OAuthClient) => {
    setSelectedClient(client)
    setFormData({
      name: client.name,
      clientId: client.clientId,
      clientSecret: client.clientSecret || "",
      redirectUris: client.redirectUris.join(", "),
      scopes: client.scopes?.join(" ") || "openid profile email",
      disabled: client.disabled,
      skipConsent: client.skipConsent,
      requirePKCE: client.requirePKCE,
      public: client.public,
    })
    setIsEditOpen(true)
  }

  const openViewSecretDialog = (client: OAuthClient) => {
    setSelectedClient(client)
    setIsViewSecretOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      clientId: "",
      clientSecret: "",
      redirectUris: "",
      scopes: "openid profile email",
      disabled: false,
      skipConsent: false,
      requirePKCE: true,
      public: false,
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <PlusIcon className="mr-1 h-4 w-4" />
            Add Client
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create OAuth Client</DialogTitle>
              <DialogDescription>
                Register a new OAuth 2.0 client application.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Application Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="My Application"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input
                    id="clientId"
                    value={formData.clientId}
                    onChange={(e) =>
                      setFormData({ ...formData, clientId: e.target.value })
                    }
                    placeholder="my-app-client"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="clientSecret">Client Secret (optional)</Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    value={formData.clientSecret}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        clientSecret: e.target.value,
                      })
                    }
                    placeholder="Auto-generated if empty"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="redirectUris">
                    Redirect URIs (comma-separated)
                  </Label>
                  <Input
                    id="redirectUris"
                    value={formData.redirectUris}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        redirectUris: e.target.value,
                      })
                    }
                    placeholder="https://example.com/callback"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="scopes">Scopes (space-separated)</Label>
                  <Input
                    id="scopes"
                    value={formData.scopes}
                    onChange={(e) =>
                      setFormData({ ...formData, scopes: e.target.value })
                    }
                    placeholder="openid profile email"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="skipConsent"
                      checked={formData.skipConsent}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          skipConsent: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="skipConsent">Skip Consent Screen</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="requirePKCE"
                      checked={formData.requirePKCE}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          requirePKCE: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="requirePKCE">Require PKCE</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="public"
                      checked={formData.public}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          public: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="public">Public Client</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Client</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Search */}
            <div className="flex items-center gap-4 px-4 lg:px-6">
              <div className="relative max-w-sm flex-1">
                <SearchIcon className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {pagination.total} clients total
              </div>
            </div>

            {/* Table */}
            <div className="px-4 lg:px-6">
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application</TableHead>
                      <TableHead>Client ID</TableHead>
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
                    ) : clients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No OAuth clients found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      clients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                                <KeyIcon className="h-4 w-4 text-amber-500" />
                              </div>
                              <div>
                                <div className="font-medium">{client.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {client.scopes?.slice(0, 3).join(", ")}
                                  {client.scopes?.length > 3 && "..."}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="rounded bg-muted px-2 py-1 text-sm">
                                {client.clientId}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(client.clientId)}
                              >
                                <CopyIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {client.disabled ? (
                                <Badge variant="destructive">
                                  <XCircleIcon className="mr-1 h-3 w-3" />
                                  Disabled
                                </Badge>
                              ) : (
                                <Badge variant="default">
                                  <CheckCircleIcon className="mr-1 h-3 w-3" />
                                  Active
                                </Badge>
                              )}
                              {client.public && (
                                <Badge variant="outline">Public</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(client.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={<Button variant="ghost" size="icon" />}
                              >
                                <MoreVerticalIcon className="h-4 w-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openEditDialog(client)}
                                >
                                  <PencilIcon className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                {client.clientSecret && (
                                  <DropdownMenuItem
                                    onClick={() => openViewSecretDialog(client)}
                                  >
                                    <KeyIcon className="mr-2 h-4 w-4" />
                                    View Secret
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => handleDelete(client.id)}
                                >
                                  <TrashIcon className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
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

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit OAuth Client</DialogTitle>
            <DialogDescription>
              Update the OAuth client configuration.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Application Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-redirectUris">
                  Redirect URIs (comma-separated)
                </Label>
                <Input
                  id="edit-redirectUris"
                  value={formData.redirectUris}
                  onChange={(e) =>
                    setFormData({ ...formData, redirectUris: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-scopes">Scopes (space-separated)</Label>
                <Input
                  id="edit-scopes"
                  value={formData.scopes}
                  onChange={(e) =>
                    setFormData({ ...formData, scopes: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="edit-disabled"
                    checked={formData.disabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, disabled: checked as boolean })
                    }
                  />
                  <Label htmlFor="edit-disabled">Disabled</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="edit-skipConsent"
                    checked={formData.skipConsent}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        skipConsent: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="edit-skipConsent">Skip Consent Screen</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Secret Dialog */}
      <Dialog open={isViewSecretOpen} onOpenChange={setIsViewSecretOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Client Credentials</DialogTitle>
            <DialogDescription>
              Store these credentials securely. The client secret will not be
              shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Client ID</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-muted px-3 py-2 text-sm break-all">
                  {selectedClient?.clientId}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    selectedClient && copyToClipboard(selectedClient.clientId)
                  }
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {selectedClient?.clientSecret && (
              <div className="grid gap-2">
                <Label>Client Secret</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-muted px-3 py-2 text-sm break-all">
                    {selectedClient.clientSecret}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      selectedClient?.clientSecret &&
                      copyToClipboard(selectedClient.clientSecret)
                    }
                  >
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
