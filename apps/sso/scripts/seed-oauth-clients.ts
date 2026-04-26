import { auth } from "@/lib/auth"
import { env } from "@/env"
import { updateEnvFile } from "./updateEnv.js"

async function seedClients() {
  console.log("🌱 Seeding OAuth clients...")

  // 1. Create the admin user
  const admin = await auth.api.createUser({
    body: {
      email: env.ADMIN_USER_EMAIL,
      password: env.ADMIN_USER_PASSWORD,
      name: "Super Admin",
      role: "super-admin",
    },
  })

  if (!admin) {
    throw new Error("[seed-oauth-clients]: admin could not be created.")
  }

  const adminSignInResponse = await auth.api.signInEmail({
    body: {
      email: env.ADMIN_USER_EMAIL,
      password: env.ADMIN_USER_PASSWORD,
    },
    asResponse: true,
  })

  const cookie = adminSignInResponse.headers.get("set-cookie")!

  // 4. Create OAuth clients
  const lmsClient = await auth.api.adminCreateOAuthClient({
    headers: new Headers({ cookie }),
    body: {
      client_name: "Learning Management System",
      redirect_uris: [
        `${env.NEXT_PUBLIC_LMS_URL}/api/auth/oauth2/callback/login`,
      ],
      skip_consent: true,
      backchannel_logout_uri: `${env.NEXT_PUBLIC_LMS_URL}/api/auth/backchannel-logout`,
      backchannel_logout_session_required: true,
    },
  })

  const smsClient = await auth.api.adminCreateOAuthClient({
    headers: new Headers({ cookie }),
    body: {
      client_name: "Student Management System",
      redirect_uris: [
        `${env.NEXT_PUBLIC_SMS_URL}/api/auth/oauth2/callback/login`,
      ],
      skip_consent: true,
      enable_end_session: true,
      backchannel_logout_uri: `${env.NEXT_PUBLIC_SMS_URL}/api/auth/backchannel-logout`,
      backchannel_logout_session_required: true,
    },
  })

  await updateEnvFile("../lms/.env", {
    OAUTH_CLIENT_ID: lmsClient.client_id,
    OAUTH_CLIENT_SECRET: lmsClient.client_secret,
  })

  await updateEnvFile("../sms/.env", {
    OAUTH_CLIENT_ID: smsClient.client_id,
    OAUTH_CLIENT_SECRET: smsClient.client_secret,
  })

  console.log("✅ LMS:", {
    client_id: lmsClient.client_id,
    client_secret: lmsClient.client_secret,
  })
  console.log("✅ SMS:", {
    client_id: smsClient.client_id,
    client_secret: smsClient.client_secret,
  })
}

seedClients()
  .then(() => process.exit(0))
  .catch(console.error)
