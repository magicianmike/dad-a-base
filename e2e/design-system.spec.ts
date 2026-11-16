import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const routes = [
  '/',
  '/search',
  '/search?q=pun&page=8',
  '/search?q=xyzzy',
  '/random',
  '/jokes/daaUfibh',
  '/design-system',
  '/error/500',
  '/no/such/page',
]

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`${colorScheme} scheme`, () => {
    test.use({ colorScheme })

    for (const path of routes) {
      test(`${path} has no axe violations`, async ({ page }) => {
        await page.goto(path)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
        await page.evaluate(() => document.fonts.ready)
        const { violations } = await new AxeBuilder({ page }).analyze()
        expect(violations).toEqual([])
      })
    }
  })
}

test('the page follows the system scheme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  const dark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  await page.emulateMedia({ colorScheme: 'light' })
  const light = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  expect(dark).toBe('rgb(29, 31, 36)')
  expect(light).toBe('rgb(243, 238, 226)')
})

test('/design-system shows the tokens in both themes, whatever the page’s theme', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/design-system')
  const sides = page.getByRole('region', { name: 'Colour' }).locator('[data-theme]')
  await expect(sides).toHaveCount(2)
  const [light, dark] = await sides.evaluateAll((els) =>
    els.map((el) => getComputedStyle(el).backgroundColor),
  )
  expect(light).toBe('rgb(243, 238, 226)')
  expect(dark).toBe('rgb(29, 31, 36)')
})

for (const path of routes) {
  test(`${path} reflows at 320px with no sideways scrolling`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })
}

test('the masthead names the paper and goes home', async ({ page }) => {
  await page.goto('/random')
  await page.getByRole('link', { name: 'The Dad-a-base' }).first().click()
  await expect(page).toHaveURL('/')
})
