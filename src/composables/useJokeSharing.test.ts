import { jokes } from '@/mocks/fixtures'
import { copyShortcut, copyText, selectText, shareJoke } from './useJokeSharing'

const joke = jokes[0]!
const url = 'https://the-dad-a-base.vercel.app/jokes/daaUfibh'

function stubClipboard(writeText: () => Promise<void>) {
  vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText: vi.fn(writeText) } })
  return navigator.clipboard.writeText as ReturnType<typeof vi.fn>
}

afterEach(() => vi.unstubAllGlobals())

describe('copyText', () => {
  it('copies', async () => {
    const writeText = stubClipboard(async () => {})
    await expect(copyText('Hi')).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledWith('Hi')
  })

  it('reports a denied clipboard', async () => {
    stubClipboard(async () => Promise.reject(new DOMException('Denied', 'NotAllowedError')))
    await expect(copyText('Hi')).resolves.toBe(false)
  })

  it('reports a browser with no Clipboard API', async () => {
    vi.stubGlobal('navigator', { ...navigator, clipboard: undefined })
    await expect(copyText('Hi')).resolves.toBe(false)
  })
})

describe('copyShortcut', () => {
  it.each([
    ['MacIntel', '', '⌘C'],
    ['Win32', '', 'Ctrl+C'],
    ['', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)', '⌘C'],
  ])('on %s %s is %s', (platform, userAgent, shortcut) => {
    vi.stubGlobal('navigator', { ...navigator, platform, userAgent })
    expect(copyShortcut()).toBe(shortcut)
  })
})

describe('selectText', () => {
  it('selects all of an element’s text', () => {
    document.body.innerHTML = '<p>Bad at golf? Join the club.</p>'
    selectText(document.querySelector('p')!)
    expect(getSelection()?.toString()).toBe('Bad at golf? Join the club.')
  })
})

describe('shareJoke', () => {
  it('uses the share sheet where there is one', async () => {
    const share = vi.fn(async () => {})
    vi.stubGlobal('navigator', { ...navigator, share, canShare: () => true })
    await expect(shareJoke(joke, url)).resolves.toBe('shared')
    expect(share).toHaveBeenCalledWith({
      title: 'A joke from The Dad-a-base',
      text: joke.joke,
      url,
    })
  })

  it('treats closing the share sheet as a choice, not a failure', async () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      share: async () => Promise.reject(new DOMException('Cancelled', 'AbortError')),
    })
    await expect(shareJoke(joke, url)).resolves.toBe('cancelled')
  })

  it('copies the link when the share sheet fails', async () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      share: async () => Promise.reject(new DOMException('No', 'NotAllowedError')),
      clipboard: { writeText: async () => {} },
    })
    await expect(shareJoke(joke, url)).resolves.toBe('copied-link')
  })

  it('copies the link where there’s no share sheet, or it can’t share this', async () => {
    const writeText = stubClipboard(async () => {})
    await expect(shareJoke(joke, url)).resolves.toBe('copied-link')
    vi.stubGlobal('navigator', { ...navigator, share: vi.fn(), canShare: () => false })
    await expect(shareJoke(joke, url)).resolves.toBe('copied-link')
    expect(navigator.share).not.toHaveBeenCalled()
    expect(writeText).toHaveBeenCalledWith(url)
  })

  it('fails when it can neither share nor copy', async () => {
    stubClipboard(async () => Promise.reject(new Error('no')))
    await expect(shareJoke(joke, url)).resolves.toBe('failed')
  })
})
