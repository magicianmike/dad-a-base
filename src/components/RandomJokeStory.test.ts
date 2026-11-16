import { screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { API_URL } from '@/api/client'
import { jokes } from '@/mocks/fixtures'
import { server } from '@/mocks/node'
import { renderPage } from '@/test/renderPage'
import RandomJokeStory from './RandomJokeStory.vue'

const props = { kicker: 'Hot off the press', headline: 'A random joke' }

describe('RandomJokeStory', () => {
  it('shows a Joke, links to its page, and shows another one on request', async () => {
    await renderPage(RandomJokeStory, { props })
    expect(await screen.findByText(jokes[0]!.joke)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: jokes[0]!.joke })).toHaveAttribute(
      'href',
      `/jokes/${jokes[0]!.id}`,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Another one' }))

    expect(await screen.findByText(jokes[1]!.joke)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: jokes[1]!.joke })).toHaveAttribute(
      'href',
      `/jokes/${jokes[1]!.id}`,
    )
  })

  it('marks "Another one" unavailable while the next Joke loads, keeping focus, and ignores presses', async () => {
    let fetched = 0
    await renderPage(RandomJokeStory, { props })
    await screen.findByText(jokes[0]!.joke)
    server.events.on('request:start', () => fetched++)
    // Slow enough to see while it loads, then answered by the usual mock.
    server.use(
      http.get(`${API_URL}/`, async () => {
        await delay(200)
      }),
    )
    const another = screen.getByRole('button', { name: 'Another one' })

    another.focus()
    await userEvent.keyboard('{Enter}')
    expect(another).toHaveAttribute('aria-disabled', 'true')
    expect(another).toHaveFocus()
    await userEvent.keyboard('{Enter}')

    // The Joke shows at once, but the button stays busy for half a second in all.
    expect(await screen.findByText(jokes[1]!.joke)).toBeInTheDocument()
    await waitFor(() => expect(another).not.toHaveAttribute('aria-disabled'))
    expect(another).toHaveFocus()
    expect(fetched).toBe(1)
    server.events.removeAllListeners()
  })

  it('saves the Joke showing to Favorites', async () => {
    await renderPage(RandomJokeStory, { props })
    await userEvent.click(await screen.findByRole('button', { name: 'Favorite' }))
    expect(screen.getByRole('button', { name: 'Favorited' })).toBeInTheDocument()
  })

  it('shows the Error state when the API fails, and recovers on "Try again"', async () => {
    server.use(
      http.get(`${API_URL}/`, () => new HttpResponse(null, { status: 503 }), { once: true }),
    )
    await renderPage(RandomJokeStory, { props })
    expect(
      await screen.findByRole('heading', { level: 1, name: 'The printing press has jammed.' }),
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByText(jokes[0]!.joke)).toBeInTheDocument()
  })

  it('shows the rate limit as its own Error state', async () => {
    server.use(http.get(`${API_URL}/`, () => new HttpResponse(null, { status: 429 })))
    await renderPage(RandomJokeStory, { props })
    expect(await screen.findByText('Slow news day', { exact: false })).toBeInTheDocument()
  })
})
