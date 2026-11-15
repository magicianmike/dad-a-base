import { useQuery } from '@vue/apollo-composable'
import { computed } from 'vue'
import { toAppError } from './errors'
import { RANDOM_JOKE } from './queries'

/** A random Joke, and `next()` for another. Never read from the cache (ADR 0002). */
export function useRandomJoke() {
  const { result, loading, error, refetch } = useQuery(RANDOM_JOKE, {}, () => ({
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  }))

  return {
    joke: computed(() => result.value?.randomJoke ?? null),
    loading,
    error: computed(() => (error.value ? toAppError(error.value) : null)),
    // A failure shows through `error`, so the rejected promise needs no handler of its own.
    next: () => void refetch()?.catch(() => {}),
  }
}
