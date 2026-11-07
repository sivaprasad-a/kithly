import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/**
 * End-to-end tests run against an isolated dev server on port 3100 that uses the
 * in-memory store (MONGODB_URI is blanked), so they never touch your real data.
 * First run: `npx playwright install chromium`.
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    launchOptions: process.env.PW_CHROME_PATH ? { executablePath: process.env.PW_CHROME_PATH } : {},
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      MONGODB_URI: "",
      BETTER_AUTH_SECRET: "e2e-only-secret-not-for-real-use-123456",
      BETTER_AUTH_URL: `http://localhost:${PORT}`,
      GOOGLE_GENERATIVE_AI_API_KEY: "",
      ANTHROPIC_API_KEY: "",
    },
  },
});
