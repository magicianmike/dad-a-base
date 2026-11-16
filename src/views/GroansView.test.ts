import { screen, waitFor, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { archive, jokes } from '@/mocks/fixtures'
import { server } from '@/mocks/node'
import { GROANS_STORAGE_KEY, type Groan } from '@/stores/groans'
import { renderPage } from '@/test/renderPage'
import GroansView from './GroansView.vue'

const [first, second, third] = jokes as [(typeof jokes)[0], (typeof jokes)[0], (typeof jokes)[0]]

/** Saves Groans as a visitor would have. */
function save(...saved: Groan[]) {
  localStorage.setItem(GROANS_STORAGE_KEY, JSON.stringify(saved))
}

const groan = (joke: (typeof jokes)[0], score: number, groanedAt = '2026-11-16T12:00:00.000Z') => ({
  joke,
  score,
  groanedAt,
})

const removeButtons = () => screen.queryAllByRole('button', { name: 'Remove from groans' })
// The ranked list is the first; the pagination is another.
const rows = () => within(screen.getAllByRole('list')[0]!).getAllByRole('listitem')

describe('GroansView', () => {
  it('says there are none yet, how to groan, and where to find a joke', async () => {
    await renderPage(GroansView, { path: '/groans' })
    expect(
      screen.getByRole('heading', { level: 1, name: 'The worst of the worst' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'No groans yet' })).toBeInTheDocument()
    expect(screen.getByText(/Press and hold Groan on any joke/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Read a random joke' })).toHaveAttribute(
      'href',
      '/random',
    )
    await waitFor(() => expect(document.title).toBe('Groan Leaderboard'))
  })

  it('ranks the Groans worst first, newest first on a tie, each with its score and link, and no API calls', async () => {
    let fetched = 0
    server.events.on('request:start', () => fetched++)
    save(
      groan(first, 0.5, '2026-11-16T10:00:00.000Z'),
      groan(second, 0.95),
      groan(third, 0.5, '2026-11-16T11:00:00.000Z'),
    )
    await renderPage(GroansView, { path: '/groans' })

    expect(screen.getByRole('heading', { level: 2, name: '3 groaned jokes' })).toBeInTheDocument()
    expect(rows().map((row) => within(row).getByRole('link').textContent)).toEqual([
      second.joke,
      third.joke,
      first.joke,
    ])
    expect(rows()[0]).toHaveTextContent(/^Number 1/)
    expect(rows()[0]).toHaveTextContent('Groan score 9.5/10')
    expect(within(rows()[2]!).getByRole('link')).toHaveAttribute('href', `/jokes/${first.id}`)
    expect(fetched).toBe(0)
    server.events.removeAllListeners()
  })

  it('leaves out a tap saved before a Groan took a long press', async () => {
    save(groan(first, 0.05), groan(second, 0.12))
    await renderPage(GroansView, { path: '/groans' })
    expect(screen.getByRole('heading', { level: 2, name: '1 groaned joke' })).toBeInTheDocument()
    expect(rows()[0]).toHaveTextContent('Groan score 1.2/10')
  })

  it('removes a Groan, moving focus to the next Remove, then the empty state', async () => {
    save(groan(first, 0.9), groan(second, 0.5))
    await renderPage(GroansView, { path: '/groans' })

    await userEvent.click(removeButtons()[0]!)
    expect(screen.getByRole('status')).toHaveTextContent('Removed from your groans.')
    // It falls off the board first.
    await waitFor(() => expect(removeButtons()).toHaveLength(1))
    expect(removeButtons()[0]).toHaveFocus()

    // Once the last card has fallen.
    await userEvent.click(removeButtons()[0]!)
    expect(
      await screen.findByRole('heading', { level: 2, name: 'No groans yet' }),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 2, name: 'No groans yet' })).toHaveFocus(),
    )
  })

  it('pages ten at a time, ranks on from the page before, and fixes a page past the end', async () => {
    save(...archive.slice(0, 23).map((joke, i) => groan(joke, 1 - i / 100)))
    const { router } = await renderPage(GroansView, { path: '/groans?page=9' })

    await waitFor(() => expect(router.currentRoute.value.fullPath).toBe('/groans?page=3'))
    expect(
      await screen.findByRole('heading', { level: 2, name: 'Jokes 21–23 of 23' }),
    ).toBeInTheDocument()
    expect(rows()[0]).toHaveTextContent(/^Number 21/)
    await waitFor(() => expect(document.title).toBe('Groan Leaderboard, page 3'))

    await userEvent.click(screen.getByRole('link', { name: 'Page 1' }))
    await waitFor(() => expect(router.currentRoute.value.fullPath).toBe('/groans'))
    expect(await screen.findByRole('heading', { level: 2, name: 'Jokes 1–10 of 23' })).toHaveFocus()
  })

  it('moves focus to the heading when the last Groan on a later page is removed', async () => {
    save(...archive.slice(0, 11).map((joke, i) => groan(joke, 1 - i / 100)))
    const { router } = await renderPage(GroansView, { path: '/groans?page=2' })
    await screen.findByRole('heading', { level: 2, name: 'Joke 11 of 11' })

    await userEvent.click(removeButtons()[0]!)
    await waitFor(() => expect(router.currentRoute.value.fullPath).toBe('/groans'))
    expect(await screen.findByRole('heading', { level: 2, name: '10 groaned jokes' })).toHaveFocus()
  })
})
