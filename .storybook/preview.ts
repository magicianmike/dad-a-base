import type { Preview } from '@storybook/vue3-vite'
import '../src/styles/global.css'

const preview: Preview = {
  parameters: {
    // Accessibility violations fail the story's test, not just the panel.
    a11y: { test: 'error' },
  },
}

export default preview
