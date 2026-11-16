import { expect, test } from '@playwright/test'

const title = 'How the Dad-a-base was built'

test('About in the main navigation opens the Case Study, with a slim header', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'About' }).click()
  await expect(page).toHaveURL('/case-study')
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeFocused()
  await expect(page).toHaveTitle(`${title} · Dad-a-base`)
  await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(0)

  await page.getByRole('link', { name: 'Back to the Dad-a-base' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()
})

test('the footer links to the Case Study', async ({ page }) => {
  await page.goto('/random')
  await page
    .getByRole('navigation', { name: 'Colophon' })
    .getByRole('link', { name: 'Case study' })
    .click()
  await expect(page).toHaveURL('/case-study')
})

test('a chapter link scrolls there and moves focus there, and Back to top returns', async ({
  page,
}) => {
  await page.goto('/case-study')
  const chapters = page.getByRole('navigation', { name: 'Chapters' })
  await chapters.getByRole('link', { name: 'Product and UX' }).click()
  await expect(page).toHaveURL('/case-study#product-and-ux')
  const heading = page.getByRole('heading', { level: 2, name: 'Product and UX' })
  await expect(heading).toBeFocused()
  await expect(heading).toBeInViewport()
  await expect(chapters.getByRole('link', { name: 'Product and UX' })).toHaveAttribute(
    'aria-current',
    'location',
  )

  await page.getByRole('link', { name: 'Back to top' }).last().click()
  await expect(page.locator('#top')).toBeFocused()
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0)
})

test('a link to a chapter opens the page there, focused', async ({ page }) => {
  await page.goto('/case-study#what-i-rejected')
  const heading = page.getByRole('heading', { level: 2, name: 'What I rejected' })
  // Where it sits on screen, measured directly: toBeInViewport's IntersectionObserver misreports this on mobile
  // WebKit, though the heading is at the top of the screen.
  await expect
    .poll(() => heading.evaluate((el) => el.getBoundingClientRect().top))
    .toBeLessThan(100)
  await expect
    .poll(() => heading.evaluate((el) => el.getBoundingClientRect().top))
    .toBeGreaterThanOrEqual(0)
  await expect(heading).toBeFocused()
})

test('the chapter being read is marked as the page scrolls', async ({ page, isMobile }) => {
  test.skip(isMobile, 'On a phone the chapters sit above the text instead')
  await page.goto('/case-study')
  const current = page.getByRole('navigation', { name: 'Chapters' }).locator('[aria-current]')
  await expect(current).toHaveText(/In 60 seconds/)
  await page
    .getByRole('heading', { level: 2, name: 'Engineering' })
    .evaluate((el) => el.scrollIntoView({ behavior: 'instant' }))
  await expect(current).toHaveText(/Engineering/)
  await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
  await expect(current).toHaveText(/What I rejected/)
})

test('the live Error states and Pagination window change by keyboard', async ({ page }) => {
  await page.goto('/case-study')
  const codes = page.getByRole('group', { name: 'Show the Error state for' })
  await codes.getByRole('radio', { name: '429' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(codes.getByRole('radio', { name: '500' })).toBeChecked()
  await expect(
    page.getByRole('heading', { level: 3, name: 'The printing press has jammed.' }),
  ).toBeVisible()

  await page.getByRole('radio', { name: 'Page 38' }).check()
  await expect(
    page.getByRole('navigation', { name: 'Pages' }).getByRole('link', { name: 'Page 38' }),
  ).toHaveAttribute('aria-current', 'page')
})

test('the build serves the Case Study with Open Graph tags, and their image', async ({
  request,
}) => {
  const image = await request.get('/og/case-study.png')
  expect(image.status()).toBe(200)
  expect(image.headers()['content-type']).toBe('image/png')

  const page = await request.get('/case-study.html')
  expect(await page.text()).toContain(
    '<meta property="og:image" content="https://the-dad-a-base.vercel.app/og/case-study.png" />',
  )
})
