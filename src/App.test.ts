import { DefaultApolloClient } from '@vue/apollo-composable'
import { createHead } from '@unhead/vue/client'
import { render, screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createApolloClient } from '@/api/client'
import { jokes } from '@/mocks/fixtures'
import App from './App.vue'
import { router } from './router'

describe('App', () => {
  it('goes from home to a random joke, with each page’s title', async () => {
    await router.push('/')
    render(App, {
      global: {
        plugins: [router, createHead()],
        provide: { [DefaultApolloClient]: createApolloClient() },
      },
    })

    expect(await screen.findByRole('heading', { level: 1, name: 'Dadabase' })).toBeInTheDocument()
    await waitFor(() => expect(document.title).toBe('Dadabase'))

    await userEvent.click(screen.getByRole('link', { name: 'Get a random joke' }))

    expect(await screen.findByText(jokes[0]!.joke)).toBeInTheDocument()
    await waitFor(() => expect(document.title).toBe('A random joke · Dadabase'))
  })
})

describe('scrollBehavior', () => {
  const scroll = router.options.scrollBehavior!
  const route = router.currentRoute.value

  it('restores the saved position on back and forward', () => {
    expect(scroll(route, route, { left: 0, top: 300 })).toEqual({ left: 0, top: 300 })
  })

  it('starts a new page at the top', () => {
    expect(scroll(route, route, null)).toEqual({ top: 0 })
  })
})
