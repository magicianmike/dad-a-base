import { paginationWindow, parsePage, resultsSummary } from './pagination'

const range = (first: number, last: number) =>
  Array.from({ length: last - first + 1 }, (_, i) => first + i)

describe('paginationWindow', () => {
  it.each([
    [1, 40, range(1, 11)],
    [2, 40, range(1, 11)],
    [6, 40, range(1, 11)],
    [7, 40, range(2, 12)],
    [8, 40, range(3, 13)],
    [35, 40, range(30, 40)],
    [38, 40, range(30, 40)],
    [40, 40, range(30, 40)],
  ])('page %i of %i shows %j', (current, total, expected) => {
    expect(paginationWindow(current, total)).toEqual(expected)
  })

  it('shows every page when there are 11 or fewer', () => {
    expect(paginationWindow(1, 1)).toEqual([1])
    expect(paginationWindow(3, 5)).toEqual(range(1, 5))
    expect(paginationWindow(11, 11)).toEqual(range(1, 11))
  })

  it('stays full with 12 pages, at either end', () => {
    expect(paginationWindow(1, 12)).toEqual(range(1, 11))
    expect(paginationWindow(12, 12)).toEqual(range(2, 12))
  })
})

describe('parsePage', () => {
  it.each([
    [undefined, 1],
    ['', 1],
    ['3', 3],
    ['abc', 1],
    ['0', 1],
    ['-4', 1],
    ['2.6', 3],
    ['Infinity', 1],
    [['4', '9'], 4],
  ])('reads %j as page %i', (raw, page) => {
    expect(parsePage(raw)).toBe(page)
  })
})

describe('resultsSummary', () => {
  it.each([
    [1, 43, 'Jokes 1–10 of 43'],
    [2, 43, 'Jokes 11–20 of 43'],
    [5, 43, 'Jokes 41–43 of 43'],
    [1, 1, 'Joke 1 of 1'],
    [5, 41, 'Joke 41 of 41'],
  ])('page %i of %i jokes reads "%s"', (page, total, summary) => {
    expect(resultsSummary(page, total)).toBe(summary)
  })
})
