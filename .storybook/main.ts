import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts'],
  core: { disableTelemetry: true },
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: { name: '@storybook/vue3-vite', options: { docgen: 'vue-component-meta' } },
  // The app's Open Graph image belongs to the app's build, which has an index.html to tag. Storybook's has none.
  viteFinal: (vite) => ({
    ...vite,
    plugins: vite.plugins
      ?.flat(2)
      .filter((plugin) => !(plugin && 'name' in plugin && plugin.name === 'dadabase:og-image')),
  }),
}

export default config
