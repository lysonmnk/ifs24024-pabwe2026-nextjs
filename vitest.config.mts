import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: [
        "src/features/**/*.{ts,tsx}",
        "src/helpers/**/*.{ts,tsx}",
        "src/hooks/**/*.{ts,tsx}",
        "src/store.ts",
      ],
      exclude: [
        "node_modules/**",
        ".next/**",
        "coverage/**",
        "src/setupTests.ts",
        "src/test-utils.tsx",
        "src/server.ts",
        "src/app/**",
        "**/*.d.ts",
        "**/*.test.ts",
        "**/*.test.tsx",
      ],
      thresholds: {
        lines: 95,
        functions: 90,
        branches: 80,
        statements: 95,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
