import { auth } from "@/lib/auth";
import { env } from "@/env";

async function seedClients() {
  console.log("🌱 Seeding OAuth clients...");

  // 1. Create the admin user
  const admin = await auth.api.createUser({
    body: {
      email: env.ADMIN_USER_EMAIL,
      password: env.ADMIN_USER_PASSWORD,
      name: "Super Admin",
      role: "super-admin",
    },
  });

  if (!admin) {
    throw new Error("[seed-oauth-clients]: admin could not be created.");
  }

  const adminSignInResponse = await auth.api.signInEmail({
    body: {
      email: env.ADMIN_USER_EMAIL,
      password: env.ADMIN_USER_PASSWORD,
    },
    asResponse: true,
  });

  const cookie = adminSignInResponse.headers.get("set-cookie")!;

  // 4. Create OAuth clients
  const lmsClient = await auth.api.adminCreateOAuthClient({
    headers: new Headers({ cookie }),
    body: {
      client_name: "Learning Management System",
      redirect_uris: ["http://localhost:3001/api/auth/oauth2/callback/login"],
      skip_consent: true,
    },
  });

  const smsClient = await auth.api.adminCreateOAuthClient({
    headers: new Headers({ cookie }),
    body: {
      client_name: "Student Management System",
      redirect_uris: ["http://localhost:3002/api/auth/oauth2/callback/login"],
      skip_consent: true,
      enable_end_session: true,
    },
  });

  console.log("✅ LMS:", {
    client_id: lmsClient.client_id,
    client_secret: lmsClient.client_secret,
  });
  console.log("✅ SMS:", {
    client_id: smsClient.client_id,
    client_secret: smsClient.client_secret,
  });
}

seedClients()
  .then(() => process.exit(0))
  .catch(console.error);
