import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 is a native module. It must stay external to the server
  // bundle so Next does not try to trace and re-bundle the .node binary.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
