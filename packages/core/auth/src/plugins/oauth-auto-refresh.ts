import { logger, type BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import { decryptOAuthToken, setTokenUtil } from "better-auth/oauth2";
import { decodeJwt } from "jose";

// Simple in-memory lock to prevent concurrent token refresh for the same user.
// Replace with a distributed lock (e.g. Redis) in multi-instance deployments.
const refreshLocks = new Set<string>();

interface OAuthAutoRefreshOptions {
  OAUTH_PROVIDER_URL: string;
  OAUTH_CLIENT_ID: string;
  OAUTH_CLIENT_SECRET: string;
}

interface AccountRecord {
  accessToken?: string;
  accessTokenExpiresAt?: Date;
  refreshToken?: string;
  idToken?: string;
  roleChanged?: boolean;
}

interface IdTokenPayload {
  roles?: string[];
  permissions?: Record<string, string[]>;
}

/** Order-insensitive comparison of two string arrays. */
function rolesChanged(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return true;
  const setB = new Set(b);
  return a.some((role) => !setB.has(role));
}

export const oauthAutoRefresh = ({
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_PROVIDER_URL,
}: OAuthAutoRefreshOptions): BetterAuthPlugin => {
  return {
    id: "oauth-auto-refresh",
    schema: {
      account: {
        fields: {
          roleChanged: {
            type: "boolean",
            required: false,
            defaultValue: false,
          },
        },
      },
    },
    hooks: {
      before: [
        {
          matcher: (ctx) => ctx.path === "/get-session",
          handler: createAuthMiddleware(async (ctx) => {
            // ── 1. Resolve session ────────────────────────────────────────────
            const sessionCtx = await getSessionFromCtx(ctx);
            if (!sessionCtx?.user) {
              logger.debug("[oauth-auto-refresh] No session user");
              return;
            }

            const userId = sessionCtx.user.id;

            // ── 2. Prevent concurrent refreshes for the same user ─────────────
            if (refreshLocks.has(userId)) {
              logger.debug(
                `[oauth-auto-refresh] Refresh already in progress for user ${userId}`,
              );
              return;
            }

            // ── 3. Load account record ────────────────────────────────────────
            const account = await ctx.context.adapter.findOne<AccountRecord>({
              model: "account",
              where: [
                { field: "userId", value: userId, connector: "AND" },
                { field: "providerId", value: "login", connector: "AND" },
              ],
            });

            // ── 4. Resolve refresh token (decrypt if configured) ──────────────
            const refreshToken = account?.refreshToken
              ? ctx.context.options.account?.encryptOAuthTokens
                ? await decryptOAuthToken(account.refreshToken, ctx.context)
                : account.refreshToken
              : null;

            if (!refreshToken) {
              logger.debug("[oauth-auto-refresh] No refresh token available");
              return;
            }

            // ── 5. Decide whether a refresh is needed ─────────────────────────
            const expiresAt = account?.accessTokenExpiresAt?.getTime() ?? 0;
            const tokenExpired = expiresAt <= Date.now();
            const pendingRoleChange = account?.roleChanged === true;

            if (!tokenExpired && !pendingRoleChange) {
              logger.debug(
                "[oauth-auto-refresh] Token valid and no role change pending — skipping",
              );
              return;
            }

            // ── 6. Acquire lock and refresh ───────────────────────────────────
            refreshLocks.add(userId);
            try {
              const tokenRes = await fetch(
                `${OAUTH_PROVIDER_URL}/api/auth/oauth2/token`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                  body: new URLSearchParams({
                    grant_type: "refresh_token",
                    refresh_token: refreshToken,
                    client_id: OAUTH_CLIENT_ID,
                    client_secret: OAUTH_CLIENT_SECRET,
                  }),
                },
              );

              if (!tokenRes.ok) {
                const error = await tokenRes.text().catch(() => "<unreadable>");
                logger.error(
                  "[oauth-auto-refresh] Token refresh failed",
                  JSON.stringify({ client_id: OAUTH_CLIENT_ID, error }),
                );
                return;
              }

              // ── 7. Parse response safely ──────────────────────────────────
              let tokens: {
                access_token: string;
                refresh_token: string;
                id_token: string;
                expires_in: number;
              };
              let idTokenPayload: IdTokenPayload;

              try {
                tokens = await tokenRes.json();
                idTokenPayload = decodeJwt(tokens.id_token) as IdTokenPayload;
              } catch (parseErr) {
                logger.error(
                  "[oauth-auto-refresh] Failed to parse token response or JWT payload",
                  parseErr,
                );
                return;
              }

              const freshRoles = idTokenPayload.roles ?? [];
              const freshPermissions = idTokenPayload.permissions ?? {};

              // ── 8. Persist refreshed tokens ───────────────────────────────
              await ctx.context.adapter.update({
                model: "account",
                update: {
                  accessToken:
                    (await setTokenUtil(tokens.access_token, ctx.context)) ??
                    account?.accessToken,
                  refreshToken:
                    (await setTokenUtil(tokens.refresh_token, ctx.context)) ??
                    account?.refreshToken,
                  idToken: tokens.id_token,
                  accessTokenExpiresAt: new Date(
                    Date.now() + tokens.expires_in * 1000,
                  ),
                  roleChanged: false,
                },
                where: [
                  { field: "userId", value: userId, connector: "AND" },
                  { field: "providerId", value: "login", connector: "AND" },
                ],
              });

              // ── 9. Sync roles/permissions to the user record if changed ───
              const currentRoles: string[] = sessionCtx.user.roles ?? [];

              if (rolesChanged(freshRoles, currentRoles)) {
                await ctx.context.adapter.update({
                  model: "user",
                  update: {
                    roles: freshRoles,
                    permissions: freshPermissions,
                  },
                  where: [{ field: "id", value: userId }],
                });

                logger.debug(
                  `[oauth-auto-refresh] Roles updated for user ${userId}`,
                  { from: currentRoles, to: freshRoles },
                );
              }
            } finally {
              refreshLocks.delete(userId);
            }

            return;
          }),
        },
      ],
    },
  };
};
