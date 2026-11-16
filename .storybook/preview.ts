import { setup, type Preview } from '@storybook/vue3-vite'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { createHead } from '@unhead/vue/client'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createApolloClient } from '../src/api/client'
import '../src/styles/global.css'

// Components link with RouterLink, use stores, set the page title and write to Apollo's cache, so stories get a
// router that goes nowhere, a Pinia, a head manager and an Apollo client.
setup((app) => {
  app.use(createPinia())
  app.use(createHead())
  app.provide(DefaultApolloClient, createApolloClient())
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
