import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/node'
import { API_URL, createApolloClient, parseResponse } from './client'
import { AppError } from './errors'
import { JOKE, RANDOM_JOKE, SEARCH_JOKES } from './queries'

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

describe('the Search query', () => {
  it('returns a typed page of Jokes, each normalised as Joke:id', async () => {
    const client = createApolloClient()
    const { data } = await client.query({
      query: SEARCH_JOKES,
      variables: { term: 'dog', page: 5 },
    })

    expect(data.search).toMatchObject({ term: 'dog', page: 5, totalJokes: 43, totalPages: 5 })
    expect(data.search.jokes.map(({ id }) => id)).toEqual(['dog41', 'dog42', 'dog43'])
    expect(client.cache.extract()).toHaveProperty('Joke:dog41')
  })

  it('asks for 10 a page, with the term encoded', async () => {
    let url: URL | undefined
    server.use(
      http.get(`${API_URL}/search`, ({ request }) => {
        url = new URL(request.url)
        return HttpResponse.json({
          current_page: 1,
          results: [],
          search_term: 'cats & dogs',
          status: 200,
          total_jokes: 0,
          total_pages: 1,
        })
      }),
    )
    await createApolloClient().query({
      query: SEARCH_JOKES,
      variables: { term: 'cats & dogs', page: 1 },
    })
    expect(Object.fromEntries(url!.searchParams)).toEqual({
      term: 'cats & dogs',
      page: '1',
      limit: '10',
    })
  })

  it('caches each page by term and page number', async () => {
    const client = createApolloClient()
    let fetched = 0
    server.events.on('request:start', () => fetched++)
    for (const variables of [
      { term: 'dog', page: 1 },
      { term: 'dog', page: 2 },
      { term: 'dog', page: 1 },
      { term: 'pun', page: 1 },
    ]) {
      await client.query({ query: SEARCH_JOKES, variables })
    }
    expect(fetched).toBe(3)
    server.events.removeAllListeners()
  })

  it('opens a Joke found by Search from the cache, without a fetch', async () => {
    const client = createApolloClient()
    await client.query({ query: SEARCH_JOKES, variables: { term: 'golf', page: 1 } })
    let fetched = 0
    server.events.on('request:start', () => fetched++)

    const { data } = await client.query({ query: JOKE, variables: { id: 'BI699EY08Ed' } })

    expect(data.joke.joke).toBe('Bad at golf? Join the club.')
    expect(fetched).toBe(0)
    server.events.removeAllListeners()
  })
})
