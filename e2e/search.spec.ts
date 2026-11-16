import { expect, test } from '@playwright/test'

test('home searches, then typing searches again, replacing the history entry', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('searchbox', { name: 'Search the jokes' }).fill('golf')
  await page.getByRole('searchbox', { name: 'Search the jokes' }).press('Enter')

  await expect(page).toHaveURL('/search?q=golf')
  await expect(page.getByRole('heading', { level: 1, name: 'Search the archives' })).toBeFocused()
  await expect(page.getByRole('link', { name: 'Bad at golf? Join the club.' })).toBeVisible()

  const box = page.getByRole('searchbox', { name: 'Search the jokes' })
  await box.fill('dog')
  await expect(page).toHaveURL('/search?q=dog')
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Jokes 1–10 of 43')
  await expect(box).toBeFocused()
  await expect(page).toHaveTitle('Jokes about “dog” · Dad-a-base')

  // Typing replaced /search?q=golf, so Back goes home.
  await page.goBack()
  await expect(page).toHaveURL('/')
})

test('the Pagination window turns pages, back at the top with focus on the results heading', async ({
  page,
}) => {
  await page.goto('/search?q=pun&page=8')
  const pages = page.getByRole('navigation', { name: 'Pages' })
  await expect(pages.getByRole('listitem')).toHaveText(
    Array.from({ length: 11 }, (_, i) => String(i + 3)),
  )
  await expect(pages.getByRole('link', { name: 'Page 8' })).toHaveAttribute('aria-current', 'page')

  await pages.getByRole('link', { name: 'Next' }).click()
  await expect(page).toHaveURL('/search?q=pun&page=9')
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Jokes 81–90 of 400')
  await expect(page.getByRole('heading', { level: 2 })).toBeFocused()
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0)
  await expect(pages.getByRole('listitem').first()).toHaveText('4')

  await page.goBack()
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Jokes 71–80 of 400')
})

test('a page past the end is replaced with the last page', async ({ page }) => {
  await page.goto('/search?q=dog&page=99')
  await expect(page).toHaveURL('/search?q=dog&page=5')
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Jokes 41–43 of 43')
  await expect(
    page.getByRole('navigation', { name: 'Pages' }).getByRole('link', { name: 'Next' }),
  ).toHaveAttribute('aria-disabled', 'true')
})

test('no results is an inline empty state with suggestions', async ({ page }) => {
  await page.goto('/search?q=xyzzy')
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Nothing on file for “xyzzy”')
  await page.getByRole('link', { name: 'dog', exact: true }).click()
  await expect(page).toHaveURL('/search?q=dog')
  await expect(page.getByRole('searchbox')).toHaveValue('dog')
  await expect(page.getByRole('heading', { level: 2 })).toBeFocused()
})

test('a result opens its Joke, and the search is remembered', async ({ page }) => {
  await page.goto('/search?q=golf')
  await page.getByRole('link', { name: 'Bad at golf? Join the club.' }).click()
  await expect(page).toHaveURL('/jokes/BI699EY08Ed')
  await expect(page.getByRole('blockquote')).toHaveText('Bad at golf? Join the club.')

  await page.goto('/search')
  await expect(
    page.getByRole('region', { name: 'Recent searches' }).getByRole('link', { name: 'golf' }),
  ).toBeVisible()
})

test('Search shows the Error state when the API fails', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('dadabase:mock-failure', '500'))
  await page.goto('/search?q=dog')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('The printing press has jammed.')
})
