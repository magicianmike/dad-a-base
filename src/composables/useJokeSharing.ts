import type { Joke } from '@/api/schemas'

/** Copies text, or reports that it couldn't: the Clipboard API is missing, denied, or needs a gesture. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/** The modifier for copying by hand, as the visitor's keyboard labels it. */
export function copyShortcut(): string {
  return /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘C' : 'Ctrl+C'
}

/** Selects an element's text, so the visitor can copy it by hand. */
export function selectText(element: Element) {
  const range = document.createRange()
  range.selectNodeContents(element)
  const selection = getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}

export type ShareOutcome = 'shared' | 'cancelled' | 'copied-link' | 'failed'

/**
 * Shares a Joke's page with the system share sheet where there is one, or copies its link.
 * Closing the share sheet without sharing is a choice, not a failure.
 */
export async function shareJoke(joke: Joke, url: string): Promise<ShareOutcome> {
  const data = { title: 'A joke from The Dad-a-base', text: joke.joke, url }
  if (typeof navigator.share === 'function' && (navigator.canShare?.(data) ?? true)) {
    try {
      await navigator.share(data)
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
    }
  }
  return (await copyText(url)) ? 'copied-link' : 'failed'
}
