import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('from home, open a random joke and get another one', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Get a random joke' }).click()

  await expect(page).toHaveURL('/random')
  await expect(page).toHaveTitle('A random joke · Dadabase')
  const joke = page.getByRole('blockquote')
  await expect(joke).toHaveText(/cheetah/)

  await page.getByRole('button', { name: 'Another one' }).click()
  await expect(joke).toHaveText(/golf/)
  await expect(page).toHaveURL('/random')
})

test('a deep link to /random loads in the browser, not as a 404', async ({ page }) => {
  await page.goto('/random')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A random joke')
})

for (const path of ['/', '/random']) {
  test(`${path} has no axe violations`, async ({ page }) => {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const { violations } = await new AxeBuilder({ page }).analyze()
    expect(violations).toEqual([])
  })
}
