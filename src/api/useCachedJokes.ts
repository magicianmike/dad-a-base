import { useApolloClient } from '@vue/apollo-composable'
import { type MaybeRefOrGetter, toValue, watchEffect } from 'vue'
import { JOKE_FIELDS } from './queries'
import type { Joke } from './schemas'

/** Puts Jokes the app already holds, such as Favorites, in Apollo's cache as `Joke:id`, so opening one makes no request. */
export function useCachedJokes(jokes: MaybeRefOrGetter<readonly Joke[]>) {
  const { resolveClient } = useApolloClient()
  watchEffect(() => {
    const { cache } = resolveClient()
    for (const { id, joke } of toValue(jokes)) {
      cache.writeFragment({
        id: cache.identify({ __typename: 'Joke', id }),
        fragment: JOKE_FIELDS,
        // The cache matches the data to `on Joke` by its __typename, and drops its fields without it.
        data: { __typename: 'Joke', id, joke },
      })
    }
  })
}
