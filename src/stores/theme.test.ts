import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import indexHtml from '../../index.html?raw'
import { THEME_STORAGE_KEY, useThemeStore } from './theme'

/** A stand-in for the system's colour scheme, which jsdom doesn't have. */
function systemScheme(dark: boolean) {
  const listeners: ((event: { matches: boolean }) => void)[] = []
  vi.stubGlobal('matchMedia', () => ({
    matches: dark,
    addEventListener: (_: string, listener: (event: { matches: boolean }) => void) =>
      listeners.push(listener),
  }))
  return { change: (matches: boolean) => listeners.forEach((listener) => listener({ matches })) }
}

beforeEach(() => setActivePinia(createPinia()))
afterEach(() => vi.unstubAllGlobals())

describe('useThemeStore', () => {
  it('follows the system until the visitor chooses, setting no data-theme', () => {
    systemScheme(true)
    expect(useThemeStore().theme).toBe('dark')
    expect(document.documentElement.dataset.theme).toBeUndefined()
  })

  it('follows the system as it changes, until the visitor chooses', async () => {
    const system = systemScheme(false)
    const store = useThemeStore()
    expect(store.theme).toBe('light')
    system.change(true)
    expect(store.theme).toBe('dark')
  })

  it('treats a browser without matchMedia as light', () => {
    vi.stubGlobal('matchMedia', undefined)
    expect(useThemeStore().theme).toBe('light')
  })

  it('starts from a saved choice, over the system', () => {
    systemScheme(false)
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    expect(useThemeStore().theme).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('ignores a saved value it doesn’t know', () => {
    systemScheme(false)
    localStorage.setItem(THEME_STORAGE_KEY, 'sepia')
    expect(useThemeStore().theme).toBe('light')
  })

  it('toggles from what’s showing, then applies and saves the choice', async () => {
    systemScheme(true)
    const store = useThemeStore()
    store.toggle()
    await nextTick()
    expect(store.theme).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')

    store.toggle()
    await nextTick()
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('still applies the theme when storage throws', async () => {
    systemScheme(false)
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const store = useThemeStore()
    expect(store.theme).toBe('light')

    store.toggle()
    await nextTick()
    expect(document.documentElement.dataset.theme).toBe('dark')
    getItem.mockRestore()
    setItem.mockRestore()
  })

  it('shares its storage key with the script that applies the theme before first paint', () => {
    expect(indexHtml).toContain(`localStorage.getItem('${THEME_STORAGE_KEY}')`)
  })
})
