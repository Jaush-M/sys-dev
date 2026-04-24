import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

import { env } from "@/env";

export const db: NodePgDatabase<typeof schema> = drizzle(env.DATABASE_URL, {
  schema,
});
