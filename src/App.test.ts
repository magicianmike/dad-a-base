import { DefaultApolloClient } from '@vue/apollo-composable'
import { createHead } from '@unhead/vue/client'
import { render, screen, waitFor, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createPinia } from 'pinia'
import { createApolloClient } from '@/api/client'
import { jokes } from '@/mocks/fixtures'
import { server } from '@/mocks/node'
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

  it('searches from home, with focus on the search page’s headline and the term kept', async () => {
    await renderApp('/')
    await userEvent.type(await screen.findByRole('searchbox', { name: 'Search the jokes' }), 'golf')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))

    expect(await screen.findByRole('link', { name: 'Bad at golf? Join the club.' })).toBeVisible()
    expect(router.currentRoute.value.fullPath).toBe('/search?q=golf')
    expect(screen.getByRole('heading', { level: 1, name: 'Search the archives' })).toHaveFocus()
    expect(screen.getByRole('searchbox')).toHaveValue('golf')
  })

  it('keeps focus in the search box while typing, though the address changes', async () => {
    await renderApp('/search')
    const box = await screen.findByRole('searchbox')
    await userEvent.type(box, 'dog')
    await waitFor(() => expect(router.currentRoute.value.fullPath).toBe('/search?q=dog'))
    expect(await screen.findByRole('heading', { name: 'Jokes 1–10 of 43' })).toBeInTheDocument()
    expect(box).toHaveFocus()
  })

  it('opens a Search result from the cache', async () => {
    await renderApp('/search?q=golf')
    await userEvent.click(await screen.findByRole('link', { name: 'Bad at golf? Join the club.' }))
    expect(await screen.findByText(/From the archives/)).toBeInTheDocument()
    expect(router.currentRoute.value.path).toBe('/jokes/BI699EY08Ed')
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
    ).toEqual(['Home', 'Search', 'Random', 'Favorites', 'About'])
    expect(
      within(screen.getByRole('navigation', { name: 'Colophon' }))
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['Case study', 'Design system', 'Storybook'])
  })

  it('opens a Joke’s page from the random Joke, from the cache', async () => {
    await renderApp('/random')
    await userEvent.click(within(await screen.findByRole('figure')).getByRole('link'))
    expect(await screen.findByText(/From the archives/)).toBeInTheDocument()
    expect(router.currentRoute.value.path).toMatch(/^\/jokes\//)
  })

  it('saves the Joke of the moment, shows it on home and Favorites, and opens it from the cache', async () => {
    await renderApp('/')
    const joke = jokes[0]!
    await screen.findByText(joke.joke)
    expect(screen.queryByRole('region', { name: 'From your fridge' })).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Favorite' }))
    const peek = await screen.findByRole('region', { name: 'From your fridge' })
    expect(within(peek).getByRole('link', { name: joke.joke })).toBeInTheDocument()

    await userEvent.click(within(peek).getByRole('link', { name: 'Go to your favorites' }))
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Stuck to the fridge' }),
    ).toHaveFocus()
    expect(screen.getByRole('heading', { level: 2, name: '1 saved joke' })).toBeInTheDocument()

    let fetched = 0
    server.events.on('request:start', () => fetched++)
    await userEvent.click(within(screen.getByRole('list')).getByRole('link', { name: joke.joke }))
    expect(await screen.findByText(/From the archives/)).toBeInTheDocument()
    expect(fetched).toBe(0)
    server.events.removeAllListeners()
  })

  it('gives the Case Study a slim header: the Masthead and a way back, with no main navigation', async () => {
    await renderApp('/case-study')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'How the Dad-a-base was built' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Main' })).toBeNull()
    expect(screen.getByRole('link', { name: 'The Dad-a-base' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: /Back to the Dad-a-base/ }))
    await waitFor(() => expect(router.currentRoute.value.path).toBe('/'))
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  })

  describe('keyboard shortcuts', () => {
    it('/ focuses the search box on a page with one', async () => {
      await renderApp('/')
      const box = await screen.findByRole('searchbox', { name: 'Search the jokes' })
      await userEvent.keyboard('/')
      expect(box).toHaveFocus()
      expect(box).toHaveValue('')
      expect(router.currentRoute.value.path).toBe('/')
    })

    it('/ goes to Search from a page without one, ready to type', async () => {
      await renderApp('/random')
      await screen.findByText(jokes[0]!.joke)
      await userEvent.keyboard('/')
      await waitFor(() => expect(router.currentRoute.value.path).toBe('/search'))
      await waitFor(() => expect(screen.getByRole('searchbox')).toHaveFocus())
    })

    it('r shows another Joke where there is one, without changing the address', async () => {
      await renderApp('/random')
      await screen.findByText(jokes[0]!.joke)
      await userEvent.keyboard('r')
      expect(await screen.findByText(jokes[1]!.joke)).toBeInTheDocument()
      expect(router.currentRoute.value.path).toBe('/random')
    })

    it('r goes to Random from anywhere else', async () => {
      await renderApp(`/jokes/${jokes[2]!.id}`)
      await screen.findByText(jokes[2]!.joke)
      await userEvent.keyboard('r')
      await waitFor(() => expect(router.currentRoute.value.path).toBe('/random'))
      expect(
        await screen.findByRole('heading', { level: 1, name: 'A random joke' }),
      ).toBeInTheDocument()
    })

    it('r is just a letter in the search box', async () => {
      await renderApp('/search')
      const box = await screen.findByRole('searchbox')
      await userEvent.type(box, 'r')
      expect(box).toHaveValue('r')
      expect(router.currentRoute.value.path).toBe('/search')
    })

    it('? lists them, and they can be turned off there, and opened again from the footer', async () => {
      await renderApp('/random')
      await screen.findByText(jokes[0]!.joke)
      await userEvent.keyboard('?')
      const list = await screen.findByRole('dialog', { name: 'Keyboard shortcuts' })
      const toggle = within(list).getByRole('checkbox', { name: 'Use these shortcuts' })
      expect(toggle).toBeChecked()

      await userEvent.click(toggle)
      expect(toggle).not.toBeChecked()
      await userEvent.click(within(list).getByRole('button', { name: 'Close' }))
      expect(list).not.toHaveAttribute('open')

      await userEvent.keyboard('r?')
      expect(screen.queryByText(jokes[1]!.joke)).toBeNull()
      expect(list).not.toHaveAttribute('open')
      expect(localStorage.getItem('dadabase:shortcuts')).toBe('off')

      await userEvent.click(screen.getByRole('button', { name: 'Keyboard shortcuts' }))
      expect(list).toHaveAttribute('open')
    })
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
    expect(scroll({ ...route, path: '/random' }, { ...route, path: '/' }, null)).toEqual({ top: 0 })
  })

  it('stays put for a new query on the same page, such as typing a Search', () => {
    expect(scroll({ ...route, path: '/search' }, { ...route, path: '/search' }, null)).toBe(false)
  })
})
