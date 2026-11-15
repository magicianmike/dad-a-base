import { setup, type Preview } from '@storybook/vue3-vite'
import { createHead } from '@unhead/vue/client'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import '../src/styles/global.css'

// Components link with RouterLink, use stores and set the page title, so stories get a router that goes nowhere,
// a Pinia and a head manager.
setup((app) => {
  app.use(createPinia())
  app.use(createHead())
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
