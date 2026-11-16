import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import {
  RECENT_SEARCHES_MAX,
  RECENT_SEARCHES_STORAGE_KEY,
  useRecentSearchesStore,
} from './recentSearches'

beforeEach(() => setActivePinia(createPinia()))

describe('useRecentSearchesStore', () => {
  it('starts empty', () => {
    expect(useRecentSearchesStore().terms).toEqual([])
  })

  it('remembers terms newest first, trimmed, and saves them', async () => {
    const store = useRecentSearchesStore()
    store.remember('cat')
    store.remember('  dog ')
    expect(store.terms).toEqual(['dog', 'cat'])
    await nextTick()
    expect(JSON.parse(localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY)!)).toEqual(['dog', 'cat'])
  })

  it('moves a repeated term to the front, whatever its case, as last typed', () => {
    const store = useRecentSearchesStore()
    store.remember('cat')
    store.remember('dog')
    store.remember('Cat')
    expect(store.terms).toEqual(['Cat', 'dog'])
  })

  it('ignores a blank term', () => {
    const store = useRecentSearchesStore()
    store.remember('   ')
    expect(store.terms).toEqual([])
  })

  it(`keeps only the last ${RECENT_SEARCHES_MAX}`, () => {
    const store = useRecentSearchesStore()
    for (const term of ['a', 'b', 'c', 'd', 'e', 'f']) store.remember(term)
    expect(store.terms).toEqual(['f', 'e', 'd', 'c', 'b'])
  })

  it('clears them', async () => {
    const store = useRecentSearchesStore()
    store.remember('cat')
    store.clear()
    expect(store.terms).toEqual([])
    await nextTick()
    expect(localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY)).toBe('[]')
  })

  it('loads saved terms', () => {
    localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(['cat', 'dog']))
    expect(useRecentSearchesStore().terms).toEqual(['cat', 'dog'])
  })

  it.each([
    ['not JSON', '{oops'],
    ['not a list of terms', JSON.stringify([1, 2])],
    ['too many', JSON.stringify(['a', 'b', 'c', 'd', 'e', 'f'])],
  ])('starts empty when what’s saved is %s', (_, raw) => {
    localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, raw)
    expect(useRecentSearchesStore().terms).toEqual([])
  })

  it('still works when storage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const store = useRecentSearchesStore()
    store.remember('cat')
    await nextTick()
    expect(store.terms).toEqual(['cat'])
    vi.restoreAllMocks()
  })
})
