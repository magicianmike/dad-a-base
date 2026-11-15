import { errorCodes } from '@/api/errors'
import { errorCopy } from './copy'

// The voice guide's rules for Error states (docs/voice.md).
describe.each(errorCodes)('the %s Error state', (code) => {
  const copy = errorCopy[code]

  it('has a title, a kicker, a headline and an explanation', () => {
    for (const text of [copy.title, copy.kicker, copy.headline, copy.explanation]) {
      expect(text.trim()).not.toBe('')
    }
  })

  it('explains what happened in full sentences, apart from the headline', () => {
    expect(copy.explanation).toMatch(/^[A-Z].*\.$/)
    expect(copy.explanation.split('. ').length).toBeGreaterThanOrEqual(1)
    expect(copy.explanation).not.toBe(copy.headline)
  })

  it('uses no exclamation marks', () => {
    for (const text of [copy.title, copy.kicker, copy.headline, copy.explanation]) {
      expect(text).not.toContain('!')
    }
  })
})

it('offers to try again only where trying again could help', () => {
  const retryable = errorCodes.filter((code) => errorCopy[code].retryable)
  expect(retryable).toEqual(['429', '500', 'offline', 'unknown'])
})
