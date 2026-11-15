import { setup, type Preview } from '@storybook/vue3-vite'
import { createMemoryHistory, createRouter } from 'vue-router'
import '../src/styles/global.css'

// Components link with RouterLink. Stories get a router that goes nowhere.
setup((app) => {
  app.use(
    createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }],
    }),
  )
})

const preview: Preview = {
  parameters: {
    // Accessibility violations fail the story's test, not just the panel.
    a11y: { test: 'error' },
    layout: 'padded',
  },
}

export default preview
