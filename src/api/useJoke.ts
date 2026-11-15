import { useQuery } from '@vue/apollo-composable'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { toAppError } from './errors'
import { JOKE } from './queries'

/** One Joke by id, from the cache when it's there. An unknown id is an AppError with code 404. */
export function useJoke(id: MaybeRefOrGetter<string>) {
  const { result, loading, error, refetch } = useQuery(JOKE, () => ({ id: toValue(id) }), {
    notifyOnNetworkStatusChange: true,
  })

  return {
    joke: computed(() => result.value?.joke ?? null),
    loading,
    error: computed(() => (error.value ? toAppError(error.value) : null)),
    // A failure shows through `error`, so the rejected promise needs no handler of its own.
    retry: () => void refetch()?.catch(() => {}),
  }
}
