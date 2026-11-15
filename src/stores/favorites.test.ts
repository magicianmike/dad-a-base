import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { jokes } from '@/mocks/fixtures'
import { FAVORITES_STORAGE_KEY, useFavoritesStore } from './favorites'

const [first, second] = jokes as [(typeof jokes)[0], (typeof jokes)[0]]

beforeEach(() => setActivePinia(createPinia()))

describe('useFavoritesStore', () => {
  it('starts empty', () => {
    expect(useFavoritesStore().favorites).toEqual([])
  })

  it('adds a Joke to the front, saves it, and removes it again', async () => {
    const store = useFavoritesStore()
    expect(store.toggle(first)).toBe('added')
    expect(store.toggle(second)).toBe('added')
    expect(store.favorites.map(({ id }) => id)).toEqual([second.id, first.id])
    expect(store.isFavorite(first.id)).toBe(true)
    await nextTick()
    expect(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)!)).toHaveLength(2)

    expect(store.toggle(first)).toBe('removed')
    expect(store.isFavorite(first.id)).toBe(false)
  })

  it('keeps only the Joke’s own fields, not Apollo’s __typename', () => {
    const store = useFavoritesStore()
    store.toggle({ ...first, __typename: 'Joke' } as typeof first)
    expect(store.favorites[0]).toEqual(first)
  })

  it('loads saved Favorites', () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([first]))
    expect(useFavoritesStore().favorites).toEqual([first])
  })

  it.each([
    ['not JSON', '{oops'],
    ['not a list of Jokes', JSON.stringify([{ id: 1 }])],
  ])('starts empty when what’s saved is %s', (_, raw) => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, raw)
    expect(useFavoritesStore().favorites).toEqual([])
  })

  it('follows changes made in another tab', () => {
    const store = useFavoritesStore()
    dispatchEvent(
      new StorageEvent('storage', {
        key: FAVORITES_STORAGE_KEY,
        newValue: JSON.stringify([second]),
      }),
    )
    expect(store.favorites).toEqual([second])
    dispatchEvent(new StorageEvent('storage', { key: 'something-else', newValue: '[]' }))
    expect(store.favorites).toEqual([second])
    dispatchEvent(new StorageEvent('storage', { key: FAVORITES_STORAGE_KEY, newValue: null }))
    expect(store.favorites).toEqual([])
  })

  it('still works when storage throws', async () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const store = useFavoritesStore()
    store.toggle(first)
    await nextTick()
    expect(store.isFavorite(first.id)).toBe(true)
    getItem.mockRestore()
    setItem.mockRestore()
  })
})
