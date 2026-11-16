import { defineStore } from 'pinia'
import { computed } from 'vue'
import { z } from 'zod'
import { JokeSchema, type Joke } from '@/api/schemas'
import { GROAN_FULL_MS, GROAN_TAP_MS } from '@/groans/score'
import { useStoredRef } from './useStoredRef'

export const GROANS_STORAGE_KEY = 'dadabase:groans'

const GroanSchema = z.object({
  joke: JokeSchema,
  /** The share of a full hold, from 0 to 1 (see `groans/score.ts`). */
  score: z.number().min(0).max(1),
  groanedAt: z.iso.datetime(),
})

export type Groan = z.infer<typeof GroanSchema>

/**
 * What's saved, less any tap: before a Groan took a long press, a tap was a Groan too. Only preview deploys ever
 * saved one, so they're dropped rather than kept with their own way of showing.
 */
const StoredGroansSchema = z
  .array(GroanSchema)
  .transform((groans) => groans.filter(({ score }) => score >= GROAN_TAP_MS / GROAN_FULL_MS))

/**
 * The visitor's Groans, one per Joke, with whole Jokes so the Groan Leaderboard needs no API calls. Saved in this
 * browser and kept in step across its tabs.
 */
export const useGroansStore = defineStore('groans', () => {
  const groans = useStoredRef(GROANS_STORAGE_KEY, StoredGroansSchema, () => [])
  const scores = computed(() => new Map(groans.value.map(({ joke, score }) => [joke.id, score])))

  /** Highest score first, and the newest first on a tie. */
  const ranked = computed(() =>
    [...groans.value].sort((a, b) => b.score - a.score || b.groanedAt.localeCompare(a.groanedAt)),
  )

  /** A Joke's Groan score, from 0 to 1, if it's been groaned at. */
  function scoreOf(id: string): number | undefined {
    return scores.value.get(id)
  }

  /** Records a Groan, replacing any earlier one for the same Joke. */
  function groan(joke: Joke, score: number) {
    const groan: Groan = {
      joke: { id: joke.id, joke: joke.joke },
      score,
      groanedAt: new Date().toISOString(),
    }
    groans.value = [groan, ...groans.value.filter((g) => g.joke.id !== joke.id)]
  }

  function remove(id: string) {
    groans.value = groans.value.filter(({ joke }) => joke.id !== id)
  }

  return { groans, ranked, scoreOf, groan, remove }
})
