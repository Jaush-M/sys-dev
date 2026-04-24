import path from "node:path";
import fs from "node:fs";

import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

function findRootEnv(startDir: string, maxDepth: number = 4): string | null {
  let dir = startDir;
  let depth = 0;

  while (dir !== path.parse(dir).root && maxDepth > depth) {
    const envPath = path.join(dir, ".env");
    if (fs.existsSync(envPath)) {
      return envPath;
    }
    dir = path.dirname(dir);
    depth++;
  }

  return null;
}

export function loadEnv() {
  if (process.env.VERCEL !== "1" && typeof window === "undefined") {
    const envPath = findRootEnv(process.cwd());
    if (envPath) {
      const envConfig = dotenv.config({
        path: envPath,
      });
      dotenvExpand.expand(envConfig);
    }
  }
}
