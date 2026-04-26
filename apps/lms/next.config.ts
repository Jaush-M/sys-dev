import type { NextConfig } from "next";

import "./src/env";

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
};

export default nextConfig;
