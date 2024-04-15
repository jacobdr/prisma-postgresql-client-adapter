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
        reporters: ["default", "junit"],
        coverage: {
            provider: "v8",
            reporter: ["json-summary", "json", "html"],
            reportOnFailure: true,
        },
        outputFile: {
            junit: "./junit-report.xml",
        },
    },
} as const);
