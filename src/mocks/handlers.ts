import { http, HttpResponse } from 'msw'
import { API_URL } from '@/api/client'
import { archive, jokes } from './fixtures'

let next = 0

/**
 * Playwright can't reach MSW's handlers in the page, so a test sets this sessionStorage key to an HTTP status
 * (or `offline`) and the API answers with it until cleared.
 */
export const MOCK_FAILURE_KEY = 'dadabase:mock-failure'

/** Cycles through the fixtures, so "Another one" visibly changes the Joke. */
export function resetMocks() {
  next = 0
}

function forcedFailure() {
  try {
    const failure = globalThis.sessionStorage?.getItem(MOCK_FAILURE_KEY)
    if (failure === 'offline') return HttpResponse.error()
    if (failure) return new HttpResponse(null, { status: Number(failure) })
  } catch {
    // No storage: no forced failure.
  }
  return undefined
}

export const handlers = [
  // Like the real API: a page past the end has no results, and an empty Search still has one page.
  http.get(`${API_URL}/search`, ({ request }) => {
    const failure = forcedFailure()
    if (failure) return failure
    const params = new URL(request.url).searchParams
    const term = params.get('term') ?? ''
    const page = Number(params.get('page') ?? 1)
    const limit = Number(params.get('limit') ?? 20)
    const matches = archive.filter(({ joke }) => joke.toLowerCase().includes(term.toLowerCase()))
    const totalPages = Math.max(1, Math.ceil(matches.length / limit))
    return HttpResponse.json({
      current_page: page,
      limit,
      next_page: Math.min(page + 1, totalPages),
      previous_page: Math.max(1, page - 1),
      results: matches.slice((page - 1) * limit, page * limit),
      search_term: term,
      status: 200,
      total_jokes: matches.length,
      total_pages: totalPages,
    })
  }),
  // Like the real API, an unknown id answers HTTP 200 with the 404 in the body.
  http.get(`${API_URL}/j/:id`, ({ params }) => {
    const failure = forcedFailure()
    if (failure) return failure
    const joke = jokes.find(({ id }) => id === params.id)
    if (!joke)
      return HttpResponse.json({ message: `Joke with id "${params.id}" not found`, status: 404 })
    return HttpResponse.json({ ...joke, status: 200 })
  }),
  http.get(`${API_URL}/`, () => {
    const failure = forcedFailure()
    if (failure) return failure
    const joke = jokes[next++ % jokes.length]
    return HttpResponse.json({ ...joke, status: 200 })
  }),
]
