import { DefaultApolloClient } from '@vue/apollo-composable'
import { createHead } from '@unhead/vue/client'
import { render } from '@testing-library/vue'
import { createPinia } from 'pinia'
import { defineComponent, h, type Component } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createApolloClient } from '@/api/client'
import ToastRegion from '@/components/ToastRegion.vue'

/**
 * Renders a page with everything the app gives it (a router, Pinia, a head manager, Apollo) and the toast region,
 * so tests see what the visitor sees and hears.
 */
export async function renderPage(
  page: Component,
  { props = {}, client = createApolloClient(), path = '/' } = {},
) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:any(.*)*', component: { render: () => null } }],
  })
  await router.push(path)
  const Harness = defineComponent({ render: () => [h(page, props), h(ToastRegion)] })
  const utils = render(Harness, {
    global: {
      plugins: [router, createHead(), createPinia()],
      provide: { [DefaultApolloClient]: client },
    },
  })
  return { ...utils, router, client }
}
