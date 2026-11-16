import type { Page } from '@playwright/test'

/**
 * Goes to a section from the main navigation, opening the Sections drawer first on a phone, where the header's row
 * of sections is hidden.
 */
export async function goToSection(page: Page, name: string) {
  await page.getByRole('heading', { level: 1 }).first().waitFor()
  const menu = page.getByRole('button', { name: 'Sections' })
  if (await menu.isVisible()) await menu.click()
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name }).click()
}
