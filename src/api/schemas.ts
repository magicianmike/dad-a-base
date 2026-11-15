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

/** Schemas by the `type` named in each `@rest` directive. */
export const schemasByType = {
  Joke: JokeSchema,
} as const

export type RestType = keyof typeof schemasByType

export function isRestType(type: string): type is RestType {
  return Object.hasOwn(schemasByType, type)
}
