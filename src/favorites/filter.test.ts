import { filterFavorites } from './filter'

const favorites = [
  { id: 'a', joke: 'Bad at golf? Join the club.' },
  { id: 'b', joke: 'I ordered a café au lait. It was grounds for dismissal.' },
  { id: 'c', joke: 'My dog ate my homework.' },
]

describe('filterFavorites', () => {
  it('keeps every Favorite for an empty or blank term', () => {
    expect(filterFavorites(favorites, '')).toEqual(favorites)
    expect(filterFavorites(favorites, '   ')).toEqual(favorites)
  })

  it('finds a term anywhere in the text, ignoring case and spaces around it', () => {
    expect(filterFavorites(favorites, ' GOLF ').map(({ id }) => id)).toEqual(['a'])
    expect(filterFavorites(favorites, 'my').map(({ id }) => id)).toEqual(['c'])
  })

  it('ignores accents either way', () => {
    expect(filterFavorites(favorites, 'cafe').map(({ id }) => id)).toEqual(['b'])
    expect(filterFavorites(favorites, 'CAFÉ').map(({ id }) => id)).toEqual(['b'])
  })

  it('keeps the Favorites’ own order', () => {
    expect(filterFavorites(favorites, 'a').map(({ id }) => id)).toEqual(['a', 'b', 'c'])
  })

  it('finds nothing for a term no Joke has', () => {
    expect(filterFavorites(favorites, 'xyzzy')).toEqual([])
  })
})
