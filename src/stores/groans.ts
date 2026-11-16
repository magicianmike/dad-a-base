import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { z } from 'zod'
import { JokeSchema, type Joke } from '@/api/schemas'

export const GROANS_STORAGE_KEY = 'dadabase:groans'

const GroanSchema = z.object({
  joke: JokeSchema,
  /** The share of a full hold, from 0 to 1 (see `groans/score.ts`). */
  score: z.number().min(0).max(1),
  groanedAt: z.iso.datetime(),
})

export type Groan = z.infer<typeof GroanSchema>

const StoredGroansSchema = z.array(GroanSchema)

/** Whatever is stored, as Groans, or none if it's missing, unreadable or not valid. */
function parse(raw: string | null): Groan[] {
  if (!raw) return []
  try {
    const parsed = StoredGroansSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : []
  } catch {
    return []
  }
}

function read(): Groan[] {
  try {
    return parse(localStorage.getItem(GROANS_STORAGE_KEY))
  } catch {
    return []
  }
}

/**
 * The visitor's Groans, one per Joke, with whole Jokes so the Groan Leaderboard needs no API calls. Saved in this
 * browser and kept in step across its tabs.
 */
export const useGroansStore = defineStore('groans', () => {
  const groans = ref<Groan[]>(read())
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

  watch(groans, (value) => {
    try {
      localStorage.setItem(GROANS_STORAGE_KEY, JSON.stringify(value))
    } catch {
      // Not remembered beyond this page, but still shown.
    }
  })

  // Another tab changed them.
  addEventListener('storage', (event) => {
    if (event.key === GROANS_STORAGE_KEY) groans.value = parse(event.newValue)
  })

  return { groans, ranked, scoreOf, groan, remove }
})
