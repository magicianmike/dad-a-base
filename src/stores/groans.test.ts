import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { jokes } from '@/mocks/fixtures'
import { GROANS_STORAGE_KEY, useGroansStore } from './groans'

const [first, second, third] = jokes as [(typeof jokes)[0], (typeof jokes)[0], (typeof jokes)[0]]

beforeEach(() => {
  setActivePinia(createPinia())
  vi.useFakeTimers({ now: new Date('2026-11-16T12:00:00Z') })
})
afterEach(() => vi.useRealTimers())

describe('useGroansStore', () => {
  it('starts empty', () => {
    const store = useGroansStore()
    expect(store.groans).toEqual([])
    expect(store.ranked).toEqual([])
    expect(store.scoreOf(first.id)).toBeUndefined()
  })

  it('records a Groan with when it happened, and saves it', async () => {
    const store = useGroansStore()
    store.groan(first, 0.72)
    expect(store.scoreOf(first.id)).toBe(0.72)
    expect(store.groans).toEqual([
      { joke: first, score: 0.72, groanedAt: '2026-11-16T12:00:00.000Z' },
    ])
    await nextTick()
    expect(JSON.parse(localStorage.getItem(GROANS_STORAGE_KEY)!)).toHaveLength(1)
  })

  it('replaces a Joke’s Groan when it’s groaned at again', () => {
    const store = useGroansStore()
    store.groan(first, 0.9)
    vi.advanceTimersByTime(1000)
    store.groan(first, 0.2)
    expect(store.groans).toEqual([
      { joke: first, score: 0.2, groanedAt: '2026-11-16T12:00:01.000Z' },
    ])
  })

  it('ranks by score, highest first, and the newest first on a tie', () => {
    const store = useGroansStore()
    store.groan(first, 0.5)
    vi.advanceTimersByTime(1000)
    store.groan(second, 0.9)
    vi.advanceTimersByTime(1000)
    store.groan(third, 0.5)
    expect(store.ranked.map(({ joke }) => joke.id)).toEqual([second.id, third.id, first.id])
  })

  it('removes a Groan', () => {
    const store = useGroansStore()
    store.groan(first, 0.5)
    store.groan(second, 0.6)
    store.remove(first.id)
    expect(store.groans.map(({ joke }) => joke.id)).toEqual([second.id])
  })

  it('keeps only the Joke’s own fields, not Apollo’s __typename', () => {
    const store = useGroansStore()
    store.groan({ ...first, __typename: 'Joke' } as typeof first, 0.5)
    expect(store.groans[0]!.joke).toEqual(first)
  })

  it('loads saved Groans', () => {
    const saved = [{ joke: first, score: 0.4, groanedAt: '2026-11-15T10:00:00.000Z' }]
    localStorage.setItem(GROANS_STORAGE_KEY, JSON.stringify(saved))
    expect(useGroansStore().groans).toEqual(saved)
  })

  it('drops a tap saved before a Groan took a long press, and keeps the rest', () => {
    const kept = { joke: second, score: 0.5, groanedAt: '2026-11-15T10:00:00.000Z' }
    localStorage.setItem(
      GROANS_STORAGE_KEY,
      JSON.stringify([{ joke: first, score: 0.04, groanedAt: '2026-11-15T09:00:00.000Z' }, kept]),
    )
    expect(useGroansStore().groans).toEqual([kept])
  })

  it.each([
    ['not JSON', '{oops'],
    ['not a list of Groans', JSON.stringify([{ joke: first, score: 2, groanedAt: 'x' }])],
  ])('starts empty when what’s saved is %s', (_, raw) => {
    localStorage.setItem(GROANS_STORAGE_KEY, raw)
    expect(useGroansStore().groans).toEqual([])
  })

  it('follows changes made in another tab', () => {
    const store = useGroansStore()
    const saved = [{ joke: second, score: 1, groanedAt: '2026-11-15T10:00:00.000Z' }]
    dispatchEvent(
      new StorageEvent('storage', { key: GROANS_STORAGE_KEY, newValue: JSON.stringify(saved) }),
    )
    expect(store.groans).toEqual(saved)
    dispatchEvent(new StorageEvent('storage', { key: 'something-else', newValue: '[]' }))
    expect(store.groans).toEqual(saved)
    dispatchEvent(new StorageEvent('storage', { key: GROANS_STORAGE_KEY, newValue: null }))
    expect(store.groans).toEqual([])
  })

  it('still works when storage throws', async () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const store = useGroansStore()
    store.groan(first, 0.5)
    await nextTick()
    expect(store.scoreOf(first.id)).toBe(0.5)
    getItem.mockRestore()
    setItem.mockRestore()
  })
})
