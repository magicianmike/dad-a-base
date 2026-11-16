import { effectScope, nextTick } from 'vue'
import { z } from 'zod'
import { useStoredRef } from './useStoredRef'

const KEY = 'dadabase:test'
const Schema = z.array(z.string())

function setup(options?: Parameters<typeof useStoredRef>[3]) {
  const scope = effectScope()
  const stored = scope.run(() => useStoredRef(KEY, Schema, () => [], options))!
  return { stored, scope }
}

describe('useStoredRef', () => {
  it('starts from the fallback when nothing is saved', () => {
    expect(setup().stored.value).toEqual([])
  })

  it('loads what’s saved, and saves each change', async () => {
    localStorage.setItem(KEY, JSON.stringify(['a']))
    const { stored } = setup()
    expect(stored.value).toEqual(['a'])
    stored.value = ['b', 'a']
    await nextTick()
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual(['b', 'a'])
  })

  it.each([
    ['not JSON', '{oops'],
    ['not what the schema expects', JSON.stringify([1, 2])],
  ])('starts from the fallback when what’s saved is %s', (_, raw) => {
    localStorage.setItem(KEY, raw)
    expect(setup().stored.value).toEqual([])
  })

  it('keeps what the schema makes of it', () => {
    localStorage.setItem(KEY, JSON.stringify(['keep', 'drop']))
    const scope = effectScope()
    const stored = scope.run(() =>
      useStoredRef(
        KEY,
        Schema.transform((items) => items.filter((i) => i !== 'drop')),
        () => [],
      ),
    )!
    expect(stored.value).toEqual(['keep'])
  })

  it('follows changes made in another tab, and only to its own key', () => {
    const { stored } = setup()
    dispatchEvent(new StorageEvent('storage', { key: KEY, newValue: JSON.stringify(['x']) }))
    expect(stored.value).toEqual(['x'])
    dispatchEvent(new StorageEvent('storage', { key: 'dadabase:other', newValue: '[]' }))
    expect(stored.value).toEqual(['x'])
    dispatchEvent(new StorageEvent('storage', { key: KEY, newValue: null }))
    expect(stored.value).toEqual([])
  })

  it('can be told not to follow other tabs', () => {
    const { stored } = setup({ followTabs: false })
    dispatchEvent(new StorageEvent('storage', { key: KEY, newValue: JSON.stringify(['x']) }))
    expect(stored.value).toEqual([])
  })

  it('stops following other tabs when its scope ends', () => {
    const { stored, scope } = setup()
    scope.stop()
    dispatchEvent(new StorageEvent('storage', { key: KEY, newValue: JSON.stringify(['x']) }))
    expect(stored.value).toEqual([])
  })

  it('still works when storage throws', async () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const { stored } = setup()
    expect(stored.value).toEqual([])
    stored.value = ['kept for this page']
    await nextTick()
    expect(stored.value).toEqual(['kept for this page'])
    getItem.mockRestore()
    setItem.mockRestore()
  })
})
