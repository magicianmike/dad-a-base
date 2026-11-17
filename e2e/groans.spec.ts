import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'
import { goToSection } from './sections'
import { settled } from './settled'

const cheetah = 'daaUfibh'
// Its name is "Groan", then "Groan: Ughhh…" from the moment it's held.
const groanButton = (page: Page) => page.getByRole('button', { name: /^Groan/ })
/** The hover nudge's animations running on the button and around it, by name. */
const nudges = (button: Locator) =>
  button.evaluate((el) =>
    el
      .closest('.groan')!
      .getAnimations({ subtree: true })
      .map((a) => (a as CSSAnimation).animationName?.replace(/-[\da-f]{8}$/, ''))
      .filter((name) => name?.startsWith('nudge'))
      .sort(),
  )
const level = (button: Locator) =>
  button.evaluate((el) => Number(getComputedStyle(el).getPropertyValue('--groan-level')))

/**
 * Presses the button, holds it for `ms`, and lets go unless told not to. With the mouse, except on the emulated
 * iPhone, where Playwright's mouse sends nothing and it has no long press, so touch pointer events go to the button.
 */
async function hold(page: Page, button: Locator, ms: number, { letGo = true } = {}) {
  if (test.info().project.name === 'mobile-webkit') {
    const touch = { button: 0, pointerType: 'touch', isPrimary: true }
    await button.dispatchEvent('pointerdown', touch)
    await page.waitForTimeout(ms)
    if (letGo) await button.dispatchEvent('pointerup', touch)
    return
  }
  const box = (await button.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(ms)
  if (letGo) await page.mouse.up()
}

test('on a Joke’s page, a hold records a Groan, announced and shown', async ({ page }) => {
  await page.goto(`/jokes/${cheetah}`)
  const button = groanButton(page)
  await hold(page, button, 1500)
  await expect(page.getByText(/^GROAN! \d+\.\d$/)).toBeVisible()
  await expect(page.getByRole('status')).toContainText(/Groan score \d+\.\d out of 10\./)
  await expect(button).toHaveAccessibleDescription(/^Your groan: \d+\.\d\/10\./)
  // The fill rests at the score.
  expect(await level(button)).toBeGreaterThan(0.4)

  // It's remembered.
  await page.reload()
  await expect(groanButton(page)).toHaveAccessibleDescription(/^Your groan: /)
})

test('home and Random have it beside "Another"', async ({ page }) => {
  for (const path of ['/', '/random']) {
    await page.goto(path)
    await expect(page.getByRole('blockquote')).toBeVisible()
    await expect(groanButton(page)).toBeVisible()
  }
})

test('it shares the line when its widest label fits there, else wraps, and never moves while held', async ({
  page,
  isMobile,
}) => {
  for (const [path, neighbour] of [
    [`/jokes/${cheetah}`, 'Fave'],
    ['/', 'Another'],
  ] as const) {
    await page.goto(path)
    const button = groanButton(page)
    const before = (await page.getByRole('button', { name: neighbour, exact: true }).boundingBox())!
    const box = (await button.boundingBox())!
    if (isMobile) expect(box.y).toBeGreaterThanOrEqual(before.y + before.height)
    else expect(Math.abs(box.y - before.y)).toBeLessThan(10)

    // Held to full, at its widest, it stays where it's laid out: the shake and the press are transforms, not layout.
    const laidOut = () => button.evaluate((el: HTMLElement) => [el.offsetLeft, el.offsetTop])
    const atRest = await laidOut()
    await hold(page, button, 3200, { letGo: false })
    expect(await laidOut()).toEqual(atRest)
    if (test.info().project.name === 'mobile-webkit') await button.dispatchEvent('pointerup')
    else await page.mouse.up()
    await page.evaluate(() => localStorage.clear())
  }
})

test('a quick tap records nothing, and shows how it works', async ({ page }) => {
  await page.goto(`/jokes/${cheetah}`)
  const button = groanButton(page)
  await hold(page, button, 80)
  await expect(page.getByRole('tooltip')).toBeVisible()
  await page.waitForTimeout(500)
  await expect(button).toHaveAccessibleName('Groan')
  expect(await page.evaluate(() => localStorage.getItem('dadabase:groans'))).toBeNull()
})

test('sliding off while held records nothing, and the fill drains', async ({ page }) => {
  await page.goto(`/jokes/${cheetah}`)
  const button = groanButton(page)
  await hold(page, button, 1000, { letGo: false })
  if (test.info().project.name === 'mobile-webkit') await button.dispatchEvent('pointercancel')
  else {
    await page.mouse.move(0, 0)
    await page.mouse.up()
  }
  await expect.poll(() => level(button)).toBe(0)
  await expect(button).toHaveAccessibleDescription(/^Press and hold/)
})

test('Space holds it from the keyboard', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'Safari only tabs to links with Option-Tab by default')
  await page.goto(`/jokes/${cheetah}`)
  await groanButton(page).focus()
  await page.keyboard.down(' ')
  await page.waitForTimeout(800)
  await page.keyboard.up(' ')
  await expect(page.getByRole('status')).toContainText(/Groan score \d+\.\d out of 10\./)
})

test.describe('with a mouse', () => {
  test.skip(({ isMobile }) => isMobile, 'Phones have no hover')

  test('hovering nudges it, a quick quarter-fill and a bump, then a rest, until it’s groaned at', async ({
    page,
  }) => {
    await page.goto(`/jokes/${cheetah}`)
    const button = groanButton(page)
    await button.hover()
    await expect(page.getByRole('tooltip')).toHaveText(
      'Press and hold to groan, the longer the groan the worse the joke.',
    )
    await expect.poll(() => nudges(button)).toEqual(['nudge-bump', 'nudge-fill'])
    // It peaks at a quarter, early in each loop.
    await expect.poll(() => level(button), { intervals: [50] }).toBeGreaterThan(0.15)
    expect(await level(button)).toBeLessThanOrEqual(0.25)

    await page.mouse.move(0, 0)
    await expect.poll(() => nudges(button)).toEqual([])
    await expect.poll(() => level(button)).toBe(0)

    // Groaned at, it rests at its score instead.
    await hold(page, button, 500)
    await page.waitForTimeout(1500)
    await button.hover()
    expect(await nudges(button)).toEqual([])
  })

  test('hovering the empty part of its line does nothing; only the button nudges', async ({
    page,
  }) => {
    await page.goto(`/jokes/${cheetah}`)
    const button = groanButton(page)
    const box = (await button.boundingBox())!
    const line = (await button
      .locator('xpath=ancestor::div[contains(@class,"groan")]')
      .boundingBox())!
    expect(line.x + line.width).toBeGreaterThan(box.x + box.width + 40)
    await page.mouse.move(box.x + box.width + 30, box.y + box.height / 2)
    await page.waitForTimeout(400)
    expect(await nudges(button)).toEqual([])
    await expect(page.getByRole('tooltip')).toBeHidden()

    await button.hover()
    await expect.poll(() => nudges(button)).toEqual(['nudge-bump', 'nudge-fill'])
  })

  test('held full, it shakes and reads "Ughhh…!", and records 10.0', async ({ page }) => {
    await page.goto(`/jokes/${cheetah}`)
    const button = groanButton(page)
    await hold(page, button, 3200, { letGo: false })
    await expect(page.getByRole('button', { name: /^Groan: Ugh+!$/ })).toBeVisible()
    const shaking = await page
      .getByRole('button', { name: /^Groan: Ugh+!$/ })
      .evaluate((el) => getComputedStyle(el).animationName)
    expect(shaking).toMatch(/shake/)
    await page.mouse.up()
    await expect(page.getByText('GROAN! 10.0')).toBeVisible()
  })

  test('under reduced motion, no nudge and no shake, but it still fills', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(`/jokes/${cheetah}`)
    const button = groanButton(page)
    await button.hover()
    await page.waitForTimeout(600)
    expect(await nudges(button)).toEqual([])
    expect(await level(button)).toBe(0)

    await hold(page, button, 3200, { letGo: false })
    const full = page.getByRole('button', { name: /^Groan: Ugh+!$/ })
    expect(await full.evaluate((el) => getComputedStyle(el).animationName)).toBe('none')
    expect(await level(full)).toBe(1)
    await page.mouse.up()
  })
})

for (const colorScheme of ['light', 'dark'] as const) {
  test(
    `mid-hold and after, no axe violations, ${colorScheme}`,
    { tag: '@axe' },
    async ({ page }) => {
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' })
      await page.goto(`/jokes/${cheetah}`)
      const button = groanButton(page)
      await hold(page, button, 1500, { letGo: false })
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await page.mouse.up()
      await button.dispatchEvent('pointerup', { button: 0 })
      await settled(page)
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    },
  )
}

test.describe('the Groan Leaderboard', () => {
  const saved = [
    { joke: { id: 'BI699EY08Ed', joke: 'Bad at golf? Join the club.' }, score: 0.9 },
    {
      joke: { id: 'ORKmyAIYvzd', joke: 'No matter how kind you are, German children are kinder.' },
      score: 0.12,
    },
  ].map((groan) => ({ ...groan, groanedAt: '2026-11-16T12:00:00.000Z' }))
  const withGroans = (page: Page) =>
    page.addInitScript((groans) => {
      if (!sessionStorage.getItem('seeded')) {
        localStorage.setItem('dadabase:groans', JSON.stringify(groans))
        sessionStorage.setItem('seeded', '1')
      }
    }, saved)

  test('a Groan on a Joke’s page goes on the board, worst first, and opens from there', async ({
    page,
  }) => {
    await withGroans(page)
    await page.goto(`/jokes/${cheetah}`)
    await hold(page, groanButton(page), 1500)
    await expect(page.getByRole('status')).toContainText('Groan score')

    await goToSection(page, 'Groans')
    await expect(page).toHaveURL('/groans')
    await expect(
      page.getByRole('heading', { level: 1, name: 'The worst of the worst' }),
    ).toBeFocused()
    await expect(page.getByRole('heading', { level: 2 })).toHaveText('3 groaned jokes')
    const rows = page.getByRole('list').first().getByRole('listitem')
    await expect(rows.nth(0)).toContainText('Bad at golf?')
    await expect(rows.nth(0)).toContainText('9.0/10')
    await expect(rows.nth(1)).toContainText('cheetah')
    await expect(rows.nth(2)).toContainText('1.2/10')

    await rows.nth(1).getByRole('link').click()
    await expect(page).toHaveURL(`/jokes/${cheetah}`)
  })

  test('Remove takes a Groan off, and the last leaves the empty state', async ({ page }) => {
    await withGroans(page)
    await page.goto('/groans')
    const remove = page.getByRole('button', { name: 'Remove from groans' })
    await expect(remove).toHaveCount(2)
    await remove.first().click()
    await expect(remove).toHaveCount(1)
    await expect(remove).toBeFocused()
    await remove.click()
    await expect(page.getByRole('heading', { level: 2, name: 'No groans yet' })).toBeFocused()
  })

  test('a removed card falls off the board, as on Faves, but not under reduced motion', async ({
    page,
  }) => {
    await withGroans(page)
    await page.goto('/groans')
    const falling = () =>
      page.evaluate(() => document.querySelectorAll('.fall-leave-active').length)
    await page.getByRole('button', { name: 'Remove from groans' }).first().click()
    expect(await falling()).toBe(1)
    await expect.poll(falling).toBe(0)
    await expect(page.getByRole('button', { name: 'Remove from groans' })).toHaveCount(1)

    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.getByRole('button', { name: 'Remove from groans' }).click()
    await expect(page.getByRole('heading', { level: 2, name: 'No groans yet' })).toBeFocused()
    const transitions = await page.evaluate(
      () => document.getAnimations().filter((a) => a instanceof CSSTransition).length,
    )
    expect(transitions).toBe(0)
  })

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`with Groans, no axe violations, ${colorScheme}`, { tag: '@axe' }, async ({ page }) => {
      await page.emulateMedia({ colorScheme })
      await withGroans(page)
      await page.goto('/groans')
      await expect(page.getByRole('heading', { level: 2 })).toHaveText('2 groaned jokes')
      await settled(page)
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    })
  }

  test(
    'with Groans, it reflows at 320px with full touch targets',
    { tag: '@reflow' },
    async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 })
      await withGroans(page)
      await page.goto('/groans')
      await expect(page.getByRole('heading', { level: 2 })).toHaveText('2 groaned jokes')
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        320,
      )
      for (const target of await page.getByRole('button', { name: 'Remove from groans' }).all()) {
        expect((await target.boundingBox())!.height).toBeGreaterThanOrEqual(44)
      }
    },
  )
})
