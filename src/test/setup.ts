import '@testing-library/jest-dom/vitest'
import { config } from '@vue/test-utils'
import { resetMocks } from '@/mocks/handlers'
import { server } from '@/mocks/node'

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => {
  server.resetHandlers()
  resetMocks()
  sessionStorage.clear()
  localStorage.clear()
  delete document.documentElement.dataset.theme
})
afterAll(() => server.close())

// Real transitions, not Test Utils' stubs, so a TransitionGroup renders its own list element and reports when a card
// has left. jsdom runs no CSS transitions, so they finish on the next frame.
config.global.stubs = { ...config.global.stubs, transition: false, 'transition-group': false }

// jsdom has no layout, so the router's scrollBehavior has nowhere to scroll.
window.scrollTo = () => {}
