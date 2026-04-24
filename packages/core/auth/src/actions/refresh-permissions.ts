"use server";

export type RefreshPermissionsEnv = {
  OAUTH_PROVIDER_URL: string;
  OAUTH_CLIENT_ID: string;
  OAUTH_CLIENT_SECRET: string;
};

export type RefreshPermissionAuth = {
  api: {
    getSession: (opts: { headers: Headers }) => Promise<{
      user: { id: string; roles?: string[] | null };
    } | null>;
  };
};

export type RefreshPermissionAccount = {
  refreshToken: string | null | undefined;
  accessToken: string | null | undefined;
};

export type RefreshPermissionDb = {
  query: {
    accounts: {
      findFirst: (
        opts: object,
      ) => Promise<RefreshPermissionAccount | undefined>;
    };
  };
  update: (table: any) => {
    set: (values: object) => {
      where: (condition: any) => Promise<unknown>;
    };
  };
};

export type RefreshPermissionSchema = {
  accounts: any;
  users: any;
};

export type RefreshPermissionArgs = {
  headers: Headers;
  env: RefreshPermissionsEnv;
  auth: RefreshPermissionAuth;
  db: RefreshPermissionDb;
  schema: RefreshPermissionSchema;
  providerId: string;
  drizzle: {
    eq: any;
    and: any;
  };
};

export type RefreshPermissionResult =
  | {
      success: true;
      code: "SUCCESS" | "SUCCESS_NO_CHANGE";
      roles: string[];
      permissions: Record<string, string[]>;
    }
  | {
      success: false;
      code: "UNAUTHORIZED" | "NO_REFRESH_TOKEN" | "TOKEN_REFRESH_FAILED";
      message?: string;
    };

export async function refreshPermissionAction({
  headers,
  auth,
  db,
  env,
  schema,
  drizzle: { eq, and },
  providerId,
}: RefreshPermissionArgs): Promise<RefreshPermissionResult> {
  const session = await auth.api.getSession({ headers });
  if (!session?.user?.id) {
    return { success: false, code: "UNAUTHORIZED" };
  }

  const account = await db.query.accounts.findFirst({
    where: and(
      eq(schema.accounts.userId, session.user.id),
      eq(schema.accounts.providerId, providerId),
    ),
  });

  if (!account?.refreshToken) {
    return { success: false, code: "NO_REFRESH_TOKEN" };
  }

  // 1. Try userinfo with the existing access token
  if (account.accessToken) {
    const userInfoRes = await fetch(
      `${env.OAUTH_PROVIDER_URL}/api/auth/oauth2/userinfo`,
      { headers: { Authorization: `Bearer ${account.accessToken}` } },
    );

    if (userInfoRes.ok) {
      const profile = await userInfoRes.json();
      const freshRoles = (profile.roles as string[]) ?? [];
      const freshPermissions =
        (profile.permissions as Record<string, string[]>) ?? {};
      const currentRoles = (session.user as any).roles;
      const rolesChanged =
        JSON.stringify(freshRoles) !== JSON.stringify(currentRoles);

      // Return if roles haven't changed
      if (!rolesChanged) {
        return {
          success: true,
          code: "SUCCESS_NO_CHANGE",
          roles: freshRoles,
          permissions: freshPermissions,
        };
      }
    }
  }

  // 2. Access token is missing, expired or roles have changed, do the full token refresh
  const tokenRes = await fetch(
    `${env.OAUTH_PROVIDER_URL}/api/auth/oauth2/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: account.refreshToken,
        client_id: env.OAUTH_CLIENT_ID,
        client_secret: env.OAUTH_CLIENT_SECRET,
      }),
    },
  );

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    return { success: false, code: "TOKEN_REFRESH_FAILED", message: err };
  }

  const tokens = await tokenRes.json();

  const idTokenPayload = JSON.parse(
    Buffer.from(tokens.id_token.split(".")[1], "base64url").toString(),
  );
  const freshRoles = (idTokenPayload.roles as string[]) ?? [];
  const freshPermissions =
    (idTokenPayload.permissions as Record<string, string[]>) ?? {};

  // 3. Update accounts with new tokens
  await db
    .update(schema.accounts)
    .set({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? account.refreshToken,
      idToken: tokens.id_token,
      accessTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      rolesChanged: false,
    })
    .where(
      and(
        eq(schema.accounts.userId, session.user.id),
        eq(schema.accounts.providerId, providerId),
      ),
    );

  // 4. Update users table if roles changed
  const currentRoles = (session.user as any).roles;
  const rolesChanged =
    JSON.stringify(freshRoles) !== JSON.stringify(currentRoles);

  if (rolesChanged) {
    await db
      .update(schema.users)
      .set({ roles: freshRoles, permissions: freshPermissions })
      .where(eq(schema.users.id, session.user.id));
  }

  return {
    success: true,
    code: "SUCCESS",
    roles: freshRoles,
    permissions: freshPermissions,
  };
}
