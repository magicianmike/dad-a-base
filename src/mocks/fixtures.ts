import type { Joke } from '@/api/schemas'

export const jokes: Joke[] = [
  {
    id: 'daaUfibh',
    joke: 'Why was the big cat disqualified from the race? Because it was a cheetah.',
  },
  { id: 'BI699EY08Ed', joke: 'Bad at golf? Join the club.' },
  { id: 'ORKmyAIYvzd', joke: 'No matter how kind you are, German children are kinder.' },
]

/** Made-up Jokes, numbered, so Search has pages to turn. */
function numbered(count: number, id: string, joke: (n: number) => string): Joke[] {
  return Array.from({ length: count }, (_, i) => ({ id: `${id}${i + 1}`, joke: joke(i + 1) }))
}

/**
 * Everything the mock Search looks through: the Jokes above, 43 about a dog (5 pages, the last one short) and 400
 * puns (40 pages, enough to slide the Pagination window).
 */
export const archive: Joke[] = [
  ...jokes,
  ...numbered(
    43,
    'dog',
    (n) => `Dog joke ${n}: my dog ate my homework, so I gave him a ruff grade.`,
  ),
  ...numbered(400, 'pun', (n) => `Pun ${n}: I'd tell you one about paper, but it's tearable.`),
]
