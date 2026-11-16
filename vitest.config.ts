import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default defineConfig((env) =>
  mergeConfig(
    viteConfig(env),
    defineConfig({
      test: {
        coverage: {
          provider: 'v8',
          include: ['src/**/*.{ts,vue}'],
          exclude: [
            'src/**/*.stories.ts',
            'src/**/*.test.ts',
            'src/mocks/**',
            'src/test/**',
            'src/main.ts',
          ],
          thresholds: { lines: 90, branches: 90, functions: 90, statements: 90 },
        },
        projects: [
          {
            extends: true,
            test: {
              name: 'unit',
              environment: 'jsdom',
              // Vitest empties CSS by default, even `?raw` imports. The token files are read as data.
              css: { include: [/src\/styles\/tokens\/.+\.css/] },
              globals: true,
              include: ['src/**/*.test.ts', 'build/**/*.test.ts'],
              setupFiles: ['src/test/setup.ts'],
            },
          },
          {
            extends: true,
            test: {
              name: 'smoke',
              environment: 'node',
              globals: true,
              include: ['src/**/*.smoke.ts'],
            },
          },
          {
            extends: true,
            plugins: [
              storybookTest({ configDir: fileURLToPath(new URL('./.storybook', import.meta.url)) }),
            ],
            // On a cold cache, Vite finds these late and reloads mid-run, failing the run (as in CI). Pre-bundle them.
            optimizeDeps: { include: ['vue', 'vue-router', 'pinia', '@unhead/vue/client', 'zod'] },
            test: {
              name: 'storybook',
              browser: {
                enabled: true,
                headless: true,
                provider: playwright(),
                instances: [{ browser: 'chromium' }],
              },
            },
          },
        ],
      },
    }),
  ),
)
