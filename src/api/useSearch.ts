import { useQuery } from '@vue/apollo-composable'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { toAppError } from './errors'
import { SEARCH_JOKES } from './queries'

/**
 * One page of a Search, cached by term and page. An empty term makes no request. While the next page or term loads,
 * the last one stays on screen, so typing doesn't flash an empty list.
 */
export function useSearch(term: MaybeRefOrGetter<string>, page: MaybeRefOrGetter<number>) {
  const { result, loading, error, refetch } = useQuery(
    SEARCH_JOKES,
    () => ({ term: toValue(term), page: toValue(page) }),
    () => ({
      enabled: toValue(term) !== '',
      keepPreviousResult: true,
      notifyOnNetworkStatusChange: true,
    }),
  )

  return {
    results: computed(() => result.value?.search ?? null),
    loading,
    error: computed(() => (error.value ? toAppError(error.value) : null)),
    // A failure shows through `error`, so the rejected promise needs no handler of its own.
    retry: () => void refetch()?.catch(() => {}),
  }
}
