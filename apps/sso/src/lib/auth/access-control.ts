import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  course: ["view", "create", "update", "delete", "enroll"],
  assignment: ["view", "create", "update", "delete", "submit"],
  quiz: [
    "view",
    "create",
    "update",
    "delete",
    "submit",
    "generate",
    "feedback",
  ],
} as const;

export const ac = createAccessControl(statement);

export const roles = {
  "super-admin": ac.newRole({
    ...adminAc.statements,
    course: ["view", "create", "update", "delete", "enroll"],
    assignment: ["view", "create", "update", "delete"],
    quiz: [
      "view",
      "create",
      "update",
      "delete",
      "submit",
      "generate",
      "feedback",
    ],
  }),
  teacher: ac.newRole({
    course: ["view", "create", "update", "delete"],
    assignment: ["view", "create", "update", "delete"],
    quiz: ["view", "create", "update", "delete", "generate"],
  }),
  student: ac.newRole({
    course: ["view", "enroll"],
    quiz: ["view", "submit", "feedback"],
    assignment: ["view", "submit"],
  }),
} as const;

export type Role = keyof typeof roles;

export const getUserClaims = (roleStr: string | null | undefined | unknown) => {
  if (typeof roleStr !== "string")
    return { roles: [] as Role[], permissions: {} as Record<string, string[]> };

  const roleList = roleStr
    .split(",")
    .map((r) => r.trim() as Role)
    .filter((r) => r in roles);

  const permissions: Record<string, string[]> = {};

  for (const role of roleList) {
    const roleObj = roles[role];
    Object.entries(roleObj.statements).forEach(([resource, actions]) => {
      if (!permissions[resource]) permissions[resource] = [];
      permissions[resource].push(...(actions as string[]));
    });
  }

  return {
    roles: roleList,
    permissions,
  };
};

export const adminConfig = {
  ac,
  roles,
};
