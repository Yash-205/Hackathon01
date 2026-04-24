import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["motion"],
  // Allow turbopack to find modules in the root if needed
  // But usually not required if frontend is self-contained
};

export default nextConfig;
