import type { ErrorCode } from '@/api/errors'

export interface ErrorCopy {
  /** The page title. Plain. */
  title: string
  /** The label above the headline, in the paper's voice. */
  kicker: string
  /** The joke. */
  headline: string
  /** What happened, plainly, and what to do. Never a joke (docs/voice.md). */
  explanation: string
  /** Whether trying again could help. */
  retryable: boolean
}

export const errorCopy: Record<ErrorCode, ErrorCopy> = {
  '404': {
    title: 'Page not found',
    kicker: 'Correction',
    headline: 'Dad went out for milk. So did this page.',
    explanation:
      "There's nothing at this address. The link may be mistyped, or the joke may never have existed.",
    retryable: false,
  },
  '403': {
    title: 'Access denied',
    kicker: 'Members only',
    headline: 'Sorry, this is a lodge meeting.',
    explanation: "The joke service turned this request away, so there's nothing to show here.",
    retryable: false,
  },
  '429': {
    title: 'Too many requests',
    kicker: 'Slow news day',
    headline: 'Easy, tiger. Even Dad needs a breather.',
    explanation:
      'Too many requests reached the joke service in a short time. Wait a moment, then try again.',
    retryable: true,
  },
  '500': {
    title: 'Server error',
    kicker: 'Stop the presses',
    headline: 'The printing press has jammed.',
    explanation:
      'The joke service had a problem on its end. It usually recovers quickly, so try again in a moment.',
    retryable: true,
  },
  offline: {
    title: "You're offline",
    kicker: 'Delivery delayed',
    headline: "The paper boy can't reach your porch.",
    explanation:
      "Your device seems to be offline, or the joke service can't be reached. Check your connection, then try again.",
    retryable: true,
  },
  unknown: {
    title: 'Something went wrong',
    kicker: 'Errata',
    headline: "Well, that wasn't in the script.",
    explanation:
      "Something went wrong that we didn't expect. Try again, or go back to the front page.",
    retryable: true,
  },
}
