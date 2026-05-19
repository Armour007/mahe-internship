import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 2 * 60 * 1000,
  expect: { timeout: 30 * 1000 },
  fullyParallel: false,
  reporter: [['list'], ['html', { outputFolder: 'e2e-report' }]],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
  use: {
    baseURL: 'http://localhost:3000/vector-hq/',
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 30 * 1000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
});
