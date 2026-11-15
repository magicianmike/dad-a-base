import { DefaultApolloClient } from '@vue/apollo-composable'
import { createHead } from '@unhead/vue/client'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { createApolloClient } from './api/client'
import { router } from './router'
import './styles/global.css'

async function start() {
  // Builds for Playwright (`--mode e2e`) answer API calls from MSW instead of the real API.
  if (import.meta.env.VITE_API_MOCKS === 'true') {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledFrame: 'bypass', quiet: true })
  }

  createApp(App)
    .provide(DefaultApolloClient, createApolloClient())
    .use(createPinia())
    .use(createHead())
    .use(router)
    .mount('#app')
}

void start()
