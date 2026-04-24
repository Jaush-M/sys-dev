import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { genericOAuth, openAPI } from "better-auth/plugins"
import { env } from "@/env"
import { oauthAutoRefresh } from "@workspace/auth/plugins/oauth-auto-refresh"

import { db } from "../db"
import * as schema from "../db/schema"

export const auth = betterAuth({
  baseURL: env.NEXT_PUBLIC_APP_URL || "http://localhost:3002",
  secret: env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: true,
    transaction: true,
  }),

  user: {
    additionalFields: {
      roles: {
        type: "json",
        required: false,
      },
      permissions: {
        type: "json",
        required: false,
      },
    },
  },

  account: {
    encryptOAuthTokens: true,
  },

  plugins: [
    openAPI(),
    oauthAutoRefresh(env),
    genericOAuth({
      config: [
        {
          providerId: "login",
          discoveryUrl: `${env.OAUTH_PROVIDER_URL}/api/auth/.well-known/openid-configuration`,
          clientId: env.OAUTH_CLIENT_ID,
          clientSecret: env.OAUTH_CLIENT_SECRET,
          pkce: true,
          requireIssuerValidation: true,

          scopes: ["openid", "email", "profile", "offline_access"],
          accessType: "offline",

          overrideUserInfo: true,
          mapProfileToUser: (profile) => ({
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            roles: profile.roles ?? [],
            permissions: profile.permissions ?? {},
          }),
        },
      ],
    }),
    nextCookies(),
  ],
  advanced: {
    cookiePrefix: "sms",
    defaultCookieAttributes: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    },
  },
})

export type Session = typeof auth.$Infer.Session
