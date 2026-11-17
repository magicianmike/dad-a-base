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
  /*
   * Behaviour runs on all three. Checks that don't depend on the browser run once (journal 0013):
   * - `@axe` reads the DOM and computed colours, the same in any engine, so it runs on desktop Chromium;
   * - `@axe-phone` is axe on what only a phone shows, such as the Sections drawer, so it runs on mobile Chrome;
   * - `@reflow` forces a 320px viewport, so mobile Chrome would repeat desktop Chromium's layout exactly. It runs
   *   there and on WebKit, a layout engine of its own.
   */
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] }, grepInvert: /@axe-phone/ },
    { name: 'mobile-webkit', use: { ...devices['iPhone 15'] }, grepInvert: /@axe/ },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
      grepInvert: /@axe(?!-phone)|@reflow/,
    },
  ],
  // A build whose API calls MSW answers (`.env.e2e`), so no test reaches the real API.
  webServer: {
    command: `npx vite build --mode e2e --outDir dist-e2e && npx vite preview --outDir dist-e2e --port ${port} --strictPort`,
    port,
    reuseExistingServer: !process.env.CI,
  },
})
