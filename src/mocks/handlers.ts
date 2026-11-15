import { http, HttpResponse } from 'msw'
import { API_URL } from '@/api/client'
import { jokes } from './fixtures'

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
  http.get(`${API_URL}/`, () => {
    const failure = forcedFailure()
    if (failure) return failure
    const joke = jokes[next++ % jokes.length]
    return HttpResponse.json({ ...joke, status: 200 })
  }),
]
