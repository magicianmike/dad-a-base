import { defineConfig, devices } from '@playwright/test'

// Not the default 4173, so a preview of another project is never reused by mistake.
const port = 4317

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: `http://localhost:${port}`, trace: 'on-first-retry' },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-webkit', use: { ...devices['iPhone 15'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
  // A build whose API calls MSW answers (`.env.e2e`), so no test reaches the real API.
  webServer: {
    command: `npx vite build --mode e2e --outDir dist-e2e && npx vite preview --outDir dist-e2e --port ${port} --strictPort`,
    port,
    reuseExistingServer: !process.env.CI,
  },
})
