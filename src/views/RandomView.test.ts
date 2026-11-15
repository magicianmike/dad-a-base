import { DefaultApolloClient } from '@vue/apollo-composable'
import { createHead } from '@unhead/vue/client'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { API_URL, createApolloClient } from '@/api/client'
import { jokes } from '@/mocks/fixtures'
import { server } from '@/mocks/node'
import RandomView from './RandomView.vue'

function renderView() {
  return render(RandomView, {
    global: {
      plugins: [createHead()],
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

  it('says when the API fails', async () => {
    server.use(http.get(`${API_URL}/`, () => new HttpResponse(null, { status: 503 })))
    renderView()
    expect(await screen.findByRole('alert')).toHaveTextContent('(500)')
  })

  it('keeps showing the error when another one also fails', async () => {
    server.use(http.get(`${API_URL}/`, () => new HttpResponse(null, { status: 429 })))
    renderView()
    await screen.findByRole('alert')

    await userEvent.click(screen.getByRole('button', { name: 'Another one' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('(429)')
  })
})
