import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { settled } from './settled'
import { goToSection } from './sections'

const cheetah = 'Why was the big cat disqualified from the race? Because it was a cheetah.'

test('/ goes to Search, ready to type', async ({ page }) => {
  await page.goto('/random')
  await expect(page.getByRole('blockquote')).toHaveText(cheetah)
  await page.keyboard.press('/')
  await expect(page).toHaveURL('/search')
  await expect(page.getByRole('searchbox')).toBeFocused()
  await page.keyboard.type('dog')
  await expect(page).toHaveURL('/search?q=dog')
})

test('r shows another Joke, and is a letter while typing', async ({ page }) => {
  await page.goto('/random')
  await expect(page.getByRole('blockquote')).toHaveText(cheetah)
  await page.keyboard.press('r')
  await expect(page.getByRole('blockquote')).not.toHaveText(cheetah)
  await expect(page).toHaveURL('/random')

  await page.goto('/search')
  await page.getByRole('searchbox').fill('')
  await page.getByRole('searchbox').press('r')
  await expect(page).toHaveURL('/search?q=r')
})

test('? lists the shortcuts; Escape closes the list and focus goes back', async ({ page }) => {
  await page.goto('/random')
  await expect(page.getByRole('blockquote')).toHaveText(cheetah)
  const another = page.getByRole('button', { name: 'Another' })
  await another.focus()
  await page.keyboard.press('?')
  const list = page.getByRole('dialog', { name: 'Keyboard shortcuts' })
  await expect(list).toBeVisible()
  await page.keyboard.press('r')
  await expect(page.getByRole('blockquote')).toHaveText(cheetah)

  await page.keyboard.press('Escape')
  await expect(list).toBeHidden()
  await expect(another).toBeFocused()
})

test('turned off, they stay off after a reload', async ({ page }) => {
  await page.goto('/random')
  await page.getByRole('button', { name: 'Keyboard shortcuts' }).click()
  await page.getByRole('checkbox', { name: 'Use these shortcuts' }).uncheck()
  await page.getByRole('button', { name: 'Close' }).click()
  await page.reload()
  await expect(page.getByRole('blockquote')).toHaveText(cheetah)
  await page.keyboard.press('/')
  await expect(page).toHaveURL('/random')
  await expect(page.getByRole('dialog')).toBeHidden()
})

test('a new page fades up as it arrives, except with reduced motion', async ({ page }) => {
  await page.goto('/random')
  await expect(page.getByRole('blockquote')).toHaveText(cheetah)
  const arrivals = () =>
    page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((a) => a instanceof CSSAnimation && a.animationName.startsWith('arrive')).length,
    )
  await goToSection(page, 'Search')
  await expect(page).toHaveURL('/search')
  expect(await arrivals()).toBeGreaterThan(0)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await goToSection(page, 'Random')
  await expect(page.getByRole('heading', { level: 1, name: 'A random joke' })).toBeVisible()
  expect(await arrivals()).toBe(0)
})

for (const colorScheme of ['light', 'dark'] as const) {
  test(`the shortcuts list has no axe violations, ${colorScheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme })
    await page.goto('/random')
    await expect(page.getByRole('blockquote')).toHaveText(cheetah)
    await page.keyboard.press('?')
    await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeVisible()
    await settled(page)
    const { violations } = await new AxeBuilder({ page }).analyze()
    expect(violations).toEqual([])
  })
}
