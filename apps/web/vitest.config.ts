import { defineConfig } from "vitest/config";
import path from "node:path";

// Pure helpers only (`lib/*`); React components need a DOM runtime that the
// dashboard does not ship yet.
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname) },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
    globals: false,
    clearMocks: true,
    restoreMocks: true,
  },
});
