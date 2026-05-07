import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Lockfiles under $HOME make auto root detection unreliable; pin Turbopack root to this app.
const configDir =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: configDir,
    resolveAlias: {
      tailwindcss: path.join(configDir, "node_modules/tailwindcss/index.css"),
      "tw-animate-css": path.join(
        configDir,
        "node_modules/tw-animate-css/dist/tw-animate.css",
      ),
      "shadcn/tailwind.css": path.join(
        configDir,
        "node_modules/shadcn/dist/tailwind.css",
      ),
    },
  },
};

export default nextConfig;
