import { z } from 'zod'

/**
 * The single source of truth for API shapes (ADR 0002). Every response is parsed here at runtime,
 * and the static types come from `z.infer`.
 */

/** icanhazdadjoke reports errors with HTTP 200 and the real status in the body. */
export const ApiStatusSchema = z.object({
  status: z.number().int(),
  message: z.string().optional(),
})

export const JokeSchema = z.object({
  id: z.string().min(1),
  joke: z.string().min(1),
})

export type Joke = z.infer<typeof JokeSchema>

/** One page of a Search, renamed from the API's snake_case. An empty Search still has one page. */
export const SearchPageSchema = z
  .object({
    search_term: z.string(),
    current_page: z.number().int(),
    total_jokes: z.number().int().nonnegative(),
    total_pages: z.number().int().positive(),
    results: z.array(JokeSchema),
  })
  .transform((page) => ({
    term: page.search_term,
    page: page.current_page,
    totalJokes: page.total_jokes,
    totalPages: page.total_pages,
    jokes: page.results,
  }))

export type SearchPage = z.infer<typeof SearchPageSchema>

/** Schemas by the `type` named in each `@rest` directive. */
export const schemasByType = {
  Joke: JokeSchema,
  SearchPage: SearchPageSchema,
} as const

export type RestType = keyof typeof schemasByType

export function isRestType(type: string): type is RestType {
  return Object.hasOwn(schemasByType, type)
}
