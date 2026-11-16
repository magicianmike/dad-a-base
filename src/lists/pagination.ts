/** How many page numbers the Pagination window shows on each side of the current page. */
const SIDE = 5

/**
 * The Pagination window: the current page with 5 on each side, kept full at both ends. Page 2 of 40 shows 1–11,
 * page 8 shows 3–13, and page 38 shows 30–40. With 11 pages or fewer, every page.
 */
export function paginationWindow(current: number, totalPages: number): number[] {
  const size = Math.min(SIDE * 2 + 1, totalPages)
  const first = Math.min(Math.max(1, current - SIDE), totalPages - size + 1)
  return Array.from({ length: size }, (_, i) => first + i)
}

/** The page a `?page` asks for: a whole number, at least 1. Missing or not a number is page 1. */
export function parsePage(raw: unknown): number {
  const value = Number(Array.isArray(raw) ? raw[0] : raw)
  if (!Number.isFinite(value)) return 1
  return Math.max(1, Math.round(value))
}

/** "Jokes 11–20 of 43", for the page of 10 that's showing. */
export function resultsSummary(page: number, totalJokes: number, pageSize = 10): string {
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalJokes)
  return start === end ? `Joke ${start} of ${totalJokes}` : `Jokes ${start}–${end} of ${totalJokes}`
}
