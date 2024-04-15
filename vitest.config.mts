import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        passWithNoTests: false,
        isolate: false,
        globalSetup: ["./tests/global-setup.ts"],
        environment: "node",
        env: {
            DATABASE_URL: "postgresql://postgres:password@localhost:5432/postgres",
        },
    },
} as const);
