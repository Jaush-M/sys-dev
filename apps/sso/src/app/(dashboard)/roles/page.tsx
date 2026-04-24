"use client"

import { Badge } from "@workspace/ui/primitives/badge"
import { useSetBreadcrumbs } from "@workspace/ui/components/breadcrumb-provider"
import {
  CheckIcon,
  MinusIcon,
  ShieldCheckIcon,
  ShieldIcon,
  GraduationCapIcon,
  BookOpenIcon,
} from "lucide-react"
import { roles, statement } from "@/lib/auth/access-control"

// ─── Derive all data from the AC config ────────────────────────────────────

type ResourceKey = keyof typeof statement
type RoleKey = keyof typeof roles

const allResources = Object.keys(statement) as ResourceKey[]
const allRoleKeys = Object.keys(roles) as RoleKey[]

function getActionsForRole(role: RoleKey, resource: ResourceKey): string[] {
  const roleObj = roles[role]
  const stmts = roleObj.statements as Record<string, readonly string[]>
  return (stmts[resource] ?? []) as string[]
}

function hasAction(
  role: RoleKey,
  resource: ResourceKey,
  action: string
): boolean {
  return getActionsForRole(role, resource).includes(action)
}

function countPermissions(role: RoleKey): number {
  return allResources.reduce(
    (sum, res) => sum + getActionsForRole(role, res).length,
    0
  )
}

function totalActions(resource: ResourceKey): number {
  return statement[resource].length
}

// ─── Role display metadata ──────────────────────────────────────────────────

const roleDisplay: Record<
  string,
  {
    label: string
    description: string
    icon: React.ElementType
    accent: string
    badgeBg: string
    badgeText: string
    headerBg: string
  }
> = {
  "super-admin": {
    label: "Super admin",
    description: "Full system access",
    icon: ShieldCheckIcon,
    accent: "var(--color-border-danger)",
    badgeBg: "var(--color-background-danger)",
    badgeText: "var(--color-text-danger)",
    headerBg: "rgba(var(--color-danger-rgb, 220,38,38), 0.04)",
  },
  teacher: {
    label: "Teacher",
    description: "Course management",
    icon: BookOpenIcon,
    accent: "var(--color-border-warning)",
    badgeBg: "var(--color-background-warning)",
    badgeText: "var(--color-text-warning)",
    headerBg: "rgba(var(--color-warning-rgb, 202,138,4), 0.04)",
  },
  student: {
    label: "Student",
    description: "Learning access",
    icon: GraduationCapIcon,
    accent: "var(--color-border-info)",
    badgeBg: "var(--color-background-info)",
    badgeText: "var(--color-text-info)",
    headerBg: "rgba(var(--color-info-rgb, 37,99,235), 0.04)",
  },
}

function getRoleDisplay(role: string) {
  return (
    roleDisplay[role] ?? {
      label: role,
      description: "",
      icon: ShieldIcon,
      accent: "var(--color-border-tertiary)",
      badgeBg: "var(--color-background-secondary)",
      badgeText: "var(--color-text-secondary)",
      headerBg: "transparent",
    }
  )
}

// ─── Subcomponents ──────────────────────────────────────────────────────────

function RoleSummaryCard({ roleKey }: { roleKey: RoleKey }) {
  const display = getRoleDisplay(roleKey)
  const Icon = display.icon
  const count = countPermissions(roleKey)
  const totalPossible = allResources.reduce(
    (s, r) => s + statement[r].length,
    0
  )
  const pct = Math.round((count / totalPossible) * 100)

  return (
    <div
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        borderTop: `3px solid ${display.accent}`,
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "var(--border-radius-md)",
            background: display.badgeBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon style={{ width: 18, height: 18, color: display.accent }} />
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            padding: "3px 8px",
            borderRadius: 20,
            background: display.badgeBg,
            color: display.badgeText,
          }}
        >
          {pct}% access
        </span>
      </div>
      <div>
        <p
          style={{
            margin: 0,
            fontWeight: 500,
            fontSize: 15,
            color: "var(--color-text-primary)",
          }}
        >
          {display.label}
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: 13,
            color: "var(--color-text-secondary)",
          }}
        >
          {display.description}
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background: "var(--color-background-tertiary)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: 2,
              background: display.accent,
            }}
          />
        </div>
        <span
          style={{
            fontSize: 12,
            color: "var(--color-text-tertiary)",
            whiteSpace: "nowrap",
          }}
        >
          {count} / {totalPossible}
        </span>
      </div>
    </div>
  )
}

function PermissionCell({ granted }: { granted: boolean }) {
  if (granted) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "var(--color-background-success)",
          color: "var(--color-text-success)",
        }}
      >
        <CheckIcon style={{ width: 12, height: 12 }} />
      </div>
    )
  }
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 24,
        height: 24,
      }}
    >
      <MinusIcon
        style={{
          width: 12,
          height: 12,
          color: "var(--color-text-tertiary)",
          opacity: 0.4,
        }}
      />
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function PermissionsPage() {
  useSetBreadcrumbs([
    { title: "Home", href: "/" },
    { title: "Permissions", href: "/permissions" },
  ])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-6 py-4 md:py-6">
          <div className="px-4 lg:px-6">
            {/* Page header */}
            <div style={{ marginBottom: "2rem" }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                }}
              >
                Roles & permissions
              </h1>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 14,
                  color: "var(--color-text-secondary)",
                }}
              >
                Overview of role-based access control permissions in the system.
              </p>
            </div>

            {/* Role summary cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 12,
                marginBottom: "2rem",
              }}
            >
              {allRoleKeys.map((role) => (
                <RoleSummaryCard key={role} roleKey={role} />
              ))}
            </div>

            {/* Permissions matrix */}
            <div
              style={{
                background: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "var(--border-radius-lg)",
                overflow: "hidden",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  tableLayout: "fixed",
                }}
              >
                <colgroup>
                  <col style={{ width: "160px" }} />
                  <col style={{ width: "100px" }} />
                  {allRoleKeys.map((r) => (
                    <col key={r} />
                  ))}
                </colgroup>

                {/* Table header */}
                <thead>
                  <tr
                    style={{
                      borderBottom: "0.5px solid var(--color-border-tertiary)",
                    }}
                  >
                    <th
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: 12,
                        fontWeight: 500,
                        color: "var(--color-text-tertiary)",
                        background: "var(--color-background-secondary)",
                      }}
                    >
                      Resource
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: 12,
                        fontWeight: 500,
                        color: "var(--color-text-tertiary)",
                        background: "var(--color-background-secondary)",
                      }}
                    >
                      Action
                    </th>
                    {allRoleKeys.map((role) => {
                      const display = getRoleDisplay(role)
                      return (
                        <th
                          key={role}
                          style={{
                            padding: "12px 16px",
                            textAlign: "center",
                            fontSize: 12,
                            fontWeight: 500,
                            color: display.badgeText,
                            background: display.badgeBg,
                            borderLeft:
                              "0.5px solid var(--color-border-tertiary)",
                          }}
                        >
                          {display.label}
                        </th>
                      )
                    })}
                  </tr>
                </thead>

                <tbody>
                  {allResources.map((resource) => {
                    const actions = statement[resource] as readonly string[]
                    return actions.map((action, actionIdx) => {
                      const isFirstAction = actionIdx === 0
                      const isLastAction = actionIdx === actions.length - 1

                      return (
                        <tr
                          key={`${resource}-${action}`}
                          style={{
                            borderBottom: isLastAction
                              ? "0.5px solid var(--color-border-tertiary)"
                              : "0.5px solid var(--color-border-tertiary)",
                          }}
                        >
                          {/* Resource cell — only shown on first action row */}
                          <td
                            style={{
                              padding: "10px 16px",
                              verticalAlign: "middle",
                              borderBottom: isLastAction
                                ? "1px solid var(--color-border-secondary)"
                                : "0.5px solid var(--color-border-tertiary)",
                            }}
                          >
                            {isFirstAction ? (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: "var(--color-text-primary)",
                                    textTransform: "capitalize",
                                    fontFamily: "var(--font-mono)",
                                  }}
                                >
                                  {resource}
                                </span>
                                <span
                                  style={{
                                    fontSize: 10,
                                    color: "var(--color-text-tertiary)",
                                    background:
                                      "var(--color-background-tertiary)",
                                    padding: "1px 6px",
                                    borderRadius: 10,
                                  }}
                                >
                                  {totalActions(resource)}
                                </span>
                              </div>
                            ) : null}
                          </td>

                          {/* Action cell */}
                          <td
                            style={{
                              padding: "10px 16px",
                              borderBottom: isLastAction
                                ? "1px solid var(--color-border-secondary)"
                                : "0.5px solid var(--color-border-tertiary)",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 12,
                                color: "var(--color-text-secondary)",
                                fontFamily: "var(--font-mono)",
                              }}
                            >
                              {action}
                            </span>
                          </td>

                          {/* Permission cells per role */}
                          {allRoleKeys.map((role) => (
                            <td
                              key={role}
                              style={{
                                padding: "10px 16px",
                                textAlign: "center",
                                borderLeft:
                                  "0.5px solid var(--color-border-tertiary)",
                                borderBottom: isLastAction
                                  ? "1px solid var(--color-border-secondary)"
                                  : "0.5px solid var(--color-border-tertiary)",
                              }}
                            >
                              <PermissionCell
                                granted={hasAction(role, resource, action)}
                              />
                            </td>
                          ))}
                        </tr>
                      )
                    })
                  })}
                </tbody>

                {/* Footer totals row */}
                <tfoot>
                  <tr
                    style={{ background: "var(--color-background-secondary)" }}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 12,
                        fontWeight: 500,
                        color: "var(--color-text-secondary)",
                      }}
                      colSpan={2}
                    >
                      Total permissions granted
                    </td>
                    {allRoleKeys.map((role) => {
                      const display = getRoleDisplay(role)
                      return (
                        <td
                          key={role}
                          style={{
                            padding: "12px 16px",
                            textAlign: "center",
                            borderLeft:
                              "0.5px solid var(--color-border-tertiary)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: display.badgeText,
                            }}
                          >
                            {countPermissions(role)}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
