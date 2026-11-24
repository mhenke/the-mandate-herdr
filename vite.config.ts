import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  base:
    process.env.BASE_URL ??
    (command === "build" && process.env.GITHUB_ACTIONS ? "/the-mandate-herdr/" : "/"),
  plugins: [react()],
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
}));
