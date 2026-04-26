import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin, jwt, openAPI } from "better-auth/plugins"
import { oauthProvider } from "@better-auth/oauth-provider"

import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { nextCookies } from "better-auth/next-js"
import { adminConfig, getUserClaims } from "./access-control"

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET!,

  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: true,
    transaction: true,
  }),

  emailAndPassword: {
    enabled: true,
  },

  disabledPaths: ["/token"],

  plugins: [
    admin({
      ...adminConfig,
      adminRoles: ["super-admin"],
    }),
    jwt(),
    oauthProvider({
      loginPage: "/login",
      consentPage: "/consent",

      accessTokenExpiresIn: 60 * 15,
      refreshTokenExpiresIn: 60 * 60 * 24 * 30,

      cachedTrustedClients: new Set([
        "Student Management System",
        "Learning Management System",
      ]),

      customIdTokenClaims: ({ user }) => {
        const roleStr = (user as any).role ?? ""
        const { roles, permissions } = getUserClaims(roleStr)
        return { roles, permissions }
      },

      customUserInfoClaims: ({ user }) => {
        const roleStr = (user as any).role ?? ""
        const { roles, permissions } = getUserClaims(roleStr)
        return { roles, permissions }
      },

      advertisedMetadata: {
        claims_supported: ["roles", "permissions"],
      },

      silenceWarnings: {
        oauthAuthServerConfig: true,
      },
    }),
    openAPI(),
    nextCookies(),
  ],

  advanced: {
    cookiePrefix: "sso",
    defaultCookieAttributes: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    },
  },
})

export type Session = typeof auth.$Infer.Session
