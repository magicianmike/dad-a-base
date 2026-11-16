import type { Joke } from '@/api/schemas'

/** Lower case, with accents taken off, so "CAFE" finds "café". */
function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase()
}

/** The Favorites whose text contains the term, in their own order. An empty term matches all of them. */
export function filterFavorites(favorites: readonly Joke[], term: string): Joke[] {
  const needle = fold(term.trim())
  if (!needle) return [...favorites]
  return favorites.filter(({ joke }) => fold(joke).includes(needle))
}
