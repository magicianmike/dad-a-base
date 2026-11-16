import { createPinia, setActivePinia } from 'pinia'
import { SHORTCUTS_STORAGE_KEY, useShortcutsStore } from './store'
import { shortcutFor } from './useShortcuts'

beforeEach(() => setActivePinia(createPinia()))

function press(key: string, init: KeyboardEventInit = {}, target: Element = document.body) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  Object.defineProperty(event, 'target', { value: target })
  return event
}

describe('shortcutFor', () => {
  it.each(['/', 'r', '?'])('knows %s', (key) => {
    expect(shortcutFor(press(key))).toBe(key)
  })

  it('ignores other keys, and a capital R', () => {
    expect(shortcutFor(press('x'))).toBeNull()
    expect(shortcutFor(press('R', { shiftKey: true }))).toBeNull()
  })

  it.each([
    ['Control', { ctrlKey: true }],
    ['Command', { metaKey: true }],
    ['Option', { altKey: true }],
  ])('leaves %s with a key to the browser and screen reader', (_, init) => {
    expect(shortcutFor(press('r', init))).toBeNull()
  })

  it('ignores a key mid-composition, or one already handled', () => {
    expect(shortcutFor(press('r', { isComposing: true }))).toBeNull()
    const handled = press('r')
    handled.preventDefault()
    expect(shortcutFor(handled)).toBeNull()
  })

  it.each([
    ['a text field', '<input />'],
    ['a text area', '<textarea></textarea>'],
    ['a select', '<select><option>a</option></select>'],
    ['something editable', '<div contenteditable="true"></div>'],
  ])('lets a key be typed in %s', (_, html) => {
    document.body.innerHTML = html
    const field = document.body.firstElementChild as HTMLElement
    if (field.hasAttribute('contenteditable')) {
      Object.defineProperty(field, 'isContentEditable', { value: true })
    }
    expect(shortcutFor(press('r', {}, field))).toBeNull()
    document.body.innerHTML = ''
  })

  it('stays out of the way while a dialog is open', () => {
    document.body.innerHTML = '<dialog open></dialog>'
    expect(shortcutFor(press('r'))).toBeNull()
    document.body.innerHTML = ''
  })
})

describe('useShortcutsStore', () => {
  it('starts on, and remembers being turned off and on', () => {
    const store = useShortcutsStore()
    expect(store.enabled).toBe(true)
    store.setEnabled(false)
    expect(localStorage.getItem(SHORTCUTS_STORAGE_KEY)).toBe('off')
    setActivePinia(createPinia())
    expect(useShortcutsStore().enabled).toBe(false)
    useShortcutsStore().setEnabled(true)
    expect(localStorage.getItem(SHORTCUTS_STORAGE_KEY)).toBeNull()
  })

  it('gives a key to the latest page that asks, and takes it back only from that one', () => {
    const store = useShortcutsStore()
    const first = vi.fn()
    const second = vi.fn()
    const releaseFirst = store.handle('r', first)
    const releaseSecond = store.handle('r', second)
    releaseFirst()
    expect(store.handlerFor('r')).toBe(second)
    releaseSecond()
    expect(store.handlerFor('r')).toBeUndefined()
  })

  it('still works when storage throws', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const store = useShortcutsStore()
    expect(store.enabled).toBe(true)
    store.setEnabled(false)
    expect(store.enabled).toBe(false)
    getItem.mockRestore()
    setItem.mockRestore()
  })
})
