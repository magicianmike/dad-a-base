import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { settled } from './settled'
import { goToSection } from './sections'

const FAILURE_KEY = 'dadabase:mock-failure'

test.describe('theme', () => {
  const toggle = (page: import('@playwright/test').Page) =>
    page.getByRole('button', { name: 'Dark theme' })

  test('follows the system until the visitor toggles, then keeps the choice across a reload', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('html')).not.toHaveAttribute('data-theme')

    await toggle(page).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(243, 238, 226)')

    await page.reload()
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false')
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(243, 238, 226)')
  })

  test('the saved theme applies before the app’s code runs, so the page never flashes', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('dadabase:theme', 'dark'))
    // Fail every script but the inline one, so only the HTML, the CSS and the inline script run.
    await page.route('**/assets/*.js', (route) => route.abort())
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })
})

test('the first Tab reaches the skip link, which moves focus to the main story', async ({
  page,
  browserName,
}) => {
  test.skip(browserName === 'webkit', 'Safari only tabs to links with Option-Tab by default')
  await page.goto('/random')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Skip to the main story' })
  await expect(skip).toBeFocused()
  await expect(skip).toBeInViewport()
  await page.keyboard.press('Enter')
  await expect(page.locator('main')).toBeFocused()
})

test('navigating moves focus to the new page’s headline and marks the current page', async ({
  page,
}) => {
  await page.goto('/')
  await goToSection(page, 'Random')
  await expect(page.getByRole('heading', { level: 1, name: 'A random joke' })).toBeFocused()
  // On a phone the header's row is hidden behind the Sections menu, but still marked.
  await expect(
    page
      .getByRole('navigation', { name: 'Main', includeHidden: true })
      .getByRole('link', { name: 'Random', includeHidden: true }),
  ).toHaveAttribute('aria-current', 'page')
})

test.describe('the Sections menu', () => {
  type Page = import('@playwright/test').Page
  const menu = (page: Page) => page.getByRole('button', { name: 'Sections' })
  const drawer = (page: Page) => page.getByRole('dialog', { name: 'Sections' })
  const nav = (page: Page) => page.getByRole('navigation', { name: 'Main' })

  test('is only on a phone; wider, the sections show in a row', async ({ page, isMobile }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    if (isMobile) {
      await expect(menu(page)).toBeVisible()
      await expect(nav(page)).toHaveCount(0)
    } else {
      await expect(menu(page)).toBeHidden()
      await expect(nav(page).getByRole('link', { name: 'Random' })).toBeVisible()
    }
  })

  test.describe('on a phone', () => {
    test.skip(({ isMobile }) => !isMobile, 'The Sections menu is only on a phone')

    test('sits at the top left, and opens a drawer from the left edge', async ({ page }) => {
      await page.goto('/')
      const button = (await menu(page).boundingBox())!
      const toggle = (await page.getByRole('button', { name: 'Dark theme' }).boundingBox())!
      expect(button.x).toBeLessThan(toggle.x)
      expect(button.y).toBeLessThan(100)

      await menu(page).click()
      await expect(drawer(page)).toBeVisible()
      await settled(page)
      expect((await drawer(page).boundingBox())!.x).toBe(0)
    })

    test('lists every section, marks the current one, and closes when one is chosen', async ({
      page,
    }) => {
      await page.goto('/random')
      await menu(page).click()
      await expect(nav(page).getByRole('link')).toHaveText([
        'Home',
        'Search',
        'Random',
        'Faves',
        'Groans',
      ])
      await expect(nav(page).getByRole('link', { name: 'Random' })).toHaveAttribute(
        'aria-current',
        'page',
      )

      await nav(page).getByRole('link', { name: 'Search' }).click()
      await expect(page).toHaveURL('/search')
      await expect(drawer(page)).toBeHidden()
      await expect(
        page.getByRole('heading', { level: 1, name: 'Search the archives' }),
      ).toBeFocused()
    })

    test('Escape closes it and returns focus to the button', async ({ page }) => {
      await page.goto('/')
      await menu(page).click()
      await expect(drawer(page)).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(drawer(page)).toBeHidden()
      await expect(menu(page)).toBeFocused()
    })

    test('Close, or a tap on the page beside it, closes it', async ({ page }) => {
      await page.goto('/')
      await menu(page).click()
      await page.getByRole('button', { name: 'Close' }).click()
      await expect(drawer(page)).toBeHidden()

      await menu(page).click()
      await expect(drawer(page)).toBeVisible()
      const viewport = page.viewportSize()!
      await page.mouse.click(viewport.width - 10, viewport.height / 2)
      await expect(drawer(page)).toBeHidden()
    })

    for (const colorScheme of ['light', 'dark'] as const) {
      test(
        `open, it has no axe violations, ${colorScheme}`,
        { tag: '@axe-phone' },
        async ({ page }) => {
          await page.emulateMedia({ colorScheme })
          await page.goto('/')
          await menu(page).click()
          await settled(page)
          const { violations } = await new AxeBuilder({ page }).analyze()
          expect(violations).toEqual([])
        },
      )
    }

    test(
      'open at 320px, every link is a full touch target',
      { tag: '@reflow' },
      async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 640 })
        await page.goto('/')
        await menu(page).click()
        for (const target of [menu(page), ...(await nav(page).getByRole('link').all())]) {
          const box = (await target.boundingBox())!
          expect(box.height).toBeGreaterThanOrEqual(44)
        }
        const scroll = await page.evaluate(() => document.documentElement.scrollWidth)
        expect(scroll).toBeLessThanOrEqual(320)
      },
    )
  })
})

test('an unknown address shows the 404 in place, keeping the address', async ({ page }) => {
  await page.goto('/no/such/page')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Dad went out for milk. So did this page.',
  )
  await expect(page).toHaveURL('/no/such/page')
  await expect(page).toHaveTitle('Page not found · Dad-a-base')
  await page.getByRole('link', { name: 'Front page' }).click()
  await expect(page).toHaveURL('/')
})

test.describe('when the API fails', () => {
  test('/random shows the Error state and recovers on "Try again"', async ({ page }) => {
    await page.addInitScript((key) => {
      if (!sessionStorage.getItem(`${key}:set`)) {
        sessionStorage.setItem(key, '503')
        sessionStorage.setItem(`${key}:set`, '1')
      }
    }, FAILURE_KEY)
    await page.goto('/random')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'The printing press has jammed.',
    )
    await expect(page).toHaveTitle('Server error · Dad-a-base')

    await page.evaluate((key) => sessionStorage.removeItem(key), FAILURE_KEY)
    await page.getByRole('button', { name: 'Try again' }).click()
    await expect(page.getByRole('blockquote')).toHaveText(/cheetah/)
  })

  for (const [failure, headline] of [
    ['429', 'Easy, tiger. Even Dad needs a breather.'],
    ['offline', 'The paper boy can’t reach your porch.'.replace('’', "'")],
  ]) {
    test(`/random shows the ${failure} Error state`, async ({ page, browserName }) => {
      // On WebKit, MSW's simulated network error reads "Response served by service worker is an error", not
      // Safari's "Load failed" (which errors.test.ts covers), so it maps to unknown.
      test.skip(
        failure === 'offline' && browserName === 'webkit',
        'MSW can’t simulate Safari’s offline error',
      )
      await page.addInitScript(
        ([key, value]) => sessionStorage.setItem(key!, value!),
        [FAILURE_KEY, failure],
      )
      await page.goto('/random')
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(headline!)
    })
  }
})

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`${colorScheme} scheme`, () => {
    test.use({ colorScheme })

    for (const code of ['404', '403', '429', '500', 'offline', 'unknown']) {
      test(`/error/${code} has no axe violations`, { tag: '@axe' }, async ({ page }) => {
        await page.goto(`/error/${code}`)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
        await settled(page)
        const { violations } = await new AxeBuilder({ page }).analyze()
        expect(violations).toEqual([])
      })
    }
  })
}
