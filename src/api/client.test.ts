import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/node'
import { API_URL, createApolloClient, parseResponse } from './client'
import { AppError } from './errors'
import { JOKE, RANDOM_JOKE } from './queries'

describe('parseResponse', () => {
  it('parses a Joke', async () => {
    const response = Response.json({ id: 'abc', joke: 'A joke', status: 200 })
    await expect(parseResponse(response, 'Joke')).resolves.toEqual({ id: 'abc', joke: 'A joke' })
  })

  it('turns an error status in the body, sent as HTTP 200, into an AppError', async () => {
    const response = Response.json({ message: 'Joke with id "nope" not found', status: 404 })
    await expect(parseResponse(response, 'Joke')).rejects.toMatchObject({ code: '404' })
  })

  it('gives an error status with no message a fallback message', async () => {
    const response = Response.json({ status: 500 })
    await expect(parseResponse(response, 'Joke')).rejects.toMatchObject({
      code: '500',
      message: 'Request failed',
    })
  })

  it('turns the null apollo-link-rest gives for an HTTP 404 into an AppError', async () => {
    await expect(parseResponse(null, 'Joke')).rejects.toBeInstanceOf(AppError)
  })

  it('rejects a response that doesn’t match its schema', async () => {
    const response = Response.json({ id: 'abc', status: 200 })
    await expect(parseResponse(response, 'Joke')).rejects.toThrow()
  })

  it('rejects a @rest type with no schema', async () => {
    const response = Response.json({ status: 200 })
    await expect(parseResponse(response, 'Pun')).rejects.toThrow('No schema for @rest type "Pun"')
  })
})

describe('createApolloClient', () => {
  it('asks for JSON and returns a typed, normalised Joke', async () => {
    let accept: string | null = null
    server.use(
      http.get(`${API_URL}/`, ({ request }) => {
        accept = request.headers.get('accept')
        return HttpResponse.json({ id: 'abc', joke: 'A joke', status: 200 })
      }),
    )
    const client = createApolloClient()

    const { data } = await client.query({ query: RANDOM_JOKE })

    expect(accept).toBe('application/json')
    expect(data.randomJoke).toEqual({ __typename: 'Joke', id: 'abc', joke: 'A joke' })
    expect(client.cache.extract()).toHaveProperty('Joke:abc')
  })
})

describe('the Joke query', () => {
  it('opens a Joke already in the cache without a fetch', async () => {
    const client = createApolloClient()
    const { data: random } = await client.query({ query: RANDOM_JOKE })
    let fetched = 0
    server.events.on('request:start', () => fetched++)

    const { data } = await client.query({ query: JOKE, variables: { id: random.randomJoke.id } })

    expect(data.joke).toEqual(random.randomJoke)
    expect(fetched).toBe(0)
    server.events.removeAllListeners()
  })

  it('fetches a Joke it hasn’t seen', async () => {
    const { data } = await createApolloClient().query({
      query: JOKE,
      variables: { id: 'BI699EY08Ed' },
    })
    expect(data.joke.joke).toBe('Bad at golf? Join the club.')
  })

  it('fails with a 404 for a Joke that doesn’t exist, which the API sends as HTTP 200', async () => {
    await expect(
      createApolloClient().query({ query: JOKE, variables: { id: 'nope' } }),
    ).rejects.toMatchObject({
      networkError: { code: '404' },
    })
  })
})
