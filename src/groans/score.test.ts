import {
  GROAN_FULL_MS,
  GROAN_MAX_HS,
  groanAnnouncement,
  groanFraction,
  groanLabel,
  groanScore,
} from './score'

describe('groanFraction', () => {
  it('is the share of a full hold, from 0 to 1', () => {
    expect(GROAN_FULL_MS).toBe(3000)
    expect(groanFraction(0)).toBe(0)
    expect(groanFraction(1500)).toBe(0.5)
    expect(groanFraction(3000)).toBe(1)
  })

  it('stops at 1, however long the hold, and never goes below 0', () => {
    expect(groanFraction(9000)).toBe(1)
    expect(groanFraction(-5)).toBe(0)
  })
})

describe('groanScore', () => {
  it('is out of 10, to a tenth', () => {
    expect(groanScore(0.72)).toBe('7.2')
    expect(groanScore(0.724)).toBe('7.2')
    expect(groanScore(0.725)).toBe('7.3')
    expect(groanScore(1)).toBe('10.0')
  })

  it('starts at 1.0, just past a tap', () => {
    expect(groanScore(0.1)).toBe('1.0')
  })

  it('is none for a tap, under 300ms', () => {
    expect(groanScore(0)).toBeNull()
    expect(groanScore(groanFraction(299))).toBeNull()
    expect(groanScore(groanFraction(300))).toBe('1.0')
  })
})

describe('groanLabel', () => {
  it.each([
    [0, 'Ugh'],
    [0.08, 'Ugh'],
    [groanFraction(250), 'Ughh'],
    [groanFraction(500), 'Ughhh'],
    [groanFraction(1500), `Ugh${'h'.repeat(6)}`],
    [0.99, `Ugh${'h'.repeat(11)}`],
    [1, `Ugh${'h'.repeat(12)}!`],
  ])('at %s is %s', (fraction, label) => {
    expect(groanLabel(fraction)).toBe(label)
  })

  it('gains an h steadily, one each quarter second, never skipping or losing one', () => {
    expect(GROAN_MAX_HS).toBe(12)
    const lengths = Array.from({ length: 13 }, (_, i) => groanLabel(groanFraction(i * 250)).length)
    expect(lengths.slice(0, 12)).toEqual(Array.from({ length: 12 }, (_, i) => 3 + i))
  })
})

describe('groanAnnouncement', () => {
  it('says the score out of 10, or that it was a groan', () => {
    expect(groanAnnouncement(0.72)).toBe('Groan score 7.2 out of 10.')
    expect(groanAnnouncement(0.02)).toBe('Groaned.')
  })
})
