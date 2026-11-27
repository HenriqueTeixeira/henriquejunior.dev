import { defineConfig, devices } from "@playwright/test";

// Os testes rodam contra dist/ (gerado por "npm run build:site") servido com os cabeçalhos do _headers.
// PW_CANAL=chrome usa o Chrome instalado na máquina, quando o download do Chromium não for possível.
const canal = process.env.PW_CANAL;

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: "http://localhost:4173",
    trace: "retain-on-failure",
    ...(canal ? { channel: canal } : {}),
  },
  projects: [
    { name: "celular", use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true } },
    { name: "tablet", use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: "node scripts/servir.mjs 4173",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
});
