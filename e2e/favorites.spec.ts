import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const joke = {
  id: 'daaUfibh',
  text: 'Why was the big cat disqualified from the race? Because it was a cheetah.',
}
const golf = { id: 'BI699EY08Ed', joke: 'Bad at golf? Join the club.' }

/**
 * Saves Favorites before the app's code runs, once per tab, so a reload keeps what the test changed. Writing
 * localStorage from one page and then navigating races in WebKit: the next page can load before the write lands.
 */
async function seed(page: Page, saved: { id: string; joke: string }[]) {
  await page.addInitScript((value) => {
    if (sessionStorage.getItem('seeded')) return
    localStorage.setItem('dadabase:favorites', value)
    sessionStorage.setItem('seeded', 'yes')
  }, JSON.stringify(saved))
}

test('a Joke saved on home is on home and Favorites, and opens from there', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('blockquote').first()).toHaveText(joke.text)
  await page.getByRole('button', { name: 'Favorite', exact: true }).click()

  const peek = page.getByRole('region', { name: 'From your fridge' })
  await expect(peek.getByRole('link', { name: joke.text })).toBeVisible()

  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Favorites' })
    .click()
  await expect(page).toHaveURL('/favorites')
  await expect(page.getByRole('heading', { level: 1, name: 'Stuck to the fridge' })).toBeFocused()
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('1 saved joke')

  await page.getByRole('link', { name: joke.text }).click()
  await expect(page).toHaveURL(`/jokes/${joke.id}`)
  await expect(page.getByRole('button', { name: 'Favorited', exact: true })).toBeVisible()
})

test('removing a Joke takes it off, moves focus to the next, and lasts', async ({ page }) => {
  await seed(page, [golf, { id: joke.id, joke: joke.text }])
  await page.goto('/favorites')
  const remove = page.getByRole('button', { name: 'Remove from favorites' })
  await remove.first().click()
  await expect(page.getByRole('link', { name: golf.joke })).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('1 saved joke')
  await expect(remove).toHaveCount(1)
  await expect(remove).toBeFocused()

  await page.reload()
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('1 saved joke')
  await page.getByRole('button', { name: 'Remove from favorites' }).click()
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Nothing on the fridge yet')
  await expect(page.getByRole('heading', { level: 2 })).toBeFocused()
})

test('the Remove button’s tooltip shows on hover and focus, and Escape hides it', async ({
  page,
}) => {
  await seed(page, [golf])
  await page.goto('/favorites')
  const remove = page.getByRole('button', { name: 'Remove from favorites' })
  const tip = remove.getByText('Remove from favorites')
  await expect(tip).toHaveCSS('opacity', '0')
  await remove.hover()
  await expect(tip).toHaveCSS('opacity', '1')
  await page.keyboard.press('Escape')
  await expect(tip).toHaveCSS('opacity', '0')

  // Pressing the tooltip itself doesn't remove the Joke.
  await page.mouse.move(0, 0)
  await remove.hover()
  await tip.click()
  await expect(page.getByRole('link', { name: golf.joke })).toBeVisible()
})

/** 25 numbered Favorites, newest first: three pages. */
const many = Array.from({ length: 25 }, (_, i) => ({
  id: `fav${i + 1}`,
  joke: `Favorite ${i + 1}: ${i % 2 ? 'a dog joke' : 'a pun'}.`,
}))

test('Favorites search as you type, and page ten at a time', async ({ page }) => {
  await seed(page, many)
  await page.goto('/favorites')
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Jokes 1–10 of 25')

  await page
    .getByRole('navigation', { name: 'Pages' })
    .getByRole('link', { name: 'Page 3' })
    .click()
  await expect(page).toHaveURL('/favorites?page=3')
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Jokes 21–25 of 25')
  await expect(page.getByRole('heading', { level: 2 })).toBeFocused()

  const box = page.getByRole('searchbox', { name: 'Search your favorites' })
  await box.fill('dog')
  await expect(page).toHaveURL('/favorites?q=dog')
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Jokes 1–10 of 12 about “dog”')
  await expect(box).toBeFocused()

  await page.goBack()
  await expect(page).toHaveURL('/favorites')
})

for (const colorScheme of ['light', 'dark'] as const) {
  test(`/favorites with Favorites has no axe violations, ${colorScheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme })
    await seed(page, [golf, { id: joke.id, joke: joke.text }])
    await page.goto('/favorites')
    await expect(page.getByRole('heading', { level: 2 })).toHaveText('2 saved jokes')
    await page.evaluate(() => document.fonts.ready)
    const { violations } = await new AxeBuilder({ page }).analyze()
    expect(violations).toEqual([])
  })
}

for (const path of ['/', `/jokes/${golf.id}`, '/favorites', '/search?q=golf']) {
  test(`${path} with a Favorite's heart reflows at 320px`, async ({ page }) => {
    await seed(page, [golf])
    await page.setViewportSize({ width: 320, height: 640 })
    await page.goto(path)
    await expect(page.locator('blockquote').first()).toBeVisible()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })
}

test('a Favorite wears a heart wherever its card shows, but not on the Favorites page', async ({
  page,
}) => {
  await seed(page, [golf])
  await page.goto('/search?q=golf')
  await expect(page.getByRole('img', { name: 'One of your favorites' })).toBeVisible()
  await page.goto('/favorites')
  await expect(page.getByRole('button', { name: 'Remove from favorites' })).toBeVisible()
  await expect(page.getByRole('img', { name: 'One of your favorites' })).toHaveCount(0)
})
