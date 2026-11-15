import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import pluginStorybook from 'eslint-plugin-storybook'
import pluginVue from 'eslint-plugin-vue'

export default defineConfigWithVueTs(
  {
    ignores: [
      'dist',
      'dist-e2e',
      'coverage',
      'storybook-static',
      'playwright-report',
      'test-results',
      'public',
    ],
  },
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  pluginStorybook.configs['flat/recommended'],
  skipFormatting,
)
