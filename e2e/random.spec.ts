import { expect, test } from '@playwright/test'
import { goToSection } from './sections'

test('home shows a Joke of the moment; Random shows another, and another one on request', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.getByRole('blockquote')).toHaveText(/cheetah/)
  await goToSection(page, 'Random')

  await expect(page).toHaveURL('/random')
  await expect(page).toHaveTitle('A random joke · Dad-a-base')
  const joke = page.getByRole('blockquote')
  await expect(joke).toHaveText(/golf/)

  await page.getByRole('button', { name: 'Another one' }).click()
  await expect(joke).toHaveText(/kinder/)
  await expect(page).toHaveURL('/random')
})

test('a deep link to /random loads in the browser, not as a 404', async ({ page }) => {
  await page.goto('/random')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A random joke')
})
