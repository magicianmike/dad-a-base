import { DefaultApolloClient } from '@vue/apollo-composable'
import { createHead } from '@unhead/vue/client'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { createMemoryHistory, createRouter } from 'vue-router'
import { API_URL, createApolloClient } from '@/api/client'
import { jokes } from '@/mocks/fixtures'
import { server } from '@/mocks/node'
import RandomView from './RandomView.vue'

function renderView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:any(.*)*', component: { render: () => null } }],
  })
  return render(RandomView, {
    global: {
      plugins: [createHead(), router],
      provide: { [DefaultApolloClient]: createApolloClient() },
    },
  })
}

describe('RandomView', () => {
  it('shows a Joke, and another one on request', async () => {
    renderView()
    expect(await screen.findByText(jokes[0]!.joke)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Another one' }))

    expect(await screen.findByText(jokes[1]!.joke)).toBeInTheDocument()
  })

  it('shows the Error state when the API fails, and recovers on "Try again"', async () => {
    server.use(
      http.get(`${API_URL}/`, () => new HttpResponse(null, { status: 503 }), { once: true }),
    )
    renderView()
    expect(
      await screen.findByRole('heading', { level: 1, name: 'The printing press has jammed.' }),
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByText(jokes[0]!.joke)).toBeInTheDocument()
  })

  it('shows the rate limit as its own Error state', async () => {
    server.use(http.get(`${API_URL}/`, () => new HttpResponse(null, { status: 429 })))
    renderView()
    expect(await screen.findByText('Slow news day', { exact: false })).toBeInTheDocument()
  })
})
