import { screen, waitFor, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { JOKE } from '@/api/queries'
import { archive, jokes } from '@/mocks/fixtures'
import { server } from '@/mocks/node'
import { FAVORITES_STORAGE_KEY } from '@/stores/favorites'
import { renderPage } from '@/test/renderPage'
import FavoritesView from './FavoritesView.vue'

const [first, second, third] = jokes as [(typeof jokes)[0], (typeof jokes)[0], (typeof jokes)[0]]

/** Saves Favorites as a visitor would have, newest first. */
function save(...saved: (typeof jokes)[0][]) {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(saved))
}

const removeButtons = () => screen.queryAllByRole('button', { name: 'Remove from favorites' })

describe('FavoritesView', () => {
  it('says there are none yet, how to save one, and where to find one', async () => {
    await renderPage(FavoritesView)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Stuck to the fridge' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Nothing on the fridge yet' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Press Fave on any joke/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Read a random joke' })).toHaveAttribute(
      'href',
      '/random',
    )
    expect(screen.getByRole('link', { name: 'Search the jokes' })).toHaveAttribute(
      'href',
      '/search',
    )
    await waitFor(() => expect(document.title).toBe('Favorites'))
  })

  it('lists the Favorites newest first, each linking to its page, with no API calls', async () => {
    let fetched = 0
    server.events.on('request:start', () => fetched++)
    save(second, first)
    await renderPage(FavoritesView)

    expect(screen.getByRole('heading', { level: 2, name: '2 saved jokes' })).toBeInTheDocument()
    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(items.map((item) => within(item).getByRole('link').getAttribute('href'))).toEqual([
      `/jokes/${second.id}`,
      `/jokes/${first.id}`,
    ])
    expect(removeButtons()).toHaveLength(2)
    expect(fetched).toBe(0)
    server.events.removeAllListeners()
  })

  it('puts the Favorites in the cache, so opening one needs no request', async () => {
    save(first)
    const { client } = await renderPage(FavoritesView)
    expect(client.readQuery({ query: JOKE, variables: { id: first.id } })?.joke).toMatchObject(
      first,
    )
  })

  it('removes a Joke, says so, and moves focus to the next one’s Remove button', async () => {
    save(third, second, first)
    await renderPage(FavoritesView)

    await userEvent.click(removeButtons()[1]!)
    // It falls off the fridge first.
    await waitFor(() => expect(screen.queryByRole('link', { name: second.joke })).toBeNull())
    expect(screen.getByRole('status')).toHaveTextContent('Removed from your favorites.')
    expect(screen.getByRole('heading', { level: 2, name: '2 saved jokes' })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)!)).toEqual([third, first])
    expect(removeButtons()[1]).toHaveFocus()
  })

  it('moves focus to the one before when the last is removed, then to the empty state', async () => {
    save(second, first)
    await renderPage(FavoritesView)

    await userEvent.click(removeButtons()[1]!)
    expect(screen.getByRole('heading', { level: 2, name: '1 saved joke' })).toBeInTheDocument()
    await waitFor(() => expect(removeButtons()).toHaveLength(1))
    expect(removeButtons()[0]).toHaveFocus()

    // The last card falls too, before the empty state takes its place.
    await userEvent.click(removeButtons()[0]!)
    expect(screen.getByRole('heading', { level: 2, name: 'No saved jokes' })).toBeInTheDocument()
    const empty = await screen.findByRole('heading', {
      level: 2,
      name: 'Nothing on the fridge yet',
    })
    await waitFor(() => expect(empty).toHaveFocus())
  })

  it('filters as you type, keeping focus in the box, with the term in the address', async () => {
    save(third, second, first)
    const { router } = await renderPage(FavoritesView, { path: '/favorites' })
    const box = screen.getByRole('searchbox', { name: 'Search your favorites' })
    const replace = vi.spyOn(router, 'replace')

    await userEvent.type(box, 'golf')
    expect(
      await screen.findByRole('heading', { level: 2, name: '1 saved joke about “golf”' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: second.joke })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: first.joke })).toBeNull()
    expect(router.currentRoute.value.fullPath).toBe('/favorites?q=golf')
    expect(replace).toHaveBeenCalled()
    expect(box).toHaveFocus()
    await waitFor(() => expect(document.title).toBe('Favorites about “golf”'))
    await waitFor(() => expect(screen.getByText('1 saved joke about “golf”.')).toBeInTheDocument())
  })

  it('says when no Favorite matches, with a way back and a wider Search', async () => {
    save(first)
    await renderPage(FavoritesView, { path: '/favorites?q=xyzzy' })
    expect(
      screen.getByRole('heading', { level: 2, name: 'Nothing on the fridge about “xyzzy”' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Show all your favorites' })).toHaveAttribute(
      'href',
      '/favorites',
    )
    expect(screen.getByRole('link', { name: 'Search every joke for “xyzzy”' })).toHaveAttribute(
      'href',
      '/search?q=xyzzy',
    )
  })

  it('pages ten at a time, and turning a page moves focus to the heading', async () => {
    save(...archive.slice(0, 25))
    const { router } = await renderPage(FavoritesView, { path: '/favorites' })
    expect(screen.getByRole('heading', { level: 2, name: 'Jokes 1–10 of 25' })).toBeInTheDocument()
    const pages = screen.getByRole('navigation', { name: 'Pages' })
    expect(within(pages).getAllByRole('link', { name: /^Page/ })).toHaveLength(3)

    await userEvent.click(within(pages).getByRole('link', { name: 'Next' }))
    await waitFor(() => expect(router.currentRoute.value.fullPath).toBe('/favorites?page=2'))
    const heading = screen.getByRole('heading', { level: 2, name: 'Jokes 11–20 of 25' })
    await waitFor(() => expect(heading).toHaveFocus())
    expect(screen.getByRole('link', { name: archive[10]!.joke })).toBeInTheDocument()
  })

  it.each([
    ['/favorites?page=9', '/favorites?page=3'],
    ['/favorites?page=abc', '/favorites'],
    ['/favorites?page=1', '/favorites'],
  ])('replaces %s with %s', async (path, canonical) => {
    save(...archive.slice(0, 25))
    const { router } = await renderPage(FavoritesView, { path })
    await waitFor(() => expect(router.currentRoute.value.fullPath).toBe(canonical))
  })

  it('goes back a page when the last Joke on the last page is removed', async () => {
    save(...archive.slice(0, 11))
    const { router } = await renderPage(FavoritesView, { path: '/favorites?page=2' })
    await userEvent.click(screen.getByRole('button', { name: 'Remove from favorites' }))

    await waitFor(() => expect(router.currentRoute.value.fullPath).toBe('/favorites'))
    const heading = await screen.findByRole('heading', { level: 2, name: '10 saved jokes' })
    await waitFor(() => expect(heading).toHaveFocus())
  })

  it('adds a Joke saved in another tab to the top', async () => {
    save(first)
    await renderPage(FavoritesView)
    const saved = JSON.stringify([third, first])
    localStorage.setItem(FAVORITES_STORAGE_KEY, saved)
    dispatchEvent(new StorageEvent('storage', { key: FAVORITES_STORAGE_KEY, newValue: saved }))

    expect(await screen.findByRole('heading', { level: 2, name: '2 saved jokes' })).toBeVisible()
    expect(
      within(screen.getAllByRole('listitem')[0]!).getByRole('link', { name: third.joke }),
    ).toBeInTheDocument()
  })
})
