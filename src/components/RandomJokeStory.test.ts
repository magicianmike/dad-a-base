import { screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
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
    expect(screen.getByRole('link', { name: 'Open this joke' })).toHaveAttribute(
      'href',
      `/jokes/${jokes[0]!.id}`,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Another one' }))

    expect(await screen.findByText(jokes[1]!.joke)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open this joke' })).toHaveAttribute(
      'href',
      `/jokes/${jokes[1]!.id}`,
    )
  })

  it('saves the Joke showing to Favorites', async () => {
    await renderPage(RandomJokeStory, { props })
    await userEvent.click(await screen.findByRole('button', { name: 'Favorite' }))
    expect(screen.getByRole('button', { name: 'Favorite' })).toHaveAttribute('aria-pressed', 'true')
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
