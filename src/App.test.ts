import { DefaultApolloClient } from '@vue/apollo-composable'
import { createHead } from '@unhead/vue/client'
import { render, screen, waitFor, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createPinia } from 'pinia'
import { createApolloClient } from '@/api/client'
import { jokes } from '@/mocks/fixtures'
import App from './App.vue'
import { focusOnNavigation } from './focusOnNavigation'
import { router } from './router'

focusOnNavigation(router)

async function renderApp(path: string) {
  await router.push(path)
  return render(App, {
    global: {
      plugins: [router, createHead(), createPinia()],
      provide: { [DefaultApolloClient]: createApolloClient() },
    },
  })
}

describe('App', () => {
  it('goes from home to a random joke, with each page’s title and focus on its headline', async () => {
    await renderApp('/')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Local dad says the thing again' }),
    ).toBeInTheDocument()
    await waitFor(() => expect(document.title).toBe('The Dad-a-base'))

    expect(await screen.findByText(jokes[0]!.joke)).toBeInTheDocument()
    await userEvent.click(
      within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', {
        name: 'Random',
      }),
    )

    expect(await screen.findByText(jokes[1]!.joke)).toBeInTheDocument()
    await waitFor(() => expect(document.title).toBe('A random joke · Dad-a-base'))
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveFocus())
  })

  it('has a skip link to the main story, a main navigation and a colophon', async () => {
    await renderApp('/')
    expect(screen.getByRole('link', { name: 'Skip to the main story' })).toHaveAttribute(
      'href',
      '#main',
    )
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(
      within(nav)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['Home', 'Random'])
    expect(
      within(screen.getByRole('navigation', { name: 'Colophon' })).getByRole('link', {
        name: 'Design system',
      }),
    ).toBeInTheDocument()
  })

  it('opens a Joke’s page from the random Joke, from the cache', async () => {
    await renderApp('/random')
    await userEvent.click(await screen.findByRole('link', { name: 'Open this joke' }))
    expect(await screen.findByText(/From the archives/)).toBeInTheDocument()
    expect(router.currentRoute.value.path).toMatch(/^\/jokes\//)
  })

  it('shows a 404 in place for an unknown address', async () => {
    await renderApp('/no/such/page')
    expect(
      await screen.findByRole('heading', { level: 1, name: /Dad went out for milk/ }),
    ).toBeInTheDocument()
    expect(router.currentRoute.value.fullPath).toBe('/no/such/page')
    await waitFor(() => expect(document.title).toBe('Page not found · Dad-a-base'))
  })

  it.each([
    ['/error/429', /Even Dad needs a breather/],
    ['/error/offline', /paper boy/],
    ['/error/999', /Dad went out for milk/],
  ])('shows %s at its own address', async (path, headline) => {
    await renderApp(path)
    expect(await screen.findByRole('heading', { level: 1, name: headline })).toBeInTheDocument()
  })

  it('reloads from a linked Error state’s "Try again"', async () => {
    const reload = vi.fn()
    vi.stubGlobal('location', { ...location, reload })
    await renderApp('/error/500')
    await userEvent.click(await screen.findByRole('button', { name: 'Try again' }))
    expect(reload).toHaveBeenCalledOnce()
    vi.unstubAllGlobals()
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
