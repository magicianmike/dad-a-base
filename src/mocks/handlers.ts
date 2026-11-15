import { http, HttpResponse } from 'msw'
import { API_URL } from '@/api/client'
import { jokes } from './fixtures'

let next = 0

/** Cycles through the fixtures, so "Another one" visibly changes the Joke. */
export function resetMocks() {
  next = 0
}

export const handlers = [
  http.get(`${API_URL}/`, () => {
    const joke = jokes[next++ % jokes.length]
    return HttpResponse.json({ ...joke, status: 200 })
  }),
]
