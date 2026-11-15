// The one test against the real API: `npm run test:smoke`. Everything else uses MSW.
import { createApolloClient } from './client'
import { RANDOM_JOKE } from './queries'

it('fetches a random Joke from icanhazdadjoke', async () => {
  const { data } = await createApolloClient().query({ query: RANDOM_JOKE })
  expect(data.randomJoke).toMatchObject({ __typename: 'Joke', id: expect.any(String) })
})
