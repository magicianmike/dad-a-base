import '@testing-library/jest-dom/vitest'
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

// jsdom has no layout, so the router's scrollBehavior has nowhere to scroll.
window.scrollTo = () => {}
