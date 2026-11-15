import { screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { API_URL } from '@/api/client'
import { jokes } from '@/mocks/fixtures'
import { server } from '@/mocks/node'
import { FAVORITES_STORAGE_KEY } from '@/stores/favorites'
import { renderPage } from '@/test/renderPage'
import JokeView from './JokeView.vue'

const joke = jokes[0]!

afterEach(() => vi.unstubAllGlobals())

describe('JokeView', () => {
  it('shows the Joke, titled by its opening words', async () => {
    await renderPage(JokeView, { props: { id: joke.id } })
    expect(await screen.findByText(joke.joke)).toBeInTheDocument()
    expect(
      screen.getByText(`Joke #${joke.id}. Reprinted with permission of every dad, everywhere.`),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(document.title).toBe('Why was the big cat disqualified from the race? Because…'),
    )
  })

  it('titles a short Joke with all of it', async () => {
    await renderPage(JokeView, { props: { id: 'BI699EY08Ed' } })
    await waitFor(() => expect(document.title).toBe('Bad at golf? Join the club.'))
  })

  it('copies the Joke, says so, and resets the label', async () => {
    const writeText = vi.fn(async () => {})
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })
    await renderPage(JokeView, { props: { id: joke.id } })
    await userEvent.click(await screen.findByRole('button', { name: 'Copy' }))

    expect(writeText).toHaveBeenCalledWith(joke.joke)
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Copied the joke.')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument(), {
      timeout: 2500,
    })
  })

  it('selects the Joke and says how to copy it when the clipboard is denied', async () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      platform: 'MacIntel',
      clipboard: { writeText: async () => Promise.reject(new Error('denied')) },
    })
    await renderPage(JokeView, { props: { id: joke.id } })
    await userEvent.click(await screen.findByRole('button', { name: 'Copy' }))

    await waitFor(() => expect(getSelection()?.toString().trim()).toBe(joke.joke))
    expect(screen.getByRole('status')).toHaveTextContent('press ⌘C to copy it')
  })

  it('copies the link to share it where there’s no share sheet', async () => {
    const writeText = vi.fn(async () => {})
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })
    await renderPage(JokeView, { props: { id: joke.id } })
    await userEvent.click(await screen.findByRole('button', { name: 'Share' }))

    expect(writeText).toHaveBeenCalledWith(`${location.origin}/jokes/${joke.id}`)
    expect(screen.getByRole('status')).toHaveTextContent('Copied the link to this joke.')
  })

  it('says when it can neither share nor copy the link', async () => {
    vi.stubGlobal('navigator', { ...navigator, clipboard: undefined })
    await renderPage(JokeView, { props: { id: joke.id } })
    await userEvent.click(await screen.findByRole('button', { name: 'Share' }))
    expect(await screen.findByRole('status')).toHaveTextContent("Couldn't share or copy the link.")
  })

  it('stays quiet when the share sheet is closed', async () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      share: async () => Promise.reject(new DOMException('', 'AbortError')),
    })
    await renderPage(JokeView, { props: { id: joke.id } })
    await userEvent.click(await screen.findByRole('button', { name: 'Share' }))
    // TransitionGroup leaves a comment node, so check the text, not the children.
    expect(screen.getByRole('status')).toHaveTextContent(/^$/)
  })

  it('saves to and removes from Favorites, saying which', async () => {
    await renderPage(JokeView, { props: { id: joke.id } })
    const favorite = await screen.findByRole('button', { name: 'Favorite' })
    expect(favorite).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(favorite)
    expect(favorite).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('Saved to your favorites.')
    await waitFor(() => expect(localStorage.getItem(FAVORITES_STORAGE_KEY)).toContain(joke.id))

    await userEvent.click(favorite)
    expect(favorite).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('status')).toHaveTextContent('Removed from your favorites.')
  })

  it('shows the 404 for a Joke that doesn’t exist', async () => {
    await renderPage(JokeView, { props: { id: 'nope' } })
    expect(
      await screen.findByRole('heading', { level: 1, name: /Dad went out for milk/ }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
  })

  it('recovers from a failure on "Try again"', async () => {
    server.use(
      http.get(`${API_URL}/j/:id`, () => new HttpResponse(null, { status: 500 }), { once: true }),
    )
    await renderPage(JokeView, { props: { id: joke.id } })
    await userEvent.click(await screen.findByRole('button', { name: 'Try again' }))
    expect(await screen.findByText(joke.joke)).toBeInTheDocument()
  })
})
