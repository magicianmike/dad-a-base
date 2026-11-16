import { screen, waitFor, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { API_URL } from '@/api/client'
import { server } from '@/mocks/node'
import { RECENT_SEARCHES_STORAGE_KEY } from '@/stores/recentSearches'
import { renderPage } from '@/test/renderPage'
import SearchView from './SearchView.vue'

const renderSearch = (path = '/search') => renderPage(SearchView, { path })
const results = () => screen.getAllByRole('link', { name: /^Dog joke/ })
const recent = () => JSON.parse(localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY) ?? '[]')

describe('SearchView', () => {
  it('offers suggested and recent searches when there’s nothing to search', async () => {
    localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(['golf']))
    await renderSearch()
    expect(
      within(screen.getByRole('region', { name: 'Recent searches' })).getByRole('link', {
        name: 'golf',
      }),
    ).toHaveAttribute('href', '/search?q=golf')
    expect(
      within(screen.getByRole('region', { name: 'Try searching for' })).getByRole('link', {
        name: 'dog',
      }),
    ).toHaveAttribute('href', '/search?q=dog')
    await waitFor(() => expect(document.title).toBe('Search'))
  })

  it('searches as you type, once typing pauses, replacing the history entry', async () => {
    const { router } = await renderSearch('/search?page=2')
    const replace = vi.spyOn(router, 'replace')
    const push = vi.spyOn(router, 'push')
    await userEvent.type(screen.getByRole('searchbox'), 'dog')

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Jokes 1–10 of 43' }),
    ).toBeInTheDocument()
    expect(router.currentRoute.value.fullPath).toBe('/search?q=dog')
    expect(replace).toHaveBeenCalledTimes(1)
    expect(push).not.toHaveBeenCalled()
    expect(screen.getByRole('searchbox')).toHaveFocus()
    expect(results()).toHaveLength(10)
    expect(results()[0]).toHaveAttribute('href', '/jokes/dog1')
    await waitFor(() => expect(document.title).toBe('Jokes about “dog”'))
  })

  it('announces how many Jokes were found, and not again on turning a page', async () => {
    const { router } = await renderSearch('/search?q=dog')
    const live = await screen.findByText('43 jokes about “dog”.')
    expect(live).toHaveAttribute('aria-live', 'polite')
    const changes: string[] = []
    new MutationObserver(() => changes.push(live.textContent ?? '')).observe(live, {
      childList: true,
      characterData: true,
      subtree: true,
    })

    await router.push('/search?q=dog&page=2')
    await screen.findByRole('heading', { level: 2, name: 'Jokes 11–20 of 43' })
    expect(changes).toEqual([])

    await router.replace('/search?q=golf')
    await waitFor(() => expect(live).toHaveTextContent('1 joke about “golf”.'))
  })

  it('searches at once on Enter, and remembers the term', async () => {
    const { router } = await renderSearch()
    await userEvent.type(screen.getByRole('searchbox'), 'golf{Enter}')
    expect(router.currentRoute.value.fullPath).toBe('/search?q=golf')
    expect(await screen.findByRole('link', { name: 'Bad at golf? Join the club.' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 2, name: 'Joke 1 of 1' })).toBeInTheDocument()
    expect(recent()).toEqual(['golf'])
  })

  it('shows no results inline, with suggestions, and isn’t an error', async () => {
    await renderSearch('/search?q=xyzzy')
    expect(
      await screen.findByRole('heading', { level: 2, name: 'Nothing on file for “xyzzy”' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Search the archives' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'a random joke' })).toHaveAttribute('href', '/random')
    expect(screen.getByRole('heading', { level: 3, name: 'Try searching for' })).toBeVisible()
    expect(screen.getByText('No jokes about “xyzzy”.')).toBeInTheDocument()
  })

  it('turns pages, remembering the term and moving focus to the results heading', async () => {
    const { router } = await renderSearch('/search?q=dog')
    await screen.findByRole('heading', { level: 2, name: 'Jokes 1–10 of 43' })
    const pages = screen.getByRole('navigation', { name: 'Pages' })
    expect(within(pages).getByRole('link', { name: 'Previous' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )

    await userEvent.click(within(pages).getByRole('link', { name: 'Next' }))

    const heading = await screen.findByRole('heading', { level: 2, name: 'Jokes 11–20 of 43' })
    expect(router.currentRoute.value.fullPath).toBe('/search?q=dog&page=2')
    await waitFor(() => expect(heading).toHaveFocus())
    expect(recent()).toEqual(['dog'])
    await waitFor(() => expect(document.title).toBe('Jokes about “dog”, page 2'))
  })

  it('disables Next on the last page', async () => {
    await renderSearch('/search?q=dog&page=5')
    expect(
      await screen.findByRole('heading', { level: 2, name: 'Jokes 41–43 of 43' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('link', { name: 'Page 1' })).toHaveAttribute('href', '/search?q=dog')
  })

  it.each([
    ['/search?q=dog&page=99', '/search?q=dog&page=5', 'Jokes 41–43 of 43'],
    ['/search?q=dog&page=abc', '/search?q=dog', 'Jokes 1–10 of 43'],
    ['/search?q=dog&page=1', '/search?q=dog', 'Jokes 1–10 of 43'],
    ['/search?q=dog&page=2.4', '/search?q=dog&page=2', 'Jokes 11–20 of 43'],
  ])('replaces %s with the nearest valid page', async (from, to, summary) => {
    const { router } = await renderSearch(from)
    expect(await screen.findByRole('heading', { level: 2, name: summary })).toBeInTheDocument()
    expect(router.currentRoute.value.fullPath).toBe(to)
  })

  it('remembers the term when a Joke is opened', async () => {
    await renderSearch('/search?q=golf')
    await userEvent.click(await screen.findByRole('link', { name: 'Bad at golf? Join the club.' }))
    expect(recent()).toEqual(['golf'])
  })

  it('follows a term changed by a link, and moves focus to its results', async () => {
    const { router } = await renderSearch()
    await userEvent.click(screen.getByRole('link', { name: 'dog' }))
    const heading = await screen.findByRole('heading', { level: 2, name: 'Jokes 1–10 of 43' })
    expect(screen.getByRole('searchbox')).toHaveValue('dog')
    await waitFor(() => expect(heading).toHaveFocus())

    await router.replace('/search')
    await waitFor(() => expect(screen.getByRole('searchbox')).toHaveValue(''))
  })

  it('shows the Error state when the API fails, and recovers on "Try again"', async () => {
    server.use(
      http.get(`${API_URL}/search`, () => new HttpResponse(null, { status: 429 }), { once: true }),
    )
    await renderSearch('/search?q=dog')
    expect(
      await screen.findByRole('heading', { level: 1, name: /Even Dad needs a breather/ }),
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(
      await screen.findByRole('heading', { level: 2, name: 'Jokes 1–10 of 43' }),
    ).toBeInTheDocument()
  })
})
